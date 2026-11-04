import type { When } from '../choosing.js';

export const when = [
  {
    name: 'ErrorSummary',
    family: 'input',
    job: 'list every problem on a step before it can advance, each linking to its field',
    use: [
      'Validation on Next in a multi-step form: `useStepValidation` runs native constraint validation (plus your own `validate`) and moves focus to the summary.',
      'A long step where the reader needs to know how many problems there are and where.',
    ],
    not: [
      {
        when: 'there is one problem with one control',
        use: 'Field',
        because: '`FieldError` sits under the control it is about; a summary for one error is a detour.',
      },
      {
        when: 'the problem is with the request or the system, not the person\'s input',
        use: 'Alert',
        because: 'an alert reports a failure in the region; an error summary lists fields to fix.',
      },
      {
        when: 'the whole step failed to load or save',
        use: 'State',
        because: 'the error state replaces the content with what went wrong and a way out.',
      },
    ],
    neighbours: ['Field', 'Alert', 'Flow'],
    react: ['ErrorSummary'],
    hooks: ['useStepValidation'],
    css: ['.error-summary'],
    page: null,
  },
] satisfies When[];
