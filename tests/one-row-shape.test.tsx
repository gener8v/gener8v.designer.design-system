import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { render, screen } from '@testing-library/react';
import { Item, ItemList, Tag } from '../packages/ui/src/index.js';

const RULES = readFileSync(join(__dirname, '..', 'design', 'styles.css'), 'utf8').replace(
  /\/\*[\s\S]*?\*\//g,
  '',
);

function declarationsFor(selector: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const m of RULES.matchAll(/([^{}]+)\{([^}]*)\}/g)) {
    if (!(m[1] ?? '').split(',').map((s) => s.trim()).includes(selector)) continue;
    for (const line of (m[2] ?? '').split(';')) {
      const [property, ...rest] = line.split(':');
      if (property?.trim() && rest.length) out[property.trim()] = rest.join(':').trim();
    }
  }
  return out;
}

describe('a list of records', () => {
  it('puts the marks on the title\'s line', () => {
    // A tag pushed onto its own line reads as a second fact about the row rather than as a
    // qualification of its name — "not yet searchable by meaning" belongs beside the thing it is
    // about, not underneath it.
    const { container } = render(
      <ItemList>
        <Item title="Our payment stack" meta="priya · 2026-08-27" trailing={<Tag>draft</Tag>} />
      </ItemList>,
    );
    const line = container.querySelector('.item-line');

    expect(line?.querySelector('.item-title')?.textContent).toBe('Our payment stack');
    expect(line?.querySelector('.item-trailing')?.textContent).toBe('draft');
    // And the meta is NOT on that line: it is what the row came from, not what it is.
    expect(line?.querySelector('.item-meta')).toBeNull();
    expect(screen.getByText('priya · 2026-08-27')).toBeTruthy();
  });

  it('sets the name louder than what it came from', () => {
    const title = declarationsFor('.item-title');
    const meta = declarationsFor('.item-meta');
    const px = (token: string) =>
      Number(new RegExp(`${token.slice(4, -1)}:\\s*(\\d+)px`).exec(RULES)?.[1] ?? 0);

    expect(px(title['font-size'] ?? '')).toBeGreaterThan(px(meta['font-size'] ?? ''));
    expect(title['color']).toBe('var(--color-neutral-900)');
    expect(meta['color']).toBe('var(--color-neutral-600)');
  });

  it('rules between rows rather than boxing each one', () => {
    // A box per row turns a list of six into six boxes.
    expect(declarationsFor('.item + .item')['border-block-start']).toContain('1px solid');
    expect(declarationsFor('.item')['border']).toBeUndefined();
  });

  it('is a list, so a screen reader can say how long it is', () => {
    const { container } = render(
      <ItemList>
        <Item title="one" />
        <Item title="two" />
      </ItemList>,
    );

    expect(container.querySelector('ul')?.children).toHaveLength(2);
    expect(container.querySelectorAll('li')).toHaveLength(2);
  });
});
