import { forwardRef, useId } from 'react';
import type { HTMLAttributes } from 'react';
import { cx } from '../cx.js';
import { PROGRESS_STATE_WORDS } from './Mark.js';
import type { ProgressState } from './Mark.js';
import type { ProgressName, ProgressSize } from './Progress.js';

export interface ProgressSegmentCount {
  state: ProgressState;
  /** How many items are in this state. */
  value: number;
  /** The word for this state here — `Passed`, `To review`. Defaults to the family's word. */
  label?: string;
}

interface SegmentedProgressBase extends Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'aria-label' | 'aria-labelledby'> {
  /** One entry per state. Order does not matter: segments are drawn in the family's order. */
  segments: ProgressSegmentCount[];
  /** How many there are in all. Defaults to the sum; anything not counted is drawn as queued. */
  total?: number;
  size?: ProgressSize;
  /** The legend under the track, every count in words. On by default. */
  legend?: boolean;
  /** What the items are, for the value line — `checks`. Default none: `7 of 10`. */
  noun?: string;
}

export type SegmentedProgressProps = SegmentedProgressBase & ProgressName;

/** Finished first, then running, then waiting — the order a reader scans a run in. */
const ORDER: ProgressState[] = ['complete', 'failed', 'stopped', 'skipped', 'current', 'queued'];
const QUEUED_WORD = 'To go';
const FINISHED: ProgressState[] = ['complete', 'failed', 'stopped', 'skipped'];

/**
 * One track split by status: `6 done, 1 failed, 3 to go`.
 *
 * A `role="progressbar"` whose value is how many have FINISHED, however they finished, and whose
 * value text is the whole breakdown in words — so a screen reader hears what the colours say. The
 * legend says it again on screen, so nothing rests on telling green from red.
 */
export const SegmentedProgress = forwardRef<HTMLDivElement, SegmentedProgressProps>(function SegmentedProgress(
  { segments, total, size = 'md', legend = true, noun, label, 'aria-label': ariaLabel,
    'aria-labelledby': ariaLabelledby, className, ...rest }, ref,
) {
  const id = useId();
  const counted = segments.reduce((n, s) => n + Math.max(0, s.value), 0);
  const all = Math.max(total ?? counted, counted);
  const rows = ORDER.flatMap((state) => {
    const mine = segments.filter((s) => s.state === state);
    let value = mine.reduce((n, s) => n + Math.max(0, s.value), 0);
    if (state === 'queued') value += all - counted;
    if (value === 0) return [];
    const word = mine.find((s) => s.label)?.label ?? (state === 'queued' ? QUEUED_WORD : PROGRESS_STATE_WORDS[state]);
    return [{ state, value, word }];
  });
  const finished = rows.filter((r) => FINISHED.includes(r.state)).reduce((n, r) => n + r.value, 0);
  const said = rows.map((r) => `${r.value} ${r.word.toLowerCase()}`).join(', ');
  const labelled = label !== undefined && label !== null;
  const labelId = `${id}-label`;

  return (
    <div {...rest} ref={ref} className={cx('progress-field', className)}>
      {labelled ? (
        <div className="progress-head">
          <span className="progress-label" id={labelId}>{label}</span>
          <span className="progress-value">{finished} of {all}{noun ? ` ${noun}` : ''}</span>
        </div>
      ) : null}
      <div role="progressbar"
        aria-label={labelled ? undefined : ariaLabel}
        aria-labelledby={labelled ? labelId : ariaLabelledby}
        aria-valuemin={0} aria-valuemax={all} aria-valuenow={finished} aria-valuetext={said}
        className={cx('progress-segments', size === 'sm' && 'progress-sm', size === 'lg' && 'progress-lg')}>
        {rows.map((r) => (
          <span key={r.state} className="progress-segment" data-state={r.state}
            style={{ ['--value' as string]: r.value }} />
        ))}
      </div>
      {legend ? (
        <ul className="progress-legend" aria-hidden="true">
          {rows.map((r) => (
            <li key={r.state} className="progress-legend-item">
              <span className="progress-legend-swatch" data-state={r.state} />
              {r.word}
              <span className="progress-legend-count">{r.value}</span>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
});

