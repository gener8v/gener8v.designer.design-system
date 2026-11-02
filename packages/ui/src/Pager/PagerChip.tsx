import { forwardRef, useEffect, useRef } from 'react';
import type { HTMLAttributes, ReactNode } from 'react';
import { cx } from '../cx.js';
import { mergeRefs } from '../useModalBehavior.js';
import { isTypingTarget, modalAbove, modified } from '../Keys/typing.js';

export interface PagerChipProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  /** Where you are, in words — `S4 of 19`. Announced politely when it changes. */
  label: ReactNode;
  /** Go back one. Omit at the start, and the button is disabled. */
  onPrevious?: () => void;
  /** Go on one. Omit at the end. */
  onNext?: () => void;
  /** Names the buttons — `Previous Source`. Title Case. */
  previousLabel?: string;
  nextLabel?: string;
  /**
   * ← and → step too, from anywhere on the page or inside the dialog that holds the chip — never
   * from inside a field, where an arrow moves the caret, and never from under another dialog.
   */
  arrowKeys?: boolean;
  /** Names the group for assistive tech. Defaults to `Step through`. */
  'aria-label'?: string;
}

const Caret = ({ back }: { back?: boolean }) => (
  <svg viewBox="0 0 16 16" aria-hidden="true" focusable="false">
    <path d={back ? 'M10 3.5L5.5 8l4.5 4.5' : 'M6 3.5L10.5 8 6 12.5'} stroke="currentColor"
      strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
  </svg>
);

/**
 * Stepping through a set without leaving the place you are in: `‹ S4 of 19 ›`.
 *
 * The header of a side pane that walks a document's sources in order, a review that walks the
 * open findings, a viewer that walks attachments. One control, so the position and the two ways
 * to change it read as one thing; at either end the button that leads nowhere is disabled rather
 * than hidden, so the chip does not change shape under the pointer.
 */
export const PagerChip = forwardRef<HTMLDivElement, PagerChipProps>(function PagerChip(
  {
    label, onPrevious, onNext, previousLabel = 'Previous', nextLabel = 'Next', arrowKeys = false,
    className, 'aria-label': group = 'Step through', ...rest
  }, ref,
) {
  const self = useRef<HTMLElement | null>(null);
  const latest = useRef({ onPrevious, onNext });
  latest.current = { onPrevious, onNext };

  useEffect(() => {
    if (!arrowKeys) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.defaultPrevented || modified(e) || e.shiftKey || isTypingTarget(e.target)) return;
      if (modalAbove(self.current)) return;
      const go = e.key === 'ArrowLeft' ? latest.current.onPrevious
        : e.key === 'ArrowRight' ? latest.current.onNext : undefined;
      if (!go) return;
      e.preventDefault();
      go();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [arrowKeys]);

  return (
    <div {...rest} ref={mergeRefs(self, ref)} role="group" aria-label={group}
      className={cx('pager-chip', className)}>
      <button type="button" className="pager-chip-step" aria-label={previousLabel}
        disabled={!onPrevious} onClick={onPrevious}>
        <Caret back />
      </button>
      <span className="pager-chip-label num" aria-live="polite">{label}</span>
      <button type="button" className="pager-chip-step" aria-label={nextLabel}
        disabled={!onNext} onClick={onNext}>
        <Caret />
      </button>
    </div>
  );
});
