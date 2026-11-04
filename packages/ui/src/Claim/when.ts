import type { When } from '../choosing.js';

export const when = [
  {
    name: 'Claim',
    family: 'data',
    job: 'set out a proposition somebody has to adjudicate — the assertion, the argument, where it stands',
    use: [
      'A finding, a held-open decision, or a reading a machine proposed and a person has not confirmed.',
      'The argument has an author (`ClaimReason by`), because whether a machine or a person wrote it is the first thing a reader needs.',
      'Where it stands is said once (`ClaimStanding`), with the controls level with the first line; `settled` once it is decided.',
    ],
    not: [
      {
        when: 'the rows are records with a name, not sentences to judge',
        use: 'Item',
        because: 'an item is a one-line title and provenance; a claim is prose with a case attached.',
      },
      {
        when: 'an agent proposes a change that will be written on a yes',
        use: 'ConfirmCard',
        because: 'a confirm card shows the values it will write and stays as the record of the answer.',
      },
      {
        when: 'it is an authored note about something, in a thread',
        use: 'Comment',
        because: 'a comment is a note with an author and a time; nothing is adjudicated.',
      },
    ],
    neighbours: ['Item', 'ConfirmCard', 'Comment', 'Callout'],
    react: ['Claim', 'ClaimActions', 'ClaimBody', 'ClaimReason', 'ClaimStanding', 'ClaimText'],
    css: ['.claim'],
    page: null,
  },
] satisfies When[];
