import type { When } from '../choosing.js';

export const when = [
  {
    name: 'Progress',
    family: 'status-and-feedback',
    job: 'show how far a task has got toward done',
    use: [
      'An upload, an import or an export with a known fraction complete — pass `value` 0–100.',
      'A task that is under way with no known fraction: omit `value` for the indeterminate bar.',
      '`ProgressRing` where a bar does not fit — a compact figure beside a title.',
    ],
    not: [
      {
        when: 'a level that is simply true — usage, capacity, a score against a target',
        use: 'Meter',
        because: '`role="meter"` reports a level; a progress bar says a task is advancing, and swapping them misreports what is happening.',
      },
      {
        when: 'one row\'s live work in a list or table, with where it is and a count',
        use: 'LiveProgress',
        because: 'live progress carries the pulse, the place being worked and the count, and turns into a tag when done or failed.',
      },
      {
        when: 'the person is moving through named steps',
        use: 'Stepper',
        because: 'a stepper names each step and its state; a bar only says how much.',
      },
      {
        when: 'a short wait inside a control with nothing to measure',
        use: 'Spinner',
        because: 'a spinner is the smallest "still working" and takes no room.',
      },
    ],
    neighbours: ['Meter', 'LiveProgress', 'Stepper', 'Spinner'],
    react: ['Progress', 'ProgressRing'],
    css: ['.progress'],
    page: 'components/flow.html',
  },
] satisfies When[];
