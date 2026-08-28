import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Tally } from '../packages/ui/src/index.js';

const width = (el: Element) => Number.parseFloat((el as HTMLElement).style.inlineSize);
const parts = () => Array.from(document.querySelectorAll('.tally-part'));

describe('what a set of voices adds up to', () => {
  it('shows the mix rather than a winner', () => {
    // Five saying gap and two saying covered is not "gap". Collapsing it to one tone would hide
    // the disagreement, which is the one thing on the row worth opening.
    render(<Tally parts={[{ n: 5, what: 'gap', tone: 'danger' }, { n: 2, what: 'covered', tone: 'success' }]} />);
    expect(parts()).toHaveLength(2);
    expect(screen.getByText('gap')).toBeTruthy();
    expect(screen.getByText('covered')).toBeTruthy();
  });

  it('tells one voice from six when the rows are read together', () => {
    // NORMALISED, THESE TWO ARE IDENTICAL — both draw one full-width segment — and a reader
    // scanning twenty-eight rows cannot tell a finding from an anecdote.
    const { unmount } = render(<Tally parts={[{ n: 1, what: 'gap' }]} of={6} />);
    const lonely = width(parts()[0]);
    unmount();
    render(<Tally parts={[{ n: 6, what: 'gap' }]} of={6} />);
    const many = width(parts()[0]);
    expect(lonely, 'one voice fills the track').toBeLessThan(many);
    expect(many).toBeCloseTo(100, 1);
  });

  it('never draws past the end of its own track', () => {
    // A denominator smaller than what is in the bar is a caller's mistake, and the honest reading
    // of it is "this is everything", not a segment overflowing the track.
    render(<Tally parts={[{ n: 9, what: 'gap' }]} of={2} />);
    expect(width(parts()[0])).toBeCloseTo(100, 1);
  });

  it('renders nothing at all when nothing was said', () => {
    // An empty track with no words under it reads as a rendering fault. "Nobody has spoken to
    // this" is a third state the consumer says in its own words.
    const { container } = render(<Tally parts={[{ n: 0, what: 'gap' }, { n: 0, what: 'covered' }]} />);
    expect(container.innerHTML).toBe('');
  });

  it('drops the parts that are zero rather than drawing slivers', () => {
    render(<Tally parts={[{ n: 3, what: 'gap' }, { n: 0, what: 'covered' }]} />);
    expect(parts()).toHaveLength(1);
    expect(screen.queryByText('covered'), 'a count of zero is listed').toBeNull();
  });

  it('puts the numbers in text rather than in a label on a graphic', () => {
    // The readout IS the accessible version. An aria-label summarising the bar writes the same
    // sentence twice and lets the two drift.
    render(<Tally parts={[{ n: 4, what: 'gap' }]} />);
    expect(document.querySelector('.tally-track')?.getAttribute('aria-hidden')).toBe('true');
    expect(screen.getByText('4')).toBeTruthy();
  });
});
