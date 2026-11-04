import type { When } from '../choosing.js';

export const when = [
  {
    name: 'Tally',
    family: 'data',
    job: 'show what a set of statements adds up to when they do not agree',
    use: [
      'Five sources say gap and two say covered: one bar split by part, with the counts underneath as words.',
      'On a row where the disagreement is the thing worth opening.',
    ],
    not: [
      {
        when: 'one value with one tone',
        use: 'Meter',
        because: 'a meter is a single level; a tally is a split.',
      },
      {
        when: 'nobody has said anything yet',
        use: 'State',
        because: 'a tally with every part at zero renders nothing; say the absence in your own words.',
      },
      {
        when: 'parts of a whole across categories, compared between rows',
        use: 'BarChart',
        because: 'a stacked bar chart has a shared axis and a legend for many rows.',
      },
      {
        when: 'one settled status',
        use: 'Tag',
        because: 'a single verdict is a status word.',
      },
    ],
    neighbours: ['Meter', 'BarChart', 'Matrix', 'Tag'],
    react: ['Tally'],
    css: ['.tally'],
    page: null,
  },
] satisfies When[];
