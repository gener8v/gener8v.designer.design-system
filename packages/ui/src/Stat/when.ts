import type { When } from '../choosing.js';

export const when = [
  {
    name: 'Stat',
    family: 'data',
    job: 'show a headline figure with its label and what changed',
    use: [
      'A few KPIs above the content they summarise — put them in a `StatRow` so the rules between them say they belong together.',
      'A change since last period with `StatDelta`: `direction` says which way, `good` says whether that is good news, and the text says it too.',
      'A figure built from some sources but not all says so in `StatNote` — and where the count failed, show no figure.',
    ],
    not: [
      {
        when: 'the figure is a level against a scale or a target',
        use: 'Meter',
        because: 'a meter draws the level on a track and says the target in words; a stat is just the number.',
      },
      {
        when: 'the shape over time matters more than the latest value',
        use: 'LineChart',
        because: 'a trend needs a line with axes; put a `Sparkline` beside a stat when direction is enough.',
      },
      {
        when: 'many categories compared by size',
        use: 'BarChart',
        because: 'a row of more than four or five stats is a chart that lost its axis.',
      },
      {
        when: 'label and value pairs that describe one thing, not measure it',
        use: 'DescriptionList',
        because: 'attributes are terms and values in body type; a stat is a figure set large.',
      },
      {
        when: 'totals that add up to a price',
        use: 'Summary',
        because: 'a summary is term and value rows with one emphasised total.',
      },
    ],
    neighbours: ['Meter', 'Sparkline', 'DescriptionList', 'Summary', 'PageHead'],
    react: ['Stat', 'StatRow', 'StatLabel', 'StatValue', 'StatNote', 'StatDelta'],
    css: ['.stat', '.stat-row'],
    page: 'components/data.html',
  },
] satisfies When[];
