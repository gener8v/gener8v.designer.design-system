import type { When } from '../choosing.js';

export const when = [
  {
    name: 'TokenInput',
    family: 'input',
    job: 'enter and remove several free labels in one field',
    use: [
      'Labels, keywords or recipients typed by the person: each becomes a removable token; Backspace on an empty field removes the last.',
      'Each × is a real button, so a token can be removed by keyboard.',
    ],
    not: [
      {
        when: 'the value is one item from a known list',
        use: 'Combobox',
        because: 'a combobox searches a list and holds one value.',
      },
      {
        when: 'the values narrow a list rather than being entered on a record',
        use: 'Filter',
        because: 'a multiple filter ticks values of a dimension and clears with "any"; tokens are data being written.',
      },
      {
        when: 'the labels are statuses to show, not values to edit',
        use: 'Tag',
        because: 'a tag reports a state and cannot be removed.',
      },
    ],
    neighbours: ['Combobox', 'Input', 'Tag', 'Filter'],
    react: ['TokenInput'],
    css: ['.token-input'],
    page: 'templates/work-item-create/',
  },
] satisfies When[];
