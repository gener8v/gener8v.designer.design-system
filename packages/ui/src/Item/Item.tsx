import type { HTMLAttributes, ReactNode } from 'react';
import { cx } from '../cx.js';

/**
 * A list of things, each of which is one thing.
 *
 * WHY THIS EXISTS: it was written three times in one day.
 *
 * A note in the knowledge list, an action in the project's history, a row on the shelf — all three
 * are the same shape (a name, a line of provenance under it, a mark or two at the end) and all
 * three were hand-rolled with their own flex classes, their own gaps and their own type sizes. The
 * third one is when it stops being a coincidence.
 *
 * `Table` is for values you compare down a column. `DocList` is for files. This is for a list of
 * RECORDS, where each row is read on its own and the columns would be empty most of the time.
 */
export const ItemList = ({ className, ...rest }: HTMLAttributes<HTMLUListElement>) =>
  <ul {...rest} className={cx('item-list', className)} />;

export interface ItemProps extends Omit<HTMLAttributes<HTMLLIElement>, 'title'> {
  /** What it is. The loudest thing in the row. */
  title: ReactNode;
  /** Where it came from — who, when, from what. Quieter than the title, always. */
  meta?: ReactNode;
  /** An icon or an avatar, before the text. */
  lead?: ReactNode;
  /** Marks and controls at the end of the title's line: a tag, a status, a button. */
  trailing?: ReactNode;
  /** More about it, under the meta. */
  children?: ReactNode;
  /**
   * How the detail is laid out.
   *
   * `prose` (the default) holds the reading measure. `columns` gives the measure to each column
   * instead of to the block — for a detail whose children are being compared with each other
   * rather than read in sequence.
   */
  detail?: 'prose' | 'columns';
}

/**
 * ONE ROW, AND THE TITLE'S LINE HOLDS THE MARKS.
 *
 * A tag pushed onto its own line reads as a second fact about the row rather than as a
 * qualification of its name — "not yet searchable by meaning" belongs beside the thing it is about,
 * not underneath it. So `trailing` sits on the title's line and wraps with it.
 */
export function Item({
  title,
  meta,
  lead,
  trailing,
  children,
  detail = 'prose',
  className,
  ...rest
}: ItemProps) {
  return (
    <li {...rest} className={cx('item', className)}>
      {lead ? <span className="item-lead">{lead}</span> : null}
      <span className="item-body">
        <span className="item-line">
          <span className="item-title">{title}</span>
          {trailing ? <span className="item-trailing">{trailing}</span> : null}
        </span>
        {meta ? <span className="item-meta">{meta}</span> : null}
        {children ? (
          <span className="item-detail" data-layout={detail === 'prose' ? undefined : detail}>
            {children}
          </span>
        ) : null}
      </span>
    </li>
  );
}
