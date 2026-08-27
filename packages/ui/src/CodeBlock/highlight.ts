/**
 * A display highlighter, and deliberately nothing more.
 *
 * `CodeBlock` used to ship no highlighting at all, on the reasoning that a design system bundling a
 * tokenizer has taken on a language grammar it now has to maintain. That reasoning still holds for
 * a PARSER. It does not hold for what a documentation snippet actually needs, which is to stop
 * reading as one undifferentiated wall — a comment that looks like a comment and a string that
 * looks like a string.
 *
 * So this is regex tokenizing over a handful of languages, in about eighty lines, with no
 * dependency. `@gener8v/ui` has none and does not gain one here: shiki and prism are both larger
 * than this entire package.
 *
 * WHAT IT WILL GET WRONG
 *
 * It has no parser and no state machine, so it cannot know context. A `#` inside a shell string is
 * a comment to it. A regex literal containing a quote will end a string early. Nested template
 * expressions are not tracked. Every one of those is a display artefact in a snippet, and none of
 * them is worth a grammar — a consumer that needs correctness should pipe pre-highlighted markup
 * into `code`, which still works and is still the escape hatch.
 *
 * An unknown language highlights nothing rather than guessing.
 */

export interface Token {
  text: string;
  /** Maps to `.tok-*` in the stylesheet. Absent means plain. */
  kind?: 'comment' | 'string' | 'keyword' | 'number' | 'fn';
}

interface Rule {
  kind: Token['kind'];
  /** Source, not a RegExp — they are combined into one alternation. */
  re: string;
}

/**
 * Order decides only between rules that match at the SAME index — `exec` takes the leftmost match
 * first, so a comment starting before a keyword already wins on position alone. Where it genuinely
 * matters is JSON, where a key and a plain string both begin at the same quote.
 */
const SHELL: Rule[] = [
  { kind: 'comment', re: '#[^\\n]*' },
  { kind: 'string', re: `'[^'\\n]*'|"[^"\\n]*"` },
  { kind: 'keyword', re: '\\b(?:npm|npx|pnpm|yarn|node|git|cd|export|source|sudo|echo|if|then|elif|fi|for|in|do|done|while|case|esac|function|return|set)\\b' },
  { kind: 'number', re: '\\b\\d+(?:\\.\\d+)*\\b' },
];

const TS: Rule[] = [
  { kind: 'comment', re: '//[^\\n]*|/\\*[\\s\\S]*?\\*/' },
  { kind: 'string', re: "'[^'\\n]*'|\"[^\"\\n]*\"|`[^`]*`" },
  { kind: 'keyword', re: '\\b(?:import|export|from|as|default|const|let|var|function|return|if|else|for|while|switch|case|break|continue|new|class|extends|implements|interface|type|enum|async|await|of|in|typeof|instanceof|this|null|undefined|true|false|void|never|readonly|public|private|protected|static|try|catch|finally|throw)\\b' },
  { kind: 'number', re: '\\b\\d+(?:\\.\\d+)?\\b' },
  // A name immediately followed by `(` reads as a call. Cheap, and right far more often than not.
  { kind: 'fn', re: '\\b[A-Za-z_$][\\w$]*(?=\\()' },
];

const CSS: Rule[] = [
  { kind: 'comment', re: '/\\*[\\s\\S]*?\\*/' },
  { kind: 'string', re: `'[^'\\n]*'|"[^"\\n]*"` },
  { kind: 'keyword', re: '@[a-z-]+|\\bvar\\b(?=\\()' },
  { kind: 'number', re: '#[0-9a-fA-F]{3,8}\\b|\\b\\d+(?:\\.\\d+)?(?:px|rem|em|%|vh|vw|svh|ch|s|ms)?\\b' },
  { kind: 'fn', re: '--[a-z][\\w-]*' },
];

const JSON_RULES: Rule[] = [
  // The key, quotes included, is the interesting half of a JSON snippet.
  { kind: 'fn', re: '"[^"\\n]*"(?=\\s*:)' },
  { kind: 'string', re: '"[^"\\n]*"' },
  { kind: 'keyword', re: '\\b(?:true|false|null)\\b' },
  { kind: 'number', re: '-?\\b\\d+(?:\\.\\d+)?(?:[eE][-+]?\\d+)?\\b' },
];

/**
 * Markdown, which is the language this product's own documents are written in.
 *
 * A FENCE IS MATCHED WHOLE, AND THAT IS WHAT PROTECTS ITS CONTENTS. `#` inside a code block stays
 * a `#` rather than becoming a heading — the one mistake that makes a highlighted markdown editor
 * worse than a plain one.
 *
 * It is the SPAN that does this, not the rule order: `exec` takes the leftmost match, and a fence
 * begins before anything inside it. Reordering these rules changes nothing — a mutation proved
 * that when it was expected to break something. What breaks it is a fence rule that cannot cross
 * a line, which is what the guard mutates.
 *
 * The structural marks — a bullet, a quote's `>`, a rule, a table's pipes — are `comment`, which
 * is the muted colour. That is deliberate: they are furniture, and a document whose bullets shout
 * reads as a document about bullets.
 */
const MARKDOWN: Rule[] = [
  { kind: 'string', re: '```[\\s\\S]*?```|~~~[\\s\\S]*?~~~|`[^`\\n]+`' },
  { kind: 'keyword', re: '^#{1,6}[^\\n]*' },
  {
    kind: 'comment',
    re: '^\\s*(?:[-*+]|\\d+\\.)\\s|^\\s*>[^\\n]*|^\\s*(?:---+|\\*\\*\\*+|___+)\\s*$|\\|',
  },
  { kind: 'fn', re: '!?\\[[^\\]\\n]*\\]\\([^)\\n]*\\)' },
  { kind: 'number', re: '\\*\\*[^*\\n]+\\*\\*|__[^_\\n]+__' },
];

const BY_LANGUAGE: Record<string, Rule[]> = {
  md: MARKDOWN, markdown: MARKDOWN, mdx: MARKDOWN,
  sh: SHELL, bash: SHELL, shell: SHELL, zsh: SHELL, console: SHELL,
  ts: TS, tsx: TS, js: TS, jsx: TS, javascript: TS, typescript: TS,
  css: CSS,
  json: JSON_RULES, jsonc: JSON_RULES,
};

/** Whether anything is known about this language. Used to decide the `data-language` marker. */
export function knows(language?: string): boolean {
  return Boolean(language && BY_LANGUAGE[language.toLowerCase()]);
}

export function tokenize(code: string, language?: string): Token[] {
  const rules = language ? BY_LANGUAGE[language.toLowerCase()] : undefined;
  if (!rules) return [{ text: code }];

  // One alternation, one pass. Separate passes would re-tokenize the inside of a comment.
  //
  // `m` because markdown's rules are the only ones anchored to a line — a heading is a `#` at the
  // START of a line and nowhere else. It is inert for every other language here, none of which
  // uses `^`, and the alternative was a per-language flag for one language's benefit.
  const pattern = new RegExp(rules.map((r, i) => `(?<k${i}>${r.re})`).join('|'), 'gm');
  const out: Token[] = [];
  let last = 0;

  for (let m = pattern.exec(code); m !== null; m = pattern.exec(code)) {
    // A rule that can match empty would loop forever; none does, but the guard costs nothing.
    if (m[0] === '') { pattern.lastIndex += 1; continue; }
    if (m.index > last) out.push({ text: code.slice(last, m.index) });
    const hit = rules.findIndex((_, i) => m?.groups?.[`k${i}`] !== undefined);
    // `exactOptionalPropertyTypes` is on, so an absent kind must be an ABSENT KEY rather than an
    // explicit `undefined` — the two are different types here and the stricter one is right: a
    // token either has a kind or does not carry the property at all.
    const kind = hit >= 0 ? rules[hit]?.kind : undefined;
    out.push(kind ? { text: m[0], kind } : { text: m[0] });
    last = m.index + m[0].length;
  }
  if (last < code.length) out.push({ text: code.slice(last) });
  return out;
}
