import { forwardRef } from 'react';
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from 'react';
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

export interface ButtonLinkBase
  extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'children'> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Fills the inline axis. */
  block?: boolean;
  /** Required. An action that navigates has a destination the browser can see. */
  href: string;
  children?: ReactNode;
}

export type ButtonLinkProps =
  | (ButtonLinkBase & { iconOnly: true; 'aria-label': string })
  | (ButtonLinkBase & { iconOnly?: false });

/**
 * An action that navigates. Separate from `Button` rather than a polymorphic `as`
 * prop, for the reason `CardLink` is separate from `Card`: `href` stays required
 * and the anchor keeps its real semantics — opened in a new tab, copied, and
 * working with no JavaScript, none of which a button with a click handler does.
 *
 * There is no `loading` and no `disabled`. A link cannot be busy, and an anchor
 * cannot be disabled — the honest answer to "not available yet" is to not render
 * a link, which is why neither is offered here to be reached for.
 *
 * `variant="link"` is the one that ends the hand-rolled text link: `btn-link` is
 * an unpadded accent label that underlines on hover, and every consumer writing
 * that in utility classes was reinventing it because it could not be an anchor.
 */
export const ButtonLink = forwardRef<HTMLAnchorElement, ButtonLinkProps>(function ButtonLink(
  { variant = 'secondary', size = 'md', block = false, iconOnly = false, className, ...rest },
  ref,
) {
  return (
    <a
      {...rest}
      ref={ref}
      className={cx(
        'btn',
        `btn-${variant}`,
        SIZE_CLASS[size],
        iconOnly && 'btn-icon',
        block && 'btn-block',
        className,
      )}
    />
  );
});
