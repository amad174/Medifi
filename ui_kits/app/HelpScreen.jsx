/* Medifi — Help & support screen. Interactive FAQ + contact options. */
(function () {
  const Icon = window.Icon;

  const FAQS = [
    { q: "Is Medifi an NHS service?",
      a: "No. Medifi is an independent tool that helps you understand NHS letters. Your original letter from the NHS is always the source of truth." },
    { q: "How accurate is the summary?",
      a: "Medifi is usually very good at pulling out dates, places and contacts — but it can make mistakes. Always check the summary against your original letter, which you can open any time with “Show original letter.”" },
    { q: "What do the colours mean?",
      a: "Green means a detail looks fine. Amber means something is unclear or missing and worth a check. Red means something may be wrong — like a date that has already passed — and you should act soon." },
    { q: "Is my information private?",
      a: "Your letters stay on your device for this demo. Medifi never shares your information without your say-so." },
    { q: "Can I read this in another language?",
      a: "Yes — open a letter and tap Translate. Translated summaries are there to support you; the original English letter remains the source of truth." },
    { q: "How do transport routes work?",
      a: "When your letter includes a clinic or hospital, Medifi suggests bus, tube, and driving options with a suggested leave-by time. Open Google Maps or Apple Maps for turn-by-turn directions. Routes are a guide — always check the address on your original letter." },
  ];

  function FaqItem({ item, open, onToggle }) {
    return (
      <div className={"mf-faq" + (open ? " mf-faq--open" : "")}>
        <button type="button" className="mf-faq__q" onClick={onToggle} aria-expanded={open}>
          <span>{item.q}</span>
          <Icon name={open ? "x" : "plus"} size={18} />
        </button>
        {open && <p className="mf-faq__a">{item.a}</p>}
      </div>
    );
  }

  function HelpScreen() {
    const [open, setOpen] = React.useState(0);
    const assets = window.MEDIFI_ASSETS || {};
    return (
      <div className="mf-screen">
        <div className="mf-help-hero">
          {assets.brand && (
            <img
              src={assets.brand}
              alt="Medifi — always putting patients first"
              className="mf-brand-lockup mf-brand-lockup--help"
            />
          )}
          {assets.nhsTeam && (
            <img src={assets.nhsTeam} alt="NHS care team" className="mf-help-hero__team" />
          )}
          <div className="mf-help-hero__text">
            <h2 className="mf-help-hero__h">Help understanding your NHS letters</h2>
            <p className="mf-help-hero__sub">Medifi works alongside your GP and hospital team — your original letter is always the source of truth.</p>
          </div>
        </div>

        <div className="mf-section">
          <p className="mf-section__label">Common questions</p>
          <div className="mf-stack">
            {FAQS.map((f, i) => (
              <FaqItem key={i} item={f} open={open === i} onToggle={() => setOpen(open === i ? -1 : i)} />
            ))}
          </div>
        </div>

        <div className="mf-section">
          <p className="mf-section__label">Get help now</p>
          {assets.doctorPortrait && (
            <div className="mf-help-doctor">
              <img src={assets.doctorPortrait} alt="" className="mf-help-doctor__img" aria-hidden="true" />
              <p className="mf-help-doctor__note">For urgent medical concerns, contact a clinician directly — Medifi cannot give medical advice.</p>
            </div>
          )}
          <div className="mf-list">
            <a className="mf-contact" href="tel:111">
              <span className="mf-contact__icon mf-contact__icon--urgent"><Icon name="phone" size={20} /></span>
              <span className="mf-contact__main"><span className="t">Call 111</span><span className="s">Urgent but not an emergency</span></span>
              <Icon name="chevronRight" size={20} />
            </a>
            <a className="mf-contact" href="tel:999">
              <span className="mf-contact__icon mf-contact__icon--emergency"><Icon name="alert" size={20} /></span>
              <span className="mf-contact__main"><span className="t">Call 999</span><span className="s">Life-threatening emergency</span></span>
              <Icon name="chevronRight" size={20} />
            </a>
            <a className="mf-contact" href="https://www.nhs.uk/service-search" target="_blank" rel="noopener">
              <span className="mf-contact__icon"><Icon name="pin" size={20} /></span>
              <span className="mf-contact__main"><span className="t">Find your GP or service</span><span className="s">On nhs.uk</span></span>
              <Icon name="chevronRight" size={20} />
            </a>
          </div>
        </div>

        {assets.brand && (
          <img
            src={assets.brand}
            alt="Medifi — always putting patients first"
            className="mf-brand-lockup mf-brand-lockup--footer"
          />
        )}
        <p className="mf-disclaimer">Medifi does not give medical advice. For health concerns, contact your GP, 111, or 999 in an emergency.</p>
      </div>
    );
  }
  window.HelpScreen = HelpScreen;
})();
