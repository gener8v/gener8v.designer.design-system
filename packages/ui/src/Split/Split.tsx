import { useCallback, useEffect, useId, useRef, useState } from 'react';
import type { HTMLAttributes, ReactNode } from 'react';
import { cx } from '../cx.js';

export interface SplitProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
  /** The resizable panel. */
  aside: ReactNode;
  /** The region that takes the remaining width. */
  children: ReactNode;
  /** Names the separator: "Resize the document list". */
  label: string;
  min?: number;
  max?: number;
  /** Starting width. Ignored once the reader has moved it. */
  initial?: number;
  /** Called with the width after a drag or a key, and with `0` on collapse —
   *  enough to persist the reader's choice without this component owning it. */
  onResize?: (width: number) => void;
  collapsed?: boolean;
  onCollapse?: (collapsed: boolean) => void;
}

/** How far one arrow press moves it. Big enough to be worth pressing, small
 *  enough to land where you meant. */
const STEP = 24;

/** Pointer travel under which a press is a click rather than a drag. Without
 *  it, the two-pixel wobble of a real click reads as a drag and the panel never
 *  collapses — which is how a click-to-collapse handle feels broken. */
const SLOP = 4;

/**
 * A pane the reader sizes, and collapses.
 *
 * The WAI-ARIA window splitter: `role="separator"`, focusable, with
 * `aria-valuenow` / `min` / `max` carrying the width so the position is
 * readable rather than only visible. Arrows resize, Home collapses, End
 * expands, Enter toggles.
 *
 * A CLICK COLLAPSES, AND A CLICK IS NOT A ZERO-LENGTH DRAG
 *
 * The handle is the same element for both gestures, so the two have to be told
 * apart on release: under a few pixels of travel it is a click and it toggles;
 * beyond that it was a resize and toggling would undo the size the reader just
 * chose.
 */
export function Split({
  aside, children, label,
  min = 180, max = 640, initial = 288,
  onResize, collapsed: collapsedProp, onCollapse,
  className, ...rest
}: SplitProps) {
  const [width, setWidth] = useState(initial);
  const [ownCollapsed, setOwnCollapsed] = useState(false);
  const [dragging, setDragging] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const start = useRef<{ x: number; width: number; moved: number } | null>(null);
  const id = useId();

  const collapsed = collapsedProp ?? ownCollapsed;
  const setCollapsed = useCallback((next: boolean) => {
    if (collapsedProp === undefined) setOwnCollapsed(next);
    onCollapse?.(next);
    onResize?.(next ? 0 : width);
  }, [collapsedProp, onCollapse, onResize, width]);

  const clamp = useCallback((n: number) => Math.min(max, Math.max(min, n)), [min, max]);

  const resize = useCallback((next: number) => {
    const w = clamp(next);
    setWidth(w);
    onResize?.(w);
  }, [clamp, onResize]);

  useEffect(() => {
    if (!dragging) return;
    const move = (e: PointerEvent) => {
      const from = start.current;
      if (!from) return;
      const delta = e.clientX - from.x;
      from.moved = Math.max(from.moved, Math.abs(delta));
      // Expanding from collapsed: the drag starts the panel at its minimum
      // rather than at the width it had before, which the reader cannot see.
      resize((collapsed ? min : from.width) + delta);
      if (collapsed && Math.abs(delta) > SLOP) setCollapsed(false);
    };
    const up = () => {
      const from = start.current;
      setDragging(false);
      start.current = null;
      if (from && from.moved <= SLOP) setCollapsed(!collapsed);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
    return () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
    };
  }, [dragging, collapsed, min, resize, setCollapsed]);

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    switch (e.key) {
      case 'ArrowLeft':
        e.preventDefault();
        if (collapsed) return;
        resize(width - STEP);
        break;
      case 'ArrowRight':
        e.preventDefault();
        if (collapsed) { setCollapsed(false); return; }
        resize(width + STEP);
        break;
      case 'Home': e.preventDefault(); setCollapsed(true); break;
      case 'End': e.preventDefault(); if (collapsed) setCollapsed(false); resize(max); break;
      case 'Enter': case ' ': e.preventDefault(); setCollapsed(!collapsed); break;
    }
  };

  return (
    <div
      {...rest}
      ref={rootRef}
      data-collapsed={collapsed ? '' : undefined}
      data-dragging={dragging ? '' : undefined}
      className={cx('split', className)}
    >
      {/* `hidden` rather than only the stylesheet's `display: none`. Whether a collapsed panel is
          in the accessibility tree is the component's business, not a rule that has to load, win a
          cascade and not be overridden by the page around it. */}
      <div
        id={`${id}-aside`}
        className="split-aside"
        hidden={collapsed}
        style={{ inlineSize: width }}
      >
        {aside}
      </div>
      <div
        role="separator"
        tabIndex={0}
        aria-label={label}
        aria-orientation="vertical"
        aria-controls={`${id}-aside`}
        // Collapsed is 0, not the width it would return to. A separator that
        // reports 288 while the panel is shut is reporting the wrong thing.
        aria-valuenow={collapsed ? 0 : width}
        aria-valuemin={0}
        aria-valuemax={max}
        data-dragging={dragging ? '' : undefined}
        className="split-handle"
        onPointerDown={(e) => {
          e.preventDefault();
          start.current = { x: e.clientX, width, moved: 0 };
          setDragging(true);
        }}
        onKeyDown={onKeyDown}
      />
      <div className="split-main">{children}</div>
    </div>
  );
}
