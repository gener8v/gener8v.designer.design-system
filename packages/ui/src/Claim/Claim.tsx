import { forwardRef } from 'react';
import type { HTMLAttributes, ReactNode } from 'react';
import { cx } from '../cx.js';

export interface ClaimProps extends HTMLAttributes<HTMLDivElement> {
  /** Nobody is waiting on this one any more. It sits back rather than disappearing. */
  settled?: boolean;
}

/**
 * A proposition somebody has to adjudicate.
 *
 * `Item` is a list of records — a name, a line of provenance, a mark or two — and its title is one
 * line that never wraps, because a name that wraps is a name too long. This is the other thing: an
 * assertion in PROSE, the argument for it, where it stands, and what can be done about it.
 *
 * A coverage finding, a held-open decision, a reading a machine proposed and a person has not
 * confirmed. Each is a claim with a case attached, waiting on somebody.
 */
export const Claim = forwardRef<HTMLDivElement, ClaimProps>(function Claim(
  { settled = false, className, ...rest }, ref,
) {
  return <div {...rest} ref={ref} data-settled={settled || undefined} className={cx('claim', className)} />;
});

/** Everything except the controls, in one column so the controls stay on the first line. */
export const ClaimBody = (props: HTMLAttributes<HTMLDivElement>) => (
  <div {...props} className={cx('claim-body', props.className)} />
);

/**
 * The assertion. Measured, because it is prose and it is the loudest thing here.
 *
 * A first attempt at this shape capped the quiet rationale and let the assertion run the full width
 * of the surface — the most important sentence on the row was the least readable thing on it.
 */
export const ClaimText = (props: HTMLAttributes<HTMLParagraphElement>) => (
  <p {...props} className={cx('claim-text', props.className)} />
);

export interface ClaimReasonProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Whose argument this is.
   *
   * A rationale with no author is an assertion — and on a surface where a machine and a person both
   * write them, which one wrote this is the first thing a reader needs.
   */
  by?: ReactNode;
}

/** The argument, which is not a footnote: disagreeing with it is usually the job. */
export const ClaimReason = forwardRef<HTMLDivElement, ClaimReasonProps>(function ClaimReason(
  { by, children, className, ...rest }, ref,
) {
  return (
    <div {...rest} ref={ref} className={cx('claim-reason', className)}>
      {by ? <span className="claim-reason-by">{by}</span> : null}
      {children}
    </div>
  );
});

export interface ClaimStandingProps extends HTMLAttributes<HTMLDivElement> {
  /** The mark — a `Tag`, usually. Where it stands, in one glance. */
  mark?: ReactNode;
  /** What it stands AS, in words. */
  what?: ReactNode;
}

/**
 * Where it stands, said once.
 *
 * Hand-rolled, this was a tag, a state and an attribution in one row at three weights — which reads
 * as three facts rather than one standing.
 */
export const ClaimStanding = forwardRef<HTMLDivElement, ClaimStandingProps>(function ClaimStanding(
  { mark, what, children, className, ...rest }, ref,
) {
  return (
    <div {...rest} ref={ref} className={cx('claim-standing', className)}>
      {mark}
      {what ? <span className="claim-standing-what">{what}</span> : null}
      {children}
    </div>
  );
});

/** The controls, level with the claim's first line rather than centred on a block of prose. */
export const ClaimActions = (props: HTMLAttributes<HTMLDivElement>) => (
  <div {...props} className={cx('claim-actions', props.className)} />
);
