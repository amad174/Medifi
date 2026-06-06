/* Medifi — Result screen. The action plan: hero, risk alerts (signature),
 * plain-English summary, extracted fields, checklist, and tools. */
(function () {
  const { Button, Badge, Card, CardHeader, Eyebrow, RiskFlag, ChecklistItem, FieldRow, Input } =
    window.MedifiDesignSystem_063852;
  const Icon = window.Icon;

  const LANGS = ["English", "Urdu", "Bengali", "Polish", "Arabic", "Somali"];
  const RTL_LANGS = new Set(["Urdu", "Arabic"]);
  const LEVEL_TONE = { safe: "safe", caution: "caution", risk: "risk" };

  function ResultScreen({ letter, onAddReminders }) {
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
    const [speechError, setSpeechError] = React.useState("");
    const xlateCache = React.useRef({});
    const toggle = (id) => setDone((d) => ({ ...d, [id]: !d[id] }));

    React.useEffect(function () {
      setLang("English");
      setXlate(null);
      setXlateError("");
      setSpeechError("");
      setSpeaking(false);
      xlateCache.current = {};
      if (window.MedifiSpeech) window.MedifiSpeech.stop();
    }, [letter.id]);

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
      if (speaking || Speech.isSpeaking()) {
        Speech.stop();
        setSpeaking(false);
        return;
      }
      try {
        setSpeaking(true);
        await Speech.speakLetter(letter, xlate || letter, lang, function () {
          setSpeaking(false);
        });
      } catch (err) {
        setSpeaking(false);
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

    return (
      <div className="mf-screen mf-screen--result">
        <div className="mf-hero">
          <Eyebrow tone="accent">Your plan</Eyebrow>
          <h1 className={"mf-hero__h" + (isRtl ? " mf-rtl" : "")}>{view.headline}</h1>
          <div className="mf-hero__when">
            <Icon name="clock" size={18} />
            <span className={isRtl ? "mf-rtl" : ""}>{view.when}</span>
          </div>
        </div>

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

        <div className="mf-result-grid">
          <div className="mf-result-grid__main">
            <div className="mf-section">
              <p className="mf-section__label">
                What to check
                {riskCount > 0 && <Badge tone={LEVEL_TONE[view.worstLevel]}>{riskCount} to review</Badge>}
              </p>
              <div className="mf-stack">
                {view.risks.map((r, i) => (
                  <RiskFlag key={i} level={r.level} title={r.title}
                    action={r.level === "risk" ? <Button variant="danger" size="sm" iconLeft={<Icon name="phone" size={16} />}>Call to check</Button> : null}>
                    <span className={isRtl ? "mf-rtl" : ""}>{r.text}</span>
                  </RiskFlag>
                ))}
              </div>
            </div>

            <div className="mf-section">
              <p className="mf-section__label">{lang === "English" ? "In plain English" : "Summary"}</p>
              <Card variant="accent">
                <p className={"mf-summary" + (isRtl ? " mf-rtl" : "")}>{view.summary}</p>
                <div className="mf-listen">
                  <Button
                    variant="secondary"
                    size="sm"
                    iconLeft={<Icon name="volume" size={18} />}
                    onClick={toggleListen}
                    disabled={xlateLoading}
                  >
                    {speaking ? "Stop" : "Listen to summary"}
                  </Button>
                  {speaking && <span className="mf-listen__hint">Reading your plan aloud…</span>}
                </div>
              </Card>
              {speechError && (
                <div className="mf-banner" style={{ marginTop: 8 }}>
                  <Icon name="alert" size={18} />
                  <span>{speechError}</span>
                </div>
              )}
            </div>

            <div className="mf-section">
              <p className="mf-section__label">The details Medifi found</p>
              <Card>
                {view.fields.map((f, i) => (
                  <FieldRow key={i} label={f.label} value={f.value} missing={f.missing} />
                ))}
              </Card>
              <button type="button" className="mf-link" onClick={() => setShowOriginal((s) => !s)}>
                <Icon name="file" size={16} />
                {showOriginal ? "Hide original letter" : "Show original letter"}
              </button>
              {showOriginal && <pre className="mf-original">{letter.original}</pre>}
            </div>
          </div>

          <div className="mf-result-grid__side">
            <div className="mf-section">
              <p className="mf-section__label">What to do next</p>
              <div className="mf-stack">
                {view.checklist.map((c) => (
                  <ChecklistItem key={c.id} label={c.label} meta={c.meta}
                    icon={<Icon name={c.icon} size={20} />}
                    done={!!done[c.id]} onToggle={() => toggle(c.id)} />
                ))}
              </div>
            </div>

            <div className="mf-section">
              <p className="mf-section__label">Ask about this letter</p>
              <div className="mf-ask">
                <div className="mf-ask__row">
                  <Input placeholder="e.g. What do I need to bring?"
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
                  <div className="mf-banner">
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
            </div>

            {letter.medicines && (
              <div className="mf-section">
                <p className="mf-section__label">Medicine reminders</p>
                <div className="mf-stack">
                  {letter.medicines.map((m, i) => (
                    <div key={i} className="mf-med">
                      <span className="mf-med__icon"><Icon name="clock" size={20} /></span>
                      <div className="mf-med__main">
                        <span className="mf-med__name">{m.name}</span>
                        <span className="mf-med__note">{m.dose} · {m.note}</span>
                        <div className="mf-med__times">
                          {m.times.map((t) => <span key={t} className="mf-med__time">{t}</span>)}
                          <span className="mf-med__days">for {m.days} days</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <Button variant="secondary" fullWidth iconLeft={<Icon name="calendar" size={18} />} onClick={onAddReminders}>
                  Add reminders to my calendar
                </Button>
              </div>
            )}

            <div className="mf-tools mf-tools--3">
              <button type="button" className="mf-tool" onClick={toggleListen} disabled={xlateLoading}>
                <Icon name="volume" size={20} />
                <span>{speaking ? "Stop" : "Listen"}</span>
              </button>
              <button type="button" className="mf-tool" onClick={() => setLangOpen((o) => !o)} disabled={xlateLoading}>
                <Icon name="languages" size={20} />
                <span>{xlateLoading ? "Translating…" : (lang === "English" ? "Translate" : lang)}</span>
              </button>
              <button type="button" className="mf-tool" onClick={shareCarer}>
                <Icon name="share" size={20} /><span>Send to a carer</span>
              </button>
            </div>
            {langOpen && (
              <div className="mf-langs">
                {LANGS.map((l) => (
                  <button key={l} type="button"
                    className={"mf-chip" + (lang === l ? " mf-chip--on" : "")}
                    onClick={() => pickLanguage(l)}>{l}</button>
                ))}
              </div>
            )}
          </div>
        </div>

        <p className="mf-disclaimer">Medifi explains and organises NHS information. It does not give medical advice. Always check against your original letter.</p>

        {shareOpen && (
          <div className="mf-sheet-scrim" onClick={() => setShareOpen(false)} role="presentation">
            <div className="mf-sheet" role="dialog" aria-labelledby="share-sheet-title" onClick={(e) => e.stopPropagation()}>
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
