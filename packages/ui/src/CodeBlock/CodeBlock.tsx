import { useCallback, useState } from 'react';
import type { HTMLAttributes, ReactNode } from 'react';
import { cx } from '../cx.js';
import { knows, tokenize } from './highlight.js';
import type { Token } from './highlight.js';

/**
 * Written out rather than built from `tok-${kind}`.
 *
 * `lint:parity` reads the class names a component can emit, and a template literal is not one it
 * can resolve — nor should it be: a class the linter cannot see is a class that can drift out of
 * the stylesheet without anything noticing. Six literals cost nothing.
 */
const TOKEN_CLASS: Record<NonNullable<Token['kind']>, string> = {
  comment: 'tok-comment',
  string: 'tok-string',
  keyword: 'tok-keyword',
  number: 'tok-number',
  fn: 'tok-fn',
};

export interface CodeBlockProps extends Omit<HTMLAttributes<HTMLPreElement>, 'children' | 'title'> {
  code: string;
  /** Shown in the header — a filename or a language. */
  title?: ReactNode;
  /** Adds a copy control. Off by default: not every snippet is meant to be run. */
  copyable?: boolean;
  /**
   * Highlights for this language — `sh`, `ts`, `tsx`, `js`, `css`, `json` and their aliases.
   *
   * Omitted, or unknown, and the code renders plain. Highlighting is opt-in because a snippet that
   * is not source — a log line, a stack trace, a diff — reads worse with keywords picked out of it.
   */
  language?: string;
}

/**
 * Highlighting is a DISPLAY concern here, not a parsing one.
 *
 * The rule this used to state — that a design system bundling a tokenizer takes on a grammar it has
 * to maintain — still holds for a parser, and `highlight.ts` is not one. It is eighty lines of
 * regex over six languages, with no dependency: shiki and prism are each larger than this whole
 * package. What it buys is a snippet that stops reading as one undifferentiated wall.
 *
 * The escape hatch is unchanged. Leave `language` off and pipe pre-highlighted markup into `code`
 * if you need correctness rather than legibility.
 */
export function CodeBlock({ code, title, copyable = false, language, className, ...rest }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const copy = useCallback(async () => {
    try {
      await navigator.clipboard?.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // Clipboard is permission-gated and blocked in some embeds. Failing
      // silently is right — the code is selectable either way.
    }
  }, [code]);

  return (
    <div>
      {(title || copyable) && (
        <div className="code-head">
          {title}
          {copyable && (
            <button type="button" className="btn btn-ghost btn-xs code-copy" onClick={copy}>
              {copied ? 'Copied' : 'Copy'}
            </button>
          )}
        </div>
      )}
      <pre {...rest} className={cx('code', className)}>
        {/* `data-language` is the hook a consumer hangs its own highlighter on. No `language-*`
            CLASS: nothing in the stylesheet styles one, and a class that styles nothing is a
            promise the system has not made. */}
        <code {...(knows(language) ? { 'data-language': language } : {})}>
          {tokenize(code, language).map((t, i) =>
            t.kind ? <span key={i} className={TOKEN_CLASS[t.kind]}>{t.text}</span> : t.text,
          )}
        </code>
      </pre>
    </div>
  );
}
