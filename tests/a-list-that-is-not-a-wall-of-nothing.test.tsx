import { act } from 'react';
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { KnowledgeGraph } from '../packages/ui/src/KnowledgeGraph/KnowledgeGraph.js';

const RULES = readFileSync(join(__dirname, '..', 'design', 'styles.css'), 'utf8');

/** A CAPTION THAT SHARES NO WORD WITH THE ROWS.
 *
 *  The first version read "Every standard, joined by what was built against what" — so a guard
 *  asserting the list names each row's kind passed on the word "standard" in the caption while the
 *  kind was mutated away entirely. */
const CAPTION = 'How these join up.';

const NODES = [
  { id: 'a', label: 'SOX-0a', kind: 'standard' },
  { id: 'b', label: 'ECOA-0a', kind: 'standard' },
  { id: 'c', label: 'A deliverable', kind: 'document' },
];

function list(links: { source: string; target: string }[] = []) {
  const view = render(
    <KnowledgeGraph caption={CAPTION} nodes={NODES} links={links} />,
  );
  // `act`, because opening the list is a state change — without it the assertions run against the
  // canvas that was still on screen, and every one of them reads the caption and nothing else.
  act(() => screen.getByRole('button', { name: 'Browse as list' }).click());
  return view;
}

describe('a list that is not a wall of nothing', () => {
  it('says nothing about a node with no connections', () => {
    // "no connections" under every entity meant a graph with no edges rendered as one identical
    // sentence per row: the reader scans for a difference, finds none, and learns nothing the
    // empty canvas had not already told them.
    const { container } = list();
    expect(container.textContent).not.toContain('no connections');
  });

  it('still names what each one IS', () => {
    // Silence about the connections is not silence about the row. Read from the ROW rather than
    // from the page: the caption is on the page too, and a guard reading the whole thing passes on
    // a word that happens to appear in it.
    const { container } = list();
    const rows = [...container.querySelectorAll('.graph-index-item')].map((r) => r.textContent ?? '');
    expect(rows.some((r) => r.includes('standard'))).toBe(true);
    expect(rows.some((r) => r.includes('document'))).toBe(true);
  });

  it('says how many connections a node that has some has', () => {
    // The rows that DO have connections are the ones that should stand out, which is the whole
    // reason for dropping the repeated non-fact.
    const { container } = list([{ source: 'a', target: 'c' }]);
    expect(container.textContent).toContain('1 connection');
  });

  it('sets the caption as prose rather than as a label', () => {
    // `.label` is small, uppercase and letter-spaced — right for one or two words naming what
    // follows, and wrong for two sentences, which became a wall of capitals across the top.
    const { container } = list();
    const caption = container.querySelector('.graph-index-caption');
    expect(caption).toBeInTheDocument();
    expect(caption?.classList.contains('label')).toBe(false);
    // AND THE CLASS IS STYLED. A class the stylesheet does not define renders as unstyled prose,
    // which happens to look acceptable here and would be a rule nobody notices has gone — renaming
    // it in the CSS passed this guard until it read the stylesheet too.
    // THE SELECTOR, NOT A SUBSTRING OF IT. `toContain` matched
    // `.graph-index-caption-unused`, so renaming the rule passed this guard.
    expect(RULES).toMatch(/\.graph-index-caption\s*\{/);
  });

  it('keeps the list reachable, because a canvas is not readable', () => {
    // The accessible equivalent of the drawing. Removing it would leave a screen reader with a
    // caption pointing at a control that is not there.
    render(<KnowledgeGraph caption="c" nodes={NODES} links={[]} />);
    expect(screen.getByRole('button', { name: 'Browse as list' })).toBeInTheDocument();
  });
});
