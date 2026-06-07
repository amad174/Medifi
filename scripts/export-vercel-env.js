/* Merge .env + firebase-config.js → paste into Vercel "Import .env". */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const envPath = path.join(root, ".env");
const firebasePath = path.join(root, "ui_kits", "app", "firebase-config.js");

const SKIP = new Set(["PORT"]);

function parseEnv(text) {
  const out = [];
  for (const line of text.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim();
    if (SKIP.has(key) || !value) continue;
    out.push([key, value]);
  }
  return out;
}

function parseFirebase(text) {
  const match = text.match(/window\.MEDIFI_FIREBASE\s*=\s*(\{[\s\S]*?\});/);
  if (!match) return [];
  const cfg = Function("return " + match[1])();
  const map = {
    apiKey: "FIREBASE_API_KEY",
    authDomain: "FIREBASE_AUTH_DOMAIN",
    projectId: "FIREBASE_PROJECT_ID",
    storageBucket: "FIREBASE_STORAGE_BUCKET",
    messagingSenderId: "FIREBASE_MESSAGING_SENDER_ID",
    appId: "FIREBASE_APP_ID",
  };
  return Object.entries(map)
    .filter(([k]) => cfg[k])
    .map(([k, envKey]) => [envKey, String(cfg[k])]);
}

const lines = [];
if (fs.existsSync(envPath)) {
  lines.push(...parseEnv(fs.readFileSync(envPath, "utf8")));
} else {
  console.error("Missing .env — copy from .env.example first.");
  process.exit(1);
}
if (fs.existsSync(firebasePath)) {
  lines.push(...parseFirebase(fs.readFileSync(firebasePath, "utf8")));
} else {
  console.error("Missing firebase-config.js");
  process.exit(1);
}

const seen = new Set();
for (const [key, value] of lines) {
  if (seen.has(key)) continue;
  seen.add(key);
  console.log(key + "=" + value);
}
