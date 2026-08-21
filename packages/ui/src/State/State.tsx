import { forwardRef } from 'react';
import type { HTMLAttributes } from 'react';
import { cx } from '../cx.js';

/**
 * The six states every flow passes through. `partial` is the one most systems
 * omit and the one that matters most in audited work — a figure computed from
 * three of five sources has to say so.
 */
export type StateKind =
  | 'loading' | 'empty' | 'partial' | 'error' | 'denied' | 'success';

export type StateTone = 'neutral' | 'accent' | 'success' | 'warning' | 'danger';

const TONE: Record<StateKind, StateTone> = {
  loading: 'neutral', empty: 'neutral', partial: 'warning',
  error: 'danger', denied: 'neutral', success: 'success',
};

export interface StateProps extends HTMLAttributes<HTMLDivElement> {
  kind: StateKind;
  /** Overrides the tone implied by `kind`. */
  tone?: StateTone;
  tight?: boolean;
}

export const State = forwardRef<HTMLDivElement, StateProps>(function State(
  { kind, tone, tight = false, className, ...rest }, ref,
) {
  const resolved = tone ?? TONE[kind];
  return <div {...rest} ref={ref}
    data-tone={resolved === 'neutral' ? undefined : resolved}
    aria-busy={kind === 'loading' || undefined}
    className={cx('state', tight && 'state-tight', className)} />;
});

export const StateIcon = forwardRef<HTMLSpanElement, HTMLAttributes<HTMLSpanElement>>(
  function StateIcon({ className, ...rest }, ref) {
    return <span {...rest} ref={ref} aria-hidden="true" className={cx('state-icon', className)} />;
  });

export const StateTitle = forwardRef<HTMLParagraphElement, HTMLAttributes<HTMLParagraphElement>>(
  function StateTitle({ className, ...rest }, ref) {
    return <p {...rest} ref={ref} className={cx('state-title', className)} />;
  });

export const StateBody = forwardRef<HTMLParagraphElement, HTMLAttributes<HTMLParagraphElement>>(
  function StateBody({ className, ...rest }, ref) {
    return <p {...rest} ref={ref} className={cx('state-body', className)} />;
  });

export const StateActions = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  function StateActions({ className, ...rest }, ref) {
    return <div {...rest} ref={ref} className={cx('state-actions', className)} />;
  });

/** Support-engineer detail: a code and a request id a user can safely ignore. */
export const StateDetail = forwardRef<HTMLParagraphElement, HTMLAttributes<HTMLParagraphElement>>(
  function StateDetail({ className, ...rest }, ref) {
    return <p {...rest} ref={ref} className={cx('state-detail', className)} />;
  });
