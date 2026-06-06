/* Medifi — Check in screen (placeholder) */
(function () {
  const Icon = window.Icon;

  function CheckInScreen() {
    return (
      <div className="mf-screen">
        <div className="mf-section">
          <p className="mf-section__label">Check in</p>
          <div className="mf-stack">
            <h2 className="mf-greet__h">Check in for your appointment</h2>
            <p className="mf-greet__sub">This is a placeholder screen for the check-in flow. Implement steps here: confirm details, update contact, and mark attendance.</p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="mf-cta" type="button"><Icon name="check" size={18} /> <span style={{ marginLeft: 8 }}>I'm here</span></button>
              <button className="mf-cta" type="button" style={{ background: 'var(--surface-card)', color: 'var(--text-primary)' }}><Icon name="clock" size={18} /> <span style={{ marginLeft: 8 }}>Remind me later</span></button>
            </div>
          </div>
        </div>
      </div>
    );
  }
  window.CheckInScreen = CheckInScreen;
})();
