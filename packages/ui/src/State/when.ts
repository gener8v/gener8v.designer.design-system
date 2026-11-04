import type { When } from '../choosing.js';

export const when = [
  {
    name: 'State',
    family: 'status-and-feedback',
    job: 'stand in for content that is loading, empty, partial, failed, denied or done',
    use: [
      'A region has no content to show and needs to say why: `kind` is loading, empty, partial, error, denied or success.',
      'A figure or list built from some sources but not all — `partial` says which are missing.',
      'An empty list that names its cause and offers the way out in `StateActions`; `art` gives an empty place a line drawing.',
    ],
    not: [
      {
        when: 'the content is there and something about it needs saying',
        use: 'Alert',
        because: 'an alert sits above content that is still shown; a state replaces it.',
      },
      {
        when: 'the region is still loading and its shape is known',
        use: 'Skeleton',
        because: 'a skeleton holds the layout while it reads; `State kind="loading"` is for when the shape is not known.',
      },
      {
        when: 'a sign-in or access page that stands before the product',
        use: 'Entry',
        because: 'a way in is not an empty state; read as one it looks like a dead end.',
      },
      {
        when: 'confirming a quick action that worked',
        use: 'Toast',
        because: 'a success state replaces a whole region; most successes only need a toast.',
      },
    ],
    neighbours: ['Alert', 'Skeleton', 'Entry', 'Toast', 'Spinner'],
    react: ['State', 'StateIcon', 'StateTitle', 'StateBody', 'StateActions', 'StateDetail', 'StateArt'],
    css: ['.state'],
    page: 'components/states.html',
  },
] satisfies When[];
