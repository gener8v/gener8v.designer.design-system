import type { When } from '../choosing.js';

export const when = [
  {
    name: 'Filter',
    family: 'navigation',
    job: 'narrow a list by one dimension, beside the other dimensions',
    use: [
      'A table or list can be narrowed by Type, Status or Owner; put one `Filter` per dimension in a `Filters` row.',
      'The trigger reads as the dimension until it holds a value, so a row of them says what can be narrowed.',
      'Several values of one dimension at once ("gaps and conflicts") — pass `multiple`; values are OR-ed.',
    ],
    not: [
      {
        when: 'the dimension is already printed on every row',
        use: 'Facet',
        because: 'the attribute on the row can be the control; there is no filter panel to go and find.',
      },
      {
        when: 'the choice is between two or three views of the same thing',
        use: 'Segmented',
        because: 'views are all present and equal; a filter removes rows.',
      },
      {
        when: 'the choice swaps the panel of content',
        use: 'Tabs',
        because: 'tabs swap panels; a filter narrows one list and can combine with others.',
      },
      {
        when: 'the person is entering a value on a form, not narrowing a list',
        use: 'Select',
        because: 'a filter has an "any" state and acts at once; a form field holds a value until submit.',
      },
    ],
    neighbours: ['Facet', 'Segmented', 'Tabs', 'Menu', 'Select'],
    react: ['Filter', 'Filters'],
    css: ['.filter', '.filters'],
    page: null,
  },
] satisfies When[];
