/* Sync NHS letters from email (subject NHSINFORMATION) into Your Letters. */

(function () {
  function importedKey() {
    if (window.MedifiUserScope) {
      window.MedifiUserScope.migrateLegacy("emailImported");
      return window.MedifiUserScope.key(window.MedifiUserScope.SUFFIXES.emailImported);
    }
    return "medifi_email_imported_ids";
  }

  function apiBase() {
    if (window.MEDIFI_API_BASE) return window.MEDIFI_API_BASE.replace(/\/$/, "");
    if (location.protocol === "file:") return "http://localhost:3001";
    return "";
  }

  function loadImportedIds() {
    try {
      const raw = localStorage.getItem(importedKey());
      const list = raw ? JSON.parse(raw) : [];
      return new Set(Array.isArray(list) ? list : []);
    } catch {
      return new Set();
    }
  }

  function saveImportedIds(set) {
    try {
      localStorage.setItem(importedKey(), JSON.stringify([...set].slice(0, 200)));
    } catch (_) { /* quota */ }
  }

  async function importLetter(letter, onSaved) {
    if (!letter || !letter.id) return false;
    if (window.MedifiAuth && window.MedifiAuth.getToken()) {
      try {
        await window.MedifiAuth.saveLetter(letter);
        if (typeof onSaved === "function") onSaved(letter);
        return true;
      } catch (_) { /* fall through */ }
    }
    if (window.MedifiLetterStore && window.MedifiLetterStore.saveLetter(letter)) {
      if (typeof onSaved === "function") onSaved(letter);
      return true;
    }
    return false;
  }

  function getCredentials() {
    if (window.MedifiAuth && window.MedifiAuth.getEmailInbox) {
      return window.MedifiAuth.getEmailInbox();
    }
    if (window.MedifiEmailSettings) return window.MedifiEmailSettings.loadLocal();
    return null;
  }

  function getUserId() {
    if (window.MedifiAuth && window.MedifiAuth.getEmailUserId) {
      return window.MedifiAuth.getEmailUserId();
    }
    var creds = getCredentials();
    return creds && creds.email ? creds.email : "local";
  }

  async function syncInbox(opts) {
    const onSaved = opts && opts.onSaved;
    const onComplete = opts && opts.onComplete;
    const credentials = getCredentials();
    if (!credentials || !credentials.email || !credentials.password) {
      const out = { ok: false, configured: false, imported: 0 };
      if (onComplete) onComplete(out);
      return out;
    }

    const imported = loadImportedIds();
    const knownIds = [...imported];

    let res;
    try {
      res = await fetch(apiBase() + "/api/email/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          knownIds,
          userId: getUserId(),
          credentials: {
            email: credentials.email,
            password: credentials.password,
            imapHost: credentials.imapHost,
            imapPort: credentials.imapPort,
            subjectFilter: credentials.subjectFilter,
          },
        }),
      });
    } catch (err) {
      const out = { ok: false, error: err.message || "Could not reach Medifi server", imported: 0 };
      if (onComplete) onComplete(out);
      return out;
    }

    const data = await res.json().catch(function () { return {}; });
    if (!res.ok) {
      const out = { ok: false, error: data.error || "Email sync failed", imported: 0 };
      if (onComplete) onComplete(out);
      return out;
    }

    let count = 0;
    const letters = Array.isArray(data.letters) ? data.letters : [];
    for (let i = 0; i < letters.length; i++) {
      const letter = letters[i];
      if (!letter || imported.has(letter.id)) continue;
      const saved = await importLetter(letter, onSaved);
      if (saved) {
        imported.add(letter.id);
        count += 1;
      }
    }
    saveImportedIds(imported);

    if (data.lastSync && window.MedifiAuth && window.MedifiAuth.updateEmailInboxLastSync) {
      try {
        await window.MedifiAuth.updateEmailInboxLastSync(data.lastSync);
      } catch (_) { /* ignore */ }
    }

    const out = {
      ok: Boolean(data.ok),
      imported: count,
      newCount: data.newCount || count,
      lastSync: data.lastSync,
      configured: true,
    };
    if (onComplete) onComplete(out);
    return out;
  }

  async function getStatus() {
    const credentials = getCredentials();
    if (!credentials || !credentials.email) {
      return { configured: false };
    }
    try {
      const res = await fetch(apiBase() + "/api/email/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: getUserId(),
          credentials: {
            email: credentials.email,
            password: credentials.password,
            imapHost: credentials.imapHost,
            imapPort: credentials.imapPort,
            subjectFilter: credentials.subjectFilter,
          },
        }),
      });
      return await res.json();
    } catch {
      return { configured: true, accountEmail: credentials.email };
    }
  }

  window.MedifiInboxSync = {
    syncInbox,
    getStatus,
  };
})();
