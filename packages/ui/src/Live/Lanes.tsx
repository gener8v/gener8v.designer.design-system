import { forwardRef, useId, useLayoutEffect, useRef, useState } from 'react';
import type { HTMLAttributes, ReactNode } from 'react';
import { cx } from '../cx.js';
import { Pulse, Tick, Cross } from './Live.js';

export type LaneTone = 'neutral' | 'muted' | 'accent' | 'success' | 'warning' | 'danger';

export interface Lane {
  id: string;
  /** The lane's name, in a reader's word — `Working`, not `running`. */
  label: string;
  tone?: LaneTone;
  /** The mark inside each pill in this lane. */
  marker?: 'pulse' | 'tick' | 'cross' | 'none';
  /**
   * When the lane is drawn.
   *
   * `always` — even empty. `while-active` — while any item is in a `while-active` lane, so an empty
   * Working lane mid-run is shown (that is news) and goes once the run is over. `when-occupied` —
   * only with something in it, for the lanes that are exceptions: stopped, skipped.
   */
  show?: 'always' | 'while-active' | 'when-occupied';
  /**
   * Which end of a long lane stays in view when `max` cuts it: `first` for a queue (the next to
   * start), `last` for a finished lane (the latest to finish). The rest are counted as `+N`.
   */
  keep?: 'first' | 'last';
  /** Say aloud when an item arrives in this lane. On for the lanes where something ended. */
  announce?: boolean;
}

export interface LaneItem {
  /** Stable across lanes: it is how a pill is followed from one lane to the next. */
  id: string;
  /** What a person calls it — `Theme finder`. */
  label: string;
  /** The id of the lane it is in. */
  lane: string;
  /** What it did, in the work's nouns — `12 themes`. Shown after the label. */
  detail?: string;
}

/**
 * An agent run's five lanes, in the record's words: waiting, working, done, and — only when there
 * are any — stopped and skipped.
 */
export const AGENT_LANES: Lane[] = [
  { id: 'waiting', label: 'Waiting', tone: 'muted', show: 'while-active', keep: 'first' },
  { id: 'running', label: 'Working', tone: 'accent', marker: 'pulse', show: 'while-active' },
  { id: 'done', label: 'Done', tone: 'success', marker: 'tick', show: 'always', keep: 'last', announce: true },
  { id: 'failed', label: 'Stopped', tone: 'danger', marker: 'cross', show: 'when-occupied', announce: true },
  { id: 'skipped', label: 'Skipped', tone: 'muted', show: 'when-occupied' },
];

export interface LanesProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  items: LaneItem[];
  /** The lanes, in order. Defaults to `AGENT_LANES`. */
  lanes?: Lane[];
  /** Names the whole set for assistive tech — `Agents in this run`. */
  'aria-label': string;
  /** Most pills a lane shows before counting the rest. Unlimited by default. */
  max?: number;
  /** Hide each item's `detail` — for a narrow popover. */
  hideDetail?: boolean;
  /** Before the first answer: the always-shown lanes, with placeholder pills, and `aria-busy`. */
  loading?: boolean;
  /** Shown when there are no items at all. */
  empty?: ReactNode;
}

const reduced = () =>
  typeof window !== 'undefined' && typeof window.matchMedia === 'function'
  && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * Work as swimlanes: who is waiting, who is working, who is done.
 *
 * NOT A GRAPH. The pipeline's shape belongs to an operator's console; a reader wants to see the
 * work move, and a pill sliding from Waiting to Working to Done says that at a glance. The slide
 * is a FLIP — each pill is measured before and after a change and animated from where it was —
 * and it does not run under reduced motion, where the pill simply appears in its new lane.
 *
 * Every lane says its count in figures, and each lane is a list named by its heading. An item
 * arriving in a lane marked `announce` is said once in a polite live region: "Theme finder: Done".
 */
export const Lanes = forwardRef<HTMLDivElement, LanesProps>(function Lanes(
  { items, lanes = AGENT_LANES, max, hideDetail = false, loading = false, empty, className, ...rest }, ref,
) {
  const base = useId();
  const nodes = useRef(new Map<string, HTMLElement>());
  const rects = useRef(new Map<string, DOMRect>());
  const where = useRef(new Map<string, string>());
  const mounted = useRef(false);
  const [said, setSaid] = useState('');

  const laneOf = new Map(lanes.map((l) => [l.id, l]));
  const active = items.some((i) => laneOf.get(i.lane)?.show === 'while-active');
  const shown = lanes.filter((l) => {
    const show = l.show ?? 'always';
    if (loading) return show === 'always' || show === 'while-active';
    return show === 'always'
      || (show === 'while-active' && active)
      || items.some((i) => i.lane === l.id);
  });

  // New pills arrive; pills that moved slide. Measured after paint-ready layout, before paint.
  useLayoutEffect(() => {
    const motion = mounted.current && !reduced();
    const next = new Map<string, DOMRect>();
    const arrivals: string[] = [];
    for (const [id, el] of nodes.current) {
      const now = el.getBoundingClientRect();
      next.set(id, now);
      const was = rects.current.get(id);
      if (motion && was && typeof el.animate === 'function') {
        const dx = was.left - now.left;
        const dy = was.top - now.top;
        if (Math.abs(dx) > 1 || Math.abs(dy) > 1) {
          el.animate(
            [{ transform: `translate(${dx}px, ${dy}px)` }, { transform: 'none' }],
            { duration: 360, easing: 'cubic-bezier(0.16, 1, 0.3, 1)' },
          );
        }
      }
    }
    for (const item of items) {
      const before = where.current.get(item.id);
      if (mounted.current && before !== undefined && before !== item.lane && laneOf.get(item.lane)?.announce) {
        arrivals.push(`${item.label}: ${laneOf.get(item.lane)!.label}`);
      }
    }
    rects.current = next;
    where.current = new Map(items.map((i) => [i.id, i.lane]));
    mounted.current = true;
    if (arrivals.length) setSaid(arrivals.join('. '));
  });

  const register = (id: string) => (el: HTMLElement | null) => {
    if (el) nodes.current.set(id, el); else nodes.current.delete(id);
  };

  return (
    <div {...rest} ref={ref} role="group" aria-busy={loading || undefined}
      className={cx('lanes', className)}>
      {!loading && items.length === 0 ? (
        <p className="lanes-empty">{empty ?? 'Nothing has started.'}</p>
      ) : shown.map((lane) => {
        const mine = items.filter((i) => i.lane === lane.id);
        const cut = max !== undefined && mine.length > max;
        const kept = !cut ? mine : (lane.keep === 'last' ? mine.slice(-max) : mine.slice(0, max));
        const hidden = mine.length - kept.length;
        const more = hidden > 0 && (
          <li className="lane-more">+{hidden}<span className="sr-only"> more</span></li>
        );
        const head = `${base}-${lane.id}`;
        return (
          <section key={lane.id} className="lane" data-tone={lane.tone ?? 'neutral'} aria-labelledby={head}>
            <p className="lane-name" id={head}>
              {lane.label}
              <span className="lane-count num">{loading ? '–' : mine.length}</span>
            </p>
            <ul className="lane-items" aria-labelledby={head}>
              {loading ? (
                <>
                  <li className="lane-item" data-placeholder=""><span className="skeleton skeleton-text" aria-hidden="true" /></li>
                  <li className="lane-item" data-placeholder=""><span className="skeleton skeleton-text" aria-hidden="true" /></li>
                </>
              ) : (
                <>
                  {lane.keep === 'last' && more}
                  {kept.map((item) => (
                    <li key={item.id} ref={register(item.id)} className="lane-item"
                      data-tone={lane.tone ?? 'neutral'}>
                      {lane.marker === 'pulse' && <Pulse />}
                      {lane.marker === 'tick' && <Tick />}
                      {lane.marker === 'cross' && <Cross />}
                      <span className="lane-item-label">{item.label}</span>
                      {!hideDetail && item.detail && <span className="lane-item-detail">{item.detail}</span>}
                    </li>
                  ))}
                  {lane.keep !== 'last' && more}
                  {mine.length === 0 && <li className="lane-none">None</li>}
                </>
              )}
            </ul>
          </section>
        );
      })}
      <span className="sr-only" aria-live="polite">{said}</span>
    </div>
  );
});
