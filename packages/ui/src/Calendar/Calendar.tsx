import { useEffect, useMemo, useRef, useState } from 'react';
import { cx } from '../cx.js';

/* Dates are handled as `YYYY-MM-DD` strings, never as Date objects at the API
   boundary. A Date carries a time and a zone; a calendar date has neither, and
   conflating them is how "the deadline moved a day" bugs happen. */

export type ISODate = string;

const pad = (n: number) => String(n).padStart(2, '0');
export const toISO = (y: number, m: number, d: number): ISODate => `${y}-${pad(m + 1)}-${pad(d)}`;

function parseISO(s: ISODate | null): { y: number; m: number; d: number } | null {
  if (!s) return null;
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s);
  return m ? { y: +m[1]!, m: +m[2]! - 1, d: +m[3]! } : null;
}

const daysInMonth = (y: number, m: number) => new Date(y, m + 1, 0).getDate();
const shift = (y: number, m: number, d: number, days: number) => {
  const dt = new Date(y, m, d + days);
  return { y: dt.getFullYear(), m: dt.getMonth(), d: dt.getDate() };
};

export interface CalendarProps {
  value: ISODate | null;
  onChange: (value: ISODate) => void;
  min?: ISODate;
  max?: ISODate;
  /** 0 = Sunday. */
  weekStartsOn?: 0 | 1;
  locale?: string;
  /** Overrides "today" — supply it in tests rather than freezing the clock. */
  today?: ISODate;
  className?: string;
}

/**
 * A `role="grid"` month view with the keyboard contract a date grid owes:
 * arrows move a day, PageUp/PageDown a month, Home/End to the ends of the
 * week, Enter or Space selects. Roving tabindex keeps exactly one day in the
 * Tab sequence, so the grid is one stop rather than thirty-one.
 */
export function Calendar({
  value, onChange, min, max, weekStartsOn = 0, locale = 'en-US', today, className,
}: CalendarProps) {
  const selected = parseISO(value);
  const now = parseISO(today ?? null) ?? (() => {
    const d = new Date();
    return { y: d.getFullYear(), m: d.getMonth(), d: d.getDate() };
  })();

  const [cursor, setCursor] = useState(() => selected ?? now);
  const gridRef = useRef<HTMLTableElement | null>(null);
  const shouldFocus = useRef(false);

  useEffect(() => {
    if (!shouldFocus.current) return;
    shouldFocus.current = false;
    gridRef.current?.querySelector<HTMLElement>('[tabindex="0"]')?.focus();
  }, [cursor]);

  const { weekdays, monthLabel } = useMemo(() => {
    const wd = new Intl.DateTimeFormat(locale, { weekday: 'short' });
    const days = Array.from({ length: 7 }, (_, i) =>
      wd.format(new Date(2024, 0, 7 + ((i + weekStartsOn) % 7))));
    return {
      weekdays: days,
      monthLabel: new Intl.DateTimeFormat(locale, { month: 'long', year: 'numeric' })
        .format(new Date(cursor.y, cursor.m, 1)),
    };
  }, [locale, weekStartsOn, cursor.y, cursor.m]);

  const weeks = useMemo(() => {
    const first = new Date(cursor.y, cursor.m, 1).getDay();
    const lead = (first - weekStartsOn + 7) % 7;
    const total = daysInMonth(cursor.y, cursor.m);
    const cells: Array<{ y: number; m: number; d: number; outside: boolean }> = [];
    for (let i = 0; i < lead; i++) {
      const s = shift(cursor.y, cursor.m, 1, i - lead);
      cells.push({ ...s, outside: true });
    }
    for (let d = 1; d <= total; d++) cells.push({ y: cursor.y, m: cursor.m, d, outside: false });
    while (cells.length % 7 !== 0) {
      const s = shift(cursor.y, cursor.m, total, cells.length - lead - total + 1);
      cells.push({ ...s, outside: true });
    }
    return Array.from({ length: cells.length / 7 }, (_, i) => cells.slice(i * 7, i * 7 + 7));
  }, [cursor.y, cursor.m, weekStartsOn]);

  const outOfRange = (iso: ISODate) => (min !== undefined && iso < min) || (max !== undefined && iso > max);

  const moveCursor = (days: number) => {
    shouldFocus.current = true;
    setCursor((c) => shift(c.y, c.m, c.d, days));
  };
  const moveMonth = (months: number) => {
    shouldFocus.current = true;
    setCursor((c) => {
      const m = c.m + months;
      const y = c.y + Math.floor(m / 12);
      const mm = ((m % 12) + 12) % 12;
      return { y, m: mm, d: Math.min(c.d, daysInMonth(y, mm)) };
    });
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLTableElement>) => {
    const map: Record<string, () => void> = {
      ArrowLeft: () => moveCursor(-1),
      ArrowRight: () => moveCursor(1),
      ArrowUp: () => moveCursor(-7),
      ArrowDown: () => moveCursor(7),
      Home: () => moveCursor(-(((new Date(cursor.y, cursor.m, cursor.d).getDay() - weekStartsOn) + 7) % 7)),
      End: () => moveCursor(6 - (((new Date(cursor.y, cursor.m, cursor.d).getDay() - weekStartsOn) + 7) % 7)),
      PageUp: () => moveMonth(-1),
      PageDown: () => moveMonth(1),
    };
    const fn = map[e.key];
    if (fn) { e.preventDefault(); fn(); return; }
    if (e.key === 'Enter' || e.key === ' ') {
      const iso = toISO(cursor.y, cursor.m, cursor.d);
      if (!outOfRange(iso)) { e.preventDefault(); onChange(iso); }
    }
  };

  const dayLabel = (y: number, m: number, d: number) =>
    new Intl.DateTimeFormat(locale, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
      .format(new Date(y, m, d));

  return (
    <div className={cx('calendar', className)}>
      <div className="calendar-head">
        <button type="button" className="calendar-nav" aria-label="Previous month" onClick={() => moveMonth(-1)}>
          <svg viewBox="0 0 256 256" fill="currentColor" aria-hidden="true"><path d="M165.66,202.34a8,8,0,0,1-11.32,11.32l-80-80a8,8,0,0,1,0-11.32l80-80a8,8,0,0,1,11.32,11.32L91.31,128Z"/></svg>
        </button>
        <span className="calendar-title" aria-live="polite">{monthLabel}</span>
        <button type="button" className="calendar-nav" aria-label="Next month" onClick={() => moveMonth(1)}>
          <svg viewBox="0 0 256 256" fill="currentColor" aria-hidden="true"><path d="M181.66,133.66l-80,80a8,8,0,0,1-11.32-11.32L164.69,128,90.34,53.66a8,8,0,0,1,11.32-11.32l80,80A8,8,0,0,1,181.66,133.66Z"/></svg>
        </button>
      </div>

      <table ref={gridRef} className="calendar-grid" role="grid" aria-label={monthLabel} onKeyDown={onKeyDown}>
        <thead>
          <tr>{weekdays.map((w) => <th key={w} scope="col" abbr={w}>{w.slice(0, 2)}</th>)}</tr>
        </thead>
        <tbody>
          {weeks.map((week, wi) => (
            <tr key={wi}>
              {week.map((cell) => {
                const iso = toISO(cell.y, cell.m, cell.d);
                const isCursor = cell.y === cursor.y && cell.m === cursor.m && cell.d === cursor.d;
                const disabled = outOfRange(iso);
                return (
                  // aria-selected belongs on the gridcell, not on a button —
                  // role="button" does not support it. Today is aria-current="date".
                  <td key={iso} role="gridcell" aria-selected={value === iso}>
                    <button type="button" className="calendar-day"
                      tabIndex={isCursor ? 0 : -1}
                      aria-disabled={disabled || undefined}
                      aria-current={iso === toISO(now.y, now.m, now.d) ? 'date' : undefined}
                      aria-label={dayLabel(cell.y, cell.m, cell.d)}
                      data-outside={cell.outside || undefined}
                      data-today={iso === toISO(now.y, now.m, now.d) || undefined}
                      onClick={() => { if (!disabled) { setCursor(cell); onChange(iso); } }}>
                      {cell.d}
                    </button>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
