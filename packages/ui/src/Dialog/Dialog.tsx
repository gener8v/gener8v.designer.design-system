import { forwardRef, useId } from 'react';
import type { HTMLAttributes, ReactNode } from 'react';
import { cx } from '../cx.js';
import { useModalBehavior, mergeRefs } from '../useModalBehavior.js';

export interface DialogProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'title'> {
  open: boolean;
  onClose: () => void;
  /** Rendered as the dialog's heading and wired to aria-labelledby. */
  title: ReactNode;
  children?: ReactNode;
  /** Footer actions. Forward action goes last, matching the flow footer. */
  actions?: ReactNode;
  /** Clicking the backdrop closes. Turn off for destructive confirmations. */
  dismissOnBackdrop?: boolean;
  /**
   * What kind of decision this is — the same attribute `Alert` and `State` carry.
   *
   * Without it, a destructive confirmation had to be WRITTEN into seriousness: three lines of
   * prose and a red-ish button, with nothing on the surface saying what sort of thing was being
   * asked. A reader skims the title and the buttons; the paragraph is the part they skip.
   */
  tone?: 'accent' | 'success' | 'warning' | 'danger';
}

export const Dialog = forwardRef<HTMLDivElement, DialogProps>(function Dialog(
  { open, onClose, title, children, actions, dismissOnBackdrop = true, tone, className, ...rest }, ref,
) {
  const panelRef = useModalBehavior(open, onClose);
  const titleId = useId();
  if (!open) return null;
  return (
    <div className="dialog-backdrop"
      onClick={dismissOnBackdrop ? (e) => { if (e.target === e.currentTarget) onClose(); } : undefined}>
      <div {...rest} ref={mergeRefs(panelRef, ref)}
        role="dialog" aria-modal="true" aria-labelledby={titleId} tabIndex={-1}
        data-tone={tone}
        className={cx('dialog', className)}>
        <p className="dialog-title" id={titleId}>{title}</p>
        {children ? <div className="dialog-body">{children}</div> : null}
        {actions ? <div className="dialog-actions">{actions}</div> : null}
      </div>
    </div>
  );
});
