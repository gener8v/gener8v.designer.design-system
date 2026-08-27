import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { render } from '@testing-library/react';
import { Paper, PaperAside, PaperGround } from '../packages/ui/src/index.js';

const CSS = readFileSync(join(__dirname, '..', 'design', 'styles.css'), 'utf8');

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
