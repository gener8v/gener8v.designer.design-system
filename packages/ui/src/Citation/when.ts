import type { When } from '../choosing.js';

export const when = [
  {
    name: 'Citation',
    family: 'reading',
    job: 'mark a claim in prose with the source it came from, and show that source in place',
    use: [
      'A marker like `S4` inside a sentence, followed in place to what it names; `SourceCard` is the file, the locator, the cited words and a way to open it there.',
      'Generated or sanitised HTML: the same class styles `<a class="citation">`, and `useDelegatedHoverCard` previews it.',
      'A source that cannot be found: `missing` draws a dashed, unlinked marker that says so in words.',
    ],
    not: [
      {
        when: 'the link goes to a page and nothing is being cited',
        use: 'HoverCard',
        because: 'a hover card previews what any link or name leads to; a citation is a source behind a claim.',
      },
      {
        when: 'the sources are a list to step through one by one',
        use: 'PagerChip',
        because: 'a pager chip walks a set in place — `S4 of 19` — with source cards as the content.',
      },
      {
        when: 'the aside is a note of your own, not a source',
        use: 'Callout',
        because: 'a callout is a quiet aside inside prose.',
      },
    ],
    neighbours: ['HoverCard', 'PagerChip', 'Callout'],
    react: ['Citation', 'SourceCard'],
    css: ['.citation', '.source-card'],
    page: 'components/reading.html',
  },
] satisfies When[];
