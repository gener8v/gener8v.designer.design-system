import type { When } from '../choosing.js';

export const when = [
  {
    name: 'Table',
    family: 'data',
    job: 'show records whose values are compared down a column',
    use: [
      'Rows of the same kind with values worth comparing or sorting — status, owner, date, figure.',
      'Sort through `Th` and `useTableSort`, so the caret and `aria-sort` read one value; put filters and a "3 of 240" count in `TableToolbar`.',
      'Always inside `TableWrap`, so a wide table scrolls in its own box and never widens the page.',
    ],
    not: [
      {
        when: 'people type values into the cells',
        use: 'GridTable',
        because: 'a grid has a spreadsheet\'s keyboard, owned columns and type-ahead per column; a table is read.',
      },
      {
        when: 'the question is which row covers which column — presence and absence on a grid',
        use: 'Matrix',
        because: 'a matrix is one Tab stop with arrow keys, pinned headings, and a mark in every tinted cell.',
      },
      {
        when: 'each row is read on its own and most columns would be empty',
        use: 'Item',
        because: 'a list of records is a name, a line of provenance and a mark or two; empty columns are noise.',
      },
      {
        when: 'a list of files',
        use: 'DocList',
        because: 'the library rows carry type badges, size and a preview pane.',
      },
      {
        when: 'a handful of label and value pairs about one thing',
        use: 'DescriptionList',
        because: 'one record\'s attributes are terms and values, not rows.',
      },
    ],
    neighbours: ['GridTable', 'Matrix', 'Item', 'TablePager', 'DocList'],
    react: ['TableWrap', 'Table', 'TableToolbar', 'Th', 'Td', 'TableEmpty', 'TableEmptyTitle'],
    hooks: ['useTableSort'],
    css: ['.table'],
    page: 'components/table.html',
  },
  {
    name: 'TablePager',
    family: 'data',
    job: 'page through a long table and say which rows are on show',
    use: [
      'Under a table too long for one screen: "Showing 26–50 of 61" and the page numbers.',
      'Rows already in memory: `usePagedTable` sorts the whole set, then pages it, and feeds the pager.',
    ],
    not: [
      {
        when: 'the table fits on one page',
        use: 'Table',
        because: 'the pager renders nothing then — a "page 1 of 1" control does nothing.',
      },
      {
        when: 'paging something that is not a table — search results, a gallery',
        use: 'Pagination',
        because: 'pagination is the bare page list; the table pager adds the range and is wired to `usePagedTable`.',
      },
      {
        when: 'stepping one item at a time through a set, inside a pane',
        use: 'PagerChip',
        because: 'the chip says "4 of 19" with previous and next; it is not a page list.',
      },
    ],
    neighbours: ['Pagination', 'PagerChip', 'Table'],
    react: ['TablePager'],
    hooks: ['usePagedTable', 'pageRange'],
    css: ['.table-pager'],
    page: 'components/table.html',
  },
] satisfies When[];
