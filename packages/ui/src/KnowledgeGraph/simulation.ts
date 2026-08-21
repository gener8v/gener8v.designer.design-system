/**
 * Force-directed layout with Barnes–Hut approximation.
 *
 * Naive repulsion is O(n²): at 1,000 nodes that is 500,000 pair calculations
 * per frame, which will not hold 60fps. A quadtree lets distant clusters be
 * treated as one aggregate body, taking it to O(n log n) — roughly 10,000
 * operations at the same node count.
 *
 * Positions and velocities live in flat Float64Arrays rather than objects, so a
 * tick walks contiguous memory instead of chasing pointers through 1,000
 * allocations.
 */

export interface GraphNodeInput { id: string; label: string; kind?: string }
export interface SimLink { source: string; target: string }

export interface SimOptions {
  width: number;
  height: number;
  linkDistance?: number;
  repulsion?: number;
  spring?: number;
  centering?: number;
  damping?: number;
  /** Barnes–Hut accuracy. 0 = exact and slow, 1.2 ≈ fast and visually fine. */
  theta?: number;
}

export interface Layout {
  ids: string[];
  index: Map<string, number>;
  x: Float64Array;
  y: Float64Array;
  vx: Float64Array;
  vy: Float64Array;
  /** Edge count per node. Drives radius. */
  degree: Int32Array;
  /** Flat edge pairs as node indices: [a0,b0, a1,b1, …]. */
  edges: Int32Array;
  alpha: number;
  n: number;
}

/* ----------------------------------------------------------------- quadtree */

/** Flat quadtree. Each cell is 8 consecutive slots; children are cell indices. */
const CELL = 8;
const C_MASS = 0, C_CX = 1, C_CY = 2, C_X0 = 3, C_Y0 = 4, C_SIZE = 5, C_CHILD = 6, C_BODY = 7;

class Quadtree {
  private t: Float64Array;
  private used = 0;
  private cap: number;

  constructor(capacity: number) {
    this.cap = Math.max(64, capacity * 4);
    this.t = new Float64Array(this.cap * CELL);
  }

  private alloc(x0: number, y0: number, size: number): number {
    if ((this.used + 1) * CELL > this.t.length) {
      const bigger = new Float64Array(this.t.length * 2);
      bigger.set(this.t);
      this.t = bigger;
    }
    const i = this.used++;
    const o = i * CELL;
    this.t[o + C_MASS] = 0; this.t[o + C_CX] = 0; this.t[o + C_CY] = 0;
    this.t[o + C_X0] = x0; this.t[o + C_Y0] = y0; this.t[o + C_SIZE] = size;
    this.t[o + C_CHILD] = -1; this.t[o + C_BODY] = -1;
    return i;
  }

  build(x: Float64Array, y: Float64Array, n: number): void {
    this.used = 0;
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (let i = 0; i < n; i++) {
      if (x[i]! < minX) minX = x[i]!;
      if (x[i]! > maxX) maxX = x[i]!;
      if (y[i]! < minY) minY = y[i]!;
      if (y[i]! > maxY) maxY = y[i]!;
    }
    const size = Math.max(maxX - minX, maxY - minY, 1) * 1.02;
    this.alloc(minX, minY, size);
    for (let i = 0; i < n; i++) this.insert(0, i, x, y, 0);
  }

  private insert(cell: number, body: number, x: Float64Array, y: Float64Array, depth: number): void {
    const o = cell * CELL;
    this.t[o + C_MASS]! += 1;
    this.t[o + C_CX]! += x[body]!;
    this.t[o + C_CY]! += y[body]!;

    // 24 levels is ~16M cells of separation; deeper means coincident points.
    if (depth > 24) return;

    const existing = this.t[o + C_BODY]!;
    const child = this.t[o + C_CHILD]!;

    if (child < 0 && existing < 0) { this.t[o + C_BODY] = body; return; }

    if (child < 0) {
      // Leaf becomes internal: allocate four children and re-seat the occupant.
      const half = this.t[o + C_SIZE]! / 2;
      const x0 = this.t[o + C_X0]!, y0 = this.t[o + C_Y0]!;
      const base = this.alloc(x0, y0, half);
      this.alloc(x0 + half, y0, half);
      this.alloc(x0, y0 + half, half);
      this.alloc(x0 + half, y0 + half, half);
      this.t[cell * CELL + C_CHILD] = base;
      this.t[cell * CELL + C_BODY] = -1;
      this.insert(base + this.quadrant(cell, existing, x, y), existing, x, y, depth + 1);
    }
    const c = this.t[cell * CELL + C_CHILD]!;
    this.insert(c + this.quadrant(cell, body, x, y), body, x, y, depth + 1);
  }

  private quadrant(cell: number, body: number, x: Float64Array, y: Float64Array): number {
    const o = cell * CELL;
    const half = this.t[o + C_SIZE]! / 2;
    const right = x[body]! >= this.t[o + C_X0]! + half ? 1 : 0;
    const below = y[body]! >= this.t[o + C_Y0]! + half ? 1 : 0;
    return below * 2 + right;
  }

  /** Accumulates repulsion on `body` into the out array. */
  force(body: number, x: Float64Array, y: Float64Array, k: number, theta: number, out: Float64Array): void {
    const stack = this.stack;
    let sp = 0;
    stack[sp++] = 0;
    let fx = 0, fy = 0;
    while (sp > 0) {
      const cell = stack[--sp]!;
      const o = cell * CELL;
      const mass = this.t[o + C_MASS]!;
      if (mass === 0) continue;
      const cx = this.t[o + C_CX]! / mass;
      const cy = this.t[o + C_CY]! / mass;
      let dx = x[body]! - cx;
      let dy = y[body]! - cy;
      let d2 = dx * dx + dy * dy;
      const bodyIdx = this.t[o + C_BODY]!;

      if (bodyIdx === body && mass === 1) continue;   // itself
      if (d2 < 0.01) { dx = (body % 7) - 3 || 1; dy = (body % 5) - 2 || 1; d2 = dx * dx + dy * dy; }

      const size = this.t[o + C_SIZE]!;
      const child = this.t[o + C_CHILD]!;
      if (child < 0 || (size * size) / d2 < theta * theta) {
        const f = (k * mass) / d2;
        const inv = 1 / Math.sqrt(d2);
        fx += dx * inv * f;
        fy += dy * inv * f;
      } else {
        stack[sp++] = child; stack[sp++] = child + 1;
        stack[sp++] = child + 2; stack[sp++] = child + 3;
      }
    }
    out[0] = fx; out[1] = fy;
  }

  private stack = new Int32Array(4096);
}

/* ------------------------------------------------------------------ layout */

export function createLayout(
  nodes: GraphNodeInput[], links: SimLink[], width: number, height: number,
): Layout {
  const n = nodes.length;
  const index = new Map<string, number>();
  nodes.forEach((nd, i) => index.set(nd.id, i));

  const x = new Float64Array(n);
  const y = new Float64Array(n);
  const degree = new Int32Array(n);

  const pairs: number[] = [];
  for (const l of links) {
    const a = index.get(l.source);
    const b = index.get(l.target);
    if (a === undefined || b === undefined || a === b) continue;
    pairs.push(a, b);
    degree[a]! += 1;
    degree[b]! += 1;
  }

  // Deterministic phyllotaxis seeding: even coverage, no RNG, so the same
  // graph always lays out the same way and a screenshot diff stays meaningful.
  const golden = Math.PI * (3 - Math.sqrt(5));
  const spread = Math.min(width, height) * 0.42;
  for (let i = 0; i < n; i++) {
    const r = spread * Math.sqrt((i + 0.5) / n);
    const a = i * golden;
    x[i] = width / 2 + Math.cos(a) * r;
    y[i] = height / 2 + Math.sin(a) * r;
  }

  return {
    ids: nodes.map((nd) => nd.id), index, x, y,
    vx: new Float64Array(n), vy: new Float64Array(n),
    degree, edges: Int32Array.from(pairs), alpha: 1, n,
  };
}

const scratch = new Float64Array(2);
let tree: Quadtree | null = null;

/** Advances one tick. Returns the remaining alpha; 0 means settled. */
export function tick(L: Layout, opts: SimOptions): number {
  const {
    width, height,
    linkDistance = 90, repulsion = 20000, spring = 0.045,
    centering = 0.003, damping = 0.82, theta = 1.1,
  } = opts;
  const { x, y, vx, vy, n, edges } = L;
  if (n === 0) return 0;

  if (!tree || (tree as unknown as { cap: number }).cap < n * 4) tree = new Quadtree(n);
  tree.build(x, y, n);

  // Repulsion is scaled down as the graph grows, or a large graph explodes:
  // total repulsive energy would otherwise rise with n while springs do not.
  const k = repulsion * Math.min(1, 60 / Math.max(1, n));

  for (let i = 0; i < n; i++) {
    tree.force(i, x, y, k, theta, scratch);
    vx[i]! += scratch[0]!;
    vy[i]! += scratch[1]!;
  }

  // Spring strength is divided by the lesser endpoint degree, and the impulse
  // is split by a bias, so the heavier node moves less. Without this a hub with
  // 349 edges receives 349 spring impulses per tick, its velocity compounds,
  // and the whole layout diverges to Infinity within a few hundred frames.
  const { degree } = L;
  for (let e = 0; e < edges.length; e += 2) {
    const a = edges[e]!, b = edges[e + 1]!;
    const da = degree[a]!, db = degree[b]!;
    const dx = x[b]! - x[a]!;
    const dy = y[b]! - y[a]!;
    const d = Math.hypot(dx, dy) || 0.001;
    const strength = spring / Math.max(1, Math.min(da, db));
    const f = ((d - linkDistance) * strength) / d;
    const bias = da / Math.max(1, da + db);
    vx[a]! += dx * f * (1 - bias) * 2; vy[a]! += dy * f * (1 - bias) * 2;
    vx[b]! -= dx * f * bias * 2;       vy[b]! -= dy * f * bias * 2;
  }

  // Velocity ceiling. Even with a correct spring model, a pathological graph
  // can produce one huge impulse; clamping keeps a bad frame from becoming a
  // permanently broken layout.
  const VMAX = Math.max(width, height) * 0.25;
  let energy = 0;
  for (let i = 0; i < n; i++) {
    vx[i]! += (width / 2 - x[i]!) * centering;
    vy[i]! += (height / 2 - y[i]!) * centering;
    vx[i]! *= damping;
    vy[i]! *= damping;
    const speed = Math.hypot(vx[i]!, vy[i]!);
    if (speed > VMAX) { const s = VMAX / speed; vx[i]! *= s; vy[i]! *= s; }
    x[i]! += vx[i]! * L.alpha;
    y[i]! += vy[i]! * L.alpha;
    energy += vx[i]! * vx[i]! + vy[i]! * vy[i]!;
  }

  L.alpha *= 0.994;
  return energy / n < 0.015 || L.alpha < 0.02 ? 0 : L.alpha;
}

/** Runs to rest synchronously — for reduced motion, tests and static export. */
export function settle(L: Layout, opts: SimOptions, maxIterations = 600): void {
  for (let i = 0; i < maxIterations; i++) if (tick(L, opts) === 0) break;
}

/**
 * Radius from degree. sqrt because the eye compares area, not radius — linear
 * scaling makes a 100-edge hub look ten times more connected than a 10-edge
 * one when it is only ten times, not a hundred.
 *
 * Capped at 34px: past that a single hub dominates the canvas and stops being
 * a node at all. The cap loses precision at the very top of the range, which
 * is the right trade — nobody reads exact degree off a circle.
 */
export const radiusFor = (degree: number) => Math.min(34, 3.5 + Math.sqrt(degree) * 2.6);

/** Bounding box of the settled layout, for fit-to-view. */
export function bounds(L: Layout) {
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (let i = 0; i < L.n; i++) {
    const r = radiusFor(L.degree[i]!);
    if (L.x[i]! - r < minX) minX = L.x[i]! - r;
    if (L.x[i]! + r > maxX) maxX = L.x[i]! + r;
    if (L.y[i]! - r < minY) minY = L.y[i]! - r;
    if (L.y[i]! + r > maxY) maxY = L.y[i]! + r;
  }
  return { minX, minY, maxX, maxY, width: maxX - minX, height: maxY - minY };
}
