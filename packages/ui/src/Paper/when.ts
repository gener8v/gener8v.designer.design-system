import type { When } from '../choosing.js';

export const when = [
  {
    name: 'Paper',
    family: 'reading',
    job: 'set a document on a sheet, on a ground, so it reads as a document',
    use: [
      'Anything read as a document — a report, a specification, a generated write-up.',
      'Navigation for the document — its contents, a provenance rail — goes beside the sheet in `PaperAside`, not on it.',
    ],
    not: [
      {
        when: 'the content is scanned as data — a table, a tree, a split pane',
        use: 'Table',
        because: 'data takes the full width; the reader looks across it, not down it.',
      },
      {
        when: 'you want a surface for one self-contained item in a grid',
        use: 'Card',
        because: 'a card is a hairline surface for scanning; paper is a sheet for reading.',
      },
      {
        when: 'you are previewing a file inside a library pane',
        use: 'DocPreview',
        because: 'the preview pane has its own head and actions and holds prose in `Reader`.',
      },
    ],
    neighbours: ['Card', 'DocPreview', 'Contents', 'Panel'],
    react: ['Paper', 'PaperAside', 'PaperGround'],
    css: ['.paper'],
    page: 'components/reading.html',
  },
] satisfies When[];
