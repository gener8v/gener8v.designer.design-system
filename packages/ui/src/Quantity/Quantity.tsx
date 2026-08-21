import { useId } from 'react';
import { cx } from '../cx.js';

export interface QuantityProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  label: string;
  className?: string;
  disabled?: boolean;
}

/**
 * Stepper over a real `number` input, so typing 12 beats clicking + eleven
 * times. The buttons are `aria-hidden`-free real buttons with their own names;
 * the input carries the value and the label.
 */
export function Quantity({ value, onChange, min = 0, max = 99, label, className, disabled }: QuantityProps) {
  const id = useId();
  const clamp = (n: number) => Math.max(min, Math.min(max, n));
  return (
    <div className={cx('qty', className)}>
      <button type="button" className="qty-btn" disabled={disabled || value <= min}
        aria-label={`Decrease ${label}`} onClick={() => onChange(clamp(value - 1))}>−</button>
      <input className="qty-input" id={id} type="number" inputMode="numeric"
        value={value} min={min} max={max} disabled={disabled} aria-label={label}
        onChange={(e) => {
          const n = Number(e.target.value);
          if (!Number.isNaN(n)) onChange(clamp(n));
        }} />
      <button type="button" className="qty-btn" disabled={disabled || value >= max}
        aria-label={`Increase ${label}`} onClick={() => onChange(clamp(value + 1))}>+</button>
    </div>
  );
}
