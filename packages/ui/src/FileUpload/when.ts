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
        when: 'a file is still uploading, or failed to',
        use: 'FileProgress',
        because: 'a transfer row carries the bar, the percent, cancel and retry; `FileItem` is what has arrived.',
      },
      {
        when: 'the person is pasting or writing text rather than attaching a file',
        use: 'Input',
        because: 'a textarea takes text; do not make someone save text to a file to submit it.',
      },
    ],
    neighbours: ['DocList', 'Field', 'FileProgress'],
    react: ['FileUpload', 'FileList', 'FileItem'],
    css: ['.dropzone', '.file-list', '.file-item'],
    page: 'components/inputs.html',
  },
  {
    name: 'FileProgress',
    family: 'status-and-feedback',
    job: 'show one file on its way — how far, and cancel or retry',
    use: [
      'An upload or download in a `FileList`: name and percent above a 4px bar, the size or the reason below, cancel while it moves and retry when it fails.',
      'Arriving and failing are announced once; the percentage is never read aloud.',
    ],
    not: [
      {
        when: 'the file has been attached and nothing is moving',
        use: 'FileUpload',
        because: '`FileItem` lists what is attached; a transfer row exists only while bytes move or after they failed.',
      },
      {
        when: 'one task that is not a file — an import, an export',
        use: 'Progress',
        because: 'a labelled bar carries the same layout without the file\'s size and actions.',
      },
      {
        when: 'a batch of many files where only the totals matter',
        use: 'SegmentedProgress',
        because: 'forty rows is a wall; a segmented bar says how many arrived, failed and wait.',
      },
    ],
    neighbours: ['FileUpload', 'Progress', 'SegmentedProgress'],
    react: ['FileProgress'],
    css: ['.file-progress'],
    page: 'components/flow.html',
  },
] satisfies When[];
