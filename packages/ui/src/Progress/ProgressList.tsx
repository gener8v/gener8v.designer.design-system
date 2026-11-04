import { forwardRef, useEffect, useId, useRef, useState } from 'react';
import type { HTMLAttributes, ReactNode } from 'react';
import { cx } from '../cx.js';
import { ProgressMark, PROGRESS_STATE_WORDS } from './Mark.js';
import type { ProgressState } from './Mark.js';
import { Progress } from './Progress.js';

export interface ProgressTask {
  /** Stable across renders: it is how a task's change of state is noticed and announced. */
  id: string;
  label: ReactNode;
  /** A line under the label — what it does, or why it failed. */
  description?: ReactNode;
  state: ProgressState;
  /** Said to assistive tech for this task's state. Defaults to the family's word. */
  stateLabel?: string;
}

export interface ProgressListProps extends Omit<HTMLAttributes<HTMLElement>, 'children'> {
  /** The tasks, in the order they run. */
  items: ProgressTask[];
  /** What the list is — `Setting up your workspace`. Names the list and its bar. */
  label: ReactNode;
  /** The count and the 4px bar under the title. On by default. */
  summary?: boolean;
  /**
   * Said once, politely, when the last task completes. A task that fails is always said. Nothing
   * else is: a task starting is not news to someone listening.
   */
  doneMessage?: string;
}

/**
 * A list of tasks with their state, and how many are done — `3 of 7`.
 *
 * For setup, onboarding and an agent's run: work the SYSTEM does, which the reader watches. The
 * running task's mark is the spinner and the list is `aria-busy` while one runs. Skipped tasks are
 * left out of the count, because they will never be done and are not owed.
 *
 * Not for a list the reader ticks themselves — that is `Checklist`.
 */
export const ProgressList = forwardRef<HTMLElement, ProgressListProps>(function ProgressList(
  { items, label, summary = true, doneMessage, className, ...rest }, ref,
) {
  const id = useId();
  const titleId = `${id}-title`;
  const owed = items.filter((i) => i.state !== 'skipped');
  const done = owed.filter((i) => i.state === 'complete').length;
  const running = items.some((i) => i.state === 'current');

  const before = useRef<Map<string, ProgressState> | null>(null);
  const [said, setSaid] = useState('');
  useEffect(() => {
    const was = before.current;
    before.current = new Map(items.map((i) => [i.id, i.state]));
    if (!was) return;
    const lines: string[] = [];
    for (const item of items) {
      if (item.state === 'failed' && was.get(item.id) !== 'failed') {
        lines.push(`${typeof item.label === 'string' ? item.label : 'A task'}: ${item.stateLabel ?? PROGRESS_STATE_WORDS.failed}`);
      }
    }
    const allDone = owed.length > 0 && done === owed.length;
    const wasDone = owed.every((i) => was.get(i.id) === 'complete');
    if (allDone && !wasDone) lines.push(doneMessage ?? `All ${owed.length} done`);
    if (lines.length) setSaid(lines.join('. '));
  });

  return (
    <section {...rest} ref={ref} aria-labelledby={titleId} aria-busy={running || undefined}
      className={cx('progress-list', className)}>
      <div className="progress-field">
        <div className="progress-head">
          <span className="progress-label" id={titleId}>{label}</span>
          {summary ? <span className="progress-value">{done} of {owed.length}</span> : null}
        </div>
        {summary ? (
          <Progress size="sm" value={done} max={Math.max(owed.length, 1)} aria-labelledby={titleId}
            valueText={`${done} of ${owed.length} done`}
            tone={owed.length > 0 && done === owed.length ? 'success' : 'default'} />
        ) : null}
      </div>
      <ol className="progress-list-items">
        {items.map((item) => (
          <li key={item.id} className="progress-list-item" data-state={item.state}
            aria-current={item.state === 'current' ? 'step' : undefined}>
            <ProgressMark state={item.state} />
            <span className="progress-list-label">
              {item.label}
              <span className="sr-only">, {item.stateLabel ?? PROGRESS_STATE_WORDS[item.state]}</span>
            </span>
            {item.description ? <span className="progress-list-description">{item.description}</span> : null}
          </li>
        ))}
      </ol>
      <span className="sr-only" aria-live="polite">{said}</span>
    </section>
  );
});
