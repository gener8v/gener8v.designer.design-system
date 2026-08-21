import { cloneElement, useCallback, useEffect, useId, useRef, useState } from 'react';
import type { ButtonHTMLAttributes, HTMLAttributes, ReactElement, ReactNode } from 'react';
import { cx } from '../cx.js';
import { useAnchoredPosition } from '../useAnchoredPosition.js';
import type { Align, Placement } from '../useAnchoredPosition.js';

export interface PopoverProps {
  trigger: ReactElement<ButtonHTMLAttributes<HTMLButtonElement>>;
  label: string;
  children?: ReactNode;
  placement?: Placement;
  align?: Align;
}

/**
 * A non-modal floating panel. Escape closes and returns focus, a click outside
 * dismisses, and focus moves in on open — but Tab is *not* trapped. Trapping
 * it would make this a dialog, and a popover the user cannot Tab out of is a
 * dialog wearing the wrong clothes.
 */
export function Popover({ trigger, label, children, placement = 'bottom', align = 'start' }: PopoverProps) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const id = useId();
  const { style } = useAnchoredPosition({ open, anchorRef: triggerRef, floatingRef: panelRef, placement, align });

  const close = useCallback((restore = true) => {
    setOpen(false);
    if (restore) triggerRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!open) return;
    panelRef.current?.focus();
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') { e.stopPropagation(); close(); } };
    const onDown = (e: MouseEvent) => {
      const t = e.target as Node;
      if (!panelRef.current?.contains(t) && !triggerRef.current?.contains(t)) close(false);
    };
    document.addEventListener('keydown', onKey, true);
    document.addEventListener('mousedown', onDown, true);
    return () => {
      document.removeEventListener('keydown', onKey, true);
      document.removeEventListener('mousedown', onDown, true);
    };
  }, [open, close]);

  const wired = cloneElement(trigger, {
    ref: triggerRef,
    'aria-haspopup': 'dialog',
    'aria-expanded': open,
    'aria-controls': open ? id : undefined,
    onClick: (e: React.MouseEvent<HTMLButtonElement>) => {
      trigger.props.onClick?.(e);
      open ? close() : setOpen(true);
    },
  } as Partial<ButtonHTMLAttributes<HTMLButtonElement>> & { ref: typeof triggerRef });

  return (
    <>
      {wired}
      {open && (
        <div ref={panelRef} id={id} role="dialog" aria-label={label} tabIndex={-1}
          style={style} className="popover">
          {children}
        </div>
      )}
    </>
  );
}

export const PopoverTitle = ({ className, ...rest }: HTMLAttributes<HTMLParagraphElement>) =>
  <p {...rest} className={cx('popover-title', className)} />;

export const PopoverActions = ({ className, ...rest }: HTMLAttributes<HTMLDivElement>) =>
  <div {...rest} className={cx('popover-actions', className)} />;
