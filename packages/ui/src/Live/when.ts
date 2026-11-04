import type { When } from '../choosing.js';

export const when = [
  {
    name: 'Live',
    family: 'agents-and-live-work',
    job: 'show that work is happening right now, where the work is',
    use: [
      '`LiveIndicator` — a pulse with its words in a polite live region, "Agents working", at the head of a page or panel.',
      '`LiveMark` on a section heading, a `Contents` entry or a row; `LiveSection` around a part of a document being written.',
      '`Pulse` only beside words that already say the same thing — it is decorative and hidden from assistive tech.',
    ],
    not: [
      {
        when: 'one row\'s progress with a count — `§2.5 ▬▬▬▭ 4/6`',
        use: 'LiveProgress',
        because: 'live progress adds where, a bar and a count to the pulse, and becomes a tag when it finishes.',
      },
      {
        when: 'many items moving between waiting, working and done',
        use: 'Lanes',
        because: 'lanes show the whole run by state; a pulse marks one place.',
      },
      {
        when: 'a short wait with nothing running in the background',
        use: 'Spinner',
        because: 'a spinner is a control waiting; a pulse is work in progress somewhere the reader can look.',
      },
      {
        when: 'a state that has settled — done, failed',
        use: 'Tag',
        because: 'a pulse means moving; a finished thing is a status word.',
      },
    ],
    neighbours: ['LiveProgress', 'Lanes', 'Spinner', 'Tag'],
    react: ['Pulse', 'LiveIndicator', 'LiveMark', 'LiveSection'],
    hooks: ['liveWhere'],
    css: ['.live-pulse', '.live-indicator', '.live-mark', '.live-section'],
    page: 'components/live.html',
  },
  {
    name: 'LiveProgress',
    family: 'agents-and-live-work',
    job: 'show one row\'s live work — where it is, how far, and how it ended',
    use: [
      'Under a title in a list or a table row while a run works on that item: pulse, place, bar and count.',
      'Queued, done and failed in the same slot, so a row does not change shape as the work moves.',
    ],
    not: [
      {
        when: 'a single task with a percentage and no list around it',
        use: 'Progress',
        because: 'a progress bar is the bare measure; live progress is a row\'s whole live state.',
      },
      {
        when: 'the whole run at a glance, by state',
        use: 'Lanes',
        because: 'lanes show every item in its state; live progress sits on one row.',
      },
      {
        when: 'a level that is simply true',
        use: 'Meter',
        because: 'a meter is not work advancing.',
      },
    ],
    neighbours: ['Progress', 'Lanes', 'Live', 'ToolChip'],
    react: ['LiveProgress'],
    css: ['.live-progress'],
    page: 'components/live.html',
  },
  {
    name: 'Lanes',
    family: 'agents-and-live-work',
    job: 'show many items of a run moving between waiting, working and done',
    use: [
      'An agent run seen by a reader: each agent a pill that slides from Waiting to Working to Done; `AGENT_LANES` are the defaults.',
      'Every lane says its count; arrivals in an `announce` lane are said once in a polite live region.',
    ],
    not: [
      {
        when: 'one sequence of named steps',
        use: 'Stepper',
        because: 'a stepper is one path; lanes are many items sorted by state.',
      },
      {
        when: 'one item\'s progress in a row',
        use: 'LiveProgress',
        because: 'a row carries its own live state; lanes are the overview.',
      },
      {
        when: 'what happened, in order, after the run',
        use: 'Timeline',
        because: 'lanes are now; a timeline is then.',
      },
    ],
    neighbours: ['Stepper', 'LiveProgress', 'Live', 'Shelf'],
    react: ['Lanes'],
    hooks: ['AGENT_LANES'],
    css: ['.lanes', '.lane'],
    page: 'components/live.html',
  },
] satisfies When[];
