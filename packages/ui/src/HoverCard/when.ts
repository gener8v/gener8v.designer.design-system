import type { When } from '../choosing.js';

export const when = [
  {
    name: 'HoverCard',
    family: 'overlays',
    job: 'preview what a link, a name or an id leads to, on pointing or focus',
    use: [
      'A glance at what is behind a reference — a person behind a name, a requirement behind an id, a source behind a citation.',
      'Markers inside sanitised HTML you did not render in React: use `useDelegatedHoverCard` on the container.',
    ],
    not: [
      {
        when: 'the person has to act inside the panel',
        use: 'Popover',
        because: 'focus does not move into a hover card and Tab does not enter it; anything to press belongs in a popover.',
      },
      {
        when: 'one line that describes a control',
        use: 'Tooltip',
        because: 'a tooltip is the control\'s description; a hover card is a preview of somewhere else.',
      },
      {
        when: 'a citation marker in prose',
        use: 'Citation',
        because: 'the citation draws the marker and its `SourceCard`; the hover card is only the surface it opens in.',
      },
    ],
    neighbours: ['Tooltip', 'Popover', 'Citation'],
    react: ['HoverCard'],
    hooks: ['useDelegatedHoverCard'],
    css: ['.hover-card'],
    page: 'components/live.html',
  },
] satisfies When[];
