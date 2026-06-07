# Medifi server

Express API + static app host for local development.

```bash
cd server
npm install
npm start
```

Open **http://localhost:3001/ui_kits/app/index.html**

Copy `.env.example` to the repo root as `.env` and add your Anthropic API key for letter reading.

**Accounts & saved letters** use **Firebase** (client-side). Copy `ui_kits/app/firebase-config.example.js` to `firebase-config.js`, add your Firebase web app config, enable Email/Password auth, create Firestore, and deploy `firestore.rules` from the repo root.

## Endpoints

- `GET /api/health` — LLM status
- `POST /api/parse-letter` — text → action plan
- `POST /api/parse-letter-image` — photo → action plan
- `POST /api/translate` — multilingual summary
- `POST /api/ask` — Q&A about a letter
- `POST /api/chat` — AI assistant (query saved letters or general health guide)
- `POST /api/speak` — neural read-aloud audio (not browser Chrome TTS)
- `POST /api/checkin` — `{ appointmentId, name? }`
- `GET /api/checkins` — demo check-in list (in-memory)
