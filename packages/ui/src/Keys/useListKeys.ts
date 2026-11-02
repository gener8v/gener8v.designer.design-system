import { useCallback, useEffect, useRef, useState } from 'react';
import { isTypingTarget, modalAbove, modified } from './typing.js';

/** The next index from `at` by `by`: held at the ends, or wrapped round when `wrap` is set. */
export function stepIndex(at: number, count: number, by: number, wrap = false): number {
  if (count <= 0) return -1;
  // Nothing focused yet: either key starts at the top, which is where a reader's eye already is.
  if (at < 0) return 0;
  const next = at + by;
  if (wrap) return ((next % count) + count) % count;
  return Math.min(count - 1, Math.max(0, next));
}

export interface ListKeysOptions {
  /** How many items the list has now. */
  count: number;
  /** What Enter does on the focused item. Enter on a button inside the item is the button's. */
  onOpen?: (index: number) => void;
  /**
   * Other single keys, lower case, each handed the focused index (-1 before any has focus). The
   * page's own verbs: `{ a: accept, r: reject }`.
   */
  keys?: Record<string, (index: number) => void>;
  /** Off while the list is not the thing on screen — a hidden tab, a collapsed panel. */
  enabled?: boolean;
  /** Past the last item comes the first. Off by default: a triage list has an end. */
  wrap?: boolean;
}

export interface ListKeyItemProps {
  ref: (node: HTMLElement | null) => void;
  tabIndex: number;
  'data-list-item': '';
  onFocus: () => void;
}

export interface ListKeys {
  /** The item that has, or last had, focus. -1 before any. */
  active: number;
  /** Move focus to an item, and scroll it into view. */
  focus: (index: number) => void;
  /** Spread onto each item, in order. */
  itemProps: (index: number) => ListKeyItemProps;
}

/**
 * Moving through a list of cards from the keyboard, the way a triage inbox does.
 *
 * `J` / `K` move from anywhere on the page; `↓` / `↑`, `Home` and `End` move once focus is in the
 * list, so the arrows still scroll a page nobody is triaging. `Enter` opens. Any other single key
 * the page binds acts on the item with focus.
 *
 * ROVING FOCUS, REAL FOCUS. The item moved to is focused, not painted: the browser knows where you
 * are, a screen reader hears the item, and Tab leaves the list from where you are rather than from
 * its top. One item is in the tab order at a time; buttons inside an item stay reachable by Tab.
 *
 * NEVER WHILE TYPING, AND NEVER UNDER A DIALOG. Keys are ignored inside a field, with a modifier
 * held, or while a modal surface that does not hold the list is open — the dialog owns the keyboard
 * then.
 */
export function useListKeys({
  count, onOpen, keys = {}, enabled = true, wrap = false,
}: ListKeysOptions): ListKeys {
  const [active, setActive] = useState(-1);
  const nodes = useRef<(HTMLElement | null)[]>([]);
  // The latest values, read at key time, so the listener is attached once rather than per render.
  const latest = useRef({ active, count, onOpen, keys, wrap });
  latest.current = { active, count, onOpen, keys, wrap };

  // A list that shrank under the reader keeps them on an item that exists.
  useEffect(() => { if (active >= count) setActive(count - 1); }, [active, count]);

  const focus = useCallback((i: number) => {
    if (i < 0) return;
    setActive(i);
    const node = nodes.current[i];
    node?.focus();
    node?.scrollIntoView?.({ block: 'nearest' });
  }, []);

  useEffect(() => {
    if (!enabled) return;
    function onKey(e: KeyboardEvent) {
      if (e.defaultPrevented || modified(e) || isTypingTarget(e.target)) return;
      const { active: at, count: n, onOpen: open, keys: bound, wrap: round } = latest.current;
      const list = nodes.current.slice(0, n);
      if (modalAbove(list.find(Boolean) ?? null)) return;
      const inList = list.some((node) => node && node === document.activeElement);
      const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;

      const by = key === 'j' || (inList && key === 'ArrowDown') ? 1
        : key === 'k' || (inList && key === 'ArrowUp') ? -1 : 0;
      if (by) { e.preventDefault(); focus(stepIndex(at, n, by, round)); return; }
      if (inList && (key === 'Home' || key === 'End')) {
        e.preventDefault();
        focus(key === 'Home' ? 0 : n - 1);
        return;
      }
      if (key === 'Enter' && open && at >= 0 && document.activeElement === nodes.current[at]) {
        e.preventDefault();
        open(at);
        return;
      }
      const act = bound[key] ?? bound[e.key];
      if (act) { e.preventDefault(); act(at); }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [enabled, focus]);

  const itemProps = useCallback((i: number): ListKeyItemProps => ({
    ref: (node) => { nodes.current[i] = node; },
    tabIndex: i === (active < 0 ? 0 : active) ? 0 : -1,
    'data-list-item': '',
    onFocus: () => setActive(i),
  }), [active]);

  return { active, focus, itemProps };
}
