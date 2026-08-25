import { describe, expect, it, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/react';
import { Callout } from '../packages/ui/src/index.js';

/**
 * One tone vocabulary, or it is not a vocabulary.
 *
 * `Alert`, `Toast` and `State` all speak the same five. `Callout` spoke two — a boolean `accent` —
 * so a consumer with a quiet aside flagging an ABSENCE had the choice of a tone that says "here is
 * some context" or an alert, which is a box in the middle of prose shouting about a missing
 * picture. They took a third option: a `.label` in a warning colour, which set a two-line sentence
 * in uppercase mono, because that was the only warning-coloured thing available at prose scale.
 */
afterEach(cleanup);

const toneOf = (container: HTMLElement) =>
  container.querySelector('.callout')?.getAttribute('data-tone');

describe('a callout', () => {
  it.each(['accent', 'success', 'warning', 'danger'] as const)('speaks %s', (tone) => {
    const { container } = render(<Callout tone={tone}>An aside.</Callout>);

    expect(toneOf(container)).toBe(tone);
  });

  it('carries no tone attribute when it is neutral', () => {
    // Neutral is the default rule colour, so stamping it would be a second way of saying nothing —
    // and `[data-tone]` selectors elsewhere read the attribute's PRESENCE.
    const { container } = render(<Callout>An aside.</Callout>);

    expect(toneOf(container)).toBeNull();
  });

  it('still honours the boolean it replaced', () => {
    // Existing callers pass `accent`. Breaking them to tidy an API is a cost paid by somebody who
    // was not asking for the feature.
    const { container } = render(<Callout accent>An aside.</Callout>);

    expect(toneOf(container)).toBe('accent');
  });

  it('lets an explicit tone win over the boolean', () => {
    const { container } = render(
      <Callout accent tone="warning">
        An aside.
      </Callout>
    );

    expect(toneOf(container)).toBe('warning');
  });
});
