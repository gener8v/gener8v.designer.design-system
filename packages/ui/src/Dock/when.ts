import type { When } from '../choosing.js';

export const when = [
  {
    name: 'Dock',
    family: 'navigation',
    job: 'let a narrow column of long names be read by scrolling, one at a time',
    use: [
      'A long list of records in a narrow column, where every name would otherwise be truncated: the one at the focus point grows to be legible.',
      'Reading must not open anything — `onSelect` fires on a click and on Enter, never on scroll or focus.',
    ],
    not: [
      {
        when: 'the list is the app\'s places',
        use: 'Sidebar',
        because: 'a rail of places has short names and marks the current page.',
      },
      {
        when: 'there is room for each row to show its name and a line of provenance',
        use: 'Item',
        because: 'an item list shows every row in full; a dock only grows the one in focus.',
      },
      {
        when: 'the column can simply be made wider by the reader',
        use: 'Split',
        because: 'a resizable pane gives width persistently instead of momentarily.',
      },
    ],
    neighbours: ['Sidebar', 'Item', 'DocList', 'Split'],
    react: ['Dock'],
    css: ['.dock'],
    page: null,
  },
] satisfies When[];
