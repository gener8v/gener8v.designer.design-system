import { describe, expect, it, beforeAll } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { render } from '@testing-library/react';
import { Checklist, ChecklistItem, DocPreview, DocPreviewBody, Reader } from '../packages/ui/src/index.js';

/**
 * jsdom resolves a literal from a stylesheet — `display`, `text-decoration`, a percentage height —
 * even though it lays nothing out. It does NOT resolve custom properties, so anything token-valued
 * is asserted as "which rule applies" rather than as a measurement.
 */
beforeAll(() => {
  const style = document.createElement('style');
  style.textContent = readFileSync(join(__dirname, '..', 'design', 'styles.css'), 'utf8');
  document.head.appendChild(style);
});

describe('a document preview', () => {
  it('asks for the height its scrolling body depends on', () => {
    // `.doc-preview-body` is `flex: 1; overflow: auto`, which only means something inside a
    // height-bounded box. The component never asked for one, so in a fixed-height pane it grew
    // past it and the next thing on the page started underneath it.
    const { container } = render(<DocPreview><DocPreviewBody>x</DocPreviewBody></DocPreview>);

    expect(getComputedStyle(container.querySelector('.doc-preview')!).blockSize).toBe('100%');
  });
});

describe('a reader', () => {
  it('sets its own h1 rather than sending a consumer to the base scale', () => {
    // Without one, a document title reaches for 48px display type above 24px section headings and
    // 16px prose — two scales meeting inside one document.
    const { container } = render(<Reader><h1>Title</h1></Reader>);

    expect(getComputedStyle(container.querySelector('h1')!).fontSize).toMatch(/var\(--text-3xl\)|30px/);
  });
});

describe('a checklist', () => {
  const list = (purpose?: 'tasks' | 'manifest') =>
    render(
      <Checklist {...(purpose ? { purpose } : {})}>
        <ChecklistItem defaultChecked>Evidence attached</ChecklistItem>
      </Checklist>,
    ).container;

  it('strikes a done item through, because that is what done looks like', () => {
    expect(getComputedStyle(list().querySelector('.checklist-text')!).textDecoration)
      .toMatch(/line-through/);
  });

  it('leaves a manifest item alone, because a tick there means "about to be written"', () => {
    // Same control, opposite meaning. Struck-through-and-quiet made the captured items read as
    // cancelled and left the one still MISSING as the most legible thing in the dialog.
    expect(getComputedStyle(list('manifest').querySelector('.checklist-text')!).textDecoration)
      .not.toMatch(/line-through/);
  });
});
