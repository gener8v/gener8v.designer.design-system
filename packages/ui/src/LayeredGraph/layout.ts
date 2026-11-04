/**
 * Where everything in a layered graph sits — no React, so the arithmetic is tested on its own and
 * renders the same on the server as in the browser.
 *
 * UNITS. Every figure here is in graph units, drawn at `--layered-graph-unit` (a sixteenth of a
 * rem, so a pixel at the default size and larger when a reader turns the text up). The nodes and
 * the lines between them are placed with the same numbers, so they cannot drift apart.
 */
import type { ReactNode } from 'react';

export interface LayeredNode {
  /** Stable, and what an edge names. */
  id: string;
  /** What a person calls it. One line in a `sm` layer, two in an `md` one. */
  label: string;
  /** A short code set in mono before the label — `REQ-014`, `M2`. Used for the node's links on a phone. */
  code?: string;
  /** Anything at the end of the node: a status tag, a count. */
  meta?: ReactNode;
  /**
   * `terminal` is where a sequence ends — a statement of work, a release. Drawn dashed, never a
   * place to drop onto.
   */
  variant?: 'default' | 'terminal';
  /** Said after the node's name and links — "Status: drafted." Not shown. */
  description?: string;
}

export interface LayeredGroup {
  label: string;
  nodes: LayeredNode[];
}

export interface LayeredLayer {
  id: string;
  /** The layer's name, shown above it and naming its list — `Requirements by capability`. */
  label: string;
  /** The nodes, or `groups` of them under a heading each (one or the other). */
  nodes?: LayeredNode[];
  groups?: LayeredGroup[];
  /** An ordered list: the nodes are a sequence and are read as one. */
  ordered?: boolean;
  /**
   * `sm` — a one-line row, stacked from the top, for long lists (requirements).
   * `md` — a two-line card, spread down the height of the graph, for a short sequence (milestones).
   * Defaults to `sm` for a grouped layer and `md` otherwise.
   */
  size?: 'sm' | 'md';
  /**
   * Its nodes are covered by the next layer's: a node with no `link` edge out of it is uncovered,
   * drawn so, counted in the layer's head and in its group's.
   */
  coverable?: boolean;
  /** Its share of the width, against the other layers'. Defaults to 1. */
  width?: number;
}

export type LayeredEdgeKind = 'link' | 'sequence';

export interface LayeredEdge {
  /** The covered end — `REQ-014`. */
  from: string;
  /** What covers it — `M2`. */
  to: string;
  /**
   * `link` (the default) — a covering line, lit when either end is focused, hovered or selected.
   * `sequence` — a dashed line for order: one milestone to the next, the last into the terminal node.
   */
  kind?: LayeredEdgeKind;
}

/** Heights, in graph units. */
export const LAYERED_METRICS = {
  /** A group's heading. */
  head: 34,
  /** One `sm` row: a 24-unit node and the air under it. */
  row: 30,
  rowNode: 24,
  /** An `md` node. */
  card: 58,
  /** A terminal node. */
  terminal: 44,
  /** The least air above and below each spread node. */
  gap: 12,
  /** Of the width, between two layers — where the lines run. */
  gutter: 10,
} as const;

export interface PlacedNode {
  node: LayeredNode;
  layer: string;
  y: number;
  h: number;
  /** Where its lines meet it, down the node. */
  mid: number;
  uncovered: boolean;
}
export interface PlacedHead {
  group: LayeredGroup;
  y: number;
  uncovered: number;
}
export interface PlacedLayer {
  layer: LayeredLayer;
  size: 'sm' | 'md';
  /** Its left and right edges, in hundredths of the width. */
  x0: number;
  x1: number;
  heads: PlacedHead[];
  nodes: PlacedNode[];
  uncovered: number;
}
export interface LayeredLayout {
  layers: PlacedLayer[];
  /** Every node by id. */
  at: Map<string, PlacedNode & { x0: number; x1: number }>;
  height: number;
}

export const layerNodes = (layer: LayeredLayer): LayeredNode[] =>
  layer.groups ? layer.groups.flatMap((g) => g.nodes) : layer.nodes ?? [];

/**
 * The nodes of a `coverable` layer that no `link` edge leaves — what is not yet in anything.
 * For a count or a highlight the caller shows elsewhere.
 */
export function uncoveredIds(layers: LayeredLayer[], edges: LayeredEdge[]): string[] {
  const ids = new Set(layers.flatMap((l) => layerNodes(l).map((n) => n.id)));
  const out = new Set(edges.filter((e) => (e.kind ?? 'link') === 'link' && ids.has(e.to)).map((e) => e.from));
  return layers.filter((l) => l.coverable)
    .flatMap((l) => layerNodes(l).filter((n) => !out.has(n.id)).map((n) => n.id));
}

export function layoutGraph(layers: LayeredLayer[], edges: LayeredEdge[]): LayeredLayout {
  const M = LAYERED_METRICS;
  const open = new Set(uncoveredIds(layers, edges));

  // Across: each layer's share of what the gutters leave.
  const shares = layers.map((l) => Math.max(l.width ?? 1, 0.01));
  const total = shares.reduce((a, b) => a + b, 0);
  const room = 100 - M.gutter * Math.max(layers.length - 1, 0);
  let x = 0;
  const spans = shares.map((s) => {
    const x0 = x;
    x += (s / total) * room;
    const span = { x0, x1: x };
    x += M.gutter;
    return span;
  });

  // Down, first pass: the stacked layers set the height.
  const sizeOf = (l: LayeredLayer): 'sm' | 'md' => l.size ?? (l.groups ? 'sm' : 'md');
  const nodeH = (l: LayeredLayer, n: LayeredNode) =>
    n.variant === 'terminal' ? M.terminal : sizeOf(l) === 'sm' ? M.rowNode : M.card;
  const stacked = (l: LayeredLayer) => sizeOf(l) === 'sm' || !!l.groups;

  const placed: PlacedLayer[] = layers.map((layer, i) => ({
    layer, size: sizeOf(layer), ...spans[i]!, heads: [], nodes: [], uncovered: 0,
  }));
  let height = 0;
  for (const p of placed) {
    if (!stacked(p.layer)) continue;
    let y = 0;
    const put = (n: LayeredNode) => {
      const h = nodeH(p.layer, n);
      p.nodes.push({ node: n, layer: p.layer.id, y, h, mid: y + h / 2, uncovered: open.has(n.id) });
      y += n.variant === 'terminal' ? h + M.gap : M.row;
    };
    if (p.layer.groups) {
      for (const group of p.layer.groups) {
        p.heads.push({ group, y, uncovered: group.nodes.filter((n) => open.has(n.id)).length });
        y += M.head;
        group.nodes.forEach(put);
      }
    } else (p.layer.nodes ?? []).forEach(put);
    height = Math.max(height, y);
  }

  // Second pass: the spread layers share out what is left as air — one gap above each node and
  // one below the last, so a short sequence sits evenly down a long list.
  for (const p of placed) {
    if (stacked(p.layer)) continue;
    const nodes = p.layer.nodes ?? [];
    const stack = nodes.reduce((a, n) => a + nodeH(p.layer, n), 0);
    height = Math.max(height, stack + (nodes.length + 1) * M.gap);
  }
  for (const p of placed) {
    if (stacked(p.layer)) continue;
    const nodes = p.layer.nodes ?? [];
    const stack = nodes.reduce((a, n) => a + nodeH(p.layer, n), 0);
    const gap = (height - stack) / (nodes.length + 1);
    let y = gap;
    for (const n of nodes) {
      const h = nodeH(p.layer, n);
      p.nodes.push({ node: n, layer: p.layer.id, y, h, mid: y + h / 2, uncovered: open.has(n.id) });
      y += h + gap;
    }
  }

  const at: LayeredLayout['at'] = new Map();
  for (const p of placed) {
    p.uncovered = p.nodes.filter((n) => n.uncovered).length;
    for (const n of p.nodes) at.set(n.node.id, { ...n, x0: p.x0, x1: p.x1 });
  }
  return { layers: placed, at, height: Math.ceil(height) };
}

/** An edge's path in the drawing's coordinates (x in hundredths of the width, y in graph units). */
export function edgePath(layout: LayeredLayout, edge: LayeredEdge): string | null {
  const a = layout.at.get(edge.from);
  const b = layout.at.get(edge.to);
  if (!a || !b) return null;
  const r = (v: number) => Math.round(v * 100) / 100;
  if (a.layer === b.layer) {
    // Down the middle of the layer, from the foot of one node to the head of the other.
    const mx = r((a.x0 + a.x1) / 2);
    const [top, bottom] = a.y <= b.y ? [a, b] : [b, a];
    return `M ${mx} ${r(top.y + top.h)} L ${mx} ${r(bottom.y)}`;
  }
  // Out of the trailing side of the left one, into the leading side of the right one.
  const [l, rt] = a.x0 <= b.x0 ? [a, b] : [b, a];
  const sx = l.x1;
  const ex = rt.x0;
  const cx = r((sx + ex) / 2);
  return `M ${r(sx)} ${r(l.mid)} C ${cx} ${r(l.mid)}, ${cx} ${r(rt.mid)}, ${r(ex)} ${r(rt.mid)}`;
}
