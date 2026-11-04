import type { When } from '../choosing.js';

export const when = [
  {
    name: 'Tabs',
    family: 'navigation',
    job: 'swap between panels of different content in one place',
    use: [
      'Each option shows a different panel — Overview, Activity, Settings — and only one is on screen at a time.',
      'The panels are siblings of equal weight and the reader moves between them without leaving the page.',
    ],
    not: [
      {
        when: 'the options are views of the same content — a range, a grouping, list or grid',
        use: 'Segmented',
        because: 'a segmented control is a radiogroup that changes how one thing is shown; a tablist promises a different panel per tab.',
      },
      {
        when: 'the options narrow a list by a dimension — status, owner, type',
        use: 'Filter',
        because: 'a filter is a dimension with a value and sits beside other dimensions; tabs cannot combine.',
      },
      {
        when: 'the options are pages with their own URLs in an app',
        use: 'Sidebar',
        because: 'places are navigation and take `aria-current="page"`; tabs are panels inside one page.',
      },
      {
        when: 'the sections should be readable one after another, several open at once',
        use: 'Accordion',
        because: 'an accordion keeps every section in reading order; tabs hide all but one.',
      },
    ],
    neighbours: ['Segmented', 'Filter', 'Accordion', 'Sidebar'],
    react: ['Tabs', 'Tab'],
    css: ['.tabs', '.tab'],
    page: 'components/navigation.html',
  },
] satisfies When[];
