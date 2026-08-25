import { forwardRef } from 'react';
import type { HTMLAttributes } from 'react';
import { cx } from '../cx.js';

/**
 * What a surface says it is, above what it holds.
 *
 * `.shell-head` lived in the app-shell template's own `<style>` block — scaffolding, not a
 * component — so every consumer that wanted a page header wrote one. The delivery record's had no
 * boundary of any kind: a picker, an eyebrow, a headline and four figures in undifferentiated
 * space, with nothing saying where the header stopped and the page began.
 *
 * The rule under it is the whole point. A band is only a band if it has an edge; without one it is
 * the first few lines of the page and the reader does the grouping.
 */
export const PageHead = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  function PageHead({ className, ...rest }, ref) {
    return <div {...rest} ref={ref} className={cx('shell-head', className)} />;
  });

/**
 * What sits at the end of the band — figures, a control, a button.
 *
 * Its auto margin does nothing when the first child takes the free space with `flex: 1`, which is
 * the usual arrangement and the one that keeps a standfirst under its title rather than beside it.
 * It exists for the caller who does not do that.
 */
export const PageActions = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  function PageActions({ className, ...rest }, ref) {
    return <div {...rest} ref={ref} className={cx('shell-actions', className)} />;
  });
