/* Writes ui_kits/app/firebase-config.js from Vercel env vars at build time. */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const out = path.join(__dirname, "..", "ui_kits", "app", "firebase-config.js");

const cfg = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
};

const missing = Object.entries(cfg).filter(([, v]) => !v).map(([k]) => k);
if (missing.length) {
  console.log("write-firebase-config: skipped (missing env:", missing.join(", "), ")");
  process.exit(0);
}

const body =
  "/* Generated at build time from Vercel environment variables. */\n" +
  "window.MEDIFI_FIREBASE = " +
  JSON.stringify(cfg, null, 2) +
  ";\n";

fs.writeFileSync(out, body, "utf8");
console.log("write-firebase-config: wrote", out);
