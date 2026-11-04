import type { When } from '../choosing.js';

export const when = [
  {
    name: 'SectionHead',
    family: 'screens',
    job: 'name a section inside a page, louder than the sentence under it',
    use: [
      'A section of a dense page needs a title and a line about it; the title is the loud part.',
      'The section has one control of its own — an Add, a Refresh — at the end of the title line (`action`).',
      'The outline level differs from the look: `as` sets h2–h6, the size stays the same.',
    ],
    not: [
      {
        when: 'it is the heading of the whole page',
        use: 'PageHead',
        because: 'the page head is the band at the top with a rule under it; a section head sits inside the page.',
      },
      {
        when: 'you want a mono marker, a figure label or a classification',
        use: 'Type',
        because: '`.label` is small mono grey and must never stand in for a section name.',
      },
      {
        when: 'the section is a bordered region holding a table or a form',
        use: 'Panel',
        because: 'a panel brings its own header and border around the region.',
      },
    ],
    neighbours: ['PageHead', 'Type', 'Panel'],
    react: ['SectionHead'],
    css: ['.section-head', '.section-title', '.section-lede'],
    page: 'components/live.html',
  },
] satisfies When[];
