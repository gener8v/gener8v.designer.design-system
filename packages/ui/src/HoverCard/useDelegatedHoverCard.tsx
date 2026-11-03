import { useCallback, useEffect, useId, useRef, useState } from 'react';
import type { FocusEvent, MouseEvent, ReactNode } from 'react';
import { cx } from '../cx.js';
import { useAnchoredPosition } from '../useAnchoredPosition.js';
import type { Align, Placement } from '../useAnchoredPosition.js';
import type { PopoverSize } from '../Popover/Popover.js';
import { HOVER_CLOSE_MS, HOVER_OPEN_MS, hoverSizeClass } from './HoverCard.js';

export interface DelegatedHoverCardOptions {
  /**
   * Which elements inside the container open a card — `a.citation[data-source]`. Matched with
   * `closest`, so pointing at a child of a marker is pointing at the marker.
   */
  selector: string;
  openDelay?: number;
  closeDelay?: number;
  placement?: Placement;
  align?: Align;
  /** `sm` by default. */
  size?: PopoverSize;
  /** Return false to leave a matching element alone — a citation whose source was not found. */
  accepts?: (element: HTMLElement) => boolean;
  onOpenChange?: (open: boolean, anchor: HTMLElement | null) => void;
  className?: string;
}

export interface DelegatedHoverCard {
  /** Spread on the element that holds the markers — the one rendering the HTML. */
  bind: {
    onMouseOver: (e: MouseEvent<HTMLElement>) => void;
    onMouseOut: (e: MouseEvent<HTMLElement>) => void;
    onFocus: (e: FocusEvent<HTMLElement>) => void;
    onBlur: (e: FocusEvent<HTMLElement>) => void;
  };
  /** The marker the card is open on, or null. Read it to decide what the card says. */
  anchor: HTMLElement | null;
  open: boolean;
  close: () => void;
  /** The card, holding `content`, when open; nothing otherwise. Render it beside the container. */
  card: (content: ReactNode) => ReactNode;
}

/**
 * `HoverCard` for triggers that are not React elements.
 *
 * Markers in sanitised HTML — citations in a rendered document, mentions in a comment — cannot be
 * handed to `HoverCard`, which works by cloning the element it is given; splicing React into that
 * HTML is wiped the next time it is applied. So this listens on the container instead, by event
 * delegation, and opens the same surface on whichever matching element was pointed at or focused.
 *
 * HOLD THE HTML STILL. Opening the card re-renders the component that holds the container, and
 * React re-applies `dangerouslySetInnerHTML` whenever it is handed a new object — even with the same
 * string — which replaces the very marker the card is anchored to. Memoise `{ __html }` on the
 * HTML, as any sanitised renderer should.
 *
 * Everything else is HoverCard's: the same dwell and grace, the pointer can travel onto the card,
 * Escape closes without moving focus, the marker is `aria-describedby` the card while it is open,
 * and it is placed by the same `useAnchoredPosition`, re-measured when it moves to another marker.
 */
export function useDelegatedHoverCard({
  selector, openDelay = HOVER_OPEN_MS, closeDelay = HOVER_CLOSE_MS, placement = 'bottom',
  align = 'start', size = 'sm', accepts, onOpenChange, className,
}: DelegatedHoverCardOptions): DelegatedHoverCard {
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const anchorRef = useRef<HTMLElement | null>(null);
  const cardRef = useRef<HTMLDivElement | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const id = useId();
  const latest = useRef({ onOpenChange, accepts });
  latest.current = { onOpenChange, accepts };
  const { style } = useAnchoredPosition({
    open: anchor !== null, anchorRef, floatingRef: cardRef, placement, align, anchorKey: anchor,
  });

  const clear = () => { if (timer.current) { clearTimeout(timer.current); timer.current = null; } };
  const later = (fn: () => void, ms: number) => {
    clear();
    timer.current = setTimeout(() => { timer.current = null; fn(); }, ms);
  };

  const show = useCallback((el: HTMLElement | null) => {
    const was = anchorRef.current;
    if (was === el) return;
    if (was) {
      const rest = (was.getAttribute('aria-describedby') ?? '').split(/\s+/).filter((t) => t && t !== id);
      if (rest.length) was.setAttribute('aria-describedby', rest.join(' '));
      else was.removeAttribute('aria-describedby');
    }
    // DESCRIBED BY THE CARD while it is open, as HoverCard wires its own trigger.
    if (el) el.setAttribute('aria-describedby', cx(el.getAttribute('aria-describedby'), id));
    anchorRef.current = el;
    setAnchor(el);
    latest.current.onOpenChange?.(el !== null, el);
  }, [id]);

  const close = useCallback(() => { clear(); show(null); }, [show]);

  useEffect(() => () => { clear(); }, []);
  useEffect(() => {
    if (!anchor) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') close(); };
    document.addEventListener('keydown', onKey, true);
    return () => document.removeEventListener('keydown', onKey, true);
  }, [anchor, close]);

  const marker = (target: EventTarget | null): HTMLElement | null => {
    if (typeof Element === 'undefined' || !(target instanceof Element)) return null;
    const el = target.closest<HTMLElement>(selector);
    if (!el) return null;
    return latest.current.accepts && !latest.current.accepts(el) ? null : el;
  };

  const bind = {
    onMouseOver: (e: MouseEvent<HTMLElement>) => {
      const el = marker(e.target);
      if (el) later(() => show(el), anchorRef.current ? Math.min(openDelay, closeDelay) : openDelay);
    },
    onMouseOut: (e: MouseEvent<HTMLElement>) => {
      const el = marker(e.target);
      // Leaving for a child of the same marker is not leaving it.
      if (!el || (e.relatedTarget instanceof Node && el.contains(e.relatedTarget))) return;
      later(close, closeDelay);
    },
    onFocus: (e: FocusEvent<HTMLElement>) => {
      const el = marker(e.target);
      if (el) later(() => show(el), openDelay);
    },
    onBlur: (e: FocusEvent<HTMLElement>) => {
      if (!marker(e.target)) return;
      if (e.relatedTarget instanceof Node && cardRef.current?.contains(e.relatedTarget)) return;
      close();
    },
  };

  const card = (content: ReactNode) => (anchor && content ? (
    <div ref={cardRef} id={id} style={style}
      className={cx('popover', 'hover-card', hoverSizeClass(size), className)}
      onMouseEnter={clear} onMouseLeave={() => later(close, closeDelay)}>
      {content}
    </div>
  ) : null);

  return { bind, anchor, open: anchor !== null, close, card };
}
