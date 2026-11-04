import type { When } from '../choosing.js';

export const when = [
  {
    name: 'Alert',
    family: 'status-and-feedback',
    job: 'say something about the page that stays until it is no longer true',
    use: [
      'A condition that holds for the whole page or region — a source is stale, eleven items are unanswered, the run failed.',
      'A message with a way out of it: put the action in `AlertActions`, beside the problem it fixes.',
      'Set `live` when the banner appears after load; danger and warning announce assertively, the rest politely.',
    ],
    not: [
      {
        when: 'confirming an action the person just took, which needs no further attention',
        use: 'Toast',
        because: 'a toast reports an event and leaves; an alert reports a condition and stays.',
      },
      {
        when: 'the region has nothing to show, failed to load, or is not allowed',
        use: 'State',
        because: 'a state replaces the content it stands for; an alert sits above content that is still there.',
      },
      {
        when: 'a note inside prose that qualifies what is around it',
        use: 'Callout',
        because: 'a callout is a rule beside text at reading scale; a tinted banner would make it an alert it is not.',
      },
      {
        when: 'the person must answer before anything else can happen',
        use: 'Dialog',
        because: 'a dialog takes focus and must be dismissed; an alert can be read past.',
      },
      {
        when: 'a form step has fields that failed validation',
        use: 'ErrorSummary',
        because: 'the error summary links each problem to its field and takes focus on submit.',
      },
    ],
    neighbours: ['Toast', 'State', 'Callout', 'ErrorSummary'],
    react: ['Alert', 'AlertTitle', 'AlertBody', 'AlertActions'],
    css: ['.alert'],
    page: 'components/feedback.html',
  },
] satisfies When[];
