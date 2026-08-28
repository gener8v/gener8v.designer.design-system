import { forwardRef } from 'react';
import type { HTMLAttributes, ReactNode } from 'react';
import { cx } from '../cx.js';

export type TallyTone = 'neutral' | 'success' | 'warning' | 'danger';

export interface TallyPart {
  n: number;
  tone?: TallyTone;
  /** What these ones say, in the reader's words: "gap", "covered", "not applicable". */
  what: ReactNode;
}

export interface TallyProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  parts: TallyPart[];
  /**
   * The denominator the bar is drawn against. Defaults to the sum, which normalises it.
   *
   * PASS IT WHEN THE ROWS ARE READ TOGETHER. Normalised, a capability five people spoke to and one
   * a single person mentioned draw the SAME full-width bar, and the reader cannot tell a finding
   * from an anecdote. Given the largest row's total, a short bar says "there is barely anything
   * here" without a second chart saying it in numbers.
   */
  of?: number;
}

/**
 * What a set of statements adds up to when they do not agree.
 *
 * `Meter` is one value with one tone — a level that is simply true. This is the other shape: five
 * saying gap and two saying covered is not "gap", and collapsing it to a single tone would hide the
 * disagreement, which is the one thing on the row worth opening.
 *
 * THE READOUT IS THE ACCESSIBLE VERSION, not a caption for it.
 *
 * The bar is `aria-hidden` and the counts are real text underneath. The alternative — an
 * `aria-label` summarising a graphic — writes the same sentence twice and lets the two drift, and
 * this is a component whose entire content is a handful of numbers that read perfectly well as
 * words.
 *
 * NOTHING TO SHOW IS NOT AN EMPTY BAR.
 *
 * With every part at zero this renders NOTHING, deliberately. An empty track with no words under it
 * reads as a rendering fault, and "nobody has spoken to this" is a third state the consumer has to
 * say in its own words — it is not a smaller version of a split.
 */
export const Tally = forwardRef<HTMLDivElement, TallyProps>(function Tally(
  { parts, of, className, ...rest }, ref,
) {
  const shown = parts.filter((part) => part.n > 0);
  const sum = shown.reduce((total, part) => total + part.n, 0);
  if (!sum) return null;
  // A denominator SMALLER than what is in the bar would draw segments past the end of the track.
  const whole = Math.max(of ?? sum, sum);
  return (
    <div {...rest} ref={ref} className={cx('tally', className)}>
      <div className="tally-track" aria-hidden="true">
        {shown.map((part, i) => (
          <span
            key={i}
            className="tally-part"
            data-tone={part.tone && part.tone !== 'neutral' ? part.tone : undefined}
            style={{ inlineSize: `${(part.n / whole) * 100}%` }}
          />
        ))}
      </div>
      <p className="tally-read">
        {shown.map((part, i) => (
          <span key={i} className="tally-count">
            <b>{part.n}</b> {part.what}
          </span>
        ))}
      </p>
    </div>
  );
});
