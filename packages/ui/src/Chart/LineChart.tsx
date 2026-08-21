import { useMemo, useState } from 'react';
import { ChartFrame } from './Chart.js';
import type { Series } from './Chart.js';
import { extent, fmt, linear, seriesColor, ticks } from './scale.js';

export interface LineChartProps {
  title: string;
  note?: string;
  categories: string[];
  series: Series[];
  height?: number;
  format?: (v: number) => string;
  /** Fills under the line. Only meaningful for a single series or a stack. */
  area?: boolean;
  /** Lines may start above zero — a trend is about change, not magnitude. */
  zeroBaseline?: boolean;
}

const M = { top: 10, right: 12, bottom: 26, left: 44 };

/**
 * Lines with a crosshair and a shared tooltip. One y-axis only — a dual-axis
 * chart invites the reader to compare two scales that were never comparable,
 * and is the single most common charting mistake. Two measures of different
 * scale want two charts or an index to a common base.
 */
export function LineChart({
  title, note, categories, series, height = 260, format = fmt, area = false, zeroBaseline = false,
}: LineChartProps) {
  const [hover, setHover] = useState<number | null>(null);
  const W = 640;

  const all = useMemo(() => series.flatMap((s) => s.values), [series]);
  const [min, max] = extent(all, zeroBaseline || area);
  const y = linear([min, max], [height - M.bottom, M.top]);
  const x = linear([0, Math.max(1, categories.length - 1)], [M.left, W - M.right]);
  const yTicks = ticks(min, max, 4);

  const path = (values: number[]) =>
    values.map((v, i) => `${i === 0 ? 'M' : 'L'}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(' ');

  return (
    <ChartFrame title={title} note={note} series={series} categories={categories} format={format}>
      <svg className="chart-svg" viewBox={`0 0 ${W} ${height}`} role="img"
        aria-label={`${title}. ${series.length} series over ${categories.length} points.`}
        onMouseLeave={() => setHover(null)}>
        <g className="chart-grid">
          {yTicks.map((t) => <line key={t} x1={M.left} x2={W - M.right} y1={y(t)} y2={y(t)} />)}
        </g>
        <g className="chart-axis">
          {yTicks.map((t) => (
            <text key={t} x={M.left - 8} y={y(t)} textAnchor="end" dominantBaseline="middle">{format(t)}</text>
          ))}
          {categories.map((c, i) => (
            (categories.length <= 8 || i % Math.ceil(categories.length / 8) === 0) && (
              <text key={c} x={x(i)} y={height - M.bottom + 16} textAnchor="middle">{c}</text>
            )
          ))}
        </g>

        {area && series.map((s, si) => (
          <path key={`a-${s.label}`} className="chart-area" fill={seriesColor(si)}
            d={`${path(s.values)} L${x(s.values.length - 1)},${y(min)} L${x(0)},${y(min)} Z`} />
        ))}

        {series.map((s, si) => (
          <g key={s.label} className="chart-series">
            <path className="chart-line" d={path(s.values)} stroke={seriesColor(si)} />
            {/* Markers only when sparse — a dot on every point of a dense line
                is noise, and the crosshair already answers "what is here?". */}
            {s.values.length <= 14 && s.values.map((v, i) => (
              <circle key={i} className="chart-dot" cx={x(i)} cy={y(v)} r={4} fill={seriesColor(si)} />
            ))}
          </g>
        ))}

        {hover !== null && (
          <line className="chart-crosshair" x1={x(hover)} x2={x(hover)} y1={M.top} y2={height - M.bottom} />
        )}

        {categories.map((_, i) => (
          <rect key={i} className="chart-hit"
            x={x(i) - (W - M.left - M.right) / Math.max(1, categories.length * 2)}
            y={M.top}
            width={(W - M.left - M.right) / Math.max(1, categories.length)}
            height={height - M.top - M.bottom}
            onMouseEnter={() => setHover(i)} />
        ))}
      </svg>

      {hover !== null && (
        <div className="chart-tooltip" style={{
          insetInlineStart: `${(x(hover) / W) * 100}%`,
          insetBlockStart: 0,
          transform: `translate(${hover > categories.length / 2 ? '-105%' : '5%'}, 0)`,
        }}>
          <div className="chart-tooltip-head">{categories[hover]}</div>
          {series.map((s, si) => (
            <div key={s.label} className="chart-tooltip-row">
              <span className="chart-swatch" style={{ background: seriesColor(si) }} />
              {s.label}
              <span className="chart-tooltip-value">{format(s.values[hover] ?? 0)}</span>
            </div>
          ))}
        </div>
      )}
    </ChartFrame>
  );
}
