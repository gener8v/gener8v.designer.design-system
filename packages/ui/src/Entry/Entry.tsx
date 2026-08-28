import type { HTMLAttributes, ReactNode } from 'react';
import { cx } from '../cx.js';

export interface EntryProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  /** What this product is called. Shown above everything else. */
  mark: ReactNode;
  /** What the person is about to do — "Sign in to the delivery record". */
  title: ReactNode;
  /** One sentence under it, where there is one worth saying. */
  lede?: ReactNode;
  /** The way in that this product recommends. */
  children: ReactNode;
  /** Other ways in, drawn as secondary. */
  alternatives?: ReactNode;
  /** What somebody needs to know before they try — an invitation rule, a support address. */
  note?: ReactNode;
}

/**
 * A WAY IN. The page that stands between somebody and the product.
 *
 * WHY THIS IS A COMPONENT AND NOT A LAYOUT SOMEBODY WRITES ONCE
 *
 * A consumer rendered its sign-in form with the EMPTY-STATE component — the one that says "there
 * is nothing here" — because that was the nearest thing the system offered. It worked and it read
 * as a dead end: a lock icon, a refusal-shaped heading, and a form underneath it looking like an
 * afterthought on a page about absence.
 *
 * A gate is not an empty state and it is not a document. It has exactly one thing to do, it is the
 * first thing anybody sees of the product, and it has to say WHAT THE PRODUCT IS — a credentials
 * form carrying no name is one somebody has to take on trust, and taking credential forms on trust
 * is the habit this industry spends the rest of its time trying to break.
 *
 * ONE RECOMMENDED WAY IN, AND THE REST BELOW A RULE
 *
 * `children` is the way in this product wants used; `alternatives` are the others. They are
 * separated by a rule rather than by size alone, because a second sign-in button drawn slightly
 * smaller reads as a variant of the first rather than as a different door.
 */
export function Entry({
  mark, title, lede, children, alternatives, note, className, ...rest
}: EntryProps) {
  return (
    <div {...rest} className={cx('entry-ground', className)}>
      <main className="entry">
        {/* THE MARK ABOVE THE TITLE, not beside it. Beside, at the same size, they read as one
            phrase — "TRAISEE Sign in" — and the product's name stops being the product's name. */}
        <p className="entry-mark">{mark}</p>
        <h1 className="entry-title">{title}</h1>
        {lede ? <p className="entry-lede">{lede}</p> : null}
        <div className="entry-way">{children}</div>
        {alternatives ? <div className="entry-alternatives">{alternatives}</div> : null}
        {note ? <p className="entry-note">{note}</p> : null}
      </main>
    </div>
  );
}
