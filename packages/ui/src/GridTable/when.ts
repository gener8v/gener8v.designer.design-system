import type { When } from '../choosing.js';

export const when = [
  {
    name: 'GridTable',
    family: 'data',
    job: 'let people key values into many rows at a sitting',
    use: [
      'The rows and keys exist and people must fill in facts only they hold — two hundred rows of owners, codes or names.',
      'Some columns are filled by people and some come from a source: mark the owned ones with `GridHead`.',
      'Show how far the filling has got with `GridProgress`.',
    ],
    not: [
      {
        when: 'the rows are read, compared or sorted, not typed into',
        use: 'Table',
        because: 'a table presents what a system holds; a grid is a keying surface.',
      },
      {
        when: 'one record with a handful of fields',
        use: 'Field',
        because: 'a form of labelled fields reads better than a one-row grid.',
      },
      {
        when: 'marking which rows cover which columns',
        use: 'Matrix',
        because: 'a matrix records presence on a grid; a grid table records typed values.',
      },
    ],
    neighbours: ['Table', 'Matrix', 'Input'],
    react: ['GridTable', 'GridHead', 'GridCell', 'GridProgress'],
    css: ['.grid-table', '.grid-cell', '.grid-head-owned', '.grid-progress'],
    page: 'components/table.html',
  },
] satisfies When[];
