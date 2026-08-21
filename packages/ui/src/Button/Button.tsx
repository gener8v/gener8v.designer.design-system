import { forwardRef } from 'react';
import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cx } from '../cx.js';

export type ButtonVariant =
  | 'primary' | 'secondary' | 'ghost' | 'subtle' | 'destructive' | 'link';
export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

interface ButtonBase extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  /** Visual weight. One `primary` per view. */
  variant?: ButtonVariant;
  /** Sits on the shared `--control-h-*` scale, so buttons line up with inputs. */
  size?: ButtonSize;
  /** Swaps the label for a spinner and sets `aria-busy`. */
  loading?: boolean;
  /** Fills the inline axis. */
  block?: boolean;
  children?: ReactNode;
}

/**
 * An icon-only button has no text node, so its accessible name has to come from
 * `aria-label`. Making that required in the type means the a11y rule is enforced
 * by the compiler rather than by a review comment.
 */
export type ButtonProps =
  | (ButtonBase & { iconOnly: true; 'aria-label': string })
  | (ButtonBase & { iconOnly?: false });

const SIZE_CLASS: Record<ButtonSize, string | undefined> = {
  xs: 'btn-xs', sm: 'btn-sm', md: undefined, lg: 'btn-lg', xl: 'btn-xl',
};

/**
 * Renders the exact markup from `design/components/buttons.html`. The classes
 * are the design system's own, so HTML written against the system — including
 * HTML that Claude generates from `readme.md` — drops in without a rewrite.
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'secondary', size = 'md', loading = false, block = false,
    iconOnly = false, className, disabled, type = 'button', children, ...rest },
  ref,
) {
  return (
    <button
      {...rest}
      ref={ref}
      type={type}
      disabled={disabled}
      aria-busy={loading || undefined}
      className={cx(
        'btn',
        `btn-${variant}`,
        SIZE_CLASS[size],
        iconOnly && 'btn-icon',
        block && 'btn-block',
        loading && 'is-loading',
        className,
      )}
    >
      {children}
    </button>
  );
});
