/* Medifi — Letters screen. Browse and filter all processed letters. */
(function () {
  const { Badge } = window.MedifiDesignSystem_063852;
  const Icon = window.Icon;
  const Utils = window.MedifiLetterUtils;

  function Row({ letter, onOpen }) {
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

  function LettersScreen({ onOpen, letters }) {
    const [filter, setFilter] = React.useState("all");
    const all = letters || window.MEDIFI_LETTERS || [];
    const needsReview = all.filter(function (l) { return l.worstLevel !== "safe"; });
    const list = filter === "review" ? needsReview : all;
    const reviewCount = needsReview.length;
    const urgentCount = all.filter(function (l) { return l.worstLevel === "risk"; }).length;

    var emptyMsg = "No letters yet. Scan a letter from Home to add one here.";
    if (filter === "review" && all.length > 0) {
      emptyMsg = "No letters need review right now — everything looks fine.";
    }

    return (
      <div className="mf-screen">
        <div className="mf-chips">
          <button type="button" className={"mf-chip" + (filter === "all" ? " mf-chip--on" : "")} onClick={() => setFilter("all")} aria-pressed={filter === "all"}>
            All letters ({all.length})
          </button>
          <button type="button" className={"mf-chip" + (filter === "review" ? " mf-chip--on" : "")} onClick={() => setFilter("review")} aria-pressed={filter === "review"}>
            To review{reviewCount > 0 ? " (" + reviewCount + ")" : ""}
          </button>
        </div>

        {urgentCount > 0 && filter === "all" && (
          <div className="mf-banner">
            <Icon name="alert" size={20} />
            <span>
              <strong>{urgentCount === 1 ? "1 letter needs" : urgentCount + " letters need"} urgent attention.</strong>
              {" "}Open {urgentCount === 1 ? "it" : "them"} to see what to check.
            </span>
          </div>
        )}

        <div className="mf-list mf-list--letters">
          {list.length === 0 && (
            <p className="mf-disclaimer" style={{ textAlign: "left" }}>{emptyMsg}</p>
          )}
          {list.map((l) => <Row key={l.id} letter={l} onOpen={onOpen} />)}
        </div>
      </div>
    );
  }
  window.LettersScreen = LettersScreen;
})();
