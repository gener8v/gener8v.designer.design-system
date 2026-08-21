import { forwardRef } from 'react';
import type { HTMLAttributes } from 'react';
import { cx } from '../cx.js';

export type AvatarSize = 'sm' | 'md' | 'lg';
const SIZE: Record<AvatarSize, string | undefined> = {
  sm: 'avatar-sm', md: undefined, lg: 'avatar-lg',
};

export interface AvatarProps extends Omit<HTMLAttributes<HTMLSpanElement>, 'children'> {
  size?: AvatarSize;
  /** Image source. Falls back to initials when absent or on error. */
  src?: string;
  /** The person's name. Used for the img alt and to derive initials. */
  name: string;
}

const initials = (name: string) =>
  name.trim().split(/\s+/).slice(0, 2).map((p) => p[0]?.toUpperCase() ?? '').join('');

/**
 * An avatar is decorative when it sits beside the name it depicts, which is
 * the usual case — so the wrapper is aria-hidden and the image alt is empty.
 * Pass an explicit `aria-label` on the rare occasion it stands alone.
 */
export const Avatar = forwardRef<HTMLSpanElement, AvatarProps>(function Avatar(
  { size = 'md', src, name, className, 'aria-label': label, ...rest }, ref,
) {
  return (
    <span {...rest} ref={ref}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      className={cx('avatar', SIZE[size], className)}>
      {src ? <img src={src} alt="" /> : initials(name)}
    </span>
  );
});

export const AvatarGroup = forwardRef<HTMLSpanElement, HTMLAttributes<HTMLSpanElement>>(
  function AvatarGroup({ className, ...rest }, ref) {
    return <span {...rest} ref={ref} className={cx('avatar-group', className)} />;
  });
