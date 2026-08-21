import { useId, useState } from 'react';
import type { HTMLAttributes, ReactNode } from 'react';
import { cx } from '../cx.js';
import { MAX_SERIES, seriesColor } from './scale.js';

export interface Series { label: string; values: number[] }

export interface ChartFrameProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  title: ReactNode;
  note?: ReactNode;
  series: Series[];
  categories: string[];
  children: ReactNode;
  /** Formats values in the table view and the legend. */
  format?: (v: number) => string;
}

/**
 * The frame every chart shares: title, legend, plot, and a table view.
 *
 * The table is not a nicety. Three of the eight series colours sit under 3:1
 * against a white surface — legal only with relief, and a real table is the
 * relief. It also makes the numbers copyable, which is what anyone building a
 * deliverable actually wants.
 */
export function ChartFrame({
  title, note, series, categories, children, format = String, className, ...rest
}: ChartFrameProps) {
  const [asTable, setAsTable] = useState(false);
  const tableId = useId();

  return (
    <div {...rest} className={cx('chart', className)}>
      <div className="chart-head">
        <span className="chart-title">{title}</span>
        {note ? <span className="chart-note">{note}</span> : null}
        <div className="chart-actions">
          <button type="button" className="btn btn-ghost btn-xs"
            aria-expanded={asTable} aria-controls={tableId}
            onClick={() => setAsTable((v) => !v)}>
            {asTable ? 'Show chart' : 'Show table'}
          </button>
        </div>
      </div>

      {/* A single series needs no legend — the title names it. */}
      {series.length > 1 && (
        <div className="chart-legend">
          {series.map((s, i) => (
            <span key={s.label} className="chart-legend-key">
              <span className="chart-swatch" style={{ background: seriesColor(i) }} />
              {s.label}
            </span>
          ))}
        </div>
      )}

      {series.length > MAX_SERIES && (
        <p className="chart-note">
          Showing {MAX_SERIES} series; {series.length - MAX_SERIES} folded into “Other”.
        </p>
      )}

      {asTable ? (
        <div className="table-wrap" id={tableId}>
          <table className="table table-compact">
            <thead>
              <tr>
                <th scope="col">Category</th>
                {series.map((s) => <th key={s.label} scope="col" data-numeric>{s.label}</th>)}
              </tr>
            </thead>
            <tbody>
              {categories.map((c, ci) => (
                <tr key={c}>
                  <th scope="row" data-nowrap>{c}</th>
                  {series.map((s) => (
                    <td key={s.label} className="num">{format(s.values[ci] ?? 0)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="chart-plot">{children}</div>
      )}
    </div>
  );
}
