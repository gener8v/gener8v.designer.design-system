import type { HTMLAttributes, ReactNode } from 'react';
import { cx } from '../cx.js';

/** Renders a `<dl>` — a summary is term/value pairs, not a list of sentences. */
export const Summary = ({ className, ...rest }: HTMLAttributes<HTMLDListElement>) =>
  <dl {...rest} className={cx('summary', className)} />;

export interface SummaryRowProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  label: ReactNode;
  value: ReactNode;
  /** The row the eye should land on. One per summary. */
  total?: boolean;
}

export function SummaryRow({ label, value, total, className, ...rest }: SummaryRowProps) {
  return (
    <div {...rest} className={cx('summary-row', total && 'summary-total', className)}>
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}

export const SummaryNote = ({ className, ...rest }: HTMLAttributes<HTMLParagraphElement>) =>
  <p {...rest} className={cx('summary-note', className)} />;
