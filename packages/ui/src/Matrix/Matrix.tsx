import { forwardRef, useMemo, useRef, useState } from 'react';
import type { HTMLAttributes, KeyboardEvent, ReactNode } from 'react';
import { cx } from '../cx.js';
import { useAnchoredPosition } from '../useAnchoredPosition.js';

export type MatrixTone = 'neutral' | 'accent' | 'success' | 'warning' | 'danger';

export interface MatrixRow {
  id: string;
  label: ReactNode;
  /** A short note beside the label — "No owner", "Retired" — for a row that needs a second look. */
  flag?: ReactNode;
}

export interface MatrixCol {
  id: string;
  label: ReactNode;
}

export interface MatrixCell {
  /** What sits in the cell: a glyph, a figure, a short code. Absent ⇒ the cell is empty. */
  mark?: ReactNode;
  /** A tint behind the mark. Never the only signal — the mark has to differ too. */
  tone?: MatrixTone;
  /**
   * What the cell means in words — "Covered by 3 tests". Read by assistive tech in place of the
   * mark, and shown in a readout when the cell is hovered or focused.
   */
  title?: string;
}

export interface MatrixProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  /** Names the table. Required: a grid of marks with no name is a grid of marks. */
  label: string;
  rows: MatrixRow[];
  cols: MatrixCol[];
  /** Called once per cell. Return `null` for an empty cell. */
  cell: (row: MatrixRow, col: MatrixCol) => MatrixCell | null | undefined;
  /** The top-left heading, over the row labels. Defaults to `label`, visually hidden. */
  corner?: ReactNode;
  /** Makes each row label a button that opens the row. */
  onRowOpen?: (row: MatrixRow) => void;
  /** Enter, Space or a click on a cell. */
  onCellOpen?: (row: MatrixRow, col: MatrixCol) => void;
  /** Sets column headings on their side, for many narrow columns. */
  rotateHeaders?: boolean;
  /** Pins the column headings and the row labels while the grid scrolls. On by default. */
  sticky?: boolean;
  /** Drawn in an empty cell. */
  emptyMark?: ReactNode;
  /** Read in an empty cell by assistive tech. */
  emptyLabel?: string;
  /** A column counting the marked cells in each row. */
  rowTotals?: boolean;
  /** A row counting the marked cells in each column. */
  colTotals?: boolean;
  totalLabel?: string;
}

const marked = (c: MatrixCell | null | undefined) =>
  c != null && c.mark !== undefined && c.mark !== null && c.mark !== false;

function Readout({ anchor, text }: { anchor: HTMLElement; text: string }) {
  const anchorRef = useRef<HTMLElement | null>(anchor);
  anchorRef.current = anchor;
  const floatingRef = useRef<HTMLDivElement | null>(null);
  const { style } = useAnchoredPosition({ open: true, anchorRef, floatingRef, placement: 'top', align: 'center' });
  // aria-hidden: the same words are already inside the cell for assistive tech. This is for eyes.
  return <div ref={floatingRef} aria-hidden="true" style={style} className="tooltip matrix-readout">{text}</div>;
}

/**
 * Which things cover which — requirements against tests, controls against systems, people against
 * engagements. Presence and absence on a grid, read across a row and down a column.
 *
 * A real `<table>`: column headings are `th scope="col"`, row labels `th scope="row"`, so a screen
 * reader announces both headings with every cell. The cells are ONE Tab stop — arrows move,
 * Home/End go to the ends of a row, Ctrl+Home/End to the corners, Enter or Space opens — because a
 * grid of sixty requirements by twelve tests is 720 Tab presses otherwise.
 *
 * It scrolls inside its own frame, never the page, with the headings and the row labels pinned —
 * which is what makes it usable on a phone, where the grid is always wider than the screen.
 */
export const Matrix = forwardRef<HTMLDivElement, MatrixProps>(function Matrix(
  {
    label, rows, cols, cell, corner, onRowOpen, onCellOpen, rotateHeaders = false, sticky = true,
    emptyMark = '·', emptyLabel = 'None', rowTotals = false, colTotals = false, totalLabel = 'Total',
    className, ...rest
  }, ref,
) {
  const grid = useMemo(() => rows.map((r) => cols.map((c) => cell(r, c) ?? null)), [rows, cols, cell]);
  const [active, setActive] = useState<[number, number]>([0, 0]);
  const [tip, setTip] = useState<{ el: HTMLElement; text: string; key: string } | null>(null);
  const bodyRef = useRef<HTMLTableSectionElement | null>(null);

  const lastRow = rows.length - 1;
  const lastCol = cols.length; // column 0 is the row label
  const [ar, ac] = [Math.min(active[0], lastRow), Math.min(active[1], lastCol)];

  const move = (r: number, c: number) => {
    const next: [number, number] = [Math.max(0, Math.min(lastRow, r)), Math.max(0, Math.min(lastCol, c))];
    setActive(next);
    bodyRef.current?.querySelector<HTMLElement>(`[data-pos="${next[0]}:${next[1]}"]`)?.focus();
  };

  const onKeyDown = (e: KeyboardEvent<HTMLTableSectionElement>) => {
    // The readout covers neighbouring cells, so it has to be dismissable without moving (WCAG 1.4.13).
    if (e.key === 'Escape') { hide(); return; }
    const pos = (e.target as HTMLElement).closest<HTMLElement>('[data-pos]')?.dataset.pos;
    if (!pos) return;
    const [r, c] = pos.split(':').map(Number) as [number, number];
    const k = e.key;
    if (k === 'ArrowRight') move(r, c + 1);
    else if (k === 'ArrowLeft') move(r, c - 1);
    else if (k === 'ArrowDown') move(r + 1, c);
    else if (k === 'ArrowUp') move(r - 1, c);
    else if (k === 'Home') (e.ctrlKey ? move(0, 0) : move(r, 0));
    else if (k === 'End') (e.ctrlKey ? move(lastRow, lastCol) : move(r, lastCol));
    else if (k === 'PageDown') move(r + 10, c);
    else if (k === 'PageUp') move(r - 10, c);
    else if ((k === 'Enter' || k === ' ') && c > 0 && onCellOpen) onCellOpen(rows[r]!, cols[c - 1]!);
    else return;
    e.preventDefault();
  };

  const show = (el: HTMLElement, text: string | undefined, key: string) => setTip(text ? { el, text, key } : null);
  const hide = () => setTip(null);
  const stop = (r: number, c: number) => (r === ar && c === ac ? 0 : -1);

  const colCounts = cols.map((_, j) => grid.reduce((n, row) => n + (marked(row[j]) ? 1 : 0), 0));
  const rowCounts = grid.map((row) => row.reduce((n, x) => n + (marked(x) ? 1 : 0), 0));

  return (
    <div {...rest} ref={ref} className={cx('matrix-wrap', className)}>
      <table aria-label={label} data-rotate={rotateHeaders || undefined} data-sticky={sticky || undefined}
        className="matrix">
        <thead>
          <tr>
            <th scope="col" className="matrix-corner">
              {corner ?? <span className="sr-only">{label}</span>}
            </th>
            {cols.map((c) => (
              <th key={c.id} scope="col" className="matrix-col"><span className="matrix-col-label">{c.label}</span></th>
            ))}
            {rowTotals ? <th scope="col" className="matrix-col matrix-total"><span className="matrix-col-label">{totalLabel}</span></th> : null}
          </tr>
        </thead>
        <tbody ref={bodyRef} onKeyDown={onKeyDown}>
          {rows.map((r, i) => (
            <tr key={r.id}>
              <th scope="row" className="matrix-row"
                data-pos={onRowOpen ? undefined : `${i}:0`}
                tabIndex={onRowOpen ? undefined : stop(i, 0)}
                onFocus={() => setActive([i, 0])}>
                {onRowOpen ? (
                  <button type="button" className="matrix-row-open" data-pos={`${i}:0`} tabIndex={stop(i, 0)}
                    onClick={() => onRowOpen(r)}>
                    {r.label}
                  </button>
                ) : r.label}
                {r.flag !== undefined ? <span className="matrix-flag">{r.flag}</span> : null}
              </th>
              {cols.map((c, j) => {
                const spec = grid[i]![j];
                const has = marked(spec);
                const key = `${i}:${j + 1}`;
                return (
                  <td key={c.id} data-pos={key} tabIndex={stop(i, j + 1)}
                    data-tone={spec?.tone && spec.tone !== 'neutral' ? spec.tone : undefined}
                    data-empty={has ? undefined : ''}
                    className="matrix-cell"
                    onFocus={(e) => { setActive([i, j + 1]); show(e.currentTarget, spec?.title, key); }}
                    onBlur={hide}
                    onMouseEnter={(e) => show(e.currentTarget, spec?.title, key)}
                    onMouseLeave={hide}
                    onClick={onCellOpen ? () => onCellOpen(r, c) : undefined}>
                    {has ? (
                      spec!.title
                        ? <><span aria-hidden="true" className="matrix-mark">{spec!.mark}</span><span className="sr-only">{spec!.title}</span></>
                        : <span className="matrix-mark">{spec!.mark}</span>
                    ) : (
                      <><span aria-hidden="true" className="matrix-empty">{emptyMark}</span><span className="sr-only">{spec?.title ?? emptyLabel}</span></>
                    )}
                  </td>
                );
              })}
              {rowTotals ? <td className="matrix-total num">{rowCounts[i]}</td> : null}
            </tr>
          ))}
        </tbody>
        {colTotals ? (
          <tfoot>
            <tr>
              <th scope="row" className="matrix-row matrix-total">{totalLabel}</th>
              {colCounts.map((n, j) => <td key={cols[j]!.id} className="matrix-total num">{n}</td>)}
              {rowTotals ? <td className="matrix-total num">{rowCounts.reduce((a, b) => a + b, 0)}</td> : null}
            </tr>
          </tfoot>
        ) : null}
      </table>
      {tip ? <Readout key={tip.key} anchor={tip.el} text={tip.text} /> : null}
    </div>
  );
});
