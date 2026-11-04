import type { When } from '../choosing.js';

export const when = [
  {
    name: 'Segmented',
    family: 'navigation',
    job: 'pick one of two or three views of the same thing',
    use: [
      'Two or three mutually exclusive views of one set — Week / Month / Quarter, List / Grid.',
      'Seeing the alternatives side by side is the point, and the strip is only as wide as the choices.',
      'A short either/or answer in a form, named with `label` so the group reads as a question.',
    ],
    not: [
      {
        when: 'each option shows a different panel of content',
        use: 'Tabs',
        because: 'a segmented control is a radiogroup, not a tablist; it changes how one thing is shown, not which thing.',
      },
      {
        when: 'the options narrow a list, or there may be more than three values',
        use: 'Filter',
        because: 'a filter is a dimension with a value; spelled out as a strip it grows across the page and hides which dimensions exist.',
      },
      {
        when: 'each choice needs a description or a figure under it',
        use: 'RadioCards',
        because: 'a radio card carries a title, a note and a figure, and the whole card is the hit target.',
      },
      {
        when: 'there are more than a handful of options to pick from',
        use: 'Select',
        because: 'a long run of segments stops reading as one control; a select holds the list behind one field.',
      },
    ],
    neighbours: ['Tabs', 'Filter', 'RadioCards', 'ButtonGroup'],
    react: ['Segmented', 'SegmentedItem'],
    css: ['.segmented'],
    page: 'components/disclosure.html',
  },
] satisfies When[];
