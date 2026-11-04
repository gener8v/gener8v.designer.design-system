import type { When } from '../choosing.js';

export const when = [
  {
    name: 'Accordion',
    family: 'reading',
    job: 'fold sections of content away so a reader opens only the ones they need',
    use: [
      'A list of questions, details or optional sections where most readers want few of them.',
      'Several may be open at once by default; `type="single"` closes one when another opens.',
      'Opening a panel should cause the work it holds — `unmountClosed` keeps fetches off until then.',
    ],
    not: [
      {
        when: 'exactly one panel shows at a time and they are equal views',
        use: 'Tabs',
        because: 'tabs swap panels in place; an accordion keeps every section in reading order.',
      },
      {
        when: 'the sections nest to any depth and the reader selects nodes',
        use: 'Tree',
        because: 'a tree is a hierarchy with its own keyboard contract.',
      },
      {
        when: 'the content is a list of actions behind a button',
        use: 'Menu',
        because: 'a menu floats and closes on a choice; an accordion discloses content inline.',
      },
    ],
    neighbours: ['Tabs', 'Tree', 'Contents'],
    react: ['Accordion', 'AccordionItem'],
    css: ['.accordion'],
    page: 'components/disclosure.html',
  },
] satisfies When[];
