/* Medifi — Letters screen. Browse and filter all processed letters. */
(function () {
  const { Badge } = window.MedifiDesignSystem_063852;
  const Icon = window.Icon;
  const RISK_LABELS = { safe: "Looks fine", caution: "Check this", risk: "Needs attention" };
  const TONE = { safe: "safe", caution: "caution", risk: "risk" };

  function Row({ letter, onOpen }) {
    return (
      <button type="button" className="mf-letter" onClick={() => onOpen(letter)}>
        <span className="mf-letter__icon"><Icon name="file" size={22} /></span>
        <span className="mf-letter__main">
          <span className="mf-letter__sender">{letter.sender}</span>
          <span className="mf-letter__head">{letter.headline}</span>
          <span className="mf-letter__received">{letter.received}</span>
        </span>
        <span className="mf-letter__end">
          <Badge tone={TONE[letter.worstLevel]} dot>{RISK_LABELS[letter.worstLevel]}</Badge>
          <Icon name="chevronRight" size={20} className="mf-letter__chev" />
        </span>
      </button>
    );
  }

  function LettersScreen({ onOpen, letters }) {
    const [filter, setFilter] = React.useState("all");
    const all = letters || window.MEDIFI_LETTERS || [];
    const list = filter === "review" ? all.filter((l) => l.worstLevel !== "safe") : all;
    const reviewCount = all.filter((l) => l.worstLevel === "risk").length;

    return (
      <div className="mf-screen">
        <div className="mf-chips">
          <button type="button" className={"mf-chip" + (filter === "all" ? " mf-chip--on" : "")} onClick={() => setFilter("all")}>
            All letters ({all.length})
          </button>
          <button type="button" className={"mf-chip" + (filter === "review" ? " mf-chip--on" : "")} onClick={() => setFilter("review")}>
            To review
          </button>
        </div>

        {reviewCount > 0 && (
          <div className="mf-banner">
            <Icon name="alert" size={20} />
            <span><strong>{reviewCount} letter needs attention.</strong> Open it to see what to check.</span>
          </div>
        )}

        <div className="mf-list mf-list--letters">
          {list.length === 0 && (
            <p className="mf-disclaimer" style={{ textAlign: "left" }}>No letters yet. Scan a letter from Home to add one here.</p>
          )}
          {list.map((l) => (
            <Row key={l.id} letter={l} onOpen={onOpen} />
          ))}
        </div>
      </div>
    );
  }
  window.LettersScreen = LettersScreen;
})();
