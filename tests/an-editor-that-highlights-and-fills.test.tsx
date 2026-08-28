import { describe, expect, it, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { render, screen, fireEvent } from '@testing-library/react';
import { CodeEditor } from '../packages/ui/src/CodeEditor/CodeEditor.js';

const RULES = readFileSync(join(__dirname, '..', 'design', 'styles.css'), 'utf8');

const MARKDOWN = ['# A heading', '', '**Document:** SOX-0a', '', '| Source | Role |'].join('\n');

describe('an editor that highlights, and can fill the window', () => {
  it('paints the tokens it produces', () => {
    // THE BUG THIS EXISTS FOR. Every token colour was scoped to `.code`, and this component
    // paints into `.code-editor-paint` — so it tokenized correctly, produced the right spans, and
    // painted every one of them the same colour. A markdown standard opened for editing showed
    // headings, bold, tables and rules as undifferentiated grey, which reads as an editor that
    // does not highlight rather than as a stylesheet that missed a selector.
    for (const kind of ['comment', 'string', 'keyword', 'number', 'fn']) {
      expect(RULES, `.tok-${kind} is unpainted inside the editor`).toContain(
        `.code-editor-paint .tok-${kind}`,
      );
    }
  });

  it('actually emits those classes for markdown', () => {
    // The stylesheet half is worthless if nothing carries the class. A heading and a table are
    // the two a governed standard is mostly made of.
    const { container } = render(
      <CodeEditor value={MARKDOWN} onChange={() => {}} label="src" language="md" />,
    );
    const painted = container.querySelector('.code-editor-paint')!;
    expect(painted.querySelector('.tok-keyword')).not.toBeNull();
    expect(painted.querySelector('.tok-comment')).not.toBeNull();
  });

  it('fills the window when asked, and not before', () => {
    const { container, rerender } = render(
      <CodeEditor value="x" onChange={() => {}} label="src" />,
    );
    expect(container.querySelector('[data-full]')).toBeNull();

    rerender(<CodeEditor value="x" onChange={() => {}} label="src" full onLeaveFull={() => {}} />);
    expect(container.querySelector('[data-full]')).not.toBeNull();
  });

  it('takes the screen from wherever it is mounted', () => {
    // `position: fixed` rather than a class on some ancestor, so a consumer does not have to
    // restructure its layout to offer this.
    const block = RULES.slice(RULES.indexOf('.code-editor[data-full]'));
    expect(block.slice(0, 200)).toContain('position: fixed');
  });

  it('lets a keyboard out of it', () => {
    // A surface that fills the screen with no visible way out is a trap, and the keyboard is the
    // first place somebody looks for one.
    const left = vi.fn();
    render(<CodeEditor value="x" onChange={() => {}} label="src" full onLeaveFull={left} />);
    fireEvent.keyDown(screen.getByLabelText('src'), { key: 'Escape' });
    expect(left).toHaveBeenCalled();
  });

  it('does not swallow Escape when it is not filling the window', () => {
    // A dialog containing an ordinary editor still has to close on Escape.
    const left = vi.fn();
    render(<CodeEditor value="x" onChange={() => {}} label="src" onLeaveFull={left} />);
    fireEvent.keyDown(screen.getByLabelText('src'), { key: 'Escape' });
    expect(left).not.toHaveBeenCalled();
  });
});
