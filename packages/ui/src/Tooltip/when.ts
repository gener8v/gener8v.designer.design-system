import type { When } from '../choosing.js';

export const when = [
  {
    name: 'Tooltip',
    family: 'overlays',
    job: 'describe a control in a line, on hover or focus',
    use: [
      'An icon button or a terse label needs a few words of description — "Copy link", "Last synced 4 minutes ago".',
      'Instead of a `title` attribute, which the operating system draws and touch and keyboards never reach.',
    ],
    not: [
      {
        when: 'the words are the control\'s only name',
        use: 'Button',
        because: 'a tooltip describes via `aria-describedby`; an icon-only button needs its own `aria-label`.',
      },
      {
        when: 'the hint is load-bearing — something the person must read to fill a field',
        use: 'Field',
        because: 'a field hint is always on screen; a tooltip is only there for someone who points at it.',
      },
      {
        when: 'a preview of what a link or id leads to',
        use: 'HoverCard',
        because: 'a hover card holds a card of content; a tooltip holds a line.',
      },
      {
        when: 'controls or a form inside the floating panel',
        use: 'Popover',
        because: 'nothing in a tooltip can be pressed.',
      },
    ],
    neighbours: ['HoverCard', 'Popover', 'Callout', 'Field'],
    react: ['Tooltip'],
    css: ['.tooltip'],
    page: 'components/feedback.html',
  },
] satisfies When[];
