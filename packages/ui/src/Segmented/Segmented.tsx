import { forwardRef, useCallback } from 'react';
import type { ButtonHTMLAttributes, HTMLAttributes, KeyboardEvent } from 'react';
import { cx } from '../cx.js';

export interface SegmentedProps extends HTMLAttributes<HTMLDivElement> {
  'aria-label': string;
  onSelectIndex?: (index: number) => void;
}

/**
 * A radiogroup, not a tablist — the choice filters content rather than
 * swapping panels. Arrow keys move and select, matching radio semantics.
 */
export const Segmented = forwardRef<HTMLDivElement, SegmentedProps>(function Segmented(
  { className, onSelectIndex, onKeyDown, ...rest }, ref,
) {
  const handle = useCallback((e: KeyboardEvent<HTMLDivElement>) => {
    onKeyDown?.(e);
    if (e.defaultPrevented) return;
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.key)) return;
    const items = [...e.currentTarget.querySelectorAll<HTMLElement>('[role="radio"]:not([disabled])')];
    if (!items.length) return;
    const from = items.indexOf(document.activeElement as HTMLElement);
    let to: number;
    if (e.key === 'Home') to = 0;
    else if (e.key === 'End') to = items.length - 1;
    else if (from === -1) to = 0;
    else if (e.key === 'ArrowRight') to = (from + 1) % items.length;
    else to = (from - 1 + items.length) % items.length;
    e.preventDefault();
    items[to]!.focus();
    onSelectIndex?.(to);
  }, [onSelectIndex, onKeyDown]);

  return <div {...rest} ref={ref} role="radiogroup" onKeyDown={handle}
    className={cx('segmented', className)} />;
});

export interface SegmentedItemProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  checked: boolean;
}

export const SegmentedItem = forwardRef<HTMLButtonElement, SegmentedItemProps>(
  function SegmentedItem({ checked, className, type = 'button', ...rest }, ref) {
    return <button {...rest} ref={ref} type={type} role="radio"
      aria-checked={checked} tabIndex={checked ? 0 : -1}
      className={cx('segmented-item', className)} />;
  });
