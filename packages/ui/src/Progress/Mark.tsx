import { forwardRef } from 'react';
import type { HTMLAttributes } from 'react';
import { cx } from '../cx.js';

/**
 * THE PROGRESS FAMILY'S SIX STATES.
 *
 * One vocabulary for a step, a task, a segment, an agent and a file:
 *
 * | state      | glyph | tone              |
 * | ---------- | ----- | ----------------- |
 * | `queued`   | —     | neutral, hollow   |
 * | `current`  | —     | action (a ring)   |
 * | `complete` | check | success           |
 * | `failed`   | cross | danger            |
 * | `stopped`  | alert | warning           |
 * | `skipped`  | minus | neutral, dashed   |
 *
 * `failed` is refused — the step did not happen. `stopped` is interrupted or cancelled — it did
 * not finish, and nothing refused it. They are different outcomes and a reader acts on them
 * differently, so they are two words.
 */
export type ProgressState = 'queued' | 'current' | 'complete' | 'failed' | 'stopped' | 'skipped';

/** The word each state is said with, when nothing more specific is given. */
export const PROGRESS_STATE_WORDS: Record<ProgressState, string> = {
  queued: 'Queued',
  current: 'In progress',
  complete: 'Done',
  failed: 'Failed',
  stopped: 'Stopped',
  skipped: 'Skipped',
};

export type ProgressGlyphName = 'check' | 'cross' | 'minus' | 'alert';

/** The glyph a state is drawn with; `queued` and `current` have none. */
export const PROGRESS_STATE_GLYPH: Record<ProgressState, ProgressGlyphName | undefined> = {
  queued: undefined,
  current: undefined,
  complete: 'check',
  failed: 'cross',
  stopped: 'alert',
  skipped: 'minus',
};

export interface ProgressGlyphProps extends Omit<HTMLAttributes<HTMLSpanElement>, 'children'> {
  glyph: ProgressGlyphName;
}

/**
 * One of the family's four glyphs, inline, 1em, in the text's colour.
 *
 * Drawn by CSS (a mask from the stylesheet), not by an SVG here, so a static page, a stepper's
 * marker and this component paint the SAME tick — there is one source, and it is the stylesheet.
 * Decorative: the word beside it says the same thing.
 */
export const ProgressGlyph = forwardRef<HTMLSpanElement, ProgressGlyphProps>(function ProgressGlyph(
  { glyph, className, ...rest }, ref,
) {
  return <span {...rest} ref={ref} aria-hidden="true" data-glyph={glyph}
    className={cx('progress-glyph', className)} />;
});

export interface ProgressMarkProps extends Omit<HTMLAttributes<HTMLSpanElement>, 'children'> {
  state: ProgressState;
  /** `sm` is 16px, for a legend or a dense row. Default 24px. */
  size?: 'sm' | 'md';
}

/**
 * A state in a disc — the same disc and glyph a stepper's marker draws. `current` is the spinner.
 * Decorative: pair it with the state's word (visible or `sr-only`).
 */
export const ProgressMark = forwardRef<HTMLSpanElement, ProgressMarkProps>(function ProgressMark(
  { state, size = 'md', className, ...rest }, ref,
) {
  return <span {...rest} ref={ref} aria-hidden="true" data-state={state}
    className={cx('progress-mark', size === 'sm' && 'progress-mark-sm', className)} />;
});
