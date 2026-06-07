/* Per-account localStorage keys — keeps letters, health, inbox, etc. separate per user. */

(function () {
  var GUEST = "guest";
  var activeScope = GUEST;

  var SUFFIXES = {
    letters: "saved_letters",
    health: "health-profile",
    patient: "patient-profile",
    emailInbox: "email_inbox",
    emailImported: "email_imported_ids",
  };

  var LEGACY_KEYS = {
    letters: "medifi_saved_letters",
    health: "medifi-health-profile",
    patient: "medifi-patient-profile",
    emailInbox: "medifi_email_inbox",
    emailImported: "medifi_email_imported_ids",
  };

  function scopedKey(scopeId, suffix) {
    return "medifi_" + (scopeId || GUEST) + "_" + suffix;
  }

  function setScope(scopeId) {
    activeScope = scopeId || GUEST;
  }

  function getScope() {
    return activeScope;
  }

  function key(suffix) {
    return scopedKey(activeScope, suffix);
  }

  function migrateLegacy(suffix) {
    var legacy = LEGACY_KEYS[suffix];
    if (!legacy) return;
    var target = scopedKey(GUEST, SUFFIXES[suffix]);
    try {
      if (localStorage.getItem(target)) return;
      var raw = localStorage.getItem(legacy);
      if (!raw) return;
      localStorage.setItem(target, raw);
      localStorage.removeItem(legacy);
    } catch (_) { /* quota */ }
  }

  function clearScope(scopeId) {
    var scope = scopeId || activeScope;
    Object.keys(SUFFIXES).forEach(function (name) {
      try {
        localStorage.removeItem(scopedKey(scope, SUFFIXES[name]));
      } catch (_) { /* ignore */ }
    });
  }

  Object.keys(SUFFIXES).forEach(migrateLegacy);

  window.MedifiUserScope = {
    GUEST: GUEST,
    SUFFIXES: SUFFIXES,
    setScope: setScope,
    getScope: getScope,
    key: key,
    scopedKey: scopedKey,
    clearScope: clearScope,
    migrateLegacy: migrateLegacy,
  };
})();
