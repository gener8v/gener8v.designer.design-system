import type { When } from '../choosing.js';

export const when = [
  {
    name: 'Pagination',
    family: 'navigation',
    job: 'move between numbered pages of a long set',
    use: [
      'Search results, a gallery or a feed served a page at a time, where the page number is a place.',
      'Building your own pager: `PaginationItem` takes `aria-current="page"`; `PaginationGap` is the elided run.',
    ],
    not: [
      {
        when: 'paging rows of a table',
        use: 'TablePager',
        because: 'the table pager adds "Showing 26–50 of 61", renders nothing for one page, and is wired to `usePagedTable`.',
      },
      {
        when: 'stepping through a set one item at a time without leaving a pane',
        use: 'PagerChip',
        because: '"4 of 19" with previous and next is one control; a page list is many.',
      },
      {
        when: 'showing position in a sequence of steps the person is working through',
        use: 'Stepper',
        because: 'steps have state — done, current, failed; pages do not.',
      },
    ],
    neighbours: ['TablePager', 'PagerChip', 'Stepper'],
    react: ['Pagination', 'PaginationItem', 'PaginationGap'],
    css: ['.pagination'],
    page: 'components/flow.html',
  },
] satisfies When[];
