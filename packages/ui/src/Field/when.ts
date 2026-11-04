import type { When } from '../choosing.js';

export const when = [
  {
    name: 'Field',
    family: 'input',
    job: 'stack a label, a control and its hint or error as one form field',
    use: [
      'Every form control that needs a visible label: `FieldLabel`, the control, then `FieldHint` or `FieldError`.',
      'A field that is optional: `FieldLabel optional` adds a quiet marker rather than starring what is required.',
      'A validation message for one control: `FieldError` is announced when it changes.',
    ],
    not: [
      {
        when: 'a step has several errors and the reader needs to know how many and where',
        use: 'ErrorSummary',
        because: 'the summary sits at the top of the step, links to each field and takes focus; a field error only speaks for its own control.',
      },
      {
        when: 'the problem is not about one control but about the whole form or page',
        use: 'Alert',
        because: 'an alert is an inline banner for the region; a field error belongs under the control it is about.',
      },
      {
        when: 'the question is one clause of a sentence — "must stay true, because …"',
        use: 'Input',
        because: '`InputGroup` with `InputAddon` attaches the connecting words to the control, so the row reads as the sentence.',
      },
    ],
    neighbours: ['Input', 'ErrorSummary', 'Choice'],
    react: ['Field', 'FieldLabel', 'FieldHint', 'FieldError'],
    css: ['.field'],
    page: 'components/forms.html',
  },
] satisfies When[];
