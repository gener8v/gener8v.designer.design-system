import { describe, expect, it, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fireEvent, render, screen } from '@testing-library/react';
import { CodeEditor } from '../packages/ui/src/CodeEditor/CodeEditor.js';

const RULES = readFileSync(join(__dirname, '..', 'design', 'styles.css'), 'utf8');

function declarationsFor(selector: string): Record<string, string> {
  const out: Record<string, string> = {};
  const withoutComments = RULES.replace(/\/\*[\s\S]*?\*\//g, '');
  const stripped = withoutComments.replace(/@media[^{]*\{(?:[^{}]*\{[^{}]*\})*[^{}]*\}/g, '');
  for (const m of stripped.matchAll(/([^{}]+)\{([^}]*)\}/g)) {
    if (!(m[1] ?? '').split(',').map((s) => s.trim()).includes(selector)) continue;
    for (const line of (m[2] ?? '').split(';')) {
      const [property, ...rest] = line.split(':');
      if (property?.trim() && rest.length) out[property.trim()] = rest.join(':').trim();
    }
  }
  return out;
}

describe('a surface that fills the screen has a visible way out', () => {
  it('offers a control, not only a key', () => {
    // The rule was stated in this component's own source and then not kept: `Escape` was the whole
    // exit, so leaving depended on knowing a convention AND on having a keyboard. A pointer user
    // who opened it had no way back to the page at all.
    const leave = vi.fn();
    render(<CodeEditor value="x" onChange={() => {}} label="Source" full onLeaveFull={leave} />);
    const done = screen.getByRole('button', { name: /done/i });
    fireEvent.click(done);
    expect(leave).toHaveBeenCalledTimes(1);
  });

  it('names the key on the control', () => {
    // The reader who WILL use the key is the one who is in here all day, and they should not have
    // to reach for the mouse to discover it exists.
    render(<CodeEditor value="x" onChange={() => {}} label="Source" full onLeaveFull={() => {}} />);
    expect(screen.getByRole('button', { name: /done/i }).textContent).toMatch(/Esc/);
  });

  it('shows no way out when there is nothing to leave', () => {
    render(<CodeEditor value="x" onChange={() => {}} label="Source" />);
    expect(screen.queryByRole('button', { name: /done/i })).toBeNull();
  });

  it('escape still leaves', () => {
    const leave = vi.fn();
    const { container } = render(
      <CodeEditor value="x" onChange={() => {}} label="Source" full onLeaveFull={leave} />,
    );
    fireEvent.keyDown(container.querySelector('.code-editor')!, { key: 'Escape' });
    expect(leave).toHaveBeenCalledTimes(1);
  });

  it('sits on the surface it leaves, not in the page behind it', () => {
    const control = declarationsFor('.code-editor-leave');
    expect(control.position).toBe('absolute');
    // `[data-full]` is `position: fixed`, which is a containing block — so the control pins to the
    // full-screen surface. Without the fixed ancestor it would scroll away with the page.
    expect(declarationsFor('.code-editor[data-full]').position).toBe('fixed');
  });
});

describe('a folded rail is an icon rail', () => {
  it('keeps the destinations', () => {
    // Hiding the sections traded eleven destinations for a blank strip, so the only way to reach
    // any of them was to unfold again. A reader who folds wants their page wider, not their
    // navigation gone.
    const section = declarationsFor('.sidebar[data-narrow] .sidebar-section');
    expect(section.display, 'folding hides the destinations outright').not.toBe('none');
  });

  it('drops the words and keeps the marks', () => {
    const item = declarationsFor('.sidebar[data-narrow] .sidebar-item');
    expect(item['font-size']).toBe('0');
    const icon = declarationsFor('.sidebar[data-narrow] .sidebar-item svg');
    expect(icon['inline-size'], 'the mark collapses with the label').toBeTruthy();
    expect(icon['inline-size']).not.toBe('0');
  });

  it('keeps the accessible name in the document', () => {
    // `font-size: 0` collapses the label WITHOUT removing it, so a screen reader still reads
    // "Deliverables". `display: none` on the text would have taken the name with it.
    const item = declarationsFor('.sidebar[data-narrow] .sidebar-item');
    expect(item.display).toBeUndefined();
    expect(item.visibility).toBeUndefined();
  });

  it('drops a heading that would have no words left', () => {
    expect(declarationsFor('.sidebar[data-narrow] .sidebar-group').display).toBe('none');
  });

  it('centres what is left', () => {
    expect(declarationsFor('.sidebar[data-narrow] .sidebar-item')['justify-content']).toBe('center');
  });
});
