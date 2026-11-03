import { forwardRef, useEffect, useState } from 'react';
import type { HTMLAttributes, MouseEvent, ReactNode } from 'react';
import { cx } from '../cx.js';
import { Pulse } from '../Live/Live.js';
import type { LiveState } from '../Live/Live.js';

export interface ContentsItem {
  /** The heading's element id — the link's target. */
  id: string;
  text: string;
  /** 1 for a top-level heading, 2 under it, and so on. Indents the entry. */
  depth?: number;
  /** The section's state while a run is writing the document. Draws the same mark as `LiveMark`. */
  live?: LiveState | null;
  /** Something after the entry — a tag saying what changed in it while two versions are compared. */
  after?: ReactNode;
  /**
   * What a review mark is kept under. Defaults to `id`. Give it when two headings share an anchor,
   * or when a mark should lapse once the section's text changes (an id plus a hash of the text):
   * a reviewer must not be shown vouching for words they never saw.
   */
  reviewKey?: string;
}

export interface ContentsProps extends Omit<HTMLAttributes<HTMLElement>, 'title'> {
  items: ContentsItem[];
  /** The visible heading. `Contents` by default. */
  title?: ReactNode;
  /** The entry for the section in view. Omit to let the list work it out as the page scrolls. */
  current?: string;
  /** Watch the headings and mark the one in view. On by default; ignored when `current` is given. */
  spy?: boolean;
  /**
   * Fewer entries than this and nothing is drawn: a contents list over two headings is furniture.
   * 3 by default.
   */
  minItems?: number;
  /** Review keys a reader has marked. Giving this with `onReviewedChange` adds the checkboxes. */
  reviewed?: ReadonlySet<string> | readonly string[];
  onReviewedChange?: (key: string, reviewed: boolean) => void;
  /** Instead of scrolling to the heading and setting the hash. Called for a plain left click only. */
  onNavigate?: (id: string, event: MouseEvent<HTMLAnchorElement>) => void;
  /** Placeholder entries while the document is still arriving. */
  loading?: boolean;
}

const LIVE_WORDS: Record<LiveState, string> = {
  writing: 'being written now', queued: 'queued', written: 'rewritten in this run', failed: 'not written',
};

/**
 * Where you are in a long document, and how to get elsewhere in it.
 *
 * SCROLL-SPY BY INTERSECTIONOBSERVER, not by reading `scrollTop` every frame. The browser already
 * knows which headings are on screen, and asking it stays right when a diagram loads and shifts
 * everything below. The current entry is the first heading in the upper third of the window — what
 * a reader means by "where I am" — and it is marked with `aria-current="location"`, not a class.
 *
 * REVIEWED, OPTIONALLY. Like a code review's "Viewed": a box beside each entry and `4/78 reviewed`
 * by the heading. Keys are the caller's, so a mark can lapse when the section is rewritten.
 *
 * LIVE MARKS. While a run writes the document, each entry carries the same mark as its section, so
 * the section being written can be found and jumped to from the contents. "Rewritten in this run" is
 * a small filled dot, never a tick: a tick is the review box's word. Where the review box is
 * checked the dot is left out (the box already has the entry's eye); the screen-reader words stay.
 *
 * ROOT CLASSES. `contents contents-nav`. Tailwind generates `display: contents` for any source that
 * contains the word "contents", and that utility turns the nav into a box-less element. The
 * component sets `display: block` on `nav.contents` / `.contents-nav` so it keeps its box, and the
 * tailwind-preset ships `@source not inline("contents")` so the utility is not generated at all.
 *
 * Long headings are held to two lines; the full text is the link's `title`.
 */
export const Contents = forwardRef<HTMLElement, ContentsProps>(function Contents(
  {
    items, title = 'Contents', current, spy = true, minItems = 3, reviewed, onReviewedChange,
    onNavigate, loading = false, className, 'aria-label': label = 'Contents', ...rest
  }, ref,
) {
  const [seen, setSeen] = useState('');
  const watching = spy && current === undefined && !loading && items.length >= minItems;

  useEffect(() => {
    if (!watching || typeof IntersectionObserver === 'undefined') return;
    const visible = new Map<string, boolean>();
    const observer = new IntersectionObserver((entries) => {
      for (const e of entries) visible.set(e.target.id, e.isIntersecting);
      // The FIRST heading in the band, in document order. The last one to fire would make the
      // mark jump backwards while scrolling up.
      const first = items.find((i) => visible.get(i.id));
      if (first) setSeen(first.id);
    }, { rootMargin: '0px 0px -70% 0px' });
    for (const item of items) {
      const node = document.getElementById(item.id);
      if (node) observer.observe(node);
    }
    return () => observer.disconnect();
  }, [items, watching]);

  if (loading) {
    return (
      <nav {...rest} ref={ref} aria-label={label} aria-busy="true" className={cx('contents', 'contents-nav', className)}>
        <p className="contents-head"><span className="contents-title">{title}</span></p>
        <ol className="contents-list">
          {[0, 1, 2, 3, 4].map((i) => (
            <li key={i} className="contents-item" data-depth={i % 3 === 0 ? 1 : 2}>
              <span className="skeleton skeleton-text" aria-hidden="true" />
            </li>
          ))}
        </ol>
      </nav>
    );
  }
  if (items.length < minItems) return null;

  const here = current ?? seen;
  const marks = reviewed instanceof Set ? reviewed : new Set(reviewed as readonly string[] | undefined);
  const checking = Boolean(onReviewedChange);
  const keyOf = (item: ContentsItem) => item.reviewKey ?? item.id;
  const done = checking ? items.filter((i) => marks.has(keyOf(i))).length : 0;

  const go = (item: ContentsItem) => (e: MouseEvent<HTMLAnchorElement>) => {
    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    if (onNavigate) { e.preventDefault(); onNavigate(item.id, e); return; }
    const target = document.getElementById(item.id);
    if (!target) return;
    e.preventDefault();
    target.scrollIntoView?.({ block: 'start' });
    // The hash is set so the place is linkable and Back works, without a second scroll jump.
    history.replaceState(null, '', `#${item.id}`);
    setSeen(item.id);
  };

  return (
    <nav {...rest} ref={ref} aria-label={label} className={cx('contents', 'contents-nav', className)}>
      <p className="contents-head">
        <span className="contents-title">{title}</span>
        {checking && (
          <span className="contents-count num">{done}/{items.length} reviewed</span>
        )}
      </p>
      <ol className="contents-list">
        {items.map((item, at) => {
          const key = keyOf(item);
          return (
            <li key={`${at}:${item.id}`} className="contents-item"
              data-depth={Math.min(4, Math.max(1, item.depth ?? 1))}
              data-live={item.live ?? undefined}>
              {checking && (
                <input type="checkbox" className="checkbox contents-check"
                  checked={marks.has(key)}
                  onChange={(e) => onReviewedChange!(key, e.currentTarget.checked)}
                  aria-label={`Reviewed: ${item.text}`} />
              )}
              <a className="contents-link" href={`#${item.id}`} title={item.text}
                aria-current={item.id === here ? 'location' : undefined}
                onClick={go(item)}>
                {item.live === 'writing' && <Pulse className="contents-live" />}
                {item.live === 'written' && !(checking && marks.has(key)) && (
                  <svg className="contents-live contents-written" viewBox="0 0 16 16" aria-hidden="true"
                    focusable="false">
                    <circle cx="8" cy="8" r="3.5" fill="currentColor" />
                  </svg>
                )}
                <span className="contents-text">{item.text}</span>
                {item.live && <span className="sr-only">, {LIVE_WORDS[item.live]}</span>}
              </a>
              {item.after ? <span className="contents-after">{item.after}</span> : null}
            </li>
          );
        })}
      </ol>
    </nav>
  );
});
