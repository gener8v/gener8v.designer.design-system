import { forwardRef, useId } from 'react';
import type { CSSProperties, HTMLAttributes, ReactNode } from 'react';
import { cx } from '../cx.js';

/** A tone replaces the fill only when the whole task has ended. */
export type ProgressTone = 'default' | 'success' | 'warning' | 'danger';
/** Track thickness: 4px (inline, rows), 6px (default), 8px (the subject of its region). */
export type ProgressSize = 'sm' | 'md' | 'lg';

const SIZE: Record<ProgressSize, string | undefined> = { sm: 'progress-sm', md: undefined, lg: 'progress-lg' };

/**
 * How a progress indicator is named. A visible `label` names it; without one, `aria-label` or
 * `aria-labelledby` must. Checked at compile time, because an unnamed progress bar is announced
 * as "progress bar, 62" and nothing else.
 */
export type ProgressName =
  | { label: ReactNode; 'aria-label'?: string; 'aria-labelledby'?: string }
  | { label?: undefined; 'aria-label': string; 'aria-labelledby'?: string }
  | { label?: undefined; 'aria-label'?: string; 'aria-labelledby': string };

interface ProgressBase extends Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'aria-label' | 'aria-labelledby'> {
  /** How much is done, out of `max`. Omit for the indeterminate form. */
  value?: number;
  /** What `value` is out of. Default 100, so `value` reads as a percentage. */
  max?: number;
  size?: ProgressSize;
  tone?: ProgressTone;
  /** A line under the track — what is happening, or what went wrong. Needs `label`. */
  helper?: ReactNode;
  /** Show the value at the end of the label line. On by default when there is a `label`. */
  showValue?: boolean;
  /** The visible value. Defaults to the rounded percentage — `62%`. */
  valueLabel?: ReactNode;
  /** What assistive tech says for the value — `4 of 6 sections`. Defaults to the percentage. */
  valueText?: string;
  /**
   * `stacked` puts the label and value above the track and the helper below it — a bar that is the
   * subject of its region. `inline` puts label, track and value on one line — a row or a cell.
   */
  layout?: 'stacked' | 'inline';
}

export type ProgressProps = ProgressBase & ProgressName;

const pct = (value: number, max: number) => (max > 0 ? Math.min(100, Math.max(0, (value / max) * 100)) : 0);

/**
 * A real `role="progressbar"`, not a decorative bar.
 *
 * Bare, it is the track alone and must be named with `aria-label`. With a `label` it lays out by the
 * family's one rule — label at the start, value at the end, helper underneath — and the bar is
 * named by the label and described by the helper. `className` and `style` then go on the wrapper;
 * `ref` and every other attribute stay on the bar.
 */
export const Progress = forwardRef<HTMLDivElement, ProgressProps>(function Progress(
  { value, max = 100, size = 'md', tone = 'default', label, helper, showValue, valueLabel, valueText,
    layout = 'stacked', 'aria-label': ariaLabel, 'aria-labelledby': ariaLabelledby, className, style, ...rest }, ref,
) {
  const id = useId();
  const indeterminate = value === undefined;
  const now = indeterminate ? undefined : Math.min(max, Math.max(0, value));
  const share = now === undefined ? undefined : pct(now, max);
  const toned = tone === 'default' ? undefined : tone;
  const labelled = label !== undefined && label !== null;
  const shown = labelled && (showValue ?? true) && !indeterminate;
  const labelId = `${id}-label`;
  const helperId = `${id}-helper`;

  const bar = (
    <div {...rest} ref={ref} role="progressbar"
      aria-label={labelled ? undefined : ariaLabel}
      aria-labelledby={labelled ? labelId : ariaLabelledby}
      aria-describedby={labelled && helper ? helperId : rest['aria-describedby']}
      aria-valuenow={now} aria-valuemin={indeterminate ? undefined : 0}
      aria-valuemax={indeterminate ? undefined : max}
      aria-valuetext={indeterminate ? undefined : (valueText ?? (max === 100 ? undefined : `${now} of ${max}`))}
      data-tone={toned}
      style={labelled ? undefined : style}
      className={cx('progress', SIZE[size], indeterminate && 'progress-indeterminate', !labelled && className)}>
      <div className="progress-bar" style={indeterminate ? undefined : { inlineSize: `${share}%` }} />
    </div>
  );
  if (!labelled) return bar;

  // Once a tone says the task has ENDED, the value slot holds a status word — `Done`, `Failed` —
  // and is set in the body face like every other status; a figure stays in the mono.
  const valueNode = shown ? (
    <span className={cx('progress-value', toned && valueLabel !== undefined && 'progress-status')}>
      {valueLabel ?? `${Math.round(share!)}%`}
    </span>
  ) : null;
  if (layout === 'inline') {
    return (
      <div className={cx('progress-inline', className)} style={style as CSSProperties} data-tone={toned}>
        <span className="progress-label" id={labelId}>{label}</span>
        {bar}
        {valueNode}
      </div>
    );
  }
  return (
    <div className={cx('progress-field', className)} style={style as CSSProperties} data-tone={toned}>
      <div className="progress-head">
        <span className="progress-label" id={labelId}>{label}</span>
        {valueNode}
      </div>
      {bar}
      {helper ? <p className="progress-helper" id={helperId}>{helper}</p> : null}
    </div>
  );
});

/** Ring diameters: 16, 24, 32, 48 and 64px. The stroke is always an eighth of the diameter. */
export type ProgressRingSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

const RING: Record<ProgressRingSize, string | undefined> = {
  xs: 'progress-ring-xs', sm: 'progress-ring-sm', md: 'progress-ring-md', lg: 'progress-ring-lg', xl: undefined,
};

interface ProgressRingBase extends Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'aria-label' | 'aria-labelledby'> {
  /** How much is done, out of `max`. Omit for the indeterminate ring. */
  value?: number;
  max?: number;
  /** Default `xl` (64px). The value fits inside at `lg` (48) and `xl`; below that it goes beside. */
  size?: ProgressRingSize;
  tone?: ProgressTone;
  /**
   * What sits in the middle. Defaults to the value at `lg` and `xl`, and to nothing below that.
   * Pass a `ProgressGlyph` or an icon for an icon, or `null` for an empty ring.
   */
  children?: ReactNode;
  /** A line beside the ring, under its label. Needs `label`. */
  helper?: ReactNode;
  /** The visible value. Defaults to the rounded percentage. */
  valueLabel?: ReactNode;
  /** What assistive tech says for the value. */
  valueText?: string;
}

export type ProgressRingProps = ProgressRingBase & ProgressName;

/**
 * A circular progress: a track and an arc, the stroke an eighth of the diameter, the hole truly
 * empty so it sits on any ground. Its words go BESIDE it — label, then the value when the ring is
 * too small to hold it, then the helper.
 */
export const ProgressRing = forwardRef<HTMLDivElement, ProgressRingProps>(function ProgressRing(
  { value, max = 100, size = 'xl', tone = 'default', label, helper, valueLabel, valueText,
    'aria-label': ariaLabel, 'aria-labelledby': ariaLabelledby, className, style, children, ...rest }, ref,
) {
  const id = useId();
  const indeterminate = value === undefined;
  const now = indeterminate ? undefined : Math.min(max, Math.max(0, value));
  const share = now === undefined ? 0 : pct(now, max);
  const toned = tone === 'default' ? undefined : tone;
  const labelled = label !== undefined && label !== null;
  const roomy = size === 'lg' || size === 'xl';
  const text = valueLabel ?? `${Math.round(share)}%`;
  const centre = children !== undefined ? children
    : (roomy && !indeterminate ? <span className="progress-ring-value">{text}</span> : null);
  const labelId = `${id}-label`;
  const helperId = `${id}-helper`;

  const ring = (
    <div {...rest} ref={ref} role="progressbar"
      aria-label={labelled ? undefined : ariaLabel}
      aria-labelledby={labelled ? labelId : ariaLabelledby}
      aria-describedby={labelled && helper ? helperId : rest['aria-describedby']}
      aria-valuenow={now} aria-valuemin={indeterminate ? undefined : 0}
      aria-valuemax={indeterminate ? undefined : max}
      aria-valuetext={indeterminate ? undefined : (valueText ?? (max === 100 ? undefined : `${now} of ${max}`))}
      data-tone={toned}
      style={{ ...(labelled ? {} : style), ['--progress' as string]: share }}
      className={cx('progress-ring', RING[size], indeterminate && 'progress-ring-indeterminate',
        !labelled && className)}>
      {centre}
    </div>
  );
  if (!labelled) return ring;
  return (
    <div className={cx('progress-ring-field', className)} style={style as CSSProperties} data-tone={toned}>
      {ring}
      {/* Always a title line and one supporting line, and the ring centred on both. */}
      <div className="progress-ring-text">
        <div className="progress-head">
          <span className="progress-label" id={labelId}>{label}</span>
          {!roomy && !indeterminate && children === undefined ? <span className="progress-value">{text}</span> : null}
        </div>
        {helper ? <p className="progress-helper" id={helperId}>{helper}</p> : null}
      </div>
    </div>
  );
});
