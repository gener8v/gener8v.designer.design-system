import type { When } from '../choosing.js';

export const when = [
  {
    name: 'Entry',
    family: 'screens',
    job: 'build the page between somebody and the product — sign in, accept an invitation',
    use: [
      'The first page anybody sees: it names the product, says what the person is about to do, and holds the way in.',
      'One recommended way in (`children`) and other ways below a rule (`alternatives`), so a second button does not read as a variant of the first.',
      'Something a person must know before they try — an invitation rule, a support address — goes in `note`.',
    ],
    not: [
      {
        when: 'the screen says there is nothing here, or that the person may not see it',
        use: 'State',
        because: 'an empty or denied state reports absence; a sign-in form drawn with it reads as a dead end.',
      },
      {
        when: 'getting in takes several steps of questions',
        use: 'Flow',
        because: 'a multi-step journey needs the step rail and the back/forward footer.',
      },
      {
        when: 'the page is the product itself — a header, a rail and content',
        use: 'Nav',
        because: 'the product starts from the app shell — header, rail, content; an entry page holds no navigation.',
      },
    ],
    neighbours: ['State', 'Flow', 'Card'],
    react: ['Entry'],
    css: ['.entry', '.entry-ground'],
    page: null,
  },
] satisfies When[];
