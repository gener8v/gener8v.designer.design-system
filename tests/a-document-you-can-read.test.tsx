import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

/**
 * A rendered markdown document, read rather than scanned past.
 *
 * `.reader` is what every deliverable, every package document and every answer this product writes
 * is set in, and it had no test at all — which is how it shipped for months with no list markers.
 *
 * A LIST WITHOUT MARKERS IS AN INDENTED PARAGRAPH. `display: grid` was reached for to space list
 * items, and grid BLOCKIFIES its children: a blockified `li` has no `::marker`. So every list in
 * every document lost its bullets and became indented prose. An answer with three nested lists in
 * it read as one wall with no way to see where a list began, which item sat under which, or where
 * it ended.
 *
 * The other half of a wall is that nothing is GROUPED. `.reader > * + *` gives every block the
 * same space, so a list sits as far from the sentence introducing it as from the next section.
 */
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

describe('a document you can read', () => {
  it('leaves a list a list', () => {
    const list = declarationsFor('.reader ul');

    // The regression itself. Any display that blockifies children takes the markers with it.
    expect(list['display'], 'a display here blockifies the items and removes their markers')
      .toBeUndefined();
    // And the spacing it was reached for comes from between the items instead.
    expect(declarationsFor('.reader li + li')['margin-block-start']).toBe('var(--space-2)');
  });

  it('says which level you are on with the marker, not only the indent', () => {
    // Two indents of unmarked text at different depths is what made nesting invisible.
    expect(declarationsFor('.reader ul')['list-style']).toBe('disc');
    expect(declarationsFor('.reader ul ul')['list-style']).toBe('circle');
    expect(declarationsFor('.reader ul ul ul')['list-style']).toBe('square');
  });

  it('keeps a marker quiet', () => {
    // It is there to show where an item begins, not to be read.
    expect(declarationsFor('.reader li::marker')['color']).toBe('var(--color-neutral-500)');
  });

  it('binds a list to the sentence that introduces it', () => {
    // A list belongs to the line above it. Equal space on both sides is why a page of short
    // labelled lists read as one undifferentiated column.
    const hugs = declarationsFor('.reader p + ul')['margin-block-start'];
    const parts = declarationsFor('.reader ul + p')['margin-block-start'];

    expect(hugs).toBe('var(--space-2)');
    expect(parts).toBe('var(--space-6)');
    expect(hugs, 'a list sits no closer to its lead-in than to the next section').not.toBe(parts);
  });
});
