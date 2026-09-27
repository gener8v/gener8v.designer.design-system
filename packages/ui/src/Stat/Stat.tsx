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
  /**
   * Whether up is the good news. Defaults to true.
   *
   * **It was declared and never read.** The component did not destructure it,
   * so it landed in the rest props and was spread onto the `<p>` — React warned
   * *Received `false` for a non-boolean attribute `good`*, and the colour went
   * on coming from `direction` alone. A consumer asking for a falling figure to
   * read as good got a console error and a red number.
   *
   * Direction and judgement are two facts. A book that shed a hundred and fifty
   * policies is down and bad; a loss ratio that fell four points is down and
   * good. Colouring by direction alone asserts the first about both.
   */
  good?: boolean;
}

/**
 * Direction says which way it moved, and `good` says what to make of that.
 *
 * The text must still say which way — a red number is not a sentence, and
 * colour alone fails WCAG 1.4.1. `data-dir` stays for anything styling on the
 * direction itself; `data-tone` is what carries the colour.
 */
export const StatDelta = forwardRef<HTMLParagraphElement, StatDeltaProps>(
  function StatDelta({ direction, good = true, className, ...rest }, ref) {
    /* Up and good, or down and not good. Defaulting `good` to true leaves every
       existing caller exactly where it was: up green, down red. */
    const tone = (direction === 'up') === good ? 'good' : 'bad';
    return (
      <p
        {...rest}
        ref={ref}
        data-dir={direction}
        data-tone={tone}
        className={cx('stat-delta', className)}
      />
    );
  });
