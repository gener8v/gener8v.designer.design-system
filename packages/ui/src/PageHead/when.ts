import type { When } from '../choosing.js';

export const when = [
  {
    name: 'PageHead',
    family: 'screens',
    job: 'say what a page is, above what it holds, with a rule that ends the header',
    use: [
      'The top band of an app page: the title, a standfirst under it, and at the end figures, a control or one button (`PageActions`).',
      'The header needs an edge so the reader can see where it stops and the page begins.',
    ],
    not: [
      {
        when: 'you are naming a section inside the page, not the page itself',
        use: 'SectionHead',
        because: 'a section heading is set at section size with a quiet lede; a page head is the page\'s one band.',
      },
      {
        when: 'you want a small mono marker or classification',
        use: 'Type',
        because: '`.label` is the mono voice, and it never sits above a heading as an eyebrow.',
      },
      {
        when: 'the header belongs to one region — a table, a form — rather than the page',
        use: 'Panel',
        because: 'a panel header names the region it hosts and carries at most one action.',
      },
    ],
    neighbours: ['SectionHead', 'Type', 'Panel', 'Breadcrumbs'],
    react: ['PageHead', 'PageActions'],
    css: ['.shell-head', '.shell-actions'],
    page: 'templates/app-shell/',
  },
] satisfies When[];
