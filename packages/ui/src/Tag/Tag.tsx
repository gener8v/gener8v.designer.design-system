import { forwardRef } from 'react';
import type { HTMLAttributes } from 'react';
import { cx } from '../cx.js';

/**
 * Every variant maps to a meaning. There is deliberately no "just make it blue"
 * option — a tag that carries no status is decoration.
 */
export type TagVariant =
  | 'neutral' | 'accent' | 'success' | 'warning' | 'danger' | 'outline';

export interface TagProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: TagVariant;
  /** Prefixes a filled dot, for rows where even a tint is too much weight. */
  dot?: boolean;
}

export const Tag = forwardRef<HTMLSpanElement, TagProps>(function Tag(
  { variant = 'neutral', dot = false, className, ...rest }, ref,
) {
  return <span {...rest} ref={ref}
    className={cx('tag', `tag-${variant}`, dot && 'tag-dot', className)} />;
});
