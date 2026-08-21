import { forwardRef } from 'react';
import type { SelectHTMLAttributes } from 'react';
import { cx } from '../cx.js';

export type SelectSize = 'sm' | 'md' | 'lg';

const SELECT_SIZE: Record<SelectSize, string | undefined> = {
  sm: 'select-sm', md: undefined, lg: 'select-lg',
};

export interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  size?: SelectSize;
  invalid?: boolean;
}

/**
 * Renders its own wrapper because the chevron is drawn on the wrapper's
 * ::after — that keeps the arrow on design tokens instead of baking a hex
 * into a background-image data URI.
 */
export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { size = 'md', invalid = false, className, children, ...rest }, ref,
) {
  return (
    <span className="select-wrap">
      <select {...rest} ref={ref} aria-invalid={invalid || undefined}
        className={cx('select', SELECT_SIZE[size], className)}>
        {children}
      </select>
    </span>
  );
});
