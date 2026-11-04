import type { When } from '../choosing.js';

export const when = [
  {
    name: 'Matrix',
    family: 'data',
    job: 'show which things cover which, read across a row and down a column',
    use: [
      'Coverage on a grid — requirements against tests, controls against systems, people against projects.',
      'Grids wider than the screen: it scrolls in its own frame with headings and row labels pinned, and the cells are one Tab stop.',
      'Totals per row or column; a tone on a cell always comes with a mark.',
    ],
    not: [
      {
        when: 'the cells hold values to compare, not presence and absence',
        use: 'Table',
        because: 'a table is records down a column; a matrix is a yes-or-no at every crossing.',
      },
      {
        when: 'the coverage runs through ordered layers — requirements, then milestones, then outcomes',
        use: 'LayeredGraph',
        because: 'the layered graph keeps the order and draws what covers what as lines and words.',
      },
      {
        when: 'a single level against a target',
        use: 'Meter',
        because: 'a meter is one figure on a track; a matrix is many crossings.',
      },
      {
        when: 'a set of verdicts on one row that do not agree',
        use: 'Tally',
        because: 'a tally sums the disagreement in one bar with the counts as words.',
      },
    ],
    neighbours: ['Table', 'LayeredGraph', 'Tally', 'BarChart'],
    react: ['Matrix'],
    css: ['.matrix'],
    page: 'components/table.html',
  },
] satisfies When[];
