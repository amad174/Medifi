/* Medifi LLM client — calls the local API proxy (server/index.js). */

(function () {
  const STORAGE_KEY = "medifi_api_base";

  function apiBase() {
    if (window.MEDIFI_CONFIG && window.MEDIFI_CONFIG.apiBase) {
      return window.MEDIFI_CONFIG.apiBase.replace(/\/$/, "");
    }
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) return stored.replace(/\/$/, "");
    } catch (_) { /* ignore */ }
    if (window.location.port === "3001" || window.location.hostname === "localhost") {
      return window.location.origin;
    }
    return "http://localhost:3001";
  }

  function setApiBase(url) {
    try {
      localStorage.setItem(STORAGE_KEY, url.replace(/\/$/, ""));
    } catch (_) { /* ignore */ }
  }

  async function health() {
    const res = await fetch(apiBase() + "/api/health");
    if (!res.ok) throw new Error("API server not reachable. Run: cd server && npm install && npm start");
    return res.json();
  }

  async function isAvailable() {
    try {
      const h = await health();
      return Boolean(h.llm);
    } catch {
      return false;
    }
  }

  async function parseLetter(text) {
    const res = await fetch(apiBase() + "/api/parse-letter", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || "Could not parse letter with AI");
    return data.plan;
  }

  async function askQuestion(letterText, summary, question) {
    const res = await fetch(apiBase() + "/api/ask", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ letterText, summary, question }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || "Could not get an answer");
    return data.answer;
  }

  window.MedifiLLM = {
    apiBase,
    setApiBase,
    health,
    isAvailable,
    parseLetter,
    askQuestion,
  };
})();
