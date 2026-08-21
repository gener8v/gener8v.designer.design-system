import { forwardRef, useCallback } from 'react';
import type { ButtonHTMLAttributes, HTMLAttributes, KeyboardEvent } from 'react';
import { cx } from '../cx.js';

export type TabsOrientation = 'horizontal' | 'vertical';

export interface TabsProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Called when an arrow key moves to a tab. WAI-ARIA calls this "automatic
   * activation" and recommends it when switching panels is cheap.
   */
  onSelectIndex?: (index: number) => void;
  orientation?: TabsOrientation;
}

/**
 * Owns the keyboard, because roving tabindex only works if something does.
 * `Tab` sets `tabIndex={-1}` on unselected tabs, which removes them from the
 * Tab sequence — without arrow handling here they would be unreachable
 * entirely, which is worse than plain buttons.
 */
export const Tabs = forwardRef<HTMLDivElement, TabsProps>(function Tabs(
  { className, role = 'tablist', orientation = 'horizontal', onSelectIndex, onKeyDown, ...rest }, ref,
) {
  const handleKeyDown = useCallback((e: KeyboardEvent<HTMLDivElement>) => {
    onKeyDown?.(e);
    if (e.defaultPrevented) return;

    const next = orientation === 'vertical' ? 'ArrowDown' : 'ArrowRight';
    const prev = orientation === 'vertical' ? 'ArrowUp' : 'ArrowLeft';
    if (!['Home', 'End', next, prev].includes(e.key)) return;

    const tabs = [...e.currentTarget.querySelectorAll<HTMLElement>('[role="tab"]:not([disabled])')];
    if (tabs.length === 0) return;
    const from = tabs.indexOf(document.activeElement as HTMLElement);

    let to: number;
    if (e.key === 'Home') to = 0;
    else if (e.key === 'End') to = tabs.length - 1;
    else if (from === -1) to = 0;
    else if (e.key === next) to = (from + 1) % tabs.length;
    else to = (from - 1 + tabs.length) % tabs.length;

    e.preventDefault();
    tabs[to]!.focus();
    onSelectIndex?.(to);
  }, [orientation, onSelectIndex, onKeyDown]);

  return <div {...rest} ref={ref} role={role}
    aria-orientation={orientation === 'vertical' ? 'vertical' : undefined}
    onKeyDown={handleKeyDown}
    className={cx('tabs', className)} />;
});

export interface TabProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  selected: boolean;
  /** The id of the panel this tab controls. */
  controls?: string;
}

export const Tab = forwardRef<HTMLButtonElement, TabProps>(function Tab(
  { selected, controls, className, type = 'button', ...rest }, ref,
) {
  return <button {...rest} ref={ref} type={type} role="tab"
    aria-selected={selected} aria-controls={controls} tabIndex={selected ? 0 : -1}
    className={cx('tab', className)} />;
});
