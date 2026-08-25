import { forwardRef } from 'react';
import type { HTMLAttributes } from 'react';
import { cx } from '../cx.js';
import type { Tone } from '../Alert/Alert.js';

export interface CalloutProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * The same five `Alert`, `Toast` and `State` speak. It used to be a boolean `accent`, which meant
   * a quiet aside flagging an ABSENCE had no tone to say so in — and a consumer reached for a
   * `.label` in a warning colour, setting a whole sentence in uppercase mono, because that was the
   * only warning-coloured thing at prose scale.
   */
  tone?: Tone;
  /** @deprecated Pass `tone="accent"`. Kept so existing callers do not break. */
  accent?: boolean;
}

/** A quiet aside inside prose — a rule, not a box. The rule takes the tone; nothing else does,
 *  because a tinted background would make it the alert it is deliberately not. */
export const Callout = forwardRef<HTMLDivElement, CalloutProps>(function Callout(
  { tone, accent = false, className, ...rest }, ref,
) {
  const chosen = tone ?? (accent ? 'accent' : 'neutral');
  return <div {...rest} ref={ref} data-tone={chosen === 'neutral' ? undefined : chosen}
    className={cx('callout', className)} />;
});

export const CalloutTitle = forwardRef<HTMLParagraphElement, HTMLAttributes<HTMLParagraphElement>>(
  function CalloutTitle({ className, ...rest }, ref) {
    return <p {...rest} ref={ref} className={cx('callout-title', className)} />;
  });
