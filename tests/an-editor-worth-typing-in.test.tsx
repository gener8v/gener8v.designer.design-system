import { describe, expect, it } from 'vitest';
import { useState } from 'react';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { render, screen, fireEvent } from '@testing-library/react';
import { CodeEditor } from '../packages/ui/src/index.js';
import { tokenize } from '../packages/ui/src/CodeBlock/highlight.js';

const CSS = readFileSync(join(__dirname, '..', 'design', 'styles.css'), 'utf8');
const RULES = CSS.replace(/\/\*[\s\S]*?\*\//g, '');

/** Every declaration that lands on a selector, merged in source order.
 *
 *  ONE RULE IS NOT THE QUESTION. The build expands `a, b { … }` into two rules, so a guard that
 *  looked up "the rule" found whichever came first and two assertions here passed against a rule
 *  they had not named. What matters is not that the two layers share a rule — it is that they end
 *  up with the SAME VALUE for every metric the caret depends on, however that is written.
 */
function declarationsFor(selector: string): Record<string, string> {
  const out: Record<string, string> = {};
  // A selector LIST can span lines — `a,\nb { … }` is one rule with two selectors, and a pattern
  // that stops at a newline never sees it.
  for (const m of RULES.matchAll(/([^{}]+)\{([^}]*)\}/g)) {
    const selectors = (m[1] ?? '').split(',').map((s) => s.trim());
    if (!selectors.includes(selector)) continue;
    for (const line of (m[2] ?? '').split(';')) {
      const [property, ...rest] = line.split(':');
      if (property?.trim() && rest.length) out[property.trim()] = rest.join(':').trim();
    }
  }
  return out;
}

/** An editor that keeps what it is given, so a spec can type into it. */
function Editing({ initial = '', ...rest }: { initial?: string; language?: string; wrap?: boolean }) {
  const [value, setValue] = useState(initial);
  return <CodeEditor label="Source" value={value} onChange={setValue} {...rest} />;
}

describe('an editor that shows the shape of what you are typing', () => {
  it('is a textarea, so the platform keeps doing everything it already does', () => {
    // The alternative is a contenteditable with its own document model — a text editor, a project
    // of its own, and a place where undo, IME composition, spellcheck and assistive technology
    // stop behaving the way the platform's do.
    render(<Editing initial="# Title" language="md" />);

    const field = screen.getByLabelText('Source');
    expect(field.tagName).toBe('TEXTAREA');
    fireEvent.change(field, { target: { value: '# Title\n\nmore' } });
    expect((field as HTMLTextAreaElement).value).toBe('# Title\n\nmore');
  });

  it('paints the same string underneath, and hides it from a screen reader', () => {
    // Both layers carry the text. A reader hearing both would hear the document twice.
    const { container } = render(<Editing initial="# Title" language="md" />);
    const paint = container.querySelector('.code-editor-paint');

    expect(paint?.getAttribute('aria-hidden')).toBe('true');
    expect(paint?.textContent).toContain('# Title');
    expect(container.querySelector('.tok-keyword')?.textContent).toBe('# Title');
  });

  it('agrees with itself on every metric the caret depends on', () => {
    // THE ONLY WAY THIS TECHNIQUE FAILS. The painted layer and the textarea decide where a glyph
    // lands from the same properties; the moment one differs the caret sits somewhere the letters
    // are not — and it fails invisibly until somebody types.
    const paint = declarationsFor('.code-editor-paint');
    const input = declarationsFor('.code-editor-input');

    for (const property of [
      'font-family',
      'font-size',
      'line-height',
      'padding',
      'tab-size',
      'white-space',
      'letter-spacing',
      'overflow-wrap',
      'word-break',
    ]) {
      expect(paint[property], `${property} is unset on the painted layer`).toBeTruthy();
      expect(input[property], `${property} disagrees between the two layers`).toBe(paint[property]);
    }
  });

  it('agrees when the lines wrap, too', () => {
    // Wrapping changes where every glyph after the first long line lands. One layer wrapping and
    // the other not is the same failure with a longer fuse.
    const paint = declarationsFor('.code-editor[data-wrap] .code-editor-paint');
    const input = declarationsFor('.code-editor[data-wrap] .code-editor-input');

    expect(paint['white-space']).toBe('pre-wrap');
    expect(input['white-space']).toBe(paint['white-space']);
    expect(input['overflow-wrap']).toBe(paint['overflow-wrap']);
  });

  it('keeps the caret visible while the text it types is not', () => {
    const input = declarationsFor('.code-editor-input');

    expect(input['color']).toBe('transparent');
    expect(input['caret-color'], 'a transparent caret is an editor nobody can use').toBeTruthy();
    expect(input['caret-color']).not.toBe('transparent');
  });

  it('numbers the lines, and stops numbering them when they wrap', () => {
    // A wrapped line occupies several visual rows and a number beside it can only point at one.
    // A gutter that lies about which line you are on is worse than no gutter.
    const { container, rerender } = render(<Editing initial={'one\ntwo\nthree'} />);
    expect(container.querySelectorAll('.code-editor-gutter span')).toHaveLength(3);

    rerender(<Editing initial={'one\ntwo\nthree'} wrap />);
    expect(container.querySelector('.code-editor-gutter')).toBeNull();
  });

  it('counts a line the moment it is typed, not on the next render', () => {
    const { container } = render(<Editing initial="one" />);
    fireEvent.change(screen.getByLabelText('Source'), { target: { value: 'one\ntwo' } });

    expect(container.querySelectorAll('.code-editor-gutter span')).toHaveLength(2);
  });

  it('renders plain for a language it does not know', () => {
    // A wrong highlight is worse than none.
    const { container } = render(<Editing initial="# Title" language="brainfuck" />);

    expect(container.querySelector('.tok-keyword')).toBeNull();
    expect(container.querySelector('.code-editor-paint')?.textContent).toContain('# Title');
  });
});

describe('markdown, which is what this product writes', () => {
  it('does not read a heading inside a fenced block', () => {
    // THE ONE MISTAKE that makes a highlighted markdown editor worse than a plain one. The fence
    // is matched whole and first, so everything inside it stays verbatim.
    const md = '# Real\n\n```ts\n# not a heading\n```\n';
    const headings = tokenize(md, 'md').filter((t) => t.kind === 'keyword');

    expect(headings.map((t) => t.text)).toEqual(['# Real']);
  });

  it('marks the furniture as furniture', () => {
    // A bullet, a quote, a rule, a table's pipes. Muted on purpose: a document whose bullets shout
    // reads as a document about bullets.
    const kinds = tokenize('- one\n> quoted\n\n| a | b |\n', 'md')
      .filter((t) => t.kind)
      .map((t) => t.kind);

    expect(new Set(kinds)).toEqual(new Set(['comment']));
  });

  it('picks out a link and what it points at', () => {
    const found = tokenize('see [the standard](http://x/y)', 'md').find((t) => t.kind === 'fn');

    expect(found?.text).toBe('[the standard](http://x/y)');
  });
});
