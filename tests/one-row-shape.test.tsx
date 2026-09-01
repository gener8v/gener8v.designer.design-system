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

describe('a detail that is a comparison', () => {
  it('gives the measure to the column instead of the block', () => {
    // 68ch keeps a paragraph readable, and a detail holding one keeps it. A detail holding two
    // positions BEING COMPARED is not a paragraph: capping the pair gives each side 34ch and
    // leaves the rest of the row empty, so the reader scrolls between two things whose whole
    // point is that they are opposed.
    const prose = declarationsFor('.item-detail');
    const columns = declarationsFor(".item-detail[data-layout='columns']");

    expect(prose['max-inline-size']).toBe('68ch');
    expect(columns['max-inline-size']).toBe('none');
    expect(columns['display']).toBe('grid');
    // No breakpoint: a row can sit in a panel or a drawer, so the columns answer the space this
    // row has rather than the width of the page.
    expect(columns['grid-template-columns']).toContain('auto-fit');
  });

  it('says nothing about layout unless it is a comparison', () => {
    // The default carries no attribute at all. A `data-layout="prose"` on every row in the
    // product would be a styling hook nobody set, sitting in the markup of every list.
    const { container } = render(
      <ItemList>
        <Item title="Portfolio and PMO">a note about it</Item>
      </ItemList>,
    );

    expect(container.querySelector('.item-detail')?.getAttribute('data-layout')).toBeNull();
  });

  it('marks the detail when it is', () => {
    const { container } = render(
      <ItemList>
        <Item title="Portfolio and PMO" detail="columns">
          <span>has it</span>
          <span>lacks it</span>
        </Item>
      </ItemList>,
    );

    expect(container.querySelector('.item-detail')?.getAttribute('data-layout')).toBe('columns');
  });
});
