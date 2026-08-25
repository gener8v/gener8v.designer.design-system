import { describe, expect, it } from 'vitest';
import { tokenize } from '../packages/ui/src/CodeBlock/highlight.js';

/**
 * The highlighter is regex over six languages, so these specs pin the things a regex gets wrong if
 * the rules are ordered carelessly — not a grammar it does not claim to have.
 */
const kinds = (code: string, lang?: string) =>
  tokenize(code, lang).filter((t) => t.kind).map((t) => `${t.kind}:${t.text}`);

describe('the display highlighter', () => {
  it('highlights nothing for a language it does not know', () => {
    // Guessing is worse than plain. A log line or a stack trace reads worse with keywords picked
    // out of it, which is why highlighting is opt-in at all.
    expect(tokenize('const x = 1', 'brainfuck')).toEqual([{ text: 'const x = 1' }]);
    expect(tokenize('const x = 1')).toEqual([{ text: 'const x = 1' }]);
  });

  it('does not find a keyword inside a comment', () => {
    // ONE alternation, not a pass per rule: a second pass would re-tokenize the inside of a
    // comment. Position does the rest — `exec` takes the leftmost match, so the comment wins
    // because it starts first, not because it is listed first.
    expect(kinds('// import this', 'ts')).toEqual(['comment:// import this']);
  });

  it('does not find a keyword inside a string', () => {
    expect(kinds(`const a = 'import from nowhere'`, 'ts'))
      .toEqual(['keyword:const', `string:'import from nowhere'`]);
  });

  it('keeps every character, highlighted or not', () => {
    // A tokenizer that drops text is worse than none: the snippet would be wrong rather than
    // merely plain. This is the invariant that matters most.
    const code = `import { a } from 'b';\n// note\nconst n = 42;`;
    expect(tokenize(code, 'ts').map((t) => t.text).join('')).toBe(code);
  });

  it('reads a shell comment and a command', () => {
    expect(kinds('# install\nnpm i thing', 'sh')).toEqual(['comment:# install', 'keyword:npm']);
  });

  it('picks the key out of JSON rather than calling it a string', () => {
    // The one place rule ORDER decides anything: a key and a plain string begin at the same quote,
    // so leftmost-match cannot separate them and the key rule has to come first.
    expect(kinds('{"name": "ui"}', 'json')).toEqual(['fn:"name"', 'string:"ui"']);
  });

  it('treats a css custom property as a name', () => {
    expect(kinds('a { color: var(--color-accent-300); }', 'css'))
      .toEqual(['keyword:var', 'fn:--color-accent-300']);
  });

  it('survives an unterminated string without hanging or eating the file', () => {
    // The known failure mode, pinned so it stays a display artefact rather than a crash.
    const code = `const a = 'unterminated\nconst b = 2;`;
    expect(tokenize(code, 'ts').map((t) => t.text).join('')).toBe(code);
  });
});
