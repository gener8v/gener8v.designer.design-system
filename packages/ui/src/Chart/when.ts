import type { When } from '../choosing.js';

export const when = [
  {
    name: 'BarChart',
    family: 'data',
    job: 'compare amounts across categories on a zero baseline',
    use: [
      'Sizes side by side — per team, per month, per category; `stacked` for parts of each whole.',
      '`orientation="horizontal"` for long category names, a ranking, or a phone: the name above each bar, the figure at its end.',
      'Up to eight series in the fixed palette order; a ninth folds into "Other".',
    ],
    not: [
      {
        when: 'change over time is the point',
        use: 'LineChart',
        because: 'a line shows trend and may float off zero; bars must sit on zero.',
      },
      {
        when: 'a direction beside a figure, with no axis',
        use: 'Sparkline',
        because: 'a sparkline is a shape, not a measurement.',
      },
      {
        when: 'two measures on different scales',
        use: 'ChartFrame',
        because: 'never a second axis: draw two charts, or index both to a common base.',
      },
      {
        when: 'presence or absence at each crossing of two lists',
        use: 'Matrix',
        because: 'coverage is a grid of marks, not a quantity.',
      },
      {
        when: 'one or a few headline figures',
        use: 'Stat',
        because: 'a chart of three bars is a row of figures with extra ink.',
      },
    ],
    neighbours: ['LineChart', 'Stat', 'Meter', 'Matrix', 'ChartFrame'],
    react: ['BarChart'],
    css: ['.chart-bar', '.chart-hbar', '.chart-hbars'],
    page: 'components/charts.html',
  },
  {
    name: 'LineChart',
    family: 'data',
    job: 'show how one or more measures change over time',
    use: [
      'A trend across dates, with a crosshair and a shared tooltip.',
      'Several series of the same unit on one y-axis, in the fixed palette order.',
    ],
    not: [
      {
        when: 'comparing amounts between categories',
        use: 'BarChart',
        because: 'categories are not a continuum; a line between them implies one.',
      },
      {
        when: 'the trend only needs a glance beside a figure',
        use: 'Sparkline',
        because: 'a sparkline is the shape without axes, legend or tooltip.',
      },
      {
        when: 'two measures of different scale',
        use: 'ChartFrame',
        because: 'one y-axis always: two charts in two frames, or index both to a common base.',
      },
    ],
    neighbours: ['BarChart', 'Sparkline', 'Stat'],
    react: ['LineChart'],
    css: ['.chart-line'],
    page: 'components/charts.html',
  },
  {
    name: 'Sparkline',
    family: 'data',
    job: 'show which way a figure has been moving, beside the figure',
    use: [
      'Next to a `Stat` or in a table cell, where direction matters and the exact values do not.',
      'Always with a text `label` — it shows direction, not magnitude.',
    ],
    not: [
      {
        when: 'the reader needs to read values off it',
        use: 'LineChart',
        because: 'a sparkline has no axes, no legend and no tooltip.',
      },
      {
        when: 'there is no figure beside it',
        use: 'Stat',
        because: 'a shape alone says nothing about how much; give it the number it qualifies.',
      },
    ],
    neighbours: ['LineChart', 'Stat'],
    react: ['Sparkline'],
    css: ['.sparkline'],
    page: 'components/charts.html',
  },
  {
    name: 'ChartFrame',
    family: 'data',
    job: 'frame a chart with its title, legend, plot and a table view',
    use: [
      'Wrapping a chart form the system does not ship, so it still has a title, a legend and the data as a table.',
      'Anywhere a chart appears: the table view is the relief for series colours under 3:1, and makes the numbers copyable.',
    ],
    not: [
      {
        when: 'bars or lines',
        use: 'BarChart',
        because: '`BarChart` and `LineChart` already render inside the frame.',
      },
      {
        when: 'the data is better read as a table than seen as a shape',
        use: 'Table',
        because: 'a chart earns its place by showing a shape; exact lookups belong in a table.',
      },
    ],
    neighbours: ['BarChart', 'LineChart', 'Table'],
    react: ['ChartFrame'],
    hooks: ['linear', 'ticks', 'extent', 'seriesColor', 'fmt', 'MAX_SERIES'],
    css: ['.chart'],
    page: 'components/charts.html',
  },
] satisfies When[];
