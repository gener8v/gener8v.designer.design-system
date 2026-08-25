import { describe, expect, it, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/react';
import { Step, Stepper } from '../packages/ui/src/index.js';

/**
 * A step that was attempted and refused.
 *
 * The vocabulary was complete / current / upcoming, which has no word for the one outcome a reader
 * most needs to see. A consumer running a sequence against somebody else's API — create the
 * repository, wire the webhook, make the Project — had two options for a refused step: leave it
 * looking `current` forever, or mark it `complete`, which is a lie about what happened.
 */
afterEach(cleanup);

const stateOf = (container: HTMLElement, label: string) =>
  [...container.querySelectorAll('.step')]
    .find((s) => s.textContent?.includes(label))
    ?.getAttribute('data-state') ?? null;

describe('a sequence that stopped', () => {
  it('marks the refused step failed rather than current or complete', () => {
    const { container } = render(
      <Stepper>
        <Step state="complete" index={1} label="Registered" />
        <Step state="failed" index={2} label="Repository" />
        <Step state="upcoming" index={3} label="Webhook" />
      </Stepper>
    );

    expect(stateOf(container, 'Repository')).toBe('failed');
  });

  it('does not claim the failed step is the one in progress', () => {
    // `aria-current="step"` is what a screen reader announces as "you are here". A refused step is
    // not where the reader is; it is where the sequence stopped.
    const { container } = render(
      <Stepper>
        <Step state="failed" index={1} label="Repository" />
      </Stepper>
    );

    expect(container.querySelector('.step')?.getAttribute('aria-current')).toBeNull();
  });

  it('leaves upcoming steps unstamped, so the attribute means something', () => {
    const { container } = render(
      <Stepper>
        <Step state="upcoming" index={1} label="Webhook" />
      </Stepper>
    );

    expect(stateOf(container, 'Webhook')).toBeNull();
  });
});
