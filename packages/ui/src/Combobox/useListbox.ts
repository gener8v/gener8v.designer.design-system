import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import type { KeyboardEvent, MouseEvent as ReactMouseEvent, RefObject } from 'react';
import { flushSync } from 'react-dom';

/** How long a pause starts the type-ahead buffer again. Not a motion duration: a typing rhythm. */
const TYPEAHEAD_WINDOW = 500;

export interface ListboxOptions {
  /** How many options, in display order. */
  count: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** The chosen option's index, or -1 for none. */
  selectedIndex: number;
  /** An option's text, for type-ahead. */
  textOf: (index: number) => string;
  isDisabled?: (index: number) => boolean;
  /** Called with an enabled option's index. The list closes and focus goes back to the button. */
  onChoose: (index: number) => void;
  /** A prefix for the option ids. Defaults to one from `useId`. */
  idBase?: string;
  /** Milliseconds of quiet after which type-ahead starts a new search. Default 500. */
  typeaheadWindow?: number;
}

/** A callback ref, so it fits any element: a `div`, a `ul`, a `button`. */
export type ListboxRef = (node: HTMLElement | null) => void;

export interface ListboxRootProps {
  ref: ListboxRef;
}

export interface ListboxButtonProps {
  ref: ListboxRef;
  'aria-haspopup': 'listbox';
  'aria-expanded': boolean;
  'aria-controls': string | undefined;
  onClick: () => void;
  onKeyDown: (e: KeyboardEvent<HTMLElement>) => void;
}

export interface ListboxListProps {
  ref: ListboxRef;
  id: string;
  role: 'listbox';
  tabIndex: -1;
  'aria-activedescendant': string | undefined;
  onKeyDown: (e: KeyboardEvent<HTMLElement>) => void;
}

export interface ListboxOptionProps {
  id: string;
  role: 'option';
  'aria-selected': boolean;
  'aria-disabled': true | undefined;
  'data-active': '' | undefined;
  onMouseDown: (e: ReactMouseEvent) => void;
  onMouseMove: () => void;
  onClick: () => void;
}

export interface Listbox {
  /** The button, once mounted. */
  buttonRef: RefObject<HTMLElement | null>;
  /** The list, while open. */
  listRef: RefObject<HTMLElement | null>;
  /** The option the keys are on. Mark it with `data-active` (`optionProps` does). */
  active: number;
  setActive: (index: number) => void;
  optionId: (index: number) => string;
  /** Open with the keys on `index`, or the nearest enabled option to it. */
  openAt: (index: number) => void;
  /** Close without a change; `refocus` puts focus back on the button. */
  close: (refocus: boolean) => void;
  /** Choose an enabled option, close, and put focus back on the button. */
  choose: (index: number) => void;
  /** Spread on the element that holds both the button and the list: a press outside it closes. */
  rootProps: () => ListboxRootProps;
  /** Spread on the button that opens the list. */
  buttonProps: () => ListboxButtonProps;
  /** Spread on the list. It takes focus while open; the active option is its active descendant. */
  listProps: () => ListboxListProps;
  /** Spread on each option, in order. */
  optionProps: (index: number) => ListboxOptionProps;
}

/**
 * The keyboard contract of a collapsible listbox — a button that opens a list of options — from
 * the WAI-ARIA Authoring Practices. Behaviour only: the caller owns the markup and the look, and
 * positions the list with `useAnchoredPosition`.
 *
 * ON THE BUTTON. Enter, Space or ↓ open on the chosen option (the first enabled one when none is
 * chosen); ↑ opens on the last.
 *
 * IN THE LIST. ↓ / ↑ move and stop at the ends — no wrap, so holding a key does not lap the list
 * and leave someone lost. Home and End go to the first and last. Every move skips disabled options.
 * Typing a letter jumps to the next option that starts with it; typing the same letter again
 * cycles through those options; typing a word quickly matches the word. Enter, Space or a click
 * choose. Escape closes without a change and puts focus back on the button.
 *
 * TAB. Closes the list and carries on from the button, so Tab reaches the next control and
 * Shift+Tab lands on the button. The list is removed synchronously (`flushSync`) before the
 * browser moves focus — otherwise focus would leave from an element that is about to vanish and
 * drop to the page.
 *
 * SCROLLING. The active option is kept in view by scrolling the list only. `scrollIntoView` would
 * also scroll the page, which moves the button out from under the person using it.
 */
export function useListbox({
  count, open, onOpenChange, selectedIndex, textOf, isDisabled, onChoose, idBase,
  typeaheadWindow = TYPEAHEAD_WINDOW,
}: ListboxOptions): Listbox {
  const autoId = useId().replace(/[^a-zA-Z0-9_-]/g, '');
  const base = idBase ?? `listbox-${autoId}`;
  const disabled = (i: number) => Boolean(isDisabled?.(i));
  const rootRef = useRef<HTMLElement | null>(null);
  const buttonRef = useRef<HTMLElement | null>(null);
  const listRef = useRef<HTMLElement | null>(null);
  const setRoot = useCallback((n: HTMLElement | null) => { rootRef.current = n; }, []);
  const setButton = useCallback((n: HTMLElement | null) => { buttonRef.current = n; }, []);
  const setList = useCallback((n: HTMLElement | null) => { listRef.current = n; }, []);
  const [active, setActive] = useState(0);
  const typed = useRef('');
  const typedAt = useRef(0);
  const optionId = useCallback((i: number) => `${base}-opt-${i}`, [base]);
  const listId = `${base}-list`;

  /** The nearest enabled option from `from`, stepping by `step`, without wrapping; -1 if none. */
  const enabledFrom = (from: number, step: 1 | -1): number => {
    for (let i = from; i >= 0 && i < count; i += step) if (!disabled(i)) return i;
    return -1;
  };
  const first = () => enabledFrom(0, 1);
  const last = () => enabledFrom(count - 1, -1);

  const close = useCallback((refocus: boolean) => {
    onOpenChange(false);
    if (refocus) buttonRef.current?.focus();
  }, [onOpenChange]);

  // Opening moves focus to the list. preventScroll: the page never jumps to reveal it.
  const wasOpen = useRef(false);
  useLayoutEffect(() => {
    if (open && !wasOpen.current) listRef.current?.focus({ preventScroll: true });
    wasOpen.current = open;
  }, [open]);

  // Keep the active option in view by scrolling the list, never the page.
  useEffect(() => {
    if (!open || typeof document === 'undefined') return;
    const list = listRef.current;
    const el = document.getElementById(optionId(active));
    if (!list || !el || list.scrollHeight <= list.clientHeight) return;
    const top = el.offsetTop - list.offsetTop;
    if (top < list.scrollTop) list.scrollTop = top;
    else if (top + el.offsetHeight > list.scrollTop + list.clientHeight) {
      list.scrollTop = top + el.offsetHeight - list.clientHeight;
    }
  }, [open, active, optionId]);

  // A press outside closes without a change, and leaves focus where the press put it.
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) close(false);
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [open, close]);

  const openAt = (index: number) => {
    const at = Math.max(0, Math.min(index, count - 1));
    const next = enabledFrom(at, 1);
    setActive(Math.max(0, next >= 0 ? next : enabledFrom(at, -1)));
    onOpenChange(true);
  };

  const choose = (index: number) => {
    if (index < 0 || index >= count || disabled(index)) return;
    onChoose(index);
    close(true);
  };

  const typeAhead = (ch: string) => {
    const now = Date.now();
    if (now - typedAt.current > typeaheadWindow) typed.current = '';
    typedAt.current = now;
    typed.current += ch.toLocaleLowerCase();
    const buffer = typed.current;
    // One letter pressed again and again cycles through the options that start with it.
    const search = buffer.split('').every((c) => c === buffer[0]) ? buffer[0]! : buffer;
    const from = search.length === 1 ? active + 1 : active;
    for (let step = 0; step < count; step += 1) {
      const i = (from + step) % count;
      if (!disabled(i) && textOf(i).toLocaleLowerCase().startsWith(search)) {
        setActive(i);
        return;
      }
    }
  };

  const onButtonKeyDown = (e: KeyboardEvent<HTMLElement>) => {
    if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      openAt(selectedIndex >= 0 ? selectedIndex : first());
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      openAt(last());
    }
  };

  const onButtonClick = () => (open ? close(true) : openAt(selectedIndex >= 0 ? selectedIndex : first()));

  const onListKeyDown = (e: KeyboardEvent<HTMLElement>) => {
    const move = (to: number) => {
      e.preventDefault();
      if (to >= 0) setActive(to);
    };
    switch (e.key) {
      case 'ArrowDown': move(enabledFrom(active + 1, 1)); return;
      case 'ArrowUp': move(enabledFrom(active - 1, -1)); return;
      case 'Home': move(first()); return;
      case 'End': move(last()); return;
      case 'Enter':
        e.preventDefault();
        choose(active);
        return;
      case ' ':
        e.preventDefault();
        // A space in the middle of a typed word is part of the word, not a choice.
        if (typed.current && Date.now() - typedAt.current <= typeaheadWindow) typeAhead(' ');
        else choose(active);
        return;
      case 'Escape':
        // The list is the top-most layer: whatever is around it keeps its own Escape.
        e.preventDefault();
        e.stopPropagation();
        close(true);
        return;
      case 'Tab':
        if (e.shiftKey) e.preventDefault();
        flushSync(() => onOpenChange(false));
        buttonRef.current?.focus();
        return;
      default:
        if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
          e.preventDefault();
          typeAhead(e.key);
        }
    }
  };

  const activeDescendant = open && count ? optionId(active) : undefined;

  return {
    buttonRef,
    listRef,
    active,
    setActive,
    optionId,
    openAt,
    close,
    choose,
    rootProps: () => ({ ref: setRoot }),
    buttonProps: () => ({
      ref: setButton,
      'aria-haspopup': 'listbox',
      'aria-expanded': open,
      'aria-controls': open ? listId : undefined,
      onClick: onButtonClick,
      onKeyDown: onButtonKeyDown,
    }),
    listProps: () => ({
      ref: setList,
      id: listId,
      role: 'listbox',
      tabIndex: -1,
      'aria-activedescendant': activeDescendant,
      onKeyDown: onListKeyDown,
    }),
    optionProps: (i: number) => ({
      id: optionId(i),
      role: 'option',
      'aria-selected': i === selectedIndex,
      'aria-disabled': disabled(i) || undefined,
      'data-active': open && i === active ? '' : undefined,
      // Keep focus on the list: a press on an option must not blur it first.
      onMouseDown: (e: ReactMouseEvent) => e.preventDefault(),
      onMouseMove: () => { if (!disabled(i) && i !== active) setActive(i); },
      onClick: () => choose(i),
    }),
  };
}
