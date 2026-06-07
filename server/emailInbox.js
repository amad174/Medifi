import fs from "fs/promises";
import path from "path";
import crypto from "crypto";
import { fileURLToPath } from "url";
import { ImapFlow } from "imapflow";
import { simpleParser } from "mailparser";
import pdfParse from "pdf-parse";
import dotenv from "dotenv";
import { parseTextLetter, parseImageLetter } from "./letterParse.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, "data", "users");

dotenv.config({ path: path.join(__dirname, "..", ".env") });

const DEFAULT_SUBJECT = (process.env.EMAIL_SUBJECT_FILTER || "NHSINFORMATION").trim();
const syncLocks = new Map();

export function guessImapHost(email) {
  const domain = (String(email || "").split("@")[1] || "").toLowerCase();
  if (domain === "gmail.com" || domain === "googlemail.com") {
    return { host: "imap.gmail.com", port: 993 };
  }
  if (["outlook.com", "hotmail.com", "live.com", "msn.com"].includes(domain)) {
    return { host: "outlook.office365.com", port: 993 };
  }
  if (domain === "yahoo.com" || domain.endsWith(".yahoo.com")) {
    return { host: "imap.mail.yahoo.com", port: 993 };
  }
  if (domain === "icloud.com" || domain === "me.com" || domain === "mac.com") {
    return { host: "imap.mail.me.com", port: 993 };
  }
  return { host: domain ? `imap.${domain}` : "imap.gmail.com", port: 993 };
}

function envCredentials() {
  if (!process.env.EMAIL_IMAP_HOST || !process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
    return null;
  }
  return normalizeCredentials({
    email: process.env.EMAIL_USER,
    password: process.env.EMAIL_PASSWORD,
    imapHost: process.env.EMAIL_IMAP_HOST,
    imapPort: process.env.EMAIL_IMAP_PORT,
    imapSecure: process.env.EMAIL_IMAP_SECURE !== "false",
    subjectFilter: DEFAULT_SUBJECT,
  });
}

export function normalizeCredentials(input) {
  if (!input) return null;
  const email = (input.email || input.user || "").trim();
  if (!email) return null;

  const accessToken = (input.accessToken || "").trim();
  const isOAuth = input.authType === "google_oauth" || Boolean(accessToken);
  if (isOAuth) {
    if (!accessToken) return null;
    return {
      email,
      authType: "google_oauth",
      accessToken,
      imapHost: (input.imapHost || "imap.gmail.com").trim(),
      imapPort: Number(input.imapPort || 993),
      imapSecure: input.imapSecure !== false,
      subjectFilter: (input.subjectFilter || DEFAULT_SUBJECT).trim(),
    };
  }

  const password = input.password || input.pass || "";
  if (!password) return null;
  const guessed = guessImapHost(email);
  return {
    email,
    password,
    imapHost: (input.imapHost || guessed.host).trim(),
    imapPort: Number(input.imapPort || guessed.port || 993),
    imapSecure: input.imapSecure !== false,
    subjectFilter: (input.subjectFilter || DEFAULT_SUBJECT).trim(),
  };
}

export function emailConfigured(credentials) {
  return Boolean(normalizeCredentials(credentials) || envCredentials());
}

function userKey(userId, email) {
  const seed = String(userId || email || "default");
  return crypto.createHash("sha256").update(seed).digest("hex").slice(0, 16);
}

function stateFileFor(key) {
  return path.join(DATA_DIR, key, "state.json");
}

function subjectMatches(subject, filter) {
  if (!subject) return false;
  const s = subject.trim().toUpperCase();
  const f = (filter || DEFAULT_SUBJECT).toUpperCase();
  return s === f || s.includes(f);
}

function formatReceived(date) {
  if (!date) return "From your email";
  try {
    return new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeStyle: "short" }).format(new Date(date));
  } catch {
    return "From your email";
  }
}

function letterIdFor(userKeyPart, mailUid, messageId) {
  const seed = String(messageId || mailUid);
  const hash = crypto.createHash("sha256").update(seed).digest("hex").slice(0, 10);
  return `email-${userKeyPart}-${mailUid}-${hash}`;
}

async function readJson(file, fallback) {
  try {
    const raw = await fs.readFile(file, "utf8");
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

async function writeJson(file, data) {
  await fs.mkdir(path.dirname(file), { recursive: true });
  await fs.writeFile(file, JSON.stringify(data, null, 2));
}

async function loadUserState(key) {
  return readJson(stateFileFor(key), {
    processedUids: [],
    lastSync: null,
    accountEmail: "",
  });
}

async function saveUserState(key, state) {
  await writeJson(stateFileFor(key), state);
}

async function extractLetterContent(parsedMail) {
  const textParts = [];
  if (parsedMail.text) textParts.push(parsedMail.text.trim());

  for (const att of parsedMail.attachments || []) {
    const ct = (att.contentType || "").toLowerCase();
    if (ct === "application/pdf" || (att.filename || "").toLowerCase().endsWith(".pdf")) {
      try {
        const data = await pdfParse(att.content);
        if (data.text) textParts.push(data.text.trim());
      } catch (err) {
        console.warn("emailInbox: PDF parse failed:", err.message);
      }
      continue;
    }
    if (ct.startsWith("image/")) {
      return {
        type: "image",
        base64: att.content.toString("base64"),
        mediaType: ct,
        fallbackText: textParts.join("\n\n").trim(),
      };
    }
  }

  return { type: "text", text: textParts.filter(Boolean).join("\n\n").trim() };
}

function createImapClient(creds) {
  const auth = creds.authType === "google_oauth" || creds.accessToken
    ? { user: creds.email, accessToken: creds.accessToken }
    : { user: creds.email, pass: creds.password };
  return new ImapFlow({
    host: creds.imapHost,
    port: creds.imapPort,
    secure: creds.imapSecure,
    auth,
    logger: false,
  });
}

export async function testEmailConnection(credentials) {
  const creds = normalizeCredentials(credentials);
  if (!creds) {
    const err = new Error("Email credentials are required.");
    err.status = 400;
    throw err;
  }
  const client = createImapClient(creds);
  try {
    await client.connect();
    return {
      ok: true,
      email: creds.email,
      imapHost: creds.imapHost,
      imapPort: creds.imapPort,
      subjectFilter: creds.subjectFilter,
    };
  } catch (err) {
    const oauth = creds.authType === "google_oauth";
    const e = new Error(
      err.authenticationFailed
        ? (oauth
          ? "Could not access Gmail. Try Connect with Google again and allow email access."
          : "Could not sign in to your email. Check your address and app password.")
        : `Could not connect to ${creds.imapHost}. ${err.message}`
    );
    e.status = 401;
    throw e;
  } finally {
    try { await client.logout(); } catch { /* ignore */ }
  }
}

export async function getEmailStatus(opts = {}) {
  const creds = normalizeCredentials(opts.credentials) || envCredentials();
  const key = userKey(opts.userId, creds?.email);
  const state = creds ? await loadUserState(key) : { processedUids: [], lastSync: null };
  return {
    configured: Boolean(creds),
    subjectFilter: creds?.subjectFilter || DEFAULT_SUBJECT,
    accountEmail: creds?.email || "",
    imapHost: creds?.imapHost || "",
    lastSync: state.lastSync,
    processedCount: Array.isArray(state.processedUids) ? state.processedUids.length : 0,
  };
}

export async function syncNhsEmails(opts = {}) {
  const creds = normalizeCredentials(opts.credentials) || envCredentials();
  if (!creds) {
    return {
      ok: false,
      error: "Connect your email in Account settings first.",
      letters: [],
      newCount: 0,
    };
  }

  const key = userKey(opts.userId, creds.email);
  if (syncLocks.has(key)) return syncLocks.get(key);

  const job = (async () => {
    const state = await loadUserState(key);
    const processed = new Set((state.processedUids || []).map(String));
    const newLetters = [];
    const client = createImapClient(creds);

    await client.connect();
    const lock = await client.getMailboxLock("INBOX");
    try {
      const uids = await client.search({ seen: false, subject: creds.subjectFilter }, { uid: true });
      const uidList = Array.isArray(uids) ? uids : [];

      for (const uid of uidList) {
        const uidKey = String(uid);
        if (processed.has(uidKey)) continue;

        const messages = client.fetch(uidKey, { source: true, envelope: true, uid: true }, { uid: true });
        for await (const msg of messages) {
          if (!subjectMatches(msg.envelope?.subject, creds.subjectFilter)) continue;

          const parsed = await simpleParser(msg.source);
          const content = await extractLetterContent(parsed);
          const letterId = letterIdFor(key, uidKey, msg.envelope?.messageId);
          const meta = {
            id: letterId,
            fromEmail: true,
            fromLLM: true,
            received: formatReceived(parsed.date || msg.envelope?.date),
            emailUid: uidKey,
            emailSubject: parsed.subject || msg.envelope?.subject || creds.subjectFilter,
          };

          try {
            let plan;
            if (content.type === "image") {
              plan = await parseImageLetter(content.base64, content.mediaType, meta);
            } else {
              const text = content.text || content.fallbackText || "";
              if (text.length < 20) {
                console.warn(`emailInbox: uid ${uidKey} has no readable NHS letter text`);
                processed.add(uidKey);
                await client.messageFlagsAdd(uidKey, ["\\Seen"], { uid: true });
                continue;
              }
              plan = await parseTextLetter(text, meta);
            }

            newLetters.push(plan);
            processed.add(uidKey);
            await client.messageFlagsAdd(uidKey, ["\\Seen"], { uid: true });
            console.log(`emailInbox: ${creds.email} uid ${uidKey} → ${plan.headline}`);
          } catch (err) {
            console.error(`emailInbox: failed to parse uid ${uidKey}:`, err.message);
          }
        }
      }
    } finally {
      lock.release();
      await client.logout();
    }

    state.processedUids = [...processed].slice(-500);
    state.lastSync = new Date().toISOString();
    state.accountEmail = creds.email;
    await saveUserState(key, state);

    return {
      ok: true,
      newCount: newLetters.length,
      letters: newLetters,
      lastSync: state.lastSync,
      accountEmail: creds.email,
    };
  })();

  syncLocks.set(key, job);
  try {
    return await job;
  } finally {
    syncLocks.delete(key);
  }
}
