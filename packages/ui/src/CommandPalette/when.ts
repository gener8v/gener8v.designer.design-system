import type { When } from '../choosing.js';

export const when = [
  {
    name: 'CommandPalette',
    family: 'navigation',
    job: 'let someone type to find and run any command or go anywhere, from anywhere',
    use: [
      'An app with many places and actions, where a keyboard user wants ⌘K / Ctrl+K and a search (`useCommandPalette` binds it).',
      'It takes the page over as a modal: focus stays in the search, arrows move the highlight, Enter runs.',
    ],
    not: [
      {
        when: 'someone is choosing a value for a field by typing',
        use: 'Combobox',
        because: 'a combobox fills a field in a form; a palette runs a command and closes.',
      },
      {
        when: 'there are a few actions on one thing',
        use: 'Menu',
        because: 'a menu button opens beside its trigger and does not take the page over.',
      },
      {
        when: 'the person is browsing places rather than searching',
        use: 'Sidebar',
        because: 'the rail shows every place at once; a palette shows only what matches.',
      },
    ],
    neighbours: ['Combobox', 'Menu', 'Dialog', 'Keys'],
    react: ['CommandPalette'],
    hooks: ['useCommandPalette'],
    css: ['.command'],
    page: 'components/command.html',
  },
] satisfies When[];
