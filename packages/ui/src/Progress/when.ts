import type { When } from '../choosing.js';

export const when = [
  {
    name: 'Progress',
    family: 'status-and-feedback',
    job: 'show how far one task has got toward done',
    use: [
      'An upload, an import or an export with a known fraction — `value` of `max`; `label`, `helper` and the value lay out by the family rule: label start, value end, helper under.',
      'Under way with no known fraction: omit `value` for the indeterminate bar; `tone` only once it has ended (success, warning, danger).',
      '`ProgressRing` where a bar does not fit — 16 to 64px, the value inside from 48px, an icon or nothing in the centre.',
    ],
    not: [
      {
        when: 'a level that is simply true — usage, capacity, a score against a target',
        use: 'Meter',
        because: '`role="meter"` reports a level; a progress bar says a task is advancing, and swapping them misreports what is happening.',
      },
      {
        when: 'many items, each finished one way or another — 6 done, 1 failed, 3 to go',
        use: 'SegmentedProgress',
        because: 'one fill cannot say how things finished; a segmented bar splits the track by state and says each count.',
      },
      {
        when: 'the reader needs to see WHICH tasks are done, not just how many',
        use: 'ProgressList',
        because: 'a bar is a quantity; a checklist names each task and its state.',
      },
      {
        when: 'one row\'s live work in a list or table, with where it is and a count',
        use: 'LiveProgress',
        because: 'live progress carries the pulse, the place being worked and the count, and turns into a tag when done or failed.',
      },
      {
        when: 'a file being uploaded or downloaded',
        use: 'FileProgress',
        because: 'a transfer row carries the name, the size, cancel and retry around the same bar.',
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
    neighbours: ['Meter', 'SegmentedProgress', 'ProgressList', 'LiveProgress', 'FileProgress', 'Stepper', 'Spinner'],
    react: ['Progress', 'ProgressRing'],
    css: ['.progress', '.progress-ring'],
    page: 'components/flow.html',
  },
  {
    name: 'ProgressMark',
    family: 'status-and-feedback',
    job: 'mark one item\'s state with the progress family\'s disc or glyph',
    use: [
      '`ProgressMark` — a 24px (or 16px) disc in one of the six states: queued, current (a spinner), complete, failed, stopped, skipped. The same disc a stepper marker draws.',
      '`ProgressGlyph` — the tick, cross, dash or `!` inline at 1em, beside a word that says the same thing.',
    ],
    not: [
      {
        when: 'a whole list of tasks with their states and a count',
        use: 'ProgressList',
        because: 'the checklist already lays out the marks, the labels and the count, and announces failures.',
      },
      {
        when: 'a status word with a tint, standing alone',
        use: 'Tag',
        because: 'a tag is the status; a mark is decoration beside words and is hidden from assistive tech.',
      },
    ],
    neighbours: ['ProgressList', 'Tag', 'Stepper'],
    react: ['ProgressMark', 'ProgressGlyph'],
    hooks: ['PROGRESS_STATE_WORDS', 'PROGRESS_STATE_GLYPH'],
    css: ['.progress-mark', '.progress-glyph'],
    page: 'components/flow.html',
  },
  {
    name: 'SegmentedProgress',
    family: 'status-and-feedback',
    job: 'show how a set of items is going, split by how each one finished',
    use: [
      'A batch, a run or a set of checks: one track split into done, failed, stopped, skipped, running and to go, with a legend that says every count in words.',
      'The value is how many have finished however they finished, and assistive tech hears the whole breakdown — "6 done, 1 failed, 3 to go".',
    ],
    not: [
      {
        when: 'one task with one fraction done',
        use: 'Progress',
        because: 'a single fill is clearer when there is only one way to finish.',
      },
      {
        when: 'the reader needs each item by name',
        use: 'ProgressList',
        because: 'a segmented bar counts; a checklist names.',
      },
      {
        when: 'the items move between states while the reader watches, by name',
        use: 'Lanes',
        because: 'lanes show each agent as a pill sliding between states; a segmented bar is the summary.',
      },
      {
        when: 'parts of a whole that are not progress — a budget by category, a share of votes',
        use: 'BarChart',
        because: 'a stacked bar chart is a composition; this is work advancing, coloured by state.',
      },
    ],
    neighbours: ['Progress', 'ProgressList', 'Lanes', 'BarChart'],
    react: ['SegmentedProgress'],
    css: ['.progress-segments', '.progress-legend'],
    page: 'components/flow.html',
  },
  {
    name: 'ProgressList',
    family: 'status-and-feedback',
    job: 'show a list of tasks the system is working through, each with its state, and how many are done',
    use: [
      'Setup, onboarding or an agent\'s run: each task with its mark, an optional description, and `3 of 7` with a 4px bar.',
      'The running task\'s mark is the spinner and the list is `aria-busy`; a failure and the end of the list are announced, nothing else.',
    ],
    not: [
      {
        when: 'the reader ticks the items off themselves',
        use: 'Checklist',
        because: 'a checklist is checkboxes the reader owns; a progress list reports work the system does.',
      },
      {
        when: 'steps of a form the reader moves through, one current, with back and next',
        use: 'Stepper',
        because: 'a stepper is a position in an order the reader walks; a progress list is work being done for them.',
      },
      {
        when: 'many items, where only the counts matter',
        use: 'SegmentedProgress',
        because: 'naming a hundred items is a wall; a segmented bar says how many in each state.',
      },
      {
        when: 'several agents running at once',
        use: 'Lanes',
        because: 'lanes show concurrency — who is waiting, working and done; a list is one sequence.',
      },
    ],
    neighbours: ['Checklist', 'Stepper', 'SegmentedProgress', 'Lanes'],
    react: ['ProgressList'],
    css: ['.progress-list'],
    page: 'components/flow.html',
  },
] satisfies When[];
