# Medifi API (local dev)

Run a minimal Express API for the Check-in flow.

Install and run:

```bash
cd server
npm install
npm start
```

Defaults to `http://localhost:3000` and exposes:

- `GET /api/health` — simple health check
- `POST /api/checkin` — body: `{ appointmentId, name? }` → returns `{ ok, appointmentId, checkedInAt }`
- `GET /api/checkins` — list of recorded check-ins (in-memory; demo only)
