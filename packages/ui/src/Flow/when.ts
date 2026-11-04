import type { When } from '../choosing.js';

export const when = [
  {
    name: 'Flow',
    family: 'screens',
    job: 'lay out a multi-step journey with a step rail, one step of content and a fixed footer',
    use: [
      'A form or process that takes several steps — intake, purchase, create or close a work item.',
      'Back must stay on the left and forward on the right on every step; the footer holds both.',
      'A long step needs its fields held to a readable measure (`FlowFields`) and a save state between the buttons (`FlowFooterStatus`).',
    ],
    not: [
      {
        when: 'you only need to show where someone is in a sequence, inside a page that is not a step flow',
        use: 'Stepper',
        because: 'the stepper is the position marker on its own; the flow is the whole shell around it.',
      },
      {
        when: 'the process does not fit a rail, a content region and a back/forward footer',
        use: 'Stepper',
        because: 'compose your own from the parts — Stepper, Progress, State — rather than bending the shell.',
      },
      {
        when: 'the screen is a sign-in or other single gate into the product',
        use: 'Entry',
        because: 'a gate has one thing to do and no steps; it says what the product is and offers the way in.',
      },
    ],
    neighbours: ['Stepper', 'ErrorSummary', 'State', 'Entry'],
    react: [
      'Flow', 'FlowRail', 'FlowRailTitle', 'FlowMain', 'FlowHeader', 'FlowStepOf',
      'FlowTitle', 'FlowLede', 'FlowContent', 'FlowFields', 'FlowFooter', 'FlowFooterStatus',
    ],
    css: ['.flow'],
    page: 'templates/intake/',
  },
] satisfies When[];
