import type { When } from '../choosing.js';

export const when = [
  {
    name: 'Panel',
    family: 'screens',
    job: 'frame a region of a page — a table, a form, a list — under a header',
    use: [
      'A region of an app page needs a border and a title: a data table, a settings form, an activity list.',
      'The region has at most one action, which sits in the header.',
    ],
    not: [
      {
        when: 'the thing is self-contained and sits in a grid of its kind',
        use: 'Card',
        because: 'a card is one thing; a panel is the frame around a region of many.',
      },
      {
        when: 'you only need a heading over a section, no frame',
        use: 'SectionHead',
        because: 'a border is not needed to name a section; space does that.',
      },
      {
        when: 'the region is a document to read',
        use: 'Paper',
        because: 'paper gives a document a sheet and a ground; a panel is for scanned data.',
      },
    ],
    neighbours: ['Card', 'SectionHead', 'Paper'],
    react: ['Panel', 'PanelHeader', 'PanelTitle', 'PanelBody'],
    css: ['.panel'],
    page: 'components/cards.html',
  },
] satisfies When[];
