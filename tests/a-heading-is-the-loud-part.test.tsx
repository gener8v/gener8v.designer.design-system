import { describe, expect, it, beforeAll } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { render, screen } from '@testing-library/react';
import { SectionHead } from '../packages/ui/src/index.js';

const CSS = readFileSync(join(__dirname, '..', 'design', 'styles.css'), 'utf8');
/** Without its own prose: a rule whose comment quotes the defect matches a guard looking for it. */
const RULES = CSS.replace(/\/\*[\s\S]*?\*\//g, '');

beforeAll(() => {
  const style = document.createElement('style');
  style.textContent = CSS;
  document.head.appendChild(style);
});

const px = (v: string) => Number(/(-?\d+)px/.exec(v)?.[1] ?? 0);

/** One rule's body, comments already gone. */
function ruleFor(selector: string): string {
  const at = RULES.indexOf(`${selector} {`);
  return at < 0 ? '' : RULES.slice(at, RULES.indexOf('}', at));
}

/** What a `--text-*` token is actually worth. jsdom does not resolve `var()`, so a computed
 *  font-size comes back empty and any comparison of two of them is 0 against 0 — a test that
 *  passes whatever the stylesheet says. The sizes are read from the token block instead. */
function textToken(rule: string): number {
  const name = /font-size:\s*var\((--text-[\w-]+)\)/.exec(rule)?.[1];
  if (!name) return 0;
  return px(new RegExp(`${name}:\\s*(\\d+px)`).exec(RULES)?.[1] ?? '0px');
}

describe('the name of a section', () => {
  it('is a heading, and the sentence under it is not', () => {
    // THE DEFECT, on every surface with sections: `h2` is 36px — a PAGE heading — so a section
    // inside a dense surface reached for `.label` (11px, mono, uppercase, grey) with a `.lede`
    // (20px) underneath. The name of the thing was set smaller than the commentary about it,
    // which inverts the one convention every reader has held since print.
    const title = ruleFor('.section-title');
    const lede = ruleFor('.section-lede');

    expect(textToken(title)).toBeGreaterThan(textToken(lede));
    expect(title).toMatch(/font-family:\s*var\(--font-heading\)/);
    expect(title).toMatch(/color:\s*var\(--color-neutral-900\)/);
    expect(lede).toMatch(/color:\s*var\(--color-neutral-600\)/);
  });

  it('renders the name as a heading a reader and a screen reader both find', () => {
    render(<SectionHead title="What reaches this console" lede="A push is what starts a run." />);

    expect(screen.getByRole('heading', { name: 'What reaches this console' })).toBeTruthy();
    expect(screen.getByText('A push is what starts a run.').tagName).toBe('P');
  });

  it('keeps its size when its level changes', () => {
    // An outline is not a type scale. A section nested one level deeper is still a section, and
    // shrinking the type to say so is how a heading ends up smaller than the text it heads.
    const { rerender, container } = render(<SectionHead title="Two" as="h2" />);
    expect(container.querySelector('h2')?.className).toContain('section-title');
    rerender(<SectionHead title="Four" as="h4" />);

    expect(container.querySelector('h4')?.className).toContain('section-title');
    expect(screen.getByRole('heading', { level: 4 })).toBeTruthy();
  });

  it('centres a section control against the title rather than hanging it off the top', () => {
    expect(ruleFor('.section-head-line')).toMatch(/align-items:\s*center/);
  });
});

describe('the heading voice', () => {
  it('is not the body voice with a heavier weight', () => {
    // Heading and body were both Inter at 500, so a heading was body text slightly bolder and
    // every scrap of hierarchy had to come from size — which leaves nothing at all for a heading
    // that has to be small.
    const heading = /--font-heading:\s*([^;]+);/.exec(RULES)?.[1] ?? '';
    const body = /--font-body:\s*([^;]+);/.exec(RULES)?.[1] ?? '';

    expect(heading).not.toBe(body);
    expect(heading).toContain('Source Serif');
  });

  it('loads every family it names', () => {
    // A family changed in the theme and not in the font import loads nothing and falls back to
    // `system-ui`, which looks like a rendering fault and reads as one.
    const imported = /fonts\.googleapis\.com[^']+/.exec(CSS)?.[0] ?? '';
    for (const token of ['--font-heading', '--font-body', '--font-mono']) {
      const family = (new RegExp(`${token}:\\s*"([^"]+)"`).exec(RULES)?.[1] ?? '').replace(/ /g, '+');
      expect(imported, `${token} is ${family}`).toContain(family);
    }
  });
});
