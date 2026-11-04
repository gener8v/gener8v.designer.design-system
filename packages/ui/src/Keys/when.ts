import type { When } from '../choosing.js';

export const when = [
  {
    name: 'Keys',
    family: 'reading',
    job: 'show a keyboard key, or the keys a surface binds and what each does',
    use: [
      'A key drawn as a key inside text — `J`, `Enter`, `⇧` — as a real `<kbd>` (`Kbd`).',
      'A "?" sheet or the foot of a panel that binds keys: `ShortcutList`, a description list of keys and what they do, with glyphs given spoken names.',
      'Moving through a list of cards by `J` / `K` and arrows with real roving focus: `useListKeys`, which ignores keys while typing or under a dialog.',
    ],
    not: [
      {
        when: 'the list is API keys',
        use: 'KeyList',
        because: '`.key-list` is the integrations list of API keys; this is keyboard keys.',
      },
      {
        when: 'it is a command or a code sample',
        use: 'CodeBlock',
        because: 'a code block is for code to read or copy, not a key to press.',
      },
      {
        when: 'the shortcut belongs on a menu item',
        use: 'Menu',
        because: '`MenuShortcut` sets the shortcut at the end of the item it triggers.',
      },
      {
        when: 'the keys open a search over every command',
        use: 'CommandPalette',
        because: 'the command palette binds ⌘K itself and lists the commands.',
      },
    ],
    neighbours: ['KeyList', 'CodeBlock', 'Menu', 'CommandPalette'],
    react: ['Kbd', 'ShortcutList'],
    hooks: ['useListKeys', 'stepIndex', 'isTypingTarget'],
    css: ['.kbd', '.shortcut-list'],
    page: 'components/reading.html',
  },
] satisfies When[];
