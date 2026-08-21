import { forwardRef } from 'react';
import type { HTMLAttributes } from 'react';
import { cx } from '../cx.js';

/**
 * The prescribed flow shell: a step rail, one content region, and a persistent
 * footer that always holds back on the left and forward on the right. An
 * engagement whose process does not fit this shape drops back to the parts —
 * Stepper, Progress, State — and composes its own.
 */
export const Flow = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  function Flow({ className, ...rest }, ref) {
    return <div {...rest} ref={ref} className={cx('flow', className)} />;
  });

export const FlowRail = forwardRef<HTMLElement, HTMLAttributes<HTMLElement>>(
  function FlowRail({ className, ...rest }, ref) {
    return <aside {...rest} ref={ref} className={cx('flow-rail', className)} />;
  });

export const FlowRailTitle = forwardRef<HTMLParagraphElement, HTMLAttributes<HTMLParagraphElement>>(
  function FlowRailTitle({ className, ...rest }, ref) {
    return <p {...rest} ref={ref} className={cx('flow-rail-title', className)} />;
  });

export const FlowMain = forwardRef<HTMLElement, HTMLAttributes<HTMLElement>>(
  function FlowMain({ className, ...rest }, ref) {
    return <main {...rest} ref={ref} className={cx('flow-main', className)} />;
  });

export const FlowHeader = forwardRef<HTMLElement, HTMLAttributes<HTMLElement>>(
  function FlowHeader({ className, ...rest }, ref) {
    return <header {...rest} ref={ref} className={cx('flow-header', className)} />;
  });

export const FlowStepOf = forwardRef<HTMLParagraphElement, HTMLAttributes<HTMLParagraphElement>>(
  function FlowStepOf({ className, ...rest }, ref) {
    return <p {...rest} ref={ref} className={cx('flow-step-of', className)} />;
  });

export const FlowTitle = forwardRef<HTMLHeadingElement, HTMLAttributes<HTMLHeadingElement>>(
  function FlowTitle({ className, ...rest }, ref) {
    return <h1 {...rest} ref={ref} className={cx('flow-title', className)} />;
  });

export const FlowLede = forwardRef<HTMLParagraphElement, HTMLAttributes<HTMLParagraphElement>>(
  function FlowLede({ className, ...rest }, ref) {
    return <p {...rest} ref={ref} className={cx('flow-lede', className)} />;
  });

export const FlowContent = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  function FlowContent({ className, ...rest }, ref) {
    return <div {...rest} ref={ref} className={cx('flow-content', className)} />;
  });

/** Caps the measure so a form never runs the full width of a wide screen. */
export const FlowFields = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  function FlowFields({ className, ...rest }, ref) {
    return <div {...rest} ref={ref} className={cx('flow-fields', className)} />;
  });

export const FlowFooter = forwardRef<HTMLElement, HTMLAttributes<HTMLElement>>(
  function FlowFooter({ className, ...rest }, ref) {
    return <footer {...rest} ref={ref} className={cx('flow-footer', className)} />;
  });

/** Sits between back and forward. Use it for save state, not for an action. */
export const FlowFooterStatus = forwardRef<HTMLSpanElement, HTMLAttributes<HTMLSpanElement>>(
  function FlowFooterStatus({ className, role = 'status', ...rest }, ref) {
    return <span {...rest} ref={ref} role={role} className={cx('flow-footer-status', className)} />;
  });
