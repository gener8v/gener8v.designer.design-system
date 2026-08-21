import { cloneElement, useEffect, useId, useRef, useState } from 'react';
import type { HTMLAttributes, ReactElement, ReactNode } from 'react';
import { cx } from '../cx.js';
import { useAnchoredPosition } from '../useAnchoredPosition.js';
import type { Align, Placement } from '../useAnchoredPosition.js';

export interface TooltipProps {
  /** The element the tooltip describes. Cloned to receive the wiring. */
  children: ReactElement<HTMLAttributes<HTMLElement>>;
  content: ReactNode;
  placement?: Placement;
  align?: Align;
  /** Pointer dwell before showing. Focus always shows immediately. */
  delay?: number;
}

/**
 * Describes its trigger via `aria-describedby` — a tooltip is supplementary,
 * so it must never be the element's only accessible name.
 *
 * Opens on hover after a dwell and on focus immediately, because a keyboard
 * user has already committed by the time they land. Escape dismisses without
 * moving focus, per WAI-ARIA.
 */
export function Tooltip({ children, content, placement = 'top', align = 'center', delay = 140 }: TooltipProps) {
  const [open, setOpen] = useState(false);
  const anchorRef = useRef<HTMLElement | null>(null);
  const floatingRef = useRef<HTMLDivElement | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const id = useId();
  const { style } = useAnchoredPosition({ open, anchorRef, floatingRef, placement, align });

  const show = (immediate: boolean) => {
    if (timer.current) clearTimeout(timer.current);
    if (immediate) setOpen(true);
    else timer.current = setTimeout(() => setOpen(true), delay);
  };
  const hide = () => {
    if (timer.current) clearTimeout(timer.current);
    setOpen(false);
  };

  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') hide(); };
    document.addEventListener('keydown', onKey, true);
    return () => document.removeEventListener('keydown', onKey, true);
  }, [open]);

  const wired = cloneElement(children, {
    ref: anchorRef,
    'aria-describedby': open ? id : undefined,
    onMouseEnter: (e: React.MouseEvent<HTMLElement>) => { children.props.onMouseEnter?.(e); show(false); },
    onMouseLeave: (e: React.MouseEvent<HTMLElement>) => { children.props.onMouseLeave?.(e); hide(); },
    onFocus: (e: React.FocusEvent<HTMLElement>) => { children.props.onFocus?.(e); show(true); },
    onBlur: (e: React.FocusEvent<HTMLElement>) => { children.props.onBlur?.(e); hide(); },
  } as Partial<HTMLAttributes<HTMLElement>> & { ref: typeof anchorRef });

  return (
    <>
      {wired}
      {open && (
        <div ref={floatingRef} id={id} role="tooltip" style={style} className={cx('tooltip')}>
          {content}
        </div>
      )}
    </>
  );
}
