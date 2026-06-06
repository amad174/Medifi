import * as React from "react";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** default = bordered + soft shadow; flush = no padding (for media/lists); quiet = no shadow, subtle bg; accent = brand left edge. */
  variant?: "default" | "flush" | "quiet" | "accent";
  children?: React.ReactNode;
}

export interface CardHeaderProps {
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  /** Optional trailing action (button, badge). */
  action?: React.ReactNode;
}

/** Surface container — white, hairline border, soft shadow, 14px radius. */
export function Card(props: CardProps): JSX.Element;
export function CardHeader(props: CardHeaderProps): JSX.Element;
