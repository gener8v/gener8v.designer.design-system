import type { When } from '../choosing.js';

export const when = [
  {
    name: 'Callout',
    family: 'status-and-feedback',
    job: 'set a quiet aside inside prose',
    use: [
      'A note, caveat or rule that qualifies the text around it — "Figures exclude the March import."',
      'A short absence or warning at reading scale: `tone="warning"` tints the rule, nothing else.',
    ],
    not: [
      {
        when: 'the message is about the page or a region, not the paragraph',
        use: 'Alert',
        because: 'an alert is a banner with a tone and an action; a callout is a rule beside text.',
      },
      {
        when: 'the region has nothing to show',
        use: 'State',
        because: 'a state says why the content is absent and what to do; a callout assumes there is prose around it.',
      },
      {
        when: 'a hint that belongs to one form field',
        use: 'Field',
        because: 'a field hint is tied to its control by `aria-describedby`; a callout is not.',
      },
      {
        when: 'a short status word',
        use: 'Tag',
        because: 'a status is one or two words in a tag, never a sentence.',
      },
    ],
    neighbours: ['Alert', 'Tooltip', 'Field', 'Paper'],
    react: ['Callout', 'CalloutTitle'],
    css: ['.callout'],
    page: 'components/feedback.html',
  },
] satisfies When[];
