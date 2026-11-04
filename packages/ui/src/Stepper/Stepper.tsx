import { forwardRef } from 'react';
import type { HTMLAttributes, ReactNode } from 'react';
import { cx } from '../cx.js';

export interface StepperProps extends HTMLAttributes<HTMLDivElement> {
  /** The vertical form used by the .flow shell. */
  vertical?: boolean;
  /**
   * Segments rather than numbered markers.
   *
   * **The two forms answer different questions.** A marker and its label are a
   * pair, and the pairing breaks when a sequence spans a page: six stages on a
   * wide screen put a quarter of the width between one circle and the next, and
   * how far along the sequence is cannot be seen at all, because every circle
   * but one is the same grey.
   *
   * The rail fills what is behind, so position reads without counting, and each
   * label sits under its own segment. Use the markers when a reader steps
   * through and each step is an act they perform; use the rail when the
   * sequence is a position they are somewhere in.
   */
  rail?: boolean;
  /** Marker size: `md` 32px (default), `sm` 24px for a dense header or a dialog. */
  size?: 'sm' | 'md';
}

export const Stepper = forwardRef<HTMLDivElement, StepperProps>(function Stepper(
  { vertical = false, rail = false, size = 'md', className, ...rest }, ref,
) {
  return <div {...rest} ref={ref}
    className={cx('stepper', vertical && 'stepper-vertical', rail && 'stepper-rail',
      size === 'sm' && 'stepper-sm', className)} />;
});

/**
 * Where a step is — the progress family's states, in a sequence's words.
 *
 * `failed` is the one that was missing, and it is not a cosmetic addition: a sequence that reaches
 * out to somebody else's API stops when a step is refused, and without a word for that the step
 * either sits at `current` forever or is marked `complete`, which is a lie about what happened.
 * `stopped` is interrupted rather than refused; `skipped` was passed over on purpose.
 */
export type StepState = 'complete' | 'current' | 'failed' | 'stopped' | 'skipped' | 'upcoming';

const STATE_WORDS: Record<StepState, string> = {
  complete: 'complete', current: 'current step', failed: 'failed', stopped: 'stopped',
  skipped: 'skipped', upcoming: 'not started',
};

export interface StepProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  state: StepState;
  /** Shown in the marker. Replaced by the state's glyph once the step has ended. */
  index: number;
  label: ReactNode;
  /** A line under the label — what the step is, or why it stopped. */
  description?: ReactNode;
  /** Hidden in the vertical and rail forms, which draw their own line. */
  connector?: boolean;
  /**
   * What assistive tech hears after the label — `complete`, `failed`. The marker's glyph and
   * colour are not read, so the state is said in words. Pass `''` to say nothing.
   */
  stateLabel?: string;
}

/**
 * Position is carried by `data-state` and `aria-current="step"`, so the marker,
 * the connector and the screen-reader announcement read one source.
 */
export const Step = forwardRef<HTMLDivElement, StepProps>(function Step(
  { state, index, label, description, connector = true, stateLabel, className, ...rest }, ref,
) {
  const said = stateLabel ?? STATE_WORDS[state];
  return (
    <div {...rest} ref={ref}
      data-state={state === 'upcoming' ? undefined : state}
      aria-current={state === 'current' ? 'step' : undefined}
      className={cx('step', className)}>
      {/* The index stays in the DOM once the step has ended — transparent, so the marker keeps its
          size — and the glyph is drawn over it by CSS, centred on the marker rather than placed
          in a grid beside an invisible number. */}
      <span className="step-marker" aria-hidden="true">{index}</span>
      <span className="step-label">
        {label}
        {said ? <span className="sr-only">, {said}</span> : null}
      </span>
      {description ? <span className="step-description">{description}</span> : null}
      {connector && <span className="step-connector" />}
    </div>
  );
});
