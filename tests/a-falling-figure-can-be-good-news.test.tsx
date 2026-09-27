import { describe, expect, it, afterEach } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { cleanup, render, screen } from '@testing-library/react';
import { StatDelta } from '../packages/ui/src/Stat';

/**
 * A falling figure can be good news, and the colour has to be able to say so.
 *
 * **`good` was declared on the props and never read.** The component did not
 * destructure it, so it landed in the rest props and was spread onto the `<p>`
 * — React warned *Received `false` for a non-boolean attribute `good`*, and the
 * colour went on coming from `direction` alone. A consumer who asked for a
 * falling figure to read as good got a console error and a red number.
 *
 * It was found in a product using this system: a screen there carries a comment
 * explaining that it does not pass `good` because passing it does nothing, and
 * that the colour happens to be right for that figure and will be wrong for the
 * first one where down is good news. A loss ratio is exactly that figure.
 *
 * ## Direction and judgement are two facts
 *
 * A book that shed a hundred and fifty policies is down and bad. A loss ratio
 * that fell four points is down and good. Colouring by direction alone asserts
 * the first about both, and there is no prop a consumer can reach for.
 *
 * So the colour keys off a tone, `data-dir` stays for anything that styles on
 * the direction itself, and `good` defaults to true — which leaves every
 * existing caller exactly where it was.
 */

const STYLES = readFileSync(join(__dirname, '..', 'design', 'styles.css'), 'utf8');

afterEach(cleanup);

describe('a falling figure can be good news', () => {
  it('reads a rise as good by default', () => {
    render(<StatDelta direction="up">96 since the year opened</StatDelta>);
    expect(screen.getByText(/96/).getAttribute('data-tone')).toBe('good');
  });

  it('reads a fall as bad by default', () => {
    render(<StatDelta direction="down">156 since the year opened</StatDelta>);
    expect(screen.getByText(/156/).getAttribute('data-tone')).toBe('bad');
  });

  /* The case the prop exists for, and the one that did not work. */
  it('reads a fall as good where the consumer says down is good', () => {
    render(
      <StatDelta direction="down" good={false}>
        4.0pp since last month
      </StatDelta>,
    );
    expect(screen.getByText(/4.0pp/).getAttribute('data-tone')).toBe('good');
  });

  it('reads a rise as bad on the same figure', () => {
    render(
      <StatDelta direction="up" good={false}>
        4.0pp since last month
      </StatDelta>,
    );
    expect(screen.getByText(/4.0pp/).getAttribute('data-tone')).toBe('bad');
  });

  /**
   * **And it stops reaching the DOM.**
   *
   * `good` is not an attribute and React says so on every render that passes
   * it. A console full of that warning is a console nobody reads.
   */
  it('does not spread the judgement onto the element', () => {
    render(
      <StatDelta direction="down" good={false}>
        A figure
      </StatDelta>,
    );
    expect(screen.getByText('A figure').hasAttribute('good')).toBe(false);
  });

  /* The direction is still there: a consumer styling on which way it moved has
     not lost the fact, and the text still says it, which is what WCAG 1.4.1
     actually requires. */
  it('keeps the direction on the element', () => {
    render(<StatDelta direction="down" good={false}>A figure</StatDelta>);
    expect(screen.getByText('A figure').getAttribute('data-dir')).toBe('down');
  });

  it('colours on the tone rather than the direction', () => {
    expect(STYLES).toContain('.stat-delta[data-tone="good"]');
    expect(STYLES).toContain('.stat-delta[data-tone="bad"]');
    /* The old rule is gone, not shadowed: two rules on the same element, one
       keyed on direction and one on tone, is a colour that depends on which was
       written last. */
    expect(STYLES).not.toContain('.stat-delta[data-dir="up"] {');
    expect(STYLES).not.toContain('.stat-delta[data-dir="down"] {');
  });
});
