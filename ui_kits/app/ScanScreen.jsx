/* Medifi — Scan/Paste screen. Choose photo (camera + OCR mockup) or paste;
 * or pick a sample letter, then "Make my plan". */
(function () {
  const { Button, Input } = window.MedifiDesignSystem_063852;
  const Icon = window.Icon;

  // A styled fake NHS letter shown inside the viewfinder (no real data, no image).
  function PaperLetter() {
    const l = window.MEDIFI_LETTERS[0];
    return (
      <div className="mf-cam__paper">
        <h5>St Thomas' Hospital</h5>
        <pre>{l.original}</pre>
      </div>
    );
  }

  function CameraView({ onCancel, onCapture, reading }) {
    return (
      <div className="mf-cam">
        <div className="mf-cam__top">
          <button type="button" className="mf-cam__btn" aria-label="Cancel" onClick={onCancel} disabled={reading}>
            <Icon name="x" size={22} />
          </button>
          <span className="t">{reading ? "Reading…" : "Scan a letter"}</span>
          <span style={{ width: 40 }} />
        </div>

        <div className="mf-cam__view">
          <PaperLetter />
          <div className="mf-cam__frame"><span></span><span></span><span></span><span></span></div>
          {reading
            ? <div className="mf-scanline"></div>
            : <p className="mf-cam__hint">Line up the whole letter inside the frame</p>}
          {reading && (
            <div className="mf-cam__reading">
              <p className="t">Reading your letter…</p>
              <p className="s">Finding the date, place, and what to do next.</p>
            </div>
          )}
        </div>

        <div className="mf-cam__bar">
          {!reading && (
            <button type="button" className="mf-cam__shutter" aria-label="Take photo" onClick={onCapture}></button>
          )}
        </div>
      </div>
    );
  }

  function ScanScreen({ onAnalyze }) {
    const [text, setText] = React.useState("");
    const [picked, setPicked] = React.useState(null);
    const [mode, setMode] = React.useState("form"); // form | camera | reading

    function pickSample(letter) { setText(letter.original); setPicked(letter); }
    function analyze() { onAnalyze(picked || window.MEDIFI_LETTERS[0]); }

    function capture() {
      setMode("reading");
      window.setTimeout(() => onAnalyze(window.MEDIFI_LETTERS[0], true), 1800);
    }

    if (mode !== "form") {
      return <CameraView reading={mode === "reading"} onCancel={() => setMode("form")} onCapture={capture} />;
    }

    return (
      <div className="mf-screen">
        <div className="mf-tiles">
          <button type="button" className="mf-tile" onClick={() => setMode("camera")}>
            <span className="mf-tile__icon"><Icon name="camera" size={26} /></span>
            <span className="mf-tile__t">Take a photo</span>
            <span className="mf-tile__s">Use your camera</span>
          </button>
          <button type="button" className="mf-tile mf-tile--alt" onClick={() => document.getElementById("mf-paste")?.focus()}>
            <span className="mf-tile__icon"><Icon name="file" size={26} /></span>
            <span className="mf-tile__t">Paste text</span>
            <span className="mf-tile__s">From a message or email</span>
          </button>
        </div>

        <div className="mf-section">
          <p className="mf-section__label">Or try a sample letter</p>
          <div className="mf-chips">
            {window.MEDIFI_LETTERS.map((l) => (
              <button key={l.id} type="button"
                className={"mf-chip" + (picked && picked.id === l.id ? " mf-chip--on" : "")}
                onClick={() => pickSample(l)}>
                {l.chip}
              </button>
            ))}
          </div>
        </div>

        <div className="mf-paste-wrap">
          <Input id="mf-paste" multiline label="Letter text"
            placeholder="Paste the words from your NHS letter, text message, or email here…"
            value={text} onChange={(e) => { setText(e.target.value); setPicked(null); }} />
        </div>

        <Button variant="primary" size="lg" fullWidth disabled={!text.trim()}
          iconLeft={<Icon name="sparkle" size={20} />} onClick={analyze}>
          Make my plan
        </Button>
        <p className="mf-disclaimer">Medifi helps you understand and organise letters. Always check against your original letter.</p>
      </div>
    );
  }
  window.ScanScreen = ScanScreen;
})();
