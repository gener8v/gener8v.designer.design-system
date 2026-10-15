import { cloneElement, useCallback, useEffect, useId, useRef, useState } from 'react';
import { useAnchoredPosition } from '../useAnchoredPosition.js';
import type { ButtonHTMLAttributes, HTMLAttributes, ReactElement, ReactNode } from 'react';
import { Avatar } from '../Avatar/Avatar.js';
import { cx } from '../cx.js';

const ITEMS = '[role="menuitem"],[role="menuitemradio"]';

/**
 * The items this menu steers, which is not every item inside it.
 *
 * A submenu renders its own `role="menu"` within the parent's DOM, so a plain
 * `querySelectorAll` hands the parent its child's rows as well — and arrowing
 * down the account menu would walk into the open flyout and out the other side.
 * Ownership is decided by the nearest enclosing menu, not by depth.
 */
function ownItems(menu: HTMLElement | null): HTMLElement[] {
  if (menu === null) return [];
  return [...menu.querySelectorAll<HTMLElement>(ITEMS)].filter(
    (el) => el.getAttribute('aria-disabled') !== 'true' && el.closest('[role="menu"]') === menu,
  );
}

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
 * **Choosing an item closes it too, which it did not.** Escape, Tab, a press
 * outside and a second press of the trigger all dismissed; selecting a value
 * did not, so the popup sat over the content a reader had just narrowed and
 * the only ways out were the ones nobody looks for. `MenuSub` already closed
 * its flyout on a click — the pattern existed one level down and was missing
 * at the top.
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
    const items = ownItems(menuRef.current);
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
    const items = ownItems(menuRef.current);
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
          /**
           * A choice dismisses the menu and hands focus back to the trigger,
           * which is what the pattern says activating an item does.
           *
           * Read off the item rather than the menu, because three of the
           * things inside one are not choices: a `MenuLabel`, a separator, and
           * a `MenuSub` trigger — whose press opens a flyout, so closing on it
           * would shut the menu holding the thing being opened. A disabled row
           * is not a choice either; its own handler already refuses to select,
           * and dismissing on it would say the press did something.
           */
          onClick={(e) => {
            const item = (e.target as HTMLElement).closest('.menu-item');
            if (item === null) return;
            if (item.classList.contains('menu-sub-trigger')) return;
            if (item.getAttribute('aria-disabled') === 'true') return;
            close();
          }}
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

export interface MenuSubProps {
  /** The row's own text. It names where the flyout goes, so it is a noun. */
  label: ReactNode;
  /** An icon for the row, matching the items around it. */
  icon?: ReactNode;
  disabled?: boolean;
  children?: ReactNode;
}

/**
 * A menu item that opens a menu.
 *
 * **A label with items under it is not a submenu.** A flat menu that groups
 * with headings grows with every group: the account settings sink further down
 * a list somebody opened for one of them, and a heading over a single row
 * spends a line saying a thing exists and another line being it. A flyout keeps
 * the parent one row per subject and puts the choices beside it.
 *
 * The pattern is WAI-ARIA's, and the keys are the ones a menu already teaches:
 * **ArrowRight or Enter opens** and lands on the first child, **ArrowLeft or
 * Escape closes** and returns to this row, and hover opens after a beat.
 *
 * **Hover has a delay and closing has a longer one.** Opening on contact makes
 * a flyout that flickers as the pointer crosses rows on its way somewhere else;
 * closing on exit makes one that vanishes while somebody is travelling towards
 * it diagonally. Neither is a preference — both are the difference between a
 * submenu that works with a mouse and one that has to be clicked.
 */
export function MenuSub({ label, icon, disabled, children }: MenuSubProps) {
  const [open, setOpen] = useState(false);
  const itemRef = useRef<HTMLButtonElement | null>(null);
  const subRef = useRef<HTMLDivElement | null>(null);
  const timer = useRef<number | undefined>(undefined);
  const subId = useId();
  const { style } = useAnchoredPosition({
    open, anchorRef: itemRef, floatingRef: subRef, placement: 'right', align: 'start', offset: 2,
  });

  const later = (fn: () => void, ms: number) => {
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(fn, ms);
  };
  const now = (fn: () => void) => {
    window.clearTimeout(timer.current);
    fn();
  };
  useEffect(() => () => window.clearTimeout(timer.current), []);

  const openOn = (edge: 'first' | 'last' = 'first') => {
    now(() => setOpen(true));
    queueMicrotask(() => {
      const items = ownItems(subRef.current);
      const el = edge === 'first' ? items[0] : items[items.length - 1];
      el?.setAttribute('data-highlighted', '');
      el?.focus();
    });
  };
  const shut = (restoreFocus: boolean) => {
    now(() => setOpen(false));
    if (restoreFocus) itemRef.current?.focus();
  };

  return (
    <div
      className="menu-sub"
      onMouseEnter={() => (disabled === true ? undefined : later(() => setOpen(true), 120))}
      /* Longer than the open delay, so a pointer travelling diagonally towards
         the flyout does not lose it by clipping the row below. */
      onMouseLeave={() => later(() => setOpen(false), 320)}
    >
      <button
        ref={itemRef}
        type="button"
        role="menuitem"
        tabIndex={-1}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? subId : undefined}
        aria-disabled={disabled === true ? true : undefined}
        className="menu-item menu-sub-trigger"
        onClick={() => (disabled === true ? undefined : open ? shut(true) : openOn())}
        onKeyDown={(e) => {
          if (disabled === true) return;
          if (e.key === 'ArrowRight' || e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            e.stopPropagation();
            openOn();
          }
        }}
      >
        {icon}
        {label}
        {/* The caret is the affordance: without it a row that opens a menu is
            indistinguishable from a row that does something. */}
        <svg className="menu-sub-mark" viewBox="0 0 256 256" fill="currentColor" aria-hidden="true">
          <path d="M181.66,133.66l-80,80a8,8,0,0,1-11.32-11.32L164.69,128,90.34,53.66a8,8,0,0,1,11.32-11.32l80,80A8,8,0,0,1,181.66,133.66Z" />
        </svg>
      </button>

      {open && (
        <div
          ref={subRef}
          id={subId}
          role="menu"
          aria-label={typeof label === 'string' ? label : undefined}
          style={style}
          className={cx('menu', 'menu-popup')}
          onKeyDown={(e) => {
            const items = ownItems(subRef.current);
            const from = items.indexOf(document.activeElement as HTMLElement);
            const move = (to: number) => {
              e.preventDefault();
              e.stopPropagation();
              if (items.length === 0) return;
              const i = ((to % items.length) + items.length) % items.length;
              items.forEach((el) => el.removeAttribute('data-highlighted'));
              items[i]!.setAttribute('data-highlighted', '');
              items[i]!.focus();
            };
            if (e.key === 'ArrowDown') move(from + 1);
            else if (e.key === 'ArrowUp') move(from - 1);
            else if (e.key === 'Home') move(0);
            else if (e.key === 'End') move(-1);
            /* Escape closes the flyout and not the menu holding it, which is
               why this stops here. One press, one level. */
            else if (e.key === 'ArrowLeft' || e.key === 'Escape') {
              e.preventDefault();
              e.stopPropagation();
              shut(true);
            }
          }}
          /* Choosing anything inside closes this level; the parent's own
             dismissal handles the rest. */
          onClick={() => shut(false)}
        >
          {children}
        </div>
      )}
    </div>
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
