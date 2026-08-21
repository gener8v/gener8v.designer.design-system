import { forwardRef } from 'react';
import type { HTMLAttributes } from 'react';
import { cx } from '../cx.js';

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
