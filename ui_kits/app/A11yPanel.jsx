/* Medifi — React hook for accessibility preferences. */
(function () {
  const A11y = window.MedifiA11y;

  function useA11y() {
    const [prefs, setPrefs] = React.useState(function () { return A11y.get(); });
    React.useEffect(function () { return A11y.subscribe(setPrefs); }, []);
    function update(patch) { A11y.set(patch); }
    function toggle(key) { A11y.toggle(key); }
    return { prefs: prefs, update: update, toggle: toggle };
  }

  window.useA11y = useA11y;
})();
