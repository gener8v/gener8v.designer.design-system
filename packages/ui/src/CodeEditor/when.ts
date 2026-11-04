import type { When } from '../choosing.js';

export const when = [
  {
    name: 'CodeEditor',
    family: 'input',
    job: 'edit code, markdown or a structured document with its shape highlighted',
    use: [
      'Editing a markdown or JSON document, a config, a query — a textarea with highlighting painted under it, so undo, IME and assistive tech work as normal.',
      'Editing a long governed document: `full` fills the window, and Escape leaves it through the caller\'s `onLeaveFull`.',
    ],
    not: [
      {
        when: 'the code is shown, not edited',
        use: 'CodeBlock',
        because: 'a code block is read-only with a copy button; an editor is a form control.',
      },
      {
        when: 'the text is a short plain answer or a note',
        use: 'Input',
        because: 'a `Textarea` is enough for prose with no structure to highlight.',
      },
      {
        when: 'the reader needs to see what changed between two versions',
        use: 'Diff',
        because: 'a diff marks additions and removals; an editor shows only the current text.',
      },
    ],
    neighbours: ['CodeBlock', 'Input', 'Diff'],
    react: ['CodeEditor'],
    css: ['.code-editor'],
    page: null,
  },
] satisfies When[];
