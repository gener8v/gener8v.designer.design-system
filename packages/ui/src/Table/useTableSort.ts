import { useCallback, useMemo, useState } from 'react';
import type { SortDirection } from './Table.js';

/**
 * Sorting a table, with `aria-sort` and the comparator driven by ONE piece of state.
 *
 * `Th` has carried `sort` and `onSort` since it was written, and both were the caller's to wire.
 * That is two places holding the same fact: a consumer sets `aria-sort="descending"` on the header
 * and sorts ascending in its own `useMemo`, and nothing notices — the caret points one way and the
 * rows go the other, which is worse than no sorting at all because it is confidently wrong.
 *
 * So the state lives here and both halves are read from it.
 *
 * WHAT IT DELIBERATELY DOES NOT DO
 *
 * It does not fetch, paginate or persist. A table whose rows come a page at a time cannot be sorted
 * in the browser at all — sorting the page you happen to be holding is a different answer to the
 * question, and a convincing one. Use this for a set you already have in full; ask the server
 * otherwise.
 *
 * Ties keep their original order. `Array.prototype.sort` is stable, and a table that reshuffles
 * equal rows every time you re-sort a different column reads as though something changed.
 */
export interface TableSort<Key extends string> {
  /** The column being sorted by, or null when the rows are in their natural order. */
  key: Key | null;
  direction: SortDirection;
  /** Spread onto a `Th`. Carries `sort` and `onSort`, so the caret and the order agree. */
  sortProps: (key: Key) => { sort: SortDirection | null; onSort: () => void };
  /** Back to the order the rows arrived in. */
  clear: () => void;
}

export interface TableSortResult<Row, Key extends string> extends TableSort<Key> {
  rows: Row[];
}

export function useTableSort<Row, Key extends string>(
  rows: Row[],
  /**
   * What to compare for a column. Return a string or a number; strings are compared with
   * `localeCompare`, so `Ä` sorts where a reader expects rather than after `Z`.
   */
  value: (row: Row, key: Key) => string | number | null | undefined,
  initial?: { key: Key; direction?: SortDirection },
): TableSortResult<Row, Key> {
  const [key, setKey] = useState<Key | null>(initial?.key ?? null);
  const [direction, setDirection] = useState<SortDirection>(initial?.direction ?? 'ascending');

  const sortProps = useCallback(
    (column: Key) => ({
      sort: key === column ? direction : null,
      onSort: () =>
        setKey((was) => {
          // Same column toggles; a different one starts ascending. Carrying the previous
          // direction over to a new column is the behaviour nobody expects and everybody hits.
          if (was === column) setDirection((d) => (d === 'ascending' ? 'descending' : 'ascending'));
          else setDirection('ascending');
          return column;
        }),
    }),
    [key, direction],
  );

  const sorted = useMemo(() => {
    if (!key) return rows;
    const factor = direction === 'ascending' ? 1 : -1;
    return [...rows].sort((a, b) => {
      const x = value(a, key);
      const y = value(b, key);
      // Absent sorts last in BOTH directions. A blank is not a small value — it is the absence of
      // one, and floating it to the top on a descending sort buries the rows somebody asked for.
      const xEmpty = x === null || x === undefined || x === '';
      const yEmpty = y === null || y === undefined || y === '';
      if (xEmpty || yEmpty) return xEmpty && yEmpty ? 0 : xEmpty ? 1 : -1;
      if (typeof x === 'number' && typeof y === 'number') return (x - y) * factor;
      return String(x).localeCompare(String(y), undefined, { numeric: true }) * factor;
    });
  }, [rows, key, direction, value]);

  const clear = useCallback(() => setKey(null), []);

  return { rows: sorted, key, direction, sortProps, clear };
}
