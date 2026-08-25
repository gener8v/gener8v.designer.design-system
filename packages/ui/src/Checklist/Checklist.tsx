import type { HTMLAttributes, InputHTMLAttributes, ReactNode } from 'react';
import { cx } from '../cx.js';

export interface ChecklistProps extends HTMLAttributes<HTMLUListElement> {
  /**
   * What a tick MEANS here.
   *
   * `tasks` — done, and behind you. A checked item recedes and is struck through, because in
   * audited work the record of what was checked is part of the artifact.
   *
   * `manifest` — what is about to be written. A checked item is the POINT, so it does not recede:
   * struck-through-and-quiet would make the captured items read as cancelled and leave the one
   * still missing as the most legible thing on the screen.
   */
  purpose?: 'tasks' | 'manifest';
}

export const Checklist = ({ purpose = 'tasks', className, ...rest }: ChecklistProps) =>
  <ul {...rest} data-purpose={purpose} className={cx('checklist', className)} />;

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
