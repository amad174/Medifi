/* NHS email inbox settings — IMAP host guessing and local fallback storage. */

(function () {
  const LEGACY_LOCAL_KEY = "medifi_email_inbox";

  function storageKey() {
    if (window.MedifiUserScope) {
      window.MedifiUserScope.migrateLegacy("emailInbox");
      return window.MedifiUserScope.key(window.MedifiUserScope.SUFFIXES.emailInbox);
    }
    return LEGACY_LOCAL_KEY;
  }

  function guessImapHost(email) {
    var domain = (String(email || "").split("@")[1] || "").toLowerCase();
    if (domain === "gmail.com" || domain === "googlemail.com") {
      return { host: "imap.gmail.com", port: 993 };
    }
    if (["outlook.com", "hotmail.com", "live.com", "msn.com"].indexOf(domain) >= 0) {
      return { host: "outlook.office365.com", port: 993 };
    }
    if (domain === "yahoo.com" || domain.indexOf(".yahoo.com") > 0) {
      return { host: "imap.mail.yahoo.com", port: 993 };
    }
    if (domain === "icloud.com" || domain === "me.com" || domain === "mac.com") {
      return { host: "imap.mail.me.com", port: 993 };
    }
    return { host: domain ? "imap." + domain : "imap.gmail.com", port: 993 };
  }

  function loadLocal() {
    try {
      var raw = localStorage.getItem(storageKey());
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  function saveLocal(config) {
    try {
      localStorage.setItem(storageKey(), JSON.stringify(config));
    } catch (_) { /* quota */ }
  }

  function clearLocal() {
    try {
      localStorage.removeItem(storageKey());
    } catch (_) { /* ignore */ }
  }

  function apiBase() {
    if (window.MedifiLLM) return window.MedifiLLM.apiBase();
    if (window.MEDIFI_CONFIG && window.MEDIFI_CONFIG.apiBase) {
      var cfg = String(window.MEDIFI_CONFIG.apiBase).trim();
      if (cfg) return cfg.replace(/\/$/, "");
    }
    if (window.location.protocol === "file:") return "http://localhost:3001";
    if (window.location.protocol === "http:" || window.location.protocol === "https:") {
      return window.location.origin;
    }
    return "http://localhost:3001";
  }

  async function testConnection(config) {
    var res = await fetch(apiBase() + "/api/email/connect", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ credentials: config }),
    });
    var data = await res.json().catch(function () { return {}; });
    if (!res.ok) throw new Error(data.error || "Could not connect to your email");
    return data;
  }

  window.MedifiEmailSettings = {
    guessImapHost: guessImapHost,
    loadLocal: loadLocal,
    saveLocal: saveLocal,
    clearLocal: clearLocal,
    testConnection: testConnection,
    SUBJECT_FILTER: "NHSINFORMATION",
  };
})();
