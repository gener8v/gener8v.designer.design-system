import type { When } from '../choosing.js';

export const when = [
  {
    name: 'KnowledgeGraph',
    family: 'data',
    job: 'explore how a large set of things nobody arranged relate to each other',
    use: [
      'A corpus of entities and links — hundreds to a thousand nodes — laid out by force on a canvas.',
      'The kinds are the caller\'s own words, coloured from the series palette in declared order; eight at most.',
      'Always paired with a real list of the entities and their relationships, because a canvas cannot be traversed.',
    ],
    not: [
      {
        when: 'the nodes have an order the reader already knows — layers, then a sequence',
        use: 'LayeredGraph',
        because: 'a layered graph is laid out, not simulated, and its nodes are real buttons in lists.',
      },
      {
        when: 'the question is which of these covers which of those',
        use: 'Matrix',
        because: 'a matrix shows presence and absence on a grid, read across a row and down a column.',
      },
      {
        when: 'the structure is a hierarchy',
        use: 'Tree',
        because: 'a tree has one parent per node and a keyboard contract for expanding and collapsing.',
      },
    ],
    neighbours: ['LayeredGraph', 'Matrix', 'Tree'],
    react: ['KnowledgeGraph'],
    hooks: ['createLayout', 'tick', 'settle', 'bounds', 'radiusFor'],
    css: ['.graph'],
    page: 'components/graph.html',
  },
] satisfies When[];
