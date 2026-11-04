import type { When } from '../choosing.js';

export const when = [
  {
    name: 'Avatar',
    family: 'data',
    job: 'put a face or initials beside a person\'s name',
    use: [
      'Beside the name it depicts — in a comment, a feed group, a header menu. It is decorative there and hidden from assistive tech.',
      'A stack of people on one thing: `AvatarGroup`.',
      'Standing alone with no name beside it: pass `aria-label` so it has one.',
    ],
    not: [
      {
        when: 'the avatar would be the only place the person is named',
        use: 'Item',
        because: 'a name is text; put the avatar in an item\'s `lead` beside the name rather than instead of it.',
      },
      {
        when: 'the mark stands for a system or an integration, not a person',
        use: 'Connection',
        because: 'a connection has its own mark and says its state in words.',
      },
      {
        when: 'it shows who did a run of actions in order',
        use: 'Feed',
        because: 'a feed groups each person\'s run of actions and takes the avatar as the group\'s mark.',
      },
    ],
    neighbours: ['Item', 'Feed', 'Comment'],
    react: ['Avatar', 'AvatarGroup'],
    css: ['.avatar'],
    page: 'components/data.html',
  },
] satisfies When[];
