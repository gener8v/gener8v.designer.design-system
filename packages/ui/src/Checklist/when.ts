import type { When } from '../choosing.js';

export const when = [
  {
    name: 'Checklist',
    family: 'input',
    job: 'tick off criteria and keep the record of what was checked',
    use: [
      'Acceptance criteria before closing a work item: a done item recedes and is struck through, never removed — the record is part of the artifact.',
      '`purpose="manifest"` for what is about to be written: checked items are the point, so they do not recede.',
    ],
    not: [
      {
        when: 'the ticks are independent settings or form answers',
        use: 'Choice',
        because: 'checkboxes answer questions; a checklist is a record of work done.',
      },
      {
        when: 'the items are steps in a sequence with one current step',
        use: 'Stepper',
        because: 'a stepper shows position in an order; a checklist can be ticked in any order.',
      },
      {
        when: 'the system is doing the tasks and the reader is watching',
        use: 'ProgressList',
        because: 'a progress list reports work in progress with a spinner and failures; a checklist is ticked by hand.',
      },
      {
        when: 'the reader is ticking off sections of a document as reviewed',
        use: 'Contents',
        because: 'the contents carries its own reviewed boxes beside each section link.',
      },
    ],
    neighbours: ['Choice', 'Stepper', 'Contents', 'ProgressList'],
    react: ['Checklist', 'ChecklistItem'],
    css: ['.checklist'],
    page: 'templates/work-item-close/',
  },
] satisfies When[];
