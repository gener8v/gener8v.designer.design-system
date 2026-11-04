import type { When } from '../choosing.js';

export const when = [
  {
    name: 'Tag',
    family: 'status-and-feedback',
    job: 'say in one or two words what state a thing is in',
    use: [
      'A row, card or heading reports a status — Draft, Approved, At risk, Failed — and the variant maps to its meaning.',
      'A quiet marker on a dense row: `dot` puts a filled dot before the word instead of a tint.',
    ],
    not: [
      {
        when: 'the word is something the reader can press to do something',
        use: 'Button',
        because: 'a status is a tag and an action is a button; where both sit on one row they must differ in shape, not only in colour.',
      },
      {
        when: 'the value is a neutral attribute — an owner, a standard, a type — that may narrow the list',
        use: 'Facet',
        because: 'a tag carries no status here and is decoration; a facet is a name and a value, and narrows when pressed.',
      },
      {
        when: 'the state is an integration being connected, degraded or off',
        use: 'Connection',
        because: '`ConnectionStatus` carries the integration states with a decorative dot and the word.',
      },
      {
        when: 'the status needs a sentence to explain it',
        use: 'Alert',
        because: 'a tag is one or two words; prose belongs in an alert, a hint or a state body.',
      },
    ],
    neighbours: ['Facet', 'Button', 'Connection', 'LiveProgress'],
    react: ['Tag'],
    css: ['.tag'],
    page: 'components/cards.html',
  },
] satisfies When[];
