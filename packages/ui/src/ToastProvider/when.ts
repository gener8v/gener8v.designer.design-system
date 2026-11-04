import type { When } from '../choosing.js';

export const when = [
  {
    name: 'ToastProvider',
    family: 'status-and-feedback',
    job: 'raise toasts from anywhere in an app, with the queue and timers handled',
    use: [
      'Wrap the app once and call `useToast().toast({ title, tone })` from any component.',
      'Toasts should time out, pause while the pointer is over them, and cap at a few on screen.',
      'Undo after the fact: `toast({ title, action: { label: \'Undo\', onAction } })`. A toast with an action stays until dismissed (it defaults to `duration: 0`), and its button is announced with it and reached by Tab.',
    ],
    not: [
      {
        when: 'you render the toast markup yourself, or in static HTML',
        use: 'Toast',
        because: 'the provider renders `Toast` for you; use the parts directly only when you own the queue.',
      },
      {
        when: 'the person has to decide something — confirm a delete, choose between two outcomes',
        use: 'Dialog',
        because: 'an action in a toast is right for undo, not for a decision; a decision needs a modal that holds focus until it is answered.',
      },
      {
        when: 'an agent asks the person to confirm or approve a change',
        use: 'ConfirmCard',
        because: 'an action in a toast is right for undo, not for a decision; the confirm card shows what will change and waits for an answer.',
      },
      {
        when: 'the message describes a condition rather than an event',
        use: 'Alert',
        because: 'a queued toast times out; a condition has to stay on the page.',
      },
    ],
    neighbours: ['Toast', 'Alert', 'Dialog', 'ConfirmCard'],
    react: ['ToastProvider'],
    hooks: ['useToast'],
    css: [],
    page: null,
  },
] satisfies When[];
