import type { When } from '../choosing.js';

export const when = [
  {
    name: 'RadioCards',
    family: 'input',
    job: 'pick one option that needs a description and a figure to choose between',
    use: [
      'A choice where the label alone does not settle it — a delivery speed with its price, a plan with what it includes.',
      'Wrap in a fieldset with a legend: the group needs a name. `columns` sets short options side by side.',
    ],
    not: [
      {
        when: 'the options are short words that need no description',
        use: 'Choice',
        because: 'plain radios take a line each; cards for one-word options spend space on nothing.',
      },
      {
        when: 'the choice switches how one thing is shown',
        use: 'Segmented',
        because: 'a view switch is a compact strip, not a form answer.',
      },
      {
        when: 'there are many options',
        use: 'Select',
        because: 'more than a handful of cards stops being a comparison.',
      },
    ],
    neighbours: ['Choice', 'Segmented', 'Select'],
    react: ['RadioCards', 'RadioCard'],
    css: ['.radio-cards', '.radio-card'],
    page: 'templates/purchase/',
  },
] satisfies When[];
