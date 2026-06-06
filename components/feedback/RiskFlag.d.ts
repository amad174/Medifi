import * as React from "react";

/**
 * Props for Medifi's signature admin-risk alert.
 * @startingPoint section="Feedback" subtitle="Risk alerts — the signature traffic-light flag" viewport="700x150"
 */
export interface RiskFlagProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Severity — drives colour, icon, and default label. safe = green, caution = amber, risk = red. */
  level?: "safe" | "caution" | "risk";
  /** Short plain-English headline naming the problem. */
  title?: React.ReactNode;
  /** Explanation + the next step the patient should take. */
  children?: React.ReactNode;
  /** Optional action node (usually a Button). */
  action?: React.ReactNode;
  /** Override the uppercase status label. */
  label?: React.ReactNode;
  /** Override the default level icon. */
  icon?: React.ReactNode;
}

/** Medifi's signature admin-risk alert. Always name the problem AND the next step. */
export function RiskFlag(props: RiskFlagProps): JSX.Element;
