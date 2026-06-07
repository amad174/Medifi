import React from "react";

function useStyleOnce(id, css) {
  React.useEffect(() => {
    if (document.getElementById(id)) return;
    const el = document.createElement("style");
    el.id = id; el.textContent = css; document.head.appendChild(el);
  }, [id, css]);
}

const CSS = `
.mf-field{display:flex;flex-direction:column;gap:var(--space-2);font-family:var(--font-sans);}
.mf-field__label{font:var(--type-label);color:var(--text-primary);}
.mf-field__hint{font:var(--type-caption);color:var(--text-muted);}
.mf-field__err{font:var(--type-caption);color:var(--risk-text);}
.mf-input,.mf-textarea{
  width:100%;box-sizing:border-box;font-family:var(--font-sans);
  font-size:max(16px,var(--text-md));color:var(--text-primary);
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

export function Input({ label, hint, error, multiline = false, id, className = "", ...rest }) {
  useStyleOnce("mf-input-styles", CSS);
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
