import { forwardRef } from 'react';
import type { HTMLAttributes, ReactNode } from 'react';
import { cx } from '../cx.js';
import { Progress } from '../Progress/index.js';
import { Pulse, Tick, Cross } from './Live.js';

/** Where a piece of work stands: not started, under way, finished, or stopped. */
export type LiveProgressState = 'queued' | 'active' | 'done' | 'failed';

export interface LiveProgressLabels {
  /** Under way, when `where` says nothing more specific. Default `Working`. */
  active?: ReactNode;
  queued?: ReactNode;
  done?: ReactNode;
  failed?: ReactNode;
}

const WORDS: Required<LiveProgressLabels> = {
  active: 'Working', queued: 'Queued', done: 'Done', failed: 'Stopped',
};

export interface LiveProgressProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  state: LiveProgressState;
  /**
   * Where the work is now, shown in place of the active word: `§2.5 +1` (see `liveWhere`),
   * `Assembling`, `Rewriting`.
   */
  where?: ReactNode;
  /** How many parts are finished. With `max`, draws a bar and `4/6`. */
  value?: number;
  /** How many parts there are. Omit when nobody knows, and the bar is indeterminate. */
  max?: number;
  /** What the parts are, plural — `sections`. Used in the bar's name and in the queued count. */
  noun?: string;
  /** Words for each state. */
  labels?: LiveProgressLabels;
  /** Names the bar for assistive tech. Defaults to `4 of 6 sections done`. */
  progressLabel?: string;
}

/**
 * One row's live state, under its title in a list or a table. A `div`, because the bar inside it is
 * one; it lays out inline all the same.
 *
 * Active: a pulse, where the work is, a bar and a count — `• §2.5 +1 ▬▬▬▭ 4/6`. Without a count
 * the bar is indeterminate, because that is all anybody knows until the work lands. Queued: a
 * quiet tag and how many parts are waiting. Done and failed: a tag with a mark and a word.
 *
 * A table row that holds an active mark is tinted and edged, so the row being worked on is found
 * from across the table.
 */
export const LiveProgress = forwardRef<HTMLDivElement, LiveProgressProps>(function LiveProgress(
  { state, where, value, max, noun = 'parts', labels, progressLabel, className, ...rest }, ref,
) {
  const words = { ...WORDS, ...labels };
  const known = max !== undefined && max > 0;
  const done = Math.max(0, Math.min(max ?? 0, value ?? 0));

  if (state === 'queued') {
    return (
      <div {...rest} ref={ref} data-state="queued" className={cx('live-progress', className)}>
        <span className="tag tag-neutral tag-dot">{words.queued}</span>
        {known && <span className="live-progress-count num">{max} {noun}</span>}
      </div>
    );
  }
  if (state === 'done' || state === 'failed') {
    return (
      <div {...rest} ref={ref} data-state={state} className={cx('live-progress', className)}>
        <span className={cx('tag', state === 'done' ? 'tag-success' : 'tag-danger')}>
          {state === 'done' ? <Tick /> : <Cross />}
          {state === 'done' ? words.done : words.failed}
        </span>
        {known && state === 'failed' && (
          <span className="live-progress-count num">{done}/{max}</span>
        )}
      </div>
    );
  }
  return (
    <div {...rest} ref={ref} data-state="active" className={cx('live-progress', className)}>
      <Pulse />
      <span className="live-progress-where">{where || words.active}</span>
      <Progress className="live-progress-bar" size="sm"
        {...(known ? { value: Math.round((done / max) * 100) } : {})}
        aria-label={progressLabel ?? (known ? `${done} of ${max} ${noun} done` : `${noun} in progress`)} />
      {known && <span className="live-progress-count num">{done}/{max}</span>}
    </div>
  );
});
