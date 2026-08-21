import { forwardRef } from 'react';
import type { HTMLAttributes, ReactNode } from 'react';
import { cx } from '../cx.js';

export interface ButtonGroupProps extends HTMLAttributes<HTMLDivElement> {
  /** Names the set for screen readers, e.g. "View". */
  'aria-label': string;
  children?: ReactNode;
}

/** A segmented row of adjoining buttons. Give the children the same variant. */
export const ButtonGroup = forwardRef<HTMLDivElement, ButtonGroupProps>(
  function ButtonGroup({ className, children, ...rest }, ref) {
    return (
      <div {...rest} ref={ref} role="group" className={cx('btn-group', className)}>
        {children}
      </div>
    );
  },
);
