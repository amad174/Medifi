import React from "react";

/**
 * RiskFlag — Medifi's signature admin-risk alert. Three levels map directly
 * to the traffic-light system: safe / caution / risk. Calm, plain-English,
 * always pairs the problem with a next step. Icons are from Lucide (ISC).
 */
function useStyleOnce(id, css) {
  React.useEffect(() => {
    if (document.getElementById(id)) return;
    const el = document.createElement("style");
    el.id = id; el.textContent = css; document.head.appendChild(el);
  }, [id, css]);
}

const ICONS = {
  safe: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10" /><path d="m9 12 2 2 4-4" />
    </svg>
  ),
  caution: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" /><path d="M12 9v4" /><path d="M12 17h.01" />
    </svg>
  ),
  risk: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 16h.01" /><path d="M12 8v4" /><path d="M15.31 2a2 2 0 0 1 1.41.59l4.69 4.68A2 2 0 0 1 22 8.69v6.62a2 2 0 0 1-.59 1.41l-4.68 4.69a2 2 0 0 1-1.41.59H8.69a2 2 0 0 1-1.41-.59l-4.69-4.68A2 2 0 0 1 2 15.31V8.69a2 2 0 0 1 .59-1.41l4.68-4.69A2 2 0 0 1 8.69 2z" />
    </svg>
  ),
};

const LABELS = { safe: "Looks fine", caution: "Check this", risk: "Needs attention" };

const CSS = `
.mf-risk{
  --_main:var(--safe);--_text:var(--safe-text);--_surf:var(--safe-surface);--_bd:var(--safe-border);
  display:flex;gap:var(--space-3);padding:var(--space-4);font-family:var(--font-sans);
  background:var(--_surf);border:1px solid var(--_bd);border-left:4px solid var(--_main);
  border-radius:var(--radius-md);
}
.mf-risk--caution{--_main:var(--caution);--_text:var(--caution-text);--_surf:var(--caution-surface);--_bd:var(--caution-border);}
.mf-risk--risk{--_main:var(--risk);--_text:var(--risk-text);--_surf:var(--risk-surface);--_bd:var(--risk-border);}
.mf-risk__icon{flex:0 0 auto;color:var(--_main);}
.mf-risk__icon svg{width:24px;height:24px;display:block;}
.mf-risk__body{min-width:0;}
.mf-risk__label{font-size:var(--text-2xs);font-weight:var(--fw-bold);letter-spacing:var(--tracking-caps);text-transform:uppercase;color:var(--_text);margin:0 0 3px;}
.mf-risk__title{font:var(--type-label);font-weight:var(--fw-semibold);color:var(--text-primary);margin:0;}
.mf-risk__text{font:var(--type-body-sm);color:var(--text-secondary);margin:5px 0 0;}
.mf-risk__action{margin-top:var(--space-3);}
`;

export function RiskFlag({ level = "safe", title, children, action, label, icon, className = "", ...rest }) {
  useStyleOnce("mf-risk-styles", CSS);
  const cls = ["mf-risk", level !== "safe" ? `mf-risk--${level}` : "", className].filter(Boolean).join(" ");
  return (
    <div className={cls} role="status" {...rest}>
      <span className="mf-risk__icon">{icon || ICONS[level]}</span>
      <div className="mf-risk__body">
        <p className="mf-risk__label">{label || LABELS[level]}</p>
        {title && <p className="mf-risk__title">{title}</p>}
        {children && <p className="mf-risk__text">{children}</p>}
        {action && <div className="mf-risk__action">{action}</div>}
      </div>
    </div>
  );
}
