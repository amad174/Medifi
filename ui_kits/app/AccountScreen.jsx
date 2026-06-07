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

  function AccountScreen({ onOpenHealth, onEditProfile, onSignOut, onGoSignup, patient, onEmailConnected }) {
    const [prefs, setPrefs] = React.useState({ notify: true, calendar: true, carer: false, bigText: false });
    const [llm, setLlm] = React.useState(null);
    const [apiBase, setApiBase] = React.useState(() => LLM ? LLM.apiBase() : "");
    const [apiError, setApiError] = React.useState("");
    const [emailAddr, setEmailAddr] = React.useState("");
    const [emailPass, setEmailPass] = React.useState("");
    const [emailHost, setEmailHost] = React.useState("");
    const [emailBusy, setEmailBusy] = React.useState(false);
    const [emailError, setEmailError] = React.useState("");
    const [emailConnected, setEmailConnected] = React.useState(null);
    const [googleBusy, setGoogleBusy] = React.useState(false);
    const [googleError, setGoogleError] = React.useState("");
    const Auth = window.MedifiAuth;
    const signedIn = Auth && Auth.getToken && Auth.getToken();
    const t = (k) => setPrefs((p) => ({ ...p, [k]: !p[k] }));
    const health = window.MedifiHealth && window.MedifiHealth.loadProfile();
    const score = health && health.lastScore;
    const EmailCfg = window.MedifiEmailSettings;
    const subjectFilter = EmailCfg ? EmailCfg.SUBJECT_FILTER : "NHSINFORMATION";

    React.useEffect(function () {
      if (!LLM) return;
      LLM.health()
        .then(setLlm)
        .catch(function () { setLlm({ ok: false, llm: false }); });
    }, [apiBase]);

    React.useEffect(function () {
      var inbox = window.MedifiAuth && window.MedifiAuth.getEmailInbox
        ? window.MedifiAuth.getEmailInbox()
        : (EmailCfg ? EmailCfg.loadLocal() : null);
      if (!inbox) {
        setEmailConnected(null);
        if (patient && patient.email) setEmailAddr(patient.email);
        return;
      }
      setEmailConnected(inbox);
      setEmailAddr(inbox.email || "");
      setEmailHost(inbox.imapHost || "");
      setEmailPass("");
    }, [patient]);

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

    function onEmailAddressChange(value) {
      setEmailAddr(value);
      if (EmailCfg) {
        var guessed = EmailCfg.guessImapHost(value);
        setEmailHost(guessed.host);
      }
    }

    async function connectEmail() {
      if (!EmailCfg) return;
      setEmailError("");
      setEmailBusy(true);
      var guessed = EmailCfg.guessImapHost(emailAddr);
      var config = {
        email: emailAddr.trim(),
        password: emailPass,
        imapHost: (emailHost || guessed.host).trim(),
        imapPort: guessed.port || 993,
        subjectFilter: subjectFilter,
      };
      try {
        var test = await EmailCfg.testConnection(config);
        config.imapHost = test.imapHost || config.imapHost;
        config.imapPort = test.imapPort || config.imapPort;
        if (window.MedifiAuth && window.MedifiAuth.saveEmailInbox) {
          await window.MedifiAuth.saveEmailInbox(config);
        } else {
          EmailCfg.saveLocal(config);
        }
        setEmailConnected(config);
        setEmailPass("");
        if (onEmailConnected) onEmailConnected(config);
        if (window.MedifiInboxSync) {
          window.MedifiInboxSync.syncInbox({ onSaved: onEmailConnected });
        }
      } catch (err) {
        setEmailError(err.message || "Could not connect to your email");
      } finally {
        setEmailBusy(false);
      }
    }

    async function signInWithGoogle() {
      if (!Auth || !Auth.loginWithGoogle) {
        setGoogleError("Firebase is not set up. Copy firebase-config.example.js to firebase-config.js.");
        return;
      }
      setGoogleBusy(true);
      setGoogleError("");
      try {
        await Auth.loginWithGoogle();
      } catch (err) {
        setGoogleError(err.message || "Could not start Google sign-in.");
        setGoogleBusy(false);
      }
    }

    async function disconnectEmail() {
      setEmailBusy(true);
      setEmailError("");
      try {
        if (window.MedifiAuth && window.MedifiAuth.disconnectEmailInbox) {
          await window.MedifiAuth.disconnectEmailInbox();
        } else if (EmailCfg) {
          EmailCfg.clearLocal();
        }
        setEmailConnected(null);
        setEmailPass("");
      } catch (err) {
        setEmailError(err.message || "Could not disconnect");
      } finally {
        setEmailBusy(false);
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
          <Badge tone={signedIn || (profile && profile.registeredAt) ? "safe" : "caution"} dot>
            {signedIn ? "Signed in" : (profile && profile.registeredAt ? "Local only" : "Not signed in")}
          </Badge>
        </div>

        {!signedIn && (
          <div className="mf-section">
            <p className="mf-section__label">Sign in</p>
            <p className="mf-disclaimer" style={{ textAlign: "left", marginBottom: 12 }}>
              Sign in with Google to save your letters and settings across devices.
            </p>
            <div className="mf-google-auth">
              <Button variant="primary" size="lg" fullWidth disabled={googleBusy} onClick={signInWithGoogle}>
                {googleBusy ? "Redirecting to Google…" : "Sign in with Google"}
              </Button>
              {onGoSignup && (
                <Button variant="secondary" size="sm" fullWidth onClick={onGoSignup}>
                  Or create account with email
                </Button>
              )}
            </div>
            {googleError && <span className="mf-img-preview__error">{googleError}</span>}
          </div>
        )}

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
          <p className="mf-section__label">NHS email inbox</p>
          <p className="mf-disclaimer" style={{ textAlign: "left", marginBottom: 12 }}>
            Connect the inbox where you receive NHS letters. Medifi checks for new unread emails titled <strong>{subjectFilter}</strong> and adds them to Your Letters.
          </p>
          {emailConnected ? (
            <div className="mf-card-list" style={{ marginBottom: 12 }}>
              <SettingRow
                icon="file"
                title={emailConnected.email}
                sub={
                  (emailConnected.lastSync ? "Last checked " + new Date(emailConnected.lastSync).toLocaleString("en-GB") : "Connected")
                  + " · " + (emailConnected.imapHost || "IMAP")
                }
                control={<Badge tone="safe" dot>On</Badge>}
              />
            </div>
          ) : null}
          <div className="mf-ask">
            <Input
              label="Email address"
              type="email"
              placeholder="you@gmail.com"
              value={emailAddr}
              onChange={(e) => onEmailAddressChange(e.target.value)}
            />
            <Input
              label="Email password or app password"
              type="password"
              placeholder="Use a Gmail App Password if you have 2FA"
              value={emailPass}
              onChange={(e) => setEmailPass(e.target.value)}
            />
            <Input
              label="IMAP server (optional)"
              placeholder="imap.gmail.com"
              value={emailHost}
              onChange={(e) => setEmailHost(e.target.value)}
            />
            {emailError && <span className="mf-img-preview__error">{emailError}</span>}
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <Button
                variant="primary"
                size="sm"
                disabled={emailBusy || !emailAddr.trim() || !emailPass}
                onClick={connectEmail}
              >
                {emailBusy ? "Connecting…" : (emailConnected ? "Update connection" : "Connect inbox")}
              </Button>
              {emailConnected && (
                <Button variant="secondary" size="sm" disabled={emailBusy} onClick={disconnectEmail}>
                  Disconnect
                </Button>
              )}
            </div>
          </div>
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
