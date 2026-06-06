import React from "react";

function useStyleOnce(id, css) {
  React.useEffect(() => {
    if (document.getElementById(id)) return;
    const el = document.createElement("style");
    el.id = id; el.textContent = css; document.head.appendChild(el);
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

export function Eyebrow({ children, tone = "muted", className = "", ...rest }) {
  useStyleOnce("mf-eyebrow-styles", CSS);
  const cls = ["mf-eyebrow", tone !== "muted" ? `mf-eyebrow--${tone}` : "", className].filter(Boolean).join(" ");
  return <span className={cls} {...rest}>{children}</span>;
}
