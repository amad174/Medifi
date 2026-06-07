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

  function AccountScreen({ onOpenHealth, onEditProfile, onSignOut, onGoSignup, onAuthSuccess, patient, onEmailConnected }) {
    const Prefs = window.MedifiPrefs;
    const [prefs, setPrefs] = React.useState(function () {
      return Prefs ? Prefs.load() : { notify: true, calendar: true, carer: false, bigText: false };
    });
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
    const [gmailBusy, setGmailBusy] = React.useState(false);
    const [showManualEmail, setShowManualEmail] = React.useState(false);
    const [showAdvanced, setShowAdvanced] = React.useState(false);
    const Auth = window.MedifiAuth;
    const signedIn = Auth && Auth.getToken && Auth.getToken();
    function togglePref(k) {
      setPrefs(function (p) {
        var next = Object.assign({}, p, { [k]: !p[k] });
        if (Prefs) Prefs.save(next);
        return next;
      });
    }

    React.useEffect(function () {
      if (Prefs) Prefs.applyBigText();
    }, [prefs.bigText]);
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
        var user = await Auth.loginWithGoogle();
        if (user && onAuthSuccess) {
          onAuthSuccess(user);
          setGoogleBusy(false);
          return;
        }
        if (!user) {
          setGoogleError("");
        }
      } catch (err) {
        setGoogleError(err.message || "Could not sign in with Google.");
        setGoogleBusy(false);
      }
    }

    async function connectGmailInbox() {
      if (!Auth || !Auth.connectGmailInbox) {
        setEmailError("Firebase is not set up. Copy firebase-config.example.js to firebase-config.js.");
        return;
      }
      setGmailBusy(true);
      setEmailError("");
      try {
        var config = await Auth.connectGmailInbox();
        if (config) {
          setEmailConnected(config);
          setEmailAddr(config.email || "");
          setEmailPass("");
          if (onEmailConnected) onEmailConnected(config);
          if (window.MedifiInboxSync) {
            window.MedifiInboxSync.syncInbox({ onSaved: onEmailConnected });
          }
          if (!signedIn && onAuthSuccess && Auth.getUser && Auth.getUser()) {
            onAuthSuccess(Auth.getUser());
          }
          return;
        }
      } catch (err) {
        setEmailError(err.message || "Could not connect Gmail.");
      } finally {
        setGmailBusy(false);
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
                  + (emailConnected.authType === "google_oauth" ? " · Google" : " · " + (emailConnected.imapHost || "IMAP"))
                }
                control={<Badge tone="safe" dot>On</Badge>}
              />
              <Button variant="secondary" size="sm" disabled={emailBusy} onClick={disconnectEmail}>
                Disconnect inbox
              </Button>
            </div>
          ) : (
            <React.Fragment>
              <div className="mf-google-auth" style={{ marginBottom: 12 }}>
                <Button
                  variant="primary"
                  size="lg"
                  fullWidth
                  disabled={gmailBusy || emailBusy}
                  onClick={connectGmailInbox}
                >
                  {gmailBusy ? "Connecting to Google…" : "Connect with Google"}
                </Button>
                <p className="mf-disclaimer" style={{ textAlign: "left", marginTop: 8 }}>
                  One click for Gmail — no app password needed. We only read unread emails titled <strong>{subjectFilter}</strong>.
                </p>
              </div>
              <button
                type="button"
                className="mf-link"
                onClick={() => setShowManualEmail(function (v) { return !v; })}
              >
                {showManualEmail ? "Hide manual setup" : "Use app password instead (Gmail, Outlook, etc.)"}
              </button>
              {showManualEmail && (
                <div className="mf-ask" style={{ marginTop: 12 }}>
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
                  <Button
                    variant="secondary"
                    size="sm"
                    disabled={emailBusy || !emailAddr.trim() || !emailPass}
                    onClick={connectEmail}
                  >
                    {emailBusy ? "Connecting…" : "Connect with password"}
                  </Button>
                </div>
              )}
              {emailError && <span className="mf-img-preview__error">{emailError}</span>}
            </React.Fragment>
          )}
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
          <p className="mf-section__label">Letter understanding</p>
          <div className="mf-card-list">
            <SettingRow icon="sparkle" title="AI summaries" sub={llm && llm.llm ? "Connected — your letters are read automatically" : "Not connected — paste text still works"}
              control={<Badge tone={llmTone} dot>{llm && llm.llm ? "On" : "Off"}</Badge>} />
          </div>
          <button type="button" className="mf-link" style={{ marginTop: 8 }} onClick={() => setShowAdvanced(function (v) { return !v; })}>
            {showAdvanced ? "Hide technical settings" : "Technical settings (for hosting)"}
          </button>
          {showAdvanced && (
            <div className="mf-ask" style={{ marginTop: 12 }}>
              <Input label="API server URL" placeholder={window.location.origin || "http://localhost:3001"}
                value={apiBase} onChange={(e) => setApiBase(e.target.value)} />
              <Button variant="secondary" size="sm" onClick={saveApiBase}>Save server URL</Button>
              {apiError && <span className="mf-img-preview__error">{apiError}</span>}
              <p className="mf-disclaimer" style={{ textAlign: "left", marginTop: 8 }}>
                Server operators: set <strong>ANTHROPIC_API_KEY</strong> in the project <strong>.env</strong> file.
              </p>
            </div>
          )}
        </div>

        <div className="mf-section">
          <p className="mf-section__label">Display &amp; reminders</p>
          <div className="mf-card-list">
            <SettingRow icon="calendar" title="Calendar sync" sub="Let Medifi add appointments to your phone calendar"
              control={<Switch on={prefs.calendar} onToggle={() => togglePref("calendar")} label="Calendar sync" />} />
            <SettingRow icon="languages" title="Large text" sub="Bigger text across the app"
              control={<Switch on={prefs.bigText} onToggle={() => togglePref("bigText")} label="Large text" />} />
            <SettingRow icon="bell" title="Notifications" sub="In-app reminders (push alerts coming soon)"
              control={<Switch on={prefs.notify} onToggle={() => togglePref("notify")} label="Notifications" />} />
          </div>
        </div>

        <div className="mf-section">
          <p className="mf-section__label">Sharing with someone you trust</p>
          <p className="mf-disclaimer" style={{ textAlign: "left", marginBottom: 8 }}>
            Open any letter and tap <strong>Share</strong> to send a plain-English summary to a family member or carer.
          </p>
          <SettingRow icon="share" title="Remember carer preference" sub={prefs.carer ? "You often share with someone" : "Off"}
            control={<Switch on={prefs.carer} onToggle={() => togglePref("carer")} label="Carer sharing preference" />} />
        </div>

        {(signedIn || (profile && profile.registeredAt)) && (
          <Button variant="secondary" fullWidth onClick={() => onSignOut && onSignOut()}>
            {signedIn ? "Sign out" : "Clear local profile"}
          </Button>
        )}
        <p className="mf-disclaimer">
          {signedIn && Auth && Auth.firebaseReady && Auth.firebaseReady()
            ? "Signed-in letters are saved to your private account in the cloud. We never share your information without your permission."
            : "Letters stay on this device until you sign in. We never share your information without your permission."}
        </p>
      </div>
    );
  }
  window.AccountScreen = AccountScreen;
})();
