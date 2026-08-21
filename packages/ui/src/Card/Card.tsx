import { forwardRef } from 'react';
import type { AnchorHTMLAttributes, HTMLAttributes } from 'react';
import { cx } from '../cx.js';

export type CardVariant = 'default' | 'quiet' | 'raised';
export type CardPadding = 'sm' | 'md' | 'lg';

const VARIANT_CLASS: Record<CardVariant, string | undefined> = {
  default: undefined, quiet: 'card-quiet', raised: 'card-raised',
};
const PADDING_CLASS: Record<CardPadding, string | undefined> = {
  sm: 'card-pad-sm', md: undefined, lg: 'card-pad-lg',
};

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  padding?: CardPadding;
}

/** A hairline surface. Elevation is reserved for things that genuinely float. */
export const Card = forwardRef<HTMLDivElement, CardProps>(function Card(
  { variant = 'default', padding = 'md', className, ...rest }, ref,
) {
  return <div {...rest} ref={ref}
    className={cx('card', VARIANT_CLASS[variant], PADDING_CLASS[padding], className)} />;
});

export interface CardLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  variant?: CardVariant;
  padding?: CardPadding;
  href: string;
}

/**
 * A card that is itself a single link target. Separate from `Card` rather than
 * a polymorphic `as` prop, so `href` stays required and the anchor keeps its
 * real semantics instead of a div with a click handler.
 */
export const CardLink = forwardRef<HTMLAnchorElement, CardLinkProps>(function CardLink(
  { variant = 'default', padding = 'md', className, ...rest }, ref,
) {
  return <a {...rest} ref={ref}
    className={cx('card', 'card-interactive', VARIANT_CLASS[variant], PADDING_CLASS[padding], className)} />;
});

/** The mono voice — a section marker or classification, never a subtitle. */
export const CardKicker = forwardRef<HTMLParagraphElement, HTMLAttributes<HTMLParagraphElement>>(
  function CardKicker({ className, ...rest }, ref) {
    return <p {...rest} ref={ref} className={cx('card-kicker', className)} />;
  });

export const CardTitle = forwardRef<HTMLParagraphElement, HTMLAttributes<HTMLParagraphElement>>(
  function CardTitle({ className, ...rest }, ref) {
    return <p {...rest} ref={ref} className={cx('card-title', className)} />;
  });

export const CardBody = forwardRef<HTMLParagraphElement, HTMLAttributes<HTMLParagraphElement>>(
  function CardBody({ className, ...rest }, ref) {
    return <p {...rest} ref={ref} className={cx('card-body', className)} />;
  });

export const CardMeta = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  function CardMeta({ className, ...rest }, ref) {
    return <div {...rest} ref={ref} className={cx('card-meta', className)} />;
  });

/** Bleeds to the card's edges by cancelling its padding. */
export const CardMedia = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  function CardMedia({ className, ...rest }, ref) {
    return <div {...rest} ref={ref} className={cx('card-media', className)} />;
  });
