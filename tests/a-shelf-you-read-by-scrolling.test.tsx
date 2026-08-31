import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { Dock } from '../packages/ui/src/index.js';

/**
 * A long column of records, read by scrolling.
 *
 * The guard that carries the whole component is the first one: focus is not selection. Growing is
 * a reading affordance, and a list that opened whatever the wheel stopped on would make reading it
 * dangerous — which is the opposite of what this is for.
 */
const RULES = readFileSync(join(__dirname, '..', 'design', 'styles.css'), 'utf8').replace(
  /\/\*[\s\S]*?\*\//g,
  '',
);

/** Declarations for one selector, from ONE scope of the stylesheet.
 *
 *  Scoped on purpose. This component states a rule and then states its opposite under
 *  `prefers-reduced-motion` — deliberately, because the growth is how a name is read here — and a
 *  reader of the whole file sees only the last one, which is how a test could pass while claiming
 *  the wrong thing. */
function declarationsFor(selector: string, scope = ORDINARY): Record<string, string> {
  const out: Record<string, string> = {};
  for (const m of scope.matchAll(/([^{}]+)\{([^}]*)\}/g)) {
    if (!(m[1] ?? '').split(',').map((s) => s.trim()).includes(selector)) continue;
    for (const line of (m[2] ?? '').split(';')) {
      const [property, ...rest] = line.split(':');
      if (property?.trim() && rest.length) out[property.trim()] = rest.join(':').trim();
    }
  }
  return out;
}

/** The dock's own rules, and the reduced-motion block that answers them. */
const DOCK_AT = RULES.indexOf('.dock { overflow-y: auto');
const REDUCED_AT = RULES.indexOf('@media (prefers-reduced-motion: reduce)', DOCK_AT);
const ORDINARY = RULES.slice(DOCK_AT, REDUCED_AT);
const REDUCED = RULES.slice(REDUCED_AT, RULES.indexOf('\n}\n', REDUCED_AT));

const ITEMS = [
  { id: 'ecoa', name: 'ECOA-0a Fair Lending Reference', mark: 'E', note: 'v2' },
  { id: 'frame', name: 'FRAME-00 Overview and Framing', mark: 'F', note: 'v5' },
  { id: 'sox', name: 'SOX-0a Control Reference', mark: 'S', note: 'v1' },
];

const dock = (over: Record<string, unknown> = {}) => (
  <Dock label="Records" items={ITEMS} {...over} />
);

describe('a shelf you read by scrolling', () => {
  it('opens nothing when the reader scrolls past an item', async () => {
    // THE ONE THAT MATTERS, and the part the ask states outright: "releasing the scroll does not
    // open the document". A list that opened whatever the wheel stopped on is one nobody can skim.
    const onSelect = vi.fn();
    const { container } = render(dock({ onSelect }));

    fireEvent.scroll(container.querySelector('.dock')!);
    expect(onSelect).not.toHaveBeenCalled();
  });

  it('opens nothing when focus moves through it', async () => {
    const onSelect = vi.fn();
    render(dock({ onSelect }));

    await userEvent.tab();
    await userEvent.keyboard('{ArrowDown}{ArrowDown}');
    expect(onSelect).not.toHaveBeenCalled();
  });

  it('opens one when somebody actually chooses it', async () => {
    const onSelect = vi.fn();
    render(dock({ onSelect }));

    await userEvent.click(screen.getByRole('option', { name: /Fair Lending/ }));
    expect(onSelect).toHaveBeenCalledWith('ecoa');
  });

  it('moves the growth with the keyboard, not only with a wheel', async () => {
    // Otherwise the behaviour exists only for people using a pointer device, which in an audited
    // product is exactly the wrong half of the readership to build for.
    const { container } = render(dock());

    await userEvent.tab();
    await userEvent.keyboard('{ArrowDown}');

    const grown = container.querySelectorAll('[data-grown]');
    expect(grown).toHaveLength(1);
    expect((grown[0] as HTMLElement).dataset.dockItem).toBe('frame');
  });

  it('says what the column does, for somebody who cannot see it grow', () => {
    render(dock());
    expect(screen.getByRole('listbox', { name: 'Records' })).toBeTruthy();
    expect(screen.getByText(/Growing one does not open it/)).toBeTruthy();
  });

  it('collapses to marks, and a mark is not a dot', () => {
    // A collapsed column of identical dots is a column of nothing — which is the truncation
    // problem again, wearing a smaller coat.
    const { container } = render(dock({ collapsed: true }));

    expect(container.querySelector('.dock')?.getAttribute('data-collapsed')).toBe('true');
    expect(
      declarationsFor('.dock[data-collapsed] .dock-item:not([data-grown]) .dock-name')['font-size'],
    ).toBe('0');
    expect(screen.getByText('E')).toBeTruthy();
  });

  it('keeps every name readable when motion is refused', () => {
    // REDUCED MOTION IS NOT NO INFORMATION. The growth is how a name is read here, so removing the
    // animation must not remove the reading — every row shows its name in full instead.
    expect(REDUCED).toContain('transition: none');
    // Every name, in full, at one size — rather than a still column of truncated ones.
    expect(REDUCED).toContain('white-space: normal');
    expect(declarationsFor('.dock-item[data-grown] > button', REDUCED)['font-size']).toBe(
      'var(--text-sm)',
    );
  });

  it('stops truncating the one being read', () => {
    // The truncation IS the defect this control exists for, so the grown row is the one place it
    // stops — a bigger row that still ends in an ellipsis has solved nothing.
    expect(declarationsFor('.dock-item[data-grown] .dock-name')['white-space']).toBe('normal');
    expect(declarationsFor('.dock-name')['text-overflow']).toBe('ellipsis');
  });
});
