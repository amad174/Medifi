import React from "react";

/** FieldRow — one extracted structured field (label + mono value), with an
 *  optional "missing" state when Medifi couldn't find it in the letter. */
function useStyleOnce(id, css) {
  React.useEffect(() => {
    if (document.getElementById(id)) return;
    const el = document.createElement("style");
    el.id = id; el.textContent = css; document.head.appendChild(el);
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

export function FieldRow({ label, value, missing = false, className = "", ...rest }) {
  useStyleOnce("mf-fieldrow-styles", CSS);
  const cls = ["mf-fieldrow", missing ? "mf-fieldrow--missing" : "", className].filter(Boolean).join(" ");
  return (
    <div className={cls} {...rest}>
      <span className="mf-fieldrow__key">{label}</span>
      <span className="mf-fieldrow__val">{missing ? "Not found in letter" : value}</span>
    </div>
  );
}
