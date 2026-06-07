/* Medifi — right-side AI assistant (letters + general health guide). */
(function () {
  const { Button, Input } = window.MedifiDesignSystem_063852;
  const Icon = window.Icon;

  const SUGGESTIONS = {
    letters: [
      "What appointments do I have coming up?",
      "Which letters need my attention?",
      "Summarise all my letters in plain English",
    ],
    health: [
      "How do I prepare for a hospital appointment?",
      "What should I ask my GP about my results?",
      "Tips for managing stress before a medical visit",
    ],
  };

  function ChatPanel({ letters, currentLetter, patient, open, onToggle, docked }) {
    const [mode, setMode] = React.useState("letters");
    const [messages, setMessages] = React.useState([]);
    const [input, setInput] = React.useState("");
    const [busy, setBusy] = React.useState(false);
    const [error, setError] = React.useState("");
    const scrollRef = React.useRef(null);

    const savedLetters = React.useMemo(function () {
      return (letters || []).filter(function (l) {
        return l && (l.fromLLM || l.fromUpload || String(l.id || "").startsWith("llm-")
          || String(l.id || "").startsWith("scanned-") || l.savedAt);
      }).slice(0, 20);
    }, [letters]);

    React.useEffect(function () {
      if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }
    }, [messages, busy, open]);

    function switchMode(next) {
      setMode(next);
      setError("");
    }

    async function send(text) {
      const q = (text || input || "").trim();
      if (!q || busy) return;
      if (!window.MedifiLLM) {
        setError("AI is not available. Start the server with your API key in .env.");
        return;
      }

      setInput("");
      setError("");
      const userMsg = { role: "user", content: q };
      const nextMessages = messages.concat([userMsg]);
      setMessages(nextMessages);
      setBusy(true);

      try {
        const health = window.MedifiHealth ? window.MedifiHealth.loadProfile() : null;
        const answer = await window.MedifiLLM.chatAssistant({
          mode: mode,
          question: q,
          letters: savedLetters,
          currentLetterId: currentLetter && currentLetter.id,
          patient: patient,
          health: health,
          history: messages,
        });
        setMessages(nextMessages.concat([{ role: "assistant", content: answer }]));
      } catch (err) {
        setError(err.message || "Could not get a reply.");
      } finally {
        setBusy(false);
      }
    }

    function clearChat() {
      setMessages([]);
      setError("");
    }

    const panel = (
      <div className={"mf-chat" + (docked ? " mf-chat--dock" : "")}>
        <div className="mf-chat__head">
          <div className="mf-chat__title">
            {window.MEDIFI_ASSETS && window.MEDIFI_ASSETS.cat ? (
              <img src={window.MEDIFI_ASSETS.cat} alt="" className="mf-chat__mascot" aria-hidden="true" />
            ) : (
              <Icon name="sparkle" size={20} />
            )}
            <span>Medifi assistant</span>
          </div>
          <div className="mf-chat__head-actions">
            {messages.length > 0 && (
              <button type="button" className="mf-chat__iconbtn" onClick={clearChat} aria-label="Clear chat">
                Clear
              </button>
            )}
            {!docked && (
              <button type="button" className="mf-chat__iconbtn" onClick={onToggle} aria-label="Close chat">
                <Icon name="x" size={20} />
              </button>
            )}
          </div>
        </div>

        <div className="mf-chat__modes">
          <button
            type="button"
            className={"mf-chip" + (mode === "letters" ? " mf-chip--on" : "")}
            onClick={() => switchMode("letters")}
          >
            My letters
          </button>
          <button
            type="button"
            className={"mf-chip" + (mode === "health" ? " mf-chip--on" : "")}
            onClick={() => switchMode("health")}
          >
            Health guide
          </button>
        </div>

        <p className="mf-chat__hint">
          {mode === "letters"
            ? savedLetters.length
              ? "Ask about your " + savedLetters.length + " saved letter" + (savedLetters.length === 1 ? "" : "s") + "."
              : "Scan a letter first — then ask questions about it here."
            : "General NHS-aware guidance — not a diagnosis."}
        </p>

        <div className="mf-chat__messages" ref={scrollRef}>
          {messages.length === 0 && !busy && (
            <div className="mf-chat__starters">
              {(SUGGESTIONS[mode] || []).map(function (s) {
                return (
                  <button key={s} type="button" className="mf-chat__starter" onClick={() => send(s)}>
                    {s}
                  </button>
                );
              })}
            </div>
          )}
          {messages.map(function (m, i) {
            return (
              <div key={i} className={"mf-chat__msg mf-chat__msg--" + m.role}>
                {m.role === "assistant" && <Icon name="sparkle" size={16} />}
                <p>{m.content}</p>
              </div>
            );
          })}
          {busy && (
            <div className="mf-chat__msg mf-chat__msg--assistant mf-chat__msg--typing">
              <Icon name="sparkle" size={16} />
              <span>Thinking…</span>
            </div>
          )}
        </div>

        {error && (
          <div className="mf-chat__error">
            <Icon name="alert" size={16} />
            <span>{error}</span>
          </div>
        )}

        <div className="mf-chat__composer">
          <Input
            id="medifi-chat-input"
            label=""
            placeholder={mode === "letters" ? "Ask about your letters…" : "Ask a health question…"}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send();
              }
            }}
          />
          <Button
            variant="primary"
            size="md"
            onClick={() => send()}
            disabled={!input.trim() || busy}
            aria-label="Send message"
          >
            <Icon name="arrowRight" size={18} />
          </Button>
        </div>
        <p className="mf-chat__disclaimer">Not medical advice. For emergencies call 999.</p>
      </div>
    );

    if (docked) {
      return <aside className="mf-chat-aside" aria-label="Medifi assistant">{panel}</aside>;
    }

    return (
      <React.Fragment>
        <button
          type="button"
          className={"mf-chat-fab" + (open ? " mf-chat-fab--hidden" : "")}
          onClick={onToggle}
          aria-label="Open Medifi assistant"
        >
          <Icon name="sparkle" size={22} />
          <span>Ask Medifi</span>
        </button>
        {open && (
          <div className="mf-chat-scrim" onClick={onToggle} role="presentation">
            <div className="mf-chat-drawer" onClick={(e) => e.stopPropagation()} role="dialog" aria-label="Medifi assistant">
              {panel}
            </div>
          </div>
        )}
      </React.Fragment>
    );
  }

  window.ChatPanel = ChatPanel;
})();
