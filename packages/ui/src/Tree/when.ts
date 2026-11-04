import type { When } from '../choosing.js';

export const when = [
  {
    name: 'Tree',
    family: 'navigation',
    job: 'browse a nested hierarchy, opening and closing branches',
    use: [
      'Folders, a taxonomy, a nested set of requirements — any depth, with a count or size at the end of each row.',
      'The whole tree is one Tab stop: Up/Down move through visible rows, Right expands then descends, Left collapses then rises.',
    ],
    not: [
      {
        when: 'the hierarchy is the app\'s places, one level deep',
        use: 'Sidebar',
        because: 'a rail of places is links with `aria-current`, not a tree.',
      },
      {
        when: 'the sections are content to read, opened and closed in place',
        use: 'Accordion',
        because: 'an accordion discloses content panels; a tree selects nodes in a hierarchy.',
      },
      {
        when: 'the structure is layers that cover one another — needs to tests, plan to milestones',
        use: 'LayeredGraph',
        because: 'coverage between layers is a graph, not a hierarchy.',
      },
    ],
    neighbours: ['Sidebar', 'Accordion', 'DocList'],
    react: ['Tree'],
    css: ['.tree'],
    page: 'components/command.html',
  },
] satisfies When[];
