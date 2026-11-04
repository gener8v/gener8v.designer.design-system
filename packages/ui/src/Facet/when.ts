import type { When } from '../choosing.js';

export const when = [
  {
    name: 'Facet',
    family: 'navigation',
    job: 'show an attribute of a row, and narrow the list to it when pressed',
    use: [
      'A row carries a recorded fact — "Owner · Dana", "Against · ISO 27001" — that a reader may want to filter by.',
      'Showing an attribute plainly: without `onClick` it renders as a span, so a row does not change shape when the dimension becomes filterable.',
      'A missing value: an empty one renders nothing; pass `muted` with the absence in words when you know why.',
    ],
    not: [
      {
        when: 'the value is a status — done, failed, at risk',
        use: 'Tag',
        because: 'a tag reports a state in a reserved tone; a facet is a neutral name and value.',
      },
      {
        when: 'the dimension is not on the rows, or the reader needs every value listed',
        use: 'Filter',
        because: 'a filter lists the values of a dimension in a menu above the list.',
      },
    ],
    neighbours: ['Tag', 'Filter'],
    react: ['Facet', 'Facets'],
    css: ['.facet', '.facets'],
    page: null,
  },
] satisfies When[];
