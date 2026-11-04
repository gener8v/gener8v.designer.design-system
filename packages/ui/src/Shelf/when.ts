import type { When } from '../choosing.js';

export const when = [
  {
    name: 'Shelf',
    family: 'input',
    job: 'move things between two places',
    use: [
      'Taking items out of one place and putting them in another — included and excluded, in scope and out.',
      'Drag by the grip, or Space, arrows, Space by keyboard; the row itself opens the item. A fixed item says why it cannot move.',
      '`layout="stack"` when the shelf lives in a narrow rail.',
    ],
    not: [
      {
        when: 'each item is simply on or off',
        use: 'Choice',
        because: 'a list of switches answers "is this on"; a shelf is for a movement the reader should see.',
      },
      {
        when: 'items are ordered or grouped by state across more than two places',
        use: 'Lanes',
        because: 'lanes show work moving through states; a shelf has exactly two zones the person moves things between.',
      },
    ],
    neighbours: ['Choice', 'Lanes', 'Item'],
    react: ['Shelf'],
    css: ['.shelf'],
    page: null,
  },
] satisfies When[];
