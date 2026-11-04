import type { When } from '../choosing.js';

export const when = [
  {
    name: 'Comment',
    family: 'data',
    job: 'show authored notes about a thing, and a place to write the next one',
    use: [
      'An activity thread on a work item: each note with its author, a time and the text.',
      'The composer under the thread (`CommentCompose`) with its actions (`CommentActions`).',
    ],
    not: [
      {
        when: 'the record is what people did, not what they wrote',
        use: 'Feed',
        because: 'a feed groups each person\'s actions in order.',
      },
      {
        when: 'a person is talking with an agent that answers',
        use: 'Conversation',
        because: 'a conversation is two-sided and live, and announces turns as they arrive.',
      },
      {
        when: 'it is a record of what people said, to work through',
        use: 'Transcript',
        because: 'a transcript turn is part of a continuous exchange, timed against a recording.',
      },
    ],
    neighbours: ['Feed', 'Conversation', 'Transcript', 'Timeline'],
    react: ['Comment', 'CommentCompose', 'CommentActions'],
    css: ['.comment'],
    page: 'templates/work-item-close/',
  },
] satisfies When[];
