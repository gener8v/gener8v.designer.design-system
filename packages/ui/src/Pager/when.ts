import type { When } from '../choosing.js';

export const when = [
  {
    name: 'PagerChip',
    family: 'navigation',
    job: 'step through a set one item at a time without leaving the place you are in',
    use: [
      'The head of a side pane that walks a set in order — sources, open findings, attachments: `‹ S4 of 19 ›`.',
      'In a `Drawer` header, so the way to the next item never scrolls away.',
    ],
    not: [
      {
        when: 'jumping to any page of a long list',
        use: 'Pagination',
        because: 'pagination draws the page numbers; the chip only steps to the neighbour.',
      },
      {
        when: 'under a table, saying which rows are on show',
        use: 'TablePager',
        because: 'the table pager carries the range and the pages for a table.',
      },
      {
        when: 'the person is moving through steps of a task',
        use: 'Stepper',
        because: 'a stepper says which steps are done; a pager chip has no notion of done.',
      },
    ],
    neighbours: ['Pagination', 'TablePager', 'Drawer'],
    react: ['PagerChip'],
    css: ['.pager-chip'],
    page: 'components/reading.html',
  },
] satisfies When[];
