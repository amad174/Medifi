import * as React from "react";

export interface ChecklistItemProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "onToggle"> {
  /** The action, as a verb phrase ("Add to calendar"). */
  label: React.ReactNode;
  /** Optional supporting detail under the label. */
  meta?: React.ReactNode;
  /** Optional trailing icon hinting at the action type. */
  icon?: React.ReactNode;
  /** Completed state — strikes through and turns green. */
  done?: boolean;
  /** Toggle handler. */
  onToggle?: () => void;
}

/** A single tickable action in the patient's plan. */
export function ChecklistItem(props: ChecklistItemProps): JSX.Element;
