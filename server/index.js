const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

// Simple in-memory store for demo purposes
const checkins = [];

// Health
app.get('/api/health', (req, res) => res.json({ ok: true, ts: new Date().toISOString() }));

// POST /api/checkin
app.post('/api/checkin', (req, res) => {
  const { appointmentId, name } = req.body || {};
  if (!appointmentId) return res.status(400).json({ ok: false, error: 'appointmentId required' });
  const now = new Date().toISOString();
  const record = { appointmentId, name: name || null, checkedInAt: now };
  checkins.push(record);
  return res.json({ ok: true, ...record });
});

// Simple list endpoint for inspection
app.get('/api/checkins', (req, res) => res.json({ ok: true, count: checkins.length, checkins }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Medifi API listening on http://localhost:${PORT}`));
