import type { When } from '../choosing.js';

export const when = [
  {
    name: 'Contents',
    family: 'reading',
    job: 'show where you are in a long document and jump elsewhere in it',
    use: [
      'A long document with headings: the entry in view is marked `aria-current="location"` as the reader scrolls.',
      'Review section by section — pass `reviewed` with `onReviewedChange` for a box per entry and a count.',
      'A run is writing the document — each entry carries the same live mark as its section.',
    ],
    not: [
      {
        when: 'the links go to other pages of the app',
        use: 'Sidebar',
        because: 'places in the app are navigation; contents are places in one document.',
      },
      {
        when: 'the sections should be shown one at a time',
        use: 'Tabs',
        because: 'tabs swap panels; contents keeps the whole document in one scroll.',
      },
      {
        when: 'the document has two headings or fewer',
        use: 'SectionHead',
        because: 'contents draws nothing under three entries — the headings are enough.',
      },
    ],
    neighbours: ['Sidebar', 'Paper', 'Tabs', 'LiveProgress'],
    react: ['Contents'],
    css: ['.contents'],
    page: 'components/reading.html',
  },
] satisfies When[];
