import { forwardRef } from 'react';
import type { HTMLAttributes } from 'react';
import { cx } from '../cx.js';

export type SkeletonVariant = 'block' | 'text' | 'title' | 'circle';
const VARIANT: Record<SkeletonVariant, string | undefined> = {
  block: undefined, text: 'skeleton-text', title: 'skeleton-title', circle: 'skeleton-circle',
};

export interface SkeletonProps extends Omit<HTMLAttributes<HTMLSpanElement>, 'children'> {
  variant?: SkeletonVariant;
}

/** Always aria-hidden — the loading region announces itself, not each bar. */
export const Skeleton = forwardRef<HTMLSpanElement, SkeletonProps>(function Skeleton(
  { variant = 'block', className, ...rest }, ref,
) {
  return <span {...rest} ref={ref} aria-hidden="true"
    className={cx('skeleton', VARIANT[variant], className)} />;
});
