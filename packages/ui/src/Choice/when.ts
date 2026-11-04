import type { When } from '../choosing.js';

export const when = [
  {
    name: 'Choice',
    family: 'input',
    job: 'tick a box, pick a radio, or turn a setting on or off',
    use: [
      '`Checkbox` for independent yes/no answers, any number at once; `Radio` for one of a few short options in a form.',
      '`Switch` for a setting that takes effect on its own — on or off, not selected or unselected.',
      'Always wrap the control and its text in `Choice`: the label is the hit target, so the whole row is clickable at 44px.',
    ],
    not: [
      {
        when: 'each option needs a description or a figure — a plan, a delivery speed',
        use: 'RadioCards',
        because: 'the whole card is the label and carries a title, a note and a figure.',
      },
      {
        when: 'the choice is between two or three views of the same thing',
        use: 'Segmented',
        because: 'views are switched in a strip; radios are answers in a form.',
      },
      {
        when: 'there are more options than fit as a short list of radios',
        use: 'Select',
        because: 'a select holds a long list behind one field.',
      },
      {
        when: 'the ticks are acceptance criteria or a record of what was checked',
        use: 'Checklist',
        because: 'a checklist keeps done items in view as evidence, struck through rather than removed.',
      },
      {
        when: 'items move between two places — included and excluded, here and there',
        use: 'Shelf',
        because: 'a shelf shows the movement; a list of switches shows only the resulting state.',
      },
    ],
    neighbours: ['RadioCards', 'Segmented', 'Select', 'Checklist', 'Shelf'],
    react: ['Choice', 'ChoiceHint', 'Checkbox', 'Radio', 'Switch'],
    css: ['.choice', '.checkbox', '.radio', '.switch'],
    page: 'components/forms.html',
  },
] satisfies When[];
