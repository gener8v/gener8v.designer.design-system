import { forwardRef } from 'react';
import type { HTMLAttributes, ReactNode } from 'react';
import { cx } from '../cx.js';
import { useModalBehavior, mergeRefs } from '../useModalBehavior.js';

export interface DrawerProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'onClose'> {
  open: boolean;
  onClose: () => void;
  /** Names the dialog for assistive tech. */
  'aria-label': string;
  children?: ReactNode;
  /**
   * What the close button is called. Defaults to `Close`.
   *
   * The drawer always draws one. Escape and the scrim both close it and
   * neither is visible, so a reader looking for the way out had to guess at a
   * convention or click into the dimmed page and hope.
   */
  closeLabel?: string;
  /**
   * Which edge it comes from. `end` by default — a menu of page links, opened from the hamburger
   * at the end of the header. `start` for navigation that lives in a rail on wide screens: on a
   * phone the rail becomes a drawer, and it should arrive from the side it lives on.
   */
  side?: 'start' | 'end';
  /**
   * A header pinned above the body: a title, a `PagerChip`, the actions that belong to what is
   * shown. With it, the children become a body that scrolls on its own, so the header — and the
   * way to step to the next item — never scrolls away from a long transcript.
   */
  header?: ReactNode;
  /**
   * `md` is a menu's width. `lg` is a reading width — a transcript beside the document that cites
   * it — and takes the whole screen on a phone, where there is no "beside".
   */
  size?: 'md' | 'lg';
}

/** A modal side panel. Behaviour comes from useModalBehavior — see that file. */
export const Drawer = forwardRef<HTMLDivElement, DrawerProps>(function Drawer(
  { open, onClose, className, children, closeLabel = 'Close', side = 'end', header, size = 'md', ...rest }, ref,
) {
  const panelRef = useModalBehavior(open, onClose);
  if (!open) return null;
  return (
    <>
      <div className="drawer-scrim" onClick={onClose} aria-hidden="true" />
      <div {...rest} ref={mergeRefs(panelRef, ref)}
        role="dialog" aria-modal="true" tabIndex={-1}
        data-side={side === 'start' ? 'start' : undefined}
        data-size={size === 'lg' ? 'lg' : undefined}
        className={cx('drawer-panel', className)}>
        {/* First in the DOM so it is the first thing tab reaches, and pinned by
            the stylesheet so it does not scroll away from a long panel. */}
        <button type="button" className="drawer-close" aria-label={closeLabel} onClick={onClose}>
          <svg viewBox="0 0 16 16" aria-hidden="true" focusable="false">
            <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5"
              strokeLinecap="round" fill="none" />
          </svg>
        </button>
        {header === undefined ? children : (
          <>
            <div className="drawer-head">{header}</div>
            <div className="drawer-body">{children}</div>
          </>
        )}
      </div>
    </>
  );
});
