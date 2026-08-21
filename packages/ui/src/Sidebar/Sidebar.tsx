import { forwardRef } from 'react';
import type { AnchorHTMLAttributes, HTMLAttributes } from 'react';
import { cx } from '../cx.js';

export const Sidebar = forwardRef<HTMLElement, HTMLAttributes<HTMLElement>>(
  function Sidebar({ className, ...rest }, ref) {
    return <nav {...rest} ref={ref} className={cx('sidebar', className)} />;
  });

/** A mono section heading inside the rail. */
export const SidebarGroup = forwardRef<HTMLParagraphElement, HTMLAttributes<HTMLParagraphElement>>(
  function SidebarGroup({ className, ...rest }, ref) {
    return <p {...rest} ref={ref} className={cx('sidebar-group', className)} />;
  });

export interface SidebarItemProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  current?: boolean;
}

export const SidebarItem = forwardRef<HTMLAnchorElement, SidebarItemProps>(
  function SidebarItem({ current = false, className, ...rest }, ref) {
    return <a {...rest} ref={ref} aria-current={current ? 'page' : undefined}
      className={cx('sidebar-item', className)} />;
  });

/** Trailing count. Tabular mono so the digits line up down the rail. */
export const SidebarCount = forwardRef<HTMLSpanElement, HTMLAttributes<HTMLSpanElement>>(
  function SidebarCount({ className, ...rest }, ref) {
    return <span {...rest} ref={ref} className={cx('sidebar-count', className)} />;
  });
