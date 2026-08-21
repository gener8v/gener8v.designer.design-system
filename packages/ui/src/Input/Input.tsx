import { forwardRef } from 'react';
import type { InputHTMLAttributes, TextareaHTMLAttributes } from 'react';
import { cx } from '../cx.js';

export type ControlSize = 'sm' | 'md' | 'lg';

const INPUT_SIZE: Record<ControlSize, string | undefined> = {
  sm: 'input-sm', md: undefined, lg: 'input-lg',
};

/** `size` shadows the native numeric attribute, so it is omitted deliberately. */
export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  size?: ControlSize;
  /** Drives both the border treatment and `aria-invalid` — they cannot disagree. */
  invalid?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { size = 'md', invalid = false, className, ...rest }, ref,
) {
  return <input {...rest} ref={ref} aria-invalid={invalid || undefined}
    className={cx('input', INPUT_SIZE[size], className)} />;
});

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  invalid?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { invalid = false, className, ...rest }, ref,
) {
  return <textarea {...rest} ref={ref} aria-invalid={invalid || undefined}
    className={cx('textarea', className)} />;
});
