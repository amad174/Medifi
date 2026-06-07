/* Medifi — Check In screen: symptom chat via Anthropic API */
(function () {
  const Icon = window.Icon;

  const SYSTEM_PROMPT = `You are Medifi's health guide — a warm, knowledgeable, and honest health assistant built into an NHS support app.

Your role:
- Listen carefully to the patient's symptoms and concerns.
- Give practical, clear, self-care advice first — most issues can be managed at home.
- Only suggest seeing a GP when there are genuine red flag symptoms or the issue has persisted for an appropriate time.
- NEVER catastrophise. Be reassuring and measured.
- If something could be a genuine emergency (chest pain, difficulty breathing, stroke symptoms), clearly say call 999.
- Keep responses concise — 3 to 5 sentences max unless the patient asks for more detail.
- Do not diagnose. Frame everything as guidance, not diagnosis.
- End each response with a gentle follow-up question to understand more if needed.`;

  function ChatBubble({ msg }) {
    const isUser = msg.role === "user";
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: isUser ? 'flex-end' : 'flex-start', gap: 4 }}>
        <div style={{
          maxWidth: '82%', padding: '11px 14px',
          borderRadius: isUser ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
          background: isUser ? 'var(--brand)' : 'var(--surface-card)',
          border: isUser ? 'none' : '1px solid var(--border-default)',
          color: isUser ? '#fff' : 'var(--text-primary)',
          fontSize: 15, lineHeight: 1.55, boxShadow: 'var(--shadow-xs)'
        }}>
          {msg.content}
        </div>
      </div>
    );
  }

  function TypingIndicator() {
    return (
      <div style={{ display: 'flex', alignItems: 'flex-start' }}>
        <div style={{
          padding: '12px 16px', borderRadius: '18px 18px 18px 4px',
          background: 'var(--surface-card)', border: '1px solid var(--border-default)',
          display: 'flex', gap: 5, alignItems: 'center'
        }}>
          {[0, 1, 2].map(i => (
            <div key={i} style={{
              width: 7, height: 7, borderRadius: '50%', background: 'var(--text-muted)',
              animation: `mf-bounce 1.2s ease-in-out ${i * 0.2}s infinite`
            }} />
          ))}
        </div>
      </div>
    );
  }

  function CheckInScreen() {
    const [messages, setMessages] = React.useState([{
      role: "assistant",
      content: "Hi! I'm your Medifi health guide. What symptoms or health concerns can I help you with today?"
    }]);
    const [input, setInput] = React.useState("");
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState("");
    const bottomRef = React.useRef(null);

    React.useEffect(() => {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, loading]);

    async function send() {
      const text = input.trim();
      if (!text || loading) return;
      setInput("");
      setError("");
      const newMessages = [...messages, { role: "user", content: text }];
      setMessages(newMessages);
      setLoading(true);
      try {
        const res = await fetch("https://api.z.ai/api/paas/v4/chat/completions", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
   "Authorization": "Bearer sk-"
  },
  body: JSON.stringify({
    model: "glm-4.5-air",
    max_tokens: 1000,
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      ...newMessages.map(m => ({ role: m.role, content: m.content }))
    ]
  })
});
if (!res.ok) throw new Error("Something went wrong. Please try again.");
const data = await res.json();
const reply = data.choices?.[0]?.message?.content || "Sorry, I couldn't get a response.";
setMessages(prev => [...prev, { role: "assistant", content: reply }]);
      } catch (err) {
        setError(err.message || "Network error. Please try again.");
      }
      setLoading(false);
    }

    function handleKey(e) {
      if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); }
    }

    return (
      <div className="mf-screen" style={{ gap: 0 }}>
        <style>{`
          @keyframes mf-bounce {
            0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
            40% { transform: scale(1); opacity: 1; }
          }
        `}</style>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12, paddingBottom: 16 }}>
          {messages.map((m, i) => <ChatBubble key={i} msg={m} />)}
          {loading && <TypingIndicator />}
          {error && (
            <div style={{
              fontSize: 13, color: 'var(--risk-text)', background: 'var(--risk-surface)',
              border: '1px solid var(--risk-border)', borderRadius: 'var(--radius-sm)', padding: '10px 12px'
            }}>{error}</div>
          )}
          <div ref={bottomRef} />
        </div>

        <div style={{
          position: 'sticky', bottom: 0, background: 'rgba(255,255,255,0.95)',
          backdropFilter: 'blur(12px)', borderTop: '1px solid var(--border-subtle)',
          padding: '12px 0 20px', display: 'flex', gap: 10, alignItems: 'flex-end'
        }}>
          <textarea rows={1} value={input} onChange={e => setInput(e.target.value)}
            onKeyDown={handleKey} placeholder="Describe your symptoms or concern…"
            style={{
              flex: 1, padding: '11px 14px', fontSize: 15, resize: 'none',
              border: '1.5px solid var(--border-strong)', borderRadius: 'var(--radius-md)',
              fontFamily: 'var(--font-sans)', background: 'var(--surface-card)',
              color: 'var(--text-primary)', outline: 'none', lineHeight: 1.5,
              maxHeight: 120, overflowY: 'auto'
            }}
          />
          <button type="button" onClick={send} disabled={!input.trim() || loading}
            style={{
              width: 44, height: 44, borderRadius: '50%', border: 'none', flexShrink: 0,
              background: input.trim() && !loading ? 'var(--brand)' : 'var(--border-strong)',
              color: '#fff', cursor: input.trim() && !loading ? 'pointer' : 'default',
              display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.15s'
            }}>
            <Icon name="arrowRight" size={20} />
          </button>
        </div>

        <p className="mf-disclaimer" style={{ paddingBottom: 8 }}>
          Not a diagnosis. For emergencies call <strong>999</strong>. For urgent care call <strong>111</strong>.
        </p>
      </div>
    );
  }

  window.CheckInScreen = CheckInScreen;
})();