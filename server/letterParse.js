import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "..", ".env") });

const PROVIDER = (process.env.LLM_PROVIDER || "openai").toLowerCase();
const OPENAI_KEY = process.env.OPENAI_API_KEY || "";
const OPENAI_MODEL = process.env.OPENAI_MODEL || "gpt-4o-mini";
const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY || "";
const ANTHROPIC_MODEL = process.env.ANTHROPIC_MODEL || "claude-sonnet-4-5-20250929";
const ZAI_KEY = process.env.ZAI_API_KEY || "";
const ZAI_MODEL = process.env.ZAI_MODEL || "glm-4.7";
const ZAI_BASE_URL = (process.env.ZAI_BASE_URL || "https://api.z.ai/api/paas/v4").replace(/\/$/, "");

const LLM_TIMEOUT_MS = 60000;
const VISION_TIMEOUT_MS = 90000;

function systemParsePrompt() {
  return `You are Medifi, an NHS letter helper for UK patients. You do NOT diagnose or give medical advice. You turn confusing NHS letters into a clear plain-English action plan.

Voice: second person, active, Year 6 reading level, calm, sentence case. Never claim to be the NHS.

Return ONLY valid JSON (no markdown) with this shape:
{
  "headline": "short title",
  "when": "human-readable date/time or status",
  "summary": "2-4 plain English sentences",
  "sender": "who sent the letter",
  "chip": "short label e.g. Appointment letter",
  "worstLevel": "safe" | "caution" | "risk",
  "fields": [{"label":"string","value":"string"} | {"label":"string","missing":true}],
  "checklist": [{"id":"unique","label":"string","meta":"optional","icon":"calendar|phone|clock|file|list|id|info|alert|check|pin"}],
  "risks": [{"level":"safe|caution|risk","title":"string","text":"string"}],
  "event": null | {"title":"string","y":2026,"mo":6,"d":12,"h":10,"min":30,"durMins":30,"location":"string","chase":false}
}

Flag ADMIN risks: past appointment dates, missing phone numbers, vague fasting/prep, missing dates on referrals, conflicting times. Today's date: ${new Date().toDateString()}.`;
}

const SYSTEM_PARSE_IMAGE = `${systemParsePrompt()}

You are reading an NHS letter from a photo. Transcribe ALL visible text carefully into "extractedText" (keep line breaks). Then build the action plan from what you read. Include "extractedText" in your JSON.`;

function isZai() {
  return PROVIDER === "zai" || PROVIDER === "z.ai";
}

export function hasLlmKey() {
  if (PROVIDER === "anthropic") return Boolean(ANTHROPIC_KEY);
  if (isZai()) return Boolean(ZAI_KEY);
  return Boolean(OPENAI_KEY);
}

export function activeModel() {
  if (PROVIDER === "anthropic") return ANTHROPIC_MODEL;
  if (isZai()) return ZAI_MODEL;
  return OPENAI_MODEL;
}

export function getProvider() {
  return PROVIDER;
}

function providerLabel() {
  if (PROVIDER === "anthropic") return "Claude";
  if (isZai()) return "Z.AI";
  return "OpenAI";
}

export function extractJson(text) {
  const trimmed = (text || "").trim();
  if (!trimmed) throw new Error("AI returned an empty response. Try again.");
  const fence = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/);
  const raw = fence ? fence[1].trim() : trimmed;
  try {
    return JSON.parse(raw);
  } catch {
    const start = raw.indexOf("{");
    const end = raw.lastIndexOf("}");
    if (start >= 0 && end > start) return JSON.parse(raw.slice(start, end + 1));
    throw new Error("AI response was not valid JSON. Try again or paste the letter text.");
  }
}

async function fetchWithTimeout(url, options, ms) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), ms);
  try {
    return await fetch(url, { ...options, signal: ctrl.signal });
  } catch (err) {
    if (err.name === "AbortError") {
      const e = new Error(`${providerLabel()} took too long to respond. Try again with shorter text.`);
      e.status = 504;
      throw e;
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }
}

export async function chat(messages, jsonMode, maxTokens) {
  const replyTokens = maxTokens || (jsonMode ? 4096 : 1536);
  if (!hasLlmKey()) {
    const err = new Error("No API key configured. Copy .env.example to .env and add your key.");
    err.status = 503;
    throw err;
  }

  if (PROVIDER === "anthropic") {
    const system = messages.find((m) => m.role === "system")?.content || "";
    const userMessages = messages.filter((m) => m.role !== "system");
    const res = await fetchWithTimeout("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": ANTHROPIC_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: ANTHROPIC_MODEL,
        max_tokens: replyTokens,
        temperature: 0,
        system,
        messages: userMessages.map((m) => ({ role: m.role, content: m.content })),
      }),
    }, LLM_TIMEOUT_MS);
    if (!res.ok) {
      const body = await res.text();
      const err = new Error(`Anthropic API error (${res.status}): ${body.slice(0, 200)}`);
      err.status = res.status;
      throw err;
    }
    const data = await res.json();
    return data.content?.map((b) => b.text).join("") || "";
  }

  const apiKey = isZai() ? ZAI_KEY : OPENAI_KEY;
  const model = isZai() ? ZAI_MODEL : OPENAI_MODEL;
  const baseUrl = isZai() ? ZAI_BASE_URL : "https://api.openai.com/v1";
  const label = isZai() ? "Z.AI" : "OpenAI";

  const res = await fetchWithTimeout(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages,
      max_tokens: isZai() ? 4096 : 2048,
      temperature: isZai() ? 0.3 : undefined,
      ...(jsonMode && !isZai() ? { response_format: { type: "json_object" } } : {}),
    }),
  }, LLM_TIMEOUT_MS);
  if (!res.ok) {
    const body = await res.text();
    const err = new Error(`${label} API error (${res.status}): ${body.slice(0, 200)}`);
    err.status = res.status;
    throw err;
  }
  const data = await res.json();
  return data.choices?.[0]?.message?.content || "";
}

export async function chatWithImage(base64Data, mediaType, prompt) {
  if (PROVIDER !== "anthropic") {
    const err = new Error("Photo reading needs Claude (anthropic). Set LLM_PROVIDER=anthropic in .env.");
    err.status = 503;
    throw err;
  }
  if (!hasLlmKey()) {
    const err = new Error("No API key configured. Copy .env.example to .env and add your key.");
    err.status = 503;
    throw err;
  }

  const type = mediaType || "image/jpeg";
  const res = await fetchWithTimeout("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": ANTHROPIC_KEY,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: ANTHROPIC_MODEL,
      max_tokens: 4096,
      temperature: 0,
      system: SYSTEM_PARSE_IMAGE,
      messages: [{
        role: "user",
        content: [
          { type: "image", source: { type: "base64", media_type: type, data: base64Data } },
          { type: "text", text: prompt },
        ],
      }],
    }),
  }, VISION_TIMEOUT_MS);

  if (!res.ok) {
    const body = await res.text();
    const err = new Error(`Anthropic API error (${res.status}): ${body.slice(0, 200)}`);
    err.status = res.status;
    throw err;
  }
  const data = await res.json();
  return data.content?.map((b) => b.text).join("") || "";
}

function normalizeFields(fields) {
  if (Array.isArray(fields)) return fields;
  if (fields && typeof fields === "object") {
    return Object.entries(fields).map(([label, value]) => ({
      label,
      value: String(value),
      ...(value == null || value === "" ? { missing: true } : {}),
    }));
  }
  return [];
}

function normalizeWorstLevel(worst) {
  const validLevels = ["safe", "caution", "risk"];
  const w = String(worst || "").toLowerCase();
  if (validLevels.includes(w)) return w;
  if (w.includes("high") || w.includes("risk")) return "risk";
  if (w.includes("low") || w.includes("safe")) return "safe";
  return "caution";
}

export function normalizePlan(parsed, originalText, opts = {}) {
  const risks = Array.isArray(parsed.risks) ? parsed.risks : [];
  const worstLevel = normalizeWorstLevel(parsed.worstLevel);
  const validLevels = ["safe", "caution", "risk"];

  return {
    id: opts.id || "llm-" + Date.now(),
    chip: parsed.chip || "Your letter",
    sender: parsed.sender || "From your letter",
    received: opts.received || "Processed just now",
    worstLevel,
    original: originalText,
    fromLLM: opts.fromLLM !== undefined ? opts.fromLLM : true,
    fromEmail: Boolean(opts.fromEmail),
    fromUpload: Boolean(opts.fromUpload),
    emailUid: opts.emailUid,
    emailSubject: opts.emailSubject,
    headline: parsed.headline || "Your NHS letter",
    when: parsed.when || "See your letter",
    summary: parsed.summary || "Medifi could not summarise this letter.",
    fields: normalizeFields(parsed.fields),
    checklist: Array.isArray(parsed.checklist)
      ? parsed.checklist.map((c, i) => ({
          id: c.id || "c" + i,
          label: c.label || "Action",
          meta: c.meta,
          icon: c.icon || "check",
        }))
      : [],
    risks: risks.length
      ? risks.map((r) => ({
          level: validLevels.includes(r.level) ? r.level : "caution",
          title: r.title || "Check this",
          text: r.text || "",
        }))
      : [{ level: "safe", title: "Review your letter", text: "Always check against your original letter." }],
    event: parsed.event || undefined,
    medicines: parsed.medicines || undefined,
  };
}

export async function parseTextLetter(text, opts = {}) {
  const content = await chat(
    [
      { role: "system", content: systemParsePrompt() },
      { role: "user", content: `NHS letter text:\n\n${text}` },
    ],
    true
  );
  const parsed = extractJson(content);
  return normalizePlan(parsed, text, opts);
}

export async function parseImageLetter(base64Data, mediaType, opts = {}) {
  const raw = (base64Data || "").replace(/^data:[^;]+;base64,/, "").trim();
  const content = await chatWithImage(
    raw,
    mediaType || "image/jpeg",
    "Read this NHS letter photo. Transcribe every word you can see into extractedText, then return the full JSON action plan."
  );
  const parsed = extractJson(content);
  const extracted = (parsed.extractedText || parsed.original || "").trim()
    || "Text read from your letter photo.";
  delete parsed.extractedText;
  return normalizePlan(parsed, extracted, opts);
}
