import { describe, expect, it, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fireEvent, render } from '@testing-library/react';
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

/**
 * `rows` was set on the textarea and meant nothing.
 *
 * The GUTTER renders one element per line, and the frame stretched to fit it. On a nine-hundred-line
 * standard that made the editor 9,379px tall — measured on the live console — so every control
 * below it (save, cancel, the way into full screen) sat nine thousand pixels down a scrolling page,
 * reachable only by scrolling through the whole document first.
 */
describe('an editor that stays the size it said', () => {
  it('states a height rather than growing to its content', () => {
    const frame = declarationsFor('.code-editor-frame');
    expect(frame['block-size'], 'the frame takes its height from the gutter again').toBeTruthy();
    expect(frame['block-size']).toContain('--editor-rows');
  });

  it('computes it from the metrics both layers are locked to', () => {
    // Not a magic pixel count: the paint and the textarea share every metric that decides where a
    // glyph lands, and a height derived from anything else drifts away from them.
    const frame = declarationsFor('.code-editor-frame')['block-size'] ?? '';
    for (const token of ['--editor-size', '--editor-leading', '--editor-pad']) {
      expect(frame, `the height ignores ${token}`).toContain(token);
    }
  });

  it('puts the row count where CSS can read it', () => {
    const { container } = render(
      <CodeEditor value={'a\n'.repeat(400)} onChange={() => {}} label="Source" rows={28} />,
    );
    const editor = container.querySelector('.code-editor') as HTMLElement;
    expect(editor.style.getPropertyValue('--editor-rows')).toBe('28');
  });

  it('still fills the window when asked', () => {
    // The stated height must not win over full screen — which is the one case where the frame
    // genuinely should grow to whatever is left after the label and the actions.
    expect(declarationsFor('.code-editor[data-full] .code-editor-frame')['block-size']).toBe('100%');
  });

  it('keeps the gutter from pushing the frame open', () => {
    // One element per line, and it scrolls with the textarea. Without this it is the tallest child
    // of a stretch row and the height above is decoration.
    expect(declarationsFor('.code-editor-gutter').overflow).toBe('hidden');
  });
});

describe('the key the corner advertises', () => {
  it('takes the focus when it fills the window', () => {
    // `Escape` is handled ON the editor, so it only fires when focus is inside it — and the control
    // that opens full screen is a button in the page BEHIND the overlay, which leaves focus on
    // `<body>`. Measured on the live console: the corner said "Done  Esc", Esc was pressed, and
    // nothing happened. The component promising a way out was the one breaking the promise.
    const { container } = render(
      <CodeEditor value="x" onChange={() => {}} label="Source" full onLeaveFull={() => {}} />,
    );
    expect(document.activeElement).toBe(container.querySelector('.code-editor-input'));
  });

  it('does not steal the focus when it is an ordinary field', () => {
    // A form with an editor in it must not jump the caret into the editor on mount, over whatever
    // the reader was actually filling in.
    const { container } = render(<CodeEditor value="x" onChange={() => {}} label="Source" />);
    expect(document.activeElement).not.toBe(container.querySelector('.code-editor-input'));
  });

  it('leaves on escape once the focus is there', () => {
    const leave = vi.fn();
    const { container } = render(
      <CodeEditor value="x" onChange={() => {}} label="Source" full onLeaveFull={leave} />,
    );
    fireEvent.keyDown(container.querySelector('.code-editor-input')!, { key: 'Escape' });
    expect(leave).toHaveBeenCalledTimes(1);
  });
});
