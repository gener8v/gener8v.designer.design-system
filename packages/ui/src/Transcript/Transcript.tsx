import type { HTMLAttributes, ReactNode } from 'react';
import { cx } from '../cx.js';

export interface TranscriptProps extends HTMLAttributes<HTMLOListElement> {
  /** Names the session for assistive technology — "BTS leadership, 25 August". */
  label: string;
}

/**
 * A RECORD OF WHAT PEOPLE SAID, THAT SOMEBODY WORKS FROM.
 *
 * `Conversation` is two-sided and live: one side is the person using the product, the other is
 * whatever answers them, and it announces turns as they arrive. An interview is neither. It has
 * three people in it as easily as two, nobody is adding to it, and the reader is not following
 * along — they are working through it, marking what each stretch is evidence of.
 *
 * `Comment` is one authored note ABOUT something, with a time that matters. A transcript turn is
 * part of a continuous exchange and its timestamp locates a moment in a recording the reader does
 * not have.
 *
 * So: an ordered list, because the sequence is the content. A transcript whose order is a
 * rendering detail is one where "the second session contradicted the first" cannot be said.
 */
export const Transcript = ({ label, className, ...rest }: TranscriptProps) => (
  <ol {...rest} aria-label={label} className={cx('transcript', className)} />
);

export interface TranscriptTurnProps extends Omit<HTMLAttributes<HTMLLIElement>, 'onSelect'> {
  /** Who was speaking. Shown here and nowhere downstream — see the note on `mark`. */
  speaker: ReactNode;
  /** What this stretch has been marked as evidence of. DATA, so it never hides. */
  mark?: ReactNode;
  /**
   * What can be done with this stretch.
   *
   * REVEALED ON INTERACTION, NOT PAINTED ON EVERY ROW — see `.on-demand`. An hour-long session is
   * three hundred turns, and a control on each one is three hundred controls competing with the
   * words that are the actual content.
   */
  action?: ReactNode;
  /** The stretch being worked on right now. */
  current?: boolean;
}

/**
 * ONE STRETCH OF ONE PERSON TALKING.
 *
 * Consecutive turns by one speaker arrive already merged — the parser that reads a transcript does
 * it, because it is a property of the text rather than of the rendering. This shows every speaker
 * name it is given rather than collapsing runs itself, which would hide a change of speaker the
 * caller believed it was showing.
 */
export function TranscriptTurn({
  speaker, mark, action, current = false, children, className, ...rest
}: TranscriptTurnProps) {
  return (
    <li
      {...rest}
      data-current={current || undefined}
      className={cx('transcript-turn', 'on-demand-row', className)}
    >
      <p className="transcript-speaker">{speaker}</p>
      <div className="transcript-said">{children}</div>
      {(mark || action) && (
        <div className="transcript-margin">
          {mark ? <span className="transcript-mark">{mark}</span> : null}
          {action ? <span className="transcript-action on-demand">{action}</span> : null}
        </div>
      )}
    </li>
  );
}
