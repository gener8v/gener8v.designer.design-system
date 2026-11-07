import type { SVGProps } from 'react';

/** Phosphor `dots-three` at regular weight. Sized in em so it tracks the type.
 *
 * More, where the more is a menu rather than a page.
 *
 * @group Actions */
export function DotsThree(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 256 256" fill="currentColor" width="1em" height="1em"
      aria-hidden={props['aria-label'] ? undefined : true}
      role={props['aria-label'] ? 'img' : undefined}
      {...props}>
      <path d="M156,128a28,28,0,1,1-28-28A28,28,0,0,1,156,128ZM48,100a28,28,0,1,0,28,28A28,28,0,0,0,48,100Zm160,0a28,28,0,1,0,28,28A28,28,0,0,0,208,100Z" />
    </svg>
  );
}
