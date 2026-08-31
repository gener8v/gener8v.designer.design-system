import { useCallback, useEffect, useId, useRef, useState } from 'react';
import type { HTMLAttributes, ReactNode } from 'react';
import { cx } from '../cx.js';

/** One record in the column. */
export interface DockItem {
  id: string;
  /** What it is called. Read in full only when it is the one at the focus point. */
  name: ReactNode;
  /** The mark it collapses to. A collapsed list of identical dots is a list of nothing. */
  mark?: ReactNode;
  /** A second line, shown only while grown — a version, a kind, a date. */
  note?: ReactNode;
}

export interface DockProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onSelect'> {
  items: DockItem[];
  /** Somebody chose one. Never called by scrolling or by focus — see the note on reading. */
  onSelect?: (id: string) => void;
  /** Which one is chosen, which is not the same as which one is being read. */
  selected?: string;
  /** Collapsed: every item is its mark until it reaches the focus point. */
  collapsed?: boolean;
  /** What to call the column, for somebody who cannot see it. */
  label: string;
}

/**
 * A long column of records, read by scrolling.
 *
 * Twenty-four standards in a 240px column, every name truncated — `ECOA-0a-Fair-Lending-Re…`,
 * `FRAME-00-Overview-and-…`. A reader cannot tell two documents apart without opening one, and the
 * column cannot be widened without taking the width from the thing they came to look at.
 *
 * So this trades PERSISTENT width for MOMENTARY width: everything stays small, and whatever is at
 * the focus point gets the room to be legible.
 *
 * FOCUS IS NOT SELECTION, AND THAT IS THE WHOLE DISCIPLINE
 *
 * Growing is a reading affordance. Scrolling past an item must not open it, must not select it,
 * and must not tell the caller anything happened — `onSelect` fires on a click and on Enter, and
 * on nothing else. A list that opened whatever the wheel stopped on would make reading it
 * dangerous, which is the opposite of what a dock is for.
 *
 * THE FOCUS POINT IS A THIRD DOWN, NOT THE CENTRE
 *
 * A dock magnifies at the pointer; a scrolling column has no pointer, so the focus is a position.
 * A third down is where a reader's eye already is when scanning a list — the centre puts the grown
 * item below where they are looking and makes the column feel like it lags.
 *
 * REDUCED MOTION IS NOT NO INFORMATION
 *
 * `prefers-reduced-motion` removes the ANIMATION, not the reading: every name is shown in full and
 * nothing scales. A magnification that tracks scroll is motion, and somebody who has asked for
 * none of it must still be able to tell two documents apart — which is the problem this exists to
 * solve, not a decoration on top of it.
 *
 * A KEYBOARD MOVES THE SAME GROWTH
 *
 * Arrow keys move focus and the growth follows, so the behaviour exists for somebody who is not
 * using a wheel. Roving tabindex, one stop for the column.
 */
export function Dock({
  items,
  onSelect,
  selected,
  collapsed = false,
  label,
  className,
  ...rest
}: DockProps) {
  const listId = useId();
  const box = useRef<HTMLDivElement>(null);
  const [near, setNear] = useState<string>('');
  const [at, setAt] = useState(0);

  /** Which item is at the focus point, measured rather than counted: rows are not all one height
   *  once one of them has grown. */
  const measure = useCallback(() => {
    const element = box.current;
    if (!element) return;
    const focus = element.getBoundingClientRect().top + element.clientHeight / 3;
    let closest = '';
    let best = Number.POSITIVE_INFINITY;
    for (const row of element.querySelectorAll<HTMLElement>('[data-dock-item]')) {
      const rect = row.getBoundingClientRect();
      const distance = Math.abs(rect.top + rect.height / 2 - focus);
      if (distance < best) {
        best = distance;
        closest = row.dataset.dockItem ?? '';
      }
    }
    setNear(closest);
  }, []);

  useEffect(() => {
    measure();
  }, [measure, items, collapsed]);

  const move = (delta: number) => {
    const next = Math.min(items.length - 1, Math.max(0, at + delta));
    setAt(next);
    const id = items[next]?.id ?? '';
    setNear(id);
    box.current
      ?.querySelector<HTMLElement>(`[data-dock-item="${CSS.escape(id)}"] button`)
      ?.focus();
  };

  return (
    <div
      {...rest}
      ref={box}
      className={cx('dock', className)}
      data-collapsed={collapsed || undefined}
      onScroll={measure}
      role="listbox"
      aria-label={label}
      aria-describedby={listId}
      onKeyDown={(event) => {
        if (event.key === 'ArrowDown') {
          event.preventDefault();
          move(1);
        } else if (event.key === 'ArrowUp') {
          event.preventDefault();
          move(-1);
        }
      }}
    >
      {/* SAID, NOT IMPLIED. Somebody using a screen reader is told what the column does, because
          the growth they cannot see is the whole of how it is meant to be read. */}
      <p id={listId} className="sr-only">
        Reading this list grows whichever record is at the focus point. Growing one does not open
        it.
      </p>
      {items.map((item, index) => {
        const grown = item.id === near;
        return (
          <div
            key={item.id}
            data-dock-item={item.id}
            data-grown={grown || undefined}
            className="dock-item"
          >
            <button
              type="button"
              role="option"
              aria-selected={item.id === selected}
              tabIndex={index === at ? 0 : -1}
              onFocus={() => {
                setAt(index);
                setNear(item.id);
              }}
              // NOTHING HERE ON SCROLL OR FOCUS. `onSelect` is a click or an Enter, and a list
              // that opened whatever the wheel stopped on would make reading it dangerous.
              onClick={() => onSelect?.(item.id)}
            >
              <span className="dock-mark" aria-hidden={Boolean(item.mark)}>
                {item.mark}
              </span>
              <span className="dock-name">{item.name}</span>
              {item.note && grown && <span className="dock-note">{item.note}</span>}
            </button>
          </div>
        );
      })}
    </div>
  );
}
