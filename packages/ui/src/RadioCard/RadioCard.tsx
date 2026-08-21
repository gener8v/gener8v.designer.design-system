import type { HTMLAttributes, InputHTMLAttributes, ReactNode } from 'react';
import { cx } from '../cx.js';

/** Wrap in a fieldset with a legend — a group of choices needs a group name. */
export const RadioCards = ({ className, ...rest }: HTMLAttributes<HTMLDivElement>) =>
  <div {...rest} className={cx('radio-cards', className)} />;

export interface RadioCardProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'title'> {
  title: ReactNode;
  note?: ReactNode;
  /** Right-aligned figure — a price, a duration. */
  meta?: ReactNode;
}

/**
 * A choice large enough to carry a description and a figure. The whole card is
 * the label, so the entire surface is the hit target rather than the 20px
 * radio — which is the actual reason radio cards exist.
 */
export function RadioCard({ title, note, meta, className, ...rest }: RadioCardProps) {
  return (
    <label className={cx('radio-card', className)}>
      <input {...rest} type="radio" className="radio" />
      <span className="radio-card-body">
        <span className="radio-card-title">{title}</span>
        {note ? <span className="radio-card-note">{note}</span> : null}
      </span>
      {meta ? <span className="radio-card-meta">{meta}</span> : null}
    </label>
  );
}
