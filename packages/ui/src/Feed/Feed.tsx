import { forwardRef, useId } from 'react';
import type { LiHTMLAttributes, OlHTMLAttributes, ReactNode } from 'react';
import { cx } from '../cx.js';

/**
 * Who did what, in order, with each person's run of actions kept together.
 *
 * A `Timeline` is a chronology of events with nobody in them. An activity record is a sequence of
 * people: Dana opened three findings, then Sam answered two of them. Repeating "Dana" on each of
 * the three rows makes the reader find the boundaries between people by reading names; grouping
 * puts the boundary in the layout, where it is seen rather than read.
 *
 * An ordered list of groups, each an ordered list of items — the order is the content, and a
 * screen reader announces "3 of 5" without a word of it written here. Not `role="feed"`: that
 * pattern is for an infinitely-loading stream of articles, which this is not.
 */
export const Feed = forwardRef<HTMLOListElement, OlHTMLAttributes<HTMLOListElement>>(
  function Feed({ className, ...rest }, ref) {
    return <ol {...rest} ref={ref} className={cx('feed', className)} />;
  });

export interface FeedGroupProps extends Omit<LiHTMLAttributes<HTMLLIElement>, 'title'> {
  /** Who did the things in this group. */
  actor: ReactNode;
  /** When the run started — a `<time>` is best. */
  when?: ReactNode;
  /** A mark for the actor, usually an `Avatar size="sm"`. */
  avatar?: ReactNode;
}

export const FeedGroup = forwardRef<HTMLLIElement, FeedGroupProps>(function FeedGroup(
  { actor, when, avatar, className, children, ...rest }, ref,
) {
  const id = useId();
  return (
    <li {...rest} ref={ref} className={cx('feed-group', className)}>
      <div className="feed-head">
        {avatar}
        <span className="feed-actor" id={id}>{actor}</span>
        {when !== undefined ? <span className="feed-when">{when}</span> : null}
      </div>
      <ol className="feed-items" aria-labelledby={id}>{children}</ol>
    </li>
  );
});

/** What sits on the rule beside an item. */
export type FeedMarker = 'dot' | 'number' | 'icon';

export interface FeedItemProps extends Omit<LiHTMLAttributes<HTMLLIElement>, 'title'> {
  /**
   * What happened, as a short verb phrase — "Opened", "Answered", "Attached evidence". Set in
   * the text face at weight 500, ahead of the body, so a column of them scans as a list of acts.
   */
  kind?: ReactNode;
  /** When, within the group. */
  time?: ReactNode;
  /**
   * `dot` by default. `number` counts the group's items in order (or shows `number`), for a run
   * whose sequence matters; `icon` shows `icon`, for a feed whose kinds are few and recognisable.
   */
  marker?: FeedMarker;
  /** Shown in the marker when `marker="icon"`. Decorative: `kind` carries the meaning. */
  icon?: ReactNode;
  /** Overrides the count when `marker="number"`. */
  number?: number;
  /** Highlights the marker as the live entry. */
  current?: boolean;
}

export const FeedItem = forwardRef<HTMLLIElement, FeedItemProps>(function FeedItem(
  { kind, time, marker = 'dot', icon, number, current = false, className, children, ...rest }, ref,
) {
  return (
    <li {...rest} ref={ref} data-marker={marker} data-state={current ? 'current' : undefined}
      className={cx('feed-item', className)}>
      <span className="feed-marker" aria-hidden="true">
        {marker === 'icon' ? icon : marker === 'number' && number !== undefined ? number : null}
      </span>
      <div className="feed-content">
        {kind !== undefined || time !== undefined ? (
          <p className="feed-line">
            {kind !== undefined ? <span className="feed-kind">{kind}</span> : null}
            {time !== undefined ? <span className="feed-time">{time}</span> : null}
          </p>
        ) : null}
        {children !== undefined && children !== null ? <div className="feed-body">{children}</div> : null}
      </div>
    </li>
  );
});
