import type { HTMLAttributes, ReactNode } from 'react';
import { cx } from '../cx.js';

/** Who is speaking. `sent` is the person using the product; `received` is
 *  whatever answers them. */
export type TurnSide = 'sent' | 'received';

export interface ConversationProps extends HTMLAttributes<HTMLDivElement> {
  /** Names the log for assistive technology — "Ask the record", "Support". */
  label: string;
  /**
   * Announce turns as they arrive. On by default, because a conversation that
   * streams its answer is a live region by definition: a reader who cannot see
   * the page has no other way to know the reply landed.
   *
   * Turn it off for a transcript nobody is adding to — announcing a history
   * somebody navigated to would read the whole thing aloud.
   */
  live?: boolean;
}

/**
 * `role="log"` rather than `role="feed"`. A log is a sequence where new entries
 * are appended and the newest matters most, which is what this is; a feed is an
 * infinite, scrollable set of articles with its own keyboard contract that no
 * conversation implements.
 */
export function Conversation({ label, live = true, className, ...rest }: ConversationProps) {
  return (
    <div
      {...rest}
      role="log"
      aria-label={label}
      aria-live={live ? 'polite' : 'off'}
      // Only the new turn is read, not the whole history each time one lands.
      aria-relevant="additions"
      className={cx('conversation', className)}
    />
  );
}

export interface TurnProps extends HTMLAttributes<HTMLDivElement> {
  side: TurnSide;
  /** Who said it, and when. Optional — a two-party exchange rarely needs it on
   *  every turn, and repeating "You" forty times is noise. */
  meta?: ReactNode;
}

export function Turn({ side, meta, children, className, ...rest }: TurnProps) {
  return (
    <div {...rest} data-side={side} className={cx('turn', className)}>
      {meta ? <p className="turn-meta">{meta}</p> : null}
      <div className="turn-body">{children}</div>
    </div>
  );
}

/** Waiting for the other side. The dot animates; this carries the word, because
 *  an animation is not an announcement. */
export const TurnPending = ({ className, children, ...rest }: HTMLAttributes<HTMLParagraphElement>) => (
  <p {...rest} className={cx('turn-pending', 'turn-meta', className)}>
    {children ?? 'Working…'}
  </p>
);
