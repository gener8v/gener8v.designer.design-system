#!/usr/bin/env node
// Proves the layout meets the stated scale target rather than asserting it.
// Budget: one tick must fit inside a 16.7ms frame at the target node count.
import { createLayout, tick, settle, bounds, radiusFor } from '../packages/ui/dist/KnowledgeGraph/simulation.js';

const FRAME_MS = 16.7;

function makeGraph(n, avgDegree = 3) {
  const nodes = Array.from({ length: n }, (_, i) => ({
    id: `n${i}`, label: `Entity ${i}`, kind: ['engagement','control','finding','evidence','person'][i % 5],
  }));
  // Preferential attachment — a realistic corpus has hubs, not a uniform mesh,
  // and hubs are what stress both the quadtree and the radius scale.
  const links = [];
  const pool = ['n0'];
  for (let i = 1; i < n; i++) {
    for (let k = 0; k < Math.max(1, Math.round(avgDegree / 2)); k++) {
      const target = pool[(i * 7919 + k * 104729) % pool.length];
      if (target !== `n${i}`) { links.push({ source: `n${i}`, target }); pool.push(target); }
    }
    pool.push(`n${i}`);
  }
  return { nodes, links };
}

const rows = [];
for (const n of [100, 500, 1000, 2500, 5000]) {
  const { nodes, links } = makeGraph(n);
  const L = createLayout(nodes, links, 1200, 760);

  // warm up the JIT before measuring
  for (let i = 0; i < 5; i++) tick(L, { width: 1200, height: 760 });

  const t0 = performance.now();
  const ITER = 30;
  for (let i = 0; i < ITER; i++) tick(L, { width: 1200, height: 760 });
  const perTick = (performance.now() - t0) / ITER;

  const L2 = createLayout(nodes, links, 1200, 760);
  const s0 = performance.now();
  settle(L2, { width: 1200, height: 760 });
  const settleMs = performance.now() - s0;

  const b = bounds(L2);
  const degrees = [...L2.degree];
  const maxDeg = Math.max(...degrees);
  rows.push({
    nodes: n, edges: links.length,
    tickMs: +perTick.toFixed(2),
    fps: Math.round(1000 / perTick),
    settleMs: Math.round(settleMs),
    budget: perTick < FRAME_MS ? 'PASS' : 'FAIL',
    maxDegree: maxDeg,
    radiusRange: `${radiusFor(Math.min(...degrees)).toFixed(1)}–${radiusFor(maxDeg).toFixed(1)}px`,
    spreadW: b.width,
    spread: Number.isFinite(b.width) ? `${Math.round(b.width)}×${Math.round(b.height)}` : 'DIVERGED',
  });
}

const pad = (v, w) => String(v).padEnd(w);
console.log(pad('nodes', 7) + pad('edges', 8) + pad('tick', 9) + pad('fps', 7)
  + pad('settle', 9) + pad('60fps', 8) + pad('maxDeg', 8) + pad('radius', 14) + 'spread');
for (const r of rows) {
  console.log(pad(r.nodes, 7) + pad(r.edges, 8) + pad(r.tickMs + 'ms', 9) + pad(r.fps, 7)
    + pad(r.settleMs + 'ms', 9) + pad(r.budget, 8) + pad(r.maxDegree, 8) + pad(r.radiusRange, 14) + r.spread);
}

const diverged = rows.filter((r) => !Number.isFinite(r.spreadW) || r.spreadW > 1e6);
if (diverged.length) {
  console.error(`\n✗ graph — layout diverged at ${diverged.map((d) => d.nodes).join(', ')} nodes`);
  process.exit(1);
}

const target = rows.find((r) => r.nodes === 1000);
if (!target || target.budget !== 'PASS') {
  console.error(`\n✗ graph — 1,000 nodes does not fit a 60fps frame budget`);
  process.exit(1);
}
console.log(`\n✓ graph — 1,000 nodes at ${target.tickMs}ms/tick (${target.fps}fps), inside the ${FRAME_MS}ms frame budget`);
