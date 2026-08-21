import { forwardRef } from 'react';
import type { ButtonHTMLAttributes, HTMLAttributes, ReactNode } from 'react';
import { cx } from '../cx.js';

export type DocKind = 'folder' | 'md' | 'pdf' | 'xlsx' | 'csv' | 'img' | 'other';

/** Extension → kind. Unknown extensions fall to `other` rather than guessing. */
export function kindOf(name: string): DocKind {
  const ext = name.split('.').pop()?.toLowerCase() ?? '';
  if (['md', 'markdown', 'mdx'].includes(ext)) return 'md';
  if (ext === 'pdf') return 'pdf';
  if (['xlsx', 'xls', 'numbers'].includes(ext)) return 'xlsx';
  if (['csv', 'tsv'].includes(ext)) return 'csv';
  if (['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'].includes(ext)) return 'img';
  return 'other';
}

export const formatBytes = (bytes: number) => {
  const units = ['B', 'KB', 'MB', 'GB'];
  let n = bytes;
  let u = 0;
  while (n >= 1024 && u < units.length - 1) { n /= 1024; u += 1; }
  return `${n < 10 && u > 0 ? n.toFixed(1) : Math.round(n)} ${units[u]}`;
};

export interface DocTypeProps extends Omit<HTMLAttributes<HTMLSpanElement>, 'children'> {
  kind: DocKind;
  /** Shown inside the badge. Defaults to the kind, uppercased. */
  label?: string;
}

/**
 * File type is a mono badge, not a coloured chip. A dozen tinted extensions is
 * the wall of colour this system exists to avoid, and colour-coding by
 * extension fails anyone who cannot separate the hues. Folders are the one
 * exception, because they are navigation rather than content.
 */
export const DocType = forwardRef<HTMLSpanElement, DocTypeProps>(function DocType(
  { kind, label, className, ...rest }, ref,
) {
  return (
    <span {...rest} ref={ref} data-kind={kind} aria-hidden="true"
      className={cx('doc-type', className)}>
      {kind === 'folder' ? (
        <svg viewBox="0 0 256 256" fill="currentColor"><path d="M216,72H131.31L104,44.69A15.86,15.86,0,0,0,92.69,40H40A16,16,0,0,0,24,56V200.62A15.4,15.4,0,0,0,39.38,216H216.89A15.13,15.13,0,0,0,232,200.89V88A16,16,0,0,0,216,72ZM40,56H92.69l16,16H40Zm176,144H40V88H216Z"/></svg>
      ) : (label ?? kind.toUpperCase())}
    </span>
  );
});

export const DocList = ({ className, ...rest }: HTMLAttributes<HTMLUListElement>) =>
  <ul {...rest} className={cx('doc-list', className)} />;

export interface DocRowProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  name: string;
  kind?: DocKind;
  /** Second line — a path, an owner, an excerpt. */
  sub?: ReactNode;
  size?: number;
  modified?: ReactNode;
  selected?: boolean;
}

export const DocRow = forwardRef<HTMLButtonElement, DocRowProps>(function DocRow(
  { name, kind, sub, size, modified, selected, className, type = 'button', ...rest }, ref,
) {
  const k = kind ?? kindOf(name);
  return (
    <li>
      <button {...rest} ref={ref} type={type} aria-selected={selected}
        className={cx('doc-row', className)}>
        <DocType kind={k} />
        <span className="doc-name">
          {name}
          {sub ? <span className="doc-sub">{sub}</span> : null}
        </span>
        {size !== undefined ? <span className="doc-meta">{formatBytes(size)}</span> : null}
        {modified ? <span className="doc-meta">{modified}</span> : null}
      </button>
    </li>
  );
});

export const DocGrid = ({ className, ...rest }: HTMLAttributes<HTMLDivElement>) =>
  <div {...rest} className={cx('doc-grid', className)} />;

export interface DocCardProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  name: string;
  kind?: DocKind;
  meta?: ReactNode;
  thumb?: ReactNode;
}

export const DocCard = forwardRef<HTMLButtonElement, DocCardProps>(function DocCard(
  { name, kind, meta, thumb, className, type = 'button', ...rest }, ref,
) {
  const k = kind ?? kindOf(name);
  return (
    <button {...rest} ref={ref} type={type} className={cx('doc-card', className)}>
      <span className="doc-thumb">{thumb ?? <DocType kind={k} />}</span>
      <span className="doc-name">{name}{meta ? <span className="doc-sub">{meta}</span> : null}</span>
    </button>
  );
});

export const DocPreview = ({ className, ...rest }: HTMLAttributes<HTMLDivElement>) =>
  <div {...rest} className={cx('doc-preview', className)} />;
export const DocPreviewHead = ({ className, ...rest }: HTMLAttributes<HTMLDivElement>) =>
  <div {...rest} className={cx('doc-preview-head', className)} />;
export const DocPreviewTitle = ({ className, ...rest }: HTMLAttributes<HTMLSpanElement>) =>
  <span {...rest} className={cx('doc-preview-title', className)} />;
export const DocPreviewActions = ({ className, ...rest }: HTMLAttributes<HTMLDivElement>) =>
  <div {...rest} className={cx('doc-preview-actions', className)} />;
export const DocPreviewBody = ({ className, ...rest }: HTMLAttributes<HTMLDivElement>) =>
  <div {...rest} className={cx('doc-preview-body', className)} />;

/** Rendered document body. Measure is capped so a wide pane stays readable. */
export const Reader = ({ className, ...rest }: HTMLAttributes<HTMLDivElement>) =>
  <div {...rest} className={cx('reader', className)} />;

/** A spreadsheet preview — a grid shown as a grid. */
export const Sheet = ({ className, ...rest }: HTMLAttributes<HTMLTableElement>) =>
  <table {...rest} className={cx('sheet', className)} />;
