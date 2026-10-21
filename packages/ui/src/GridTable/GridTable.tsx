import { createContext, forwardRef, useContext, useEffect, useId, useRef, useState } from 'react';
import type { InputHTMLAttributes, TableHTMLAttributes, ThHTMLAttributes } from 'react';
import { cx } from '../cx.js';

/**
 * The grid's own id, so a column's options are one list rather than one per cell.
 *
 * **Found by driving it.** With `useId` inside the cell, every cell minted an id of its own and
 * only the first row rendered a `datalist` — so the type-ahead worked on row one and silently did
 * nothing on the other hundred and ninety-nine, which is the row count the whole component exists
 * for. The list belongs to the column, so its id has to come from something the column shares.
 *
 * Empty outside a `GridTable`, which falls back to the cell's own id: a lone `GridCell` has no
 * column to share with, and one list for one cell is correct there.
 */
const GridId = createContext('');

/**
 * A TABLE SOMEBODY WRITES INTO, NOT ONE THEY READ.
 *
 * `Table` presents rows a system already holds. This one is the other half: the rows exist, the
 * keys are known, and what is missing is the facts only the business has — an agency's territory,
 * a cost centre's owner, a code's name. Nothing in a file will ever carry them, so somebody keys
 * them, two hundred rows at a sitting.
 *
 * **It is one component, not two.** The grid and the keying surface were proposed separately and
 * are the same artefact seen twice: the keys down the left are what makes it a grid rather than a
 * form, and the typing is what makes it a grid rather than a table.
 *
 * ## What this has that `Table` cannot
 *
 * - **Owned columns are marked at the head.** A column the business fills reads differently from
 *   one a source sends, and in a grid of twenty columns that distinction is the whole map of who
 *   has to do what.
 * - **A spreadsheet's keyboard.** `Enter` and `↓` go down the column, `↑` goes up, `⌘D` repeats
 *   the cell above. Inventing a gesture here costs a lesson for nothing, and the lesson is
 *   learned on the two-hundredth row.
 * - **Type-ahead from the column itself**, so one territory cannot acquire three spellings. Built
 *   per column rather than per table: a territory offered under *Manager* is a suggestion wrong
 *   by construction.
 * - **Written on the way out.** A write per keystroke is a request per character, and a cell
 *   saving mid-word saves half a word.
 */
export interface GridTableProps extends TableHTMLAttributes<HTMLTableElement> {
  /** Tighter rows, as `Table` means it. */
  compact?: boolean;
}

export const GridTable = forwardRef<HTMLTableElement, GridTableProps>(function GridTable(
  { compact = false, className, children, ...rest }, ref,
) {
  const id = useId();
  return (
    <GridId.Provider value={id}>
      <table {...rest} ref={ref}
        className={cx('table', 'grid-table', compact && 'table-compact', className)}>
        {children}
      </table>
    </GridId.Provider>
  );
});

export interface GridHeadProps extends ThHTMLAttributes<HTMLTableCellElement> {
  /**
   * The business fills this column; no source sends it.
   *
   * Marked rather than merely styled, so the distinction survives a copy into a spreadsheet and
   * reaches a screen reader as the word rather than as a shade of grey.
   */
  owned?: boolean;
  nowrap?: boolean;
}

/** A column heading that says who fills the column. */
export const GridHead = forwardRef<HTMLTableCellElement, GridHeadProps>(function GridHead(
  { owned, nowrap, scope = 'col', children, ...rest }, ref,
) {
  return (
    <th {...rest} ref={ref} scope={scope} data-owned={owned || undefined}
      data-nowrap={nowrap || undefined}>
      {children}
      {owned ? <span className="grid-head-owned">Yours to fill</span> : null}
    </th>
  );
});

export interface GridCellProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange' | 'list'> {
  value: string;
  /** Names the cell, because *Territory* on two hundred rows names nothing. */
  'aria-label': string;
  /** Where the cell sits, so the keyboard knows which cell is below it. */
  at: { row: number; column: number };
  /** What the column already holds, offered back as somebody types. */
  options?: string[];
  /** Called on the way out, with the value as it stands. */
  onSet: (value: string) => void;
}

/**
 * One cell, typed the way a spreadsheet is typed.
 *
 * The cells find each other through `data-cell` rather than through refs held by the table,
 * because the grid is often virtualised or paged by its consumer and a ref map would be a second
 * copy of the layout that drifts the first time a row moves.
 */
export function GridCell({ value, at, options, onSet, className, ...rest }: GridCellProps) {
  const [draft, setDraft] = useState(value);
  const own = useId();
  const grid = useContext(GridId);
  /* Per column, so every cell in it reaches the one list the first row drew. */
  const list = grid === '' ? own : `${grid}-${at.column}`;
  const held = useRef(value);

  /* The value as the server last confirmed it. A cell whose row reloads under a reader keeps what
     they are typing; one whose value genuinely changed takes the new one. */
  useEffect(() => {
    if (value !== held.current) {
      held.current = value;
      setDraft(value);
    }
  }, [value]);

  const move = (to: number) => {
    const next = document.querySelector<HTMLInputElement>(`[data-cell="${to}-${at.column}"]`);
    if (next) {
      next.focus();
      next.select();
    }
  };

  return (
    <>
      <input
        {...rest}
        className={cx('grid-cell', className)}
        data-cell={`${at.row}-${at.column}`}
        list={options && options.length > 0 ? list : undefined}
        value={draft}
        onChange={(e) => setDraft(e.currentTarget.value)}
        onBlur={(e) => {
          if (draft !== value) onSet(draft);
          rest.onBlur?.(e);
        }}
        onKeyDown={(e) => {
          rest.onKeyDown?.(e);
          if (e.defaultPrevented) return;
          if (e.key === 'Enter' || e.key === 'ArrowDown') {
            e.preventDefault();
            if (draft !== value) onSet(draft);
            move(at.row + 1);
          } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            if (draft !== value) onSet(draft);
            move(at.row - 1);
          } else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'd') {
            e.preventDefault();
            const above = document.querySelector<HTMLInputElement>(
              `[data-cell="${at.row - 1}-${at.column}"]`,
            );
            if (above && above.value !== '') {
              setDraft(above.value);
              onSet(above.value);
            }
          }
        }}
      />
      {/* One list per column, and only once: a datalist per cell is two hundred copies of the
          same twenty options, which is the memory of the page spent on nothing. */}
      {at.row === 0 && options && options.length > 0 ? (
        <datalist id={list}>
          {options.map((o) => <option key={o} value={o} />)}
        </datalist>
      ) : null}
    </>
  );
}

export interface GridProgressProps {
  /** Cells with a value in them. */
  filled: number;
  /** Cells there are to fill. */
  of: number;
  /** What a cell is, for the sentence. Defaults to the neutral word. */
  said?: string;
}

/**
 * How far the keying has got, on the grid's own edge.
 *
 * **A grid of two hundred rows has no end in sight from inside it.** The scrollbar says how much
 * page is left and not how much work, and the two are different numbers once half the cells are
 * already filled. Stated rather than drawn as a bar: the figure is the thing somebody reports to
 * whoever asked for the table.
 */
export function GridProgress({ filled, of, said = 'cells' }: GridProgressProps) {
  const share = of === 0 ? 0 : Math.round((filled / of) * 100);
  return (
    <p className="grid-progress" role="status">
      <strong>{filled.toLocaleString()}</strong> of {of.toLocaleString()} {said}
      <span className="grid-progress-share" data-done={filled === of && of > 0 ? '' : undefined}>
        {share}%
      </span>
    </p>
  );
}
