import type { When } from '../choosing.js';

export const when = [
  {
    name: 'ButtonGroup',
    family: 'input',
    job: 'set a few related actions as one adjoining row',
    use: [
      'Two to four actions on the same object that belong together — Previous / Next, Zoom out / Zoom in.',
      'Give every child the same variant, and name the set with `label` for screen readers.',
    ],
    not: [
      {
        when: 'exactly one of the options is selected at a time',
        use: 'Segmented',
        because: 'a segmented control is a radiogroup that says which option is on; a button group is a set of acts with no selection.',
      },
      {
        when: 'the actions do not fit, or most are rarely used',
        use: 'Menu',
        because: 'a menu keeps the row to one trigger.',
      },
      {
        when: 'the buttons are unrelated actions that only happen to sit together',
        use: 'Button',
        because: 'separate buttons with space between them; joining them claims a relationship that is not there.',
      },
    ],
    neighbours: ['Segmented', 'Button', 'Menu'],
    react: ['ButtonGroup'],
    css: ['.btn-group'],
    page: 'components/buttons.html',
  },
] satisfies When[];
