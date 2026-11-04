import type { When } from '../choosing.js';

export const when = [
  {
    name: 'Toast',
    family: 'status-and-feedback',
    job: 'confirm that something just happened, briefly, without taking focus',
    use: [
      'The result of an action the person took — "Saved", "Invite sent", "Export ready".',
      'An event that happened elsewhere while they work, worth a glance and no more.',
      'Rendering the surface yourself; mount `ToastRegion` once, near the root, before any toast is added.',
    ],
    not: [
      {
        when: 'you want to raise a toast from anywhere in the app with timers handled',
        use: 'ToastProvider',
        because: 'the provider owns the queue, the timeout and the pause on hover; `Toast` is only the surface.',
      },
      {
        when: 'the condition is still true after the moment passes — a failed source, a stale figure',
        use: 'Alert',
        because: 'a toast leaves; a condition that leaves with it is a condition nobody can find again.',
      },
      {
        when: 'the person has to decide something before going on',
        use: 'Dialog',
        because: 'a toast is polite and can be missed; a decision needs a modal that holds focus.',
      },
      {
        when: 'the region the action was meant to fill is empty or failed',
        use: 'State',
        because: 'the result belongs where the content would be, not in a corner.',
      },
    ],
    neighbours: ['ToastProvider', 'Alert', 'State'],
    react: ['ToastRegion', 'Toast', 'ToastTitle', 'ToastBody', 'ToastClose'],
    css: ['.toast'],
    page: 'components/feedback.html',
  },
] satisfies When[];
