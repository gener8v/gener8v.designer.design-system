import type { SVGProps } from 'react';

/** Phosphor `caret-left` at regular weight. Sized in em so it tracks the type.
 *
 * Back, within a set — a page, a step. Never navigation out of a surface.
 *
 * @group Navigation */
export function CaretLeft(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 256 256" fill="currentColor" width="1em" height="1em"
      aria-hidden={props['aria-label'] ? undefined : true}
      role={props['aria-label'] ? 'img' : undefined}
      {...props}>
      <path d="M165.66,202.34a8,8,0,0,1-11.32,11.32l-80-80a8,8,0,0,1,0-11.32l80-80a8,8,0,0,1,11.32,11.32L91.31,128Z" />
    </svg>
  );
}
