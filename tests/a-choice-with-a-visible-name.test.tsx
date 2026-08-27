import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Segmented, SegmentedItem } from '../packages/ui/src/Segmented/Segmented.js';

function group(label: string) {
  return (
    <Segmented label={label}>
      <SegmentedItem checked>said</SegmentedItem>
      <SegmentedItem checked={false}>observed</SegmentedItem>
    </Segmented>
  );
}

describe('a choice with a visible name', () => {
  it('shows the name to everybody, not only to a screen reader', () => {
    // `aria-label` named the group for assistive tech and for nobody else. Two groups stacked in
    // one form then met a sighted reader as two rows of words with nothing saying what either was
    // for — which is where this came from.
    render(group('It says'));
    expect(screen.getByText('It says')).toBeInTheDocument();
  });

  it('uses the SAME string for the accessible name', () => {
    // Not a second copy. A visible name and an `aria-label` are two strings, and two strings drift
    // — one gets reworded and the other does not, and nobody sighted can see that it happened.
    render(group('On the grounds that it was'));
    expect(
      screen.getByRole('radiogroup', { name: 'On the grounds that it was' }),
    ).toBeInTheDocument();
  });

  it('is a span rather than a label, because a label must reference a control', () => {
    // A `<label>` wrapping or pointing at a radiogroup references nothing: clicking it focuses
    // nothing, and the browser's own association is silently absent.
    const { container } = render(group('It says'));
    expect(container.querySelector('label')).toBeNull();
  });

  it('leaves an unnamed group as one element', () => {
    // Every existing consumer positions the group itself. A wrapper appearing unconditionally
    // would move all of them.
    const { container } = render(
      <Segmented aria-label="How this gap closes">
        <SegmentedItem checked>one</SegmentedItem>
      </Segmented>,
    );
    expect(container.firstElementChild?.getAttribute('role')).toBe('radiogroup');
  });
});
