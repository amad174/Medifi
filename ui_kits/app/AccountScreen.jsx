/* Medifi — Account screen. Profile, preferences, and AI API status. */
(function () {
  const { Button, Badge, Input } = window.MedifiDesignSystem_063852;
  const Icon = window.Icon;
  const LLM = window.MedifiLLM;

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

  function AccountScreen({ onOpenHealth, onEditProfile, onSignOut, patient }) {
    const [prefs, setPrefs] = React.useState({ notify: true, calendar: true, carer: false, bigText: false });
    const [llm, setLlm] = React.useState(null);
    const [apiBase, setApiBase] = React.useState(() => LLM ? LLM.apiBase() : "");
    const [apiError, setApiError] = React.useState("");
    const t = (k) => setPrefs((p) => ({ ...p, [k]: !p[k] }));
    const health = window.MedifiHealth && window.MedifiHealth.loadProfile();
    const score = health && health.lastScore;

    React.useEffect(function () {
      if (!LLM) return;
      LLM.health()
        .then(setLlm)
        .catch(function () { setLlm({ ok: false, llm: false }); });
    }, [apiBase]);

    function saveApiBase() {
      if (!LLM) return;
      try {
        LLM.setApiBase(apiBase.trim() || window.location.origin);
        setApiError("");
        LLM.health().then(setLlm).catch(function () { setLlm({ ok: false, llm: false }); });
      } catch (err) {
        setApiError(err.message);
      }
    }

    const llmLabel = !llm ? "Checking…" : llm.llm ? "AI connected" : "AI not configured";
    const llmTone = llm && llm.llm ? "safe" : "caution";
    const P = window.MedifiPatient;
    const profile = patient || (P ? P.load() : null);
    const displayName = profile && profile.name ? profile.name : "Your account";
    const displaySub = profile && profile.email ? profile.email : "Complete sign-up to save your profile";
    const avatarLetter = P ? P.initial(displayName) : "M";
    const lifestyleSummary = profile && profile.activity && P
      ? [
          P.labelFor(P.ACTIVITY, profile.activity),
          profile.diet ? P.labelFor(P.DIET, profile.diet) + " diet" : "",
          profile.sleep ? P.labelFor(P.SLEEP, profile.sleep) + " sleep" : "",
        ].filter(Boolean).join(" · ")
      : "";

    return (
      <div className="mf-screen">
        <div className="mf-profile">
          <span className="mf-profile__avatar">{avatarLetter}</span>
          <div className="mf-profile__main">
            <span className="mf-profile__name">{displayName}</span>
            <span className="mf-profile__sub">{displaySub}</span>
          </div>
          <Badge tone={profile && profile.registeredAt ? "safe" : "caution"} dot>
            {profile && profile.registeredAt ? "Signed up" : "Incomplete"}
          </Badge>
        </div>

        <div className="mf-section">
          <p className="mf-section__label">Your profile</p>
          <button type="button" className="mf-contact" onClick={() => onEditProfile && onEditProfile()}>
            <span className="mf-contact__icon"><Icon name="id" size={20} /></span>
            <span className="mf-contact__main">
              <span className="t">Edit sign-up details</span>
              <span className="s">{lifestyleSummary || "Name, email, lifestyle questions"}</span>
            </span>
            <Icon name="chevronRight" size={20} />
          </button>
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
          <p className="mf-section__label">AI (LLM)</p>
          <div className="mf-card-list">
            <SettingRow icon="sparkle" title="Letter understanding" sub={llmLabel + (llm && llm.provider ? " · " + llm.provider : "")}
              control={<Badge tone={llmTone} dot>{llm && llm.llm ? "On" : "Off"}</Badge>} />
          </div>
          <p className="mf-disclaimer" style={{ textAlign: "left", marginTop: 8 }}>
            Put your API key in <strong>.env</strong> at the project root (<strong>ANTHROPIC_API_KEY</strong> for Claude), then run <strong>cd server && npm start</strong>.
          </p>
          <div className="mf-ask" style={{ marginTop: 12 }}>
            <Input label="API server URL" placeholder="http://localhost:3001"
              value={apiBase} onChange={(e) => setApiBase(e.target.value)} />
            <Button variant="secondary" size="sm" onClick={saveApiBase}>Save server URL</Button>
            {apiError && <span className="mf-img-preview__error">{apiError}</span>}
          </div>
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

        <Button variant="secondary" fullWidth onClick={() => onSignOut && onSignOut()}>Sign out</Button>
        <p className="mf-disclaimer">Medifi stores your letters on this device. We never share your information without your permission.</p>
      </div>
    );
  }
  window.AccountScreen = AccountScreen;
})();
