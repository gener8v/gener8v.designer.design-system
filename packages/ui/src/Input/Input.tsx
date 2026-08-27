import { forwardRef } from 'react';
import type { HTMLAttributes, InputHTMLAttributes, TextareaHTMLAttributes } from 'react';
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

/**
 * A FIELD AND THE WORDS THAT MAKE IT A SENTENCE.
 *
 * Some questions are not "here is a label, fill in the box" — they are one clause of something the
 * form is writing down. A constraint is "X must stay true, because Y", and asking it as two bare
 * boxes with placeholder text for a hint makes the reader reconstruct the sentence from the shape
 * of the row. They usually reconstruct it wrong.
 *
 * So the connecting words are attached to the control rather than floating above it: one bordered
 * unit that reads left to right as the thing being said. The addon is not a label — it is the part
 * of the sentence the person does not have to type. Give the input its own `aria-label`, because a
 * screen reader gets the sentence as a run of text and needs the question on the field itself.
 */
export const InputGroup = ({ className, ...rest }: HTMLAttributes<HTMLDivElement>) =>
  <div {...rest} className={cx('input-group', className)} />;

export interface InputAddonProps extends HTMLAttributes<HTMLSpanElement> {
  /** A control rather than a word — a button, a select. It keeps its own affordances and only
   *  gives up the border it shares with the field. */
  as?: 'span' | 'div';
}

export const InputAddon = ({ as: As = 'span', className, ...rest }: InputAddonProps) =>
  <As {...rest} className={cx('input-addon', className)} />;
