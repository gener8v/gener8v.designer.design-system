import type { When } from '../choosing.js';

export const when = [
  {
    name: 'Select',
    family: 'input',
    job: 'pick one value from a short fixed list in a form, with the native control',
    use: [
      'A form value from a short, familiar list — a country, a currency — where the platform picker is acceptable and the form submits natively.',
      'Inside a `Field` with a label; `invalid` sets `aria-invalid`.',
    ],
    not: [
      {
        when: 'the open list has to be on-brand, searchable, or usable the same way on touch and keyboard',
        use: 'Combobox',
        because: 'a native select\'s open list is drawn by the operating system and no token reaches it; the combobox is ours and filters as you type.',
      },
      {
        when: 'two to five options that should all be visible, especially with a description each',
        use: 'RadioCards',
        because: 'showing the choices beats hiding them behind a click; a radio card carries a note and a figure.',
      },
      {
        when: 'the list is of actions, or a choice that applies at once outside a form',
        use: 'Menu',
        because: 'a menu runs commands and closes on choice; a select holds a form value.',
      },
      {
        when: 'narrowing a table or list by a dimension',
        use: 'Filter',
        because: 'a filter reads as the dimension, has an "any" state and can hold several values.',
      },
      {
        when: 'two or three views of the same thing',
        use: 'Segmented',
        because: 'a segmented control shows every option at once.',
      },
    ],
    neighbours: ['Combobox', 'Menu', 'RadioCards', 'Filter', 'Segmented'],
    react: ['Select'],
    css: ['.select'],
    page: 'components/forms.html',
  },
] satisfies When[];
