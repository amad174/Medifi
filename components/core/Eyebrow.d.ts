import * as React from "react";

export interface EyebrowProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Colour. muted (default), brand, or accent. */
  tone?: "muted" | "brand" | "accent";
  children?: React.ReactNode;
}

/** Small tracked uppercase overline label (e.g. "WHAT TO BRING"). The only place ALL CAPS is allowed. */
export function Eyebrow(props: EyebrowProps): JSX.Element;
