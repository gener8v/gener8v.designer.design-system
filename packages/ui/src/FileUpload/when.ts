import type { When } from '../choosing.js';

export const when = [
  {
    name: 'FileUpload',
    family: 'input',
    job: 'let someone attach files, by dropping them or by choosing them',
    use: [
      'Attaching evidence or documents to a form: a drop zone over a real file input, so the keyboard and screen readers can use it without drag.',
      'Listing what was attached: `FileList` with a `FileItem` per file, its size, and an error when one fails.',
    ],
    not: [
      {
        when: 'the files are already stored and the reader is browsing them',
        use: 'DocList',
        because: 'a document library lists stored files with their type; an upload list is what is being added now.',
      },
      {
        when: 'the person is pasting or writing text rather than attaching a file',
        use: 'Input',
        because: 'a textarea takes text; do not make someone save text to a file to submit it.',
      },
    ],
    neighbours: ['DocList', 'Field'],
    react: ['FileUpload', 'FileList', 'FileItem'],
    css: ['.dropzone', '.file-list', '.file-item'],
    page: 'components/inputs.html',
  },
] satisfies When[];
