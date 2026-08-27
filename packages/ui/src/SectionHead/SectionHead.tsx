import type { HTMLAttributes, ReactNode } from 'react';
import { cx } from '../cx.js';

export interface SectionHeadProps extends Omit<HTMLAttributes<HTMLElement>, 'title'> {
  /** What the section IS. A noun phrase, and the loudest thing in the block. */
  title: ReactNode;
  /** What to know about it. Quieter than the title, always — it is commentary. */
  lede?: ReactNode;
  /** Which heading level this is in the page's outline. The SIZE does not change with it: a
   *  section heading is a section heading wherever it sits, and an outline is not a type scale. */
  as?: 'h2' | 'h3' | 'h4';
  /** A control belonging to the section — an "Add", a "Refresh". Sits at the end of the title's
   *  line, centred against it. */
  action?: ReactNode;
}

/**
 * THE NAME OF A SECTION, SET LIKE A NAME.
 *
 * This exists because of what filled the gap without it. `h2` is 36px — a page heading — so a
 * section inside a dense surface reached for `.label` instead: 11px, mono, uppercase, grey. The
 * sentence underneath it was `.lede` at 20px. So on every one of those surfaces the NAME of the
 * thing was set smaller than the commentary about it, which inverts the one convention every
 * reader has held since print: the heading is the loud part.
 *
 * A section heading is `--text-lg`, in the heading family, in the darkest ink. Its lede is
 * `--text-sm` and grey. Nothing about that is configurable, because the whole failure was a
 * hundred local decisions about it.
 */
export function SectionHead({ title, lede, as: Tag = 'h2', action, className, ...rest }: SectionHeadProps) {
  return (
    <div {...rest} className={cx('section-head', className)}>
      <div className="section-head-line">
        <Tag className="section-title">{title}</Tag>
        {action ? <div className="section-head-action">{action}</div> : null}
      </div>
      {lede ? <p className="section-lede">{lede}</p> : null}
    </div>
  );
}
