import { forwardRef, useId, useState } from 'react';
import type { AnchorHTMLAttributes, HTMLAttributes, ReactNode } from 'react';
import { cx } from '../cx.js';

export const Sidebar = forwardRef<HTMLElement, HTMLAttributes<HTMLElement>>(
  function Sidebar({ className, ...rest }, ref) {
    return <nav {...rest} ref={ref} className={cx('sidebar', className)} />;
  });

/**
 * A heading and the items under it, as one block.
 *
 * The rail is flat by default — headings and items are siblings, and the rail's own `gap` and
 * `:first-child` rule do the spacing. Rendering a list of groups puts a wrapper between them, which
 * takes both rules away: the gap falls between wrappers rather than items, and every heading
 * becomes the first child of its own wrapper, so every heading loses its margin rather than only
 * the first. This carries the two rules the rail can no longer apply on its behalf.
 *
 * Use it when the groups come from data. A rail written out by hand needs nothing.
 */
export interface SidebarSectionProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  /** The group's heading. */
  label: ReactNode;
  /**
   * Lets the heading fold its items away.
   *
   * Off by default: a rail of two groups is not long enough to need it, and a control that does
   * nothing useful is still a control somebody has to read past.
   */
  collapsible?: boolean;
  /** Uncontrolled starting state. A section holding the current page should start open. */
  defaultOpen?: boolean;
}

export const SidebarSection = forwardRef<HTMLDivElement, SidebarSectionProps>(
  function SidebarSection({ label, collapsible = false, defaultOpen = true, className, children, ...rest }, ref) {
    const id = useId();
    const [open, setOpen] = useState(defaultOpen);

    return (
      <div {...rest} ref={ref} className={cx('sidebar-section', className)}>
        {collapsible ? (
          <button type="button" className="sidebar-group sidebar-group-toggle"
            aria-expanded={open} aria-controls={id} onClick={() => setOpen((v) => !v)}>
            {label}
          </button>
        ) : (
          <p className="sidebar-group">{label}</p>
        )}
        {/* `hidden` rather than a zero height: collapsed items must leave the accessibility tree,
            not merely the viewport — the same call the accordion panel makes. The wrapper only
            exists when it is collapsible, so an ordinary section keeps its items as direct children
            of the flex column that spaces them. */}
        {collapsible ? (
          <div id={id} className="sidebar-section-items" hidden={!open}>{children}</div>
        ) : (
          children
        )}
      </div>
    );
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
