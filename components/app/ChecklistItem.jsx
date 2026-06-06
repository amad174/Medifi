import React from "react";

/** ChecklistItem — a single action in the patient's plan. Checkable. */
function useStyleOnce(id, css) {
  React.useEffect(() => {
    if (document.getElementById(id)) return;
    const el = document.createElement("style");
    el.id = id; el.textContent = css; document.head.appendChild(el);
  }, [id, css]);
}

const CSS = `
.mf-check{
  display:flex;align-items:flex-start;gap:var(--space-3);width:100%;
  text-align:left;background:var(--surface-card);border:1px solid var(--border-default);
  border-radius:var(--radius-md);padding:var(--space-4);font-family:var(--font-sans);
  cursor:pointer;min-height:var(--tap-min);
  transition:border-color var(--dur-fast) var(--ease-standard),background var(--dur-fast) var(--ease-standard);
}
.mf-check:hover{border-color:var(--border-strong);}
.mf-check:focus-visible{outline:none;box-shadow:var(--focus-ring);}
.mf-check__box{
  flex:0 0 auto;width:26px;height:26px;border-radius:8px;margin-top:1px;
  border:2px solid var(--border-strong);background:var(--surface-card);
  display:flex;align-items:center;justify-content:center;color:#fff;
  transition:background var(--dur-fast),border-color var(--dur-fast);
}
.mf-check__box svg{width:16px;height:16px;opacity:0;}
.mf-check__main{min-width:0;display:flex;flex-direction:column;gap:2px;}
.mf-check__label{font:var(--type-body);font-weight:var(--fw-medium);color:var(--text-primary);margin:0;}
.mf-check__meta{font:var(--type-body-sm);color:var(--text-secondary);margin:3px 0 0;}
.mf-check__icon{flex:0 0 auto;color:var(--text-muted);margin-top:2px;}
.mf-check__icon svg{width:20px;height:20px;display:block;}
.mf-check--done{background:var(--safe-surface);border-color:var(--safe-border);}
.mf-check--done .mf-check__box{background:var(--safe);border-color:var(--safe);}
.mf-check--done .mf-check__box svg{opacity:1;}
.mf-check--done .mf-check__label{color:var(--safe-text);text-decoration:line-through;text-decoration-color:var(--green-100);}
`;

const TICK = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m5 12 5 5 9-10" /></svg>
);

export function ChecklistItem({ label, meta, icon, done = false, onToggle, className = "", ...rest }) {
  useStyleOnce("mf-check-styles", CSS);
  const cls = ["mf-check", done ? "mf-check--done" : "", className].filter(Boolean).join(" ");
  return (
    <button type="button" className={cls} aria-pressed={done} onClick={onToggle} {...rest}>
      <span className="mf-check__box">{TICK}</span>
      <span className="mf-check__main">
        <span className="mf-check__label">{label}</span>
        {meta && <span className="mf-check__meta">{meta}</span>}
      </span>
      {icon && <span className="mf-check__icon">{icon}</span>}
    </button>
  );
}
