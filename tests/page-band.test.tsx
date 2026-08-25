import { describe, expect, it, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/react';
import { PageActions, PageHead, Stat, StatLabel, StatRow, StatValue } from '../packages/ui/src/index.js';

/**
 * The band at the top of a surface, and the figures at the end of it.
 *
 * `.shell-head` lived in the app-shell template's own `<style>` block — scaffolding rather than a
 * component — so every consumer that wanted a page header wrote one, and the one that did had no
 * boundary of any kind. A picker, an eyebrow, a headline and four figures in undifferentiated
 * space, with nothing saying where the header stopped and the page began.
 *
 * WHAT THESE SPECS CAN AND CANNOT CHECK
 *
 * jsdom resolves a class but does no layout and no cascade, so nothing here measures a rule or a
 * gap. What they pin is the CONTRACT the stylesheet reads: which class each part emits.
 *
 * The EDGE itself is deliberately not guarded. A stylesheet check that `.shell-head` declares a
 * `border-block-end` would pin one visual decision rather than an invariant, and fail a future
 * restyle that separated the band some other way. Where a rule generalises — an activity indicator
 * must keep moving, a popup must not inherit its trigger's typography — this repo does check the
 * stylesheet. This is not one of those. It was checked by looking at it.
 */
afterEach(cleanup);

describe('a page band', () => {
  it('emits the class the stylesheet gives an edge to', () => {
    const { container } = render(<PageHead>Engagements</PageHead>);

    expect(container.querySelector('.shell-head')).not.toBeNull();
  });

  it('keeps a caller className rather than replacing it', () => {
    // A consumer spacing the band from a picker above it does that with a utility, and a component
    // that dropped the incoming class would silently ignore them.
    const { container } = render(<PageActions className="gap-8">figures</PageActions>);

    const actions = container.querySelector('.shell-actions');
    expect(actions?.classList.contains('gap-8')).toBe(true);
  });
});

describe('a row of figures', () => {
  it('groups them so they read as one sentence', () => {
    const { container } = render(
      <StatRow>
        <Stat>
          <StatValue>0</StatValue>
          <StatLabel>Covered</StatLabel>
        </Stat>
        <Stat>
          <StatValue>66</StatValue>
          <StatLabel>Nobody has looked</StatLabel>
        </Stat>
      </StatRow>
    );

    const row = container.querySelector('.stat-row');
    expect(row).not.toBeNull();
    // The rules between are `.stat-row > .stat + .stat`, so the stats must be DIRECT children —
    // a wrapper around each one would leave four columns floating in a gap again.
    expect([...(row?.children ?? [])].every((c) => c.classList.contains('stat'))).toBe(true);
  });
});
