import { forwardRef } from 'react';
import type { HTMLAttributes, InputHTMLAttributes, LabelHTMLAttributes } from 'react';
import { cx } from '../cx.js';

/**
 * The label is the hit target, so the whole row is clickable at ≥44px. Wrap the
 * control and its text in this rather than placing a bare checkbox on a page.
 */
export const Choice = forwardRef<HTMLLabelElement, LabelHTMLAttributes<HTMLLabelElement>>(
  function Choice({ className, ...rest }, ref) {
    return <label {...rest} ref={ref} className={cx('choice', className)} />;
  });

export const ChoiceHint = forwardRef<HTMLSpanElement, HTMLAttributes<HTMLSpanElement>>(
  function ChoiceHint({ className, ...rest }, ref) {
    return <span {...rest} ref={ref} className={cx('choice-hint', className)} />;
  });

type ToggleProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'>;

export const Checkbox = forwardRef<HTMLInputElement, ToggleProps>(
  function Checkbox({ className, ...rest }, ref) {
    return <input {...rest} ref={ref} type="checkbox" className={cx('checkbox', className)} />;
  });

export const Radio = forwardRef<HTMLInputElement, ToggleProps>(
  function Radio({ className, ...rest }, ref) {
    return <input {...rest} ref={ref} type="radio" className={cx('radio', className)} />;
  });

/** A checkbox with `role="switch"` — the state is on/off, not selected/unselected. */
export const Switch = forwardRef<HTMLInputElement, ToggleProps>(
  function Switch({ className, ...rest }, ref) {
    return <input {...rest} ref={ref} type="checkbox" role="switch"
      className={cx('switch', className)} />;
  });
