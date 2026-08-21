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
