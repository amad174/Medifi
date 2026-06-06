import React from "react";

function useStyleOnce(id, css) {
  React.useEffect(() => {
    if (document.getElementById(id)) return;
    const el = document.createElement("style");
    el.id = id; el.textContent = css; document.head.appendChild(el);
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

export function Card({ children, variant = "default", className = "", ...rest }) {
  useStyleOnce("mf-card-styles", CSS);
  const cls = ["mf-card", variant !== "default" ? `mf-card--${variant}` : "", className].filter(Boolean).join(" ");
  return <div className={cls} {...rest}>{children}</div>;
}

export function CardHeader({ title, subtitle, action }) {
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
