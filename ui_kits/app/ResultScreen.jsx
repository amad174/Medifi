/* Medifi — Result screen. The action plan: hero, risk alerts (signature),
 * plain-English summary, extracted fields, checklist, and tools. */
(function () {
  const { Button, Badge, Card, CardHeader, Eyebrow, RiskFlag, ChecklistItem, FieldRow, Input } =
    window.MedifiDesignSystem_063852;
  const Icon = window.Icon;

  const LANGS = ["English", "Urdu", "Bengali", "Polish", "Arabic", "Somali"];
  const LEVEL_TONE = { safe: "safe", caution: "caution", risk: "risk" };

  function ResultScreen({ letter, onAddReminders }) {
    const [done, setDone] = React.useState({});
    const [showOriginal, setShowOriginal] = React.useState(false);
    const [lang, setLang] = React.useState("English");
    const [langOpen, setLangOpen] = React.useState(false);
    const [q, setQ] = React.useState("");
    const [asked, setAsked] = React.useState(false);
    const [answer, setAnswer] = React.useState("");
    const [asking, setAsking] = React.useState(false);
    const [askError, setAskError] = React.useState("");
    const [toast, setToast] = React.useState(false);
    const toggle = (id) => setDone((d) => ({ ...d, [id]: !d[id] }));

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

    function shareCarer() {
      setToast(true);
      window.clearTimeout(shareCarer._t);
      shareCarer._t = window.setTimeout(() => setToast(false), 2800);
    }

    const riskCount = letter.risks.filter((r) => r.level !== "safe").length;

    return (
      <div className="mf-screen mf-screen--result">
        {/* Hero */}
        <div className="mf-hero">
          <Eyebrow tone="accent">Your plan</Eyebrow>
          <h1 className="mf-hero__h">{letter.headline}</h1>
          <div className="mf-hero__when">
            <Icon name="clock" size={18} />
            <span>{letter.when}</span>
          </div>
        </div>

        {/* Translate banner */}
        {lang !== "English" && (
          <div className="mf-xlate-note">
            <Icon name="languages" size={16} />
            <span>Showing a supportive {lang} summary. Your original English letter is the source of truth.</span>
          </div>
        )}

        <div className="mf-result-grid">
          <div className="mf-result-grid__main">
            {/* Risk alerts — the signature feature, near the top */}
            <div className="mf-section">
              <p className="mf-section__label">
                What to check
                {riskCount > 0 && <Badge tone={LEVEL_TONE[letter.worstLevel]}>{riskCount} to review</Badge>}
              </p>
              <div className="mf-stack">
                {letter.risks.map((r, i) => (
                  <RiskFlag key={i} level={r.level} title={r.title}
                    action={r.level === "risk" ? <Button variant="danger" size="sm" iconLeft={<Icon name="phone" size={16} />}>Call to check</Button> : null}>
                    {r.text}
                  </RiskFlag>
                ))}
              </div>
            </div>

            {/* Plain-English summary */}
            <div className="mf-section">
              <p className="mf-section__label">In plain English</p>
              <Card variant="accent">
                <p className="mf-summary">{letter.summary}</p>
              </Card>
            </div>

            {/* Extracted details */}
            <div className="mf-section">
              <p className="mf-section__label">The details Medifi found</p>
              <Card>
                {letter.fields.map((f, i) => (
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
            {/* Action checklist */}
            <div className="mf-section">
              <p className="mf-section__label">What to do next</p>
              <div className="mf-stack">
                {letter.checklist.map((c) => (
                  <ChecklistItem key={c.id} label={c.label} meta={c.meta}
                    icon={<Icon name={c.icon} size={20} />}
                    done={!!done[c.id]} onToggle={() => toggle(c.id)} />
                ))}
              </div>
            </div>

            {/* Ask a question about this letter */}
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

            {/* Medicine reminders */}
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

            {/* Tools */}
            <div className="mf-tools">
              <button type="button" className="mf-tool" onClick={() => setLangOpen((o) => !o)}>
                <Icon name="languages" size={20} /><span>{lang === "English" ? "Translate" : lang}</span>
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
                    onClick={() => { setLang(l); setLangOpen(false); }}>{l}</button>
                ))}
              </div>
            )}
          </div>
        </div>

        <p className="mf-disclaimer">Medifi explains and organises NHS information. It does not give medical advice. Always check against your original letter.</p>

        {toast && (
          <div className="mf-toast">
            <Icon name="check" size={18} />
            <span>Summary sent to your carer.</span>
          </div>
        )}
      </div>
    );
  }
  window.ResultScreen = ResultScreen;
})();
