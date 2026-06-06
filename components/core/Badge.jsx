import React from "react";

function useStyleOnce(id, css) {
  React.useEffect(() => {
    if (document.getElementById(id)) return;
    const el = document.createElement("style");
    el.id = id; el.textContent = css; document.head.appendChild(el);
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

export function Badge({ children, tone = "neutral", dot = false, iconLeft, className = "", ...rest }) {
  useStyleOnce("mf-badge-styles", CSS);
  const cls = ["mf-badge", `mf-badge--${tone}`, dot ? "mf-badge--dot" : "", className].filter(Boolean).join(" ");
  return <span className={cls} {...rest}>{iconLeft}{children}</span>;
}
