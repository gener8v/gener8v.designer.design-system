import type { When } from '../choosing.js';

export const when = [
  {
    name: 'Slider',
    family: 'input',
    job: 'set a value on a continuous range where the position matters more than the exact figure',
    use: [
      'A threshold, a weight, a confidence level — somewhere on a known range, with the current value shown beside the label.',
      'Use `display` for units — "62%", "3 days". It is a native range input, so keyboard stepping and form participation come free.',
    ],
    not: [
      {
        when: 'the value is a count of things — copies, seats',
        use: 'Quantity',
        because: 'a count is stepped or typed exactly; a slider is imprecise for whole numbers.',
      },
      {
        when: 'the exact figure matters or the range is open-ended',
        use: 'Input',
        because: 'a number input takes an exact value; a slider needs a known minimum and maximum.',
      },
      {
        when: 'the figure is shown, not set',
        use: 'Meter',
        because: 'a meter reports a level; a slider asks for one.',
      },
    ],
    neighbours: ['Quantity', 'Input', 'Meter'],
    react: ['Slider'],
    css: ['.slider'],
    page: 'components/inputs.html',
  },
] satisfies When[];
