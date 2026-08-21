import { forwardRef, useCallback, useId, useRef, useState } from 'react';
import type { HTMLAttributes, InputHTMLAttributes, ReactNode } from 'react';
import { cx } from '../cx.js';

export interface FileUploadProps
  extends Omit<HTMLAttributes<HTMLLabelElement>, 'onChange' | 'title'> {
  onFiles: (files: File[]) => void;
  accept?: string;
  multiple?: boolean;
  disabled?: boolean;
  title?: ReactNode;
  hint?: ReactNode;
  icon?: ReactNode;
  inputProps?: InputHTMLAttributes<HTMLInputElement>;
}

/**
 * A `<label>` wrapping a real `<input type="file">`. The input is `.sr-only`,
 * not `display: none` — hiding it that way removes it from the accessibility
 * tree and from the tab order, leaving a control only a mouse can operate.
 *
 * Drag-and-drop is an enhancement layered on top; the input alone is fully
 * usable without it.
 */
export const FileUpload = forwardRef<HTMLLabelElement, FileUploadProps>(function FileUpload(
  { onFiles, accept, multiple = false, disabled = false, title, hint, icon, inputProps, className, ...rest },
  ref,
) {
  const [dragging, setDragging] = useState(false);
  const depth = useRef(0); // dragenter/leave fire per child; count to avoid flicker
  const hintId = useId();

  const stop = (e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); };

  const onDrop = useCallback((e: React.DragEvent) => {
    stop(e);
    depth.current = 0;
    setDragging(false);
    if (disabled) return;
    const files = [...e.dataTransfer.files];
    if (files.length) onFiles(multiple ? files : files.slice(0, 1));
  }, [disabled, multiple, onFiles]);

  return (
    <label {...rest} ref={ref}
      aria-disabled={disabled || undefined}
      data-dragging={dragging || undefined}
      aria-describedby={hint ? hintId : undefined}
      onDragEnter={(e) => { stop(e); if (!disabled) { depth.current += 1; setDragging(true); } }}
      onDragOver={stop}
      onDragLeave={(e) => { stop(e); depth.current -= 1; if (depth.current <= 0) setDragging(false); }}
      onDrop={onDrop}
      className={cx('dropzone', className)}>
      {icon ? <span className="dropzone-icon">{icon}</span> : null}
      {title ? <span className="dropzone-title">{title}</span> : null}
      {hint ? <span className="dropzone-hint" id={hintId}>{hint}</span> : null}
      <input {...inputProps} type="file" className="sr-only"
        accept={accept} multiple={multiple} disabled={disabled}
        onChange={(e) => {
          const files = [...(e.target.files ?? [])];
          if (files.length) onFiles(files);
          e.target.value = ''; // allow re-selecting the same file
        }} />
    </label>
  );
});

export const FileList = ({ className, ...rest }: HTMLAttributes<HTMLUListElement>) =>
  <ul {...rest} className={cx('file-list', className)} />;

export interface FileItemProps extends HTMLAttributes<HTMLLIElement> {
  name: string;
  /** Bytes. Formatted for display. */
  size?: number;
  error?: boolean;
  icon?: ReactNode;
}

const formatSize = (bytes: number) => {
  const units = ['B', 'KB', 'MB', 'GB'];
  let n = bytes;
  let u = 0;
  while (n >= 1024 && u < units.length - 1) { n /= 1024; u += 1; }
  return `${n < 10 && u > 0 ? n.toFixed(1) : Math.round(n)} ${units[u]}`;
};

export const FileItem = ({ name, size, error, icon, className, children, ...rest }: FileItemProps) => (
  <li {...rest} data-state={error ? 'error' : undefined} className={cx('file-item', className)}>
    {icon}
    <span className="file-name" title={name}>{name}</span>
    {size !== undefined ? <span className="file-size">{formatSize(size)}</span> : null}
    {children}
  </li>
);
