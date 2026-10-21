import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import {
  GridCell,
  GridHead,
  GridProgress,
  GridTable,
} from '../packages/ui/src/GridTable/GridTable.js';

/**
 * A table somebody writes into.
 *
 * `Table` presents rows a system already holds. This one is the other half: the rows exist, the
 * keys came out of the data, and what is missing is the facts only the business has. Nothing in a
 * file will ever carry them, so somebody keys them — two hundred rows at a sitting, which is the
 * number every decision here is made against.
 */

/** A grid of two columns over three rows, with the second column already half filled. */
function Grid({ onSet = () => {} }: { onSet?: (v: string) => void }) {
  return (
    <GridTable compact>
      <thead>
        <tr>
          <GridHead nowrap>Agency</GridHead>
          <GridHead owned>Territory</GridHead>
        </tr>
      </thead>
      <tbody>
        {['AG-114', 'AG-221', 'AG-307'].map((key, row) => (
          <tr key={key}>
            <td>{key}</td>
            <td>
              <GridCell
                aria-label={`Territory for ${key}`}
                at={{ row, column: 0 }}
                value={row === 0 ? 'Piedmont' : ''}
                options={['Piedmont', 'Tidewater']}
                onSet={onSet}
              />
            </td>
          </tr>
        ))}
      </tbody>
    </GridTable>
  );
}

describe('a table you write into', () => {
  /**
   * **Which columns somebody owes is the whole map of the work.** In twenty columns, a tint alone
   * leaves it to be guessed at, so the head says the words — and says them where a screen reader
   * reaches them rather than as a shade of grey.
   */
  it('says at the head which columns the business fills', () => {
    render(<Grid />);

    const owned = screen.getByRole('columnheader', { name: /Territory/ });
    expect(owned.hasAttribute('data-owned')).toBe(true);
    expect(owned.textContent).toContain('Yours to fill');
    expect(screen.getByRole('columnheader', { name: 'Agency' }).hasAttribute('data-owned')).toBe(
      false,
    );
  });

  /**
   * **A controller keying two hundred rows has a spreadsheet's keyboard in their hands.** Inventing
   * a gesture here costs a lesson for nothing, and the lesson is learned on the two-hundredth row.
   */
  it('goes down the column on Enter and on the down arrow', () => {
    render(<Grid />);
    const first = screen.getByLabelText('Territory for AG-114');
    const second = screen.getByLabelText('Territory for AG-221');
    first.focus();

    fireEvent.keyDown(first, { key: 'Enter' });
    expect(document.activeElement).toBe(second);

    fireEvent.keyDown(second, { key: 'ArrowDown' });
    expect(document.activeElement).toBe(screen.getByLabelText('Territory for AG-307'));

    fireEvent.keyDown(document.activeElement!, { key: 'ArrowUp' });
    expect(document.activeElement).toBe(second);
  });

  /** The cell above, repeated — the one gesture a spreadsheet has that a form does not. */
  it('repeats the cell above on the platform shortcut', () => {
    const onSet = vi.fn();
    render(<Grid onSet={onSet} />);
    const second = screen.getByLabelText('Territory for AG-221') as HTMLInputElement;

    fireEvent.keyDown(second, { key: 'd', metaKey: true });

    expect(second.value).toBe('Piedmont');
    expect(onSet).toHaveBeenCalledWith('Piedmont');
  });

  /**
   * **Written on the way out, not per keystroke.** A write per character is a request per
   * character, and a cell saving mid-word saves half a word — *Pied*, then *Piedm*, then a report
   * grouping by three territories that do not exist.
   */
  it('writes once the cell is left, and not while it is being typed', () => {
    const onSet = vi.fn();
    render(<Grid onSet={onSet} />);
    const cell = screen.getByLabelText('Territory for AG-221');

    fireEvent.change(cell, { target: { value: 'Tide' } });
    fireEvent.change(cell, { target: { value: 'Tidewater' } });
    expect(onSet).not.toHaveBeenCalled();

    fireEvent.blur(cell);
    expect(onSet).toHaveBeenCalledTimes(1);
    expect(onSet).toHaveBeenCalledWith('Tidewater');
  });

  /** And a cell left exactly as it was found is not a write at all. */
  it('writes nothing when the value is unchanged', () => {
    const onSet = vi.fn();
    render(<Grid onSet={onSet} />);

    fireEvent.blur(screen.getByLabelText('Territory for AG-114'));

    expect(onSet).not.toHaveBeenCalled();
  });

  /**
   * **One list per column, offered once.** A datalist per cell is two hundred copies of the same
   * twenty options; and a territory offered under *Manager* is a suggestion wrong by construction,
   * which is why the options belong to the column rather than to the table.
   */
  it('offers the column back once, from the column', () => {
    const { container } = render(<Grid />);

    const lists = container.querySelectorAll('datalist');
    expect(lists).toHaveLength(1);
    expect([...lists[0]!.querySelectorAll('option')].map((o) => o.value)).toEqual([
      'Piedmont',
      'Tidewater',
    ]);
    /* And every cell in the column reaches it, not only the one that drew it. */
    const cells = container.querySelectorAll<HTMLInputElement>('.grid-cell');
    expect(new Set([...cells].map((c) => c.getAttribute('list')))).toEqual(
      new Set([lists[0]!.id]),
    );
  });

  /**
   * **A grid of two hundred rows has no end in sight from inside it.** The scrollbar says how much
   * page is left rather than how much work, and the two stop agreeing the moment half the cells
   * are filled.
   */
  it('says how far the keying has got', () => {
    render(<GridProgress filled={3} of={6} />);

    const said = screen.getByRole('status');
    expect(said.textContent).toContain('3 of 6 cells');
    expect(said.textContent).toContain('50%');
  });

  it('marks the finish, which is the one figure worth a colour', () => {
    const { container } = render(<GridProgress filled={6} of={6} />);

    expect(container.querySelector('.grid-progress-share')?.getAttribute('data-done')).toBe('');
  });

  /** Nought of nought is not finished — it is a grid nobody has started. */
  it('does not call an empty grid done', () => {
    const { container } = render(<GridProgress filled={0} of={0} />);

    expect(container.querySelector('.grid-progress-share')?.getAttribute('data-done')).toBeNull();
  });
});
