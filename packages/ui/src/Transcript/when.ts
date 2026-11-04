import type { When } from '../choosing.js';

export const when = [
  {
    name: 'Transcript',
    family: 'reading',
    job: 'show a recorded exchange somebody works through and marks as evidence',
    use: [
      'An interview or session transcript with any number of speakers, read in order and marked for what each stretch is evidence of.',
      'Actions on a turn appear on interaction, not on every row — an hour is hundreds of turns.',
    ],
    not: [
      {
        when: 'the exchange is live, between the person and a system answering them',
        use: 'Conversation',
        because: 'a conversation is two-sided, appended to and announced as it arrives.',
      },
      {
        when: 'each entry is a note left about a record',
        use: 'Comment',
        because: 'a comment is one authored note about something; a transcript turn is part of a continuous exchange.',
      },
    ],
    neighbours: ['Conversation', 'Comment', 'Citation'],
    react: ['Transcript', 'TranscriptTurn'],
    css: ['.transcript'],
    page: null,
  },
] satisfies When[];
