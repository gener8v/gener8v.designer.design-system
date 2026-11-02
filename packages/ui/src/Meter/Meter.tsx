import { forwardRef, useId } from 'react';
import type { HTMLAttributes, ReactNode } from 'react';
import { cx } from '../cx.js';

export type MeterTone = 'neutral' | 'success' | 'warning' | 'danger';

export interface MeterProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  /** The level, on the same scale as `max`. */
  value: number;
  label: ReactNode;
  /**
   * The top of the scale. Defaults to 100, so a bare `value` is a percentage — which is what
   * every meter written before this prop existed passes.
   */
  max?: number;
  /**
   * Where the level ought to be, on the same scale as `value`. Draws a tick across the track and
   * says the target in words beside the figure, because a tick alone is a mark nobody can read
   * without being told what it is.
   */
  threshold?: number;
  /** The words for the target. Defaults to `Target 80%` on the default scale, `Target 48` on any other. */
  thresholdLabel?: ReactNode;
  /** Defaults to the rounded percentage. */
  display?: ReactNode;
  /**
   * `auto` reads the tone off the threshold: success at or above it, warning below. With no
   * threshold there is nothing to be above, so `auto` is neutral.
   */
  tone?: MeterTone | 'auto';
}

const pct = (v: number, max: number) => (max > 0 ? Math.min(100, Math.max(0, (v / max) * 100)) : 0);

/**
 * `role="meter"` — a level that is simply true, as distinct from `Progress`,
 * which reports a task advancing. Swapping them misreports what is happening.
 */
export const Meter = forwardRef<HTMLDivElement, MeterProps>(function Meter(
  {
    value, label, max = 100, threshold, thresholdLabel, display, tone = 'neutral',
    className, 'aria-label': ariaLabel, 'aria-describedby': describedBy, ...rest
  }, ref,
) {
  const clamped = Math.min(max, Math.max(0, value));
  const fill = pct(clamped, max);
  const labelId = useId();
  const targetId = useId();
  const hasTarget = threshold !== undefined && Number.isFinite(threshold);
  const target = hasTarget ? pct(threshold, max) : 0;
  const resolved: MeterTone = tone === 'auto'
    ? (hasTarget ? (clamped >= threshold ? 'success' : 'warning') : 'neutral')
    : tone;
  const describe = [describedBy, hasTarget ? targetId : undefined].filter(Boolean).join(' ') || undefined;

  // role="meter" does NOT take its name from contents, so the visible label has
  // to be referenced explicitly or the meter is anonymous to assistive tech.
  return (
    <div {...rest} ref={ref} role="meter"
      aria-valuenow={clamped} aria-valuemin={0} aria-valuemax={max}
      aria-label={ariaLabel}
      aria-labelledby={ariaLabel ? undefined : labelId}
      aria-describedby={describe}
      data-tone={resolved === 'neutral' ? undefined : resolved}
      className={cx('meter', className)}>
      <div className="meter-head">
        <span className="meter-label" id={labelId}>{label}</span>
        <span className="meter-value">{display ?? `${Math.round(fill)}%`}</span>
        {hasTarget ? (
          <span className="meter-target" id={targetId}>
            {/* On the scale the figure is on: a percentage beside a percentage, a count beside a count. */}
            {thresholdLabel ?? (max === 100 ? `Target ${Math.round(target)}%` : `Target ${threshold}`)}
          </span>
        ) : null}
      </div>
      <div className="meter-track">
        <div className="meter-fill" style={{ inlineSize: `${fill}%` }} />
        {hasTarget ? (
          <span className="meter-threshold" aria-hidden="true" style={{ insetInlineStart: `${target}%` }} />
        ) : null}
      </div>
    </div>
  );
});
