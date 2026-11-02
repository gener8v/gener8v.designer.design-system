// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { STATE_ART, State, StateArt, StateTitle } from '../packages/ui/src/index.js';
import { expectNoA11yViolations } from './a11y.js';

afterEach(cleanup);

const CSS = readFileSync(join(__dirname, '..', 'design', 'styles.css'), 'utf8');

describe('an empty place you recognise', () => {
  it('draws each picture above the title, hidden from assistive tech', () => {
    for (const name of STATE_ART) {
      const { container, unmount } = render(
        <State kind="empty" art={name}><StateTitle>Nothing here</StateTitle></State>);
      const art = container.querySelector('.state-art')!;
      expect(art).toHaveAttribute('aria-hidden', 'true');
      expect(art).toHaveAttribute('data-art', name);
      expect(art.nextElementSibling).toHaveClass('state-title');
      // One accent mark per drawing: one place for the eye to land.
      expect(art.querySelectorAll('.state-art-mark').length).toBeGreaterThan(0);
      unmount();
    }
  });

  it('draws on currentColor, so the theme is the only thing that decides its colour', () => {
    const { container } = render(<StateArt name="inbox" />);
    const strokes = [...container.querySelectorAll('[stroke]')].map((e) => e.getAttribute('stroke'));
    expect(new Set(strokes)).toEqual(new Set(['currentColor']));
    expect(container.innerHTML).not.toMatch(/#[0-9a-f]{3,6}\b/i);
    expect(CSS).toMatch(/\.state-art \.state-art-mark \{ stroke: var\(--color-accent\); \}/);
  });

  it('takes a drawing of your own', () => {
    const { container } = render(<State kind="empty" art={<svg viewBox="0 0 1 1" />} />);
    expect(container.querySelector('.state-art svg')).toBeTruthy();
  });

  it('is unchanged without one', () => {
    const { container } = render(<State kind="empty"><StateTitle>None</StateTitle></State>);
    expect(container.querySelector('.state-art')).toBeNull();
    expect(screen.getByText('None')).toBeTruthy();
  });

  it('passes axe', async () => {
    const { container } = render(<main><State kind="empty" art="search"><StateTitle>No matches</StateTitle></State></main>);
    await expectNoA11yViolations(container);
  });
});
