import type { When } from '../choosing.js';

/*
 * Its own entry rather than `hooks` on `Keys`. `Keys` draws keys; this binds them, keeps a stored
 * setting and a registry across screens, and renders the help that lists them. A reader asking
 * "how do I add keyboard shortcuts to this screen" should land here, not on a `<kbd>`.
 */
export const when = [
  {
    name: 'Shortcuts',
    family: 'input',
    job: 'bind page keys to actions, with an off-switch and one list of every key the page binds',
    use: [
      'A screen people work through all day — next, done, assign — where one key per action saves time: `useShortcuts([{ key: \'j\', does: \'Next item\', run }])`. Keys stand down while typing in a field, with Ctrl, ⌘ or Alt held, and under a dialog.',
      'Single-key shortcuts have to be possible to turn off (WCAG 2.1.4). Wrap the app in `ShortcutsProvider`, which stores the switch per person, and show `ShortcutHelp` — every registered key and the switch — behind a visible "?" button, not only behind the `?` key.',
      'Escape that closes one thing at a time — a popover, then a draft, then the search — with `closeTopLayer`, still working inside a search field.',
    ],
    not: [
      {
        when: 'moving through a list of cards with J / K and arrows, with roving focus',
        use: 'Keys',
        because: '`useListKeys` owns the focus and the tab stop in the list; bind the rest of the screen with this.',
      },
      {
        when: 'searching every command and place from anywhere, by a chord',
        use: 'CommandPalette',
        because: 'a palette is found by typing and binds ⌘K itself; a shortcut is a key someone has learned.',
      },
      {
        when: 'showing the shortcut beside the menu item it triggers',
        use: 'Menu',
        because: '`MenuShortcut` draws it at the end of the item; the key itself is still bound here.',
      },
    ],
    neighbours: ['Keys', 'CommandPalette', 'Menu'],
    react: ['ShortcutsProvider', 'ShortcutHelp'],
    hooks: ['useShortcuts', 'useSingleKeyShortcuts', 'useShortcutGroups', 'closeTopLayer'],
    css: [],
    page: 'components/reading.html',
  },
] satisfies When[];
