import { forwardRef } from 'react';
import type { AnchorHTMLAttributes, HTMLAttributes } from 'react';
import { cx } from '../cx.js';

export const Nav = forwardRef<HTMLElement, HTMLAttributes<HTMLElement>>(
  function Nav({ className, ...rest }, ref) {
    return <nav {...rest} ref={ref} className={cx('nav', className)} />;
  });

export const NavBrand = forwardRef<HTMLAnchorElement, AnchorHTMLAttributes<HTMLAnchorElement>>(
  function NavBrand({ className, ...rest }, ref) {
    return <a {...rest} ref={ref} className={cx('nav-brand', className)} />;
  });

export const NavLinks = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  function NavLinks({ className, ...rest }, ref) {
    return <div {...rest} ref={ref} className={cx('nav-links', className)} />;
  });

export interface NavItemProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  /** Sets `aria-current="page"`. Active state is never a class — the styling
   *  reads the accessibility tree, so the two cannot drift apart. */
  current?: boolean;
}

export const NavItem = forwardRef<HTMLAnchorElement, NavItemProps>(
  function NavItem({ current = false, className, ...rest }, ref) {
    return <a {...rest} ref={ref} aria-current={current ? 'page' : undefined}
      className={cx('nav-item', className)} />;
  });
