import { forwardRef, useId, useRef, useState } from 'react';
import type { CSSProperties, DragEvent, HTMLAttributes, KeyboardEvent, ReactNode } from 'react';
import { cx } from '../cx.js';
import { Tag } from '../Tag/index.js';
import {
  LAYERED_METRICS, edgePath, layerNodes, layoutGraph,
  type LayeredEdge, type LayeredLayer, type LayeredNode, type PlacedNode,
} from './layout.js';

/** What a node's lines are, for a sentence about it. */
export interface NodeLinks {
  /** What covers it: the ends of `link` edges leaving it. */
  coveredBy: LayeredNode[];
  /** What it covers: the starts of `link` edges arriving at it. */
  covers: LayeredNode[];
  /** In a `coverable` layer and covered by nothing. */
  uncovered: boolean;
  layer: LayeredLayer;
}

export interface LayeredGraphLabels {
  /** A layer's or a group's count. Default `3 uncovered`. */
  uncovered?: (count: number) => string;
  /** Said and, on a phone, shown for a node no line leaves. Default `Not covered`. */
  notCovered?: string;
  /** Default `In M1, M2`. Given codes on a phone and names to a screen reader. */
  coveredBy?: (names: string[]) => string;
  /** Default `Covers 4`. */
  covers?: (count: number) => string;
  /** The keyboard's way to drag, said on every node that can be dragged. */
  assignHint?: string;
  /** Said when a node is picked up by the keyboard. */
  pickedUp?: (node: LayeredNode, target: LayeredLayer) => string;
  /** Said when it is put down. */
  assigned?: (node: LayeredNode, onto: LayeredNode) => string;
  /** Said when Escape puts it back. */
  cancelled?: (node: LayeredNode) => string;
}

export interface LayeredGraphProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  /** Left to right. Each one is a list; a grouped layer is a list of lists. */
  layers: LayeredLayer[];
  edges: LayeredEdge[];
  /** Names the whole graph. Each layer's list is named by its own label. */
  'aria-label': string;
  /** The node whose detail is open: pressed, and its lines lit. */
  selected?: string | null;
  /**
   * What to bring forward. `uncovered` — every uncovered node, the rest dimmed. A list of ids —
   * those nodes, for a search or a filter. Nothing — the graph as it is.
   */
  highlight?: 'uncovered' | readonly string[] | null;
  /** A node was clicked or entered. Open its detail. */
  onNodeOpen?: (id: string) => void;
  /** A node from the `assign.from` layer was dropped on, or put down on, one in `assign.to`. */
  onAssign?: (fromId: string, toId: string) => void;
  /** Which layer's nodes are dragged onto which. Defaults to the first onto the second. */
  assign?: { from: string; to: string };
  /** A reader who can only read: nothing is dragged, and the keyboard's pick-up is not offered. */
  readOnly?: boolean;
  /** The key that picks a node up from the keyboard. Default `a` (assign). */
  assignKey?: string;
  /** Show each layer's name and count above it. Default on. */
  headings?: boolean;
  /** The node's accessible name after its code and label. Defaults to its links in `labels`' words. */
  describe?: (node: LayeredNode, links: NodeLinks) => string;
  labels?: LayeredGraphLabels;
  /** Shown instead of the graph when there are no nodes at all. */
  empty?: ReactNode;
}

const DRAGGED = 'application/x-layered-graph-node';

const DEFAULT_LABELS: Required<LayeredGraphLabels> = {
  uncovered: (n) => `${n} uncovered`,
  notCovered: 'Not covered',
  coveredBy: (names) => `In ${names.join(', ')}`,
  covers: (n) => `Covers ${n}`,
  assignHint: '',
  pickedUp: (node, target) =>
    `${node.code ?? node.label} picked up. Choose in ${target.label} and press Enter, or Escape to put it back.`,
  assigned: (node, onto) => `${node.code ?? node.label} put in ${onto.code ?? onto.label}.`,
  cancelled: (node) => `${node.code ?? node.label} put back.`,
};

/**
 * Layers read left to right — requirements by capability, then milestones in sequence, then where
 * the sequence ends — with a line for everything one layer's node covers in the next.
 *
 * NOT THE KNOWLEDGE GRAPH. That one is force-directed on a canvas, built to hold a thousand nodes
 * nobody arranged. This one has an order the reader already knows (the layers, then the sequence
 * in each), and one gesture that matters — put this under that — so it is laid out, not simulated.
 *
 * THE NODES ARE REAL BUTTONS IN REAL LISTS. The lines are a drawing, hidden from assistive
 * technology; each layer is a list (a grouped one a list of lists, an ordered one an `ol`), and
 * every node's name says what covers it. A screen reader walks the lists, a keyboard tabs through
 * them, and Enter opens the same detail a click does.
 *
 * DRAGGING HAS A KEYBOARD TWIN. `A` on a node picks it up; the nodes it can go to are marked, Enter
 * on one puts it there and Escape puts it back — each step said in a polite live region.
 *
 * ON A PHONE THE LINES BECOME WORDS. Below 30rem of its own width the layers stack, the drawing
 * goes, and each node shows what covers it in text — `In M1, M2` — which is all the lines said.
 */
export const LayeredGraph = forwardRef<HTMLDivElement, LayeredGraphProps>(function LayeredGraph(
  {
    layers, edges, selected = null, highlight = null, onNodeOpen, onAssign, assign, readOnly = false,
    assignKey = 'a', headings = true, describe, labels: given, empty, className, style, ...rest
  }, ref,
) {
  const L = {
    ...DEFAULT_LABELS,
    assignHint: `Press ${assignKey.toUpperCase()} to pick up, then choose where it goes and press Enter.`,
    ...given,
  };
  const uid = useId().replace(/:/g, '');
  const [hover, setHover] = useState<string | null>(null);
  const [dragging, setDragging] = useState<string | null>(null);
  const [over, setOver] = useState<string | null>(null);
  const [carrying, setCarrying] = useState<string | null>(null);
  const [said, setSaid] = useState('');
  const buttons = useRef(new Map<string, HTMLButtonElement>());

  const layout = layoutGraph(layers, edges);
  const node = (id: string) => layout.at.get(id)?.node;
  const source = assign?.from ?? layers[0]?.id;
  const target = assign?.to ?? layers[1]?.id;
  const canAssign = !!onAssign && !readOnly && !!source && !!target;
  const targetLayer = layers.find((l) => l.id === target);
  const accepts = (p: PlacedNode) => p.layer === target && p.node.variant !== 'terminal';

  const links = edges.filter((e) => (e.kind ?? 'link') === 'link' && layout.at.has(e.from) && layout.at.has(e.to));
  const linksOf = (p: PlacedNode, layer: LayeredLayer): NodeLinks => ({
    coveredBy: links.filter((e) => e.from === p.node.id).map((e) => node(e.to)!),
    covers: links.filter((e) => e.to === p.node.id).map((e) => node(e.from)!),
    uncovered: p.uncovered,
    layer,
  });
  const sentence = (p: PlacedNode, l: NodeLinks) => {
    if (l.coveredBy.length) return `${L.coveredBy(l.coveredBy.map((n) => n.label))}.`;
    if (l.uncovered) return `${L.notCovered}.`;
    if (l.covers.length) return `${L.covers(l.covers.length)}.`;
    return '';
  };
  /** What a phone shows in place of the lines. Codes where there are codes: it is a narrow line. */
  const shortLine = (l: NodeLinks) =>
    l.coveredBy.length ? L.coveredBy(l.coveredBy.map((n) => n.code ?? n.label))
      : l.uncovered ? L.notCovered
        : l.covers.length ? L.covers(l.covers.length) : '';

  const focus = hover ?? selected;
  const lit = (e: LayeredEdge) => (e.kind ?? 'link') === 'link'
    && (focus === e.from || focus === e.to || (carrying !== null && e.from === carrying));
  const brought = highlight === 'uncovered'
    ? new Set(layout.layers.flatMap((l) => l.nodes.filter((n) => n.uncovered).map((n) => n.node.id)))
    : highlight ? new Set(highlight) : null;

  const paths = edges
    .map((e) => ({ e, d: edgePath(layout, e) }))
    .filter((p): p is { e: LayeredEdge; d: string } => p.d !== null);
  // The unlit lines first, so a lit one is never drawn under its neighbours.
  const ordered = [...paths.filter((p) => !lit(p.e)), ...paths.filter((p) => lit(p.e))];

  function put(fromId: string, toId: string) {
    const from = node(fromId);
    const onto = node(toId);
    if (!from || !onto || !onAssign) return;
    onAssign(fromId, toId);
    setSaid(L.assigned(from, onto));
  }

  function drop(e: DragEvent, toId: string) {
    e.preventDefault();
    const from = e.dataTransfer.getData(DRAGGED) || dragging;
    setOver(null);
    setDragging(null);
    if (from) put(from, toId);
  }

  function pickUp(id: string) {
    const n = node(id);
    if (!n || !targetLayer) return;
    setCarrying(id);
    setSaid(L.pickedUp(n, targetLayer));
    const first = layout.layers.find((l) => l.layer.id === target)?.nodes.find(accepts);
    if (first) buttons.current.get(first.node.id)?.focus();
  }

  function putBack(focusSource = true) {
    if (!carrying) return;
    const n = node(carrying);
    if (n) setSaid(L.cancelled(n));
    if (focusSource) buttons.current.get(carrying)?.focus();
    setCarrying(null);
  }

  function onKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    if (e.key === 'Escape' && carrying) {
      e.stopPropagation();
      putBack();
    }
  }

  const total = layers.reduce((a, l) => a + layerNodes(l).length, 0);
  const hintId = `${uid}-hint`;

  function renderNode(p: PlacedNode, layer: LayeredLayer, size: 'sm' | 'md') {
    const n = p.node;
    const l = linksOf(p, layer);
    const draggable = canAssign && p.layer === source;
    const isTarget = canAssign && accepts(p);
    const words = describe ? describe(n, l) : sentence(p, l);
    const name = [n.code ? `${n.code}: ${n.label}.` : `${n.label}.`, words, n.description].filter(Boolean).join(' ');
    const short = shortLine(l);
    return (
      <li key={n.id} className="layered-graph-item"
        style={{ '--layered-graph-y': p.y, '--layered-graph-h': p.h } as CSSProperties}>
        <button
          type="button"
          ref={(el) => { if (el) buttons.current.set(n.id, el); else buttons.current.delete(n.id); }}
          className="layered-graph-node"
          data-size={n.variant === 'terminal' ? undefined : size}
          data-variant={n.variant === 'terminal' ? 'terminal' : undefined}
          data-uncovered={p.uncovered ? 'true' : undefined}
          data-highlighted={brought?.has(n.id) ? 'true' : undefined}
          data-over={over === n.id ? 'true' : undefined}
          data-droppable={isTarget ? 'true' : undefined}
          data-target={carrying && isTarget ? 'true' : undefined}
          data-carried={carrying === n.id ? 'true' : undefined}
          aria-pressed={selected === n.id}
          aria-label={name}
          aria-describedby={draggable ? hintId : undefined}
          draggable={draggable || undefined}
          onDragStart={draggable ? (e) => {
            e.dataTransfer.setData(DRAGGED, n.id);
            e.dataTransfer.effectAllowed = 'link';
            setDragging(n.id);
          } : undefined}
          onDragEnd={draggable ? () => { setDragging(null); setOver(null); } : undefined}
          onDragOver={isTarget ? (e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'link';
            setOver(n.id);
          } : undefined}
          onDragLeave={isTarget ? () => setOver((was) => (was === n.id ? null : was)) : undefined}
          onDrop={isTarget ? (e) => drop(e, n.id) : undefined}
          onMouseEnter={() => setHover(n.id)}
          onMouseLeave={() => setHover(null)}
          onFocus={() => setHover(n.id)}
          onBlur={() => setHover(null)}
          onKeyDown={draggable ? (e) => {
            if (e.key.toLowerCase() === assignKey.toLowerCase() && !e.metaKey && !e.ctrlKey && !e.altKey) {
              e.preventDefault();
              if (carrying === n.id) putBack(); else pickUp(n.id);
            }
          } : undefined}
          onClick={() => {
            if (carrying) {
              const from = carrying;
              if (isTarget) {
                setCarrying(null);
                put(from, n.id);
                buttons.current.get(from)?.focus();
                return;
              }
              putBack(false);
            }
            onNodeOpen?.(n.id);
          }}
        >
          {n.code ? <span className="layered-graph-code">{n.code}</span> : null}
          <span className="layered-graph-label">{n.label}</span>
          {n.meta ? <span className="layered-graph-meta">{n.meta}</span> : null}
          {short ? <span className="layered-graph-links" aria-hidden="true">{short}</span> : null}
        </button>
      </li>
    );
  }

  if (total === 0 && empty) {
    return <div {...rest} ref={ref} className={cx('layered-graph', className)} style={style}>{empty}</div>;
  }

  return (
    <div {...rest} ref={ref} role="group"
      className={cx('layered-graph', className)}
      data-dragging={dragging ? 'true' : undefined}
      data-carrying={carrying ? 'true' : undefined}
      data-highlight={brought ? 'true' : undefined}
      onKeyDown={onKeyDown}
      style={{
        ...style,
        '--layered-graph-height': layout.height,
        '--layered-graph-columns': layout.layers.map((l) => `${(l.x1 - l.x0).toFixed(2)}fr`).join(' '),
      } as CSSProperties}>
      <div className="layered-graph-canvas">
        <svg className="layered-graph-edges" aria-hidden="true" focusable="false"
          viewBox={`0 0 100 ${layout.height}`} preserveAspectRatio="none">
          {ordered.map(({ e, d }) => (
            <path key={`${e.kind ?? 'link'}-${e.from}-${e.to}`} d={d}
              data-kind={e.kind === 'sequence' ? 'sequence' : undefined}
              data-lit={lit(e) ? 'true' : undefined}
              vectorEffect="non-scaling-stroke" />
          ))}
        </svg>
        {layout.layers.map(({ layer, size, heads, nodes, uncovered }) => {
          const headId = `${uid}-${layer.id}`;
          const List = layer.ordered ? 'ol' : 'ul';
          return (
            // A group, not a <section>: a labelled section is a landmark, and three of them for one
            // drawing would crowd the page's own landmarks out of a screen reader's list.
            <div key={layer.id} role="group" className="layered-graph-layer" aria-labelledby={headId}
              style={{ '--layered-graph-column': layout.layers.findIndex((l) => l.layer === layer) + 1 } as CSSProperties}>
              <p className={cx('layered-graph-head', !headings && 'sr-only')} id={headId}>
                <span className="layered-graph-head-label" id={`${headId}-label`}>{layer.label}</span>
                {headings && uncovered > 0 ? <Tag variant="warning">{L.uncovered(uncovered)}</Tag> : null}
              </p>
              <List className="layered-graph-list" aria-labelledby={`${headId}-label`}>
                {layer.groups
                  ? heads.map(({ group, y, uncovered: open }) => (
                    <li key={group.label} className="layered-graph-group">
                      <p className="layered-graph-group-head"
                        style={{ '--layered-graph-y': y, '--layered-graph-h': LAYERED_METRICS.head } as CSSProperties}>
                        <span className="layered-graph-label">{group.label}</span>
                        {open > 0 ? <Tag variant="warning">{L.uncovered(open)}</Tag> : null}
                      </p>
                      <ul className="layered-graph-group-list" aria-label={group.label}>
                        {nodes.filter((p) => group.nodes.includes(p.node)).map((p) => renderNode(p, layer, size))}
                      </ul>
                    </li>
                  ))
                  : nodes.map((p) => renderNode(p, layer, size))}
              </List>
            </div>
          );
        })}
      </div>
      {canAssign ? <p id={hintId} hidden>{L.assignHint}</p> : null}
      <p className="sr-only" aria-live="polite">{said}</p>
    </div>
  );
});
