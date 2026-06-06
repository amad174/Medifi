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
const ANTHROPIC_MODEL = process.env.ANTHROPIC_MODEL || "claude-sonnet-4-20250514";

app.use(express.json({ limit: "2mb" }));
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

const SYSTEM_ASK = `You are Medifi, an NHS letter helper. Answer the patient's question using ONLY the letter text provided. Plain English, calm, no medical diagnosis. If unsure, say so and suggest calling the number on the letter or their GP. Always remind them to check the original letter.`;

function hasLlmKey() {
  if (PROVIDER === "anthropic") return Boolean(ANTHROPIC_KEY);
  return Boolean(OPENAI_KEY);
}

function extractJson(text) {
  const trimmed = (text || "").trim();
  const fence = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/);
  const raw = fence ? fence[1].trim() : trimmed;
  return JSON.parse(raw);
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
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": ANTHROPIC_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: ANTHROPIC_MODEL,
        max_tokens: 2048,
        system,
        messages: userMessages.map((m) => ({ role: m.role, content: m.content })),
      }),
    });
    if (!res.ok) {
      const body = await res.text();
      const err = new Error(`Anthropic API error (${res.status}): ${body.slice(0, 200)}`);
      err.status = res.status;
      throw err;
    }
    const data = await res.json();
    return data.content?.map((b) => b.text).join("") || "";
  }

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${OPENAI_KEY}`,
    },
    body: JSON.stringify({
      model: OPENAI_MODEL,
      messages,
      ...(jsonMode ? { response_format: { type: "json_object" } } : {}),
    }),
  });
  if (!res.ok) {
    const body = await res.text();
    const err = new Error(`OpenAI API error (${res.status}): ${body.slice(0, 200)}`);
    err.status = res.status;
    throw err;
  }
  const data = await res.json();
  return data.choices?.[0]?.message?.content || "";
}

function normalizePlan(parsed, originalText) {
  const risks = Array.isArray(parsed.risks) ? parsed.risks : [];
  const worst = parsed.worstLevel || "safe";
  const validLevels = ["safe", "caution", "risk"];
  const worstLevel = validLevels.includes(worst) ? worst : "caution";

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
    fields: Array.isArray(parsed.fields) ? parsed.fields : [],
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
    model: PROVIDER === "anthropic" ? ANTHROPIC_MODEL : OPENAI_MODEL,
  });
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
      PROVIDER === "openai"
    );

    const parsed = extractJson(content);
    res.json({ plan: normalizePlan(parsed, text) });
  } catch (err) {
    console.error("parse-letter:", err.message);
    res.status(err.status || 500).json({ error: err.message });
  }
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
});
