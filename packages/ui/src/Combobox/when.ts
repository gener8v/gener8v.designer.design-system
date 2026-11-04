import type { When } from '../choosing.js';

export const when = [
  {
    name: 'Combobox',
    family: 'input',
    job: 'pick a value from a long list by typing to narrow it',
    use: [
      'An owner from forty people, a code from hundreds — too many to scan, easy to type.',
      'The list has to look like the rest of the system and work the same on keyboard and touch; focus stays in the input.',
      '`allowCustom` when the person may enter a value the list does not hold. For a button that opens a list instead of a field you type in, `useListbox` gives the keyboard contract (type-ahead, no wrap, Tab closes) and you draw the markup.',
    ],
    not: [
      {
        when: 'a handful of options the person should see without typing',
        use: 'RadioCards',
        because: 'with few choices, showing them all is faster than searching.',
      },
      {
        when: 'several values, each removable',
        use: 'TokenInput',
        because: 'tokens show each value as a removable chip; a combobox holds one.',
      },
      {
        when: 'a list of actions or commands under a button',
        use: 'Menu',
        because: 'a menu runs something; a combobox sets a value.',
      },
      {
        when: 'searching across the whole app for a command or a place',
        use: 'CommandPalette',
        because: 'the palette is a dialog opened by ⌘K; a combobox is one field on a form.',
      },
      {
        when: 'a short native list in a plain form',
        use: 'Select',
        because: 'a native select needs no script, at the cost of an open list the platform draws.',
      },
    ],
    neighbours: ['Select', 'Menu', 'TokenInput', 'CommandPalette'],
    react: ['Combobox'],
    hooks: ['useListbox'],
    css: ['.combobox', '.listbox'],
    page: 'components/inputs.html',
  },
] satisfies When[];
