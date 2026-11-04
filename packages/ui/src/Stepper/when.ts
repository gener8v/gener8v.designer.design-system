import type { When } from '../choosing.js';

export const when = [
  {
    name: 'Stepper',
    family: 'status-and-feedback',
    job: 'show where someone is in a named sequence of steps',
    use: [
      'A multi-step task where each step is an act the person performs — markers, one per step.',
      'A sequence that is a position the work is somewhere in — `rail`, which fills what is behind.',
      'A step that was refused (`failed`), interrupted (`stopped`) or passed over (`skipped`) — never left at current or marked complete. `size="sm"` and `description` for dense or explained steps.',
    ],
    not: [
      {
        when: 'building the whole multi-step form, with back and forward',
        use: 'Flow',
        because: 'the flow shell already holds a vertical stepper, one content region and the footer.',
      },
      {
        when: 'how much of one task is done, with no named steps',
        use: 'Progress',
        because: 'a bar says how much; a stepper says which.',
      },
      {
        when: 'many agents or items moving through waiting, working and done at once',
        use: 'Lanes',
        because: 'lanes show many items by state; a stepper is one sequence.',
      },
      {
        when: 'a list of tasks the system works through for the reader — setup, an agent\'s run',
        use: 'ProgressList',
        because: 'a stepper is a position the reader walks; a progress list reports work done for them, with a spinner on the running task.',
      },
      {
        when: 'events that already happened, in order',
        use: 'Timeline',
        because: 'a timeline is history; a stepper is position in a plan.',
      },
    ],
    neighbours: ['Flow', 'Progress', 'ProgressList', 'Lanes', 'Timeline', 'Checklist'],
    react: ['Stepper', 'Step'],
    css: ['.stepper', '.step'],
    page: 'components/flow.html',
  },
] satisfies When[];
