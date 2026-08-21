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
}

/** A modal side panel. Behaviour comes from useModalBehavior — see that file. */
export const Drawer = forwardRef<HTMLDivElement, DrawerProps>(function Drawer(
  { open, onClose, className, children, ...rest }, ref,
) {
  const panelRef = useModalBehavior(open, onClose);
  if (!open) return null;
  return (
    <>
      <div className="drawer-scrim" onClick={onClose} aria-hidden="true" />
      <div {...rest} ref={mergeRefs(panelRef, ref)}
        role="dialog" aria-modal="true" tabIndex={-1}
        className={cx('drawer-panel', className)}>
        {children}
      </div>
    </>
  );
});
