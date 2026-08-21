import { forwardRef } from 'react';
import type { HTMLAttributes } from 'react';
import { cx } from '../cx.js';

export type SpinnerSize = 'sm' | 'md' | 'lg';
const SIZE: Record<SpinnerSize, string | undefined> = {
  sm: 'spinner-sm', md: undefined, lg: 'spinner-lg',
};

export interface SpinnerProps extends Omit<HTMLAttributes<HTMLSpanElement>, 'children'> {
  size?: SpinnerSize;
  /** Decorative by default — the surrounding region should carry aria-busy. */
  label?: string;
}

export const Spinner = forwardRef<HTMLSpanElement, SpinnerProps>(function Spinner(
  { size = 'md', label, className, ...rest }, ref,
) {
  return <span {...rest} ref={ref}
    role={label ? 'status' : undefined}
    aria-label={label}
    aria-hidden={label ? undefined : true}
    className={cx('spinner', SIZE[size], className)} />;
});
