import type { When } from '../choosing.js';

export const when = [
  {
    name: 'Quantity',
    family: 'input',
    job: 'set a small whole-number count, stepped or typed',
    use: [
      'How many of an item — copies in a basket, seats on a plan — between a `min` and a `max`.',
      'The value sits in a real number input, so typing 12 beats pressing + eleven times.',
    ],
    not: [
      {
        when: 'the value is a position on a continuous range — a threshold, a weight',
        use: 'Slider',
        because: 'a slider shows where the value sits in its range; a stepper counts.',
      },
      {
        when: 'the number is large, free-form or has a unit',
        use: 'Input',
        because: 'a plain number input; nobody steps to 4,000 one press at a time.',
      },
    ],
    neighbours: ['Slider', 'Input'],
    react: ['Quantity'],
    css: ['.qty'],
    page: 'templates/purchase/',
  },
] satisfies When[];
