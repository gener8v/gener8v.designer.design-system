import type { When } from '../choosing.js';

export const when = [
  {
    name: 'DocList',
    family: 'data',
    job: 'list files and folders in a document library',
    use: [
      'A library of files as rows (`DocList` / `DocRow`) or as cards (`DocGrid` / `DocCard`).',
      'File type is a mono badge (`DocType`) from the extension, never a coloured chip; folders are the one exception.',
    ],
    not: [
      {
        when: 'the rows are records that are not files',
        use: 'Item',
        because: 'an item is the general record row; a doc row carries a type badge and file size.',
      },
      {
        when: 'files are compared on several columns, or sorted',
        use: 'Table',
        because: 'a table sorts and compares down columns.',
      },
      {
        when: 'the files are attachments the person is uploading',
        use: 'FileUpload',
        because: 'a file upload has the drop zone over a real file input and the list of what was added.',
      },
      {
        when: 'the files nest several levels deep',
        use: 'Tree',
        because: 'a tree expands and collapses a hierarchy with one Tab stop.',
      },
    ],
    neighbours: ['Item', 'Table', 'FileUpload', 'DocPreview', 'Tree'],
    react: ['DocType', 'DocList', 'DocRow', 'DocGrid', 'DocCard'],
    hooks: ['kindOf', 'formatBytes'],
    css: ['.doc-list', '.doc-row', '.doc-type', '.doc-grid', '.doc-card'],
    page: 'components/library.html',
  },
  {
    name: 'DocPreview',
    family: 'reading',
    job: 'preview the file selected in a library, beside the list',
    use: [
      'A pane with the file\'s title and actions in a head and its rendered body below.',
      'Prose in `Reader`, its measure capped at 72ch; a spreadsheet in `Sheet`, a grid shown as a grid.',
    ],
    not: [
      {
        when: 'the document is the page, read on its own rather than previewed from a list',
        use: 'Paper',
        because: 'paper is the sheet a document sits on and the ground behind it.',
      },
      {
        when: 'two versions of the text are compared',
        use: 'Diff',
        because: 'a diff marks what was added and removed, not by colour alone.',
      },
      {
        when: 'the pane is a modal side panel over the page',
        use: 'Drawer',
        because: 'a drawer takes the page over and must be dismissed; a preview pane sits beside the list.',
      },
    ],
    neighbours: ['Paper', 'DocList', 'Split', 'Drawer'],
    react: ['DocPreview', 'DocPreviewHead', 'DocPreviewTitle', 'DocPreviewActions', 'DocPreviewBody', 'Reader', 'Sheet'],
    css: ['.doc-preview', '.reader', '.sheet'],
    page: 'components/library.html',
  },
] satisfies When[];
