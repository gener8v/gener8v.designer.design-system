import type { When } from '../choosing.js';

export const when = [
  {
    name: 'Summary',
    family: 'data',
    job: 'add lines up to a total the eye lands on',
    use: [
      'An order or a quote: subtotal, delivery, tax, then one `total` row — one emphasised total per summary.',
      'A note under the figures (`SummaryNote`) for what the total does or does not include.',
    ],
    not: [
      {
        when: 'the pairs are properties of a record and nothing adds up',
        use: 'DescriptionList',
        because: 'a description list is plain names and values with no total.',
      },
      {
        when: 'the figures are headline measures, not a sum',
        use: 'Stat',
        because: 'a stat row is figures that read as one sentence; a summary is a sum.',
      },
      {
        when: 'many line items are compared or sorted',
        use: 'Table',
        because: 'a table compares rows down columns; a summary is a short stack ending in a total.',
      },
    ],
    neighbours: ['DescriptionList', 'Stat', 'Table'],
    react: ['Summary', 'SummaryRow', 'SummaryNote'],
    css: ['.summary'],
    page: 'templates/purchase/',
  },
] satisfies When[];
