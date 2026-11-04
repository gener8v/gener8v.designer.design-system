import type { When } from '../choosing.js';

export const when = [
  {
    name: 'ToastProvider',
    family: 'status-and-feedback',
    job: 'raise toasts from anywhere in an app, with the queue and timers handled',
    use: [
      'Wrap the app once and call `useToast().toast({ title, tone })` from any component.',
      'Toasts should time out, pause while the pointer is over them, and cap at a few on screen.',
      'A toast with an action: pass `duration: 0` so it stays until dismissed.',
    ],
    not: [
      {
        when: 'you render the toast markup yourself, or in static HTML',
        use: 'Toast',
        because: 'the provider renders `Toast` for you; use the parts directly only when you own the queue.',
      },
      {
        when: 'the message describes a condition rather than an event',
        use: 'Alert',
        because: 'a queued toast times out; a condition has to stay on the page.',
      },
    ],
    neighbours: ['Toast', 'Alert'],
    react: ['ToastProvider'],
    hooks: ['useToast'],
    css: [],
    page: null,
  },
] satisfies When[];
