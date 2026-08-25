import { forwardRef } from 'react';
import type { HTMLAttributes, TableHTMLAttributes, ThHTMLAttributes, TdHTMLAttributes } from 'react';
import { cx } from '../cx.js';

/** Tables must scroll inside their own box, never widen the page. */
export const TableWrap = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  function TableWrap({ className, ...rest }, ref) {
    return <div {...rest} ref={ref} className={cx('table-wrap', className)} />;
  });

export interface TableProps extends TableHTMLAttributes<HTMLTableElement> {
  compact?: boolean;
  /** Pins the header while the body scrolls. Needs a height-bounded wrapper. */
  sticky?: boolean;
}

export const Table = forwardRef<HTMLTableElement, TableProps>(function Table(
  { compact = false, sticky = false, className, ...rest }, ref,
) {
  return <table {...rest} ref={ref}
    className={cx('table', compact && 'table-compact', sticky && 'table-sticky', className)} />;
});

export type SortDirection = 'ascending' | 'descending';

export interface ThProps extends Omit<ThHTMLAttributes<HTMLTableCellElement>, 'onClick'> {
  /** Right-aligns and switches the column to tabular figures. */
  numeric?: boolean;
  nowrap?: boolean;
  /** Present ⇒ the column is sortable. `null` means sortable but not sorted. */
  sort?: SortDirection | null;
  onSort?: () => void;
}

/**
 * Sort state lives in `aria-sort`, so the caret and the screen-reader
 * announcement are driven by one value rather than two.
 */
export const Th = forwardRef<HTMLTableCellElement, ThProps>(function Th(
  { numeric, nowrap, sort, onSort, scope = 'col', children, ...rest }, ref,
) {
  const sortable = sort !== undefined;
  return (
    <th {...rest} ref={ref} scope={scope}
      aria-sort={sort ?? undefined}
      data-numeric={numeric || undefined}
      data-nowrap={nowrap || undefined}>
      {sortable ? <button type="button" onClick={onSort}>{children}</button> : children}
    </th>
  );
});

export interface TdProps extends TdHTMLAttributes<HTMLTableCellElement> {
  numeric?: boolean;
  nowrap?: boolean;
  /** Mono face for technical identifiers — codes, refs, hashes. */
  mono?: boolean;
}

export const Td = forwardRef<HTMLTableCellElement, TdProps>(function Td(
  { numeric, nowrap, mono, className, ...rest }, ref,
) {
  return <td {...rest} ref={ref}
    data-numeric={numeric || undefined}
    data-nowrap={nowrap || undefined}
    className={cx(numeric && 'num', mono && 'mono', className)} />;
});

export const TableEmpty = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  function TableEmpty({ className, ...rest }, ref) {
    return <div {...rest} ref={ref} className={cx('table-empty', className)} />;
  });

export const TableEmptyTitle = forwardRef<HTMLParagraphElement, HTMLAttributes<HTMLParagraphElement>>(
  function TableEmptyTitle({ className, ...rest }, ref) {
    return <p {...rest} ref={ref} className={cx('table-empty-title', className)} />;
  });

export interface TableToolbarProps extends HTMLAttributes<HTMLDivElement> {
  /** How many rows are showing, and out of how many. Omit while the set is still arriving. */
  showing?: { of: number; total: number };
}

/**
 * What sits above a table: a filter, and how much of it you are looking at.
 *
 * The count is not decoration. A filter that hides rows without saying how many it left behind is
 * indistinguishable from an empty table — and a reader who cannot see that 3 of 240 are showing
 * has no reason to suspect a filter is on at all.
 */
export const TableToolbar = forwardRef<HTMLDivElement, TableToolbarProps>(function TableToolbar(
  { showing, className, children, ...rest }, ref,
) {
  return (
    <div {...rest} ref={ref} className={cx('table-toolbar', className)}>
      {children}
      {showing ? (
        <span className="table-count" aria-live="polite">
          {showing.of === showing.total
            ? `${showing.total}`
            : `${showing.of} of ${showing.total}`}
        </span>
      ) : null}
    </div>
  );
});
