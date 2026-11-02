// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { Matrix } from '../packages/ui/src/index.js';
import type { MatrixCol, MatrixRow } from '../packages/ui/src/index.js';
import { expectNoA11yViolations } from './a11y.js';

afterEach(cleanup);

const rows: MatrixRow[] = [
  { id: 'a', label: 'AU-6' },
  { id: 'b', label: 'AC-2', flag: 'No owner' },
  { id: 'c', label: 'CM-3' },
];
const cols: MatrixCol[] = [{ id: 'u', label: 'Unit' }, { id: 'i', label: 'Integration' }];
const cell = (r: MatrixRow, c: MatrixCol) =>
  (r.id === 'a' || c.id === 'u') && r.id !== 'b' ? { mark: '●', tone: 'success' as const, title: `${r.id} by ${c.id}` } : null;

function setup(extra: Partial<React.ComponentProps<typeof Matrix>> = {}) {
  return render(<Matrix label="Coverage" rows={rows} cols={cols} cell={cell} {...extra} />);
}

describe('a grid of what covers what', () => {
  it('is a real table, with every cell under a row heading and a column heading', () => {
    setup();
    const table = screen.getByRole('table', { name: 'Coverage' });
    expect(within(table).getAllByRole('columnheader').map((h) => h.textContent)).toEqual(['Coverage', 'Unit', 'Integration']);
    expect(within(table).getAllByRole('rowheader').map((h) => h.textContent)).toEqual(['AU-6', 'AC-2No owner', 'CM-3']);
  });

  it('reads a cell in words, and an empty cell as empty — not as a dot', () => {
    setup({ emptyLabel: 'Not covered' });
    const cells = screen.getAllByRole('cell');
    expect(cells[0]).toHaveTextContent('a by u');
    expect(cells[0]!.querySelector('.matrix-mark')).toHaveAttribute('aria-hidden', 'true');
    expect(cells[2]).toHaveTextContent('Not covered'); // row b, col u
    expect(cells[2]).toHaveAttribute('data-empty');
  });

  it('is one Tab stop, and arrows move between cells', () => {
    setup();
    const focusable = screen.getByRole('table').querySelectorAll('[tabindex="0"]');
    expect(focusable).toHaveLength(1);
    const start = focusable[0] as HTMLElement;
    start.focus();
    fireEvent.keyDown(start, { key: 'ArrowRight' });
    expect(document.activeElement).toHaveAttribute('data-pos', '0:1');
    fireEvent.keyDown(document.activeElement!, { key: 'ArrowDown' });
    expect(document.activeElement).toHaveAttribute('data-pos', '1:1');
    fireEvent.keyDown(document.activeElement!, { key: 'End' });
    expect(document.activeElement).toHaveAttribute('data-pos', '1:2');
    fireEvent.keyDown(document.activeElement!, { key: 'End', ctrlKey: true });
    expect(document.activeElement).toHaveAttribute('data-pos', '2:2');
    // The roving stop follows focus, so Tab out and back lands where the reader left.
    expect(screen.getByRole('table').querySelectorAll('[tabindex="0"]')).toHaveLength(1);
  });

  it('opens a row from its label, and a cell with Enter', () => {
    const onRowOpen = vi.fn();
    const onCellOpen = vi.fn();
    setup({ onRowOpen, onCellOpen });
    fireEvent.click(screen.getByRole('button', { name: 'AC-2' }));
    expect(onRowOpen).toHaveBeenCalledWith(rows[1]);
    const first = screen.getByRole('button', { name: 'AU-6' });
    first.focus();
    fireEvent.keyDown(first, { key: 'ArrowRight' });
    fireEvent.keyDown(document.activeElement!, { key: 'Enter' });
    expect(onCellOpen).toHaveBeenCalledWith(rows[0], cols[0]);
  });

  it('counts the marks across and down', () => {
    setup({ rowTotals: true, colTotals: true });
    const foot = screen.getByRole('table').querySelector('tfoot')!;
    expect([...foot.querySelectorAll('td')].map((d) => d.textContent)).toEqual(['2', '1', '3']);
  });

  it('shows the cell in words on hover, for the eye only, and Escape dismisses it', () => {
    setup();
    const first = screen.getAllByRole('cell')[0]!;
    fireEvent.mouseEnter(first);
    const readout = document.querySelector('.matrix-readout')!;
    expect(readout).toHaveTextContent('a by u');
    expect(readout).toHaveAttribute('aria-hidden', 'true');
    first.focus();
    fireEvent.keyDown(first, { key: 'Escape' });
    expect(document.querySelector('.matrix-readout')).toBeNull();
  });

  it('scrolls in its own frame, pinned', () => {
    setup({ rotateHeaders: true });
    const table = screen.getByRole('table');
    expect(table.parentElement).toHaveClass('matrix-wrap');
    expect(table).toHaveAttribute('data-sticky');
    expect(table).toHaveAttribute('data-rotate');
  });

  it('passes axe', async () => {
    const { container } = render(<main><Matrix label="Coverage" rows={rows} cols={cols} cell={cell}
      onRowOpen={() => {}} rowTotals colTotals rotateHeaders /></main>);
    await expectNoA11yViolations(container);
  });
});
