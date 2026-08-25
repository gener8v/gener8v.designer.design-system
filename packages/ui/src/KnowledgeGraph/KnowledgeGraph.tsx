import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import { cx } from '../cx.js';
import { bounds, createLayout, radiusFor, settle, tick } from './simulation.js';
import type { GraphNodeInput, Layout, SimLink } from './simulation.js';

export interface GraphNode extends GraphNodeInput {}
export interface GraphLink extends SimLink { label?: string }

export interface KnowledgeGraphProps {
  nodes: GraphNode[];
  links: GraphLink[];
  /** Describes what the graph shows. Required — this is its accessible name. */
  caption: string;
  selected?: string | null;
  onSelect?: (id: string | null) => void;
  kinds?: Array<{ kind: string; label: string }>;
  /** Below this zoom, only hubs and highlighted nodes are labelled. */
  labelDegreeThreshold?: number;
  className?: string;
}

/**
 * How many distinct kinds a graph can colour: the categorical series palette, which is eight.
 *
 * WHY THE VOCABULARY IS THE CONSUMER'S
 *
 * This used to be a fixed map from five words — `engagement`, `control`, `finding`, `evidence`,
 * `person` — to five tokens. Those are governance-domain nouns baked into a component that takes
 * `kinds` from its caller precisely so the caller can name its own.
 *
 * A consumer whose graph held standards, deliverables and decisions matched none of them. Every
 * node fell through to the same fallback colour and every legend dot rendered with no background
 * at all, because the `[data-kind]` rules were written for words nobody else uses. The `kinds`
 * prop accepted anything and coloured five things.
 *
 * So colour is assigned from the DECLARED order instead. `--series-N` is the palette for exactly
 * this — categorical, hues the interface deliberately does not use for status, re-stepped rather
 * than flipped for dark mode, and gated by the contrast and palette linters.
 */
const SERIES = 8;

/** Reads token values once per mount so canvas colours still come from CSS. */
function readPalette(el: HTMLElement, declared: readonly string[]) {
  const cs = getComputedStyle(el);
  const v = (name: string, fallback: string) => cs.getPropertyValue(name).trim() || fallback;
  const kinds: Record<string, string> = {};
  declared.forEach((kind, i) => {
    kinds[kind] = v(`--series-${(i % SERIES) + 1}`, '#528AFF');
  });
  return {
    kinds,
    fallback: v('--color-accent-500', '#528AFF'),
    edge: v('--color-neutral-300', '#CAD0DA'),
    edgeActive: v('--color-action', '#1547B7'),
    ring: v('--color-bg', '#FFFFFF'),
    text: v('--color-neutral-700', '#4B5464'),
    textStrong: v('--color-neutral-900', '#182030'),
    font: v('--font-body', 'Inter, system-ui, sans-serif'),
  };
}

const W = 1200;
const H = 760;

/**
 * A force-directed knowledge graph built to hold a real corpus.
 *
 * Rendered to canvas, not SVG: 1,000 nodes and their edges would be ~4,000 DOM
 * elements, and the browser will not composite that at 60fps. Layout uses a
 * Barnes–Hut quadtree, so repulsion is O(n log n) rather than O(n²).
 *
 * Node radius is sqrt(degree) — linear scaling lets one 200-edge hub swallow
 * the canvas, and area is what the eye actually compares anyway.
 *
 * The canvas is paired with a real list of entities and their relationships.
 * A graph is one of the few components whose visual genuinely cannot be made
 * equivalent, so the honest answer is a second representation rather than ARIA
 * sprinkled over something that still cannot be traversed.
 */
export function KnowledgeGraph({
  nodes, links, caption, selected = null, onSelect,
  kinds = [], labelDegreeThreshold = 6, className,
}: KnowledgeGraphProps) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const layoutRef = useRef<Layout | null>(null);
  const paletteRef = useRef<ReturnType<typeof readPalette> | null>(null);
  const viewRef = useRef({ scale: 1, tx: 0, ty: 0 });
  const rafRef = useRef<number | null>(null);
  const drawRef = useRef<() => void>(() => {});

  const [hover, setHover] = useState<string | null>(null);
  const [showIndex, setShowIndex] = useState(false);
  const captionId = useId();

  const neighbours = useMemo(() => {
    const map = new Map<string, Set<string>>();
    for (const n of nodes) map.set(n.id, new Set());
    for (const l of links) {
      map.get(l.source)?.add(l.target);
      map.get(l.target)?.add(l.source);
    }
    return map;
  }, [nodes, links]);

  const labelFor = useMemo(() => new Map(nodes.map((n) => [n.id, n.label])), [nodes]);
  const kindFor = useMemo(() => new Map(nodes.map((n) => [n.id, n.kind])), [nodes]);

  /* ------------------------------------------------------------- rendering */

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const L = layoutRef.current;
    const pal = paletteRef.current;
    if (!canvas || !L || !pal) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = Math.min(2, globalThis.devicePixelRatio || 1);
    const cw = canvas.clientWidth || 1;
    const ch = canvas.clientHeight || 1;
    if (canvas.width !== Math.round(cw * dpr) || canvas.height !== Math.round(ch * dpr)) {
      canvas.width = Math.round(cw * dpr);
      canvas.height = Math.round(ch * dpr);
    }

    const { scale, tx, ty } = viewRef.current;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, cw, ch);
    ctx.translate(tx, ty);
    ctx.scale(scale, scale);

    const focusId = hover ?? selected;
    const focusIdx = focusId !== undefined && focusId !== null ? L.index.get(focusId) ?? -1 : -1;
    const lit = (i: number) => {
      if (focusIdx < 0) return true;
      if (i === focusIdx) return true;
      return neighbours.get(focusId!)?.has(L.ids[i]!) ?? false;
    };

    // Edges first, dimmed ones in one batched pass to avoid per-edge state changes.
    const { edges, x, y } = L;
    ctx.lineWidth = 1 / scale;
    ctx.strokeStyle = pal.edge;
    ctx.globalAlpha = focusIdx >= 0 ? 0.14 : 0.55;
    ctx.beginPath();
    for (let e = 0; e < edges.length; e += 2) {
      const a = edges[e]!, b = edges[e + 1]!;
      if (focusIdx >= 0 && (a === focusIdx || b === focusIdx)) continue;
      ctx.moveTo(x[a]!, y[a]!);
      ctx.lineTo(x[b]!, y[b]!);
    }
    ctx.stroke();

    if (focusIdx >= 0) {
      ctx.globalAlpha = 1;
      ctx.strokeStyle = pal.edgeActive;
      ctx.lineWidth = 1.6 / scale;
      ctx.beginPath();
      for (let e = 0; e < edges.length; e += 2) {
        const a = edges[e]!, b = edges[e + 1]!;
        if (a !== focusIdx && b !== focusIdx) continue;
        ctx.moveTo(x[a]!, y[a]!);
        ctx.lineTo(x[b]!, y[b]!);
      }
      ctx.stroke();
    }

    // Nodes, grouped by fill so the canvas state changes once per kind.
    const byFill = new Map<string, number[]>();
    for (let i = 0; i < L.n; i++) {
      const fill = pal.kinds[kindFor.get(L.ids[i]!) ?? ''] ?? pal.fallback;
      (byFill.get(fill) ?? byFill.set(fill, []).get(fill)!).push(i);
    }
    ctx.lineWidth = 2 / scale;
    ctx.strokeStyle = pal.ring;
    for (const [fill, group] of byFill) {
      for (const dim of [true, false]) {
        const members = group.filter((i) => lit(i) !== dim);
        if (!members.length) continue;
        ctx.globalAlpha = dim ? 0.2 : 1;
        ctx.fillStyle = fill;
        ctx.beginPath();
        for (const i of members) {
          const r = radiusFor(L.degree[i]!);
          ctx.moveTo(x[i]! + r, y[i]!);
          ctx.arc(x[i]!, y[i]!, r, 0, Math.PI * 2);
        }
        ctx.fill();
        if (!dim) ctx.stroke();
      }
    }

    // Labels: hubs always, everything else only when zoomed in or highlighted.
    ctx.globalAlpha = 1;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    const fontPx = 11 / scale;
    ctx.font = `${fontPx}px ${pal.font}`;
    // A THRESHOLD NOTHING CAN REACH IS NOT A THRESHOLD, IT IS A MUTE SWITCH.
    //
    // `labelDegreeThreshold` exists so a 500-node graph does not paint 500 overlapping labels:
    // only hubs are named until somebody zooms in. In a graph where NO node reaches it, the same
    // rule silences every label instead — and a record whose links have not been computed yet is
    // exactly that graph. Six named nodes rendered as six unlabelled dots, unreadable at whatever
    // zoom the fit happened to choose, with nothing on screen to suggest they had names at all.
    //
    // There are no hubs to prefer here, so there is nothing to protect the reader from.
    let hubs = false;
    for (let i = 0; i < L.n && !hubs; i++) hubs = L.degree[i]! >= labelDegreeThreshold;

    // AND A LABEL ON TOP OF ANOTHER LABEL IS TWO LABELS NOBODY CAN READ.
    //
    // The fix above turned every label on in a graph with no hubs, which is right, and in a sparse
    // graph is also dense: with no links there is nothing pulling nodes together, so the layout
    // spreads them evenly and forty-five names land on top of each other. Naming everything and
    // naming nothing are the same result if the names cannot be read.
    //
    // Greedy, in order of what matters: the focused node first, then hubs, then the rest. A label
    // whose box overlaps one already placed is dropped rather than drawn over — so what survives at
    // any zoom is the most important set that FITS, and zooming in reveals more rather than
    // untangling a knot.
    const placed: { x0: number; y0: number; x1: number; y1: number }[] = [];
    const lineHeight = fontPx * 1.25;
    // `measureText` is the real width; the estimate is for a canvas stub that has no text metrics.
    const widthOf = (text: string) =>
      ctx.measureText?.(text)?.width ?? text.length * fontPx * 0.55;
    const order = [...Array(L.n).keys()].sort(
      (a, b) =>
        Number(b === focusIdx) - Number(a === focusIdx) || L.degree[b]! - L.degree[a]!,
    );

    for (const i of order) {
      const isFocus = i === focusIdx;
      const show = isFocus || (lit(i) && focusIdx >= 0)
        || scale > 1.25 || !hubs || L.degree[i]! >= labelDegreeThreshold;
      if (!show) continue;
      const text = labelFor.get(L.ids[i]!) ?? '';
      if (!text) continue;

      const half = widthOf(text) / 2;
      const top = y[i]! + radiusFor(L.degree[i]!) + 3 / scale;
      const box = { x0: x[i]! - half, y0: top, x1: x[i]! + half, y1: top + lineHeight };
      const clash = placed.some(
        (p) => box.x0 < p.x1 && box.x1 > p.x0 && box.y0 < p.y1 && box.y1 > p.y0,
      );
      // The focused node keeps its label whatever it lands on: it is the one the reader pointed at.
      if (clash && !isFocus) continue;
      placed.push(box);

      ctx.fillStyle = isFocus ? pal.textStrong : pal.text;
      ctx.globalAlpha = lit(i) ? 1 : 0.25;
      ctx.fillText(text, x[i]!, top);
    }
    ctx.globalAlpha = 1;
  }, [hover, selected, neighbours, kindFor, labelFor, labelDegreeThreshold]);

  useEffect(() => { drawRef.current = draw; draw(); }, [draw]);

  /* --------------------------------------------------------------- layout */

  useEffect(() => {
    const host = hostRef.current;
    const canvas = canvasRef.current;
    if (!host || !canvas) return;
    paletteRef.current = readPalette(host, kinds.map((k) => k.kind));

    const L = createLayout(nodes, links, W, H);
    layoutRef.current = L;

    const fit = () => {
      const b = bounds(L);
      const cw = canvas.clientWidth || 1;
      const ch = canvas.clientHeight || 1;
      const scale = Math.min(cw / (b.width + 80), ch / (b.height + 80), 2.2);
      viewRef.current = {
        scale,
        tx: cw / 2 - ((b.minX + b.maxX) / 2) * scale,
        ty: ch / 2 - ((b.minY + b.maxY) / 2) * scale,
      };
    };

    const reduced = typeof matchMedia === 'function'
      && matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (reduced) {
      settle(L, { width: W, height: H });
      fit();
      drawRef.current();
      return;
    }

    let alive = true;
    const step = () => {
      if (!alive) return;
      const alpha = tick(L, { width: W, height: H });
      fit();
      drawRef.current();
      if (alpha > 0) rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);

    const onResize = () => { fit(); drawRef.current(); };
    globalThis.addEventListener?.('resize', onResize);

    /*
     * THE CANVAS'S OWN BOX, NOT THE WINDOW'S.
     *
     * The simulation stops when it settles, and after that only a WINDOW resize re-fitted anything.
     * So a canvas whose size arrives late — a tab panel that becomes visible, a flex parent that
     * resolves after first paint, a font that loads — kept whatever scale it was given while it had
     * no size, and nothing ever corrected it. In a consumer that meant a settled graph drawn at a
     * scale computed against a 1px box: forty-five nodes on screen, all but invisible.
     *
     * A remount is the same failure with a worse ending. `draw` writes the backing store from
     * `clientWidth`, and a fresh canvas starts at the HTML default of 300x150 — so a canvas
     * swapped in without the layout effect re-running was never sized and never drawn at all.
     *
     * Observing the element covers both, because both are the element's box changing.
     */
    const observer = typeof ResizeObserver === 'function'
      ? new ResizeObserver(() => { fit(); drawRef.current(); })
      : null;
    observer?.observe(canvas);

    return () => {
      alive = false;
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      globalThis.removeEventListener?.('resize', onResize);
      observer?.disconnect();
    };
  }, [nodes, links]);

  /* ---------------------------------------------------------- interaction */

  const toWorld = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current!;
    const r = canvas.getBoundingClientRect();
    const { scale, tx, ty } = viewRef.current;
    return { x: (clientX - r.left - tx) / scale, y: (clientY - r.top - ty) / scale };
  };

  const hitTest = (clientX: number, clientY: number): string | null => {
    const L = layoutRef.current;
    if (!L) return null;
    const { x: wx, y: wy } = toWorld(clientX, clientY);
    const slack = 6 / viewRef.current.scale;
    let best: number | null = null;
    let bestD = Infinity;
    for (let i = 0; i < L.n; i++) {
      const r = radiusFor(L.degree[i]!) + slack;
      const dx = L.x[i]! - wx;
      const dy = L.y[i]! - wy;
      const d2 = dx * dx + dy * dy;
      if (d2 <= r * r && d2 < bestD) { bestD = d2; best = i; }
    }
    return best === null ? null : L.ids[best]!;
  };

  const drag = useRef<{ x: number; y: number; moved: boolean } | null>(null);

  return (
    <div className={cx('graph', className)} ref={hostRef}>
      <canvas
        ref={canvasRef}
        className="graph-canvas"
        role="img"
        aria-label={caption}
        aria-describedby={captionId}
        onPointerDown={(e) => {
          (e.target as Element).setPointerCapture?.(e.pointerId);
          drag.current = { x: e.clientX, y: e.clientY, moved: false };
        }}
        onPointerMove={(e) => {
          if (drag.current) {
            const dx = e.clientX - drag.current.x;
            const dy = e.clientY - drag.current.y;
            if (Math.abs(dx) + Math.abs(dy) > 3) drag.current.moved = true;
            viewRef.current.tx += dx;
            viewRef.current.ty += dy;
            drag.current.x = e.clientX;
            drag.current.y = e.clientY;
            drawRef.current();
            return;
          }
          const id = hitTest(e.clientX, e.clientY);
          if (id !== hover) setHover(id);
        }}
        onPointerUp={(e) => {
          const wasDrag = drag.current?.moved ?? false;
          drag.current = null;
          if (wasDrag) return;
          const id = hitTest(e.clientX, e.clientY);
          onSelect?.(id === selected ? null : id);
        }}
        onPointerLeave={() => { drag.current = null; setHover(null); }}
        onWheel={(e) => {
          const v = viewRef.current;
          const r = canvasRef.current!.getBoundingClientRect();
          const px = e.clientX - r.left;
          const py = e.clientY - r.top;
          const factor = Math.exp(-e.deltaY * 0.0016);
          const next = Math.max(0.15, Math.min(6, v.scale * factor));
          const k = next / v.scale;
          v.tx = px - (px - v.tx) * k;
          v.ty = py - (py - v.ty) * k;
          v.scale = next;
          drawRef.current();
        }}
      />
      <p id={captionId} className="sr-only">
        {caption}. {nodes.length} entities and {links.length} relationships.
        Use “Browse as list” for a navigable equivalent.
      </p>

      <div className="graph-toolbar">
        <button type="button" className="btn btn-ghost btn-sm"
          aria-expanded={showIndex} onClick={() => setShowIndex((v) => !v)}>
          {showIndex ? 'Show graph' : 'Browse as list'}
        </button>
      </div>

      {kinds.length > 0 && !showIndex && (
        <div className="graph-legend">
          {kinds.map((k, i) => (
            <span key={k.kind} className="graph-legend-key">
              {/* The colour comes from the DECLARED position, the same arithmetic the canvas
                  does — a stylesheet rule keyed on the kind's spelling is how the legend and the
                  nodes came to disagree, and then to show nothing at all. */}
              <span
                className="graph-legend-dot"
                data-kind={k.kind}
                style={{ background: `var(--series-${(i % SERIES) + 1})` }}
              />
              {k.label}
            </span>
          ))}
        </div>
      )}

      {showIndex && (
        <div className="graph-index">
          <p className="label">{caption}</p>
          <ul className="checklist" style={{ marginBlockStart: 'var(--space-3)' }}>
            {nodes.map((n) => {
              const adj = [...(neighbours.get(n.id) ?? [])].map((id) => labelFor.get(id) ?? id);
              return (
                <li key={n.id}>
                  <button type="button" className={cx('menu-item', 'graph-index-item')}
                    aria-pressed={selected === n.id}
                    onClick={() => onSelect?.(selected === n.id ? null : n.id)}>
                    <span>
                      <span className="checklist-text">{n.label}</span>
                      <span className="checklist-note">
                        {n.kind ? `${n.kind} · ` : ''}
                        {adj.length ? `${adj.length} connection${adj.length === 1 ? '' : 's'}: ${adj.slice(0, 6).join(', ')}${adj.length > 6 ? '…' : ''}` : 'no connections'}
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
