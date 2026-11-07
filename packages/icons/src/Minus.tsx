import type { SVGProps } from 'react';

/** Phosphor `minus` at regular weight. Sized in em so it tracks the type.
 *
 * Taking one away, or stepping a value down. The counterpart to `Plus`.
 *
 * @group Actions */
export function Minus(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 256 256" fill="currentColor" width="1em" height="1em"
      aria-hidden={props['aria-label'] ? undefined : true}
      role={props['aria-label'] ? 'img' : undefined}
      {...props}>
      <path d="M224,128a8,8,0,0,1-8,8H40a8,8,0,0,1,0-16H216A8,8,0,0,1,224,128Z"/>
    </svg>
  );
}
