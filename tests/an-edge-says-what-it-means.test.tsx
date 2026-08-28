import { describe, expect, it, beforeAll, afterEach, vi } from 'vitest';
import { render, cleanup } from '@testing-library/react';
import { KnowledgeGraph } from '../packages/ui/src/index.js';
import { createLayout } from '../packages/ui/src/KnowledgeGraph/simulation.js';

/**
 * What an edge MEANS, on a canvas whose whole subject is what governs what.
 *
 * `GraphLink` has carried a `label` since it was written and the draw loop painted none — a
 * consumer could type the meaning of every relationship and never show it, so "this deliverable
 * was measured against ECOA-0a" and "this decision governs that document" were the same
 * anonymous line.
 *
 * WHAT IS STUBBED: jsdom has no 2d context, so this records what was painted. That is honest for
 * the question asked — WHICH text the draw loop decided to paint — and says nothing about how it
 * looks, which was checked in a browser.
 */

let painted: string[] = [];

beforeAll(() => {
  // One frame's text, not every frame's: the simulation redraws many times per render, and each
  // draw begins by clearing, which is the frame boundary.
  const ctx = new Proxy({}, {
    get: (_t, prop) => {
      if (prop === 'fillText') return (text: string) => { painted.push(text); };
      if (prop === 'clearRect') return () => { painted.length = 0; };
      if (prop === 'measureText') return () => ({ width: 40 });
      return () => undefined;
    },
  }) as unknown as CanvasRenderingContext2D;
  HTMLCanvasElement.prototype.getContext = (() => ctx) as HTMLCanvasElement['getContext'];
  for (const [prop, read] of [['clientWidth', () => 900], ['clientHeight', () => 600]] as const) {
    Object.defineProperty(HTMLCanvasElement.prototype, prop, { get: read, configurable: true });
  }
  globalThis.ResizeObserver = class {
    observe() { /* nothing to watch in a stub */ }
    disconnect() { /* nothing to release */ }
    unobserve() { /* nothing to release */ }
  } as unknown as typeof ResizeObserver;
  vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => { cb(0); return 1; });
  vi.stubGlobal('cancelAnimationFrame', () => undefined);
});

afterEach(() => { painted = []; cleanup(); });

const NODES = [
  { id: 'standard', label: 'ECOA-0a', kind: 'standard' },
  { id: 'document', label: 'Friction Register', kind: 'document' },
  { id: 'decision', label: 'Which controls apply', kind: 'decision' },
];
const LINKS = [
  { source: 'document', target: 'standard', label: 'built against' },
  { source: 'decision', target: 'document', label: 'governs' },
];

describe('an edge says what it means', () => {
  it('paints the relation when a reader is asking about one node', () => {
    render(
      <KnowledgeGraph nodes={NODES} links={LINKS} caption="The record" selected="document" />,
    );
    // Both of the focused node's edges, each with its own word.
    expect(painted).toContain('built against');
    expect(painted).toContain('governs');
  });

  it('stays quiet when nothing is selected', () => {
    // Labelling every edge at once is unreadable at any zoom a whole corpus fits in, and the
    // moment somebody wants the word is the moment they are looking at one thing.
    render(<KnowledgeGraph nodes={NODES} links={LINKS} caption="The record" />);
    expect(painted).not.toContain('built against');
    expect(painted).not.toContain('governs');
  });

  it('paints nothing for an edge carrying no label', () => {
    // A bare edge is still a legitimate edge. `undefined` must not print.
    render(
      <KnowledgeGraph
        nodes={NODES}
        links={[{ source: 'document', target: 'standard' }]}
        caption="The record"
        selected="document"
      />,
    );
    // NOT `painted.join('|')`. `Array.prototype.join` renders `undefined` as an EMPTY STRING, so
    // a canvas being handed `undefined` produced a joined string containing no "undefined" at all
    // — the guard passed with the check for a missing label removed.
    expect(painted.filter((t) => t === undefined || t === 'undefined')).toEqual([]);
  });

  it('reads the right label when an earlier link was dropped', () => {
    // `pairs` skips links whose endpoints are missing, so the FIRST edge here came from the
    // SECOND link. Indexing labels by edge slot picks 'built against' — a relation that is not
    // what this edge is — and does it silently, on exactly the graph this product draws.
    render(
      <KnowledgeGraph
        nodes={NODES}
        links={[
          { source: 'document', target: 'nowhere', label: 'built against' },
          { source: 'decision', target: 'document', label: 'governs' }
        ]}
        caption="The record"
        selected="document"
      />,
    );
    expect(painted).toContain('governs');
    expect(painted, 'the edge is labelled from the link that was dropped').not.toContain(
      'built against',
    );
  });

  it('keeps an edge attached to the link it came from', () => {
    // `pairs` DROPS links whose endpoints are missing, so the nth edge is not the nth link. An
    // index read straight off the edge slot picks the wrong label — silently, and only on a graph
    // that has a dangling reference in it, which is precisely the graph this product draws.
    const L = createLayout(
      NODES,
      [
        { source: 'document', target: 'nowhere', label: 'built against' },
        { source: 'decision', target: 'document', label: 'governs' },
      ],
      1200,
      760,
    );
    expect(L.edges.length / 2, 'the dangling link was kept').toBe(1);
    expect(L.edgeLink[0], 'the surviving edge points at the wrong link').toBe(1);
  });
});
