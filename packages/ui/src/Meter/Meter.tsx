import { forwardRef, useId } from 'react';
import type { HTMLAttributes, ReactNode } from 'react';
import { cx } from '../cx.js';

export type MeterTone = 'neutral' | 'success' | 'warning' | 'danger';

export interface MeterProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  value: number;
  label: ReactNode;
  /** Defaults to the rounded percentage. */
  display?: ReactNode;
  tone?: MeterTone;
}

/**
 * `role="meter"` — a level that is simply true, as distinct from `Progress`,
 * which reports a task advancing. Swapping them misreports what is happening.
 */
export const Meter = forwardRef<HTMLDivElement, MeterProps>(function Meter(
  { value, label, display, tone = 'neutral', className, 'aria-label': ariaLabel, ...rest }, ref,
) {
  const clamped = Math.min(100, Math.max(0, value));
  const labelId = useId();
  // role="meter" does NOT take its name from contents, so the visible label has
  // to be referenced explicitly or the meter is anonymous to assistive tech.
  return (
    <div {...rest} ref={ref} role="meter"
      aria-valuenow={clamped} aria-valuemin={0} aria-valuemax={100}
      aria-label={ariaLabel}
      aria-labelledby={ariaLabel ? undefined : labelId}
      data-tone={tone === 'neutral' ? undefined : tone}
      className={cx('meter', className)}>
      <div className="meter-head">
        <span className="meter-label" id={labelId}>{label}</span>
        <span className="meter-value">{display ?? `${Math.round(clamped)}%`}</span>
      </div>
      <div className="meter-track">
        <div className="meter-fill" style={{ inlineSize: `${clamped}%` }} />
      </div>
    </div>
  );
});
