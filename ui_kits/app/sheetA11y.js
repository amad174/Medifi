/* Shared sheet/dialog helpers — Escape to close. */

(function () {
  function useEscape(onClose, active) {
    React.useEffect(
      function () {
        if (!onClose || active === false) return;
        function onKey(e) {
          if (e.key === "Escape") onClose();
        }
        document.addEventListener("keydown", onKey);
        return function () {
          document.removeEventListener("keydown", onKey);
        };
      },
      [onClose, active]
    );
  }

  window.MedifiSheetA11y = { useEscape: useEscape };
})();
