// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render } from '@testing-library/react';
import { Diff, diff } from '../packages/ui/src/index.js';
import { expectNoA11yViolations } from './a11y.js';

afterEach(cleanup);

const join = (ops: { type: string; text: string }[], keep: string) =>
  ops.filter((o) => o.type === 'equal' || o.type === keep).map((o) => o.text).join('');

describe('the diff itself', () => {
  it('gives back both texts exactly', () => {
    const a = 'Access reviews are performed quarterly by the system owner.';
    const b = 'Access reviews are performed monthly by the security lead, and logged.';
    const ops = diff(a, b);
    expect(join(ops, 'removed')).toBe(a);
    expect(join(ops, 'added')).toBe(b);
  });

  it('reports a one-word change as one word', () => {
    expect(diff('reviewed quarterly by the owner', 'reviewed monthly by the owner')).toEqual([
      { type: 'equal', text: 'reviewed ' },
      { type: 'removed', text: 'quarterly' },
      { type: 'added', text: 'monthly' },
      { type: 'equal', text: ' by the owner' },
    ]);
  });

  it('reads neighbouring changed words as one change, not four marks', () => {
    const ops = diff('by the system owner today', 'by a security lead today');
    expect(ops.filter((o) => o.type !== 'equal')).toEqual([
      { type: 'removed', text: 'the system owner' },
      { type: 'added', text: 'a security lead' },
    ]);
  });

  it('works by line', () => {
    const ops = diff('a\nb\nc', 'a\nB\nc\nd', 'line');
    expect(ops[0]).toEqual({ type: 'equal', text: 'a\n' });
    expect(ops).toContainEqual({ type: 'removed', text: 'b\n' });
    expect(ops).toContainEqual({ type: 'added', text: 'B\n' });
    // Every line carries its newline in line mode, the last included.
    expect(join(ops, 'removed')).toBe('a\nb\nc\n');
    expect(join(ops, 'added')).toBe('a\nB\nc\nd\n');
    // Appending a line leaves the line above it alone.
    expect(ops).toContainEqual({ type: 'equal', text: 'c\n' });
  });

  it('handles empty sides', () => {
    expect(diff('', 'new')).toEqual([{ type: 'added', text: 'new' }]);
    expect(diff('old', '')).toEqual([{ type: 'removed', text: 'old' }]);
    expect(diff('', '')).toEqual([]);
  });
});

describe('a change you can read', () => {
  it('marks with the elements whose meaning this is, and says so in words', () => {
    const { container } = render(<Diff before="reviewed quarterly" after="reviewed monthly" />);
    const del = container.querySelector('del.diff-del')!;
    const ins = container.querySelector('ins.diff-ins')!;
    expect(del).toHaveTextContent('Removed: quarterly');
    expect(ins).toHaveTextContent('Added: monthly');
    expect(del.querySelector('.sr-only')).toBeTruthy();
  });

  it('sets the two versions side by side, each holding only its own words', () => {
    const { container } = render(<Diff mode="split" before="reviewed quarterly" after="reviewed monthly"
      labels={{ before: 'Was', after: 'Now' }} />);
    const panes = container.querySelectorAll('.diff-pane');
    expect(panes).toHaveLength(2);
    expect(panes[0]).toHaveTextContent('Was');
    expect(panes[0]!.querySelector('ins')).toBeNull();
    expect(panes[1]!.querySelector('del')).toBeNull();
    expect(panes[1]).toHaveTextContent('Now');
  });

  it('gives each changed line a sign in the gutter, not only a tint', () => {
    const { container } = render(<Diff granularity="line" before={'a\nb'} after={'a\nc'} />);
    const lines = [...container.querySelectorAll('.diff-line')];
    expect(lines.map((l) => l.getAttribute('data-change'))).toEqual([null, 'removed', 'added']);
    expect(lines.map((l) => l.querySelector('.diff-sign')!.textContent)).toEqual(['', '−', '+']);
  });

  it('passes axe', async () => {
    const { container } = render(<main>
      <Diff before="reviewed quarterly by the owner" after="reviewed monthly by the lead" />
      <Diff mode="split" granularity="line" before={'a\nb'} after={'a\nc'} />
    </main>);
    await expectNoA11yViolations(container);
  });
});
