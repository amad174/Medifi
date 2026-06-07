import { MsEdgeTTS, OUTPUT_FORMAT } from "msedge-tts";

const EDGE_VOICES = {
  English: "en-GB-SoniaNeural",
  Urdu: "ur-PK-UzmaNeural",
  Bengali: "bn-BD-NabanitaNeural",
  Polish: "pl-PL-AgnieszkaNeural",
  Arabic: "ar-SA-ZariyahNeural",
  Somali: "so-SO-UbaxNeural",
};

function escapeXml(text) {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function streamToBuffer(stream) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    stream.on("data", (chunk) => chunks.push(chunk));
    stream.on("close", () => resolve(Buffer.concat(chunks)));
    stream.on("error", reject);
  });
}

const MAX_SPEAK_CHARS = 900;

function trimSpeakText(text) {
  return String(text || "").trim().slice(0, MAX_SPEAK_CHARS);
}

export async function synthesizeEdge(text, language) {
  const voice = EDGE_VOICES[language] || EDGE_VOICES.English;
  const tts = new MsEdgeTTS();
  await tts.setMetadata(voice, OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3);
  const { audioStream } = tts.toStream(escapeXml(trimSpeakText(text)));
  try {
    return await streamToBuffer(audioStream);
  } finally {
    tts.close();
  }
}

/** Stream MP3 to an HTTP response — playback can start before synthesis finishes. */
export async function pipeEdgeToResponse(text, language, res) {
  const voice = EDGE_VOICES[language] || EDGE_VOICES.English;
  const tts = new MsEdgeTTS();
  try {
    await tts.setMetadata(voice, OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3);
    const { audioStream } = tts.toStream(escapeXml(trimSpeakText(text)));
    await new Promise((resolve, reject) => {
      audioStream.on("error", reject);
      audioStream.on("close", resolve);
      audioStream.pipe(res);
    });
  } finally {
    tts.close();
  }
}

export async function synthesizeOpenAI(text, apiKey, voice) {
  const res = await fetch("https://api.openai.com/v1/audio/speech", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "tts-1",
      input: text.slice(0, 4096),
      voice: voice || "nova",
    }),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`OpenAI TTS error (${res.status}): ${body.slice(0, 200)}`);
  }
  return Buffer.from(await res.arrayBuffer());
}

export function ttsProviderLabel(provider, openaiKey) {
  if (provider === "openai" && openaiKey) return "OpenAI neural voice";
  return "Medifi neural voice";
}
