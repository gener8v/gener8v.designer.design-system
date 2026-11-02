import { forwardRef } from 'react';
import type { AnchorHTMLAttributes, HTMLAttributes, MouseEvent, ReactNode } from 'react';
import { cx } from '../cx.js';

export interface CitationProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  /** What the marker says — `S4`. Short: it sits inside a sentence. */
  children: ReactNode;
  /**
   * The source could not be found. Drawn as a dashed, unlinked marker that says so, never as a
   * link to a page that will not load.
   */
  missing?: boolean;
}

/**
 * A citation marker inside prose: `[S4]`, followed in place to what it names.
 *
 * The same class styles a marker in HTML nobody wrote in React — a sanitised document emits
 * `<a class="citation" data-source="4">` and gets the same mark — which is how
 * `useDelegatedHoverCard` previews it. A missing source is a `<span>` with `data-missing` and
 * visually hidden words saying it was not found, so the dashed border is never the only signal.
 */
export const Citation = forwardRef<HTMLAnchorElement, CitationProps>(function Citation(
  { missing = false, className, children, href, ...rest }, ref,
) {
  if (missing) {
    const { id, title } = rest;
    return (
      <span id={id} title={title} className={cx('citation', className)} data-missing="">
        {children}<span className="sr-only"> (source not found)</span>
      </span>
    );
  }
  return <a {...rest} ref={ref} href={href} className={cx('citation', className)}>{children}</a>;
});

export interface SourceCardAction {
  /** Title Case — `Open at Passage`. */
  label: string;
  href?: string;
  /**
   * Called on a plain left click instead of following `href`; modified clicks (new tab, new
   * window) still follow it.
   */
  onActivate?: (event: MouseEvent<HTMLAnchorElement | HTMLButtonElement>) => void;
}

export interface SourceCardProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  /** The marker's number or name — `S4`. Shown in mono before the file. */
  id?: string;
  /** The file or item — `Internal Ops Meetings — Running Notes.docx`. */
  file?: ReactNode;
  /** Where in it — `Page 3`, `Slide 10`, `00:14:22`. */
  locator?: ReactNode;
  /** The words that were cited. Quoted, and cut with an ellipsis when `truncated`. */
  excerpt?: ReactNode;
  /** The excerpt is a cut of a longer passage. Adds the ellipsis. */
  truncated?: boolean;
  /** What opening it does. Usually `Open at Passage`. */
  action?: SourceCardAction;
  /** The source is gone — the card says so instead of drawing an empty quote. */
  missing?: boolean;
  /** Still being fetched. */
  loading?: boolean;
}

/**
 * What a citation points at, as a card: the file, the place in it, the words cited, and a way to
 * open it there. The body of a citation's hover card; equally the head of a source list.
 */
export const SourceCard = forwardRef<HTMLDivElement, SourceCardProps>(function SourceCard(
  { id, file, locator, excerpt, truncated = false, action, missing = false, loading = false, className, ...rest }, ref,
) {
  const follow = (e: MouseEvent<HTMLAnchorElement | HTMLButtonElement>) => {
    if (!action?.onActivate) return;
    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    action.onActivate(e);
  };
  return (
    <div {...rest} ref={ref} className={cx('source-card', className)}
      data-missing={missing ? '' : undefined} aria-busy={loading || undefined}>
      <p className="source-card-file">
        {id ? <span className="source-card-id">{id}</span> : null}
        <span>{file ?? 'Source'}</span>
      </p>
      {loading ? (
        <>
          <span className="skeleton skeleton-text" aria-hidden="true" />
          <span className="skeleton skeleton-text" aria-hidden="true" />
        </>
      ) : missing ? (
        <p className="source-card-excerpt">This source is not in the corpus, so the passage cannot be shown.</p>
      ) : (
        <>
          {locator ? <p className="source-card-locator"><span className="tag tag-neutral">{locator}</span></p> : null}
          {excerpt ? (
            <blockquote className="source-card-excerpt">“{excerpt}{truncated ? '…' : ''}”</blockquote>
          ) : null}
        </>
      )}
      {action && !missing && !loading ? (
        action.href ? (
          <a className="source-card-action" href={action.href} onClick={follow}>{action.label}</a>
        ) : (
          <button type="button" className="source-card-action" onClick={follow}>{action.label}</button>
        )
      ) : null}
    </div>
  );
});
