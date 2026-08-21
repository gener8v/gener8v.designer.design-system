import { describe, it, expect } from 'vitest';
import { createLayout, tick, settle, bounds, radiusFor } from '../packages/ui/src/index.js';

function corpus(n: number, fanout = 2) {
  const nodes = Array.from({ length: n }, (_, i) => ({ id: `n${i}`, label: `E${i}` }));
  const links: Array<{ source: string; target: string }> = [];
  const pool = ['n0'];
  for (let i = 1; i < n; i++) {
    for (let k = 0; k < fanout; k++) {
      const t = pool[(i * 7919 + k * 104729) % pool.length]!;
      if (t !== `n${i}`) { links.push({ source: `n${i}`, target: t }); pool.push(t); }
    }
    pool.push(`n${i}`);
  }
  return { nodes, links };
}

describe('graph layout', () => {
  it('is deterministic — the same corpus always lays out identically', () => {
    const { nodes, links } = corpus(120);
    const a = createLayout(nodes, links, 1200, 760);
    const b = createLayout(nodes, links, 1200, 760);
    settle(a, { width: 1200, height: 760 });
    settle(b, { width: 1200, height: 760 });
    expect([...a.x]).toEqual([...b.x]);
    expect([...a.y]).toEqual([...b.y]);
  });

  it('counts degree from the edge list', () => {
    const L = createLayout(
      [{ id: 'a', label: 'A' }, { id: 'b', label: 'B' }, { id: 'c', label: 'C' }],
      [{ source: 'a', target: 'b' }, { source: 'a', target: 'c' }], 400, 400);
    expect(L.degree[L.index.get('a')!]).toBe(2);
    expect(L.degree[L.index.get('b')!]).toBe(1);
    expect(L.degree[L.index.get('c')!]).toBe(1);
  });

  it('drops edges pointing at unknown or identical nodes', () => {
    const L = createLayout(
      [{ id: 'a', label: 'A' }, { id: 'b', label: 'B' }],
      [{ source: 'a', target: 'b' }, { source: 'a', target: 'ghost' }, { source: 'a', target: 'a' }],
      400, 400);
    expect(L.edges.length).toBe(2);   // one surviving pair
  });

  it('scales radius by sqrt of degree and caps it', () => {
    expect(radiusFor(0)).toBeCloseTo(3.5, 5);
    // four times the edges must not be four times the radius
    const r4 = radiusFor(4) - 3.5;
    const r16 = radiusFor(16) - 3.5;
    expect(r16 / r4).toBeCloseTo(2, 5);
    expect(radiusFor(100000)).toBe(34);
  });

  // The bug the benchmark caught: hubs took one spring impulse per edge and
  // the layout ran to Infinity. This is the regression guard.
  it('stays finite at 1,000 nodes with heavy hubs', () => {
    const { nodes, links } = corpus(1000);
    const L = createLayout(nodes, links, 1200, 760);
    settle(L, { width: 1200, height: 760 });
    for (let i = 0; i < L.n; i++) {
      expect(Number.isFinite(L.x[i]!)).toBe(true);
      expect(Number.isFinite(L.y[i]!)).toBe(true);
    }
    const b = bounds(L);
    expect(b.width).toBeGreaterThan(200);
    expect(b.width).toBeLessThan(20000);
    expect(Math.max(...L.degree)).toBeGreaterThan(100);   // hubs really exist
  });

  it('converges rather than ticking forever', () => {
    const { nodes, links } = corpus(300);
    const L = createLayout(nodes, links, 1200, 760);
    let ticks = 0;
    while (tick(L, { width: 1200, height: 760 }) > 0 && ticks < 5000) ticks++;
    expect(ticks).toBeLessThan(1200);
  });

  it('meets the 60fps budget at 1,000 nodes', () => {
    const { nodes, links } = corpus(1000);
    const L = createLayout(nodes, links, 1200, 760);
    for (let i = 0; i < 5; i++) tick(L, { width: 1200, height: 760 });
    const t0 = performance.now();
    for (let i = 0; i < 20; i++) tick(L, { width: 1200, height: 760 });
    const perTick = (performance.now() - t0) / 20;
    expect(perTick).toBeLessThan(16.7);
  });
});
