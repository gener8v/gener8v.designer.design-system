import { forwardRef } from 'react';
import type { HTMLAttributes, ReactNode } from 'react';
import { cx } from '../cx.js';

/** Same tone vocabulary as State and Toast — one language for "something is wrong". */
export type Tone = 'neutral' | 'accent' | 'success' | 'warning' | 'danger';

export interface AlertProps extends HTMLAttributes<HTMLDivElement> {
  tone?: Tone;
  /** danger and warning announce assertively; the rest are polite. */
  live?: boolean;
  /**
   * The glyph beside the message.
   *
   * A PROP rather than a child, because the message has to be one flex item for the title to
   * stack above the body — an icon passed as a child would land inside that stack.
   */
  icon?: ReactNode;
}

export const Alert = forwardRef<HTMLDivElement, AlertProps>(function Alert(
  { tone = 'neutral', live = false, icon, className, children, ...rest }, ref,
) {
  const assertive = tone === 'danger' || tone === 'warning';
  return (
    <div {...rest} ref={ref}
      data-tone={tone === 'neutral' ? undefined : tone}
      role={live ? (assertive ? 'alert' : 'status') : undefined}
      className={cx('alert', className)}>
      {icon}
      {/* One flex item, so the title stacks above the body rather than beside it. Without this
          they are two children of a flex ROW and the body's top margin does nothing. */}
      <div className="alert-content">{children}</div>
    </div>
  );
});

export const AlertTitle = forwardRef<HTMLParagraphElement, HTMLAttributes<HTMLParagraphElement>>(
  function AlertTitle({ className, ...rest }, ref) {
    return <p {...rest} ref={ref} className={cx('alert-title', className)} />;
  });

export const AlertBody = forwardRef<HTMLParagraphElement, HTMLAttributes<HTMLParagraphElement>>(
  function AlertBody({ className, ...rest }, ref) {
    return <p {...rest} ref={ref} className={cx('alert-body', className)} />;
  });

export const AlertActions = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  function AlertActions({ className, ...rest }, ref) {
    return <div {...rest} ref={ref} className={cx('alert-actions', className)} />;
  });
