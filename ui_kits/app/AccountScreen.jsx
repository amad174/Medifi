/* Medifi — Account screen. Profile, preferences (real toggles), carer, sign out. */
(function () {
  const { Button, Badge } = window.MedifiDesignSystem_063852;
  const Icon = window.Icon;

  function Switch({ on, onToggle, label }) {
    return (
      <button type="button" role="switch" aria-checked={on} aria-label={label}
        className={"mf-switch" + (on ? " mf-switch--on" : "")} onClick={onToggle}>
        <span className="mf-switch__dot"></span>
      </button>
    );
  }

  function SettingRow({ icon, title, sub, control }) {
    return (
      <div className="mf-setting">
        <span className="mf-setting__icon"><Icon name={icon} size={20} /></span>
        <span className="mf-setting__main">
          <span className="t">{title}</span>
          {sub && <span className="s">{sub}</span>}
        </span>
        {control}
      </div>
    );
  }

  function AccountScreen({ onOpenHealth }) {
    const [prefs, setPrefs] = React.useState({ notify: true, calendar: true, carer: false, bigText: false });
    const t = (k) => setPrefs((p) => ({ ...p, [k]: !p[k] }));
    const health = window.MedifiHealth && window.MedifiHealth.loadProfile();
    const score = health && health.lastScore;

    return (
      <div className="mf-screen">
        <div className="mf-profile">
          <span className="mf-profile__avatar">A</span>
          <div className="mf-profile__main">
            <span className="mf-profile__name">Aisha Khan</span>
            <span className="mf-profile__sub">NHS number · 485 777 3456</span>
          </div>
          <Badge tone="safe" dot>Verified</Badge>
        </div>

        <div className="mf-section">
          <p className="mf-section__label">Health profile</p>
          <button type="button" className="mf-contact" onClick={() => onOpenHealth && onOpenHealth()}>
            <span className="mf-contact__icon"><Icon name="sparkle" size={20} /></span>
            <span className="mf-contact__main">
              <span className="t">Log health details &amp; AI risk score</span>
              <span className="s">
                {score
                  ? "Last score: " + score.score + "/100 · tap to update"
                  : "Weight, height, age, activity, diet"}
              </span>
            </span>
            <Icon name="chevronRight" size={20} />
          </button>
        </div>

        <div className="mf-section">
          <p className="mf-section__label">Reminders &amp; alerts</p>
          <div className="mf-card-list">
            <SettingRow icon="bell" title="Notifications" sub="Reminders and risk alerts"
              control={<Switch on={prefs.notify} onToggle={() => t("notify")} label="Notifications" />} />
            <SettingRow icon="calendar" title="Calendar sync" sub="Add events to your phone calendar"
              control={<Switch on={prefs.calendar} onToggle={() => t("calendar")} label="Calendar sync" />} />
            <SettingRow icon="languages" title="Large text" sub="Easier to read"
              control={<Switch on={prefs.bigText} onToggle={() => t("bigText")} label="Large text" />} />
          </div>
        </div>

        <div className="mf-section">
          <p className="mf-section__label">Sharing &amp; access</p>
          <div className="mf-card-list">
            <SettingRow icon="share" title="Carer access" sub={prefs.carer ? "Sara can see your summaries" : "Off"}
              control={<Switch on={prefs.carer} onToggle={() => t("carer")} label="Carer access" />} />
            <SettingRow icon="languages" title="Summary language" sub="English" control={<Icon name="chevronRight" size={20} />} />
          </div>
        </div>

        <Button variant="secondary" fullWidth>Sign out</Button>
        <p className="mf-disclaimer">Medifi stores your letters on this device. We never share your information without your permission.</p>
      </div>
    );
  }
  window.AccountScreen = AccountScreen;
})();
