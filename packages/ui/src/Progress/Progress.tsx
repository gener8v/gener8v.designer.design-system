import { forwardRef } from 'react';
import type { HTMLAttributes } from 'react';
import { cx } from '../cx.js';

export interface ProgressProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  /** 0–100. Omit for the indeterminate form. */
  value?: number;
  'aria-label': string;
}

/** A real `role="progressbar"`, not a decorative bar. */
export const Progress = forwardRef<HTMLDivElement, ProgressProps>(function Progress(
  { value, className, ...rest }, ref,
) {
  const indeterminate = value === undefined;
  const clamped = indeterminate ? undefined : Math.min(100, Math.max(0, value));
  return (
    <div {...rest} ref={ref} role="progressbar"
      aria-valuenow={clamped} aria-valuemin={indeterminate ? undefined : 0}
      aria-valuemax={indeterminate ? undefined : 100}
      className={cx('progress', indeterminate && 'progress-indeterminate', className)}>
      <div className="progress-bar" style={indeterminate ? undefined : { inlineSize: `${clamped}%` }} />
    </div>
  );
});

export interface ProgressRingProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  value: number;
  'aria-label': string;
  /** Defaults to the rounded percentage. */
  children?: React.ReactNode;
}

/** One element and one conic gradient — no SVG, no second track element. */
export const ProgressRing = forwardRef<HTMLDivElement, ProgressRingProps>(function ProgressRing(
  { value, className, children, style, ...rest }, ref,
) {
  const clamped = Math.min(100, Math.max(0, value));
  return (
    <div {...rest} ref={ref} role="progressbar"
      aria-valuenow={clamped} aria-valuemin={0} aria-valuemax={100}
      style={{ ...style, ['--progress' as string]: clamped }}
      className={cx('progress-ring', className)}>
      <span className="progress-ring-value">{children ?? `${Math.round(clamped)}%`}</span>
    </div>
  );
});
