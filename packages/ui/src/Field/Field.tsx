import { forwardRef } from 'react';
import type { HTMLAttributes, LabelHTMLAttributes } from 'react';
import { cx } from '../cx.js';

/** Stacks a label, a control and its hint or error at a consistent gap. */
export const Field = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  function Field({ className, ...rest }, ref) {
    return <div {...rest} ref={ref} className={cx('field', className)} />;
  });

export interface FieldLabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
  /** Appends a quiet "optional" marker rather than starring what is required. */
  optional?: boolean;
}

export const FieldLabel = forwardRef<HTMLLabelElement, FieldLabelProps>(
  function FieldLabel({ optional = false, className, ...rest }, ref) {
    return <label {...rest} ref={ref} data-optional={optional || undefined}
      className={cx('field-label', className)} />;
  });

export const FieldHint = forwardRef<HTMLSpanElement, HTMLAttributes<HTMLSpanElement>>(
  function FieldHint({ className, ...rest }, ref) {
    return <span {...rest} ref={ref} className={cx('field-hint', className)} />;
  });

/** Announce changes so a validation message reaches assistive tech. */
export const FieldError = forwardRef<HTMLSpanElement, HTMLAttributes<HTMLSpanElement>>(
  function FieldError({ className, role = 'alert', ...rest }, ref) {
    return <span {...rest} ref={ref} role={role} className={cx('field-error', className)} />;
  });
