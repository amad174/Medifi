import * as React from "react";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  /** Field label rendered above the control (sentence case). */
  label?: React.ReactNode;
  /** Helper text below the control. */
  hint?: React.ReactNode;
  /** Error message — turns the field red and replaces the hint. */
  error?: React.ReactNode;
  /** Render a multi-line textarea instead of a single-line input. */
  multiline?: boolean;
}

/** Text input / textarea with label, hint, and error states. 48px min height. */
export function Input(props: InputProps): JSX.Element;
