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
}: AnchoredOptions): { style: CSSProperties; placement: Placement } {
  const [state, setState] = useState<{ top: number; left: number; placement: Placement } | null>(null);

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

    let top: number;
    let left: number;
    if (side === 'top' || side === 'bottom') {
      top = side === 'bottom' ? a.bottom + offset : a.top - offset - f.height;
      left = align === 'end' ? a.right - f.width
        : align === 'center' ? a.left + a.width / 2 - f.width / 2
        : a.left;
      left = Math.max(padding, Math.min(left, vw - f.width - padding));
    } else {
      left = side === 'right' ? a.right + offset : a.left - offset - f.width;
      top = align === 'end' ? a.bottom - f.height
        : align === 'center' ? a.top + a.height / 2 - f.height / 2
        : a.top;
      top = Math.max(padding, Math.min(top, vh - f.height - padding));
    }

    setState({ top, left, placement: side });
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
  };
}
