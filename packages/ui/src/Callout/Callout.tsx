import { forwardRef } from 'react';
import type { HTMLAttributes } from 'react';
import { cx } from '../cx.js';

export interface CalloutProps extends HTMLAttributes<HTMLDivElement> {
  accent?: boolean;
}

/** A quiet aside inside prose — a rule, not a box. */
export const Callout = forwardRef<HTMLDivElement, CalloutProps>(function Callout(
  { accent = false, className, ...rest }, ref,
) {
  return <div {...rest} ref={ref} data-tone={accent ? 'accent' : undefined}
    className={cx('callout', className)} />;
});

export const CalloutTitle = forwardRef<HTMLParagraphElement, HTMLAttributes<HTMLParagraphElement>>(
  function CalloutTitle({ className, ...rest }, ref) {
    return <p {...rest} ref={ref} className={cx('callout-title', className)} />;
  });
