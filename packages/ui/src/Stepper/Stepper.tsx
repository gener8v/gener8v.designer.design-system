import { forwardRef } from 'react';
import type { HTMLAttributes, ReactNode } from 'react';
import { cx } from '../cx.js';

export interface StepperProps extends HTMLAttributes<HTMLDivElement> {
  /** The rail form used by the .flow shell. */
  vertical?: boolean;
}

export const Stepper = forwardRef<HTMLDivElement, StepperProps>(function Stepper(
  { vertical = false, className, ...rest }, ref,
) {
  return <div {...rest} ref={ref}
    className={cx('stepper', vertical && 'stepper-vertical', className)} />;
});

export type StepState = 'complete' | 'current' | 'upcoming';

export interface StepProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  state: StepState;
  /** Shown in the marker. Replaced by a tick once the step is complete. */
  index: number;
  label: ReactNode;
  /** Hidden in the horizontal form; the shell draws its own rail line. */
  connector?: boolean;
}

/**
 * Position is carried by `data-state` and `aria-current="step"`, so the marker,
 * the connector and the screen-reader announcement read one source.
 */
export const Step = forwardRef<HTMLDivElement, StepProps>(function Step(
  { state, index, label, connector = true, className, ...rest }, ref,
) {
  return (
    <div {...rest} ref={ref}
      data-state={state === 'upcoming' ? undefined : state}
      aria-current={state === 'current' ? 'step' : undefined}
      className={cx('step', className)}>
      <span className="step-marker">{index}</span>
      <span className="step-label">{label}</span>
      {connector && <span className="step-connector" />}
    </div>
  );
});
