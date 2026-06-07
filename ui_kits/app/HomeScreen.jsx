/* Medifi — Home screen. Greeting, the primary "scan" CTA, and the patient's
 * recent letters with a risk badge each. */
(function () {
  const { Badge, Eyebrow } = window.MedifiDesignSystem_063852;
  const Icon = window.Icon;

  const LEVEL_TONE = { safe: "safe", caution: "caution", risk: "risk" };
  const LEVEL_TEXT = { safe: "Looks fine", caution: "Check this", risk: "Needs attention" };

  function LetterRow({ letter, onOpen }) {
    return (
      <button type="button" className="mf-letter" onClick={() => onOpen(letter)}>
        <span className="mf-letter__icon"><Icon name="file" size={22} /></span>
        <span className="mf-letter__main">
          <span className="mf-letter__sender">{letter.sender}</span>
          <span className="mf-letter__head">{letter.headline}</span>
          <span className="mf-letter__received">{letter.received}</span>
        </span>
        <span className="mf-letter__end">
          <Badge tone={LEVEL_TONE[letter.worstLevel]} dot>{LEVEL_TEXT[letter.worstLevel]}</Badge>
          <Icon name="chevronRight" size={20} className="mf-letter__chev" />
        </span>
      </button>
    );
  }

  function HomeScreen({ onScan, onOpen, onSeeAll, letters, patient }) {
    const all = letters || window.MEDIFI_LETTERS || [];
    const recent = all.slice(0, 5);
    const firstName = patient && patient.name
      ? (window.MedifiPatient ? window.MedifiPatient.firstName(patient.name) : patient.name.split(" ")[0])
      : "there";
    const assets = window.MEDIFI_ASSETS || {};

    return (
      <div className="mf-screen mf-screen--home">
        <div className="mf-greet">
          {assets.brand && (
            <img
              src={assets.brand}
              alt="Medifi — always putting patients first"
              className="mf-brand-lockup mf-brand-lockup--greet"
            />
          )}
          <div className="mf-greet__content">
            <Eyebrow tone="accent">Tuesday 6 June</Eyebrow>
            <h1 className="mf-greet__h">Hi {firstName}</h1>
            <p className="mf-greet__sub">Photograph or paste an NHS letter and Medifi will turn it into a clear plan.</p>
          </div>
        </div>

        <button type="button" className="mf-cta" onClick={onScan}>
          <span className="mf-cta__icon"><Icon name="scan" size={26} /></span>
          <span className="mf-cta__text">
            <span className="mf-cta__title">Scan a letter</span>
            <span className="mf-cta__sub">Take a photo or paste the text</span>
          </span>
          <Icon name="arrowRight" size={22} />
        </button>

        <div className="mf-section">
          <p className="mf-section__label">
            Your letters
            <button type="button" className="mf-seeall" onClick={onSeeAll}>See all</button>
          </p>
          <div className="mf-list mf-list--letters">
            {recent.map((l) => (
              <LetterRow key={l.id} letter={l} onOpen={onOpen} />
            ))}
          </div>
        </div>
      </div>
    );
  }
  window.HomeScreen = HomeScreen;
})();
