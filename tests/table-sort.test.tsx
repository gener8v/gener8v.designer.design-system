import { describe, expect, it } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useTableSort } from '../packages/ui/src/index.js';

/**
 * Sorting, with the caret and the row order read from one piece of state.
 *
 * `Th` has carried `sort` and `onSort` since it was written and both were the caller's to wire —
 * two places holding one fact. A consumer sets `aria-sort="descending"` and sorts ascending in its
 * own `useMemo`, and nothing notices: the caret points one way and the rows go the other, which is
 * worse than no sorting because it is confidently wrong.
 */
type Row = { code: string; findings: number | null };
const ROWS: Row[] = [
  { code: 'AC-2', findings: 3 },
  { code: 'AU-6', findings: null },
  { code: 'AC-10', findings: 1 },
];
const value = (r: Row, k: 'code' | 'findings') => r[k];

describe('sorting a table', () => {
  it('leaves the rows alone until a column is chosen', () => {
    const { result } = renderHook(() => useTableSort(ROWS, value));

    expect(result.current.rows).toEqual(ROWS);
    expect(result.current.sortProps('code').sort).toBeNull();
  });

  it('drives the caret and the order from the same state', () => {
    const { result } = renderHook(() => useTableSort(ROWS, value));

    act(() => result.current.sortProps('code').onSort());

    expect(result.current.sortProps('code').sort).toBe('ascending');
    expect(result.current.rows.map((r) => r.code)).toEqual(['AC-2', 'AC-10', 'AU-6']);
  });

  it('sorts identifiers the way a person reads them', () => {
    // `localeCompare` with `numeric` — otherwise AC-10 sorts before AC-2 because "1" < "2", which
    // is correct for strings and wrong for every control catalogue ever written.
    const { result } = renderHook(() => useTableSort(ROWS, value));
    act(() => result.current.sortProps('code').onSort());

    expect(result.current.rows.map((r) => r.code)).toEqual(['AC-2', 'AC-10', 'AU-6']);
  });

  it('toggles the same column and restarts a different one', () => {
    // Carrying the previous direction over to a new column is the behaviour nobody expects.
    const { result } = renderHook(() => useTableSort(ROWS, value));

    act(() => result.current.sortProps('code').onSort());
    act(() => result.current.sortProps('code').onSort());
    expect(result.current.sortProps('code').sort).toBe('descending');

    act(() => result.current.sortProps('findings').onSort());
    expect(result.current.sortProps('findings').sort).toBe('ascending');
    expect(result.current.sortProps('code').sort).toBeNull();
  });

  it('puts an absent value last in both directions', () => {
    // A blank is not a small value — it is the absence of one. Floating it to the top on a
    // descending sort buries the rows somebody actually asked to see.
    const { result } = renderHook(() => useTableSort(ROWS, value));

    act(() => result.current.sortProps('findings').onSort());
    expect(result.current.rows[result.current.rows.length - 1]!.code).toBe('AU-6');

    act(() => result.current.sortProps('findings').onSort());
    expect(result.current.rows[result.current.rows.length - 1]!.code).toBe('AU-6');
  });

  it('goes back to the order the rows arrived in', () => {
    const { result } = renderHook(() => useTableSort(ROWS, value));
    act(() => result.current.sortProps('code').onSort());
    act(() => result.current.clear());

    expect(result.current.rows).toEqual(ROWS);
  });
});
