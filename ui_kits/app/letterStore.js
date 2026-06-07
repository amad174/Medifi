/* Persist scanned / AI-processed letters on this device (localStorage). */

(function () {
  const MAX_SAVED = 50;
  const DEMO_IDS = new Set(["derm", "referral", "badadmin", "rx"]);

  function storageKey() {
    if (window.MedifiUserScope) {
      window.MedifiUserScope.migrateLegacy("letters");
      return window.MedifiUserScope.key(window.MedifiUserScope.SUFFIXES.letters);
    }
    return "medifi_saved_letters";
  }

  function loadSaved() {
    try {
      const raw = localStorage.getItem(storageKey());
      const list = raw ? JSON.parse(raw) : [];
      return Array.isArray(list) ? list : [];
    } catch {
      return [];
    }
  }

  function writeSaved(list) {
    try {
      localStorage.setItem(storageKey(), JSON.stringify(list.slice(0, MAX_SAVED)));
    } catch (_) { /* quota */ }
  }

  function shouldSave(letter) {
    if (!letter || !letter.headline) return false;
    if (letter.matchedSample) return false;
    if (DEMO_IDS.has(letter.id) && !letter.fromLLM && !letter.fromUpload) return false;
    return Boolean(letter.fromLLM || letter.fromUpload || letter.fromEmail
      || String(letter.id || "").startsWith("llm-")
      || String(letter.id || "").startsWith("scanned-")
      || String(letter.id || "").startsWith("email-"));
  }

  function saveLetter(letter) {
    if (!shouldSave(letter)) return false;
    const entry = {
      ...letter,
      received: letter.received || "Processed just now",
      savedAt: Date.now(),
    };
    const saved = loadSaved().filter(function (l) { return l.id !== entry.id; });
    saved.unshift(entry);
    writeSaved(saved);
    return true;
  }

  function getSavedLetters() {
    return loadSaved();
  }

  function getAllLetters() {
    const saved = loadSaved();
    const loggedIn = window.MedifiAuth && window.MedifiAuth.isLoggedIn && window.MedifiAuth.isLoggedIn();
    if (loggedIn) return saved;
    const demos = window.MEDIFI_LETTERS || [];
    const savedIds = new Set(saved.map(function (l) { return l.id; }));
    const demosOnly = demos.filter(function (d) { return !savedIds.has(d.id); });
    return saved.concat(demosOnly);
  }

  function hydrateFromServer(letters) {
    const list = Array.isArray(letters) ? letters : [];
    writeSaved(list);
  }

  function upsertLocal(letter) {
    if (!shouldSave(letter)) return false;
    const entry = {
      ...letter,
      received: letter.received || "Processed just now",
      savedAt: Date.now(),
    };
    const saved = loadSaved().filter(function (l) { return l.id !== entry.id; });
    saved.unshift(entry);
    writeSaved(saved);
    return true;
  }

  window.MedifiLetterStore = {
    saveLetter,
    getSavedLetters,
    getAllLetters,
    shouldSave,
    hydrateFromServer,
    upsertLocal,
  };
})();
