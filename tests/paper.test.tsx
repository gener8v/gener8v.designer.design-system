import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { render } from '@testing-library/react';
import { Paper, PaperAside, PaperGround } from '../packages/ui/src/index.js';

const CSS = readFileSync(join(__dirname, '..', 'design', 'styles.css'), 'utf8');

/** The stylesheet without its own prose. A rule that says "NOT `margin-inline: auto`" in a comment
 *  matches a guard looking for `margin-inline: auto` — the CSS form of asserting a docstring. */
const RULES = CSS.replace(/\/\*[\s\S]*?\*\//g, '');

/** One rule's body, comments already gone. */
function ruleFor(selector: string): string {
  const at = RULES.indexOf(`${selector} {`);
  return at < 0 ? '' : RULES.slice(at, RULES.indexOf('}', at));
}

/** The bodies of every `@media print` block, concatenated. jsdom does not apply print rules, so
 *  what a printed page looks like can only be read off the stylesheet itself. */
function printRules(): string {
  const out: string[] = [];
  for (let at = CSS.indexOf('@media print'); at >= 0; at = CSS.indexOf('@media print', at + 1)) {
    let depth = 0;
    for (let i = CSS.indexOf('{', at); i < CSS.length; i++) {
      if (CSS[i] === '{') depth++;
      else if (CSS[i] === '}' && --depth === 0) { out.push(CSS.slice(at, i)); break; }
    }
  }
  return out.join('\n');
}

describe('a sheet to read on', () => {
  it('puts the ground behind the sheet, not on it', () => {
    // The ground is the page the document sits on. If the sheet were the ground's own background
    // there would be nothing to sit on and the whole effect is a shadow nobody can explain.
    const { container } = render(
      <PaperGround><Paper>A deliverable.</Paper></PaperGround>,
    );
    const ground = container.querySelector('.paper-ground');

    expect(ground).not.toBeNull();
    expect(ground!.querySelector('.paper')).not.toBeNull();
  });

  it('seats the rail beside the sheet rather than inside it', () => {
    // A contents list on its own sheet makes two documents where there is one. `PaperAside` is a
    // sibling of the paper — on the ground, clearly secondary, obviously not part of the document.
    const { container } = render(
      <PaperGround>
        <Paper>A deliverable.</Paper>
        <PaperAside>Contents</PaperAside>
      </PaperGround>,
    );
    const aside = container.querySelector('.paper-aside');

    expect(aside).not.toBeNull();
    expect(aside!.closest('.paper')).toBeNull();
    expect(aside!.parentElement).toBe(container.querySelector('.paper-ground'));
  });

  it('does not let the sheet take the space the rail is standing in', () => {
    // THE DEFECT, on screen: `margin-inline: auto` on a flex item does not centre it — it eats
    // the free space. The ground was already centring the pair, so the sheet took everything
    // between them and drove the rail against the far edge of the window with a chasm in the
    // middle. Read off the stylesheet rather than the layout: jsdom does not do flexbox, and a
    // rule that says `auto` here is wrong whatever a fake layout engine reports.
    const sheet = ruleFor('.paper');

    expect(sheet).not.toBe('');
    expect(sheet).not.toMatch(/margin-inline:\s*auto/);
    expect(sheet).toMatch(/flex:\s*1 1 auto/);
  });

  it('gives the rail a width a contents entry fits in', () => {
    // It was `--space-24` — 96px, off the SPACING scale, for a layout dimension. Every entry
    // wrapped to twelve lines, the longest word still did not fit, and the overflow put a
    // horizontal scrollbar under the whole document.
    const rail = ruleFor('.paper-aside');
    const declared = /--rail-w:\s*(\d+)px/.exec(RULES);

    expect(rail).toMatch(/inline-size:\s*var\(--rail-w\)/);
    expect(rail, 'a heading is one long word more often than anybody expects')
      .toMatch(/overflow-wrap:\s*anywhere/);
    expect(Number(declared?.[1] ?? 0)).toBeGreaterThanOrEqual(200);
  });

  it('prints the document without the furniture around it', () => {
    // Printing a governed deliverable is a real act — it is what somebody attaches to something.
    // The border, the shadow and the page behind the sheet are screen furniture, and a contents
    // list on paper is a list of places that are not links to anything.
    const print = printRules();

    expect(print).toMatch(/\.paper-aside\s*\{[^}]*display:\s*none/);
    expect(print).toMatch(/\.paper\s*\{[^}]*border:\s*0/);
    expect(print).toMatch(/\.paper\s*\{[^}]*box-shadow:\s*none/);
    expect(print).toMatch(/\.paper-ground\s*\{[^}]*background:\s*transparent/);
  });
});
