/* Medifi — Home screen. Greeting, the primary "scan" CTA, and the patient's
 * recent letters with a risk badge each. */
(function () {
  const { Badge, Eyebrow } = window.MedifiDesignSystem_063852;
  const Icon = window.Icon;

  const Utils = window.MedifiLetterUtils;

  function LetterRow({ letter, onOpen }) {
    const tone = Utils ? Utils.levelTone(letter.worstLevel) : "neutral";
    const text = Utils ? Utils.levelText(letter.worstLevel) : "Letter";
    return (
      <button type="button" className="mf-letter" onClick={() => onOpen(letter)}>
        <span className="mf-letter__icon"><Icon name="file" size={22} /></span>
        <span className="mf-letter__main">
          <span className="mf-letter__sender">{letter.sender}</span>
          <span className="mf-letter__head">{letter.headline}</span>
          <span className="mf-letter__received">{letter.received}</span>
        </span>
        <span className="mf-letter__end">
          <Badge tone={tone} dot>{text}</Badge>
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
    const todayLabel = new Date().toLocaleDateString("en-GB", {
      weekday: "long",
      day: "numeric",
      month: "long",
    });

    return (
      <div className="mf-screen mf-screen--home">
        <div className="mf-greet">
          <div className="mf-greet__content">
            <Eyebrow tone="accent">{todayLabel}</Eyebrow>
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
            {recent.length === 0 && (
              <p className="mf-disclaimer" style={{ textAlign: "left" }}>
                No letters yet. Tap <strong>Scan a letter</strong> above to add your first one.
              </p>
            )}
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
