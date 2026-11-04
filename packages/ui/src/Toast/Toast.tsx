import { forwardRef } from 'react';
import type { ButtonHTMLAttributes, HTMLAttributes } from 'react';
import { cx } from '../cx.js';
import type { Tone } from '../Alert/index.js';

/**
 * The live region toasts mount into. Render it once, near the root — the
 * region must exist in the DOM before a toast is added, or a screen reader
 * will not announce the insertion.
 */
export const ToastRegion = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  function ToastRegion({ className, ...rest }, ref) {
    return <div {...rest} ref={ref} role="region" aria-live="polite" aria-label="Notifications"
      className={cx('toast-region', className)} />;
  });

export interface ToastProps extends HTMLAttributes<HTMLDivElement> {
  tone?: Tone;
}

export const Toast = forwardRef<HTMLDivElement, ToastProps>(function Toast(
  { tone = 'neutral', className, ...rest }, ref,
) {
  return <div {...rest} ref={ref}
    data-tone={tone === 'neutral' ? undefined : tone}
    className={cx('toast', className)} />;
});

export const ToastTitle = forwardRef<HTMLParagraphElement, HTMLAttributes<HTMLParagraphElement>>(
  function ToastTitle({ className, ...rest }, ref) {
    return <p {...rest} ref={ref} className={cx('toast-title', className)} />;
  });

export const ToastBody = forwardRef<HTMLParagraphElement, HTMLAttributes<HTMLParagraphElement>>(
  function ToastBody({ className, ...rest }, ref) {
    return <p {...rest} ref={ref} className={cx('toast-body', className)} />;
  });

/**
 * The one action a toast may carry — Undo, most often. A real button inside the live region, so it
 * is announced with the toast and reached by Tab. Sits before `ToastClose`.
 *
 * One action, and only one that can be skipped: a toast is missed easily, so nothing that has to
 * be decided goes in one.
 */
export const ToastAction = forwardRef<HTMLButtonElement, ButtonHTMLAttributes<HTMLButtonElement>>(
  function ToastAction({ className, type = 'button', ...rest }, ref) {
    return <button {...rest} ref={ref} type={type}
      className={cx('btn', 'btn-secondary', 'btn-sm', 'toast-action', className)} />;
  });

export interface ToastCloseProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  /** Defaults to "Dismiss" — the button is icon-only and needs a name. */
  'aria-label'?: string;
}

/**
 * The dismiss control. A component rather than a class on a bare Button so the
 * accessible name and the icon cannot be forgotten at the call site.
 */
export const ToastClose = forwardRef<HTMLButtonElement, ToastCloseProps>(function ToastClose(
  { className, type = 'button', 'aria-label': label = 'Dismiss', ...rest }, ref,
) {
  return (
    <button {...rest} ref={ref} type={type} aria-label={label}
      className={cx('btn', 'btn-ghost', 'btn-icon', 'btn-sm', 'toast-close', className)}>
      <svg viewBox="0 0 256 256" fill="currentColor" aria-hidden="true"><path d="M205.66,194.34a8,8,0,0,1-11.32,11.32L128,139.31,61.66,205.66a8,8,0,0,1-11.32-11.32L116.69,128,50.34,61.66A8,8,0,0,1,61.66,50.34L128,116.69l66.34-66.35a8,8,0,0,1,11.32,11.32L139.31,128Z"/></svg>
    </button>
  );
});
