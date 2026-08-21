import { forwardRef } from 'react';
import type { InputHTMLAttributes, ReactNode } from 'react';
import { cx } from '../cx.js';

export interface SliderProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'value'> {
  value: number;
  min?: number;
  max?: number;
  /** Rendered above the track with the current value on the right. */
  label?: ReactNode;
  /** Defaults to the raw value. Use for units — "62%", "3 days". */
  display?: ReactNode;
}

/**
 * A native range input. Keyboard stepping, value announcement and form
 * participation all come free; a div-based slider reimplements all three and
 * usually gets at least one wrong.
 */
export const Slider = forwardRef<HTMLInputElement, SliderProps>(function Slider(
  { value, min = 0, max = 100, label, display, className, style, id, ...rest }, ref,
) {
  const pct = max > min ? ((value - min) / (max - min)) * 100 : 0;
  const input = (
    <input {...rest} ref={ref} id={id} type="range" value={value} min={min} max={max}
      style={{ ...style, ['--slider-pct' as string]: pct }}
      className={cx('slider', className)} />
  );
  if (!label) return input;
  return (
    <div>
      <div className="slider-head">
        <label className="field-label" htmlFor={id}>{label}</label>
        <span className="slider-value" aria-hidden="true">{display ?? value}</span>
      </div>
      {input}
    </div>
  );
});
