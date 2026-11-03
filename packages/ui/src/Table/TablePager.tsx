import { forwardRef } from 'react';
import type { HTMLAttributes } from 'react';
import { cx } from '../cx.js';
import { pageRange } from './usePagedTable.js';

export interface TablePagerProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  /** What `usePagedTable` returned — or any object with these five. */
  paged: { page: number; pages: number; total: number; from: number; to: number; setPage: (n: number) => void };
  /** Names the page navigation — `Documents pages`. */
  label: string;
  /** What the rows are, plural — `documents`. Without it the range is a bare figure. */
  noun?: string;
  /** Page numbers either side of the current one. 1 by default; 0 suits a phone. */
  siblings?: number;
}

const Caret = ({ back }: { back?: boolean }) => (
  <svg viewBox="0 0 16 16" aria-hidden="true" focusable="false">
    <path d={back ? 'M10 3.5L5.5 8l4.5 4.5' : 'M6 3.5L10.5 8 6 12.5'} stroke="currentColor"
      strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
  </svg>
);

/**
 * Under a paged table: `Showing 26–50 of 61 documents` and the pages.
 *
 * NOTHING AT ALL for a table that fits on one page — a pager offering page 1 of 1 is a control
 * that does nothing. Previous and Next are at either end and disabled, not removed, at the ends;
 * the current page is `aria-current="page"`; each number is named `Page 3 of 7`.
 */
export const TablePager = forwardRef<HTMLDivElement, TablePagerProps>(function TablePager(
  { paged, label, noun, siblings = 1, className, ...rest }, ref,
) {
  const { page, pages, total, from, to, setPage } = paged;
  if (pages <= 1) return null;
  return (
    <div {...rest} ref={ref} className={cx('table-pager', className)}>
      <p className="table-pager-range num" aria-live="polite">
        Showing {from}–{to} of {total}{noun ? ` ${noun}` : ''}
      </p>
      <nav aria-label={label} className="pagination">
        <button type="button" className="pagination-item" aria-label="Previous Page"
          disabled={page <= 1} onClick={() => setPage(page - 1)}>
          <Caret back />
        </button>
        {pageRange(page, pages, siblings).map((n, i) => n === 'gap' ? (
          <span key={`gap${i}`} className="pagination-gap" aria-hidden="true">…</span>
        ) : (
          <button key={n} type="button" className="pagination-item"
            aria-current={n === page ? 'page' : undefined}
            aria-label={`Page ${n} of ${pages}`} onClick={() => setPage(n)}>
            {n}
          </button>
        ))}
        <button type="button" className="pagination-item" aria-label="Next Page"
          disabled={page >= pages} onClick={() => setPage(page + 1)}>
          <Caret />
        </button>
      </nav>
    </div>
  );
});
