import { forwardRef, useId, useState } from 'react';
import type { HTMLAttributes, ReactNode } from 'react';
import { cx } from '../cx.js';
import { Tag } from '../Tag/index.js';
import { Pulse } from '../Live/index.js';

/**
 * Where a tool call is. `running` until there is a result; `done` with one; `refused` when the tool
 * was not allowed to run (a permission, a guard); `failed` when it ran and broke.
 */
export type ToolChipState = 'running' | 'done' | 'refused' | 'failed';

export interface ToolChipLabels {
  /** Said, not shown, after a running label. Default `running`. */
  running?: string;
  /** The tag on a refused call. Default `refused`. */
  refused?: string;
  /** The tag on a failed call. Default `failed`. */
  failed?: string;
}

export interface ToolChipProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  /** What the tool does, said while it runs — `List requirements`. See `toolWords`. */
  label: ReactNode;
  /** What happened — `Listed 6 requirements`. Replaces the label once there is one. */
  result?: ReactNode;
  /** Defaults to `running` without a result and `done` with one. */
  state?: ToolChipState;
  /** What it was called with. Shown as a list when the chip is opened. */
  args?: Record<string, unknown>;
  /** Anything else worth a press — the raw result, an error. Shown under the arguments. */
  detail?: ReactNode;
  /** Controlled. */
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** How an argument's key is written. Default: underscores to spaces. */
  formatKey?: (key: string) => string;
  /** How an argument's value is written. Default: strings as they are, the rest as JSON. */
  formatValue?: (value: unknown, key: string) => ReactNode;
  labels?: ToolChipLabels;
}

/** A tool's name as words: `list_requirements` → `List requirements`. */
export function toolWords(name: string): string {
  const words = name.replace(/[_-]+/g, ' ').trim();
  return words ? words[0]!.toUpperCase() + words.slice(1) : 'Working';
}

const Caret = () => (
  <svg className="tool-chip-caret" viewBox="0 0 16 16" aria-hidden="true" focusable="false">
    <path d="M6 3.5L10.5 8 6 12.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"
      strokeLinejoin="round" fill="none" />
  </svg>
);

const plain = (v: unknown): ReactNode => (typeof v === 'string' ? v : JSON.stringify(v));

/**
 * A tool call is a chip, not a paragraph.
 *
 * "Listed 6 requirements" is what happened; the arguments are there for the one reader who wants
 * them, a press away. While the call runs the chip says what it is doing beside a pulse; when it
 * lands, the result takes the label's place. A refused or failed call says so in a tag, in words,
 * so the state is never the colour alone.
 *
 * A chip with nothing to open is not a button: there is nothing to press.
 */
export const ToolChip = forwardRef<HTMLDivElement, ToolChipProps>(function ToolChip(
  {
    label, result, state, args, detail, open: controlled, defaultOpen = false, onOpenChange,
    formatKey = (k) => k.replace(/_/g, ' '), formatValue = plain, labels, className, ...rest
  }, ref,
) {
  const [own, setOwn] = useState(defaultOpen);
  const open = controlled ?? own;
  const id = useId();
  const status: ToolChipState = state ?? (result === undefined ? 'running' : 'done');
  const entries = Object.entries(args ?? {});
  const expandable = entries.length > 0 || detail != null;
  const said = result ?? label;
  const toggle = () => {
    const next = !open;
    if (controlled === undefined) setOwn(next);
    onOpenChange?.(next);
  };

  const words = (
    <>
      {status === 'running' ? <Pulse /> : null}
      <span className="tool-chip-label">{said}</span>
      {status === 'running' ? <span className="sr-only">, {labels?.running ?? 'running'}</span> : null}
    </>
  );

  return (
    <div {...rest} ref={ref} data-state={status} aria-busy={status === 'running' || undefined}
      className={cx('tool-chip', className)}>
      {expandable ? (
        <button type="button" className="tool-chip-toggle" aria-expanded={open}
          aria-controls={open ? id : undefined} onClick={toggle}>
          <Caret />
          {words}
        </button>
      ) : <span className="tool-chip-toggle">{words}</span>}
      {status === 'refused' ? <Tag variant="danger">{labels?.refused ?? 'refused'}</Tag> : null}
      {status === 'failed' ? <Tag variant="danger">{labels?.failed ?? 'failed'}</Tag> : null}
      {open && expandable ? (
        <div className="tool-chip-detail" id={id}>
          {entries.length ? (
            <dl className="tool-chip-args">
              {entries.map(([k, v]) => (
                <div key={k}>
                  <dt>{formatKey(k)}</dt>
                  <dd>{formatValue(v, k)}</dd>
                </div>
              ))}
            </dl>
          ) : null}
          {detail != null ? <div className="tool-chip-more">{detail}</div> : null}
        </div>
      ) : null}
    </div>
  );
});
