import type { SVGProps } from 'react';

/** Phosphor `caret-up` at regular weight. Sized in em so it tracks the type.
 *
 * A group that is open and closes on click, and the ascending end of a sort.
 *
 * @group Navigation */
export function CaretUp(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 256 256" fill="currentColor" width="1em" height="1em"
      aria-hidden={props['aria-label'] ? undefined : true}
      role={props['aria-label'] ? 'img' : undefined}
      {...props}>
      <path d="M213.66,165.66a8,8,0,0,1-11.32,0L128,91.31,53.66,165.66a8,8,0,0,1-11.32-11.32l80-80a8,8,0,0,1,11.32,0l80,80A8,8,0,0,1,213.66,165.66Z"/>
    </svg>
  );
}
