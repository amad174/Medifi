import * as React from "react";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Colour tone. Risk tones (safe/caution/risk) mirror the traffic-light system. */
  tone?: "neutral" | "brand" | "accent" | "safe" | "caution" | "risk";
  /** Show a leading status dot in the current colour. */
  dot?: boolean;
  /** Optional leading icon node. */
  iconLeft?: React.ReactNode;
  children?: React.ReactNode;
}

/** Small pill label for status, category, or count. */
export function Badge(props: BadgeProps): JSX.Element;
