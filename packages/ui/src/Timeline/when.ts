import type { When } from '../choosing.js';

export const when = [
  {
    name: 'Timeline',
    family: 'data',
    job: 'show events in the order they happened',
    use: [
      'A chronology of events with nobody in them — submitted, reviewed, released — each with a time, a title and an optional body.',
      'Marking the live entry: `current` highlights its marker.',
    ],
    not: [
      {
        when: 'the history is people doing things, several in a row each',
        use: 'Feed',
        because: 'a feed groups each person\'s run of actions so the boundaries between people are seen, not read.',
      },
      {
        when: 'people write notes about the thing and reply',
        use: 'Comment',
        because: 'a comment is an authored note with a composer; a timeline entry is an event.',
      },
      {
        when: 'the steps are a process the person is part-way through',
        use: 'Stepper',
        because: 'a stepper shows position in a sequence still to finish; a timeline records what already happened.',
      },
    ],
    neighbours: ['Feed', 'Comment', 'Stepper', 'Transcript'],
    react: ['Timeline', 'TimelineItem'],
    css: ['.timeline'],
    page: 'components/flow.html',
  },
] satisfies When[];
