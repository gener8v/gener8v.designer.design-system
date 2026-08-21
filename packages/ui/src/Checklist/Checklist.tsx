import type { HTMLAttributes, InputHTMLAttributes, ReactNode } from 'react';
import { cx } from '../cx.js';

export const Checklist = ({ className, ...rest }: HTMLAttributes<HTMLUListElement>) =>
  <ul {...rest} className={cx('checklist', className)} />;

export interface ChecklistItemProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  children: ReactNode;
  note?: ReactNode;
}

/**
 * A completed item recedes but stays legible — struck through, not removed.
 * In audited work the record of what was checked, and by whom, is part of the
 * artifact; hiding it would delete evidence.
 */
export function ChecklistItem({ children, note, className, ...rest }: ChecklistItemProps) {
  return (
    <li>
      <label className={cx('checklist-item', className)}>
        <input {...rest} type="checkbox" className="checkbox" />
        <span className="checklist-text">
          {children}
          {note ? <span className="checklist-note">{note}</span> : null}
        </span>
      </label>
    </li>
  );
}
