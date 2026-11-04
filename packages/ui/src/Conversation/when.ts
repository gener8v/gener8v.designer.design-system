import type { When } from '../choosing.js';

export const when = [
  {
    name: 'Conversation',
    family: 'agents-and-live-work',
    job: 'show a person asking and a system answering, as it happens',
    use: [
      'A chat with an agent or assistant: `sent` turns are bubbles, `received` turns are prose at full measure. New turns are announced.',
      '`TurnPending` while waiting for the reply — it carries the word, because an animation is not an announcement.',
      'Tool calls and confirmations sit inside received turns as `ToolChip` and `ConfirmCard`.',
    ],
    not: [
      {
        when: 'the record is an interview or meeting that nobody is adding to, with several speakers',
        use: 'Transcript',
        because: 'a transcript is worked through and marked as evidence; a conversation is two-sided and live.',
      },
      {
        when: 'people are leaving notes about a record',
        use: 'Comment',
        because: 'a comment is one authored note about something, with a time that matters.',
      },
      {
        when: 'the history is who did what to a record, in order',
        use: 'Feed',
        because: 'a feed groups each person\'s run of actions; it is not an exchange.',
      },
    ],
    neighbours: ['Transcript', 'Comment', 'Feed', 'ToolChip'],
    react: ['Conversation', 'Turn', 'TurnPending'],
    css: ['.conversation', '.turn'],
    page: 'components/agent.html',
  },
] satisfies When[];
