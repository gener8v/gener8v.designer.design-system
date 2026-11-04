import type { When } from '../choosing.js';

export const when = [
  {
    name: 'Meter',
    family: 'data',
    job: 'show a level that is simply true, against its scale and target',
    use: [
      'Usage against a quota, capacity used, coverage as a percentage, a score out of a maximum.',
      'A level that should reach a target: `threshold` draws the tick and says the target in words; `tone="auto"` reads success or warning off it.',
    ],
    not: [
      {
        when: 'a task advancing toward done',
        use: 'Progress',
        because: '`role="progressbar"` means work under way; a meter means a level, and swapping them misreports what is happening.',
      },
      {
        when: 'several verdicts on one thing that do not agree',
        use: 'Tally',
        because: 'a tally shows the split with the counts as words; one tone would hide the disagreement.',
      },
      {
        when: 'the number alone carries it, with no scale',
        use: 'Stat',
        because: 'a stat is a figure and a label; a track with no meaningful maximum is decoration.',
      },
      {
        when: 'comparing the level across many categories',
        use: 'BarChart',
        because: 'bars on a shared zero compare; a stack of meters does not.',
      },
    ],
    neighbours: ['Progress', 'Tally', 'Stat', 'BarChart'],
    react: ['Meter'],
    css: ['.meter'],
    page: 'components/data.html',
  },
] satisfies When[];
