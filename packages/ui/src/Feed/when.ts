import type { When } from '../choosing.js';

export const when = [
  {
    name: 'Feed',
    family: 'data',
    job: 'show who did what, in order, with each person\'s run of actions kept together',
    use: [
      'An activity record: one person opened three findings, then another answered two of them — a `FeedGroup` per actor, a `FeedItem` per action.',
      'An ordered list of groups, so a screen reader announces "3 of 5" without anything written for it.',
    ],
    not: [
      {
        when: 'the events have nobody in them',
        use: 'Timeline',
        because: 'a timeline is a chronology of events; a feed is a sequence of people.',
      },
      {
        when: 'people discuss the thing in their own words',
        use: 'Comment',
        because: 'a comment is an authored note with a composer; a feed records actions.',
      },
      {
        when: 'it is an exchange of what people said in an interview or meeting',
        use: 'Transcript',
        because: 'a transcript is a record of speech somebody works from, with times into a recording.',
      },
    ],
    neighbours: ['Timeline', 'Comment', 'Transcript', 'Item'],
    react: ['Feed', 'FeedGroup', 'FeedItem'],
    css: ['.feed'],
    page: 'components/flow.html',
  },
] satisfies When[];
