import { cloneElement, useCallback, useEffect, useId, useRef, useState } from 'react';
import type { HTMLAttributes, ReactElement, ReactNode } from 'react';
import { cx } from '../cx.js';
import { useAnchoredPosition } from '../useAnchoredPosition.js';
import type { Align, Placement } from '../useAnchoredPosition.js';
import type { PopoverSize } from '../Popover/Popover.js';

/** Dwell before a hover card opens and grace before it closes — shared with the delegated form. */
export const HOVER_OPEN_MS = 400;
export const HOVER_CLOSE_MS = 150;

/** The class a size adds. `sm` is a hover card's own width and adds nothing. */
export const hoverSizeClass = (size: PopoverSize) =>
  size === 'md' ? 'popover-md' : size === 'lg' ? 'popover-lg' : undefined;

export interface HoverCardProps {
  /**
   * The thing the card previews — a link or a button, something that already does its own job
   * when activated. Cloned to receive the wiring.
   */
  trigger: ReactElement<HTMLAttributes<HTMLElement>>;
  /** What the card shows. Supplementary: it must not be the only place a fact or an action lives. */
  content: ReactNode;
  /** Dwell before opening, on hover and on focus alike. */
  openDelay?: number;
  /** Grace before closing, long enough to move the pointer from the trigger onto the card. */
  closeDelay?: number;
  placement?: Placement;
  align?: Align;
  onOpenChange?: (open: boolean) => void;
  /**
   * `sm` by default — a glance. `md` when the card holds a sentence of quoted text, which at the
   * glance width breaks across five lines.
   */
  size?: PopoverSize;
  className?: string;
}

/**
 * A `Popover`'s surface, opened by pointing rather than by clicking — a preview of what a link
 * leads to, a person behind a name, a requirement behind an id.
 *
 * Opens on hover AND on keyboard focus, after `openDelay`, because a card that only a mouse can
 * summon is a card a keyboard user never learns exists; the dwell stops a pointer sweeping across
 * a list from opening twelve of them. Escape closes it without moving focus, as a tooltip's does.
 * The pointer can travel onto the card, and it stays open while it is there.
 *
 * NOT A NATIVE `title`. That cannot be styled, cannot be reached by keyboard, and never appears on
 * touch. NOT A DIALOG either: focus does not move into it and Tab does not enter it, so anything
 * clickable inside must also be reachable where the trigger leads. If somebody has to act in the
 * card, it is a `Popover`.
 */
export function HoverCard({
  trigger, content, openDelay = HOVER_OPEN_MS, closeDelay = HOVER_CLOSE_MS, placement = 'bottom',
  align = 'start', onOpenChange, size = 'sm', className,
}: HoverCardProps) {
  const [open, setOpenState] = useState(false);
  const anchorRef = useRef<HTMLElement | null>(null);
  const cardRef = useRef<HTMLDivElement | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const id = useId();
  const { style } = useAnchoredPosition({ open, anchorRef, floatingRef: cardRef, placement, align });

  const current = useRef(false);
  const setOpen = useCallback((next: boolean) => {
    if (current.current === next) return;
    current.current = next;
    setOpenState(next);
    onOpenChange?.(next);
  }, [onOpenChange]);

  const clear = () => { if (timer.current) { clearTimeout(timer.current); timer.current = null; } };
  const schedule = (next: boolean, ms: number) => {
    clear();
    timer.current = setTimeout(() => { timer.current = null; setOpen(next); }, ms);
  };

  useEffect(() => clear, []);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') { clear(); setOpen(false); } };
    document.addEventListener('keydown', onKey, true);
    return () => document.removeEventListener('keydown', onKey, true);
  }, [open, setOpen]);

  const p = trigger.props;
  const wired = cloneElement(trigger, {
    ref: anchorRef,
    'aria-describedby': cx(p['aria-describedby'], open && id) || undefined,
    onMouseEnter: (e: React.MouseEvent<HTMLElement>) => { p.onMouseEnter?.(e); schedule(true, openDelay); },
    onMouseLeave: (e: React.MouseEvent<HTMLElement>) => { p.onMouseLeave?.(e); schedule(false, closeDelay); },
    onFocus: (e: React.FocusEvent<HTMLElement>) => { p.onFocus?.(e); schedule(true, openDelay); },
    onBlur: (e: React.FocusEvent<HTMLElement>) => { p.onBlur?.(e); clear(); setOpen(false); },
  } as Partial<HTMLAttributes<HTMLElement>> & { ref: typeof anchorRef });

  return (
    <>
      {wired}
      {open && (
        <div ref={cardRef} id={id} style={style} className={cx('popover', 'hover-card', hoverSizeClass(size), className)}
          onMouseEnter={clear} onMouseLeave={() => schedule(false, closeDelay)}>
          {content}
        </div>
      )}
    </>
  );
}
