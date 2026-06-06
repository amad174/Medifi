/* Persist scanned / AI-processed letters on this device (localStorage). */

(function () {
  const STORAGE_KEY = "medifi_saved_letters";
  const MAX_SAVED = 50;
  const DEMO_IDS = new Set(["derm", "referral", "badadmin", "rx"]);

  function loadSaved() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const list = raw ? JSON.parse(raw) : [];
      return Array.isArray(list) ? list : [];
    } catch {
      return [];
    }
  }

  function writeSaved(list) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list.slice(0, MAX_SAVED)));
    } catch (_) { /* quota */ }
  }

  function shouldSave(letter) {
    if (!letter || !letter.headline) return false;
    if (letter.matchedSample) return false;
    if (DEMO_IDS.has(letter.id) && !letter.fromLLM && !letter.fromUpload) return false;
    return Boolean(letter.fromLLM || letter.fromUpload || String(letter.id || "").startsWith("llm-")
      || String(letter.id || "").startsWith("scanned-"));
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
    const demos = window.MEDIFI_LETTERS || [];
    const saved = loadSaved();
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
