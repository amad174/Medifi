/* Medifi — App shell. Web layout: sticky header, screen router,
 * processing state, responsive nav, action bar, and calendar modal. */
(function () {
  const { Button } = window.MedifiDesignSystem_063852;
  const Icon = window.Icon;
  const Cal = window.MedifiCal;

  const MAIN_SCREENS = ["home", "letters", "checkin", "help", "account"];

  function Logo({ onClick }) {
    return (
      <button type="button" className="mf-header__logo" onClick={onClick} aria-label="Medifi home">
        <img src="../../assets/medifi-cat.svg" alt="Medifi" className="mf-header__logo-img" />
      </button>
    );
  }

  function HeaderNav({ screen, onNav }) {
    const items = [
      { id: "home", label: "Home" },
      { id: "letters", label: "Letters" },
      { id: "checkin", label: "Check In" },
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
          >
            {it.label}
          </button>
        ))}
      </nav>
    );
  }

  function Header({ screen, title, onHome, onBack, onNav, onAccount, onUpdates, unread, avatarInitial }) {
    const isSub = !MAIN_SCREENS.includes(screen);
    return (
      <header className={"mf-header" + (isSub ? " mf-header--sub" : "")}>
        <div className="mf-header__inner">
          {isSub ? (
            <button type="button" className="mf-iconbtn" aria-label="Back" onClick={onBack}>
              <Icon name="chevronLeft" size={24} />
            </button>
          ) : (
            <Logo onClick={onHome} />
          )}

          {!isSub && <HeaderNav screen={screen} onNav={onNav} />}

          {isSub && <span className="mf-header__title">{title}</span>}

          <div className="mf-header__right">
            <button type="button" className="mf-iconbtn mf-iconbtn--badge" aria-label="Updates from your care team" onClick={onUpdates}>
              <Icon name="bell" size={22} />
              {unread > 0 && <span className="mf-bell-badge">{unread}</span>}
            </button>
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
        <p className="mf-processing__s">Usually 10–45 seconds with Claude · {secs}s</p>
      </div>
    );
  }

  function BottomNav({ screen, onNav }) {
    const item = (id, name, label) => (
      <button type="button" className={"mf-nav__item" + (screen === id ? " mf-nav__item--on" : "")} onClick={() => onNav(id)}>
        <Icon name={name} size={24} /><span>{label}</span>
      </button>
    );
    return (
      <nav className="mf-nav" aria-label="Mobile navigation">
        {item("home", "home", "Home")}
        {item("letters", "file", "Letters")}
        {item("checkin", "help", "Check In")}
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
    const hasMeds = letter && letter.medicines;
    function google() { window.open(Cal.googleUrl(ev), "_blank", "noopener"); onDone("Opening Google Calendar…"); }
    function apple() { Cal.downloadIcs([ev], "medifi-appointment"); onDone("Calendar file downloaded."); }
    function meds() { Cal.downloadIcs(Cal.medicineEvents(letter.medicines, new Date()), "medifi-medicine-reminders"); onDone("Medicine reminders downloaded."); }
    return (
      <div className="mf-sheet-scrim" onClick={onClose} role="presentation">
        <div className="mf-sheet" role="dialog" aria-labelledby="cal-sheet-title" onClick={(e) => e.stopPropagation()}>
          <div className="mf-sheet__grip" aria-hidden="true"></div>
          <h3 className="mf-sheet__title" id="cal-sheet-title">Add to your calendar</h3>
          <p className="mf-sheet__sub">Reminders will pop up on your device — no need to remember.</p>
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

  function Toast({ children }) {
    return <div className="mf-toast" role="status"><Icon name="check" size={18} /><span>{children}</span></div>;
  }

  function AppShell() {
    const [booting, setBooting] = React.useState(true);
    const [screen, setScreen] = React.useState("home");
    const [patient, setPatient] = React.useState(null);
    const [letter, setLetter] = React.useState(null);
    const [processing, setProcessing] = React.useState(false);
    const [calOpen, setCalOpen] = React.useState(false);
    const [calItem, setCalItem] = React.useState(null);
    const [routeOpen, setRouteOpen] = React.useState(false);
    const [readIds, setReadIds] = React.useState(
      () => new Set((window.MEDIFI_UPDATES || []).filter((u) => !u.unread).map((u) => u.id)));
    const [toast, setToast] = React.useState("");
    const [processingMsg, setProcessingMsg] = React.useState("");
    const [processingSub, setProcessingSub] = React.useState("");
    const [lettersVersion, setLettersVersion] = React.useState(0);

    React.useEffect(function () {
      if (!window.MedifiAuth || !window.MedifiAuth.firebaseReady()) {
        setPatient(window.MedifiPatient ? window.MedifiPatient.load() : null);
        setScreen(window.MedifiPatient && window.MedifiPatient.isRegistered() ? "home" : "signup");
        setBooting(false);
        return;
      }
      window.MedifiAuth.bootstrap().then(function (data) {
        if (data.user) {
          setPatient(data.user);
          setScreen("home");
        } else {
          setPatient(window.MedifiPatient ? window.MedifiPatient.load() : null);
          setScreen("signup");
        }
        setLettersVersion(function (v) { return v + 1; });
        setBooting(false);
      });
    }, []);

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

    const markRead = React.useCallback((id) => {
      setReadIds((prev) => { if (prev.has(id)) return prev; const n = new Set(prev); n.add(id); return n; });
    }, []);
    const unread = (window.MEDIFI_UPDATES || []).filter((u) => !readIds.has(u.id)).length;
    const titles = {
      scan: "Scan a letter",
      result: letter ? letter.sender : "",
      letters: "Your letters",
      checkin: "Check in",
      help: "Help & support",
      account: "Account",
      health: "Health profile",
      signup: "Create account",
      updates: "Updates",
    };

    async function signOut() {
      if (window.MedifiAuth) await window.MedifiAuth.logout();
      else if (window.MedifiPatient) window.MedifiPatient.clear();
      setPatient(window.MedifiPatient ? window.MedifiPatient.defaultProfile() : null);
      setLettersVersion(function (v) { return v + 1; });
      setScreen("signup");
      flash("Signed out.");
    }

    function onSignupComplete(profile) {
      const wasRegistered = patient && patient.registeredAt;
      setPatient(profile);
      setScreen(wasRegistered ? "account" : "home");
      flash(
        wasRegistered
          ? "Profile updated."
          : "Welcome, " + (window.MedifiPatient ? window.MedifiPatient.firstName(profile.name) : "there") + "!"
      );
    }

    const avatarInitial = patient && window.MedifiPatient
      ? window.MedifiPatient.initial(patient.name)
      : "M";

    function openCal(it) { setCalItem(it); setCalOpen(true); }
    function openRoutes() { setRouteOpen(true); }

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
            ? "This is taking too long. Check your API key in .env and try a shorter letter, or paste the text instead."
            : (err.message || "Could not analyse this letter.");
          flash(msg);
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
    function open(l) { setLetter(l); setScreen("result"); }
    function goHome() { setScreen("home"); }
    function goBack() {
      if (screen === "health" || screen === "signup") setScreen(patient && patient.registeredAt ? "account" : "home");
      else if (screen === "result" || screen === "scan") goHome();
      else if (screen === "updates") goHome();
      else goHome();
    }
    function flash(msg) { setToast(msg); window.clearTimeout(flash._t); flash._t = window.setTimeout(() => setToast(""), 2800); }
    function calDone(msg) { setCalOpen(false); flash(msg); }

    const showMobileNav = !booting && !processing && MAIN_SCREENS.includes(screen);

    return (
      <div className="mf-app">
        <Header
          screen={screen}
          title={titles[screen]}
          onHome={goHome}
          onBack={goBack}
          onNav={setScreen}
          onAccount={() => setScreen("account")}
          onUpdates={() => setScreen("updates")}
          unread={unread}
          avatarInitial={avatarInitial}
        />
        <main className="mf-body">
          {booting ? (
            <div className="mf-processing">
              <div className="mf-processing__ring"><Icon name="scan" size={30} /></div>
              <p className="mf-processing__t">Loading your account…</p>
            </div>
          ) : processing ? <Processing message={processingMsg} sub={processingSub} /> : (
            <React.Fragment>
              {screen === "signup" && (
                <window.SignUpScreen
                  isEdit={Boolean(
                    patient && patient.registeredAt
                    && window.MedifiAuth && window.MedifiAuth.getToken()
                  )}
                  onComplete={onSignupComplete}
                />
              )}
              {screen === "home" && (
                <window.HomeScreen
                  letters={allLetters}
                  patient={patient}
                  onScan={() => setScreen("scan")}
                  onOpen={open}
                  onSeeAll={() => setScreen("letters")}
                />
              )}
              {screen === "scan" && <window.ScanScreen onAnalyze={analyze} />}
              {screen === "result" && letter && (
                <window.ResultScreen
                  letter={letter}
                  onAddReminders={() => openCal(letter)}
                  onPlanRoute={openRoutes}
                />
              )}
              {screen === "checkin" && <window.CheckInScreen />}
              {screen === "letters" && <window.LettersScreen letters={allLetters} onOpen={open} />}
              {screen === "help" && <window.HelpScreen />}
              {screen === "updates" && <window.UpdatesScreen onCal={openCal} readIds={readIds} markRead={markRead} />}
              {screen === "account" && (
                <window.AccountScreen
                  patient={patient}
                  onOpenHealth={() => setScreen("health")}
                  onEditProfile={() => setScreen("signup")}
                  onSignOut={signOut}
                />
              )}
              {screen === "health" && <window.HealthScreen onDone={() => setScreen("account")} />}
            </React.Fragment>
          )}
        </main>
        {!processing && screen === "result" && (
          <div className="mf-actionbar">
            <Button variant="primary" size="lg" fullWidth iconLeft={<Icon name="calendar" size={20} />} onClick={() => openCal(letter)}>
              {letter && letter.medicines && !letter.event ? "Set medicine reminders" : "Add to my calendar"}
            </Button>
          </div>
        )}
        {showMobileNav && <BottomNav screen={screen} onNav={setScreen} />}
        {calOpen && calItem && <CalendarSheet letter={calItem} onClose={() => setCalOpen(false)} onDone={calDone} />}
        {routeOpen && letter && window.MedifiRoutes.venueForLetter(letter) && (
          <window.TransportSheet letter={letter} onClose={() => setRouteOpen(false)} />
        )}
        {toast && <Toast>{toast}</Toast>}
      </div>
    );
  }
  window.AppShell = AppShell;
})();
