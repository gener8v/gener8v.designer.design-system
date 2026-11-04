import type { When } from '../choosing.js';

export const when = [
  {
    name: 'LayeredGraph',
    family: 'data',
    job: 'show what covers what across ordered layers, and what nothing covers',
    use: [
      'Layers read left to right — requirements, then milestones in sequence, then where the sequence ends — with a line for each cover.',
      'Uncovered nodes need to be brought forward, and a person may move one under another (drag, or `A` then Enter by keyboard).',
      'A narrow pane: below 30rem of its own width the layers stack and the lines become words.',
    ],
    not: [
      {
        when: 'the set is large and has no order — a corpus of linked things',
        use: 'KnowledgeGraph',
        because: 'the knowledge graph is force-directed on a canvas and built to hold a thousand nodes.',
      },
      {
        when: 'the reader needs every pairing, present or absent, at once',
        use: 'Matrix',
        because: 'a matrix shows each cell of rows against columns; a layered graph shows only the lines that exist.',
      },
      {
        when: 'it is one trigger leading to one action',
        use: 'Rule',
        because: 'a rule is one sentence, not a graph.',
      },
    ],
    neighbours: ['KnowledgeGraph', 'Matrix', 'Tree'],
    react: ['LayeredGraph'],
    hooks: ['layoutGraph', 'edgePath', 'uncoveredIds', 'layerNodes'],
    css: ['.layered-graph'],
    page: 'components/coverage.html',
  },
] satisfies When[];
