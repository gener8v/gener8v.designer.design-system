import { forwardRef } from 'react';
import type { HTMLAttributes } from 'react';
import { cx } from '../cx.js';

/** Hosts a region — a table, a form, a list. Header carries at most one action. */
export const Panel = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  function Panel({ className, ...rest }, ref) {
    return <div {...rest} ref={ref} className={cx('panel', className)} />;
  });

export const PanelHeader = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  function PanelHeader({ className, ...rest }, ref) {
    return <div {...rest} ref={ref} className={cx('panel-header', className)} />;
  });

export const PanelTitle = forwardRef<HTMLSpanElement, HTMLAttributes<HTMLSpanElement>>(
  function PanelTitle({ className, ...rest }, ref) {
    return <span {...rest} ref={ref} className={cx('panel-title', className)} />;
  });

export const PanelBody = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  function PanelBody({ className, ...rest }, ref) {
    return <div {...rest} ref={ref} className={cx('panel-body', className)} />;
  });
