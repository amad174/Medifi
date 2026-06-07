/* Medifi — Result screen. The action plan: hero, risk alerts (signature),
 * plain-English summary, extracted fields, checklist, and tools. */
(function () {
  const { Button, Badge, Card, CardHeader, Eyebrow, RiskFlag, ChecklistItem, FieldRow, Input } =
    window.MedifiDesignSystem_063852;
  const Icon = window.Icon;

  const LANGS = ["English", "Urdu", "Bengali", "Polish", "Arabic", "Somali"];
  const RTL_LANGS = new Set(["Urdu", "Arabic"]);
  const LEVEL_TONE = { safe: "safe", caution: "caution", risk: "risk" };

  const Routes = window.MedifiRoutes;
  const LetterUtils = window.MedifiLetterUtils;

  function ResultScreen({ letter, onAddReminders, onPlanRoute }) {
    const contactPhone = LetterUtils ? LetterUtils.phoneFromLetter(letter) : null;
    const [done, setDone] = React.useState({});
    const [showOriginal, setShowOriginal] = React.useState(false);
    const [lang, setLang] = React.useState("English");
    const [langOpen, setLangOpen] = React.useState(false);
    const [xlate, setXlate] = React.useState(null);
    const [xlateLoading, setXlateLoading] = React.useState(false);
    const [xlateError, setXlateError] = React.useState("");
    const [q, setQ] = React.useState("");
    const [asked, setAsked] = React.useState(false);
    const [answer, setAnswer] = React.useState("");
    const [asking, setAsking] = React.useState(false);
    const [askError, setAskError] = React.useState("");
    const [toast, setToast] = React.useState(false);
    const [toastMsg, setToastMsg] = React.useState("");
    const [shareOpen, setShareOpen] = React.useState(false);
    const [shareText, setShareText] = React.useState("");
    const [speaking, setSpeaking] = React.useState(false);
    const [preparingSpeech, setPreparingSpeech] = React.useState(false);
    const [speechError, setSpeechError] = React.useState("");
    const xlateCache = React.useRef({});
    const toggle = (id) => setDone((d) => ({ ...d, [id]: !d[id] }));

    React.useEffect(function () {
      if (!shareOpen) return;
      function onKey(e) {
        if (e.key === "Escape") setShareOpen(false);
      }
      document.addEventListener("keydown", onKey);
      return function () { document.removeEventListener("keydown", onKey); };
    }, [shareOpen]);

    React.useEffect(function () {
      setLang("English");
      setXlate(null);
      setXlateError("");
      setSpeechError("");
      setSpeaking(false);
      setPreparingSpeech(false);
      setDone(window.MedifiPrefs ? window.MedifiPrefs.loadChecklist(letter.id) : {});
      xlateCache.current = {};
      if (window.MedifiSpeech) {
        window.MedifiSpeech.stop();
        window.MedifiSpeech.clearCache();
      }
    }, [letter.id]);

    React.useEffect(function () {
      if (window.MedifiPrefs) window.MedifiPrefs.saveChecklist(letter.id, done);
    }, [done, letter.id]);

    React.useEffect(function () {
      if (!window.MedifiSpeech || xlateLoading) return;
      window.MedifiSpeech.prefetch(letter, xlate || letter, lang);
    }, [letter.id, lang, xlate, xlateLoading]);

    React.useEffect(function () {
      return function () {
        if (window.MedifiSpeech) window.MedifiSpeech.stop();
      };
    }, []);

    async function pickLanguage(nextLang) {
      setLangOpen(false);
      setXlateError("");
      if (window.MedifiSpeech) window.MedifiSpeech.stop();
      setSpeaking(false);
      if (nextLang === "English") {
        setLang("English");
        setXlate(null);
        return;
      }

      const cacheKey = letter.id + "::" + nextLang;
      if (xlateCache.current[cacheKey]) {
        setLang(nextLang);
        setXlate(xlateCache.current[cacheKey]);
        return;
      }

      setLang(nextLang);
      setXlateLoading(true);
      try {
        if (!window.MedifiLLM || !(await window.MedifiLLM.isAvailable())) {
          throw new Error("AI is not connected. Add your API key in .env and restart the server.");
        }
        const translated = await window.MedifiLLM.translateLetter(letter, nextLang);
        xlateCache.current[cacheKey] = translated;
        setXlate(translated);
      } catch (err) {
        setXlateError(err.message || "Could not translate.");
        setLang("English");
        setXlate(null);
      } finally {
        setXlateLoading(false);
      }
    }

    async function handleAsk() {
      if (!q.trim()) return;
      setAsking(true);
      setAskError("");
      setAsked(false);
      try {
        if (window.MedifiLLM && await window.MedifiLLM.isAvailable()) {
          const a = await window.MedifiLLM.askQuestion(letter.original, letter.summary, q.trim());
          setAnswer(a);
        } else {
          setAnswer(
            "From this letter: " + letter.summary
            + " If anything is still unclear, call the contact on your letter or your GP — and always check against the original."
          );
        }
        setAsked(true);
      } catch (err) {
        setAskError(err.message || "Could not get an answer.");
      } finally {
        setAsking(false);
      }
    }

    function showToast(msg) {
      setToastMsg(msg);
      setToast(true);
      window.clearTimeout(showToast._t);
      showToast._t = window.setTimeout(function () { setToast(false); }, 3200);
    }

    async function toggleListen() {
      const Speech = window.MedifiSpeech;
      if (!Speech) return;
      setSpeechError("");
      if (speaking || preparingSpeech || Speech.isSpeaking()) {
        Speech.stop();
        setSpeaking(false);
        setPreparingSpeech(false);
        return;
      }
      try {
        setPreparingSpeech(true);
        await Speech.speakLetter(letter, xlate || letter, lang, function () {
          setSpeaking(false);
          setPreparingSpeech(false);
        });
        setPreparingSpeech(false);
        setSpeaking(true);
      } catch (err) {
        setSpeaking(false);
        setPreparingSpeech(false);
        setSpeechError(err.message || "Could not read aloud.");
      }
    }

    async function shareCarer() {
      const Share = window.MedifiShare;
      if (!Share) return;
      const currentView = xlate || letter;
      const text = Share.buildShareText(letter, currentView, lang);
      const result = await Share.sharePlan(letter, currentView, lang);
      if (result.ok) {
        showToast(result.message || "Shared with your carer.");
        return;
      }
      if (result.cancelled) return;
      setShareText(text);
      setShareOpen(true);
    }

    async function copyForCarer() {
      const ok = await window.MedifiShare.copyText(shareText);
      setShareOpen(false);
      showToast(ok ? "Summary copied — paste into a message for your carer." : "Could not copy. Select and copy the text manually.");
    }

    function shareWhatsApp() {
      window.open(window.MedifiShare.whatsAppUrl(shareText), "_blank", "noopener,noreferrer");
      setShareOpen(false);
      showToast("Opening WhatsApp…");
    }

    function shareEmail() {
      window.location.href = window.MedifiShare.mailtoUrl(letter, shareText);
      setShareOpen(false);
      showToast("Opening your email app…");
    }

    async function shareNativeFromSheet() {
      const result = await window.MedifiShare.nativeShare(letter, shareText);
      setShareOpen(false);
      if (result.ok) showToast(result.message || "Shared.");
    }

    const view = xlate || letter;
    const isRtl = RTL_LANGS.has(lang);
    const riskCount = view.risks.filter((r) => r.level !== "safe").length;
    const venue = Routes && Routes.venueForLetter(letter);
    const bestRoute = venue && Routes ? Routes.bestRoute(venue) : null;
    const statusLabel = { safe: "Looks fine", caution: "Check this", risk: "Needs attention" };

    function handleCheck(c) {
      if (c.action === "routes") {
        if (onPlanRoute) onPlanRoute();
        return;
      }
      toggle(c.id);
    }

    const quickTools = (
      <div className="mf-result-tools">
        <button type="button" className="mf-result-tool" onClick={toggleListen} disabled={xlateLoading}>
          <Icon name="volume" size={18} />
          <span>{speaking ? "Stop" : preparingSpeech ? "Preparing…" : "Listen"}</span>
        </button>
        <button type="button" className="mf-result-tool" onClick={() => setLangOpen((o) => !o)} disabled={xlateLoading}>
          <Icon name="languages" size={18} />
          <span>{xlateLoading ? "Translating…" : (lang === "English" ? "Translate" : lang)}</span>
        </button>
        <button type="button" className="mf-result-tool" onClick={shareCarer}>
          <Icon name="share" size={18} />
          <span>Share</span>
        </button>
      </div>
    );

    return (
      <div className="mf-screen mf-screen--result">
        <header className="mf-result-banner">
          <div className="mf-result-banner__row">
            <Eyebrow tone="accent">Your plan</Eyebrow>
            <div className="mf-result-banner__badges">
              {letter.chip && <span className="mf-result-chip">{letter.chip}</span>}
              <Badge tone={LEVEL_TONE[view.worstLevel]} dot>{statusLabel[view.worstLevel] || "Review"}</Badge>
            </div>
          </div>
          <h1 className={"mf-result-banner__title" + (isRtl ? " mf-rtl" : "")}>{view.headline}</h1>
          <div className="mf-result-banner__meta">
            {letter.sender && <span className="mf-result-banner__sender">{letter.sender}</span>}
            <span className="mf-result-banner__when">
              <Icon name="clock" size={16} />
              <span className={isRtl ? "mf-rtl" : ""}>{view.when}</span>
            </span>
          </div>
          {quickTools}
          {langOpen && (
            <div className="mf-langs mf-langs--banner">
              {LANGS.map((l) => (
                <button key={l} type="button"
                  className={"mf-chip" + (lang === l ? " mf-chip--on" : "")}
                  onClick={() => pickLanguage(l)}>{l}</button>
              ))}
            </div>
          )}
        </header>

        {xlateLoading && (
          <div className="mf-xlate-note">
            <Icon name="languages" size={16} />
            <span>Translating into {lang}…</span>
          </div>
        )}

        {lang !== "English" && !xlateLoading && xlate && (
          <div className="mf-xlate-note">
            <Icon name="languages" size={16} />
            <span>Showing a supportive {lang} summary. Your original English letter is the source of truth.</span>
          </div>
        )}

        {xlateError && (
          <div className="mf-banner">
            <Icon name="alert" size={20} />
            <span>{xlateError}</span>
          </div>
        )}

        <div className="mf-result-dashboard">
          <section className="mf-result-panel mf-result-panel--summary">
            <h2 className="mf-result-panel__title">{lang === "English" ? "In plain English" : "Summary"}</h2>
            <p className={"mf-result-summary" + (isRtl ? " mf-rtl" : "")}>{view.summary}</p>
            {speechError && (
              <div className="mf-banner mf-banner--compact">
                <Icon name="alert" size={18} />
                <span>{speechError}</span>
              </div>
            )}
          </section>

          <section className="mf-result-panel mf-result-panel--actions">
            <h2 className="mf-result-panel__title">What to do next</h2>
            <div className="mf-result-checklist">
              {view.checklist.map((c) => (
                <ChecklistItem key={c.id} label={c.label} meta={c.meta}
                  icon={<Icon name={c.icon} size={20} />}
                  done={!!done[c.id]} onToggle={() => handleCheck(c)} />
              ))}
            </div>
            {letter.medicines && (
              <div className="mf-result-meds">
                {letter.medicines.map((m, i) => (
                  <div key={i} className="mf-med">
                    <span className="mf-med__icon"><Icon name="clock" size={20} /></span>
                    <div className="mf-med__main">
                      <span className="mf-med__name">{m.name}</span>
                      <span className="mf-med__note">{m.dose} · {m.note}</span>
                    </div>
                  </div>
                ))}
                <Button variant="secondary" size="sm" fullWidth iconLeft={<Icon name="calendar" size={18} />} onClick={onAddReminders}>
                  Add medicine reminders
                </Button>
              </div>
            )}
          </section>

          <section className="mf-result-panel mf-result-panel--risks">
            <h2 className="mf-result-panel__title">
              What to check
              {riskCount > 0 && <Badge tone={LEVEL_TONE[view.worstLevel]}>{riskCount} to review</Badge>}
            </h2>
            <div className="mf-result-risks">
              {view.risks.map((r, i) => (
                <RiskFlag key={i} level={r.level} title={r.title}
                  action={r.level === "risk" ? (
                    contactPhone ? (
                      <Button as="a" href={LetterUtils.telHref(contactPhone)} variant="danger" size="sm"
                        iconLeft={<Icon name="phone" size={16} />}
                        aria-label={"Call " + contactPhone}>
                        Call
                      </Button>
                    ) : (
                      <Button as="a" href="tel:111" variant="danger" size="sm"
                        iconLeft={<Icon name="phone" size={16} />} aria-label="Call NHS 111">
                        Call 111
                      </Button>
                    )
                  ) : null}>
                  <span className={isRtl ? "mf-rtl" : ""}>{r.text}</span>
                </RiskFlag>
              ))}
            </div>
          </section>

          <section className="mf-result-panel mf-result-panel--ask">
            <h2 className="mf-result-panel__title">Ask about this letter</h2>
            <div className="mf-ask">
              <div className="mf-ask__row">
                <Input placeholder="e.g. What do I need to bring?"
                  aria-label="Your question about this letter"
                  value={q} onChange={(e) => setQ(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter" && q.trim()) handleAsk(); }} />
                <Button variant="secondary" iconLeft={<Icon name="arrowRight" size={18} />}
                  disabled={!q.trim() || asking} onClick={handleAsk} aria-label="Ask" />
              </div>
              {asking && (
                <div className="mf-ask__answer">
                  <Icon name="sparkle" size={18} />
                  <span>Thinking…</span>
                </div>
              )}
              {askError && (
                <div className="mf-banner mf-banner--compact">
                  <Icon name="alert" size={18} />
                  <span>{askError}</span>
                </div>
              )}
              {asked && answer && !asking && (
                <div className="mf-ask__answer">
                  <Icon name="sparkle" size={18} />
                  <span>{answer}</span>
                </div>
              )}
            </div>
          </section>

          <section className="mf-result-panel mf-result-panel--details">
            <h2 className="mf-result-panel__title">Details from your letter</h2>
            <div className="mf-result-fields">
              {view.fields.map((f, i) => (
                <FieldRow key={i} label={f.label} value={f.value} missing={f.missing} />
              ))}
            </div>
            <button type="button" className="mf-link" onClick={() => setShowOriginal((s) => !s)}>
              <Icon name="file" size={16} />
              {showOriginal ? "Hide original letter" : "Show original letter"}
            </button>
            {showOriginal && <pre className="mf-original mf-original--scroll">{letter.original}</pre>}
          </section>

          {venue && Routes && Routes.hasMap(venue) && (
            <section className="mf-result-panel mf-result-panel--map">
              <h2 className="mf-result-panel__title">Getting there</h2>
              <div className="mf-route-card mf-route-card--inline">
                {Routes.hasMap(venue) && <window.MapPreview venue={venue} />}
                <div className="mf-route-card__body">
                  <div className="mf-route-card__head">
                    <span className="mf-route-card__icon"><Icon name="pin" size={20} /></span>
                    <div className="mf-route-card__main">
                      <span className="mf-route-card__name">{venue.name}</span>
                      {venue.unit && <span className="mf-route-card__unit">{venue.unit}</span>}
                      <span className="mf-route-card__addr">{venue.address}</span>
                    </div>
                  </div>
                  {bestRoute && (
                    <div className="mf-route-card__best">
                      <Icon name={bestRoute.mode === "walk" ? "walk" : bestRoute.mode === "car" ? "car" : bestRoute.mode === "tube" || bestRoute.mode === "tram" ? "train" : "bus"} size={18} />
                      <span>
                        <strong>{bestRoute.label}</strong> · {bestRoute.summary} · {bestRoute.duration}
                        {letter.event && (
                          <> · leave by {Routes.leaveBy(letter.event, bestRoute.leaveByOffsetMins)}</>
                        )}
                      </span>
                    </div>
                  )}
                  <Button variant="secondary" size="sm" iconLeft={<Icon name="map" size={18} />} onClick={onPlanRoute}>
                    All routes &amp; maps
                  </Button>
                </div>
              </div>
            </section>
          )}
        </div>

        <p className="mf-disclaimer mf-disclaimer--result">Medifi explains and organises NHS information. It does not give medical advice. Always check against your original letter.</p>

        {shareOpen && (
          <div className="mf-sheet-scrim" onClick={() => setShareOpen(false)} role="presentation">
            <div className="mf-sheet" role="dialog" aria-modal="true" aria-labelledby="share-sheet-title" onClick={(e) => e.stopPropagation()}>
              <div className="mf-sheet__grip" aria-hidden="true"></div>
              <h3 className="mf-sheet__title" id="share-sheet-title">Send to a carer</h3>
              <p className="mf-sheet__sub">Share a plain-English summary. No medical advice — they should check the original letter.</p>
              {typeof navigator !== "undefined" && navigator.share && (
                <button type="button" className="mf-sheet__opt" onClick={shareNativeFromSheet}>
                  <Icon name="share" size={22} />
                  <span><span className="t">Share</span><span className="s">Messages, WhatsApp, email…</span></span>
                  <Icon name="arrowRight" size={18} />
                </button>
              )}
              <button type="button" className="mf-sheet__opt" onClick={shareWhatsApp}>
                <Icon name="phone" size={22} />
                <span><span className="t">WhatsApp</span><span className="s">Send the summary in a chat</span></span>
                <Icon name="arrowRight" size={18} />
              </button>
              <button type="button" className="mf-sheet__opt" onClick={shareEmail}>
                <Icon name="file" size={22} />
                <span><span className="t">Email</span><span className="s">Opens your mail app with the summary</span></span>
                <Icon name="arrowRight" size={18} />
              </button>
              <button type="button" className="mf-sheet__opt" onClick={copyForCarer}>
                <Icon name="check" size={22} />
                <span><span className="t">Copy summary</span><span className="s">Paste into any app</span></span>
                <Icon name="arrowRight" size={18} />
              </button>
              <button type="button" className="mf-sheet__cancel" onClick={() => setShareOpen(false)}>Cancel</button>
            </div>
          </div>
        )}

        {toast && (
          <div className="mf-toast">
            <Icon name="check" size={18} />
            <span>{toastMsg || "Done."}</span>
          </div>
        )}
      </div>
    );
  }
  window.ResultScreen = ResultScreen;
})();
