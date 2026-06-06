/* Medifi — App shell. Web layout: sticky header, screen router,
 * processing state, responsive nav, action bar, and calendar modal. */
(function () {
  const { Button } = window.MedifiDesignSystem_063852;
  const Icon = window.Icon;
  const Cal = window.MedifiCal;

  const MAIN_SCREENS = ["home", "letters", "help", "account"];

  function Logo({ onClick }) {
    return (
      <button type="button" className="mf-header__logo" onClick={onClick} aria-label="Medifi home">
        <svg width="150" height="28" viewBox="0 0 190 48" fill="none" role="img" aria-hidden="true">
          <circle cx="20.5" cy="20.5" r="13.5" stroke="#1257d6" strokeWidth="4" />
          <path d="M14.5 20.8l4.3 4.3 8-8.4" stroke="#0e8c84" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M30.4 30.4l8.1 8.1" stroke="#1257d6" strokeWidth="4" strokeLinecap="round" />
          <text x="54" y="32" fontFamily="Lexend, sans-serif" fontSize="28" fontWeight="700" fill="#0d1b2a" letterSpacing="-0.5">Medifi</text>
        </svg>
      </button>
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
          >
            {it.label}
          </button>
        ))}
      </nav>
    );
  }

  function Header({ screen, title, onHome, onBack, onNav, onAccount, onUpdates, unread }) {
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
            <button type="button" className="mf-avatar" aria-label="Your account" onClick={onAccount}>A</button>
          </div>
        </div>
      </header>
    );
  }

  function Processing({ message, sub }) {
    return (
      <div className="mf-processing">
        <div className="mf-processing__ring"><Icon name="scan" size={30} /></div>
        <p className="mf-processing__t">{message || "Reading your letter…"}</p>
        <p className="mf-processing__s">{sub || "Finding the date, place, and what to do next."}</p>
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
    const [screen, setScreen] = React.useState("home");
    const [letter, setLetter] = React.useState(null);
    const [processing, setProcessing] = React.useState(false);
    const [calOpen, setCalOpen] = React.useState(false);
    const [calItem, setCalItem] = React.useState(null);
    const [readIds, setReadIds] = React.useState(
      () => new Set((window.MEDIFI_UPDATES || []).filter((u) => !u.unread).map((u) => u.id)));
    const [toast, setToast] = React.useState("");
    const [processingMsg, setProcessingMsg] = React.useState("");
    const [processingSub, setProcessingSub] = React.useState("");

    const markRead = React.useCallback((id) => {
      setReadIds((prev) => { if (prev.has(id)) return prev; const n = new Set(prev); n.add(id); return n; });
    }, []);
    const unread = (window.MEDIFI_UPDATES || []).filter((u) => !readIds.has(u.id)).length;
    const titles = {
      scan: "Scan a letter",
      result: letter ? letter.sender : "",
      letters: "Your letters",
      help: "Help & support",
      account: "Account",
      updates: "Updates",
    };

    function openCal(it) { setCalItem(it); setCalOpen(true); }

    async function analyze(input, instant) {
      const Matcher = window.MedifiLetterMatcher;
      const isTextJob = input && typeof input === "object" && input.text && !input.headline;

      if (isTextJob) {
        setProcessing(true);
        setProcessingMsg("Medifi AI is reading your letter…");
        setProcessingSub("Summarising in plain English and checking for admin risks.");
        try {
          const letter = await Matcher.letterFromExtractedText(input.text);
          setLetter(letter);
          setScreen("result");
        } catch (err) {
          flash(err.message || "Could not analyse this letter.");
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
      if (screen === "result" || screen === "scan") goHome();
      else if (screen === "updates") goHome();
      else goHome();
    }
    function flash(msg) { setToast(msg); window.clearTimeout(flash._t); flash._t = window.setTimeout(() => setToast(""), 2800); }
    function calDone(msg) { setCalOpen(false); flash(msg); }

    const showMobileNav = !processing && MAIN_SCREENS.includes(screen);

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
        />
        <main className="mf-body">
          {processing ? <Processing message={processingMsg} sub={processingSub} /> : (
            <React.Fragment>
              {screen === "home" && <window.HomeScreen onScan={() => setScreen("scan")} onOpen={open} onSeeAll={() => setScreen("letters")} />}
              {screen === "scan" && <window.ScanScreen onAnalyze={analyze} />}
              {screen === "result" && letter && <window.ResultScreen letter={letter} onAddReminders={() => openCal(letter)} />}
              {screen === "letters" && <window.LettersScreen onOpen={open} />}
              {screen === "help" && <window.HelpScreen />}
              {screen === "updates" && <window.UpdatesScreen onCal={openCal} readIds={readIds} markRead={markRead} />}
              {screen === "account" && <window.AccountScreen />}
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
        {toast && <Toast>{toast}</Toast>}
      </div>
    );
  }
  window.AppShell = AppShell;
})();
