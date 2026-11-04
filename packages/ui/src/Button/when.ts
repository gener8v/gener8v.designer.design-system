import type { When } from '../choosing.js';

export const when = [
  {
    name: 'Button',
    family: 'input',
    job: 'let someone do an action, named with a verb',
    use: [
      'An action on the page — Save, Publish, Answer. One `primary` per view; `secondary` for equal alternatives; `ghost` in dense rows; `destructive` only for irreversible acts.',
      'An action that navigates: `ButtonLink` keeps a real anchor, so it opens in a new tab and works without JavaScript.',
      'An icon-only control: `iconOnly` makes `aria-label` required by the type.',
    ],
    not: [
      {
        when: 'the thing reports a state rather than doing something',
        use: 'Tag',
        because: 'a status is a tag and an action is a button; beside each other they must differ in shape, not only colour.',
      },
      {
        when: 'there are several actions on one object and not room for them all',
        use: 'Menu',
        because: 'a menu holds the secondary actions behind one trigger with the full menu keyboard contract.',
      },
      {
        when: 'a row of buttons picks one view of the same thing',
        use: 'Segmented',
        because: 'a choice between views is a radiogroup; buttons are acts, and a pressed button does not say which one is chosen.',
      },
      {
        when: 'a whole card is the link',
        use: 'Card',
        because: '`CardLink` makes the card one link target instead of a card with a button inside it.',
      },
    ],
    neighbours: ['ButtonGroup', 'Tag', 'Menu', 'Card'],
    react: ['Button', 'ButtonLink'],
    css: ['.btn'],
    page: 'components/buttons.html',
  },
] satisfies When[];
