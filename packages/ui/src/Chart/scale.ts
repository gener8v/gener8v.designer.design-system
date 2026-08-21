/** Small scale + tick helpers. No dependency; charts here are SVG, not a library. */

export interface Scale { (v: number): number; domain: [number, number]; range: [number, number] }

export function linear(domain: [number, number], range: [number, number]): Scale {
  const [d0, d1] = domain;
  const [r0, r1] = range;
  const span = d1 - d0 || 1;
  const fn = ((v: number) => r0 + ((v - d0) / span) * (r1 - r0)) as Scale;
  fn.domain = domain;
  fn.range = range;
  return fn;
}

/** "Nice" ticks — round numbers a reader can hold in their head. */
export function ticks(min: number, max: number, count = 5): number[] {
  if (min === max) return [min];
  const raw = (max - min) / count;
  const mag = 10 ** Math.floor(Math.log10(raw));
  const norm = raw / mag;
  // Geometric-midpoint thresholds (√50, √10, √2), not integer ones. Picking the
  // next candidate up whenever norm clears an integer overshoots badly: a 0–91
  // range at four ticks lands on a step of 50 and draws two gridlines.
  const step = (norm >= Math.sqrt(50) ? 10
    : norm >= Math.sqrt(10) ? 5
    : norm >= Math.sqrt(2) ? 2
    : 1) * mag;
  const start = Math.ceil(min / step) * step;
  const out: number[] = [];
  for (let v = start; v <= max + step * 1e-9; v += step) out.push(+v.toFixed(10));
  return out;
}

/**
 * A bar or area baseline must sit at zero. Starting a magnitude axis anywhere
 * else makes a 3% difference look like a 300% one — the single most common way
 * a chart lies.
 */
export function extent(values: number[], includeZero = true): [number, number] {
  const finite = values.filter(Number.isFinite);
  if (!finite.length) return [0, 1];
  let min = Math.min(...finite);
  let max = Math.max(...finite);
  if (includeZero) { min = Math.min(0, min); max = Math.max(0, max); }
  if (min === max) { max = min + 1; }
  return [min, max];
}

/** Categorical colours are assigned in fixed order and never cycled. */
export const MAX_SERIES = 8;
export function seriesColor(index: number): string {
  if (index < MAX_SERIES) return `var(--series-${index + 1})`;
  // Cycling would repaint two entities the same. Fold the tail into one
  // neutral "Other" instead, and say so.
  return 'var(--color-neutral-400)';
}

export const fmt = (v: number) =>
  Math.abs(v) >= 1_000_000 ? `${(v / 1_000_000).toFixed(1)}M`
  : Math.abs(v) >= 1_000 ? `${(v / 1_000).toFixed(Math.abs(v) >= 10_000 ? 0 : 1)}k`
  : String(+v.toFixed(2));
