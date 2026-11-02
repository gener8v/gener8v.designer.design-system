// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { Meter } from '../packages/ui/src/index.js';
import { expectNoA11yViolations } from './a11y.js';

/**
 * A meter can say where the level ought to be — and says it in words as well as with a tick,
 * because a tick nobody has been told about is a mark, not a target.
 */
afterEach(cleanup);

describe('a level against its target', () => {
  it('is unchanged when no target is given', () => {
    render(<Meter value={62} label="Coverage" tone="warning" />);
    const m = screen.getByRole('meter', { name: 'Coverage' });
    expect(m).toHaveAttribute('aria-valuemax', '100');
    expect(m).toHaveAttribute('aria-valuenow', '62');
    expect(m).toHaveAttribute('data-tone', 'warning');
    expect(m.querySelector('.meter-threshold')).toBeNull();
    expect(m).not.toHaveAttribute('aria-describedby');
  });

  it('draws the target and names it, and the meter points at the words', () => {
    render(<Meter value={62} threshold={80} label="Coverage" />);
    const m = screen.getByRole('meter', { name: 'Coverage' });
    const tick = m.querySelector<HTMLElement>('.meter-threshold')!;
    expect(tick.style.insetInlineStart).toBe('80%');
    expect(tick).toHaveAttribute('aria-hidden', 'true');
    expect(m).toHaveAccessibleDescription('Target 80%');
  });

  it('reads its tone off the target when asked to', () => {
    const { rerender } = render(<Meter value={80} threshold={80} tone="auto" label="Coverage" />);
    expect(screen.getByRole('meter')).toHaveAttribute('data-tone', 'success');
    rerender(<Meter value={79} threshold={80} tone="auto" label="Coverage" />);
    expect(screen.getByRole('meter')).toHaveAttribute('data-tone', 'warning');
    rerender(<Meter value={79} tone="auto" label="Coverage" />);
    expect(screen.getByRole('meter')).not.toHaveAttribute('data-tone');
  });

  it('works on any scale, and says the target on that scale', () => {
    render(<Meter value={41} max={60} threshold={48} label="Controls" display="41 of 60" />);
    const m = screen.getByRole('meter');
    expect(m).toHaveAttribute('aria-valuemax', '60');
    expect(m.querySelector<HTMLElement>('.meter-fill')!.style.inlineSize).toMatch(/^68\.3/);
    expect(m.querySelector<HTMLElement>('.meter-threshold')!.style.insetInlineStart).toBe('80%');
    expect(m).toHaveAccessibleDescription('Target 48');
  });

  it('passes axe', async () => {
    const { container } = render(<main><Meter value={62} threshold={80} tone="auto" label="Coverage" /></main>);
    await expectNoA11yViolations(container);
  });
});
