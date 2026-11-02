import { forwardRef } from 'react';
import type { HTMLAttributes, ReactElement } from 'react';
import { cx } from '../cx.js';

/**
 * The line drawings an empty state can carry. Five, on purpose: each names a kind of place that
 * can be empty — a wall of cells, a history, a library, an inbox, a search — and a set that grew
 * to one per screen would stop meaning anything.
 */
export type StateArtName = 'grid' | 'history' | 'library' | 'inbox' | 'search';

const s = {
  fill: 'none', stroke: 'currentColor', strokeWidth: 1.5,
  strokeLinecap: 'round', strokeLinejoin: 'round',
} as const;

/* One `.state-art-mark` per drawing — the part that says what is missing — so the eye has exactly
   one place to land, in the accent. Everything else is the quiet line of the page. */
const DRAWINGS: Record<StateArtName, ReactElement> = {
  grid: (
    <g {...s}>
      {[0, 1, 2].flatMap((r) => [0, 1, 2, 3].map((c) => (r === 1 && c === 2 ? null : (
        <rect key={`${r}-${c}`} x={14 + c * 24} y={12 + r * 20} width={20} height={14} rx={2} />
      ))))}
      <rect className="state-art-mark" x={62} y={32} width={20} height={14} rx={2} strokeDasharray="3 3" />
    </g>
  ),
  history: (
    <g {...s}>
      <circle cx={60} cy={40} r={20} />
      <path d="M30 40 A30 30 0 0 1 60 10" />
      <path d="M24 34 L30 40 L36 34" />
      <path className="state-art-mark" d="M60 28 V40 L69 46" />
    </g>
  ),
  library: (
    <g {...s}>
      <path d="M14 66 H106" />
      <rect x={22} y={22} width={12} height={44} rx={1} />
      <rect x={36} y={28} width={10} height={38} rx={1} />
      <rect x={48} y={18} width={14} height={48} rx={1} />
      <path d="M25 30 H31 M51 26 H59" />
      <path className="state-art-mark" d="M70 66 L80 26 L90 28.5 L80 66" />
      <rect x={92} y={30} width={10} height={36} rx={1} strokeDasharray="3 3" />
    </g>
  ),
  inbox: (
    <g {...s}>
      <path d="M20 50 L32 28 H88 L100 50 V64 A4 4 0 0 1 96 68 H24 A4 4 0 0 1 20 64 Z" />
      <path d="M20 50 H44 L48 57 H72 L76 50 H100" />
      <path className="state-art-mark" d="M60 8 V36 M52 28 L60 36 L68 28" />
    </g>
  ),
  search: (
    <g {...s}>
      <rect x={24} y={12} width={48} height={58} rx={3} />
      <path d="M32 26 H62 M32 34 H58 M32 42 H50" />
      <circle className="state-art-mark" cx={78} cy={50} r={14} />
      <path className="state-art-mark" d="M88 60 L100 72" />
    </g>
  ),
};

export const STATE_ART: readonly StateArtName[] = ['grid', 'history', 'library', 'inbox', 'search'];

export interface StateArtProps extends Omit<HTMLAttributes<HTMLSpanElement>, 'children'> {
  name: StateArtName;
}

/**
 * A line drawing for an empty state. Drawn on `currentColor` and one accent mark, so it follows
 * the theme without a second set of files, and hidden from assistive tech — the title beside it
 * says what is empty; the picture only makes the screen recognisable at a glance.
 */
export const StateArt = forwardRef<HTMLSpanElement, StateArtProps>(function StateArt(
  { name, className, ...rest }, ref,
) {
  return (
    <span {...rest} ref={ref} aria-hidden="true" data-art={name} className={cx('state-art', className)}>
      <svg viewBox="0 0 120 80" focusable="false">{DRAWINGS[name]}</svg>
    </span>
  );
});
