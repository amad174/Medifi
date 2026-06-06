// Frontend API wrapper for Medifi demo
(function () {
  const BASE = (window.MEDIFI_API_BASE || 'http://localhost:3000').replace(/\/$/, '');
  const KEY = window.MEDIFI_API_KEY || 'YOUR_ANTHROPIC_API_KEY_HERE';

  async function checkIn(payload) {
    const res = await fetch(BASE + '/api/checkin', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Network response was not ok');
    return res.json();
  }

  async function health() {
    const res = await fetch(BASE + '/api/health');
    if (!res.ok) throw new Error('Health check failed');
    return res.json();
  }

  window.MedifiApi = { checkIn, health, baseUrl: BASE };
})();
