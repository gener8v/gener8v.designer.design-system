import type { When } from '../choosing.js';

export const when = [
  {
    name: 'Input',
    family: 'input',
    job: 'take free text or a number typed by the person',
    use: [
      'A single line of text, an email, a number: `Input` inside a `Field`. `invalid` drives both the border and `aria-invalid`.',
      'Several lines of prose: `Textarea`.',
      'A field that is one clause of a sentence: `InputGroup` with `InputAddon` for the words the person does not type; give the input its own `aria-label`.',
    ],
    not: [
      {
        when: 'the value comes from a known list the person searches',
        use: 'Combobox',
        because: 'a combobox filters a list as you type and keeps focus in the input.',
      },
      {
        when: 'the value is several separate labels',
        use: 'TokenInput',
        because: 'tokens are removable one by one and Backspace removes the last; a comma-separated string is not.',
      },
      {
        when: 'the text is code, markdown or a structured document',
        use: 'CodeEditor',
        because: 'the editor highlights the shape of what is typed and can fill the window; a textarea shows a wall of plain text.',
      },
      {
        when: 'the value is a small count adjusted up or down',
        use: 'Quantity',
        because: 'the stepper puts − and + beside a real number input, so a count can be nudged or typed.',
      },
    ],
    neighbours: ['Field', 'Combobox', 'TokenInput', 'CodeEditor', 'Select'],
    react: ['Input', 'InputAddon', 'InputGroup', 'Textarea'],
    css: ['.input', '.textarea'],
    page: 'components/forms.html',
  },
] satisfies When[];
