/* Medifi — App shell. Web layout: sticky header, screen router,
 * processing state, responsive nav, action bar, and calendar modal. */
(function () {
  const { Button } = window.MedifiDesignSystem_063852;
  const Icon = window.Icon;
  const Cal = window.MedifiCal;

  const MAIN_SCREENS = ["home", "letters", "help", "account"];
  const PROTECTED_SCREENS = ["home", "scan", "result", "letters", "account", "health"];
  const PUBLIC_SCREENS = ["landing", "signup", "help"];

  const LOGO_SRC = (window.MEDIFI_ASSETS && window.MEDIFI_ASSETS.logo) || "../../assets/medifi-logo.png";

  function isAuthenticated() {
    if (window.MedifiAuth && window.MedifiAuth.firebaseReady && window.MedifiAuth.firebaseReady()) {
      return Boolean(window.MedifiAuth.getToken && window.MedifiAuth.getToken());
    }
    if (window.MedifiAuth && window.MedifiAuth.getToken && window.MedifiAuth.getToken()) return true;
    if (window.MedifiPatient && window.MedifiPatient.isRegistered && window.MedifiPatient.isRegistered()) {
      return true;
    }
    return false;
  }

  function Logo({ onClick, large }) {
    return (
      <button
        type="button"
        className={"mf-header__logo" + (large ? " mf-header__logo--lg" : "")}
        onClick={onClick}
        aria-label="Medifi home"
      >
        <img src={LOGO_SRC} alt="Medifi" className="mf-header__logo-img" />
      </button>
    );
  }

  function PublicHeader({ onLogo, onLogin, onSignUp, onHelp }) {
    return (
      <header className="mf-header mf-header--public">
        <div className="mf-header__inner">
          <Logo onClick={onLogo} large />
          <nav className="mf-header__public-nav" aria-label="Account">
            <button type="button" className="mf-header__textbtn" onClick={onHelp}>
              Help
            </button>
            <button type="button" className="mf-header__textbtn" onClick={onLogin}>
              Log in
            </button>
            <button type="button" className="mf-header__cta" onClick={onSignUp}>
              Sign up
            </button>
          </nav>
        </div>
      </header>
    );
  }

  function HeaderNav({ screen, onNav }) {
    const items = [
      { id: "home", label: "Home" },
      { id: "letters", label: "Letters" },
      { id: "help", label: "Help" },
      { id: "account", label: "Account" },
    ];
    return (
      <nav className="mf-header__nav" aria-label="Main navigation">
        {items.map((it) => (
          <button
            key={it.id}
            type="button"
            className={"mf-header__nav-item" + (screen === it.id ? " mf-header__nav-item--on" : "")}
            onClick={() => onNav(it.id)}
            aria-current={screen === it.id ? "page" : undefined}
          >
            {it.label}
          </button>
        ))}
      </nav>
    );
  }

  function Header({ screen, title, onHome, onBack, onNav, onAccount, avatarInitial, wideLayout }) {
    const isSub = !MAIN_SCREENS.includes(screen);
    return (
      <header className={"mf-header" + (isSub ? " mf-header--sub" : "") + (wideLayout ? " mf-header--wide" : "")}>
        <div className="mf-header__inner">
          <Logo onClick={onHome} />
          {isSub && (
            <button type="button" className="mf-iconbtn" aria-label="Back" onClick={onBack}>
              <Icon name="chevronLeft" size={24} />
            </button>
          )}
          {!isSub && <HeaderNav screen={screen} onNav={onNav} />}
          {isSub && <span className="mf-header__title">{title}</span>}

          <div className="mf-header__right">
            <button type="button" className="mf-avatar" aria-label="Your account" onClick={onAccount}>{avatarInitial || "M"}</button>
          </div>
        </div>
      </header>
    );
  }

  function Processing({ message, sub }) {
    const [secs, setSecs] = React.useState(0);
    React.useEffect(function () {
      setSecs(0);
      const id = window.setInterval(function () { setSecs((s) => s + 1); }, 1000);
      return function () { window.clearInterval(id); };
    }, []);
    return (
      <div className="mf-processing">
        <div className="mf-processing__ring"><Icon name="scan" size={30} /></div>
        <p className="mf-processing__t">{message || "Reading your letter…"}</p>
        <p className="mf-processing__s">{sub || "Finding the date, place, and what to do next."}</p>
        <p className="mf-processing__s">Usually 10–45 seconds · {secs}s</p>
      </div>
    );
  }

  function BottomNav({ screen, onNav }) {
    const item = (id, name, label) => (
      <button type="button" className={"mf-nav__item" + (screen === id ? " mf-nav__item--on" : "")} onClick={() => onNav(id)} aria-current={screen === id ? "page" : undefined}>
        <Icon name={name} size={24} /><span>{label}</span>
      </button>
    );
    return (
      <nav className="mf-nav" aria-label="Mobile navigation">
        {item("home", "home", "Home")}
        {item("letters", "file", "Letters")}
        {item("help", "help", "Help")}
        {item("account", "id", "Account")}
      </nav>
    );
  }

  function eventFromLetter(l) {
    const e = l && l.event;
    if (!e) return null;
    const start = new Date(e.y, e.mo - 1, e.d, e.h, e.min);
    const end = new Date(start.getTime() + (e.durMins || 30) * 60000);
    return {
      title: e.title,
      start,
      end,
      location: e.location || "",
      description: l.summary,
      alarmMins: e.chase ? 0 : 120,
    };
  }

  function CalendarSheet({ letter, onClose, onDone }) {
    const ev = eventFromLetter(letter);
    const hasMeds = letter && letter.medicines && letter.medicines.length;
    const hasContent = ev || hasMeds;
    if (window.MedifiSheetA11y) window.MedifiSheetA11y.useEscape(onClose);
    function google() { window.open(Cal.googleUrl(ev), "_blank", "noopener"); onDone("Opening Google Calendar…"); }
    function apple() { Cal.downloadIcs([ev], "medifi-appointment"); onDone("Calendar file downloaded."); }
    function meds() { Cal.downloadIcs(Cal.medicineEvents(letter.medicines, new Date()), "medifi-medicine-reminders"); onDone("Medicine reminders downloaded."); }
    return (
      <div className="mf-sheet-scrim" onClick={onClose} role="presentation">
        <div className="mf-sheet" role="dialog" aria-modal="true" aria-labelledby="cal-sheet-title" onClick={(e) => e.stopPropagation()}>
          <div className="mf-sheet__grip" aria-hidden="true"></div>
          <h3 className="mf-sheet__title" id="cal-sheet-title">Add to your calendar</h3>
          <p className="mf-sheet__sub">Reminders will pop up on your device — no need to remember.</p>
          {!hasContent && (
            <p className="mf-disclaimer" style={{ textAlign: "left", marginBottom: 12 }}>
              There is no appointment date or medicine schedule in this message.
            </p>
          )}
          {ev && (
            <React.Fragment>
              <button type="button" className="mf-sheet__opt" onClick={google}>
                <Icon name="calendar" size={22} />
                <span><span className="t">Google Calendar</span><span className="s">{ev.alarmMins ? "Alerts 2 hours before" : "Sets a chase reminder"}</span></span>
                <Icon name="arrowRight" size={18} />
              </button>
              <button type="button" className="mf-sheet__opt" onClick={apple}>
                <Icon name="calendar" size={22} />
                <span><span className="t">Apple Calendar / Outlook</span><span className="s">Download .ics file</span></span>
                <Icon name="arrowRight" size={18} />
              </button>
            </React.Fragment>
          )}
          {hasMeds && (
            <button type="button" className="mf-sheet__opt" onClick={meds}>
              <Icon name="clock" size={22} />
              <span><span className="t">Medicine reminders</span><span className="s">Repeating alerts for each dose (.ics)</span></span>
              <Icon name="arrowRight" size={18} />
            </button>
          )}
          <button type="button" className="mf-sheet__cancel" onClick={onClose}>Cancel</button>
        </div>
      </div>
    );
  }

  function Toast({ children, tone }) {
    var isError = tone === "error";
    return (
      <div className={"mf-toast" + (isError ? " mf-toast--error" : "")} role={isError ? "alert" : "status"}>
        <Icon name={isError ? "alert" : "check"} size={18} />
        <span>{children}</span>
      </div>
    );
  }

  function SiteFooter() {
    const brand = window.MEDIFI_ASSETS && window.MEDIFI_ASSETS.brand;
    if (!brand) return null;
    return (
      <footer className="mf-site-footer">
        <div className="mf-site-footer__inner">
          <img
            src={brand}
            alt="Medifi — always putting patients first"
            className="mf-site-footer__brand"
          />
          <p className="mf-site-footer__note">Independent patient tool — not an official NHS service</p>
        </div>
      </footer>
    );
  }

  function AppShell() {
    const [booting, setBooting] = React.useState(true);
    const [screen, setScreen] = React.useState("landing");
    const [signupMode, setSignupMode] = React.useState("signup");
    const [authed, setAuthed] = React.useState(false);
    const [patient, setPatient] = React.useState(null);
    const [letter, setLetter] = React.useState(null);
    const [processing, setProcessing] = React.useState(false);
    const [calOpen, setCalOpen] = React.useState(false);
    const [calItem, setCalItem] = React.useState(null);
    const [routeOpen, setRouteOpen] = React.useState(false);
    const [toast, setToast] = React.useState(null);
    const [processingMsg, setProcessingMsg] = React.useState("");
    const [processingSub, setProcessingSub] = React.useState("");
    const [lettersVersion, setLettersVersion] = React.useState(0);
    const [chatOpen, setChatOpen] = React.useState(false);
    const [wideScreen, setWideScreen] = React.useState(function () {
      return typeof window !== "undefined" && window.matchMedia("(min-width: 1024px)").matches;
    });

    React.useEffect(function () {
      const mq = window.matchMedia("(min-width: 1024px)");
      function onChange(e) { setWideScreen(e.matches); }
      mq.addEventListener("change", onChange);
      return function () { mq.removeEventListener("change", onChange); };
    }, []);

    function runEmailSync() {
      if (!window.MedifiInboxSync) return;
      window.MedifiInboxSync.syncInbox({
        onSaved: function () {
          setLettersVersion(function (v) { return v + 1; });
        },
        onComplete: function (result) {
          if (result && result.imported > 0) {
            flash(result.imported === 1
              ? "1 new NHS letter arrived from your email."
              : result.imported + " new NHS letters arrived from your email.");
          }
        },
      });
    }

    React.useEffect(function () {
      if (window.MedifiPrefs) window.MedifiPrefs.applyBigText();
    }, []);

    React.useEffect(function () {
      function finishBoot(user, loggedIn) {
        setAuthed(loggedIn);
        setPatient(user || (window.MedifiPatient ? window.MedifiPatient.load() : null));
        setScreen(loggedIn ? "home" : "landing");
        setLettersVersion(function (v) { return v + 1; });
        setBooting(false);
        if (window.MedifiPrefs) window.MedifiPrefs.applyBigText();
        if (loggedIn) runEmailSync();
      }

      if (!window.MedifiAuth || !window.MedifiAuth.firebaseReady()) {
        var localUser = window.MedifiPatient ? window.MedifiPatient.load() : null;
        finishBoot(localUser, isAuthenticated());
        return;
      }
      window.MedifiAuth.bootstrap().then(function (data) {
        if (data.error) flash(data.error, "error");
        if (data.user) {
          finishBoot(data.user, true);
          if (data.fromGoogle) {
            flash("Welcome, " + (window.MedifiPatient
              ? window.MedifiPatient.firstName(data.user.name)
              : "there") + "!");
          }
          if (data.gmailConnected) {
            flash("Gmail connected — checking for NHS letters.");
          }
        } else {
          var loggedIn = isAuthenticated();
          if (!loggedIn && window.MedifiAuth && window.MedifiAuth.getUser && window.MedifiAuth.getUser()) {
            loggedIn = true;
          }
          finishBoot(
            (loggedIn && window.MedifiAuth && window.MedifiAuth.getUser)
              ? window.MedifiAuth.getUser()
              : (window.MedifiPatient ? window.MedifiPatient.load() : null),
            loggedIn
          );
        }
      });
    }, []);

    React.useEffect(function () {
      if (booting || authed) return;
      if (!window.MedifiFirebase || !window.MedifiFirebase.ready || !window.MedifiAuth) return;
      var auth = window.MedifiFirebase.auth;
      var settled = false;
      var unsub = auth.onAuthStateChanged(function (firebaseUser) {
        if (!firebaseUser || settled || authed) return;
        if (window.MedifiAuth.getToken && window.MedifiAuth.getToken()) return;
        settled = true;
        window.MedifiAuth.bootstrap().then(function (data) {
          if (data.user) {
            setPatient(data.user);
            setAuthed(true);
            setScreen("home");
            setLettersVersion(function (v) { return v + 1; });
            runEmailSync();
            if (data.fromGoogle) {
              flash("Welcome, " + (window.MedifiPatient
                ? window.MedifiPatient.firstName(data.user.name)
                : "there") + "!");
            }
          } else if (data.error) {
            flash(data.error, "error");
          }
        });
      });
      return function () { unsub(); };
    }, [booting, authed]);

    React.useEffect(function () {
      if (!authed) return;
      const id = window.setInterval(runEmailSync, 5000);
      return function () { window.clearInterval(id); };
    }, [authed]);

    React.useEffect(function () {
      if (booting) return;
      if (!authed && PROTECTED_SCREENS.indexOf(screen) >= 0) {
        setScreen("landing");
      }
    }, [authed, screen, booting]);

    const allLetters = React.useMemo(function () {
      return window.MedifiLetterStore
        ? window.MedifiLetterStore.getAllLetters()
        : (window.MEDIFI_LETTERS || []);
    }, [lettersVersion]);

    async function saveToLibrary(l) {
      if (window.MedifiAuth && window.MedifiAuth.getToken()) {
        try {
          await window.MedifiAuth.saveLetter(l);
          setLettersVersion(function (v) { return v + 1; });
          return;
        } catch (_) { /* fall through to local */ }
      }
      if (window.MedifiLetterStore && window.MedifiLetterStore.saveLetter(l)) {
        setLettersVersion(function (v) { return v + 1; });
      }
    }

    const titles = {
      scan: "Scan a letter",
      result: letter ? letter.sender : "",
      letters: "Your letters",
      help: "Help & support",
      account: "Account",
      health: "Health profile",
      signup: signupMode === "login" ? "Log in" : "Create account",
      landing: "Medifi",
    };

    function goLogin() {
      setSignupMode("login");
      setScreen("signup");
    }

    function goSignup() {
      setSignupMode("signup");
      setScreen("signup");
    }

    function goLanding() {
      setScreen("landing");
    }

    function navigate(next) {
      if (PROTECTED_SCREENS.indexOf(next) >= 0 && !isAuthenticated()) {
        flash("Please log in to access this part of Medifi.", "error");
        goLogin();
        return;
      }
      setScreen(next);
    }

    async function signOut() {
      if (window.MedifiAuth) await window.MedifiAuth.logout();
      else if (window.MedifiPatient) window.MedifiPatient.clear();
      setPatient(window.MedifiPatient ? window.MedifiPatient.defaultProfile() : null);
      setAuthed(false);
      setLettersVersion(function (v) { return v + 1; });
      setScreen("landing");
      if (window.MedifiPrefs) window.MedifiPrefs.applyBigText();
      flash("Signed out.");
    }

    function onAuthSuccess(profile, opts) {
      var wasRegistered = patient && patient.registeredAt;
      var fromGoogle = opts && opts.google;
      setPatient(profile);
      setAuthed(true);
      setLettersVersion(function (v) { return v + 1; });
      setScreen(wasRegistered && !fromGoogle ? "account" : "home");
      runEmailSync();
      if (window.MedifiPrefs) window.MedifiPrefs.applyBigText();
      flash(
        wasRegistered && !fromGoogle
          ? "Profile updated."
          : "Welcome, " + (window.MedifiPatient ? window.MedifiPatient.firstName(profile.name) : "there") + "!"
      );
    }

    function onSignupComplete(profile, opts) {
      onAuthSuccess(profile, opts || {});
    }

    const avatarInitial = patient && window.MedifiPatient
      ? window.MedifiPatient.initial(patient.name)
      : "M";

    function openCal(it) {
      var p = window.MedifiPrefs ? window.MedifiPrefs.load() : null;
      if (p && !p.calendar) {
        flash("Calendar sync is turned off in Account settings.", "error");
        return;
      }
      var hasCal = window.MedifiLetterUtils
        ? window.MedifiLetterUtils.hasCalendarContent(it)
        : (it && (it.event || (it.medicines && it.medicines.length)));
      if (!hasCal) {
        flash("Nothing to add to your calendar in this message.", "error");
        return;
      }
      setCalItem(it);
      setCalOpen(true);
    }
    function openRoutes() {
      if (!letter || !window.MedifiRoutes || !window.MedifiRoutes.venueForLetter(letter)) {
        flash("We couldn't find an address in this letter to plan a route.", "error");
        return;
      }
      setRouteOpen(true);
    }

    async function analyze(input, instant) {
      const Matcher = window.MedifiLetterMatcher;
      const isReadyPlan = input && typeof input === "object" && input.headline && input.summary;
      const isTextJob = input && typeof input === "object" && input.text && !input.headline;

      if (isReadyPlan) {
        saveToLibrary(input);
        setLetter(input);
        setScreen("result");
        return;
      }

      if (isTextJob) {
        setProcessing(true);
        setProcessingMsg("Medifi AI is reading your letter…");
        setProcessingSub("Summarising in plain English and checking for admin risks.");
        try {
          const letter = await Matcher.letterFromExtractedText(input.text);
          saveToLibrary(letter);
          setLetter(letter);
          setScreen("result");
        } catch (err) {
          const msg = err.name === "AbortError"
            ? "This is taking too long. Try a shorter letter or paste the text instead."
            : (err.message || "Could not analyse this letter.");
          flash(msg, "error");
        } finally {
          setProcessing(false);
          setProcessingMsg("");
          setProcessingSub("");
        }
        return;
      }

      const l = input;
      setLetter(l);
      if (instant) { setScreen("result"); return; }
      setProcessing(true);
      setProcessingMsg(l && l.fromLLM ? "Medifi AI is reading your letter…" : "Reading your letter…");
      setProcessingSub("Finding the date, place, and what to do next.");
      window.setTimeout(() => {
        setProcessing(false);
        setProcessingMsg("");
        setProcessingSub("");
        setScreen("result");
      }, l && l.fromLLM ? 800 : 1500);
    }
    function open(l) { setLetter(l); navigate("result"); }
    function goHome() {
      if (isAuthenticated()) setScreen("home");
      else setScreen("landing");
    }
    function goBack() {
      if (screen === "signup" && !isAuthenticated()) goLanding();
      else if (screen === "health" || screen === "signup") setScreen(patient && patient.registeredAt ? "account" : "home");
      else if (screen === "result" || screen === "scan") goHome();
      else goHome();
    }
    function flash(msg, tone) {
      setToast({ msg: msg, tone: tone || "success" });
      window.clearTimeout(flash._t);
      flash._t = window.setTimeout(function () { setToast(null); }, 3200);
    }
    function calDone(msg) { setCalOpen(false); flash(msg); }

    const showPublicChrome = !booting && !processing && PUBLIC_SCREENS.indexOf(screen) >= 0 && !authed;
    const showAppHeader = !booting && !processing && !showPublicChrome;
    const showMobileNav = showAppHeader && authed && MAIN_SCREENS.includes(screen);
    const showChat = showAppHeader && authed && screen !== "signup";
    const sidebarChat = showChat && wideScreen;
    const showFooter = !booting && !processing;
    const showActionbar = authed && !processing && screen === "result";

    return (
      <div className={"mf-app" + (sidebarChat ? " mf-app--sidebar" : "") + (showPublicChrome ? " mf-app--public" : "") + (showMobileNav ? " mf-app--has-nav" : "")}>
        {showPublicChrome && (
          <PublicHeader
            onLogo={goLanding}
            onLogin={goLogin}
            onSignUp={goSignup}
            onHelp={() => setScreen("help")}
          />
        )}
        {showAppHeader && (
          <Header
            screen={screen}
            title={titles[screen]}
            onHome={goHome}
            onBack={goBack}
            onNav={navigate}
            onAccount={() => navigate("account")}
            avatarInitial={avatarInitial}
            wideLayout={sidebarChat}
          />
        )}
        <div className="mf-shell">
          <div className="mf-main-column">
            <div className="mf-layout">
              <main className="mf-body">
            {booting ? (
              <div className="mf-processing">
                <div className="mf-processing__ring"><Icon name="scan" size={30} /></div>
                <p className="mf-processing__t">Loading Medifi…</p>
              </div>
            ) : processing ? <Processing message={processingMsg} sub={processingSub} /> : (
              <React.Fragment>
                {screen === "landing" && (
                  <window.LandingScreen
                    onSignUp={goSignup}
                    onLogin={goLogin}
                    onLearnMore={() => setScreen("help")}
                  />
                )}
                {screen === "signup" && (
                  <window.SignUpScreen
                    isEdit={Boolean(
                      patient && patient.registeredAt
                      && window.MedifiAuth && window.MedifiAuth.getToken()
                    )}
                    initialMode={signupMode}
                    onCancel={!authed ? goLanding : null}
                    onComplete={onSignupComplete}
                  />
                )}
                {screen === "home" && authed && (
                  <window.HomeScreen
                    letters={allLetters}
                    patient={patient}
                    onScan={() => navigate("scan")}
                    onOpen={open}
                    onSeeAll={() => navigate("letters")}
                  />
                )}
                {screen === "scan" && authed && <window.ScanScreen onAnalyze={analyze} />}
                {screen === "result" && authed && letter && (
                  <window.ResultScreen
                    letter={letter}
                    onAddReminders={() => openCal(letter)}
                    onPlanRoute={openRoutes}
                  />
                )}
                {screen === "result" && authed && !letter && (
                  <div className="mf-screen mf-screen--empty">
                    <p className="mf-disclaimer" style={{ textAlign: "left" }}>
                      This letter is no longer available. Go back to Home and open it again from Your letters.
                    </p>
                    <Button variant="primary" fullWidth onClick={goHome}>Back to home</Button>
                  </div>
                )}
                {screen === "letters" && authed && <window.LettersScreen letters={allLetters} onOpen={open} />}
                {screen === "help" && (
                  <window.HelpScreen onBack={!authed ? goLanding : null} />
                )}
                {screen === "account" && authed && (
                  <window.AccountScreen
                    patient={patient}
                    onOpenHealth={() => navigate("health")}
                    onEditProfile={() => setScreen("signup")}
                    onGoSignup={goSignup}
                    onSignOut={signOut}
                    onAuthSuccess={function (user) { onAuthSuccess(user, { google: true }); }}
                    onEmailConnected={() => setLettersVersion(function (v) { return v + 1; })}
                  />
                )}
                {screen === "health" && authed && (
                  <window.HealthScreen onDone={() => navigate("account")} />
                )}
              </React.Fragment>
            )}
              </main>
            </div>
            {(showFooter || showActionbar) && (
              <div className="mf-bottom-stack">
                {showActionbar && (
                  <div className="mf-actionbar">
                    <Button variant="primary" size="lg" fullWidth iconLeft={<Icon name="calendar" size={20} />} onClick={() => openCal(letter)}>
                      {letter && letter.medicines && !letter.event ? "Set medicine reminders" : "Add to my calendar"}
                    </Button>
                  </div>
                )}
                {showFooter && <SiteFooter />}
              </div>
            )}
            {showMobileNav && <BottomNav screen={screen} onNav={navigate} />}
          </div>
          {sidebarChat && window.ChatPanel && (
            <window.ChatPanel
              docked
              letters={allLetters}
              currentLetter={letter}
              patient={patient}
            />
          )}
        </div>
        {showChat && !wideScreen && window.ChatPanel && (
          <window.ChatPanel
            letters={allLetters}
            currentLetter={letter}
            patient={patient}
            open={chatOpen}
            hideFab={showActionbar}
            onToggle={() => setChatOpen(function (v) { return !v; })}
          />
        )}
        {calOpen && calItem && <CalendarSheet letter={calItem} onClose={() => setCalOpen(false)} onDone={calDone} />}
        {routeOpen && letter && window.MedifiRoutes.venueForLetter(letter) && (
          <window.TransportSheet letter={letter} onClose={() => setRouteOpen(false)} />
        )}
        {toast && <Toast tone={toast.tone}>{toast.msg}</Toast>}
      </div>
    );
  }
  window.AppShell = AppShell;
})();
