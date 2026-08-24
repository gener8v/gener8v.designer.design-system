import { describe, expect, it, beforeAll } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { render, screen } from '@testing-library/react';
import { RadioCards, RadioCard } from '../packages/ui/src/index.js';

/**
 * A radio card's note sits under its title, not beside it.
 *
 * `RadioCard` renders the title and the note in `<span>`s, and the note is styled with
 * `margin-block-start`. A vertical margin does nothing on an inline box, so the two ran together on
 * one line — "TranscriptAn interview or a meeting." — everywhere the component was used.
 *
 * WHY THIS LOADS THE REAL STYLESHEET
 *
 * The component's markup was never wrong; the declaration was missing. A test over the DOM alone
 * cannot see that, and a test that greps the CSS for `display: block` asserts a string rather than
 * a result. jsdom resolves `display` from a stylesheet even though it lays nothing out, so the
 * built `design/styles.css` goes in and the computed value comes out.
 */
beforeAll(() => {
  const style = document.createElement('style');
  style.textContent = readFileSync(join(__dirname, '..', 'design', 'styles.css'), 'utf8');
  document.head.appendChild(style);
});

describe('a radio card', () => {
  it('puts its note on its own line', () => {
    render(
      <RadioCards>
        <RadioCard name="k" value="transcript" title="Transcript" note="An interview or a meeting." />
      </RadioCards>,
    );
    const note = screen.getByText('An interview or a meeting.');

    // Inline is the failure: it is what puts the note against the end of the title.
    expect(getComputedStyle(note).display).toBe('block');
  });

  it('gives the title a line of its own too', () => {
    render(
      <RadioCards>
        <RadioCard name="k" value="transcript" title="Transcript" note="An interview or a meeting." />
      </RadioCards>,
    );

    expect(getComputedStyle(screen.getByText('Transcript')).display).toBe('block');
  });

  // NO SPEC FOR THE GAP ITSELF.
  //
  // `margin-block-start: var(--space-1)` was in the stylesheet the whole time and did nothing,
  // because an inline box cannot take a vertical margin. jsdom reports the DECLARED value and does
  // not model that suppression, so an assertion on the margin passes just as happily in the broken
  // state — which is a spec that cannot fail for the defect it is named after. The display
  // assertions above are what actually distinguish the two, and they were checked by removing the
  // declaration and watching them go red.
});
