import type { When } from '../choosing.js';

export const when = [
  {
    name: 'Drawer',
    family: 'overlays',
    job: 'slide a modal panel in from the side of the page',
    use: [
      'The site links behind a `Hamburger` on a phone (`side="end"`), or a rail that becomes a drawer on small screens (`side="start"`).',
      'Detail about one item — a source, a finding, a transcript — read beside the page, with `header` pinned and a `PagerChip` to step through the set.',
      '`size="lg"` for a reading width; it takes the whole screen on a phone.',
    ],
    not: [
      {
        when: 'a short decision that blocks the page',
        use: 'Dialog',
        because: 'a dialog is a centred decision with actions; a drawer is a panel to read or move around in.',
      },
      {
        when: 'the side pane should stay open while the person works in the page',
        use: 'Split',
        because: 'a split pane is part of the layout and does not trap focus; a drawer is modal.',
      },
      {
        when: 'a small panel anchored to the control that opened it',
        use: 'Popover',
        because: 'a popover floats beside its trigger and leaves the page usable.',
      },
    ],
    neighbours: ['Dialog', 'Split', 'Popover', 'Sidebar'],
    react: ['Drawer'],
    css: ['.drawer-panel', '.drawer-scrim', '.drawer-head', '.drawer-body', '.drawer-close'],
    page: 'components/navigation.html',
  },
] satisfies When[];
