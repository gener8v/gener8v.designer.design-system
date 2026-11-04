import type { When } from '../choosing.js';

export const when = [
  {
    name: 'Popover',
    family: 'overlays',
    job: 'open a small panel of content or controls beside the button that opened it',
    use: [
      'A click opens a few controls or a short form anchored to its trigger — a date, a share setting, a run\'s detail.',
      'The page stays usable: Escape and a click outside close it, and Tab is not trapped.',
      '`size="lg"` for a panel with a reading width of its own that scrolls inside itself.',
    ],
    not: [
      {
        when: 'a list of actions or choices',
        use: 'Menu',
        because: 'a menu has the menu-button keyboard contract and closes on choice; a popover is free content.',
      },
      {
        when: 'a preview that opens by pointing or focus and needs no action inside',
        use: 'HoverCard',
        because: 'a hover card opens on dwell and focus; a popover waits for a click.',
      },
      {
        when: 'one line describing a control',
        use: 'Tooltip',
        because: 'a tooltip is a description wired by `aria-describedby`, not a panel.',
      },
      {
        when: 'the person must finish or cancel before going on',
        use: 'Dialog',
        because: 'a popover you cannot Tab out of is a dialog wearing the wrong clothes.',
      },
    ],
    neighbours: ['Menu', 'HoverCard', 'Tooltip', 'Dialog'],
    react: ['Popover', 'PopoverTitle', 'PopoverActions'],
    hooks: ['useAnchoredPosition'],
    css: ['.popover'],
    page: 'components/live.html',
  },
] satisfies When[];
