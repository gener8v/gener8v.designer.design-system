import type { When } from '../choosing.js';

export const when = [
  {
    name: 'DescriptionList',
    family: 'data',
    job: 'list the properties of one thing as names and values',
    use: [
      'The details of a record — Owner, Created, Status, Due — each a term and its value, as a real `<dl>`.',
      'A narrow column or a side pane: `stacked` puts the term above the value.',
    ],
    not: [
      {
        when: 'the values add up to a total',
        use: 'Summary',
        because: 'a summary is term/value pairs with one emphasised total row.',
      },
      {
        when: 'several records are compared on the same properties',
        use: 'Table',
        because: 'a table puts one record per row so values compare down a column.',
      },
      {
        when: 'a few headline figures summarise a page',
        use: 'Stat',
        because: 'a stat is a figure set large with its label and delta; a description list is quiet reference.',
      },
    ],
    neighbours: ['Summary', 'Table', 'Stat'],
    react: ['DescriptionList'],
    css: ['.dl'],
    page: 'components/data.html',
  },
] satisfies When[];
