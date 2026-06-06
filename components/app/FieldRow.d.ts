import * as React from "react";

export interface FieldRowProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Field name (rendered as a tracked uppercase key). */
  label: React.ReactNode;
  /** Extracted value (rendered in mono). */
  value?: React.ReactNode;
  /** When true, shows an italic "Not found in letter" in caution colour. */
  missing?: boolean;
}

/** One extracted structured field — uppercase key + monospaced value, with a missing state. */
export function FieldRow(props: FieldRowProps): JSX.Element;
