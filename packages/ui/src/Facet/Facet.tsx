import { forwardRef } from 'react';
import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cx } from '../cx.js';

/* `name` and `value` are BOTH form-control attributes on a native button, typed as strings. A
   facet's name and value are its whole content and may be a node — an icon beside an agent, a
   date in the mono face — so the DOM meanings are dropped rather than widened: a facet is not a
   form field and inheriting the submission attributes would say it was. */
export interface FacetProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'name' | 'value'> {
  /** The dimension: "Agent", "Written", "Against". */
  name: ReactNode;
  /** The recorded value. */
  value: ReactNode;
  /** This facet is currently narrowing the list. */
  active?: boolean;
  /** The value is an ABSENCE stated in words — "no standard named" — not a fact. */
  muted?: boolean;
}

/**
 * An attribute you can act on.
 *
 * `Tag` says what something is and nothing happens when you press it. A facet is
 * a recorded fact about a row that NARROWS a list when pressed — and the
 * dimension a reader wants to filter by is nearly always one already on screen,
 * so the attribute is the control and there is no filter panel to go and find.
 *
 * WITHOUT `onClick` IT RENDERS AS A SPAN, deliberately: an attribute that cannot
 * narrow anything must not look like it can. So this is also the right component
 * for showing an attribute plainly, and a row does not change shape when a
 * dimension becomes filterable.
 *
 * An EMPTY value renders nothing at all. "Against ·" with a blank after it is
 * worse than an absent facet, and only the consumer knows whether the value is
 * missing or unread — pass `muted` with the absence in words when it knows.
 */
export const Facet = forwardRef<HTMLButtonElement, FacetProps>(function Facet(
  { name, value, active = false, muted = false, className, onClick, ...rest }, ref,
) {
  if (value === '' || value === null || value === undefined) return null;
  const inner = (
    <>
      <span className="facet-name">{name}</span>
      <span className="facet-value">{value}</span>
    </>
  );
  const classes = cx('facet', muted && 'facet-muted', className);
  if (!onClick) {
    const { type: _type, disabled: _disabled, ...plain } = rest;
    return (
      <span {...plain} className={classes}>
        {inner}
      </span>
    );
  }
  return (
    <button {...rest} ref={ref} type="button" onClick={onClick} aria-pressed={active} className={classes}>
      {inner}
    </button>
  );
});

/** A wrapping row of facets. */
export const Facets = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  function Facets({ className, ...rest }, ref) {
    return <div {...rest} ref={ref} className={cx('facets', className)} />;
  },
);
