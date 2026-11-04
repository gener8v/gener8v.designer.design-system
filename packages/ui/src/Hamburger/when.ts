import type { When } from '../choosing.js';

export const when = [
  {
    name: 'Hamburger',
    family: 'navigation',
    job: 'open and close the navigation on a narrow screen',
    use: [
      'The header\'s links do not fit on a phone; this button opens them, usually in a `Drawer`.',
      'One button whose bars morph to an X, driven by `open` and announced through `aria-expanded`; `label` is required.',
    ],
    not: [
      {
        when: 'the button opens a list of actions, not navigation',
        use: 'Menu',
        because: 'a menu button opens a menu of actions with its own keyboard contract.',
      },
      {
        when: 'the screen is wide enough to show the links',
        use: 'Nav',
        because: 'navigation that fits should be visible, not behind a button.',
      },
    ],
    neighbours: ['Drawer', 'Nav', 'Menu'],
    react: ['Hamburger'],
    css: ['.hamburger'],
    page: 'components/navigation.html',
  },
] satisfies When[];
