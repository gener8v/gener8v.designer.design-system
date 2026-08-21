import { forwardRef } from 'react';
import type { ButtonHTMLAttributes, HTMLAttributes } from 'react';
import { cx } from '../cx.js';

export const Pagination = forwardRef<HTMLElement, HTMLAttributes<HTMLElement>>(
  function Pagination({ className, 'aria-label': label = 'Pagination', ...rest }, ref) {
    return <nav {...rest} ref={ref} aria-label={label} className={cx('pagination', className)} />;
  });

export interface PaginationItemProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  current?: boolean;
}

export const PaginationItem = forwardRef<HTMLButtonElement, PaginationItemProps>(
  function PaginationItem({ current = false, className, type = 'button', ...rest }, ref) {
    return <button {...rest} ref={ref} type={type}
      aria-current={current ? 'page' : undefined}
      className={cx('pagination-item', className)} />;
  });

/** The elided range. aria-hidden — "…" announces nothing useful. */
export const PaginationGap = forwardRef<HTMLSpanElement, HTMLAttributes<HTMLSpanElement>>(
  function PaginationGap({ className, children = '…', ...rest }, ref) {
    return <span {...rest} ref={ref} aria-hidden="true"
      className={cx('pagination-gap', className)}>{children}</span>;
  });
