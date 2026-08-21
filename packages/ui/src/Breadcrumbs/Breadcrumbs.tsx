import { Children, Fragment, forwardRef } from 'react';
import type { AnchorHTMLAttributes, HTMLAttributes, ReactNode } from 'react';
import { cx } from '../cx.js';

export interface BreadcrumbsProps extends Omit<HTMLAttributes<HTMLElement>, 'children'> {
  children?: ReactNode;
  /** Rendered between crumbs. Marked aria-hidden so it is not announced. */
  separator?: ReactNode;
}

/** Interleaves separators itself, so a caller cannot forget one or add two. */
export const Breadcrumbs = forwardRef<HTMLElement, BreadcrumbsProps>(function Breadcrumbs(
  { children, separator = '/', className, ...rest }, ref,
) {
  const crumbs = Children.toArray(children);
  return (
    <nav {...rest} ref={ref} aria-label="Breadcrumb" className={cx('breadcrumbs', className)}>
      {crumbs.map((crumb, i) => (
        <Fragment key={i}>
          {i > 0 && <span className="breadcrumb-sep" aria-hidden="true">{separator}</span>}
          {crumb}
        </Fragment>
      ))}
    </nav>
  );
});

export interface BreadcrumbProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  /** The last crumb is the current page: rendered as text, not a link. */
  current?: boolean;
}

export const Breadcrumb = forwardRef<HTMLAnchorElement, BreadcrumbProps>(
  function Breadcrumb({ current = false, className, children, ...rest }, ref) {
    if (current) return <span aria-current="page" className={className}>{children}</span>;
    return <a {...rest} ref={ref} className={className}>{children}</a>;
  });
