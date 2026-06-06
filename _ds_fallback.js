/* ---------------------------------------------------------------------------
 * _ds_fallback.js  —  Medifi Design System runtime FALLBACK
 *
 * The compiler emits the canonical bundle at _ds_bundle.js and serves it inside
 * the Design System tab. When a card or UI-kit HTML is opened as a RAW FILE
 * (outside that tab), _ds_bundle.js is not served, so window.MedifiDesignSystem_*
 * stays undefined and every screen blanks out.
 *
 * This file rebuilds the same namespace from the component sources so raw
 * previews render. It is GUARDED: if the real bundle already populated the
 * namespace, it does nothing. Load it as <script type="text/babel"> AFTER the
 * <script src=".../_ds_bundle.js"> line and BEFORE any screen scripts.
 *
 * Regenerate this file whenever components change (it is hand-built, not
 * compiler-generated).
 * ------------------------------------------------------------------------- */
(function () {
  var ns = window.MedifiDesignSystem_063852;
  if (ns && ns.Button && ns.RiskFlag) return; // real bundle is present
  window.__mf = window.__mf || {};

// components/core/Button.jsx
(function(){

/**
 * Medifi Button — primary action control.
 * Self-contained: injects its own scoped styles once, reads brand tokens
 * from CSS_1 custom properties. No external deps.
 */
function useStyleOnce_1(id, css) {
  React.useEffect(() => {
    if (document.getElementById(id)) return;
    const el = document.createElement("style");
    el.id = id;
    el.textContent = css;
    document.head.appendChild(el);
  }, [id, css]);
}

const CSS_1 = `
.mf-btn{
  --_bg:var(--brand);--_fg:var(--text-on-brand);--_bd:transparent;
  display:inline-flex;align-items:center;justify-content:center;gap:.5em;
  font-family:var(--font-sans);font-weight:var(--fw-semibold);
  border:1.5px solid var(--_bd);background:var(--_bg);color:var(--_fg);
  border-radius:var(--radius-md);cursor:pointer;text-decoration:none;
  line-height:1;white-space:nowrap;
  transition:background var(--dur-fast) var(--ease-standard),
             border-color var(--dur-fast) var(--ease-standard),
             color var(--dur-fast) var(--ease-standard);
}
.mf-btn:focus-visible{outline:none;box-shadow:var(--focus-ring);}
.mf-btn--md{min-height:48px;padding:0 var(--space-5);font-size:var(--text-md);}
.mf-btn--sm{min-height:38px;padding:0 var(--space-4);font-size:var(--text-sm);border-radius:var(--radius-sm);}
.mf-btn--lg{min-height:56px;padding:0 var(--space-8);font-size:var(--text-lg);}
.mf-btn--full{width:100%;}
.mf-btn--primary:hover{--_bg:var(--brand-hover);}
.mf-btn--primary:active{--_bg:var(--brand-active);}
.mf-btn--secondary{--_bg:var(--surface-card);--_fg:var(--brand);--_bd:var(--border-strong);}
.mf-btn--secondary:hover{--_bg:var(--brand-subtle);--_bd:var(--brand-border);}
.mf-btn--secondary:active{--_bg:var(--blue-100);}
.mf-btn--ghost{--_bg:transparent;--_fg:var(--brand);--_bd:transparent;}
.mf-btn--ghost:hover{--_bg:var(--brand-subtle);}
.mf-btn--danger{--_bg:var(--risk);--_fg:#fff;}
.mf-btn--danger:hover{--_bg:var(--red-700);}
.mf-btn:disabled{opacity:.45;cursor:not-allowed;}
.mf-btn svg{width:1.15em;height:1.15em;flex:0 0 auto;}
`;

function Button({
  children,
  variant = "primary",
  size = "md",
  fullWidth = false,
  iconLeft,
  iconRight,
  as = "button",
  className = "",
  ...rest
}) {
  useStyleOnce_1("mf-btn-styles", CSS_1);
  const Tag = as;
  const cls = [
    "mf-btn",
    `mf-btn--${variant}`,
    `mf-btn--${size}`,
    fullWidth ? "mf-btn--full" : "",
    className,
  ].filter(Boolean).join(" ");
  return (
    <Tag className={cls} {...rest}>
      {iconLeft}
      {children && <span>{children}</span>}
      {iconRight}
    </Tag>
  );
}

Object.assign(window.__mf, { Button });
})();

// components/core/Badge.jsx
(function(){

function useStyleOnce_2(id, css) {
  React.useEffect(() => {
    if (document.getElementById(id)) return;
    const el = document.createElement("style");
    el.id = id; el.textContent = css; document.head.appendChild(el);
  }, [id, css]);
}

const CSS_2 = `
.mf-badge{
  display:inline-flex;align-items:center;gap:.4em;
  font-family:var(--font-sans);font-weight:var(--fw-semibold);
  font-size:var(--text-xs);line-height:1;letter-spacing:.01em;
  padding:.4em .7em;border-radius:var(--radius-pill);
  border:1px solid transparent;white-space:nowrap;
}
.mf-badge svg{width:1.15em;height:1.15em;}
.mf-badge--neutral{background:var(--surface-subtle);color:var(--text-secondary);border-color:var(--border-default);}
.mf-badge--brand{background:var(--brand-subtle);color:var(--brand-hover);border-color:var(--brand-border);}
.mf-badge--accent{background:var(--accent-subtle);color:var(--teal-700);border-color:var(--accent-border);}
.mf-badge--safe{background:var(--safe-surface);color:var(--safe-text);border-color:var(--safe-border);}
.mf-badge--caution{background:var(--caution-surface);color:var(--caution-text);border-color:var(--caution-border);}
.mf-badge--risk{background:var(--risk-surface);color:var(--risk-text);border-color:var(--risk-border);}
.mf-badge--dot::before{content:"";width:.5em;height:.5em;border-radius:50%;background:currentColor;}
`;

function Badge({ children, tone = "neutral", dot = false, iconLeft, className = "", ...rest }) {
  useStyleOnce_2("mf-badge-styles", CSS_2);
  const cls = ["mf-badge", `mf-badge--${tone}`, dot ? "mf-badge--dot" : "", className].filter(Boolean).join(" ");
  return <span className={cls} {...rest}>{iconLeft}{children}</span>;
}

Object.assign(window.__mf, { Badge });
})();

// components/core/Card.jsx
(function(){

function useStyleOnce_3(id, css) {
  React.useEffect(() => {
    if (document.getElementById(id)) return;
    const el = document.createElement("style");
    el.id = id; el.textContent = css; document.head.appendChild(el);
  }, [id, css]);
}

const CSS_3 = `
.mf-card{
  background:var(--surface-card);border:var(--card-border);
  border-radius:var(--radius-md);box-shadow:var(--card-shadow);
  padding:var(--pad-card);font-family:var(--font-sans);color:var(--text-primary);
}
.mf-card--flush{padding:0;overflow:hidden;}
.mf-card--quiet{box-shadow:none;background:var(--surface-subtle);}
.mf-card--accent{border-left:4px solid var(--brand);}
.mf-card__head{display:flex;align-items:flex-start;justify-content:space-between;gap:var(--space-3);margin-bottom:var(--space-3);}
.mf-card__title{font:var(--type-title);margin:0;}
.mf-card__sub{font:var(--type-body-sm);color:var(--text-secondary);margin:2px 0 0;}
`;

function Card({ children, variant = "default", className = "", ...rest }) {
  useStyleOnce_3("mf-card-styles", CSS_3);
  const cls = ["mf-card", variant !== "default" ? `mf-card--${variant}` : "", className].filter(Boolean).join(" ");
  return <div className={cls} {...rest}>{children}</div>;
}

function CardHeader({ title, subtitle, action }) {
  return (
    <div className="mf-card__head">
      <div>
        {title && <h3 className="mf-card__title">{title}</h3>}
        {subtitle && <p className="mf-card__sub">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

Object.assign(window.__mf, { Card, CardHeader });
})();

// components/core/Input.jsx
(function(){

function useStyleOnce_4(id, css) {
  React.useEffect(() => {
    if (document.getElementById(id)) return;
    const el = document.createElement("style");
    el.id = id; el.textContent = css; document.head.appendChild(el);
  }, [id, css]);
}

const CSS_4 = `
.mf-field{display:flex;flex-direction:column;gap:var(--space-2);font-family:var(--font-sans);}
.mf-field__label{font:var(--type-label);color:var(--text-primary);}
.mf-field__hint{font:var(--type-caption);color:var(--text-muted);}
.mf-field__err{font:var(--type-caption);color:var(--risk-text);}
.mf-input,.mf-textarea{
  width:100%;box-sizing:border-box;font-family:var(--font-sans);
  font-size:var(--text-md);color:var(--text-primary);
  background:var(--surface-card);border:1.5px solid var(--border-strong);
  border-radius:var(--radius-md);padding:0 var(--pad-control);min-height:48px;
  transition:border-color var(--dur-fast) var(--ease-standard),box-shadow var(--dur-fast) var(--ease-standard);
}
.mf-textarea{padding:var(--pad-control);min-height:120px;line-height:var(--leading-normal);resize:vertical;}
.mf-input::placeholder,.mf-textarea::placeholder{color:var(--text-disabled);}
.mf-input:hover,.mf-textarea:hover{border-color:var(--ink-400);}
.mf-input:focus,.mf-textarea:focus{outline:none;border-color:var(--brand);box-shadow:var(--focus-ring);}
.mf-field--error .mf-input,.mf-field--error .mf-textarea{border-color:var(--risk);}
`;

function Input({ label, hint, error, multiline = false, id, className = "", ...rest }) {
  useStyleOnce_4("mf-input-styles", CSS_4);
  const autoId = React.useId();
  const fieldId = id || autoId;
  const cls = ["mf-field", error ? "mf-field--error" : "", className].filter(Boolean).join(" ");
  const Control = multiline ? "textarea" : "input";
  const controlCls = multiline ? "mf-textarea" : "mf-input";
  return (
    <div className={cls}>
      {label && <label className="mf-field__label" htmlFor={fieldId}>{label}</label>}
      <Control id={fieldId} className={controlCls} aria-invalid={!!error} {...rest} />
      {error ? <span className="mf-field__err">{error}</span> : hint ? <span className="mf-field__hint">{hint}</span> : null}
    </div>
  );
}

Object.assign(window.__mf, { Input });
})();

// components/core/Eyebrow.jsx
(function(){

function useStyleOnce_5(id, css) {
  React.useEffect(() => {
    if (document.getElementById(id)) return;
    const el = document.createElement("style");
    el.id = id; el.textContent = css; document.head.appendChild(el);
  }, [id, css]);
}

const CSS_5 = `
.mf-eyebrow{
  display:block;font-family:var(--font-sans);font-weight:var(--fw-semibold);
  font-size:var(--text-2xs);letter-spacing:var(--tracking-caps);
  text-transform:uppercase;color:var(--text-muted);margin:0;
}
.mf-eyebrow--brand{color:var(--brand);}
.mf-eyebrow--accent{color:var(--accent);}
`;

function Eyebrow({ children, tone = "muted", className = "", ...rest }) {
  useStyleOnce_5("mf-eyebrow-styles", CSS_5);
  const cls = ["mf-eyebrow", tone !== "muted" ? `mf-eyebrow--${tone}` : "", className].filter(Boolean).join(" ");
  return <span className={cls} {...rest}>{children}</span>;
}

Object.assign(window.__mf, { Eyebrow });
})();

// components/feedback/RiskFlag.jsx
(function(){

/**
 * RiskFlag — Medifi's signature admin-risk alert. Three levels map directly
 * to the traffic-light system: safe / caution / risk. Calm, plain-English,
 * always pairs the problem with a next step. Icons are from Lucide (ISC).
 */
function useStyleOnce_6(id, css) {
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

const CSS_6 = `
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

function RiskFlag({ level = "safe", title, children, action, label, icon, className = "", ...rest }) {
  useStyleOnce_6("mf-risk-styles", CSS_6);
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

Object.assign(window.__mf, { RiskFlag });
})();

// components/app/ChecklistItem.jsx
(function(){

/** ChecklistItem — a single action in the patient's plan. Checkable. */
function useStyleOnce_7(id, css) {
  React.useEffect(() => {
    if (document.getElementById(id)) return;
    const el = document.createElement("style");
    el.id = id; el.textContent = css; document.head.appendChild(el);
  }, [id, css]);
}

const CSS_7 = `
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

function ChecklistItem({ label, meta, icon, done = false, onToggle, className = "", ...rest }) {
  useStyleOnce_7("mf-check-styles", CSS_7);
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

Object.assign(window.__mf, { ChecklistItem });
})();

// components/app/FieldRow.jsx
(function(){

/** FieldRow — one extracted structured field (label + mono value), with an
 *  optional "missing" state when Medifi couldn't find it in the letter. */
function useStyleOnce_8(id, css) {
  React.useEffect(() => {
    if (document.getElementById(id)) return;
    const el = document.createElement("style");
    el.id = id; el.textContent = css; document.head.appendChild(el);
  }, [id, css]);
}

const CSS_8 = `
.mf-fieldrow{
  display:flex;align-items:baseline;gap:var(--space-4);
  padding:var(--space-3) 0;border-bottom:1px solid var(--border-subtle);
  font-family:var(--font-sans);
}
.mf-fieldrow:last-child{border-bottom:0;}
.mf-fieldrow__key{
  flex:0 0 132px;font-size:var(--text-2xs);font-weight:var(--fw-semibold);
  letter-spacing:var(--tracking-caps);text-transform:uppercase;color:var(--text-muted);
}
.mf-fieldrow__val{font-family:var(--font-mono);font-size:var(--text-sm);color:var(--text-primary);min-width:0;}
.mf-fieldrow--missing .mf-fieldrow__val{font-family:var(--font-sans);font-style:italic;color:var(--caution-text);}
`;

function FieldRow({ label, value, missing = false, className = "", ...rest }) {
  useStyleOnce_8("mf-fieldrow-styles", CSS_8);
  const cls = ["mf-fieldrow", missing ? "mf-fieldrow--missing" : "", className].filter(Boolean).join(" ");
  return (
    <div className={cls} {...rest}>
      <span className="mf-fieldrow__key">{label}</span>
      <span className="mf-fieldrow__val">{missing ? "Not found in letter" : value}</span>
    </div>
  );
}

Object.assign(window.__mf, { FieldRow });
})();

  window.MedifiDesignSystem_063852 = window.__mf;
})();
