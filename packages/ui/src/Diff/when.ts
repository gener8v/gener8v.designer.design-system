import type { When } from '../choosing.js';

export const when = [
  {
    name: 'Diff',
    family: 'reading',
    job: 'show two versions of a text and what changed between them',
    use: [
      'Before and after of a document, a field or a setting — inline or split into two panes, by word or by line.',
      'Removals are struck through and additions underlined, as real `<del>` and `<ins>`, so a change never rests on colour alone.',
      'The operations rather than the rendering: `diff()` and `tokenize()` are exported.',
    ],
    not: [
      {
        when: 'there is one version of some code to show',
        use: 'CodeBlock',
        because: 'a code block shows a snippet, with a copy control and optional highlighting.',
      },
      {
        when: 'the change is one an agent proposes and a person must approve',
        use: 'ConfirmCard',
        because: 'a confirm card lists the values it will write and waits for the yes.',
      },
      {
        when: 'the person is editing the text',
        use: 'CodeEditor',
        because: 'a code editor is a textarea that shows the shape of what is typed.',
      },
    ],
    neighbours: ['CodeBlock', 'ConfirmCard', 'DocPreview'],
    react: ['Diff'],
    hooks: ['diff', 'tokenize'],
    css: ['.diff'],
    page: 'components/library.html',
  },
] satisfies When[];
