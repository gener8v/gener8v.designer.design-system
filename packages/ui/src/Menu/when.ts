import type { When } from '../choosing.js';

export const when = [
  {
    name: 'Menu',
    family: 'input',
    job: 'offer a list of actions, or one choice, behind a button',
    use: [
      'Secondary actions on a row or a page — Rename, Duplicate, Archive — behind a "More" button; put a destructive one last.',
      'An account menu, with `MenuIdentity` naming who is signed in, and `MenuSub` for a nested group.',
      'One choice that applies at once — sort order, density — with `selected` on each item; choosing closes it.',
    ],
    not: [
      {
        when: 'narrowing a list by a dimension',
        use: 'Filter',
        because: 'the filter is a menu already, with the dimension on the trigger, an "any" choice and multiple values.',
      },
      {
        when: 'a value in a form that is submitted later',
        use: 'Combobox',
        because: 'a combobox is a form control with a label and a value; a menu fires on choice.',
      },
      {
        when: 'a free panel with fields or prose anchored to a button',
        use: 'Popover',
        because: 'a menu holds menu items only; anything else breaks its keyboard contract.',
      },
      {
        when: 'navigation between the app\'s pages',
        use: 'Sidebar',
        because: 'places belong in the rail or the header where they stay visible.',
      },
      {
        when: 'searching every command in the app by name',
        use: 'CommandPalette',
        because: 'the palette filters as you type across everything; a menu lists a few things for one place.',
      },
    ],
    neighbours: ['Filter', 'Combobox', 'Select', 'Popover', 'CommandPalette'],
    react: ['Menu', 'MenuIdentity', 'MenuItem', 'MenuLabel', 'MenuSeparator', 'MenuShortcut', 'MenuSub'],
    css: ['.menu'],
    page: 'components/disclosure.html',
  },
] satisfies When[];
