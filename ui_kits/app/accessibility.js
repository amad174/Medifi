/* Medifi — Large text accessibility preference (persists on device). */

(function () {
  var STORAGE_KEY = "medifi-a11y-prefs";
  var listeners = [];

  function defaultPrefs() {
    return { bigText: false };
  }

  function load() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return defaultPrefs();
      var parsed = JSON.parse(raw);
      return { bigText: !!parsed.bigText };
    } catch (e) {
      return defaultPrefs();
    }
  }

  function save(prefs) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
    listeners.forEach(function (fn) { fn(prefs); });
  }

  var state = load();

  function get() {
    return Object.assign({}, state);
  }

  function set(partial) {
    state = Object.assign({}, state, partial);
    save(state);
    applyDocumentClasses();
    return state;
  }

  function toggle(key) {
    var next = {};
    next[key] = !state[key];
    return set(next);
  }

  function subscribe(fn) {
    listeners.push(fn);
    return function () {
      listeners = listeners.filter(function (f) { return f !== fn; });
    };
  }

  function applyDocumentClasses() {
    var root = document.querySelector(".mf-app");
    if (!root) return;
    root.classList.toggle("mf-app--big-text", !!state.bigText);
  }

  window.MedifiA11y = {
    STORAGE_KEY: STORAGE_KEY,
    load: load,
    get: get,
    set: set,
    toggle: toggle,
    subscribe: subscribe,
    applyDocumentClasses: applyDocumentClasses,
  };
})();
