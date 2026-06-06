# Medifi server

Express API + static app host for local development.

```bash
cd server
npm install
npm start
```

Open **http://localhost:3001/ui_kits/app/index.html**

Copy `.env.example` to the repo root as `.env` and add your Anthropic API key for letter reading.

## Endpoints

- `GET /api/health` — LLM status
- `POST /api/parse-letter` — text → action plan
- `POST /api/parse-letter-image` — photo → action plan
- `POST /api/translate` — multilingual summary
- `POST /api/ask` — Q&A about a letter
- `POST /api/checkin` — `{ appointmentId, name? }`
- `GET /api/checkins` — demo check-in list (in-memory)
