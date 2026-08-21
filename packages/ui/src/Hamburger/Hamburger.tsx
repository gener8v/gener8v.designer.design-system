import { forwardRef } from 'react';
import type { ButtonHTMLAttributes } from 'react';
import { cx } from '../cx.js';

export interface HamburgerProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  /** Drives the morph to an X and `aria-expanded`. */
  expanded: boolean;
  /** Required: the button has no text, so this is its only accessible name. */
  'aria-label': string;
  /** The id of the menu this controls, for `aria-controls`. */
  controls?: string;
}

/**
 * One button in two states. The three bars morph — nothing is swapped out for
 * an X glyph, so the transition is continuous and there is only ever one
 * element for assistive tech to announce.
 */
export const Hamburger = forwardRef<HTMLButtonElement, HamburgerProps>(function Hamburger(
  { expanded, controls, className, type = 'button', ...rest }, ref,
) {
  return (
    <button {...rest} ref={ref} type={type}
      aria-expanded={expanded} aria-controls={controls}
      className={cx('hamburger', className)}>
      <span className="hamburger-box">
        <span className="hamburger-bar" />
        <span className="hamburger-bar" />
        <span className="hamburger-bar" />
      </span>
    </button>
  );
});
