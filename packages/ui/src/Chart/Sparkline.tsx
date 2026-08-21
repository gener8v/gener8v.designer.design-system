import { cx } from '../cx.js';
import { extent, linear } from './scale.js';

export interface SparklineProps {
  values: number[];
  /** Required: a shape with no axes needs a sentence saying what it is. */
  label: string;
  className?: string;
}

/**
 * A shape beside a figure — no axes, no legend, no tooltip. It shows direction,
 * not magnitude, which is why it carries a text label rather than numbers.
 */
export function Sparkline({ values, label, className }: SparklineProps) {
  const W = 120;
  const H = 32;
  const [min, max] = extent(values, false);
  const x = linear([0, Math.max(1, values.length - 1)], [2, W - 2]);
  const y = linear([min, max], [H - 3, 3]);
  const d = values.map((v, i) => `${i === 0 ? 'M' : 'L'}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(' ');
  const last = values.length - 1;

  return (
    <svg className={cx('sparkline', className)} viewBox={`0 0 ${W} ${H}`}
      role="img" aria-label={label} preserveAspectRatio="none">
      <path d={d} />
      {values.length > 0 && (
        <circle className="sparkline-end" cx={x(last)} cy={y(values[last]!)} r={3}
          vectorEffect="non-scaling-stroke" />
      )}
    </svg>
  );
}
