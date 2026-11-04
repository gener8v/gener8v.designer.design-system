import type { When } from '../choosing.js';

export const when = [
  {
    name: 'SelectMenu',
    family: 'input',
    job: 'pick one value from a list that is short enough to scan, with a list drawn in the system',
    use: [
      'One value from a list of a few to a few dozen — a client, a status, a region — where the open list has to look like the rest of the product, not the operating system.',
      'Options that need a note under them to be told apart, grouped options, or options that are there but cannot be chosen yet. A native select can carry none of these.',
      'Keys: Enter, Space or ↓ open on the chosen option; a letter jumps to the option that starts with it; Escape closes with no change and focus goes back to the button. `name` submits the value with a native form.',
    ],
    not: [
      {
        when: 'too many options to scan, so the person needs to type to narrow them',
        use: 'Combobox',
        because: 'a combobox is a field that filters as you type; a select menu has no field, and a letter only jumps.',
      },
      {
        when: 'a plain form where the platform\'s own picker is acceptable, or no script runs',
        use: 'Select',
        because: 'the native select needs no script and is the platform\'s control on touch devices; it costs a list no token reaches.',
      },
      {
        when: 'two to five options that should all be visible, especially with a description each',
        use: 'RadioCards',
        because: 'showing the choices beats hiding them behind a click.',
      },
      {
        when: 'a list of actions or commands under a button',
        use: 'Menu',
        because: 'a menu runs something and holds no value; a select menu sets one.',
      },
      {
        when: 'several values, each removable',
        use: 'TokenInput',
        because: 'a select menu holds one value; tokens show each of several as a removable chip.',
      },
    ],
    neighbours: ['Select', 'Combobox', 'Menu', 'RadioCards'],
    react: ['SelectMenu'],
    hooks: ['useListbox'],
    css: ['.select-menu'],
    page: 'components/inputs.html',
  },
] satisfies When[];
