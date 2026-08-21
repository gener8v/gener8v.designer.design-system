import { forwardRef } from 'react';
import type { HTMLAttributes } from 'react';
import { cx } from '../cx.js';

export interface DescriptionListProps extends HTMLAttributes<HTMLDListElement> {
  /** Stacks term above description — for narrow columns. */
  stacked?: boolean;
}

export const DescriptionList = forwardRef<HTMLDListElement, DescriptionListProps>(
  function DescriptionList({ stacked = false, className, ...rest }, ref) {
    return <dl {...rest} ref={ref} className={cx('dl', stacked && 'dl-stacked', className)} />;
  });
