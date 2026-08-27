import { cloneElement, useCallback, useEffect, useId, useRef, useState } from 'react';
import { useAnchoredPosition } from '../useAnchoredPosition.js';
import type { ButtonHTMLAttributes, HTMLAttributes, ReactElement, ReactNode } from 'react';
import { Avatar } from '../Avatar/Avatar.js';
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
  /**
   * This item is the current choice — a project, a sort order, a theme.
   *
   * Pass it on EVERY item in the group, not only the chosen one. A menu that
   * marks the chosen row and nothing else pushes that row's label right by the
   * width of the mark, so the list shuffles as the choice moves and reading
   * which one is current means reading an indent. Passing the boolean on each
   * reserves the column for all of them.
   *
   * It also makes the group a radio group: `role="menuitemradio"` with
   * `aria-checked`, which is what a menu of mutually exclusive choices is, and
   * what a screen reader needs in order to say "2 of 3, checked".
   */
  selected?: boolean;
}

export function MenuItem({ danger, disabled, selected, onSelect, className, onClick, children, ...rest }: MenuItemProps) {
  const choice = selected !== undefined;
  return (
    <button {...rest} type="button"
      role={choice ? 'menuitemradio' : 'menuitem'}
      aria-checked={choice ? Boolean(selected) : undefined}
      tabIndex={-1}
      aria-disabled={disabled || undefined}
      onClick={(e) => { onClick?.(e); if (!disabled) onSelect?.(); }}
      className={cx('menu-item', danger && 'menu-item-danger', className)}>
      {choice && (
        /* Drawn here rather than accepted as a child, so the space it occupies
           exists whether or not it is filled. `aria-hidden` because
           `aria-checked` already carries the state — a tick announced twice is
           read twice. */
        <svg className="menu-mark" viewBox="0 0 256 256" fill="currentColor" aria-hidden="true">
          <path d="M232.49,80.49l-128,128a12,12,0,0,1-17,0l-56-56a12,12,0,1,1,17-17L96,183,215.51,63.51a12,12,0,0,1,17,17Z" />
        </svg>
      )}
      {children}
    </button>
  );
}

export const MenuLabel = ({ className, ...rest }: React.HTMLAttributes<HTMLParagraphElement>) =>
  <p {...rest} className={cx('menu-label', className)} />;

export const MenuSeparator = ({ className, ...rest }: React.HTMLAttributes<HTMLHRElement>) =>
  <hr {...rest} role="separator" className={cx('menu-sep', className)} />;

export const MenuShortcut = ({ className, ...rest }: React.HTMLAttributes<HTMLSpanElement>) =>
  <span {...rest} aria-hidden="true" className={cx('menu-shortcut', className)} />;

export interface MenuIdentityProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  /** The person. Also derives the initials when there is no image. */
  name: string;
  /** The line beneath — an email, a role, the organisation. Whatever tells two accounts apart. */
  detail?: ReactNode;
  src?: string;
}

/**
 * Who you are signed in as, at the top of an account menu.
 *
 * Not a `MenuItem`, and the distinction is the point: it has no `role="menuitem"`, so arrow keys
 * skip it and it takes no hover. A row that lights up under the cursor is a row a reader will try
 * to click, and there is nothing here to click — an identity is a fact, not a destination.
 *
 * WHY THIS IS IN THE SYSTEM AND NOT IN EVERY APP
 *
 * The app-shell template has always put an avatar in the nav and stopped there, so every consumer
 * reached the same fork — a bare glyph that does nothing, or an account menu they design
 * themselves — and the second one is the whole of "sign out, settings, who am I". Three products
 * had three answers. Now they have one.
 */
export function MenuIdentity({ name, detail, src, className, ...rest }: MenuIdentityProps) {
  return (
    <div {...rest} className={cx('menu-identity', className)}>
      <Avatar name={name} size="sm" {...(src ? { src } : {})} />
      <span className="menu-identity-text">
        <span className="menu-identity-name">{name}</span>
        {detail !== undefined && <span className="menu-identity-detail">{detail}</span>}
      </span>
    </div>
  );
}
