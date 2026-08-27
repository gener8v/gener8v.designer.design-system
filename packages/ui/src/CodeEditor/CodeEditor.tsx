import { useCallback, useId, useRef, useState } from 'react';
import type { ChangeEvent, TextareaHTMLAttributes, UIEvent } from 'react';
import { cx } from '../cx.js';
import { knows, tokenize } from '../CodeBlock/highlight.js';
import type { Token } from '../CodeBlock/highlight.js';

/** Written out rather than built from `tok-${kind}` — see `CodeBlock` for why the linter needs
 *  literals it can read. */
const TOKEN_CLASS: Record<NonNullable<Token['kind']>, string> = {
  comment: 'tok-comment',
  string: 'tok-string',
  keyword: 'tok-keyword',
  number: 'tok-number',
  fn: 'tok-fn',
};

export interface CodeEditorProps
  extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'onChange' | 'value' | 'wrap'> {
  value: string;
  onChange: (value: string) => void;
  /** Names the field. Required: an editor is a form control, not a decoration. */
  label: string;
  /** Hides the label visually. It is still announced. */
  labelHidden?: boolean;
  /** `md`, `ts`, `json`… An unknown or absent language renders plain, which is the honest
   *  fallback: a wrong highlight is worse than none. */
  language?: string;
  /** Visible rows before it scrolls. */
  rows?: number;
  /**
   * Wrap long lines.
   *
   * OFF BY DEFAULT, AND IT COSTS THE GUTTER. A wrapped line occupies several visual rows and a
   * number beside it can only point at one of them, so with wrapping on the numbers are hidden
   * rather than shown pointing at the wrong place. A gutter that lies about which line you are on
   * is worse than no gutter.
   */
  wrap?: boolean;
}

/**
 * A text editor that shows the shape of what you are typing.
 *
 * WHY THIS IS A TEXTAREA AND NOT A DOCUMENT MODEL
 *
 * The alternative is a contenteditable with its own model — which is a text editor, a project of
 * its own, and a place where undo, IME composition, spellcheck, autofill and every assistive
 * technology stop behaving the way the platform's do. A textarea keeps all of that for free.
 *
 * So the highlighting is PAINT. A `pre` renders the same string, tokenized, directly under a
 * textarea whose own text is transparent and whose caret is not. They share every metric that
 * decides where a glyph lands — family, size, line height, padding, tab size, wrapping — because
 * the moment one of them differs the caret sits somewhere the letters are not.
 *
 * That constraint is the whole design, and it is why this component owns its typography rather
 * than accepting a className that could change it.
 */
export function CodeEditor({
  value,
  onChange,
  label,
  labelHidden = false,
  language,
  rows = 18,
  wrap = false,
  className,
  disabled,
  ...rest
}: CodeEditorProps) {
  const id = useId();
  const paint = useRef<HTMLPreElement | null>(null);
  const gutter = useRef<HTMLDivElement | null>(null);
  const [lines, setLines] = useState(() => value.split('\n').length);

  /** The painted layer follows the textarea, in both axes.
   *
   *  Not `onWheel` and not a scroll listener on the pre: the textarea is the only element the
   *  reader actually scrolls, and mirroring anything else drifts by a frame on every keystroke. */
  const follow = useCallback((e: UIEvent<HTMLTextAreaElement>) => {
    const from = e.currentTarget;
    if (paint.current) {
      paint.current.scrollTop = from.scrollTop;
      paint.current.scrollLeft = from.scrollLeft;
    }
    // The gutter follows vertically only. It has no horizontal extent to follow.
    if (gutter.current) gutter.current.scrollTop = from.scrollTop;
  }, []);

  const changed = useCallback(
    (e: ChangeEvent<HTMLTextAreaElement>) => {
      setLines(e.target.value.split('\n').length);
      onChange(e.target.value);
    },
    [onChange],
  );

  const tokens = tokenize(value, language);

  return (
    <div className={cx('code-editor', className)} data-wrap={wrap || undefined}>
      <label htmlFor={id} className={labelHidden ? 'sr-only' : 'code-editor-label'}>
        {label}
      </label>
      <div className="code-editor-frame" data-language={knows(language) ? language : undefined}>
        {!wrap && (
          <div ref={gutter} className="code-editor-gutter" aria-hidden="true">
            {Array.from({ length: lines }, (_, i) => (
              <span key={i}>{i + 1}</span>
            ))}
          </div>
        )}
        <div className="code-editor-body">
          {/* THE PAINT. `aria-hidden` because the textarea below already carries the text: a
              screen reader reading both would read the document twice. */}
          <pre ref={paint} className="code-editor-paint" aria-hidden="true">
            <code>
              {tokens.map((t, i) =>
                t.kind ? (
                  <span key={i} className={TOKEN_CLASS[t.kind]}>
                    {t.text}
                  </span>
                ) : (
                  <span key={i}>{t.text}</span>
                ),
              )}
              {/* A TRAILING NEWLINE IS NOT A LINE to a `pre`, which collapses it — so the paint
                  came up one row short the moment the file ended in one, and every glyph below the
                  caret sat a row too high. */}
              {'\n'}
            </code>
          </pre>
          <textarea
            {...rest}
            id={id}
            className="code-editor-input"
            value={value}
            onChange={changed}
            onScroll={follow}
            rows={rows}
            disabled={disabled}
            spellCheck={false}
            autoCapitalize="off"
            autoCorrect="off"
            wrap={wrap ? 'soft' : 'off'}
          />
        </div>
      </div>
    </div>
  );
}
