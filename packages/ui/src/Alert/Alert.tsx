import { forwardRef } from 'react';
import type { HTMLAttributes } from 'react';
import { cx } from '../cx.js';

/** Same tone vocabulary as State and Toast — one language for "something is wrong". */
export type Tone = 'neutral' | 'accent' | 'success' | 'warning' | 'danger';

export interface AlertProps extends HTMLAttributes<HTMLDivElement> {
  tone?: Tone;
  /** danger and warning announce assertively; the rest are polite. */
  live?: boolean;
}

export const Alert = forwardRef<HTMLDivElement, AlertProps>(function Alert(
  { tone = 'neutral', live = false, className, ...rest }, ref,
) {
  const assertive = tone === 'danger' || tone === 'warning';
  return <div {...rest} ref={ref}
    data-tone={tone === 'neutral' ? undefined : tone}
    role={live ? (assertive ? 'alert' : 'status') : undefined}
    className={cx('alert', className)} />;
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
