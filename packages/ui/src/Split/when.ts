import type { When } from '../choosing.js';

export const when = [
  {
    name: 'Split',
    family: 'screens',
    job: 'put a side pane beside the main area that the reader can resize and collapse',
    use: [
      'A list or tree beside the thing it opens — documents beside the preview, sources beside the reader.',
      'The reader should choose the width: drag the handle or use arrows; a click on the handle collapses it.',
      'The chosen width should persist — `onChange` reports it, and `0` on collapse.',
    ],
    not: [
      {
        when: 'the side panel opens over the page for a moment and takes focus',
        use: 'Drawer',
        because: 'a drawer is modal and dismissed; a split pane stays part of the layout.',
      },
      {
        when: 'the side column is the app\'s navigation',
        use: 'Sidebar',
        because: 'the rail of places is navigation with `aria-current`; it is not reader-sized.',
      },
      {
        when: 'the side column is a document\'s contents next to the document',
        use: 'Paper',
        because: '`PaperAside` sits on the ground beside the sheet and scrolls with the window.',
      },
    ],
    neighbours: ['Drawer', 'Sidebar', 'Paper', 'DocPreview'],
    react: ['Split'],
    css: ['.split'],
    page: 'components/reading.html',
  },
] satisfies When[];
