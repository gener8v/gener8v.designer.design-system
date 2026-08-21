import { useCallback, useState } from 'react';
import type { HTMLAttributes, ReactNode } from 'react';
import { cx } from '../cx.js';

export interface CodeBlockProps extends Omit<HTMLAttributes<HTMLPreElement>, 'children' | 'title'> {
  code: string;
  /** Shown in the header — a filename or a language. */
  title?: ReactNode;
  /** Adds a copy control. Off by default: not every snippet is meant to be run. */
  copyable?: boolean;
}

/**
 * Deliberately no syntax highlighting. A design system that bundles a
 * tokenizer has taken on a language grammar it now has to maintain; consumers
 * that need highlighting should pipe pre-highlighted markup into `code`.
 */
export function CodeBlock({ code, title, copyable = false, className, ...rest }: CodeBlockProps) {
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
      <pre {...rest} className={cx('code', className)}><code>{code}</code></pre>
    </div>
  );
}
