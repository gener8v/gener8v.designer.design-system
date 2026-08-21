import { cloneElement, useCallback, useEffect, useId, useRef, useState } from 'react';
import { useAnchoredPosition } from '../useAnchoredPosition.js';
import type { ButtonHTMLAttributes, ReactElement, ReactNode } from 'react';
import { cx } from '../cx.js';

const ITEMS = '[role="menuitem"]:not([aria-disabled="true"])';

export interface MenuProps {
  /** The control that opens the menu. Cloned to receive the ARIA wiring. */
  trigger: ReactElement<ButtonHTMLAttributes<HTMLButtonElement>>;
  /** Names the menu for assistive tech. */
  label: string;
  children?: ReactNode;
  /** Align the popup's end edge to the trigger's end edge. */
  align?: 'start' | 'end';
}

/**
 * The WAI-ARIA menu-button pattern, keyboard included: ArrowDown/Up open and
 * land on the first or last item, arrows move with wrap, Home/End jump,
 * Escape and Tab close and return focus to the trigger, and a click outside
 * dismisses.
 *
 * Positioning is fixed-coordinate with an edge flip. It is not a full
 * collision-detection engine — a menu inside a scrolling container with
 * transforms will need Base UI's positioner — but it handles the ordinary
 * cases correctly rather than breaking at the bottom of the viewport.
 */
export function Menu({ trigger, label, children, align = 'start' }: MenuProps) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const menuId = useId();
  const { style } = useAnchoredPosition({
    open, anchorRef: triggerRef, floatingRef: menuRef, placement: 'bottom', align,
  });

  const close = useCallback((restoreFocus = true) => {
    setOpen(false);
    if (restoreFocus) triggerRef.current?.focus();
  }, []);

  const focusItem = useCallback((index: number) => {
    const items = [...(menuRef.current?.querySelectorAll<HTMLElement>(ITEMS) ?? [])];
    if (items.length === 0) return;
    const i = ((index % items.length) + items.length) % items.length;
    items.forEach((el) => el.removeAttribute('data-highlighted'));
    items[i]!.setAttribute('data-highlighted', '');
    items[i]!.focus();
  }, []);

  useEffect(() => {
    if (!open) return;
    const onDocKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { e.stopPropagation(); close(); }
      else if (e.key === 'Tab') { e.preventDefault(); close(); }
    };
    const onDocPointer = (e: MouseEvent) => {
      const target = e.target as Node;
      if (!menuRef.current?.contains(target) && !triggerRef.current?.contains(target)) close(false);
    };
    document.addEventListener('keydown', onDocKey, true);
    document.addEventListener('mousedown', onDocPointer, true);
    return () => {
      document.removeEventListener('keydown', onDocKey, true);
      document.removeEventListener('mousedown', onDocPointer, true);
    };
  }, [open, close]);

  const openWith = (edge: 'first' | 'last') => {
    setOpen(true);
    queueMicrotask(() => focusItem(edge === 'first' ? 0 : -1));
  };

  const onMenuKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const items = [...(menuRef.current?.querySelectorAll<HTMLElement>(ITEMS) ?? [])];
    const from = items.indexOf(document.activeElement as HTMLElement);
    if (e.key === 'ArrowDown') { e.preventDefault(); focusItem(from + 1); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); focusItem(from - 1); }
    else if (e.key === 'Home') { e.preventDefault(); focusItem(0); }
    else if (e.key === 'End') { e.preventDefault(); focusItem(-1); }
  };

  const wiredTrigger = cloneElement(trigger, {
    ref: triggerRef,
    'aria-haspopup': 'menu',
    'aria-expanded': open,
    'aria-controls': open ? menuId : undefined,
    onClick: (e: React.MouseEvent<HTMLButtonElement>) => {
      trigger.props.onClick?.(e);
      open ? close() : openWith('first');
    },
    onKeyDown: (e: React.KeyboardEvent<HTMLButtonElement>) => {
      trigger.props.onKeyDown?.(e);
      if (e.key === 'ArrowDown') { e.preventDefault(); openWith('first'); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); openWith('last'); }
    },
  } as Partial<ButtonHTMLAttributes<HTMLButtonElement>> & { ref: typeof triggerRef });

  return (
    <>
      {wiredTrigger}
      {open && (
        <div ref={menuRef} id={menuId} role="menu" aria-label={label}
          onKeyDown={onMenuKeyDown}
          style={style}
          className={cx('menu', 'menu-popup')}>
          {children}
        </div>
      )}
    </>
  );
}

export interface MenuItemProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onSelect'> {
  danger?: boolean;
  disabled?: boolean;
  onSelect?: () => void;
}

export function MenuItem({ danger, disabled, onSelect, className, onClick, ...rest }: MenuItemProps) {
  return (
    <button {...rest} type="button" role="menuitem" tabIndex={-1}
      aria-disabled={disabled || undefined}
      onClick={(e) => { onClick?.(e); if (!disabled) onSelect?.(); }}
      className={cx('menu-item', danger && 'menu-item-danger', className)} />
  );
}

export const MenuLabel = ({ className, ...rest }: React.HTMLAttributes<HTMLParagraphElement>) =>
  <p {...rest} className={cx('menu-label', className)} />;

export const MenuSeparator = ({ className, ...rest }: React.HTMLAttributes<HTMLHRElement>) =>
  <hr {...rest} role="separator" className={cx('menu-sep', className)} />;

export const MenuShortcut = ({ className, ...rest }: React.HTMLAttributes<HTMLSpanElement>) =>
  <span {...rest} aria-hidden="true" className={cx('menu-shortcut', className)} />;
