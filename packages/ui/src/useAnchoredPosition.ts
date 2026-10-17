import { useCallback, useLayoutEffect, useState } from 'react';
import type { CSSProperties, RefObject } from 'react';

export type Placement = 'top' | 'bottom' | 'left' | 'right';
export type Align = 'start' | 'center' | 'end';

export interface AnchoredOptions {
  open: boolean;
  anchorRef: RefObject<HTMLElement | null>;
  floatingRef: RefObject<HTMLElement | null>;
  placement?: Placement;
  align?: Align;
  /** Gap between anchor and floating element. */
  offset?: number;
  /** Minimum distance kept from the viewport edge. */
  padding?: number;
}

const OPPOSITE: Record<Placement, Placement> = {
  top: 'bottom', bottom: 'top', left: 'right', right: 'left',
};

/**
 * Positions a floating element against an anchor, with the two behaviours that
 * actually matter: **flip** when the preferred side has no room, and **shift**
 * to stay inside the viewport. Without them a menu at the bottom of a screen
 * opens off-screen, which is exactly where dense interfaces put them.
 *
 * Deliberately not a full collision engine — no `clippingAncestors`, no
 * transformed scroll containers. Those cases want Floating UI or Base UI's
 * positioner. This covers the ordinary ones correctly and honestly.
 */
export function useAnchoredPosition({
  open, anchorRef, floatingRef,
  placement = 'bottom', align = 'start', offset = 6, padding = 8,
}: AnchoredOptions): { style: CSSProperties; placement: Placement; available: number } {
  const [state, setState] = useState<
    { top: number; left: number; placement: Placement; available: number } | null
  >(null);

  const compute = useCallback(() => {
    const anchor = anchorRef.current;
    const floating = floatingRef.current;
    if (!anchor || !floating) return;

    const a = anchor.getBoundingClientRect();
    const f = floating.getBoundingClientRect();
    const vw = document.documentElement.clientWidth;
    const vh = document.documentElement.clientHeight;

    // Room on each side, then flip only if the opposite side has more.
    const room: Record<Placement, number> = {
      top: a.top, bottom: vh - a.bottom, left: a.left, right: vw - a.right,
    };
    const need = placement === 'top' || placement === 'bottom' ? f.height + offset : f.width + offset;
    let side = placement;
    if (room[placement] < need && room[OPPOSITE[placement]] > room[placement]) side = OPPOSITE[placement];

    // HOW TALL THE CHOSEN SIDE CAN ACTUALLY GO.
    //
    // Flipping finds the side with more room; it does not make the room enough. A menu of twelve
    // rows opens past the bottom of the screen, and flipped above an anchor near the top it is
    // placed at a NEGATIVE top — rows a fixed element can never be scrolled to. Returned rather
    // than imposed, because what a caller does with the overflow is the caller's: a menu scrolls,
    // a tooltip would rather be short.
    const available = side === 'top' || side === 'bottom'
      ? Math.max(0, room[side] - offset - padding)
      : Math.max(0, vh - padding * 2);
    // The placement maths use the height it will have, not the height it wants.
    const height = Math.min(f.height, available);

    let top: number;
    let left: number;
    if (side === 'top' || side === 'bottom') {
      top = side === 'bottom' ? a.bottom + offset : a.top - offset - height;
      left = align === 'end' ? a.right - f.width
        : align === 'center' ? a.left + a.width / 2 - f.width / 2
        : a.left;
      left = Math.max(padding, Math.min(left, vw - f.width - padding));
    } else {
      left = side === 'right' ? a.right + offset : a.left - offset - f.width;
      top = align === 'end' ? a.bottom - height
        : align === 'center' ? a.top + a.height / 2 - height / 2
        : a.top;
      top = Math.max(padding, Math.min(top, vh - height - padding));
    }

    setState({ top, left, placement: side, available });
  }, [anchorRef, floatingRef, placement, align, offset, padding]);

  useLayoutEffect(() => {
    if (!open) { setState(null); return; }
    compute();
    // Capture-phase scroll catches ancestor scrolling, not just the window.
    window.addEventListener('scroll', compute, true);
    window.addEventListener('resize', compute);
    return () => {
      window.removeEventListener('scroll', compute, true);
      window.removeEventListener('resize', compute);
    };
  }, [open, compute]);

  return {
    // Hidden until measured, so nothing is ever painted at the wrong place.
    style: state
      ? { position: 'fixed', top: state.top, left: state.left }
      : { position: 'fixed', top: 0, left: 0, visibility: 'hidden' },
    placement: state?.placement ?? placement,
    // Before the first measurement there is no answer, and `Infinity` is the
    // honest one: nothing is capped by a number nobody has worked out yet.
    available: state?.available ?? Infinity,
  };
}
