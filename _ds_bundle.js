/* @ds-bundle: {"format":3,"namespace":"MedifiDesignSystem_063852","components":[{"name":"ChecklistItem","sourcePath":"components/app/ChecklistItem.jsx"},{"name":"FieldRow","sourcePath":"components/app/FieldRow.jsx"},{"name":"Badge","sourcePath":"components/core/Badge.jsx"},{"name":"Button","sourcePath":"components/core/Button.jsx"},{"name":"Card","sourcePath":"components/core/Card.jsx"},{"name":"CardHeader","sourcePath":"components/core/Card.jsx"},{"name":"Eyebrow","sourcePath":"components/core/Eyebrow.jsx"},{"name":"Input","sourcePath":"components/core/Input.jsx"},{"name":"RiskFlag","sourcePath":"components/feedback/RiskFlag.jsx"}],"sourceHashes":{"components/app/ChecklistItem.jsx":"5d71c4b892ba","components/app/FieldRow.jsx":"402549ea51e9","components/core/Badge.jsx":"062f91bdfa09","components/core/Button.jsx":"ec6fd24f9041","components/core/Card.jsx":"793b15836953","components/core/Eyebrow.jsx":"dcf93b693910","components/core/Input.jsx":"e476fc73b8a6","components/feedback/RiskFlag.jsx":"cd20509b7ea6","ui_kits/app/AccountScreen.jsx":"820e60572517","ui_kits/app/AppShell.jsx":"769bf4d362c2","ui_kits/app/HelpScreen.jsx":"f03fcc452688","ui_kits/app/HomeScreen.jsx":"562dc4930991","ui_kits/app/Icons.jsx":"a9218831f07e","ui_kits/app/LettersScreen.jsx":"73ad76d45281","ui_kits/app/ResultScreen.jsx":"d6315597d7a9","ui_kits/app/ScanScreen.jsx":"7f988ffa2eb4","ui_kits/app/UpdatesScreen.jsx":"3589eb155684","ui_kits/app/calendar.js":"81cb77bf5041","ui_kits/app/data.js":"5ff43893ff98"},"inlinedExternals":[],"unexposedExports":[]} */

(() => {

const __ds_ns = (window.MedifiDesignSystem_063852 = window.MedifiDesignSystem_063852 || {});

const __ds_scope = {};

(__ds_ns.__errors = __ds_ns.__errors || []);

// components/app/ChecklistItem.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/** ChecklistItem — a single action in the patient's plan. Checkable. */
function useStyleOnce(id, css) {
  React.useEffect(() => {
    if (document.getElementById(id)) return;
    const el = document.createElement("style");
    el.id = id;
    el.textContent = css;
    document.head.appendChild(el);
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
const TICK = /*#__PURE__*/React.createElement("svg", {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: "3",
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": "true"
}, /*#__PURE__*/React.createElement("path", {
  d: "m5 12 5 5 9-10"
}));
function ChecklistItem({
  label,
  meta,
  icon,
  done = false,
  onToggle,
  className = "",
  ...rest
}) {
  useStyleOnce("mf-check-styles", CSS);
  const cls = ["mf-check", done ? "mf-check--done" : "", className].filter(Boolean).join(" ");
  return /*#__PURE__*/React.createElement("button", _extends({
    type: "button",
    className: cls,
    "aria-pressed": done,
    onClick: onToggle
  }, rest), /*#__PURE__*/React.createElement("span", {
    className: "mf-check__box"
  }, TICK), /*#__PURE__*/React.createElement("span", {
    className: "mf-check__main"
  }, /*#__PURE__*/React.createElement("span", {
    className: "mf-check__label"
  }, label), meta && /*#__PURE__*/React.createElement("span", {
    className: "mf-check__meta"
  }, meta)), icon && /*#__PURE__*/React.createElement("span", {
    className: "mf-check__icon"
  }, icon));
}
Object.assign(__ds_scope, { ChecklistItem });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/app/ChecklistItem.jsx", error: String((e && e.message) || e) }); }

// components/app/FieldRow.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/** FieldRow — one extracted structured field (label + mono value), with an
 *  optional "missing" state when Medifi couldn't find it in the letter. */
function useStyleOnce(id, css) {
  React.useEffect(() => {
    if (document.getElementById(id)) return;
    const el = document.createElement("style");
    el.id = id;
    el.textContent = css;
    document.head.appendChild(el);
  }, [id, css]);
}
const CSS = `
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
function FieldRow({
  label,
  value,
  missing = false,
  className = "",
  ...rest
}) {
  useStyleOnce("mf-fieldrow-styles", CSS);
  const cls = ["mf-fieldrow", missing ? "mf-fieldrow--missing" : "", className].filter(Boolean).join(" ");
  return /*#__PURE__*/React.createElement("div", _extends({
    className: cls
  }, rest), /*#__PURE__*/React.createElement("span", {
    className: "mf-fieldrow__key"
  }, label), /*#__PURE__*/React.createElement("span", {
    className: "mf-fieldrow__val"
  }, missing ? "Not found in letter" : value));
}
Object.assign(__ds_scope, { FieldRow });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/app/FieldRow.jsx", error: String((e && e.message) || e) }); }

// components/core/Badge.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function useStyleOnce(id, css) {
  React.useEffect(() => {
    if (document.getElementById(id)) return;
    const el = document.createElement("style");
    el.id = id;
    el.textContent = css;
    document.head.appendChild(el);
  }, [id, css]);
}
const CSS = `
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
function Badge({
  children,
  tone = "neutral",
  dot = false,
  iconLeft,
  className = "",
  ...rest
}) {
  useStyleOnce("mf-badge-styles", CSS);
  const cls = ["mf-badge", `mf-badge--${tone}`, dot ? "mf-badge--dot" : "", className].filter(Boolean).join(" ");
  return /*#__PURE__*/React.createElement("span", _extends({
    className: cls
  }, rest), iconLeft, children);
}
Object.assign(__ds_scope, { Badge });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Badge.jsx", error: String((e && e.message) || e) }); }

// components/core/Button.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Medifi Button — primary action control.
 * Self-contained: injects its own scoped styles once, reads brand tokens
 * from CSS custom properties. No external deps.
 */
function useStyleOnce(id, css) {
  React.useEffect(() => {
    if (document.getElementById(id)) return;
    const el = document.createElement("style");
    el.id = id;
    el.textContent = css;
    document.head.appendChild(el);
  }, [id, css]);
}
const CSS = `
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
  useStyleOnce("mf-btn-styles", CSS);
  const Tag = as;
  const cls = ["mf-btn", `mf-btn--${variant}`, `mf-btn--${size}`, fullWidth ? "mf-btn--full" : "", className].filter(Boolean).join(" ");
  return /*#__PURE__*/React.createElement(Tag, _extends({
    className: cls
  }, rest), iconLeft, children && /*#__PURE__*/React.createElement("span", null, children), iconRight);
}
Object.assign(__ds_scope, { Button });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Button.jsx", error: String((e && e.message) || e) }); }

// components/core/Card.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function useStyleOnce(id, css) {
  React.useEffect(() => {
    if (document.getElementById(id)) return;
    const el = document.createElement("style");
    el.id = id;
    el.textContent = css;
    document.head.appendChild(el);
  }, [id, css]);
}
const CSS = `
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
function Card({
  children,
  variant = "default",
  className = "",
  ...rest
}) {
  useStyleOnce("mf-card-styles", CSS);
  const cls = ["mf-card", variant !== "default" ? `mf-card--${variant}` : "", className].filter(Boolean).join(" ");
  return /*#__PURE__*/React.createElement("div", _extends({
    className: cls
  }, rest), children);
}
function CardHeader({
  title,
  subtitle,
  action
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "mf-card__head"
  }, /*#__PURE__*/React.createElement("div", null, title && /*#__PURE__*/React.createElement("h3", {
    className: "mf-card__title"
  }, title), subtitle && /*#__PURE__*/React.createElement("p", {
    className: "mf-card__sub"
  }, subtitle)), action);
}
Object.assign(__ds_scope, { Card, CardHeader });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Card.jsx", error: String((e && e.message) || e) }); }

// components/core/Eyebrow.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function useStyleOnce(id, css) {
  React.useEffect(() => {
    if (document.getElementById(id)) return;
    const el = document.createElement("style");
    el.id = id;
    el.textContent = css;
    document.head.appendChild(el);
  }, [id, css]);
}
const CSS = `
.mf-eyebrow{
  display:block;font-family:var(--font-sans);font-weight:var(--fw-semibold);
  font-size:var(--text-2xs);letter-spacing:var(--tracking-caps);
  text-transform:uppercase;color:var(--text-muted);margin:0;
}
.mf-eyebrow--brand{color:var(--brand);}
.mf-eyebrow--accent{color:var(--accent);}
`;
function Eyebrow({
  children,
  tone = "muted",
  className = "",
  ...rest
}) {
  useStyleOnce("mf-eyebrow-styles", CSS);
  const cls = ["mf-eyebrow", tone !== "muted" ? `mf-eyebrow--${tone}` : "", className].filter(Boolean).join(" ");
  return /*#__PURE__*/React.createElement("span", _extends({
    className: cls
  }, rest), children);
}
Object.assign(__ds_scope, { Eyebrow });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Eyebrow.jsx", error: String((e && e.message) || e) }); }

// components/core/Input.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function useStyleOnce(id, css) {
  React.useEffect(() => {
    if (document.getElementById(id)) return;
    const el = document.createElement("style");
    el.id = id;
    el.textContent = css;
    document.head.appendChild(el);
  }, [id, css]);
}
const CSS = `
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
function Input({
  label,
  hint,
  error,
  multiline = false,
  id,
  className = "",
  ...rest
}) {
  useStyleOnce("mf-input-styles", CSS);
  const autoId = React.useId();
  const fieldId = id || autoId;
  const cls = ["mf-field", error ? "mf-field--error" : "", className].filter(Boolean).join(" ");
  const Control = multiline ? "textarea" : "input";
  const controlCls = multiline ? "mf-textarea" : "mf-input";
  return /*#__PURE__*/React.createElement("div", {
    className: cls
  }, label && /*#__PURE__*/React.createElement("label", {
    className: "mf-field__label",
    htmlFor: fieldId
  }, label), /*#__PURE__*/React.createElement(Control, _extends({
    id: fieldId,
    className: controlCls,
    "aria-invalid": !!error
  }, rest)), error ? /*#__PURE__*/React.createElement("span", {
    className: "mf-field__err"
  }, error) : hint ? /*#__PURE__*/React.createElement("span", {
    className: "mf-field__hint"
  }, hint) : null);
}
Object.assign(__ds_scope, { Input });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Input.jsx", error: String((e && e.message) || e) }); }

// components/feedback/RiskFlag.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * RiskFlag — Medifi's signature admin-risk alert. Three levels map directly
 * to the traffic-light system: safe / caution / risk. Calm, plain-English,
 * always pairs the problem with a next step. Icons are from Lucide (ISC).
 */
function useStyleOnce(id, css) {
  React.useEffect(() => {
    if (document.getElementById(id)) return;
    const el = document.createElement("style");
    el.id = id;
    el.textContent = css;
    document.head.appendChild(el);
  }, [id, css]);
}
const ICONS = {
  safe: /*#__PURE__*/React.createElement("svg", {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": "true"
  }, /*#__PURE__*/React.createElement("circle", {
    cx: "12",
    cy: "12",
    r: "10"
  }), /*#__PURE__*/React.createElement("path", {
    d: "m9 12 2 2 4-4"
  })),
  caution: /*#__PURE__*/React.createElement("svg", {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": "true"
  }, /*#__PURE__*/React.createElement("path", {
    d: "m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M12 9v4"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M12 17h.01"
  })),
  risk: /*#__PURE__*/React.createElement("svg", {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": "true"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M12 16h.01"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M12 8v4"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M15.31 2a2 2 0 0 1 1.41.59l4.69 4.68A2 2 0 0 1 22 8.69v6.62a2 2 0 0 1-.59 1.41l-4.68 4.69a2 2 0 0 1-1.41.59H8.69a2 2 0 0 1-1.41-.59l-4.69-4.68A2 2 0 0 1 2 15.31V8.69a2 2 0 0 1 .59-1.41l4.68-4.69A2 2 0 0 1 8.69 2z"
  }))
};
const LABELS = {
  safe: "Looks fine",
  caution: "Check this",
  risk: "Needs attention"
};
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
function RiskFlag({
  level = "safe",
  title,
  children,
  action,
  label,
  icon,
  className = "",
  ...rest
}) {
  useStyleOnce("mf-risk-styles", CSS);
  const cls = ["mf-risk", level !== "safe" ? `mf-risk--${level}` : "", className].filter(Boolean).join(" ");
  return /*#__PURE__*/React.createElement("div", _extends({
    className: cls,
    role: "status"
  }, rest), /*#__PURE__*/React.createElement("span", {
    className: "mf-risk__icon"
  }, icon || ICONS[level]), /*#__PURE__*/React.createElement("div", {
    className: "mf-risk__body"
  }, /*#__PURE__*/React.createElement("p", {
    className: "mf-risk__label"
  }, label || LABELS[level]), title && /*#__PURE__*/React.createElement("p", {
    className: "mf-risk__title"
  }, title), children && /*#__PURE__*/React.createElement("p", {
    className: "mf-risk__text"
  }, children), action && /*#__PURE__*/React.createElement("div", {
    className: "mf-risk__action"
  }, action)));
}
Object.assign(__ds_scope, { RiskFlag });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/RiskFlag.jsx", error: String((e && e.message) || e) }); }

// ui_kits/app/AccountScreen.jsx
try { (() => {
/* Medifi — Account screen. Profile, preferences (real toggles), carer, sign out. */
(function () {
  const {
    Button,
    Badge
  } = window.MedifiDesignSystem_063852;
  const Icon = window.Icon;
  function Switch({
    on,
    onToggle,
    label
  }) {
    return /*#__PURE__*/React.createElement("button", {
      type: "button",
      role: "switch",
      "aria-checked": on,
      "aria-label": label,
      className: "mf-switch" + (on ? " mf-switch--on" : ""),
      onClick: onToggle
    }, /*#__PURE__*/React.createElement("span", {
      className: "mf-switch__dot"
    }));
  }
  function SettingRow({
    icon,
    title,
    sub,
    control
  }) {
    return /*#__PURE__*/React.createElement("div", {
      className: "mf-setting"
    }, /*#__PURE__*/React.createElement("span", {
      className: "mf-setting__icon"
    }, /*#__PURE__*/React.createElement(Icon, {
      name: icon,
      size: 20
    })), /*#__PURE__*/React.createElement("span", {
      className: "mf-setting__main"
    }, /*#__PURE__*/React.createElement("span", {
      className: "t"
    }, title), sub && /*#__PURE__*/React.createElement("span", {
      className: "s"
    }, sub)), control);
  }
  function AccountScreen() {
    const [prefs, setPrefs] = React.useState({
      notify: true,
      calendar: true,
      carer: false,
      bigText: false
    });
    const t = k => setPrefs(p => ({
      ...p,
      [k]: !p[k]
    }));
    return /*#__PURE__*/React.createElement("div", {
      className: "mf-screen"
    }, /*#__PURE__*/React.createElement("div", {
      className: "mf-profile"
    }, /*#__PURE__*/React.createElement("span", {
      className: "mf-profile__avatar"
    }, "A"), /*#__PURE__*/React.createElement("div", {
      className: "mf-profile__main"
    }, /*#__PURE__*/React.createElement("span", {
      className: "mf-profile__name"
    }, "Aisha Khan"), /*#__PURE__*/React.createElement("span", {
      className: "mf-profile__sub"
    }, "NHS number \xB7 485 777 3456")), /*#__PURE__*/React.createElement(Badge, {
      tone: "safe",
      dot: true
    }, "Verified")), /*#__PURE__*/React.createElement("div", {
      className: "mf-section"
    }, /*#__PURE__*/React.createElement("p", {
      className: "mf-section__label"
    }, "Reminders & alerts"), /*#__PURE__*/React.createElement("div", {
      className: "mf-card-list"
    }, /*#__PURE__*/React.createElement(SettingRow, {
      icon: "bell",
      title: "Notifications",
      sub: "Reminders and risk alerts",
      control: /*#__PURE__*/React.createElement(Switch, {
        on: prefs.notify,
        onToggle: () => t("notify"),
        label: "Notifications"
      })
    }), /*#__PURE__*/React.createElement(SettingRow, {
      icon: "calendar",
      title: "Calendar sync",
      sub: "Add events to your phone calendar",
      control: /*#__PURE__*/React.createElement(Switch, {
        on: prefs.calendar,
        onToggle: () => t("calendar"),
        label: "Calendar sync"
      })
    }), /*#__PURE__*/React.createElement(SettingRow, {
      icon: "languages",
      title: "Large text",
      sub: "Easier to read",
      control: /*#__PURE__*/React.createElement(Switch, {
        on: prefs.bigText,
        onToggle: () => t("bigText"),
        label: "Large text"
      })
    }))), /*#__PURE__*/React.createElement("div", {
      className: "mf-section"
    }, /*#__PURE__*/React.createElement("p", {
      className: "mf-section__label"
    }, "Sharing & access"), /*#__PURE__*/React.createElement("div", {
      className: "mf-card-list"
    }, /*#__PURE__*/React.createElement(SettingRow, {
      icon: "share",
      title: "Carer access",
      sub: prefs.carer ? "Sara can see your summaries" : "Off",
      control: /*#__PURE__*/React.createElement(Switch, {
        on: prefs.carer,
        onToggle: () => t("carer"),
        label: "Carer access"
      })
    }), /*#__PURE__*/React.createElement(SettingRow, {
      icon: "languages",
      title: "Summary language",
      sub: "English",
      control: /*#__PURE__*/React.createElement(Icon, {
        name: "chevronRight",
        size: 20
      })
    }))), /*#__PURE__*/React.createElement(Button, {
      variant: "secondary",
      fullWidth: true
    }, "Sign out"), /*#__PURE__*/React.createElement("p", {
      className: "mf-disclaimer"
    }, "Medifi stores your letters on this device. We never share your information without your permission."));
  }
  window.AccountScreen = AccountScreen;
})();
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/app/AccountScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/app/AppShell.jsx
try { (() => {
/* Medifi — App shell. Phone frame, status bar, header, screen router,
 * processing state, bottom nav / action bar, and the calendar sheet. */
(function () {
  const {
    Button
  } = window.MedifiDesignSystem_063852;
  const Icon = window.Icon;
  const Cal = window.MedifiCal;
  function StatusBar() {
    return /*#__PURE__*/React.createElement("div", {
      className: "mf-status"
    }, /*#__PURE__*/React.createElement("span", {
      className: "mf-status__time"
    }, "9:41"), /*#__PURE__*/React.createElement("span", {
      className: "mf-status__icons"
    }, /*#__PURE__*/React.createElement("svg", {
      width: "18",
      height: "11",
      viewBox: "0 0 18 11",
      fill: "currentColor"
    }, /*#__PURE__*/React.createElement("rect", {
      x: "0",
      y: "6",
      width: "3",
      height: "5",
      rx: "1"
    }), /*#__PURE__*/React.createElement("rect", {
      x: "5",
      y: "3.5",
      width: "3",
      height: "7.5",
      rx: "1"
    }), /*#__PURE__*/React.createElement("rect", {
      x: "10",
      y: "1.5",
      width: "3",
      height: "9.5",
      rx: "1"
    }), /*#__PURE__*/React.createElement("rect", {
      x: "15",
      y: "0",
      width: "3",
      height: "11",
      rx: "1"
    })), /*#__PURE__*/React.createElement("svg", {
      width: "22",
      height: "11",
      viewBox: "0 0 24 12",
      fill: "none"
    }, /*#__PURE__*/React.createElement("rect", {
      x: "1",
      y: "1",
      width: "20",
      height: "10",
      rx: "2.5",
      stroke: "currentColor",
      strokeWidth: "1.2",
      opacity: "0.5"
    }), /*#__PURE__*/React.createElement("rect", {
      x: "2.5",
      y: "2.5",
      width: "15",
      height: "7",
      rx: "1.2",
      fill: "currentColor"
    }), /*#__PURE__*/React.createElement("rect", {
      x: "22",
      y: "4",
      width: "1.5",
      height: "4",
      rx: "0.75",
      fill: "currentColor"
    }))));
  }
  function Logo() {
    return /*#__PURE__*/React.createElement("svg", {
      className: "mf-header__logo",
      width: "150",
      height: "26",
      viewBox: "0 0 190 48",
      fill: "none",
      role: "img",
      "aria-label": "Medifi"
    }, /*#__PURE__*/React.createElement("circle", {
      cx: "20.5",
      cy: "20.5",
      r: "13.5",
      stroke: "#1257d6",
      strokeWidth: "4"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M14.5 20.8l4.3 4.3 8-8.4",
      stroke: "#0e8c84",
      strokeWidth: "4",
      strokeLinecap: "round",
      strokeLinejoin: "round"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M30.4 30.4l8.1 8.1",
      stroke: "#1257d6",
      strokeWidth: "4",
      strokeLinecap: "round"
    }), /*#__PURE__*/React.createElement("text", {
      x: "54",
      y: "32",
      fontFamily: "Lexend, sans-serif",
      fontSize: "28",
      fontWeight: "700",
      fill: "#0d1b2a",
      letterSpacing: "-0.5"
    }, "Medifi"));
  }
  function Header({
    screen,
    title,
    onBack,
    onAccount,
    onUpdates,
    unread
  }) {
    if (screen === "home") {
      return /*#__PURE__*/React.createElement("header", {
        className: "mf-header"
      }, /*#__PURE__*/React.createElement(Logo, null), /*#__PURE__*/React.createElement("div", {
        className: "mf-header__right"
      }, /*#__PURE__*/React.createElement("button", {
        type: "button",
        className: "mf-iconbtn mf-iconbtn--badge",
        "aria-label": "Updates from your care team",
        onClick: onUpdates
      }, /*#__PURE__*/React.createElement(Icon, {
        name: "bell",
        size: 22
      }), unread > 0 && /*#__PURE__*/React.createElement("span", {
        className: "mf-bell-badge"
      }, unread)), /*#__PURE__*/React.createElement("button", {
        type: "button",
        className: "mf-avatar",
        "aria-label": "Your account",
        onClick: onAccount
      }, "A")));
    }
    return /*#__PURE__*/React.createElement("header", {
      className: "mf-header"
    }, /*#__PURE__*/React.createElement("button", {
      type: "button",
      className: "mf-iconbtn",
      "aria-label": "Back",
      onClick: onBack
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "chevronLeft",
      size: 24
    })), /*#__PURE__*/React.createElement("span", {
      className: "mf-header__title"
    }, title), /*#__PURE__*/React.createElement("span", {
      style: {
        width: 40
      }
    }));
  }
  function Processing() {
    return /*#__PURE__*/React.createElement("div", {
      className: "mf-processing"
    }, /*#__PURE__*/React.createElement("div", {
      className: "mf-processing__ring"
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "scan",
      size: 30
    })), /*#__PURE__*/React.createElement("p", {
      className: "mf-processing__t"
    }, "Reading your letter\u2026"), /*#__PURE__*/React.createElement("p", {
      className: "mf-processing__s"
    }, "Finding the date, place, and what to do next."));
  }
  function BottomNav({
    screen,
    onNav
  }) {
    const item = (id, name, label) => /*#__PURE__*/React.createElement("button", {
      type: "button",
      className: "mf-nav__item" + (screen === id ? " mf-nav__item--on" : ""),
      onClick: () => onNav(id)
    }, /*#__PURE__*/React.createElement(Icon, {
      name: name,
      size: 24
    }), /*#__PURE__*/React.createElement("span", null, label));
    return /*#__PURE__*/React.createElement("nav", {
      className: "mf-nav"
    }, item("home", "home", "Home"), item("letters", "file", "Letters"), item("help", "help", "Help"), item("account", "id", "Account"));
  }
  function eventFromLetter(l) {
    const e = l && l.event;
    if (!e) return null;
    const start = new Date(e.y, e.mo - 1, e.d, e.h, e.min);
    const end = new Date(start.getTime() + (e.durMins || 30) * 60000);
    return {
      title: e.title,
      start,
      end,
      location: e.location || "",
      description: l.summary,
      alarmMins: e.chase ? 0 : 120
    };
  }
  function CalendarSheet({
    letter,
    onClose,
    onDone
  }) {
    const ev = eventFromLetter(letter);
    const hasMeds = letter && letter.medicines;
    function google() {
      window.open(Cal.googleUrl(ev), "_blank", "noopener");
      onDone("Opening Google Calendar…");
    }
    function apple() {
      Cal.downloadIcs([ev], "medifi-appointment");
      onDone("Calendar file downloaded.");
    }
    function meds() {
      Cal.downloadIcs(Cal.medicineEvents(letter.medicines, new Date()), "medifi-medicine-reminders");
      onDone("Medicine reminders downloaded.");
    }
    return /*#__PURE__*/React.createElement("div", {
      className: "mf-sheet-scrim",
      onClick: onClose
    }, /*#__PURE__*/React.createElement("div", {
      className: "mf-sheet",
      onClick: e => e.stopPropagation()
    }, /*#__PURE__*/React.createElement("div", {
      className: "mf-sheet__grip"
    }), /*#__PURE__*/React.createElement("h3", {
      className: "mf-sheet__title"
    }, "Add to your calendar"), /*#__PURE__*/React.createElement("p", {
      className: "mf-sheet__sub"
    }, "Reminders will pop up on your phone \u2014 no need to remember."), ev && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("button", {
      type: "button",
      className: "mf-sheet__opt",
      onClick: google
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "calendar",
      size: 22
    }), /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("span", {
      className: "t"
    }, "Google Calendar"), /*#__PURE__*/React.createElement("span", {
      className: "s"
    }, ev.alarmMins ? "Alerts 2 hours before" : "Sets a chase reminder")), /*#__PURE__*/React.createElement(Icon, {
      name: "arrowRight",
      size: 18
    })), /*#__PURE__*/React.createElement("button", {
      type: "button",
      className: "mf-sheet__opt",
      onClick: apple
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "calendar",
      size: 22
    }), /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("span", {
      className: "t"
    }, "Apple Calendar / Outlook"), /*#__PURE__*/React.createElement("span", {
      className: "s"
    }, "Download .ics file")), /*#__PURE__*/React.createElement(Icon, {
      name: "arrowRight",
      size: 18
    }))), hasMeds && /*#__PURE__*/React.createElement("button", {
      type: "button",
      className: "mf-sheet__opt",
      onClick: meds
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "clock",
      size: 22
    }), /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("span", {
      className: "t"
    }, "Medicine reminders"), /*#__PURE__*/React.createElement("span", {
      className: "s"
    }, "Repeating alerts for each dose (.ics)")), /*#__PURE__*/React.createElement(Icon, {
      name: "arrowRight",
      size: 18
    })), /*#__PURE__*/React.createElement("button", {
      type: "button",
      className: "mf-sheet__cancel",
      onClick: onClose
    }, "Cancel")));
  }
  function Toast({
    children
  }) {
    return /*#__PURE__*/React.createElement("div", {
      className: "mf-toast mf-toast--shell"
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "check",
      size: 18
    }), /*#__PURE__*/React.createElement("span", null, children));
  }
  function AppShell() {
    const [screen, setScreen] = React.useState("home");
    const [letter, setLetter] = React.useState(null);
    const [processing, setProcessing] = React.useState(false);
    const [calOpen, setCalOpen] = React.useState(false);
    const [calItem, setCalItem] = React.useState(null);
    const [seenUpdates, setSeenUpdates] = React.useState(false);
    const [toast, setToast] = React.useState("");
    const unread = seenUpdates ? 0 : (window.MEDIFI_UPDATES || []).filter(u => u.unread).length;
    const titles = {
      scan: "Scan a letter",
      result: letter ? letter.sender : "",
      letters: "Your letters",
      help: "Help & support",
      account: "Account",
      updates: "Updates"
    };
    function openCal(it) {
      setCalItem(it);
      setCalOpen(true);
    }
    function analyze(l, instant) {
      setLetter(l);
      if (instant) {
        setScreen("result");
        return;
      }
      setProcessing(true);
      setTimeout(() => {
        setProcessing(false);
        setScreen("result");
      }, 1500);
    }
    function open(l) {
      setLetter(l);
      setScreen("result");
    }
    const goHome = () => setScreen("home");
    function flash(msg) {
      setToast(msg);
      window.clearTimeout(flash._t);
      flash._t = window.setTimeout(() => setToast(""), 2800);
    }
    function calDone(msg) {
      setCalOpen(false);
      flash(msg);
    }
    const showNav = !processing && screen !== "result" && screen !== "scan" && screen !== "updates";
    return /*#__PURE__*/React.createElement("div", {
      className: "mf-phone"
    }, /*#__PURE__*/React.createElement("div", {
      className: "mf-device"
    }, /*#__PURE__*/React.createElement(StatusBar, null), /*#__PURE__*/React.createElement(Header, {
      screen: screen,
      title: titles[screen],
      onBack: goHome,
      onAccount: () => setScreen("account"),
      onUpdates: () => {
        setScreen("updates");
        setSeenUpdates(true);
      },
      unread: unread
    }), /*#__PURE__*/React.createElement("main", {
      className: "mf-body"
    }, processing ? /*#__PURE__*/React.createElement(Processing, null) : /*#__PURE__*/React.createElement(React.Fragment, null, screen === "home" && /*#__PURE__*/React.createElement(window.HomeScreen, {
      onScan: () => setScreen("scan"),
      onOpen: open,
      onSeeAll: () => setScreen("letters")
    }), screen === "scan" && /*#__PURE__*/React.createElement(window.ScanScreen, {
      onAnalyze: analyze
    }), screen === "result" && letter && /*#__PURE__*/React.createElement(window.ResultScreen, {
      letter: letter,
      onAddReminders: () => openCal(letter)
    }), screen === "letters" && /*#__PURE__*/React.createElement(window.LettersScreen, {
      onOpen: open
    }), screen === "help" && /*#__PURE__*/React.createElement(window.HelpScreen, null), screen === "updates" && /*#__PURE__*/React.createElement(window.UpdatesScreen, {
      onCal: openCal
    }), screen === "account" && /*#__PURE__*/React.createElement(window.AccountScreen, null))), !processing && screen === "result" && /*#__PURE__*/React.createElement("div", {
      className: "mf-actionbar"
    }, /*#__PURE__*/React.createElement(Button, {
      variant: "primary",
      size: "lg",
      fullWidth: true,
      iconLeft: /*#__PURE__*/React.createElement(Icon, {
        name: "calendar",
        size: 20
      }),
      onClick: () => openCal(letter)
    }, letter && letter.medicines && !letter.event ? "Set medicine reminders" : "Add to my calendar")), showNav && /*#__PURE__*/React.createElement(BottomNav, {
      screen: screen,
      onNav: setScreen
    }), calOpen && calItem && /*#__PURE__*/React.createElement(CalendarSheet, {
      letter: calItem,
      onClose: () => setCalOpen(false),
      onDone: calDone
    }), toast && /*#__PURE__*/React.createElement(Toast, null, toast)));
  }
  window.AppShell = AppShell;
})();
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/app/AppShell.jsx", error: String((e && e.message) || e) }); }

// ui_kits/app/HelpScreen.jsx
try { (() => {
/* Medifi — Help & support screen. Interactive FAQ + contact options. */
(function () {
  const Icon = window.Icon;
  const FAQS = [{
    q: "Is Medifi an NHS service?",
    a: "No. Medifi is an independent tool that helps you understand NHS letters. Your original letter from the NHS is always the source of truth."
  }, {
    q: "How accurate is the summary?",
    a: "Medifi is usually very good at pulling out dates, places and contacts — but it can make mistakes. Always check the summary against your original letter, which you can open any time with “Show original letter.”"
  }, {
    q: "What do the colours mean?",
    a: "Green means a detail looks fine. Amber means something is unclear or missing and worth a check. Red means something may be wrong — like a date that has already passed — and you should act soon."
  }, {
    q: "Is my information private?",
    a: "Your letters stay on your device for this demo. Medifi never shares your information without your say-so."
  }, {
    q: "Can I read this in another language?",
    a: "Yes — open a letter and tap Translate. Translated summaries are there to support you; the original English letter remains the source of truth."
  }];
  function FaqItem({
    item,
    open,
    onToggle
  }) {
    return /*#__PURE__*/React.createElement("div", {
      className: "mf-faq" + (open ? " mf-faq--open" : "")
    }, /*#__PURE__*/React.createElement("button", {
      type: "button",
      className: "mf-faq__q",
      onClick: onToggle,
      "aria-expanded": open
    }, /*#__PURE__*/React.createElement("span", null, item.q), /*#__PURE__*/React.createElement(Icon, {
      name: open ? "x" : "plus",
      size: 18
    })), open && /*#__PURE__*/React.createElement("p", {
      className: "mf-faq__a"
    }, item.a));
  }
  function HelpScreen() {
    const [open, setOpen] = React.useState(0);
    return /*#__PURE__*/React.createElement("div", {
      className: "mf-screen"
    }, /*#__PURE__*/React.createElement("div", {
      className: "mf-section"
    }, /*#__PURE__*/React.createElement("p", {
      className: "mf-section__label"
    }, "Common questions"), /*#__PURE__*/React.createElement("div", {
      className: "mf-stack"
    }, FAQS.map((f, i) => /*#__PURE__*/React.createElement(FaqItem, {
      key: i,
      item: f,
      open: open === i,
      onToggle: () => setOpen(open === i ? -1 : i)
    })))), /*#__PURE__*/React.createElement("div", {
      className: "mf-section"
    }, /*#__PURE__*/React.createElement("p", {
      className: "mf-section__label"
    }, "Get help now"), /*#__PURE__*/React.createElement("div", {
      className: "mf-list"
    }, /*#__PURE__*/React.createElement("a", {
      className: "mf-contact",
      href: "tel:111"
    }, /*#__PURE__*/React.createElement("span", {
      className: "mf-contact__icon mf-contact__icon--urgent"
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "phone",
      size: 20
    })), /*#__PURE__*/React.createElement("span", {
      className: "mf-contact__main"
    }, /*#__PURE__*/React.createElement("span", {
      className: "t"
    }, "Call 111"), /*#__PURE__*/React.createElement("span", {
      className: "s"
    }, "Urgent but not an emergency")), /*#__PURE__*/React.createElement(Icon, {
      name: "chevronRight",
      size: 20
    })), /*#__PURE__*/React.createElement("a", {
      className: "mf-contact",
      href: "tel:999"
    }, /*#__PURE__*/React.createElement("span", {
      className: "mf-contact__icon mf-contact__icon--emergency"
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "alert",
      size: 20
    })), /*#__PURE__*/React.createElement("span", {
      className: "mf-contact__main"
    }, /*#__PURE__*/React.createElement("span", {
      className: "t"
    }, "Call 999"), /*#__PURE__*/React.createElement("span", {
      className: "s"
    }, "Life-threatening emergency")), /*#__PURE__*/React.createElement(Icon, {
      name: "chevronRight",
      size: 20
    })), /*#__PURE__*/React.createElement("a", {
      className: "mf-contact",
      href: "https://www.nhs.uk/service-search",
      target: "_blank",
      rel: "noopener"
    }, /*#__PURE__*/React.createElement("span", {
      className: "mf-contact__icon"
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "pin",
      size: 20
    })), /*#__PURE__*/React.createElement("span", {
      className: "mf-contact__main"
    }, /*#__PURE__*/React.createElement("span", {
      className: "t"
    }, "Find your GP or service"), /*#__PURE__*/React.createElement("span", {
      className: "s"
    }, "On nhs.uk")), /*#__PURE__*/React.createElement(Icon, {
      name: "chevronRight",
      size: 20
    })))), /*#__PURE__*/React.createElement("p", {
      className: "mf-disclaimer"
    }, "Medifi does not give medical advice. For health concerns, contact your GP, 111, or 999 in an emergency."));
  }
  window.HelpScreen = HelpScreen;
})();
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/app/HelpScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/app/HomeScreen.jsx
try { (() => {
/* Medifi — Home screen. Greeting, the primary "scan" CTA, and the patient's
 * recent letters with a risk badge each. */
(function () {
  const {
    Badge,
    Eyebrow
  } = window.MedifiDesignSystem_063852;
  const Icon = window.Icon;
  const LEVEL_TONE = {
    safe: "safe",
    caution: "caution",
    risk: "risk"
  };
  const LEVEL_TEXT = {
    safe: "Looks fine",
    caution: "Check this",
    risk: "Needs attention"
  };
  function LetterRow({
    letter,
    onOpen
  }) {
    return /*#__PURE__*/React.createElement("button", {
      type: "button",
      className: "mf-letter",
      onClick: () => onOpen(letter)
    }, /*#__PURE__*/React.createElement("span", {
      className: "mf-letter__icon"
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "file",
      size: 22
    })), /*#__PURE__*/React.createElement("span", {
      className: "mf-letter__main"
    }, /*#__PURE__*/React.createElement("span", {
      className: "mf-letter__sender"
    }, letter.sender), /*#__PURE__*/React.createElement("span", {
      className: "mf-letter__head"
    }, letter.headline), /*#__PURE__*/React.createElement("span", {
      className: "mf-letter__received"
    }, letter.received)), /*#__PURE__*/React.createElement("span", {
      className: "mf-letter__end"
    }, /*#__PURE__*/React.createElement(Badge, {
      tone: LEVEL_TONE[letter.worstLevel],
      dot: true
    }, LEVEL_TEXT[letter.worstLevel]), /*#__PURE__*/React.createElement(Icon, {
      name: "chevronRight",
      size: 20,
      className: "mf-letter__chev"
    })));
  }
  function HomeScreen({
    onScan,
    onOpen,
    onSeeAll
  }) {
    return /*#__PURE__*/React.createElement("div", {
      className: "mf-screen"
    }, /*#__PURE__*/React.createElement("div", {
      className: "mf-greet"
    }, /*#__PURE__*/React.createElement(Eyebrow, {
      tone: "accent"
    }, "Tuesday 6 June"), /*#__PURE__*/React.createElement("h1", {
      className: "mf-greet__h"
    }, "Hi Aisha"), /*#__PURE__*/React.createElement("p", {
      className: "mf-greet__sub"
    }, "Photograph or paste an NHS letter and Medifi will turn it into a clear plan.")), /*#__PURE__*/React.createElement("button", {
      type: "button",
      className: "mf-cta",
      onClick: onScan
    }, /*#__PURE__*/React.createElement("span", {
      className: "mf-cta__icon"
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "scan",
      size: 26
    })), /*#__PURE__*/React.createElement("span", {
      className: "mf-cta__text"
    }, /*#__PURE__*/React.createElement("span", {
      className: "mf-cta__title"
    }, "Scan a letter"), /*#__PURE__*/React.createElement("span", {
      className: "mf-cta__sub"
    }, "Take a photo or paste the text")), /*#__PURE__*/React.createElement(Icon, {
      name: "arrowRight",
      size: 22
    })), /*#__PURE__*/React.createElement("div", {
      className: "mf-section"
    }, /*#__PURE__*/React.createElement("p", {
      className: "mf-section__label"
    }, "Your letters", /*#__PURE__*/React.createElement("button", {
      type: "button",
      className: "mf-seeall",
      onClick: onSeeAll
    }, "See all")), /*#__PURE__*/React.createElement("div", {
      className: "mf-list"
    }, window.MEDIFI_LETTERS.map(l => /*#__PURE__*/React.createElement(LetterRow, {
      key: l.id,
      letter: l,
      onOpen: onOpen
    })))));
  }
  window.HomeScreen = HomeScreen;
})();
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/app/HomeScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/app/Icons.jsx
try { (() => {
/* Lucide icons (ISC licensed) used across the Medifi app. One <Icon name/>
 * component so every glyph shares the same 2px stroke family. */
(function () {
  const P = {
    calendar: '<path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/>',
    list: '<path d="M8 6h13"/><path d="M8 12h13"/><path d="M8 18h13"/><path d="M3 6h.01"/><path d="M3 12h.01"/><path d="M3 18h.01"/>',
    clock: '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>',
    phone: '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>',
    info: '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/>',
    alert: '<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/>',
    id: '<rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/>',
    camera: '<path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/>',
    scan: '<path d="M3 7V5a2 2 0 0 1 2-2h2"/><path d="M17 3h2a2 2 0 0 1 2 2v2"/><path d="M21 17v2a2 2 0 0 1-2 2h-2"/><path d="M7 21H5a2 2 0 0 1-2-2v-2"/><path d="M7 12h10"/>',
    languages: '<path d="m5 8 6 6"/><path d="m4 14 6-6 2-3"/><path d="M2 5h12"/><path d="M7 2h1"/><path d="m22 22-5-10-5 10"/><path d="M14 18h6"/>',
    share: '<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" x2="15.42" y1="13.51" y2="17.49"/><line x1="15.41" x2="8.59" y1="6.51" y2="10.49"/>',
    pin: '<path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/>',
    chevronLeft: '<path d="m15 18-6-6 6-6"/>',
    chevronRight: '<path d="m9 18 6-6-6-6"/>',
    plus: '<path d="M5 12h14"/><path d="M12 5v14"/>',
    x: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
    file: '<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M16 13H8"/><path d="M16 17H8"/><path d="M10 9H8"/>',
    home: '<path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>',
    help: '<circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/>',
    bell: '<path d="M10.268 21a2 2 0 0 0 3.464 0"/><path d="M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673C19.41 13.956 18 12.499 18 8A6 6 0 0 0 6 8c0 4.499-1.41 5.956-2.738 7.326"/>',
    sparkle: '<path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"/>',
    check: '<path d="M20 6 9 17l-5-5"/>',
    lock: '<rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
    arrowRight: '<path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>'
  };
  function Icon({
    name,
    size = 24,
    strokeWidth = 2,
    style,
    className
  }) {
    return React.createElement("svg", {
      width: size,
      height: size,
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth,
      strokeLinecap: "round",
      strokeLinejoin: "round",
      className,
      style,
      "aria-hidden": "true",
      dangerouslySetInnerHTML: {
        __html: P[name] || ""
      }
    });
  }
  window.Icon = Icon;
})();
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/app/Icons.jsx", error: String((e && e.message) || e) }); }

// ui_kits/app/LettersScreen.jsx
try { (() => {
/* Medifi — Letters screen. Browse and filter all processed letters. */
(function () {
  const {
    Badge
  } = window.MedifiDesignSystem_063852;
  const Icon = window.Icon;
  const TONE = {
    safe: "safe",
    caution: "caution",
    risk: "risk"
  };
  const TEXT = {
    safe: "Looks fine",
    caution: "Check this",
    risk: "Needs attention"
  };
  function Row({
    letter,
    onOpen
  }) {
    return /*#__PURE__*/React.createElement("button", {
      type: "button",
      className: "mf-letter",
      onClick: () => onOpen(letter)
    }, /*#__PURE__*/React.createElement("span", {
      className: "mf-letter__icon"
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "file",
      size: 22
    })), /*#__PURE__*/React.createElement("span", {
      className: "mf-letter__main"
    }, /*#__PURE__*/React.createElement("span", {
      className: "mf-letter__sender"
    }, letter.sender), /*#__PURE__*/React.createElement("span", {
      className: "mf-letter__head"
    }, letter.headline), /*#__PURE__*/React.createElement("span", {
      className: "mf-letter__received"
    }, letter.received)), /*#__PURE__*/React.createElement("span", {
      className: "mf-letter__end"
    }, /*#__PURE__*/React.createElement(Badge, {
      tone: TONE[letter.worstLevel],
      dot: true
    }, TEXT[letter.worstLevel]), /*#__PURE__*/React.createElement(Icon, {
      name: "chevronRight",
      size: 20,
      className: "mf-letter__chev"
    })));
  }
  function LettersScreen({
    onOpen
  }) {
    const [filter, setFilter] = React.useState("all");
    const all = window.MEDIFI_LETTERS;
    const list = filter === "review" ? all.filter(l => l.worstLevel !== "safe") : all;
    const reviewCount = all.filter(l => l.worstLevel === "risk").length;
    return /*#__PURE__*/React.createElement("div", {
      className: "mf-screen"
    }, /*#__PURE__*/React.createElement("div", {
      className: "mf-chips"
    }, /*#__PURE__*/React.createElement("button", {
      type: "button",
      className: "mf-chip" + (filter === "all" ? " mf-chip--on" : ""),
      onClick: () => setFilter("all")
    }, "All letters (", all.length, ")"), /*#__PURE__*/React.createElement("button", {
      type: "button",
      className: "mf-chip" + (filter === "review" ? " mf-chip--on" : ""),
      onClick: () => setFilter("review")
    }, "To review")), reviewCount > 0 && /*#__PURE__*/React.createElement("div", {
      className: "mf-banner"
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "alert",
      size: 20
    }), /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("strong", null, reviewCount, " letter needs attention."), " Open it to see what to check.")), /*#__PURE__*/React.createElement("div", {
      className: "mf-list"
    }, list.map(l => /*#__PURE__*/React.createElement(Row, {
      key: l.id,
      letter: l,
      onOpen: onOpen
    }))));
  }
  window.LettersScreen = LettersScreen;
})();
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/app/LettersScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/app/ResultScreen.jsx
try { (() => {
/* Medifi — Result screen. The action plan: hero, risk alerts (signature),
 * plain-English summary, extracted fields, checklist, and tools. */
(function () {
  const {
    Button,
    Badge,
    Card,
    CardHeader,
    Eyebrow,
    RiskFlag,
    ChecklistItem,
    FieldRow,
    Input
  } = window.MedifiDesignSystem_063852;
  const Icon = window.Icon;
  const LANGS = ["English", "Urdu", "Bengali", "Polish", "Arabic", "Somali"];
  const LEVEL_TONE = {
    safe: "safe",
    caution: "caution",
    risk: "risk"
  };
  function ResultScreen({
    letter,
    onAddReminders
  }) {
    const [done, setDone] = React.useState({});
    const [showOriginal, setShowOriginal] = React.useState(false);
    const [lang, setLang] = React.useState("English");
    const [langOpen, setLangOpen] = React.useState(false);
    const [q, setQ] = React.useState("");
    const [asked, setAsked] = React.useState(false);
    const [toast, setToast] = React.useState(false);
    const toggle = id => setDone(d => ({
      ...d,
      [id]: !d[id]
    }));
    function shareCarer() {
      setToast(true);
      window.clearTimeout(shareCarer._t);
      shareCarer._t = window.setTimeout(() => setToast(false), 2800);
    }
    const answer = "From this letter: " + letter.summary + " If anything is still unclear, call the contact on your letter or your GP — and always check against the original.";
    const riskCount = letter.risks.filter(r => r.level !== "safe").length;
    return /*#__PURE__*/React.createElement("div", {
      className: "mf-screen mf-screen--result"
    }, /*#__PURE__*/React.createElement("div", {
      className: "mf-hero"
    }, /*#__PURE__*/React.createElement(Eyebrow, {
      tone: "accent"
    }, "Your plan"), /*#__PURE__*/React.createElement("h1", {
      className: "mf-hero__h"
    }, letter.headline), /*#__PURE__*/React.createElement("div", {
      className: "mf-hero__when"
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "clock",
      size: 18
    }), /*#__PURE__*/React.createElement("span", null, letter.when))), lang !== "English" && /*#__PURE__*/React.createElement("div", {
      className: "mf-xlate-note"
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "languages",
      size: 16
    }), /*#__PURE__*/React.createElement("span", null, "Showing a supportive ", lang, " summary. Your original English letter is the source of truth.")), /*#__PURE__*/React.createElement("div", {
      className: "mf-section"
    }, /*#__PURE__*/React.createElement("p", {
      className: "mf-section__label"
    }, "What to check", riskCount > 0 && /*#__PURE__*/React.createElement(Badge, {
      tone: LEVEL_TONE[letter.worstLevel]
    }, riskCount, " to review")), /*#__PURE__*/React.createElement("div", {
      className: "mf-stack"
    }, letter.risks.map((r, i) => /*#__PURE__*/React.createElement(RiskFlag, {
      key: i,
      level: r.level,
      title: r.title,
      action: r.level === "risk" ? /*#__PURE__*/React.createElement(Button, {
        variant: "danger",
        size: "sm",
        iconLeft: /*#__PURE__*/React.createElement(Icon, {
          name: "phone",
          size: 16
        })
      }, "Call to check") : null
    }, r.text)))), /*#__PURE__*/React.createElement("div", {
      className: "mf-section"
    }, /*#__PURE__*/React.createElement("p", {
      className: "mf-section__label"
    }, "In plain English"), /*#__PURE__*/React.createElement(Card, {
      variant: "accent"
    }, /*#__PURE__*/React.createElement("p", {
      className: "mf-summary"
    }, letter.summary))), /*#__PURE__*/React.createElement("div", {
      className: "mf-section"
    }, /*#__PURE__*/React.createElement("p", {
      className: "mf-section__label"
    }, "The details Medifi found"), /*#__PURE__*/React.createElement(Card, null, letter.fields.map((f, i) => /*#__PURE__*/React.createElement(FieldRow, {
      key: i,
      label: f.label,
      value: f.value,
      missing: f.missing
    }))), /*#__PURE__*/React.createElement("button", {
      type: "button",
      className: "mf-link",
      onClick: () => setShowOriginal(s => !s)
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "file",
      size: 16
    }), showOriginal ? "Hide original letter" : "Show original letter"), showOriginal && /*#__PURE__*/React.createElement("pre", {
      className: "mf-original"
    }, letter.original)), /*#__PURE__*/React.createElement("div", {
      className: "mf-section"
    }, /*#__PURE__*/React.createElement("p", {
      className: "mf-section__label"
    }, "What to do next"), /*#__PURE__*/React.createElement("div", {
      className: "mf-stack"
    }, letter.checklist.map(c => /*#__PURE__*/React.createElement(ChecklistItem, {
      key: c.id,
      label: c.label,
      meta: c.meta,
      icon: /*#__PURE__*/React.createElement(Icon, {
        name: c.icon,
        size: 20
      }),
      done: !!done[c.id],
      onToggle: () => toggle(c.id)
    })))), /*#__PURE__*/React.createElement("div", {
      className: "mf-section"
    }, /*#__PURE__*/React.createElement("p", {
      className: "mf-section__label"
    }, "Ask about this letter"), /*#__PURE__*/React.createElement("div", {
      className: "mf-ask"
    }, /*#__PURE__*/React.createElement("div", {
      className: "mf-ask__row"
    }, /*#__PURE__*/React.createElement(Input, {
      placeholder: "e.g. What do I need to bring?",
      value: q,
      onChange: e => setQ(e.target.value),
      onKeyDown: e => {
        if (e.key === "Enter" && q.trim()) setAsked(true);
      }
    }), /*#__PURE__*/React.createElement(Button, {
      variant: "secondary",
      iconLeft: /*#__PURE__*/React.createElement(Icon, {
        name: "arrowRight",
        size: 18
      }),
      disabled: !q.trim(),
      onClick: () => setAsked(true),
      "aria-label": "Ask"
    })), asked && /*#__PURE__*/React.createElement("div", {
      className: "mf-ask__answer"
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "sparkle",
      size: 18
    }), /*#__PURE__*/React.createElement("span", null, answer)))), letter.medicines && /*#__PURE__*/React.createElement("div", {
      className: "mf-section"
    }, /*#__PURE__*/React.createElement("p", {
      className: "mf-section__label"
    }, "Medicine reminders"), /*#__PURE__*/React.createElement("div", {
      className: "mf-stack"
    }, letter.medicines.map((m, i) => /*#__PURE__*/React.createElement("div", {
      key: i,
      className: "mf-med"
    }, /*#__PURE__*/React.createElement("span", {
      className: "mf-med__icon"
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "clock",
      size: 20
    })), /*#__PURE__*/React.createElement("div", {
      className: "mf-med__main"
    }, /*#__PURE__*/React.createElement("span", {
      className: "mf-med__name"
    }, m.name), /*#__PURE__*/React.createElement("span", {
      className: "mf-med__note"
    }, m.dose, " \xB7 ", m.note), /*#__PURE__*/React.createElement("div", {
      className: "mf-med__times"
    }, m.times.map(t => /*#__PURE__*/React.createElement("span", {
      key: t,
      className: "mf-med__time"
    }, t)), /*#__PURE__*/React.createElement("span", {
      className: "mf-med__days"
    }, "for ", m.days, " days")))))), /*#__PURE__*/React.createElement(Button, {
      variant: "secondary",
      fullWidth: true,
      iconLeft: /*#__PURE__*/React.createElement(Icon, {
        name: "calendar",
        size: 18
      }),
      onClick: onAddReminders
    }, "Add reminders to my calendar")), /*#__PURE__*/React.createElement("div", {
      className: "mf-tools"
    }, /*#__PURE__*/React.createElement("button", {
      type: "button",
      className: "mf-tool",
      onClick: () => setLangOpen(o => !o)
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "languages",
      size: 20
    }), /*#__PURE__*/React.createElement("span", null, lang === "English" ? "Translate" : lang)), /*#__PURE__*/React.createElement("button", {
      type: "button",
      className: "mf-tool",
      onClick: shareCarer
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "share",
      size: 20
    }), /*#__PURE__*/React.createElement("span", null, "Send to a carer"))), langOpen && /*#__PURE__*/React.createElement("div", {
      className: "mf-langs"
    }, LANGS.map(l => /*#__PURE__*/React.createElement("button", {
      key: l,
      type: "button",
      className: "mf-chip" + (lang === l ? " mf-chip--on" : ""),
      onClick: () => {
        setLang(l);
        setLangOpen(false);
      }
    }, l))), /*#__PURE__*/React.createElement("p", {
      className: "mf-disclaimer"
    }, "Medifi explains and organises NHS information. It does not give medical advice. Always check against your original letter."), toast && /*#__PURE__*/React.createElement("div", {
      className: "mf-toast"
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "check",
      size: 18
    }), /*#__PURE__*/React.createElement("span", null, "Summary sent to your carer.")));
  }
  window.ResultScreen = ResultScreen;
})();
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/app/ResultScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/app/ScanScreen.jsx
try { (() => {
/* Medifi — Scan/Paste screen. Choose photo (camera + OCR mockup) or paste;
 * or pick a sample letter, then "Make my plan". */
(function () {
  const {
    Button,
    Input
  } = window.MedifiDesignSystem_063852;
  const Icon = window.Icon;

  // A styled fake NHS letter shown inside the viewfinder (no real data, no image).
  function PaperLetter() {
    const l = window.MEDIFI_LETTERS[0];
    return /*#__PURE__*/React.createElement("div", {
      className: "mf-cam__paper"
    }, /*#__PURE__*/React.createElement("h5", null, "St Thomas' Hospital"), /*#__PURE__*/React.createElement("pre", null, l.original));
  }
  function CameraView({
    onCancel,
    onCapture,
    reading
  }) {
    return /*#__PURE__*/React.createElement("div", {
      className: "mf-cam"
    }, /*#__PURE__*/React.createElement("div", {
      className: "mf-cam__top"
    }, /*#__PURE__*/React.createElement("button", {
      type: "button",
      className: "mf-cam__btn",
      "aria-label": "Cancel",
      onClick: onCancel,
      disabled: reading
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "x",
      size: 22
    })), /*#__PURE__*/React.createElement("span", {
      className: "t"
    }, reading ? "Reading…" : "Scan a letter"), /*#__PURE__*/React.createElement("span", {
      style: {
        width: 40
      }
    })), /*#__PURE__*/React.createElement("div", {
      className: "mf-cam__view"
    }, /*#__PURE__*/React.createElement(PaperLetter, null), /*#__PURE__*/React.createElement("div", {
      className: "mf-cam__frame"
    }, /*#__PURE__*/React.createElement("span", null), /*#__PURE__*/React.createElement("span", null), /*#__PURE__*/React.createElement("span", null), /*#__PURE__*/React.createElement("span", null)), reading ? /*#__PURE__*/React.createElement("div", {
      className: "mf-scanline"
    }) : /*#__PURE__*/React.createElement("p", {
      className: "mf-cam__hint"
    }, "Line up the whole letter inside the frame"), reading && /*#__PURE__*/React.createElement("div", {
      className: "mf-cam__reading"
    }, /*#__PURE__*/React.createElement("p", {
      className: "t"
    }, "Reading your letter\u2026"), /*#__PURE__*/React.createElement("p", {
      className: "s"
    }, "Finding the date, place, and what to do next."))), /*#__PURE__*/React.createElement("div", {
      className: "mf-cam__bar"
    }, !reading && /*#__PURE__*/React.createElement("button", {
      type: "button",
      className: "mf-cam__shutter",
      "aria-label": "Take photo",
      onClick: onCapture
    })));
  }
  function ScanScreen({
    onAnalyze
  }) {
    const [text, setText] = React.useState("");
    const [picked, setPicked] = React.useState(null);
    const [mode, setMode] = React.useState("form"); // form | camera | reading

    function pickSample(letter) {
      setText(letter.original);
      setPicked(letter);
    }
    function analyze() {
      onAnalyze(picked || window.MEDIFI_LETTERS[0]);
    }
    function capture() {
      setMode("reading");
      window.setTimeout(() => onAnalyze(window.MEDIFI_LETTERS[0], true), 1800);
    }
    if (mode !== "form") {
      return /*#__PURE__*/React.createElement(CameraView, {
        reading: mode === "reading",
        onCancel: () => setMode("form"),
        onCapture: capture
      });
    }
    return /*#__PURE__*/React.createElement("div", {
      className: "mf-screen"
    }, /*#__PURE__*/React.createElement("div", {
      className: "mf-tiles"
    }, /*#__PURE__*/React.createElement("button", {
      type: "button",
      className: "mf-tile",
      onClick: () => setMode("camera")
    }, /*#__PURE__*/React.createElement("span", {
      className: "mf-tile__icon"
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "camera",
      size: 26
    })), /*#__PURE__*/React.createElement("span", {
      className: "mf-tile__t"
    }, "Take a photo"), /*#__PURE__*/React.createElement("span", {
      className: "mf-tile__s"
    }, "Use your camera")), /*#__PURE__*/React.createElement("button", {
      type: "button",
      className: "mf-tile mf-tile--alt",
      onClick: () => document.getElementById("mf-paste")?.focus()
    }, /*#__PURE__*/React.createElement("span", {
      className: "mf-tile__icon"
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "file",
      size: 26
    })), /*#__PURE__*/React.createElement("span", {
      className: "mf-tile__t"
    }, "Paste text"), /*#__PURE__*/React.createElement("span", {
      className: "mf-tile__s"
    }, "From a message or email"))), /*#__PURE__*/React.createElement("div", {
      className: "mf-section"
    }, /*#__PURE__*/React.createElement("p", {
      className: "mf-section__label"
    }, "Or try a sample letter"), /*#__PURE__*/React.createElement("div", {
      className: "mf-chips"
    }, window.MEDIFI_LETTERS.map(l => /*#__PURE__*/React.createElement("button", {
      key: l.id,
      type: "button",
      className: "mf-chip" + (picked && picked.id === l.id ? " mf-chip--on" : ""),
      onClick: () => pickSample(l)
    }, l.chip)))), /*#__PURE__*/React.createElement("div", {
      className: "mf-paste-wrap"
    }, /*#__PURE__*/React.createElement(Input, {
      id: "mf-paste",
      multiline: true,
      label: "Letter text",
      placeholder: "Paste the words from your NHS letter, text message, or email here\u2026",
      value: text,
      onChange: e => {
        setText(e.target.value);
        setPicked(null);
      }
    })), /*#__PURE__*/React.createElement(Button, {
      variant: "primary",
      size: "lg",
      fullWidth: true,
      disabled: !text.trim(),
      iconLeft: /*#__PURE__*/React.createElement(Icon, {
        name: "sparkle",
        size: 20
      }),
      onClick: analyze
    }, "Make my plan"), /*#__PURE__*/React.createElement("p", {
      className: "mf-disclaimer"
    }, "Medifi helps you understand and organise letters. Always check against your original letter."));
  }
  window.ScanScreen = ScanScreen;
})();
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/app/ScanScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/app/UpdatesScreen.jsx
try { (() => {
/* Medifi — Updates from the care team. ONE-WAY: the doctor/clinic pushes
 * messages; the patient can read and act, but cannot reply (locked composer). */
(function () {
  const {
    Button,
    Badge
  } = window.MedifiDesignSystem_063852;
  const Icon = window.Icon;
  const TONE = {
    safe: "safe",
    caution: "caution",
    risk: "risk",
    brand: "brand",
    neutral: "neutral"
  };
  function UpdateCard({
    u,
    onCal
  }) {
    return /*#__PURE__*/React.createElement("div", {
      className: "mf-update" + (u.unread ? " mf-update--unread" : "")
    }, /*#__PURE__*/React.createElement("div", {
      className: "mf-update__head"
    }, /*#__PURE__*/React.createElement("span", {
      className: "mf-update__avatar"
    }, u.initial), /*#__PURE__*/React.createElement("span", {
      className: "mf-update__who"
    }, /*#__PURE__*/React.createElement("span", {
      className: "mf-update__from"
    }, u.from, u.unread && /*#__PURE__*/React.createElement("span", {
      className: "mf-update__dot",
      "aria-label": "Unread"
    })), /*#__PURE__*/React.createElement("span", {
      className: "mf-update__role"
    }, u.role, " \xB7 ", u.time))), /*#__PURE__*/React.createElement(Badge, {
      tone: TONE[u.tone] || "neutral"
    }, u.type), /*#__PURE__*/React.createElement("p", {
      className: "mf-update__body"
    }, u.body), u.action && /*#__PURE__*/React.createElement("div", {
      className: "mf-update__action"
    }, u.action.kind === "calendar" && /*#__PURE__*/React.createElement(Button, {
      variant: "secondary",
      size: "sm",
      iconLeft: /*#__PURE__*/React.createElement(Icon, {
        name: "calendar",
        size: 16
      }),
      onClick: () => onCal(u)
    }, u.action.label), u.action.kind === "call" && /*#__PURE__*/React.createElement(Button, {
      as: "a",
      href: "tel:" + u.action.tel,
      variant: "secondary",
      size: "sm",
      iconLeft: /*#__PURE__*/React.createElement(Icon, {
        name: "phone",
        size: 16
      })
    }, u.action.label)));
  }
  function UpdatesScreen({
    onCal
  }) {
    return /*#__PURE__*/React.createElement("div", {
      className: "mf-updates"
    }, /*#__PURE__*/React.createElement("div", {
      className: "mf-updates__list"
    }, /*#__PURE__*/React.createElement("div", {
      className: "mf-trust"
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "check",
      size: 16
    }), /*#__PURE__*/React.createElement("span", null, "Verified messages from your NHS care team.")), window.MEDIFI_UPDATES.map(u => /*#__PURE__*/React.createElement(UpdateCard, {
      key: u.id,
      u: u,
      onCal: onCal
    }))), /*#__PURE__*/React.createElement("div", {
      className: "mf-locked",
      "aria-hidden": "false"
    }, /*#__PURE__*/React.createElement("span", {
      className: "mf-locked__icon"
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "lock",
      size: 18
    })), /*#__PURE__*/React.createElement("span", {
      className: "mf-locked__text"
    }, "Replies are off. This is a one-way update from your care team \u2014 to respond, use the contact details in the message.")));
  }
  window.UpdatesScreen = UpdatesScreen;
})();
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/app/UpdatesScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/app/calendar.js
try { (() => {
/* Medifi — calendar helpers. Generates REAL calendar artefacts so reminders
 * actually pop up: a Google Calendar template URL, and a valid .ics file
 * (Apple Calendar, Outlook, Google import) with alarms + recurrence for
 * medicine schedules. No backend needed. */
(function () {
  function pad(n) {
    return String(n).padStart(2, "0");
  }

  // Local "floating" time string YYYYMMDDTHHMMSS (no Z → uses device TZ).
  function fmt(d) {
    return d.getFullYear() + pad(d.getMonth() + 1) + pad(d.getDate()) + "T" + pad(d.getHours()) + pad(d.getMinutes()) + "00";
  }
  function fmtUTCstamp() {
    const d = new Date();
    return d.getUTCFullYear() + pad(d.getUTCMonth() + 1) + pad(d.getUTCDate()) + "T" + pad(d.getUTCHours()) + pad(d.getUTCMinutes()) + pad(d.getUTCSeconds()) + "Z";
  }
  function esc(s) {
    return String(s || "").replace(/[\\,;]/g, "\\$&").replace(/\n/g, "\\n");
  }
  function uid() {
    return "medifi-" + Math.random().toString(36).slice(2) + "@medifi.app";
  }

  // Google Calendar template URL for a single event.
  function googleUrl(ev) {
    const p = new URLSearchParams({
      action: "TEMPLATE",
      text: ev.title,
      dates: fmt(ev.start) + "/" + fmt(ev.end),
      details: ev.description || "",
      location: ev.location || ""
    });
    return "https://calendar.google.com/calendar/render?" + p.toString();
  }
  function vevent(ev) {
    const lines = ["BEGIN:VEVENT", "UID:" + uid(), "DTSTAMP:" + fmtUTCstamp(), "DTSTART:" + fmt(ev.start), "DTEND:" + fmt(ev.end), "SUMMARY:" + esc(ev.title)];
    if (ev.location) lines.push("LOCATION:" + esc(ev.location));
    if (ev.description) lines.push("DESCRIPTION:" + esc(ev.description));
    if (ev.rrule) lines.push("RRULE:" + ev.rrule);
    if (ev.alarmMins != null) {
      lines.push("BEGIN:VALARM", "ACTION:DISPLAY", "DESCRIPTION:" + esc(ev.title), "TRIGGER:-PT" + ev.alarmMins + "M", "END:VALARM");
    }
    lines.push("END:VEVENT");
    return lines.join("\r\n");
  }
  function icsText(events) {
    return ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Medifi//Letter Lens//EN", "CALSCALE:GREGORIAN", ...events.map(vevent), "END:VCALENDAR"].join("\r\n");
  }
  function downloadIcs(events, filename) {
    const blob = new Blob([icsText(events)], {
      type: "text/calendar;charset=utf-8"
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = (filename || "medifi") + ".ics";
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 200);
  }

  // Build recurring medicine reminder events from a prescription.
  // med = { name, dose, times: ["08:00", ...], days }
  function medicineEvents(medicines, startDate) {
    const base = startDate || new Date();
    const out = [];
    medicines.forEach(m => {
      (m.times || []).forEach(t => {
        const [hh, mm] = t.split(":").map(Number);
        const start = new Date(base);
        start.setHours(hh, mm, 0, 0);
        const end = new Date(start.getTime() + 10 * 60000);
        out.push({
          title: "Take " + m.name + " (" + m.dose + ")",
          start,
          end,
          description: "Medifi medicine reminder. Follow your prescription and pharmacist's advice.",
          rrule: "FREQ=DAILY;COUNT=" + (m.days || 7),
          alarmMins: 0
        });
      });
    });
    return out;
  }
  window.MedifiCal = {
    googleUrl,
    icsText,
    downloadIcs,
    medicineEvents,
    fmt
  };
})();
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/app/calendar.js", error: String((e && e.message) || e) }); }

// ui_kits/app/data.js
try { (() => {
/* Three realistic (but fake) NHS-style letters and Medifi's parsed output.
 * No real patient data. Used by the Medifi app UI kit demo. */

window.MEDIFI_LETTERS = [{
  id: "derm",
  event: {
    title: "Dermatology appointment — St Thomas'",
    y: 2026,
    mo: 6,
    d: 12,
    h: 10,
    min: 30,
    durMins: 30,
    location: "St Thomas' Hospital, Clinic B"
  },
  chip: "Appointment letter",
  sender: "St Thomas' Hospital · Dermatology",
  received: "Received 2 days ago",
  worstLevel: "caution",
  original: `Dear Ms Khan,

NHS number: 485 777 3456

You are invited to attend the Dermatology Outpatient
Department for a review appointment.

Date: Tuesday 12 June 2026 at 10:30
Venue: St Thomas' Hospital, Clinic B, 2nd Floor

Please arrive 15 minutes before your appointment and
bring a list of your current medications. Failure to
attend may result in discharge back to your GP.

Appointments line: 020 7188 7188`,
  headline: "Skin (dermatology) appointment",
  when: "Tuesday 12 June, 10:30am",
  summary: "You have a skin (dermatology) check-up appointment. Arrive 15 minutes early and bring a list of the medicines you take. If you can't go, call the appointments line so you don't lose your place.",
  fields: [{
    label: "Appointment",
    value: "Dermatology review"
  }, {
    label: "Date & time",
    value: "Tue 12 Jun 2026, 10:30am"
  }, {
    label: "Location",
    value: "St Thomas', Clinic B, 2nd flr"
  }, {
    label: "What to bring",
    value: "List of your medicines"
  }, {
    label: "Phone",
    value: "020 7188 7188"
  }],
  checklist: [{
    id: "cal",
    label: "Add to your calendar",
    meta: "Tue 12 Jun, 10:30am",
    icon: "calendar"
  }, {
    id: "meds",
    label: "Write a list of your medicines",
    icon: "list"
  }, {
    id: "early",
    label: "Plan to arrive 15 minutes early",
    meta: "By 10:15am",
    icon: "clock"
  }, {
    id: "id",
    label: "Bring photo ID and your NHS number",
    icon: "id"
  }],
  risks: [{
    level: "caution",
    title: "No cancellation deadline given",
    text: "The letter doesn't say how much notice to give if you can't attend. Call the appointments line as soon as you know."
  }, {
    level: "safe",
    title: "Date, place and phone number all found",
    text: "The key details are all present in this letter."
  }]
}, {
  id: "referral",
  event: {
    title: "Chase cardiology referral",
    y: 2026,
    mo: 8,
    d: 30,
    h: 9,
    min: 0,
    durMins: 15,
    location: "",
    chase: true
  },
  chip: "Referral letter",
  sender: "GP Surgery · Cardiology referral",
  received: "Received 5 days ago",
  worstLevel: "caution",
  original: `Dear Patient,

We have referred you to the Cardiology service following
your recent appointment. You are now on the waiting list.

The hospital will contact you directly with an appointment
date. Waiting times are currently 14–18 weeks.

If your symptoms get worse while you wait, contact your GP
or call 111.`,
  headline: "Heart (cardiology) referral",
  when: "Waiting for a date",
  summary: "Your GP has asked the heart (cardiology) team to see you. You're now on their waiting list. The hospital — not your GP — will write to you with a date. This can take around 14 to 18 weeks.",
  fields: [{
    label: "Referred to",
    value: "Cardiology service"
  }, {
    label: "Status",
    value: "On the waiting list"
  }, {
    label: "Expected wait",
    value: "14–18 weeks"
  }, {
    label: "Who contacts you",
    value: "The hospital"
  }, {
    label: "Appointment date",
    missing: true
  }, {
    label: "Phone",
    missing: true
  }],
  checklist: [{
    id: "wait",
    label: "Note that the hospital will contact you",
    meta: "Not your GP",
    icon: "info"
  }, {
    id: "diary",
    label: "Set a reminder to chase if nothing arrives",
    meta: "In about 12 weeks",
    icon: "clock"
  }, {
    id: "worse",
    label: "Save 111 in case symptoms get worse",
    icon: "phone"
  }],
  risks: [{
    level: "caution",
    title: "No phone number to chase your referral",
    text: "If you hear nothing in 12–14 weeks, the letter doesn't say who to call. Contact your GP surgery and ask for the cardiology booking line."
  }, {
    level: "caution",
    title: "No appointment date yet",
    text: "This is normal for a referral — but keep this letter so you can prove when you were referred."
  }]
}, {
  id: "badadmin",
  event: {
    title: "Endoscopy — City Hospital",
    y: 2026,
    mo: 6,
    d: 2,
    h: 9,
    min: 0,
    durMins: 60,
    location: "City Hospital, Endoscopy Unit"
  },
  chip: "Confusing letter",
  sender: "City Hospital · Endoscopy unit",
  received: "Received today",
  worstLevel: "risk",
  original: `Dear Mr Patient,

Your appointment for an endoscopy is confirmed.

Date: 2 June 2026, 9:00am
Location: Endoscopy Unit

Please do not eat for several hours before your
procedure. Someone must collect you afterwards.

We look forward to seeing you.`,
  headline: "Camera test (endoscopy)",
  when: "Date may have passed",
  summary: "This letter is about a camera test of your stomach (endoscopy). Some important details look wrong or missing, so please read the warnings below before you do anything else.",
  fields: [{
    label: "Procedure",
    value: "Endoscopy"
  }, {
    label: "Date & time",
    value: "2 Jun 2026, 9:00am"
  }, {
    label: "Location",
    value: "Endoscopy Unit (no address)"
  }, {
    label: "Fasting",
    value: "\"several hours\" — unclear"
  }, {
    label: "Phone",
    missing: true
  }],
  checklist: [{
    id: "check",
    label: "Check the date against today",
    meta: "It may have passed",
    icon: "alert"
  }, {
    id: "transport",
    label: "Arrange someone to collect you",
    icon: "id"
  }, {
    id: "gp",
    label: "Call your GP to confirm this is still booked",
    icon: "phone"
  }],
  risks: [{
    level: "risk",
    title: "This date may have already passed",
    text: "The letter says 2 June 2026, which is before today. Don't assume it's cancelled — call the hospital or your GP to check before you miss care."
  }, {
    level: "risk",
    title: "No phone number on the letter",
    text: "There's no number to call to confirm or rebook. Look up 'City Hospital endoscopy' or ask your GP surgery for the unit's direct line."
  }, {
    level: "caution",
    title: "Fasting time is vague",
    text: "It says 'do not eat for several hours' but not exactly how long. Ask when you call — fasting too little can mean your test is cancelled on the day."
  }]
}, {
  id: "rx",
  chip: "Prescription",
  sender: "GP Surgery · Repeat prescription",
  received: "Received 1 hour ago",
  worstLevel: "caution",
  medicines: [{
    name: "Amoxicillin 500mg",
    dose: "1 capsule",
    times: ["08:00", "14:00", "20:00"],
    days: 7,
    note: "3 times a day, finish the course"
  }, {
    name: "Ibuprofen 400mg",
    dose: "1 tablet",
    times: ["08:00", "20:00"],
    days: 5,
    note: "twice a day, with food"
  }],
  original: `PRESCRIPTION

Patient: Ms A Khan    NHS number: 485 777 3456

1. Amoxicillin 500mg capsules
   Take ONE capsule THREE times a day for 7 days.

2. Ibuprofen 400mg tablets
   Take ONE tablet TWICE a day with food for 5 days.

Collect from: Boots Pharmacy, High Street.
Speak to your pharmacist if you have questions.`,
  headline: "Your prescription",
  when: "Start today",
  summary: "You have two medicines to take. Amoxicillin is an antibiotic — take it 3 times a day and finish the whole course, even if you feel better. Ibuprofen is for pain — take it twice a day with food.",
  fields: [{
    label: "Medicine 1",
    value: "Amoxicillin 500mg"
  }, {
    label: "How often",
    value: "3x a day · 7 days"
  }, {
    label: "Medicine 2",
    value: "Ibuprofen 400mg"
  }, {
    label: "How often",
    value: "2x a day, with food · 5 days"
  }, {
    label: "Collect from",
    value: "Boots, High Street"
  }],
  checklist: [{
    id: "collect",
    label: "Collect your medicines from the pharmacy",
    meta: "Boots, High Street",
    icon: "pin"
  }, {
    id: "remind",
    label: "Set medicine reminders on your calendar",
    icon: "calendar"
  }, {
    id: "food",
    label: "Take ibuprofen with food",
    icon: "info"
  }, {
    id: "finish",
    label: "Finish the whole antibiotic course",
    meta: "All 7 days",
    icon: "check"
  }],
  risks: [{
    level: "caution",
    title: "Finish the whole antibiotic course",
    text: "Keep taking Amoxicillin for all 7 days even if you feel better, or the infection can come back. Ask your pharmacist if you're unsure."
  }, {
    level: "safe",
    title: "Doses and timings are clear",
    text: "Both medicines have a clear amount and how often to take them."
  }]
}];

/* One-way updates pushed from the care team to the patient. The patient can
 * read and act, but cannot reply (see UpdatesScreen's locked composer). */
window.MEDIFI_UPDATES = [{
  id: "u1",
  from: "Dr Amelia Patel",
  role: "GP · Riverside Surgery",
  initial: "P",
  time: "2 hours ago",
  unread: true,
  type: "Results",
  tone: "safe",
  body: "Good news — your recent blood test results are back and all are within the normal range. There's nothing you need to do. We'll keep this on file for your next review."
}, {
  id: "u2",
  from: "Dermatology Booking Team",
  role: "St Thomas' Hospital",
  initial: "S",
  time: "Yesterday, 4:12pm",
  unread: true,
  type: "Appointment change",
  tone: "caution",
  body: "We've had to move your dermatology appointment. It is now Thursday 14 June at 11:00am, Clinic B. Please update your calendar. If this time doesn't work, call the appointments line.",
  event: {
    title: "Dermatology appointment (rebooked) — St Thomas'",
    y: 2026,
    mo: 6,
    d: 14,
    h: 11,
    min: 0,
    durMins: 30,
    location: "St Thomas' Hospital, Clinic B"
  },
  summary: "Rebooked dermatology appointment on Thursday 14 June at 11:00am, Clinic B, St Thomas' Hospital.",
  action: {
    kind: "calendar",
    label: "Update my calendar"
  }
}, {
  id: "u3",
  from: "Boots Pharmacy",
  role: "High Street",
  initial: "B",
  time: "2 days ago",
  unread: false,
  type: "Prescription",
  tone: "brand",
  body: "Your prescription is ready to collect. We're open until 6pm today. Please bring photo ID if someone is collecting on your behalf.",
  action: {
    kind: "call",
    label: "Call the pharmacy",
    tel: "02072221234"
  }
}, {
  id: "u4",
  from: "Riverside Surgery",
  role: "Practice team",
  initial: "R",
  time: "Last week",
  unread: false,
  type: "Information",
  tone: "neutral",
  body: "Flu and COVID vaccines are now available at the surgery. If you're eligible you'll have received a separate invite — there's no need to reply to this message."
}];
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/app/data.js", error: String((e && e.message) || e) }); }

__ds_ns.ChecklistItem = __ds_scope.ChecklistItem;

__ds_ns.FieldRow = __ds_scope.FieldRow;

__ds_ns.Badge = __ds_scope.Badge;

__ds_ns.Button = __ds_scope.Button;

__ds_ns.Card = __ds_scope.Card;

__ds_ns.CardHeader = __ds_scope.CardHeader;

__ds_ns.Eyebrow = __ds_scope.Eyebrow;

__ds_ns.Input = __ds_scope.Input;

__ds_ns.RiskFlag = __ds_scope.RiskFlag;

})();
