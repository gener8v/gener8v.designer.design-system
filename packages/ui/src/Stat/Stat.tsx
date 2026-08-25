import { forwardRef } from 'react';
import type { HTMLAttributes } from 'react';
import { cx } from '../cx.js';

/**
 * A row of figures that reads as one.
 *
 * Four `.stat`s side by side are four columns floating in a gap, and the reader has to decide for
 * themselves whether they belong together. They do — "0 covered, 0 gaps, 0 not applicable, 66
 * nobody has looked" is one sentence about one thing — and the rules between them say so.
 *
 * A rule between rather than a box around: a box makes the figures compete with the content under
 * them, and they are a summary OF it rather than a panel beside it.
 */
export const StatRow = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  function StatRow({ className, ...rest }, ref) {
    return <div {...rest} ref={ref} className={cx('stat-row', className)} />;
  });

export const Stat = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  function Stat({ className, ...rest }, ref) {
    return <div {...rest} ref={ref} className={cx('stat', className)} />;
  });

export const StatLabel = forwardRef<HTMLParagraphElement, HTMLAttributes<HTMLParagraphElement>>(
  function StatLabel({ className, ...rest }, ref) {
    return <p {...rest} ref={ref} className={cx('stat-label', className)} />;
  });

export const StatValue = forwardRef<HTMLParagraphElement, HTMLAttributes<HTMLParagraphElement>>(
  function StatValue({ className, ...rest }, ref) {
    return <p {...rest} ref={ref} className={cx('stat-value', className)} />;
  });

export const StatNote = forwardRef<HTMLParagraphElement, HTMLAttributes<HTMLParagraphElement>>(
  function StatNote({ className, ...rest }, ref) {
    return <p {...rest} ref={ref} className={cx('stat-note', className)} />;
  });

export interface StatDeltaProps extends HTMLAttributes<HTMLParagraphElement> {
  direction: 'up' | 'down';
  /** Whether up is good. Colour alone must not carry the judgement. */
  good?: boolean;
}

/**
 * Direction sets the colour, but the text must also say which way it moved —
 * a red number is not a sentence, and colour alone fails WCAG 1.4.1.
 */
export const StatDelta = forwardRef<HTMLParagraphElement, StatDeltaProps>(
  function StatDelta({ direction, className, ...rest }, ref) {
    return <p {...rest} ref={ref} data-dir={direction} className={cx('stat-delta', className)} />;
  });
