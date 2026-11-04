import type { When } from '../choosing.js';

export const when = [
  {
    name: 'Item',
    family: 'data',
    job: 'list records, each read on its own — a name, where it came from, a mark or two',
    use: [
      'A list of notes, actions or entries: a one-line title, a quieter line of provenance (`meta`), and tags or a button on the title\'s line (`trailing`).',
      'Rows where table columns would be empty most of the time.',
      'An icon or avatar before the text (`lead`) and more detail under the meta.',
    ],
    not: [
      {
        when: 'values are compared down a column or sorted',
        use: 'Table',
        because: 'a table is for values you compare down a column.',
      },
      {
        when: 'the rows are files',
        use: 'DocList',
        because: 'a document list carries the file type badge, size and the list/grid views a library needs.',
      },
      {
        when: 'each row is an assertion in prose that somebody has to adjudicate',
        use: 'Claim',
        because: 'an item\'s title is one line that never wraps; a claim holds a measured sentence, its argument and its standing.',
      },
      {
        when: 'the list is a long column the reader scrolls past beside the main view',
        use: 'Dock',
        because: 'a dock gives momentary width to whatever is at the focus point of a narrow column.',
      },
    ],
    neighbours: ['Table', 'DocList', 'Claim', 'Dock', 'Feed'],
    react: ['Item', 'ItemList'],
    css: ['.item'],
    page: null,
  },
] satisfies When[];
