import type { When } from '../choosing.js';

export const when = [
  {
    name: 'Dialog',
    family: 'overlays',
    job: 'stop the page for a decision the person has to make now',
    use: [
      'A confirmation before something irreversible — list what it will write in the body, and turn `dismissOnBackdrop` off.',
      'A short, self-contained task that must finish or be cancelled before the page is usable again.',
      'Give it a `tone` when the decision is destructive, so the surface says so and not only the prose.',
    ],
    not: [
      {
        when: 'a longer panel of detail or navigation that slides in beside the page',
        use: 'Drawer',
        because: 'a drawer is a modal side panel with a pinned head and a scrolling body; a dialog is a centred decision.',
      },
      {
        when: 'a few controls anchored to a button, with the page still usable',
        use: 'Popover',
        because: 'a popover is non-modal and does not trap Tab; a dialog takes the page over.',
      },
      {
        when: 'an agent proposes a change in a conversation and a person must approve it',
        use: 'ConfirmCard',
        because: 'the confirm card sits inline, stays as a record once answered, and states spend before the button.',
      },
      {
        when: 'reporting something that needs no answer',
        use: 'Alert',
        because: 'an alert can be read past; a dialog demands dismissal.',
      },
      {
        when: 'searching for a command or place across the app',
        use: 'CommandPalette',
        because: 'the palette is a dialog built for typing and choosing; do not rebuild it from `Dialog`.',
      },
    ],
    neighbours: ['Drawer', 'Popover', 'ConfirmCard', 'CommandPalette'],
    react: ['Dialog'],
    hooks: ['useModalBehavior'],
    css: ['.dialog'],
    page: 'components/feedback.html',
  },
] satisfies When[];
