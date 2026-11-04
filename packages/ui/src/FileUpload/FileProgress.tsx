import { forwardRef, useId } from 'react';
import type { HTMLAttributes, ReactNode } from 'react';
import { cx } from '../cx.js';
import { Button } from '../Button/index.js';
import { Progress } from '../Progress/Progress.js';
import { ProgressGlyph } from '../Progress/Mark.js';
import { formatSize } from './FileUpload.js';

/** A file on its way: waiting, moving, there, refused, or cancelled. */
export type FileProgressState = 'queued' | 'current' | 'complete' | 'failed' | 'stopped';

export interface FileProgressLabels {
  queued?: string;
  complete?: string;
  failed?: string;
  stopped?: string;
  cancel?: string;
  retry?: string;
  remove?: string;
}

const WORDS: Required<FileProgressLabels> = {
  queued: 'Waiting', complete: 'Uploaded', failed: 'Failed', stopped: 'Cancelled',
  cancel: 'Cancel', retry: 'Retry', remove: 'Remove',
};

export interface FileProgressProps extends Omit<HTMLAttributes<HTMLLIElement>, 'children'> {
  name: string;
  /** Bytes. With `value`, the helper reads `1.2 MB of 3.4 MB`. */
  size?: number;
  state: FileProgressState;
  /** 0–100 while `current`. Omit for an indeterminate bar — a transfer that has not reported yet. */
  value?: number;
  /** Why it failed, in words a person can act on. Replaces the size line when `failed`. */
  error?: ReactNode;
  /** Shown while queued or current — stops the transfer. */
  onCancel?: () => void;
  /** Shown when failed or cancelled. */
  onRetry?: () => void;
  /** Shown when complete, failed or cancelled — takes the row away. */
  onRemove?: () => void;
  /** The words, for another language or another verb (`Downloaded`). */
  labels?: FileProgressLabels;
}

/**
 * One file's transfer, as a row: name and percent above a 4px track, the size or the error below,
 * and its one action at the end — cancel while it moves, retry when it failed.
 *
 * It follows the family's stacked rule, so it reads like every other labelled bar. When the file
 * lands the bar goes and the value becomes `✓ Uploaded`; when it fails the bar stays where it
 * stopped, in danger, beside the reason. Arriving and failing are said once, politely; the
 * percentage is not, because a number read aloud every second is noise.
 */
export const FileProgress = forwardRef<HTMLLIElement, FileProgressProps>(function FileProgress(
  { name, size, state, value, error, onCancel, onRetry, onRemove, labels, className, ...rest }, ref,
) {
  const id = useId();
  const words = { ...WORDS, ...labels };
  const share = value === undefined ? undefined : Math.min(100, Math.max(0, value));
  const tone = state === 'failed' ? 'danger' : state === 'stopped' ? 'warning' : state === 'complete' ? 'success' : undefined;
  const nameId = `${id}-name`;

  const valueNode =
    state === 'current' ? (share === undefined ? null : `${Math.round(share)}%`)
    : state === 'queued' ? words.queued
    : state === 'complete' ? <><ProgressGlyph glyph="check" />{words.complete}</>
    : state === 'failed' ? <><ProgressGlyph glyph="cross" />{words.failed}</>
    : <><ProgressGlyph glyph="alert" />{words.stopped}</>;

  const helper =
    state === 'failed' && error ? error
    : size === undefined ? null
    : state === 'current' && share !== undefined ? `${formatSize((size * share) / 100)} of ${formatSize(size)}`
    : formatSize(size);

  const ended = state === 'complete' || state === 'failed' || state === 'stopped';

  return (
    <li {...rest} ref={ref} data-state={state} className={cx('file-progress', className)}>
      <div className="progress-field" data-tone={tone}>
        <div className="progress-head">
          <span className="progress-label" id={nameId} title={name}>{name}</span>
          {valueNode !== null ? (
            <span className={cx('progress-value', state !== 'current' && 'progress-status')}>{valueNode}</span>
          ) : null}
        </div>
        {state !== 'complete' ? (
          <Progress size="sm" aria-labelledby={nameId}
            {...(state === 'current' && share === undefined ? {} : { value: state === 'queued' ? 0 : (share ?? 0) })}
            {...(tone ? { tone } : {})} />
        ) : null}
        {helper !== null ? <p className="progress-helper">{helper}</p> : null}
      </div>
      {/* Two slots, always rendered: in a FileList they are the list's own columns, so a row with
          no Retry keeps the space and every bar and status lines up down the list. */}
      <div className="file-progress-slot">
        {(state === 'failed' || state === 'stopped') && onRetry ? (
          <Button variant="secondary" size="sm" onClick={onRetry} aria-label={`${words.retry} ${name}`}>{words.retry}</Button>
        ) : null}
      </div>
      <div className="file-progress-slot">
        {(state === 'queued' || state === 'current') && onCancel ? (
          <Button variant="ghost" size="sm" iconOnly aria-label={`${words.cancel} ${name}`} onClick={onCancel}>
            <ProgressGlyph glyph="cross" />
          </Button>
        ) : null}
        {ended && onRemove ? (
          <Button variant="ghost" size="sm" iconOnly aria-label={`${words.remove} ${name}`} onClick={onRemove}>
            <ProgressGlyph glyph="cross" />
          </Button>
        ) : null}
      </div>
      <span className="sr-only" aria-live="polite">
        {state === 'complete' ? `${name}: ${words.complete}` : state === 'failed' ? `${name}: ${words.failed}` : ''}
      </span>
    </li>
  );
});
