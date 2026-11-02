import { useCallback, useMemo, useState } from 'react';
import { useTableSort } from './useTableSort.js';
import type { SortDirection } from './Table.js';

export interface PagedTableOptions<Row, Key extends string> {
  /** Rows per page. 25 by default. */
  pageSize?: number;
  /**
   * Sort before paging. Omit for a table that does not sort. The comparator and initial column are
   * `useTableSort`'s.
   */
  sort?: {
    value: (row: Row, key: Key) => string | number | null | undefined;
    initial?: { key: Key; direction?: SortDirection };
  };
}

export interface PagedTable<Row, Key extends string> {
  /** The rows on the page on show, sorted. Render these. */
  rows: Row[];
  /** Every row, sorted — for an export, or a count that is not the page's. */
  sorted: Row[];
  /** 1-based. Always a page that exists. */
  page: number;
  pages: number;
  total: number;
  pageSize: number;
  /** The first and last row on show, 1-based — `Showing 26–50 of 61`. Both 0 when there are none. */
  from: number;
  to: number;
  setPage: (page: number) => void;
  /** Spread onto a `Th`, as `useTableSort`'s. Changing the sort goes back to page 1. */
  sortProps: (key: Key) => { sort: SortDirection | null; onSort: () => void };
  sortKey: Key | null;
  direction: SortDirection;
  clearSort: () => void;
}

const NONE = () => undefined;

/**
 * A table's rows a page at a time, sorted across all of them, with the state `TablePager` reads.
 *
 * SORTED, THEN PAGED. Sorting the page you happen to be on is a different answer to the question
 * and a convincing one; this sorts the whole set and pages the result. A new sort goes back to the
 * first page, because page 3 of a new order is nobody's place.
 *
 * A set that shrinks under the reader — a row removed, a filter applied — keeps them on a page
 * that exists rather than an empty one past the end.
 *
 * For rows already in memory. A set that arrives a page at a time is the server's to sort.
 */
export function usePagedTable<Row, Key extends string = string>(
  rows: Row[],
  { pageSize = 25, sort }: PagedTableOptions<Row, Key> = {},
): PagedTable<Row, Key> {
  const sorting = useTableSort<Row, Key>(rows, sort?.value ?? NONE, sort?.initial);
  const [want, setWant] = useState(1);
  const size = Math.max(1, Math.floor(pageSize));
  const total = sorting.rows.length;
  const pages = Math.max(1, Math.ceil(total / size));
  const page = Math.min(Math.max(1, want), pages);

  const shown = useMemo(
    () => sorting.rows.slice((page - 1) * size, page * size),
    [sorting.rows, page, size],
  );

  const { sortProps: base } = sorting;
  const sortProps = useCallback((key: Key) => {
    const p = base(key);
    return { sort: p.sort, onSort: () => { p.onSort(); setWant(1); } };
  }, [base]);

  const setPage = useCallback((n: number) => setWant(Math.max(1, Math.floor(n))), []);

  return {
    rows: shown,
    sorted: sorting.rows,
    page, pages, total, pageSize: size,
    from: total ? (page - 1) * size + 1 : 0,
    to: Math.min(page * size, total),
    setPage,
    sortProps,
    sortKey: sorting.key,
    direction: sorting.direction,
    clearSort: sorting.clear,
  };
}

/**
 * Which page numbers to draw: the first, the last, the current and `siblings` either side, with a
 * `'gap'` where a run is elided. Never a gap that hides a single page — that page is drawn instead,
 * since `…` takes the same room and says less.
 */
export function pageRange(current: number, pages: number, siblings = 1): (number | 'gap')[] {
  if (pages <= 0) return [];
  const want = new Set<number>([1, pages]);
  for (let n = current - siblings; n <= current + siblings; n++) if (n >= 1 && n <= pages) want.add(n);
  const sorted = [...want].sort((a, b) => a - b);
  const out: (number | 'gap')[] = [];
  for (let i = 0; i < sorted.length; i++) {
    const n = sorted[i]!;
    const prev = sorted[i - 1];
    if (prev !== undefined) {
      if (n - prev === 2) out.push(prev + 1);
      else if (n - prev > 2) out.push('gap');
    }
    out.push(n);
  }
  return out;
}
