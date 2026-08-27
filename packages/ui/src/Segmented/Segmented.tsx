import { forwardRef, useCallback, useId } from 'react';
import type { ButtonHTMLAttributes, HTMLAttributes, KeyboardEvent, ReactNode } from 'react';
import { cx } from '../cx.js';

interface SegmentedBase extends Omit<HTMLAttributes<HTMLDivElement>, 'aria-label'> {
  onSelectIndex?: (index: number) => void;
}

/**
 * A NAME, ONE WAY OR THE OTHER, AND THE TYPE IS WHAT ENFORCES IT.
 *
 * `aria-label` was required, which named the group for a screen reader and for nobody else. That
 * is right for a single group under a heading that already says what is being chosen, and wrong
 * the moment a form holds two: a consumer stacked "what this source says" above "how it knows" and
 * a sighted reader met two rows of words with nothing saying what either was for.
 *
 * The alternative a consumer reaches for is a `<label>` above the group, which is worse than it
 * looks — a label must reference a control, a radiogroup is not one, and the visible name and the
 * accessible name then exist as two strings that drift apart.
 *
 * So `label` renders the visible name AND becomes the accessible one through `aria-labelledby`.
 * One string, both jobs. The union below makes an unnamed group fail to compile rather than fail
 * quietly in a screen reader.
 */
export type SegmentedProps = SegmentedBase &
  (
    | { label: ReactNode; 'aria-label'?: never }
    | { label?: never; 'aria-label': string }
  );

/**
 * A radiogroup, not a tablist — the choice filters content rather than
 * swapping panels. Arrow keys move and select, matching radio semantics.
 */
export const Segmented = forwardRef<HTMLDivElement, SegmentedProps>(function Segmented(
  { className, onSelectIndex, onKeyDown, label, ...rest }, ref,
) {
  const id = useId();
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

  const group = <div {...rest} ref={ref} role="radiogroup" onKeyDown={handle}
    aria-labelledby={label ? `${id}-label` : undefined}
    className={cx('segmented', className)} />;

  // The wrapper appears ONLY when there is a name to show. A bare group keeps rendering as a
  // single element, so nothing that positions one today moves.
  if (!label) return group;
  return (
    <div className="segmented-field">
      <span id={`${id}-label`} className="segmented-label">{label}</span>
      {group}
    </div>
  );
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
