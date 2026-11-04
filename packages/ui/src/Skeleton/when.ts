import type { When } from '../choosing.js';

export const when = [
  {
    name: 'Skeleton',
    family: 'status-and-feedback',
    job: 'hold the shape of content that is still being read',
    use: [
      'A page or a list is loading and its layout is known — lines of text, a title, a block, an avatar circle.',
      'Inside a region that announces its own loading (`aria-busy`); each bar is always `aria-hidden`.',
    ],
    not: [
      {
        when: 'there is nothing to show',
        use: 'State',
        because: 'a skeleton means "still reading" and never "nothing here"; an empty state names the cause and the way out.',
      },
      {
        when: 'the read failed, or a failed read is being retried',
        use: 'State',
        because: 'a skeleton never tells you it has finished; an error state says what went wrong, and the retry button shows its own wait.',
      },
      {
        when: 'a figure is shown from only some of its sources',
        use: 'State',
        because: 'the read finished; a skeleton would claim it is still loading. `State kind="partial"` says what is missing.',
      },
      {
        when: 'the wait is short and the layout is not known',
        use: 'Spinner',
        because: 'a spinner marks a brief wait without promising a shape.',
      },
      {
        when: 'a section is being written by a run right now',
        use: 'Live',
        because: '`LiveSection` and `LiveMark` say the section is being written, in words.',
      },
    ],
    neighbours: ['Spinner', 'State', 'Live'],
    react: ['Skeleton'],
    css: ['.skeleton'],
    page: 'components/flow.html',
  },
] satisfies When[];
