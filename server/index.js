import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");

dotenv.config({ path: path.join(root, ".env") });

const app = express();
const PORT = Number(process.env.PORT) || 3001;

const PROVIDER = (process.env.LLM_PROVIDER || "openai").toLowerCase();
const OPENAI_KEY = process.env.OPENAI_API_KEY || "";
const OPENAI_MODEL = process.env.OPENAI_MODEL || "gpt-4o-mini";
const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY || "";
const ANTHROPIC_MODEL = process.env.ANTHROPIC_MODEL || "claude-sonnet-4-5-20250929";
const ZAI_KEY = process.env.ZAI_API_KEY || "";
const ZAI_MODEL = process.env.ZAI_MODEL || "glm-4.7";
const ZAI_BASE_URL = (process.env.ZAI_BASE_URL || "https://api.z.ai/api/paas/v4").replace(/\/$/, "");

app.use(express.json({ limit: "12mb" }));
app.use((_req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (_req.method === "OPTIONS") return res.sendStatus(204);
  next();
});
app.use(express.static(root));

const SYSTEM_PARSE = `You are Medifi, an NHS letter helper for UK patients. You do NOT diagnose or give medical advice. You turn confusing NHS letters into a clear plain-English action plan.

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

const SYSTEM_PARSE_IMAGE = `${SYSTEM_PARSE}

You are reading an NHS letter from a photo. Transcribe ALL visible text carefully into "extractedText" (keep line breaks). Then build the action plan from what you read. Include "extractedText" in your JSON.`;

const SYSTEM_ASK = `You are Medifi, an NHS letter helper. Answer the patient's question using ONLY the letter text provided. Plain English, calm, no medical diagnosis. If unsure, say so and suggest calling the number on the letter or their GP. Always remind them to check the original letter.`;

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

function isZai() {
  return PROVIDER === "zai" || PROVIDER === "z.ai";
}

function hasLlmKey() {
  if (PROVIDER === "anthropic") return Boolean(ANTHROPIC_KEY);
  if (isZai()) return Boolean(ZAI_KEY);
  return Boolean(OPENAI_KEY);
}

function activeModel() {
  if (PROVIDER === "anthropic") return ANTHROPIC_MODEL;
  if (isZai()) return ZAI_MODEL;
  return OPENAI_MODEL;
}

function extractJson(text) {
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

const LLM_TIMEOUT_MS = 60000;
const VISION_TIMEOUT_MS = 90000;

function providerLabel() {
  if (PROVIDER === "anthropic") return "Claude";
  if (isZai()) return "Z.AI";
  return "OpenAI";
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

async function chat(messages, jsonMode) {
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
        max_tokens: jsonMode ? 4096 : 1024,
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

async function chatWithImage(base64Data, mediaType, prompt) {
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

function normalizePlan(parsed, originalText) {
  const risks = Array.isArray(parsed.risks) ? parsed.risks : [];
  const worstLevel = normalizeWorstLevel(parsed.worstLevel);
  const validLevels = ["safe", "caution", "risk"];

  return {
    id: "llm-" + Date.now(),
    chip: parsed.chip || "Your letter",
    sender: parsed.sender || "From your letter",
    received: "Processed just now",
    worstLevel,
    original: originalText,
    fromLLM: true,
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

    const content = await chatWithImage(
      raw,
      mediaType || "image/jpeg",
      "Read this NHS letter photo. Transcribe every word you can see into extractedText, then return the full JSON action plan."
    );

    const parsed = extractJson(content);
    const extracted = (parsed.extractedText || parsed.original || "").trim()
      || "Text read from your letter photo.";
    delete parsed.extractedText;
    res.json({ plan: normalizePlan(parsed, extracted) });
  } catch (err) {
    console.error("parse-letter-image:", err.message);
    res.status(err.status || 500).json({ error: err.message });
  }
});

app.post("/api/parse-letter", async (req, res) => {
  try {
    const text = (req.body?.text || "").trim();
    if (!text) return res.status(400).json({ error: "Missing letter text" });

    const content = await chat(
      [
        { role: "system", content: SYSTEM_PARSE },
        { role: "user", content: `NHS letter text:\n\n${text}` },
      ],
      true
    );

    const parsed = extractJson(content);
    res.json({ plan: normalizePlan(parsed, text) });
  } catch (err) {
    console.error("parse-letter:", err.message);
    res.status(err.status || 500).json({ error: err.message });
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
});
