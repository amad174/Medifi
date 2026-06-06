import * as React from "react";

/**
 * Props for the primary action control.
 * @startingPoint section="Core" subtitle="Buttons — primary, secondary, ghost, danger" viewport="700x150"
 */
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Visual style. Primary = main action; secondary = outlined; ghost = low-emphasis; danger = destructive. */
  variant?: "primary" | "secondary" | "ghost" | "danger";
  /** Size. Default md (48px min height — accessible tap target). */
  size?: "sm" | "md" | "lg";
  /** Stretch to fill container width (mobile-friendly). */
  fullWidth?: boolean;
  /** Optional icon node placed before the label (e.g. a Lucide <svg/>). */
  iconLeft?: React.ReactNode;
  /** Optional icon node placed after the label. */
  iconRight?: React.ReactNode;
  /** Render as a different element (e.g. "a" for links). */
  as?: "button" | "a";
  children?: React.ReactNode;
}

/** The primary action control. Sentence-case verb labels ("Scan a letter"). */
export function Button(props: ButtonProps): JSX.Element;
