// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest';
import { act, cleanup, fireEvent, render, renderHook, screen } from '@testing-library/react';
import {
  BarChart, Popover, Table, TablePager, Td, Th, pageRange, usePagedTable,
} from '../packages/ui/src/index.js';
import { expectNoA11yViolations } from './a11y.js';

/**
 * Every table pages, sorted across all of its rows rather than the page on show; a chart's bars
 * can run across the page; a popover can be wide.
 */
afterEach(cleanup);

type Doc = { title: string; sections: number };
const DOCS: Doc[] = Array.from({ length: 61 }, (_, i) => ({ title: `Document ${String(i + 1).padStart(2, '0')}`, sections: (i * 7) % 31 }));
const value = (d: Doc, k: 'title' | 'sections') => d[k];

describe('a table a page at a time', () => {
  it('pages the rows and says which are on show', () => {
    const { result } = renderHook(() => usePagedTable(DOCS, { pageSize: 25 }));
    expect(result.current.rows).toHaveLength(25);
    expect(result.current.pages).toBe(3);
    act(() => result.current.setPage(3));
    expect(result.current.rows).toHaveLength(11);
    expect([result.current.from, result.current.to, result.current.total]).toEqual([51, 61, 61]);
  });

  it('sorts the whole set before paging, and a new sort goes back to page 1', () => {
    const { result } = renderHook(() => usePagedTable(DOCS, { pageSize: 25, sort: { value } }));
    act(() => result.current.setPage(2));
    act(() => result.current.sortProps('sections').onSort());
    expect(result.current.page).toBe(1);
    expect(result.current.rows[0]!.sections).toBe(0);
    expect(result.current.sortProps('sections').sort).toBe('ascending');
    act(() => result.current.setPage(3));
    expect(result.current.rows.at(-1)!.sections).toBe(30);
  });

  it('keeps the reader on a page that exists when the set shrinks', () => {
    const { result, rerender } = renderHook(({ rows }) => usePagedTable(rows, { pageSize: 25 }), { initialProps: { rows: DOCS } });
    act(() => result.current.setPage(3));
    rerender({ rows: DOCS.slice(0, 30) });
    expect(result.current.page).toBe(2);
  });

  it('elides long runs of pages, never a single page', () => {
    expect(pageRange(1, 3)).toEqual([1, 2, 3]);
    expect(pageRange(6, 12)).toEqual([1, 'gap', 5, 6, 7, 'gap', 12]);
    expect(pageRange(3, 12)).toEqual([1, 2, 3, 4, 'gap', 12]);
  });

  it('draws no pager for a table that fits on one page', () => {
    const { container } = render(<TablePager label="Documents pages" paged={{ page: 1, pages: 1, total: 4, from: 1, to: 4, setPage: () => {} }} />);
    expect(container).toBeEmptyDOMElement();
  });

  function Documents() {
    const paged = usePagedTable(DOCS, { pageSize: 25, sort: { value } });
    return (
      <main>
        <Table aria-label="Documents">
          <thead><tr><Th {...paged.sortProps('title')}>Document</Th><Th numeric {...paged.sortProps('sections')}>Sections</Th></tr></thead>
          <tbody>{paged.rows.map((d) => <tr key={d.title}><Td>{d.title}</Td><Td numeric>{d.sections}</Td></tr>)}</tbody>
        </Table>
        <TablePager paged={paged} label="Documents pages" noun="documents" />
      </main>
    );
  }

  it('wires the pager to the table', () => {
    render(<Documents />);
    expect(screen.getByText('Showing 1–25 of 61 documents')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Previous Page' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Page 1 of 3' })).toHaveAttribute('aria-current', 'page');
    fireEvent.click(screen.getByRole('button', { name: 'Next Page' }));
    expect(screen.getByText('Showing 26–50 of 61 documents')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Page 2 of 3' })).toHaveAttribute('aria-current', 'page');
    fireEvent.click(screen.getByRole('button', { name: 'Sections' }));
    expect(screen.getByText('Showing 1–25 of 61 documents')).toBeInTheDocument();
  });

  it('passes axe', async () => {
    const { container } = render(<Documents />);
    await expectNoA11yViolations(container);
  });
});

describe('bars across the page', () => {
  const props = {
    title: 'Impact by kind', categories: ['Process friction', 'Data quality', 'Reporting gaps'],
    series: [{ label: 'Findings', values: [14, 11, 5] }],
  };

  it('draws a row per category with its value written at the bar’s end', () => {
    const { container } = render(<BarChart {...props} orientation="horizontal" />);
    expect(screen.getByRole('img', { name: /Impact by kind\. 1 series across 3 categories/ })).toBeInTheDocument();
    expect(container.querySelectorAll('.chart-hbar-row')).toHaveLength(3);
    expect(container.querySelector('.chart-hbar-value')).toHaveTextContent('14');
    expect((container.querySelector('.chart-hbar') as HTMLElement).style.inlineSize).toBe('100%');
    expect(container.querySelector('svg.chart-svg')).toBeNull();
  });

  it('stacks to one bar per category with the total', () => {
    const { container } = render(<BarChart title="Evidence by type" categories={['Interviews']} stacked orientation="horizontal"
      series={[{ label: 'Cited', values: [38] }, { label: 'Not yet cited', values: [12] }]} />);
    expect(container.querySelectorAll('.chart-hbar')).toHaveLength(2);
    expect(container.querySelector('.chart-hbar-value')).toHaveTextContent('50');
  });

  it('still draws vertical bars by default', () => {
    const { container } = render(<BarChart {...props} />);
    expect(container.querySelector('svg.chart-svg')).not.toBeNull();
  });

  it('passes axe, with the table view one press away', async () => {
    const { container } = render(<main><BarChart {...props} orientation="horizontal" /></main>);
    await expectNoA11yViolations(container);
  });
});

describe('a wide popover', () => {
  it('takes a size class, and the default adds none', () => {
    render(<Popover label="What the agents are doing" size="lg" trigger={<button type="button">Agents Working</button>}><p>Lanes</p></Popover>);
    fireEvent.click(screen.getByRole('button', { name: 'Agents Working' }));
    expect(screen.getByRole('dialog', { name: 'What the agents are doing' })).toHaveClass('popover', 'popover-lg');
    cleanup();
    render(<Popover label="Filter" trigger={<button type="button">Filter</button>}><p>Owner</p></Popover>);
    fireEvent.click(screen.getByRole('button', { name: 'Filter' }));
    expect(screen.getByRole('dialog', { name: 'Filter' }).className).toBe('popover');
  });
});
