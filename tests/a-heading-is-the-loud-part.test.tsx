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
  it('carries hierarchy in size and weight, not in a second family', () => {
    // A serif for headings was tried and taken back out: a product that reads as one thing does
    // not need two voices, and the problem it was reaching for was never a family problem.
    //
    // What was missing was a SIZE. `h2` is 36px — a page heading — so the name of a section had
    // nowhere to go, and every surface filled the gap with an 11px mono label. `SectionHead` is
    // that size, and 600 is what makes it read as a heading beside 400 body text.
    const heading = /--font-heading:\s*([^;]+);/.exec(RULES)?.[1] ?? '';
    const body = /--font-body:\s*([^;]+);/.exec(RULES)?.[1] ?? '';
    const weight = Number(/--font-heading-weight:\s*(\d+)/.exec(RULES)?.[1] ?? 0);

    expect(heading).toBe(body);
    expect(weight).toBeGreaterThan(400);
  });

  it('loads every family it names, once', () => {
    // A family changed in the theme and not in the font import loads nothing and falls back to
    // `system-ui`, which looks like a rendering fault and reads as one. And heading and body being
    // the same family must not ask Google for it twice.
    const imported = /fonts\.googleapis\.com[^']+/.exec(CSS)?.[0] ?? '';
    const asked = [...imported.matchAll(/family=([^:&]+)/g)].map((m) => m[1]);

    for (const token of ['--font-heading', '--font-body', '--font-mono']) {
      const family = (new RegExp(`${token}:\\s*"([^"]+)"`).exec(RULES)?.[1] ?? '').replace(/ /g, '+');
      expect(asked, `${token} is ${family}`).toContain(family);
    }
    expect(asked.length, `asked twice for the same family: ${asked.join(', ')}`).toBe(
      new Set(asked).size,
    );
  });
});

describe('a section marker', () => {
  it('is in the body family, not a third typeface', () => {
    // `.label` was mono — the capability-statement voice carried over from the marketing site. In
    // a product it put a third typeface on every surface for text that is not technical:
    // "GOVERNANCE" over a nav group is a category, not an identifier.
    const label = ruleFor('.label');

    expect(label).toMatch(/font-family:\s*var\(--font-body\)/);
    // Mono stays where the fixed width does work.
    expect(ruleFor('.mono')).toMatch(/font-family:\s*var\(--font-mono\)/);
  });

  it('is ruled off from what it heads', () => {
    // A marker with nothing under it floats; the rule is what makes it read as heading the block
    // below rather than as a stray line. The document rails did it by hand, on two surfaces.
    expect(ruleFor('.label')).toMatch(/border-block-end:\s*1px solid/);
    // And the version for a marker INSIDE a row is not ruled, because there is no block under it.
    expect(ruleFor('.label-bare')).not.toMatch(/border-block-end/);
  });
});

describe('a figure beside a page name', () => {
  it('does not out-shout the name it sits next to', () => {
    // A row of four `--text-3xl` figures beside a 36px `h1` is two headlines — and four zeros at
    // 30px is a masthead announcing that nothing has happened.
    const stat = /--text-([\w]+)\)/.exec(ruleFor('.stat-value'))?.[1] ?? '';
    const px = (name: string) => Number(new RegExp(`--text-${name}:\\s*(\\d+)px`).exec(RULES)?.[1] ?? 0);

    expect(px(stat)).toBeLessThan(px('4xl'));
    expect(px(stat)).toBeGreaterThan(px('base'));
  });

  it('labels its figure in the body family', () => {
    expect(ruleFor('.stat-label')).toMatch(/font-family:\s*var\(--font-body\)/);
  });
});
