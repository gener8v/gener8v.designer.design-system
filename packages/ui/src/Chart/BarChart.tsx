import { useMemo, useState } from 'react';
import { ChartFrame } from './Chart.js';
import type { Series } from './Chart.js';
import { extent, fmt, linear, seriesColor, ticks } from './scale.js';

export interface BarChartProps {
  title: string;
  note?: string;
  categories: string[];
  series: Series[];
  height?: number;
  format?: (v: number) => string;
  /** Stacks series instead of grouping them. */
  stacked?: boolean;
  /**
   * `vertical` by default. `horizontal` lays categories down the page with their bars running
   * across — for long category names ("Account hierarchy"), for a ranking, and on a phone. The
   * label sits above each bar and the value at its end, so nothing is read off an axis. `height`
   * is ignored: the chart is as tall as its rows.
   */
  orientation?: 'vertical' | 'horizontal';
}

const M = { top: 8, right: 8, bottom: 26, left: 44 };
const GAP = 2; // surface gap between adjacent fills, per the mark spec

/**
 * Grouped or stacked bars on a zero baseline. The baseline is not optional —
 * a magnitude axis that starts anywhere else makes a 3% gap look like 300%.
 */
export function BarChart(props: BarChartProps) {
  return props.orientation === 'horizontal' ? <HorizontalBars {...props} /> : <VerticalBars {...props} />;
}

function VerticalBars({
  title, note, categories, series, height = 260, format = fmt, stacked = false,
}: BarChartProps) {
  const [hover, setHover] = useState<number | null>(null);
  const W = 640;

  const totals = useMemo(() => categories.map((_, ci) =>
    stacked ? series.reduce((sum, s) => sum + (s.values[ci] ?? 0), 0)
            : Math.max(...series.map((s) => s.values[ci] ?? 0))), [categories, series, stacked]);
  const [min, max] = extent(totals);
  const y = linear([min, max], [height - M.bottom, M.top]);
  const yTicks = ticks(min, max, 4);

  const plotW = W - M.left - M.right;
  const bandW = plotW / Math.max(1, categories.length);
  const groupW = bandW * 0.68;
  const barW = stacked ? groupW : (groupW - GAP * (series.length - 1)) / Math.max(1, series.length);

  return (
    <ChartFrame title={title} note={note} series={series} categories={categories} format={format}>
      <svg className="chart-svg" viewBox={`0 0 ${W} ${height}`} role="img"
        aria-label={`${title}. ${series.length} series across ${categories.length} categories.`}>
        <g className="chart-grid">
          {yTicks.map((t) => (
            <line key={t} x1={M.left} x2={W - M.right} y1={y(t)} y2={y(t)} />
          ))}
        </g>
        <g className="chart-axis">
          {yTicks.map((t) => (
            <text key={t} x={M.left - 8} y={y(t)} textAnchor="end" dominantBaseline="middle">{format(t)}</text>
          ))}
          {categories.map((c, ci) => (
            <text key={c} x={M.left + bandW * ci + bandW / 2} y={height - M.bottom + 16} textAnchor="middle">{c}</text>
          ))}
        </g>
        <line className="chart-baseline" x1={M.left} x2={W - M.right} y1={y(0)} y2={y(0)} />

        {categories.map((c, ci) => {
          const x0 = M.left + bandW * ci + (bandW - groupW) / 2;
          let stackTop = 0;
          return (
            <g key={c} className="chart-series"
              data-dim={hover !== null && hover !== ci ? '' : undefined}
              onMouseEnter={() => setHover(ci)} onMouseLeave={() => setHover(null)}>
              {series.map((s, si) => {
                const v = s.values[ci] ?? 0;
                let yTop: number;
                let h: number;
                if (stacked) {
                  const base = stackTop;
                  stackTop += v;
                  yTop = y(stackTop);
                  h = Math.max(0, y(base) - y(stackTop) - GAP);
                } else {
                  yTop = v >= 0 ? y(v) : y(0);
                  h = Math.abs(y(v) - y(0));
                }
                const x = stacked ? x0 : x0 + si * (barW + GAP);
                return (
                  <rect key={s.label} className="chart-bar"
                    x={x} y={yTop} width={Math.max(1, barW)} height={Math.max(1, h)}
                    fill={seriesColor(si)}>
                    <title>{`${c} · ${s.label}: ${format(v)}`}</title>
                  </rect>
                );
              })}
            </g>
          );
        })}
      </svg>

      {hover !== null && (
        <div className="chart-tooltip" style={{
          insetInlineStart: `${((M.left + bandW * hover + bandW / 2) / W) * 100}%`,
          insetBlockStart: 0,
          transform: 'translate(-50%, -8px)',
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

/**
 * Bars across the page, drawn in HTML rather than in a scaled SVG, so a category label is set at
 * the body's size on a phone instead of shrinking with the viewBox, and a long one wraps.
 *
 * Each row is the category's name, then a bar per series (or one stacked bar) on a shared zero,
 * with the figure at the bar's end. Values are written, so no axis is drawn; the zero is a rule.
 */
function HorizontalBars({
  title, note, categories, series, format = fmt, stacked = false,
}: BarChartProps) {
  const [hover, setHover] = useState<number | null>(null);
  const values = stacked
    ? categories.map((_, ci) => series.reduce((sum, s) => sum + Math.max(0, s.values[ci] ?? 0), 0))
    : series.flatMap((s) => categories.map((_, ci) => s.values[ci] ?? 0));
  const [min, max] = extent(values);
  const at = (v: number) => ((v - min) / (max - min)) * 100;
  const zero = at(0);
  const bar = (from: number, to: number) => {
    const a = Math.min(at(from), at(to));
    return { insetInlineStart: `${a}%`, inlineSize: `${Math.max(0.5, Math.abs(at(to) - at(from)))}%` };
  };

  return (
    <ChartFrame title={title} note={note} series={series} categories={categories} format={format}>
      <div className="chart-hbars" role="img"
        aria-label={`${title}. ${series.length} series across ${categories.length} categories.`}
        onMouseLeave={() => setHover(null)}>
        {categories.map((c, ci) => {
          let base = 0;
          return (
            <div key={c} className="chart-hbar-row" data-dim={hover !== null && hover !== ci ? '' : undefined}
              onMouseEnter={() => setHover(ci)}>
              <span className="chart-hbar-label">{c}</span>
              {stacked ? (
                <div className="chart-hbar-line">
                  <span className="chart-hbar-track" style={{ ['--zero' as string]: `${zero}%` }}>
                    {series.map((s, si) => {
                      const v = Math.max(0, s.values[ci] ?? 0);
                      const from = base;
                      base += v;
                      return (
                        <span key={s.label} className="chart-hbar" title={`${c} · ${s.label}: ${format(v)}`}
                          style={{ ...bar(from, from + v), background: seriesColor(si) }} />
                      );
                    })}
                  </span>
                  <span className="chart-hbar-value">{format(base)}</span>
                </div>
              ) : series.map((s, si) => {
                const v = s.values[ci] ?? 0;
                return (
                  <div key={s.label} className="chart-hbar-line">
                    <span className="chart-hbar-track" style={{ ['--zero' as string]: `${zero}%` }}>
                      <span className="chart-hbar" title={`${c} · ${s.label}: ${format(v)}`}
                        style={{ ...bar(0, v), background: seriesColor(si) }} />
                    </span>
                    <span className="chart-hbar-value">{format(v)}</span>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </ChartFrame>
  );
}
