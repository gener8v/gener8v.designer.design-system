import type { SVGProps } from 'react';

/** Phosphor `arrow-left` at regular weight. Sized in em so it tracks the type.
 *
 * Back out of a surface to the one that opened it — the navigation `CaretLeft` is
 * never used for.
 *
 * @group Navigation */
export function ArrowLeft(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 256 256" fill="currentColor" width="1em" height="1em"
      aria-hidden={props['aria-label'] ? undefined : true}
      role={props['aria-label'] ? 'img' : undefined}
      {...props}>
      <path d="M224,128a8,8,0,0,1-8,8H59.31l58.35,58.34a8,8,0,0,1-11.32,11.32l-72-72a8,8,0,0,1,0-11.32l72-72a8,8,0,0,1,11.32,11.32L59.31,120H216A8,8,0,0,1,224,128Z"/>
    </svg>
  );
}
