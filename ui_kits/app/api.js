// Frontend API wrapper for Medifi check-in and health
(function () {
  function apiBase() {
    if (window.MEDIFI_CONFIG && window.MEDIFI_CONFIG.apiBase) {
      return window.MEDIFI_CONFIG.apiBase.replace(/\/$/, "");
    }
    if (window.MedifiLLM) return window.MedifiLLM.apiBase();
    if (window.location.protocol === "file:") return "http://localhost:3001";
    if (window.location.protocol === "http:" || window.location.protocol === "https:") {
      return window.location.origin;
    }
    return "http://localhost:3001";
  }

  async function checkIn(payload) {
    const res = await fetch(apiBase() + "/api/checkin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json().catch(function () { return {}; });
    if (!res.ok) throw new Error(data.error || "Check-in failed");
    return data;
  }

  async function health() {
    const res = await fetch(apiBase() + "/api/health");
    if (!res.ok) throw new Error("Health check failed");
    return res.json();
  }

  window.MedifiApi = { checkIn, health, apiBase };
})();
