import React from "react";

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

export function Button({
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
