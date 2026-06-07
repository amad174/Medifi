/* User preferences and per-letter checklist state (scoped per account). */

(function () {
  const DEFAULTS = { notify: true, calendar: true, carer: false, bigText: false };

  function prefsKey() {
    if (window.MedifiUserScope) return window.MedifiUserScope.key("prefs");
    return "medifi_prefs";
  }

  function checklistKey(letterId) {
    var scope = window.MedifiUserScope ? window.MedifiUserScope.getScope() : "guest";
    return "medifi_" + scope + "_chk_" + letterId;
  }

  function load() {
    try {
      var raw = localStorage.getItem(prefsKey());
      if (!raw) return Object.assign({}, DEFAULTS);
      return Object.assign({}, DEFAULTS, JSON.parse(raw));
    } catch (_) {
      return Object.assign({}, DEFAULTS);
    }
  }

  function save(prefs) {
    try {
      localStorage.setItem(prefsKey(), JSON.stringify(prefs));
    } catch (_) { /* quota */ }
  }

  function loadChecklist(letterId) {
    try {
      var raw = localStorage.getItem(checklistKey(letterId));
      return raw ? JSON.parse(raw) : {};
    } catch (_) {
      return {};
    }
  }

  function saveChecklist(letterId, done) {
    try {
      localStorage.setItem(checklistKey(letterId), JSON.stringify(done));
    } catch (_) { /* quota */ }
  }

  function applyBigText() {
    document.documentElement.classList.toggle("mf-big-text", Boolean(load().bigText));
  }

  window.MedifiPrefs = {
    DEFAULTS: DEFAULTS,
    load: load,
    save: save,
    loadChecklist: loadChecklist,
    saveChecklist: saveChecklist,
    applyBigText: applyBigText,
  };
})();
