import express from "express";
import path from "path";
import crypto from "crypto";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { synthesizeEdge, synthesizeOpenAI, pipeEdgeToResponse, ttsProviderLabel } from "./tts.js";
import {
  hasLlmKey,
  activeModel,
  getProvider,
  chat,
  extractJson,
  parseTextLetter,
  parseImageLetter,
} from "./letterParse.js";
import {
  syncNhsEmails,
  getEmailStatus,
  testEmailConnection,
} from "./emailInbox.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");

dotenv.config({ path: path.join(root, ".env") });

const app = express();
const PORT = Number(process.env.PORT) || 3001;

const PROVIDER = getProvider();
const OPENAI_KEY = process.env.OPENAI_API_KEY || "";
const TTS_PROVIDER = (process.env.TTS_PROVIDER || "edge").toLowerCase();
const OPENAI_TTS_VOICE = process.env.OPENAI_TTS_VOICE || "nova";

app.use(express.json({ limit: "12mb" }));
app.use((_req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (_req.method === "OPTIONS") return res.sendStatus(204);
  next();
});
app.use(express.static(root));

const SYSTEM_ASK = `You are Medifi, an NHS letter helper. Answer the patient's question using ONLY the letter text provided. Plain English, calm, no medical diagnosis. If unsure, say so and suggest calling the number on the letter or their GP. Always remind them to check the original letter.`;

const SYSTEM_CHAT_LETTERS = `You are Medifi, a friendly NHS letter assistant for UK patients. The user can ask about their scanned NHS letters stored in Medifi.

Rules:
- Answer using ONLY the letter summaries and details provided below. If the answer is not in their letters, say so clearly.
- Plain English, calm, Year 6 reading level. Short paragraphs; use bullet points when helpful.
- You do NOT diagnose, prescribe, or replace a doctor. For urgent symptoms say NHS 111 or 999 as appropriate.
- When referring to a letter, name the sender or headline so the user knows which one you mean.
- If they have no letters yet, encourage them to scan a letter first.`;

const SYSTEM_CHAT_HEALTH = `You are Medifi Health Guide — a supportive NHS-aware wellbeing assistant for UK patients.

Rules:
- Give general health information in plain English (Year 6 reading level). Be warm and practical.
- You are NOT a doctor. Do NOT diagnose conditions or prescribe treatment. Say "speak to your GP" or "call NHS 111" when appropriate.
- For emergencies, always say call 999.
- You may discuss lifestyle, NHS services, how to prepare for appointments, and what questions to ask a clinician.
- If patient profile context is provided, tailor tips gently — never claim certainty about their health.`;

const SYSTEM_TRANSLATE = `You translate Medifi NHS letter summaries for UK patients. Tone: calm, supportive, simple words (Year 6 reading level). Never add medical advice.

Return ONLY valid JSON (no markdown):
{
  "headline": "string",
  "when": "string",
  "summary": "string",
  "risks": [{"level":"safe|caution|risk","title":"string","text":"string"}],
  "checklist": [{"id":"string","label":"string","meta":"string or omit"}],
  "fields": [{"label":"string","value":"string","missing":false}]
}

Keep phone numbers, dates, NHS numbers, addresses, and medicine names as in the source when possible. Translate labels and explanatory text into the target language.`;

app.get("/api/health", (_req, res) => {
  res.json({
    ok: true,
    llm: hasLlmKey(),
    provider: PROVIDER,
    model: activeModel(),
  });
});

app.post("/api/parse-letter-image", async (req, res) => {
  try {
    const { imageBase64, mediaType } = req.body || {};
    const raw = (imageBase64 || "").replace(/^data:[^;]+;base64,/, "").trim();
    if (!raw) return res.status(400).json({ error: "Missing image data" });
    res.json({ plan: await parseImageLetter(raw, mediaType || "image/jpeg") });
  } catch (err) {
    console.error("parse-letter-image:", err.message);
    res.status(err.status || 500).json({ error: err.message });
  }
});

app.post("/api/parse-letter", async (req, res) => {
  try {
    const text = (req.body?.text || "").trim();
    if (!text) return res.status(400).json({ error: "Missing letter text" });
    res.json({ plan: await parseTextLetter(text) });
  } catch (err) {
    console.error("parse-letter:", err.message);
    res.status(err.status || 500).json({ error: err.message });
  }
});

app.post("/api/email/status", async (req, res) => {
  try {
    res.json(await getEmailStatus({
      userId: req.body?.userId,
      credentials: req.body?.credentials,
    }));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/email/connect", async (req, res) => {
  try {
    const result = await testEmailConnection(req.body?.credentials);
    res.json(result);
  } catch (err) {
    console.error("email/connect:", err.message);
    res.status(err.status || 500).json({ ok: false, error: err.message });
  }
});

app.post("/api/email/sync", async (req, res) => {
  try {
    const knownIds = new Set((req.body?.knownIds || []).map(String));
    const result = await syncNhsEmails({
      userId: req.body?.userId,
      credentials: req.body?.credentials,
    });
    if (!result.ok) {
      return res.status(result.error?.includes("Connect") ? 400 : 500).json(result);
    }
    const fresh = (result.letters || []).filter((l) => !knownIds.has(l.id));
    res.json({ ...result, letters: fresh });
  } catch (err) {
    console.error("email/sync:", err.message);
    res.status(err.status || 500).json({ ok: false, error: err.message, letters: [] });
  }
});

app.post("/api/translate", async (req, res) => {
  try {
    const { language, content } = req.body || {};
    const lang = (language || "").trim();
    if (!lang || lang.toLowerCase() === "english") {
      return res.status(400).json({ error: "Choose a language other than English." });
    }
    if (!content || !content.summary) {
      return res.status(400).json({ error: "Missing content to translate." });
    }

    const payload = JSON.stringify({
      headline: content.headline || "",
      when: content.when || "",
      summary: content.summary || "",
      risks: content.risks || [],
      checklist: (content.checklist || []).map((c) => ({
        id: c.id,
        label: c.label,
        meta: c.meta,
      })),
      fields: content.fields || [],
    });

    const raw = await chat(
      [
        { role: "system", content: SYSTEM_TRANSLATE },
        {
          role: "user",
          content: `Target language: ${lang}\n\nTranslate this Medifi letter summary:\n${payload}`,
        },
      ],
      true
    );

    const parsed = extractJson(raw);
    res.json({
      translation: {
        headline: parsed.headline || content.headline,
        when: parsed.when || content.when,
        summary: parsed.summary || content.summary,
        risks: Array.isArray(parsed.risks) ? parsed.risks : content.risks,
        checklist: Array.isArray(parsed.checklist)
          ? parsed.checklist.map((c, i) => ({
              id: c.id || (content.checklist[i] && content.checklist[i].id) || "c" + i,
              label: c.label || "",
              meta: c.meta,
              icon: (content.checklist[i] && content.checklist[i].icon) || "check",
            }))
          : content.checklist,
        fields: Array.isArray(parsed.fields) ? parsed.fields : content.fields,
      },
    });
  } catch (err) {
    console.error("translate:", err.message);
    res.status(err.status || 500).json({ error: err.message });
  }
});

const checkins = [];

app.post("/api/checkin", (req, res) => {
  const { appointmentId, name } = req.body || {};
  if (!appointmentId) return res.status(400).json({ ok: false, error: "appointmentId required" });
  const now = new Date().toISOString();
  const record = { appointmentId, name: name || null, checkedInAt: now };
  checkins.push(record);
  return res.json({ ok: true, ...record });
});

app.get("/api/checkins", (_req, res) => {
  res.json({ ok: true, count: checkins.length, checkins });
});

function formatLetterContext(letters, currentLetterId) {
  if (!Array.isArray(letters) || !letters.length) {
    return "The user has no saved letters yet.";
  }
  return letters.map((l, i) => {
    const active = l.id === currentLetterId ? " [CURRENTLY VIEWING]" : "";
    const risks = Array.isArray(l.risks)
      ? l.risks.map((r) => `- ${r.title}: ${r.text}`).join("\n")
      : "";
    const checklist = Array.isArray(l.checklist)
      ? l.checklist.map((c) => `- ${c.label}${c.meta ? " (" + c.meta + ")" : ""}`).join("\n")
      : "";
    return [
      `--- Letter ${i + 1}${active} ---`,
      `Headline: ${l.headline || "Untitled"}`,
      `From: ${l.sender || "Unknown"}`,
      `When: ${l.when || "Not stated"}`,
      `Summary: ${l.summary || ""}`,
      risks ? `Risks:\n${risks}` : "",
      checklist ? `Actions:\n${checklist}` : "",
      l.original ? `Original excerpt: ${String(l.original).slice(0, 1200)}` : "",
    ].filter(Boolean).join("\n");
  }).join("\n\n");
}

function formatPatientContext(patient, health) {
  const parts = [];
  if (patient && patient.name) {
    parts.push(`Name: ${patient.name}`);
    if (patient.age) parts.push(`Age: ${patient.age}`);
    if (patient.activity) parts.push(`Activity: ${patient.activity}`);
    if (patient.diet) parts.push(`Diet: ${patient.diet}`);
  }
  if (health) {
    if (health.weightKg) parts.push(`Weight: ${health.weightKg} kg`);
    if (health.heightCm) parts.push(`Height: ${health.heightCm} cm`);
    if (health.activity) parts.push(`Health activity level: ${health.activity}`);
    if (health.diet) parts.push(`Health diet plan: ${health.diet}`);
    if (health.ethnicity) parts.push(`Ethnicity (self-reported): ${health.ethnicity}`);
  }
  return parts.length ? parts.join("\n") : "No profile details provided.";
}

app.post("/api/chat", async (req, res) => {
  try {
    const { mode, question, letters, currentLetterId, patient, health, history } = req.body || {};
    const q = (question || "").trim();
    if (!q) return res.status(400).json({ error: "Please type a question." });

    const isLetters = mode !== "health";
    const system = isLetters ? SYSTEM_CHAT_LETTERS : SYSTEM_CHAT_HEALTH;
    const contextBlock = isLetters
      ? `USER'S LETTERS:\n${formatLetterContext(letters, currentLetterId)}`
      : `PATIENT CONTEXT (self-reported, not verified):\n${formatPatientContext(patient, health)}`;

    const prior = Array.isArray(history)
      ? history.slice(-8).filter((m) => m && m.role && m.content)
      : [];

    const messages = [
      { role: "system", content: system },
      ...prior.map((m) => ({ role: m.role, content: String(m.content).slice(0, 2000) })),
      {
        role: "user",
        content: `${contextBlock}\n\nUser question: ${q}`,
      },
    ];

    const answer = await chat(messages, false, 1536);
    res.json({ answer: answer.trim() });
  } catch (err) {
    console.error("chat:", err.message);
    res.status(err.status || 500).json({ error: err.message });
  }
});

const speakSessions = new Map();
const SPEAK_TTL_MS = 5 * 60 * 1000;

function pruneSpeakSessions() {
  const now = Date.now();
  for (const [id, entry] of speakSessions) {
    if (now - entry.at > SPEAK_TTL_MS) speakSessions.delete(id);
  }
}

app.post("/api/speak/prepare", (req, res) => {
  try {
    const { text, language } = req.body || {};
    const input = (text || "").trim();
    if (!input) return res.status(400).json({ error: "Missing text to speak." });
    pruneSpeakSessions();
    const id = crypto.randomUUID();
    speakSessions.set(id, { text: input, language: language || "English", at: Date.now() });
    res.json({ id, url: `/api/speak/stream/${id}` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/speak/stream/:id", async (req, res) => {
  const entry = speakSessions.get(req.params.id);
  if (!entry || Date.now() - entry.at > SPEAK_TTL_MS) {
    speakSessions.delete(req.params.id);
    return res.status(404).json({ error: "Speech session expired. Tap Listen again." });
  }
  res.setHeader("Content-Type", "audio/mpeg");
  res.setHeader("Cache-Control", "private, max-age=300");
  res.setHeader("Accept-Ranges", "bytes");
  try {
    if (TTS_PROVIDER === "openai" && OPENAI_KEY) {
      const audio = await synthesizeOpenAI(entry.text, OPENAI_KEY, OPENAI_TTS_VOICE);
      res.send(audio);
    } else {
      await pipeEdgeToResponse(entry.text, entry.language, res);
    }
  } catch (err) {
    console.error("speak stream:", err.message);
    if (!res.headersSent) res.status(500).json({ error: err.message });
  }
});

app.post("/api/speak", async (req, res) => {
  try {
    const { text, language } = req.body || {};
    const input = (text || "").trim();
    if (!input) return res.status(400).json({ error: "Missing text to speak." });

    res.setHeader("Content-Type", "audio/mpeg");
    res.setHeader("Cache-Control", "no-store");
    if (TTS_PROVIDER === "openai" && OPENAI_KEY) {
      res.send(await synthesizeOpenAI(input, OPENAI_KEY, OPENAI_TTS_VOICE));
    } else {
      await pipeEdgeToResponse(input, language || "English", res);
    }
  } catch (err) {
    console.error("speak:", err.message);
    if (!res.headersSent) res.status(err.status || 500).json({ error: err.message || "Could not generate speech." });
  }
});

app.get("/api/speak/status", (_req, res) => {
  res.json({
    provider: TTS_PROVIDER === "openai" && OPENAI_KEY ? "openai" : "edge",
    label: ttsProviderLabel(TTS_PROVIDER, OPENAI_KEY),
  });
});

app.post("/api/ask", async (req, res) => {
  try {
    const { question, letterText, summary } = req.body || {};
    const q = (question || "").trim();
    const letter = (letterText || "").trim();
    if (!q || !letter) return res.status(400).json({ error: "Missing question or letter text" });

    const content = await chat(
      [
        { role: "system", content: SYSTEM_ASK },
        {
          role: "user",
          content: `Letter:\n${letter}\n\nSummary:\n${summary || ""}\n\nQuestion: ${q}`,
        },
      ],
      false
    );

    res.json({ answer: content.trim() });
  } catch (err) {
    console.error("ask:", err.message);
    res.status(err.status || 500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Medifi server  http://localhost:${PORT}`);
  console.log(`App            http://localhost:${PORT}/ui_kits/app/index.html`);
  console.log(`LLM            ${hasLlmKey() ? PROVIDER + " ready" : "NO KEY — copy .env.example to .env"}`);
  console.log(`Auth & data    Firebase (client-side — see firebase-config.example.js)`);
  console.log(`Read-aloud     ${ttsProviderLabel(TTS_PROVIDER, OPENAI_KEY)} (not Chrome TTS)`);
  console.log(`NHS email      users connect inbox in Account (subject ${process.env.EMAIL_SUBJECT_FILTER || "NHSINFORMATION"})`);
});
