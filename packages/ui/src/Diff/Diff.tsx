import { forwardRef, useMemo } from 'react';
import type { HTMLAttributes, ReactNode } from 'react';
import { cx } from '../cx.js';
import { diff } from './lcs.js';
import type { DiffGranularity, DiffOp } from './lcs.js';

export type DiffMode = 'inline' | 'split';

export interface DiffLabels {
  /** Heads the left pane in split mode, and is the screen-reader prefix nowhere else. */
  before: string;
  after: string;
  /** Read before every removal by assistive tech, which does not announce `<del>` on its own. */
  removed: string;
  added: string;
}

const LABELS: DiffLabels = { before: 'Before', after: 'After', removed: 'Removed:', added: 'Added:' };

export interface DiffProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  before: string;
  after: string;
  /** `inline` interleaves the change in one text; `split` sets the two versions side by side. */
  mode?: DiffMode;
  /** `word` for prose — a sentence that changed one word shows one word. `line` for lists and code. */
  granularity?: DiffGranularity;
  labels?: Partial<DiffLabels>;
}

/** Lines of one op, keeping each line's own newline out of the rendered text. */
const lines = (text: string) => text.replace(/\n$/, '').split('\n');

function Mark({ op, labels }: { op: DiffOp; labels: DiffLabels }) {
  if (op.type === 'equal') return <>{op.text}</>;
  const Tag = op.type === 'added' ? 'ins' : 'del';
  return (
    <Tag className={op.type === 'added' ? 'diff-ins' : 'diff-del'}>
      <span className="sr-only">{op.type === 'added' ? labels.added : labels.removed} </span>
      {op.text}
    </Tag>
  );
}

function Lines({ ops, labels }: { ops: DiffOp[]; labels: DiffLabels }) {
  const rows: ReactNode[] = [];
  ops.forEach((op, k) => {
    lines(op.text).forEach((line, n) => {
      const sign = op.type === 'added' ? '+' : op.type === 'removed' ? '−' : '';
      rows.push(
        <div key={`${k}-${n}`} className="diff-line" data-change={op.type === 'equal' ? undefined : op.type}>
          <span className="diff-sign" aria-hidden="true">{sign}</span>
          <span className="diff-line-text"><Mark op={{ type: op.type, text: line || ' ' }} labels={labels} /></span>
        </div>,
      );
    });
  });
  return <div className="diff-lines">{rows}</div>;
}

function Body({ ops, granularity, labels }: { ops: DiffOp[]; granularity: DiffGranularity; labels: DiffLabels }) {
  if (granularity === 'line') return <Lines ops={ops} labels={labels} />;
  return <p className="diff-text">{ops.map((op, k) => <Mark key={k} op={op} labels={labels} />)}</p>;
}

/**
 * Two versions of a text, and what changed between them.
 *
 * **Not by colour alone.** A removal is struck through and an addition underlined, so the two
 * survive greyscale, a colour-blind reader and forced colours; in line mode each changed line also
 * carries a `+` or `−` in the gutter. The markup is `<ins>` and `<del>` — the elements whose
 * meaning this is — with a visually hidden "Added:" or "Removed:" ahead of each, because screen
 * readers do not announce either element by default.
 *
 * The diff is computed here, with a compact LCS and no dependency (`diff()` is exported for
 * callers that want the operations rather than the rendering).
 */
export const Diff = forwardRef<HTMLDivElement, DiffProps>(function Diff(
  { before, after, mode = 'inline', granularity = 'word', labels: given, className, ...rest }, ref,
) {
  const labels = { ...LABELS, ...given };
  const ops = useMemo(() => diff(before, after, granularity), [before, after, granularity]);

  return (
    <div {...rest} ref={ref} data-mode={mode} data-granularity={granularity} className={cx('diff', className)}>
      {mode === 'inline' ? (
        <Body ops={ops} granularity={granularity} labels={labels} />
      ) : (
        <>
          <div className="diff-pane">
            <p className="diff-pane-head">{labels.before}</p>
            <Body ops={ops.filter((o) => o.type !== 'added')} granularity={granularity} labels={labels} />
          </div>
          <div className="diff-pane">
            <p className="diff-pane-head">{labels.after}</p>
            <Body ops={ops.filter((o) => o.type !== 'removed')} granularity={granularity} labels={labels} />
          </div>
        </>
      )}
    </div>
  );
});
