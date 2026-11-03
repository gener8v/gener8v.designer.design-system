import { forwardRef } from 'react';
import type { HTMLAttributes, ReactNode } from 'react';
import { cx } from '../cx.js';

/**
 * WORK HAPPENING NOW, DRAWN WHERE THE WORK IS.
 *
 * A live run touches every screen — a row on a list, the section of a document being written, the
 * agents on a history page — and each of those needs to say "this is moving" in the same voice.
 * This family is that voice: a pulse, an indicator that says it in words, a mark for a part of a
 * document, and the section treatment the mark sits on.
 *
 * Colour and motion are never the only signal. Every state has a word beside it, and the motion
 * stands still for a reader who asked for less of it.
 */

export type PulseTone = 'accent' | 'success' | 'warning' | 'danger';

export interface PulseProps extends Omit<HTMLAttributes<HTMLSpanElement>, 'children'> {
  tone?: PulseTone;
}

/**
 * A dot with a ring that keeps leaving it.
 *
 * DECORATIVE. Whatever it sits beside says the same thing in words, so it is hidden from the
 * accessibility tree. When nothing beside it does, use `LiveIndicator`, which carries the words.
 *
 * Under reduced motion the ring stops leaving and stays as a still halo: the dot still reads as
 * "live" against a plain status dot, and nothing on the page moves.
 */
export const Pulse = forwardRef<HTMLSpanElement, PulseProps>(function Pulse(
  { tone = 'accent', className, ...rest }, ref,
) {
  return <span {...rest} ref={ref} aria-hidden="true" data-tone={tone}
    className={cx('live-pulse', className)} />;
});

export interface LiveIndicatorProps extends Omit<HTMLAttributes<HTMLSpanElement>, 'children'> {
  /** What is happening, in words — "Agents Working", "Run Stopped". Announced politely. */
  label: ReactNode;
  tone?: PulseTone;
  /** False once the thing has stopped: the dot stays, the pulse goes. */
  active?: boolean;
  /** Keep the words for assistive tech only — for a pulse beside an icon-sized slot. */
  hideLabel?: boolean;
}

/**
 * A pulse with its words, in a polite live region.
 *
 * `role="status"` is on the wrapper rather than on a hidden span, so a change of `label` — "Run
 * Starting" to "Agents Working" — is announced once, without interrupting, and the pulse itself
 * never is.
 */
export const LiveIndicator = forwardRef<HTMLSpanElement, LiveIndicatorProps>(function LiveIndicator(
  { label, tone = 'accent', active = true, hideLabel = false, className, ...rest }, ref,
) {
  return (
    <span {...rest} ref={ref} role="status" data-active={active ? undefined : 'false'}
      className={cx('live-indicator', className)}>
      <Pulse tone={tone} data-still={active ? undefined : ''} />
      <span className={hideLabel ? 'sr-only' : 'live-indicator-label'}>{label}</span>
    </span>
  );
});

/** A part of a document in a run: being written now, waiting its turn, or written in this run. */
export type LiveState = 'writing' | 'queued' | 'written' | 'failed';

export interface LiveMarkLabels {
  writing?: ReactNode;
  queued?: ReactNode;
  written?: ReactNode;
  failed?: ReactNode;
}

const MARK_WORDS: Required<LiveMarkLabels> = {
  writing: 'Writing Now',
  queued: 'Queued',
  written: 'Rewritten',
  failed: 'Not Written',
};

const MARK_TONE: Record<LiveState, string> = {
  writing: 'tag-accent', queued: 'tag-neutral', written: 'tag-success', failed: 'tag-danger',
};

export interface LiveMarkProps extends Omit<HTMLAttributes<HTMLSpanElement>, 'children'> {
  /** Nothing is drawn when there is no state — a section the run is not touching carries no mark. */
  state: LiveState | undefined | null;
  /** The words per state. Defaults: Writing Now, Queued, Rewritten, Not Written. */
  labels?: LiveMarkLabels;
}

/**
 * A section's mark in a run: a tag with a pulse, a tick or a cross, and the word.
 *
 * Sits on a section heading, beside an entry in `Contents`, or in a list row. The same mark in all
 * three places is what lets a reader find the section being written from wherever they are.
 */
export const LiveMark = forwardRef<HTMLSpanElement, LiveMarkProps>(function LiveMark(
  { state, labels, className, ...rest }, ref,
) {
  if (!state) return null;
  const words = { ...MARK_WORDS, ...labels };
  return (
    <span {...rest} ref={ref} data-live={state} className={cx('tag', MARK_TONE[state], 'live-mark', className)}>
      {state === 'writing' && <Pulse />}
      {state === 'written' && <Tick />}
      {state === 'failed' && <Cross />}
      {words[state]}
    </span>
  );
});

export interface LiveSectionProps extends HTMLAttributes<HTMLElement> {
  /** The section's state in the run. `undefined` draws an ordinary section. */
  live?: LiveState | null;
  /** The element. `section` by default; `div` inside something that is already a section. */
  as?: 'section' | 'div' | 'article';
}

/**
 * A section of a document while a run is writing it.
 *
 * Writing: a bar down its side and a tint, and the body breathes — the words there are about to
 * change. Queued: it recedes. Written: full ink, a green bar, and the mark on its heading says so.
 * `aria-busy` is set while it is being written, so assistive tech does not read half a paragraph
 * as the finished text.
 */
export const LiveSection = forwardRef<HTMLElement, LiveSectionProps>(function LiveSection(
  { live, as: Tag = 'section', className, ...rest }, ref,
) {
  return <Tag {...rest} ref={ref as never} data-live={live ?? undefined}
    aria-busy={live === 'writing' || undefined}
    className={cx('live-section', className)} />;
});

/**
 * Where the work is, in a few characters: `§2.5`, or `§2.5 +1` when two places are being worked
 * at once. Empty when nothing is.
 */
export function liveWhere(places: string[], prefix = '§'): string {
  const now = places.filter(Boolean);
  if (!now.length) return '';
  return `${prefix}${now[0]}${now.length > 1 ? ` +${now.length - 1}` : ''}`;
}

/** The marks are drawn inline so the library takes no icon dependency. */
export const Tick = () => (
  <svg viewBox="0 0 16 16" aria-hidden="true" focusable="false">
    <path d="M3.5 8.5l3 3 6-7" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round"
      strokeLinejoin="round" fill="none" />
  </svg>
);

export const Cross = () => (
  <svg viewBox="0 0 16 16" aria-hidden="true" focusable="false">
    <path d="M4.5 4.5l7 7M11.5 4.5l-7 7" stroke="currentColor" strokeWidth="1.75"
      strokeLinecap="round" fill="none" />
  </svg>
);
