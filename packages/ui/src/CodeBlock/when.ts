import type { When } from '../choosing.js';

export const when = [
  {
    name: 'CodeBlock',
    family: 'reading',
    job: 'show a snippet of code or output to read or copy',
    use: [
      'A command, a config file or a sample, with a title (a filename or a language) in the head.',
      'Something meant to be run: `copyable` adds a copy control — off by default.',
      'Legibility, not correctness: `language` highlights sh, ts, tsx, js, css and json; leave it off for logs and stack traces.',
    ],
    not: [
      {
        when: 'the person types or edits the code',
        use: 'CodeEditor',
        because: 'a code editor keeps a real textarea under the highlighting; a code block is read-only.',
      },
      {
        when: 'two versions are compared',
        use: 'Diff',
        because: 'a diff marks additions and removals in words and lines, not colour alone.',
      },
      {
        when: 'it is a keyboard key or a shortcut',
        use: 'Keys',
        because: '`Kbd` draws a key as a key; a code block is for code.',
      },
      {
        when: 'the value is a secret',
        use: 'Credential',
        because: 'a credential keeps the secret out of the DOM until revealed and copies without reveal.',
      },
    ],
    neighbours: ['CodeEditor', 'Diff', 'Keys', 'Credential'],
    react: ['CodeBlock'],
    css: ['.code'],
    page: 'components/command.html',
  },
] satisfies When[];
