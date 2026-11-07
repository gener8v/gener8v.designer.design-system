import type { SVGProps } from 'react';

/** Phosphor `flag-pennant` at regular weight. Sized in em so it tracks the type.
 *
 * Flagged rather than resolved — a contradiction, a held-open decision touched.
 *
 * @group Status */
export function Flag(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 256 256" fill="currentColor" width="1em" height="1em"
      aria-hidden={props['aria-label'] ? undefined : true}
      role={props['aria-label'] ? 'img' : undefined}
      {...props}>
      <path d="M242.63,96.44l-184-64A8,8,0,0,0,48,40V216a8,8,0,0,0,16,0V173.69l178.63-62.13a8,8,0,0,0,0-15.12ZM64,156.75V51.25L215.65,104Z"/>
    </svg>
  );
}
