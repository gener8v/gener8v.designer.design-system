import type { When } from '../choosing.js';

export const when = [
  {
    name: 'ToolChip',
    family: 'agents-and-live-work',
    job: 'show an agent\'s tool call as a chip — running, then what it found',
    use: [
      'Each tool an agent calls inside a conversation: a pulse and what it is doing while it runs, the result once it lands.',
      'Refused and failed calls say so in a tag, in words; the arguments are a press away for the one reader who wants them.',
    ],
    not: [
      {
        when: 'the call writes a change a person has to answer',
        use: 'ConfirmCard',
        because: 'nothing should be written until the yes; a chip reports a call, it does not ask.',
      },
      {
        when: 'the thing is a status label with nothing to open',
        use: 'Tag',
        because: 'a tag is a word for a state; a chip is a call with arguments and a result.',
      },
      {
        when: 'the work is a long run with a count of parts, on a row of a list',
        use: 'LiveProgress',
        because: 'live progress shows where the work is and how far it has got.',
      },
    ],
    neighbours: ['ConfirmCard', 'Tag', 'LiveProgress', 'Live'],
    react: ['ToolChip'],
    hooks: ['toolWords'],
    css: ['.tool-chip'],
    page: 'components/agent.html',
  },
  {
    name: 'ConfirmCard',
    family: 'agents-and-live-work',
    job: 'ask a person to confirm or approve a change an agent proposes, inline',
    use: [
      'An agent wants to write something: the card says the change, the values it will write, and who answers (`tier`). Nothing is written until the yes.',
      'A change that costs money: `spend` says so in a tag before the button, and the yes becomes Approve Spend.',
      'Once answered it stays as a record — the buttons go and the answer takes their place.',
    ],
    not: [
      {
        when: 'the decision interrupts the whole page and has nothing to do with a conversation',
        use: 'Dialog',
        because: 'a dialog is modal and goes away when answered; a confirm card stays in the thread as the record.',
      },
      {
        when: 'the person only needs to know something, not answer it',
        use: 'Alert',
        because: 'an alert reports; a confirm card asks and blocks the write until answered.',
      },
      {
        when: 'the tool call has already run',
        use: 'ToolChip',
        because: 'a chip reports what a call did; a confirm card is for a change not yet made.',
      },
    ],
    neighbours: ['Dialog', 'ToolChip', 'Alert'],
    react: ['ConfirmCard'],
    css: ['.confirm-card'],
    page: 'components/agent.html',
  },
] satisfies When[];
