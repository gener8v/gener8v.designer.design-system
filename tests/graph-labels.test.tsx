import { describe, expect, it, beforeAll, afterEach, vi } from 'vitest';
import { render, cleanup } from '@testing-library/react';
import { KnowledgeGraph } from '../packages/ui/src/index.js';

/**
 * What the graph says when nothing is a hub.
 *
 * `labelDegreeThreshold` exists so a 500-node graph does not paint 500 overlapping labels: only
 * hubs are named until somebody zooms in. Applied to a graph where NO node reaches the threshold,
 * the same rule silences every label — and a record whose links have not been computed yet is
 * exactly that graph.
 *
 * A consumer hit it: six named nodes, no edges, rendered as six unlabelled dots with nothing on
 * screen to suggest they had names at all.
 *
 * WHAT IS STUBBED AND WHY
 *
 * jsdom has no 2d context, so this one records what was painted. That is honest for the question
 * asked — WHICH labels the draw loop decided to paint — and says nothing about how they look,
 * which was checked in a browser.
 */

let painted: string[] = [];
/** The canvas box, which decides the fit — and the fit decides whether zoom alone shows every
 *  label. A spec about the DEGREE rule has to keep the zoom rule out of the way. */
let box = { w: 900, h: 600 };

beforeAll(() => {
  // `painted` is ONE FRAME's labels, not every frame's. The simulation ticks and redraws many
  // times per render, so an accumulating list counts the same label once per frame and no
  // assertion about how many fit could ever be written. Each draw begins by clearing the canvas,
  // which is the frame boundary.
  const ctx = new Proxy({}, {
    get: (_t, prop) => {
      if (prop === 'fillText') return (text: string) => { painted.push(text); };
      if (prop === 'clearRect') return () => { painted.length = 0; };
      return () => undefined;
    },
  }) as unknown as CanvasRenderingContext2D;
  HTMLCanvasElement.prototype.getContext = (() => ctx) as HTMLCanvasElement['getContext'];
  for (const [prop, read] of [['clientWidth', () => box.w], ['clientHeight', () => box.h]] as const) {
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

afterEach(() => { painted = []; box = { w: 900, h: 600 }; cleanup(); });

/** The record that hit this: five deliverables and a decision, and no computed links between
 *  them. Nothing is a hub because nothing is anything. */
const LOOSE = [
  'Dependency Current State', 'Friction Register', 'Persona Inventory',
  'Strategic Roadmap', 'System Map', 'Replace the CRM or upgrade it?',
].map((label, i) => ({ id: `n${i}`, label }));

describe('a graph where nothing is a hub', () => {
  it('names its nodes rather than drawing anonymous dots', () => {
    // The panel the consumer had, near enough: with no links the simulation has nothing pulling
    // the nodes together, so they spread and the fit lands at a zoom BELOW the 1.25 that would
    // have shown every label on its own. Every degree is 0, nothing clears the threshold, and the
    // old rule left six named nodes as six anonymous dots.
    box = { w: 890, h: 450 };
    render(<KnowledgeGraph caption="The record" nodes={LOOSE} links={[]} />);

    for (const node of LOOSE) expect(painted).toContain(node.label);
  });

  it('still keeps the quiet nodes quiet once there is a hub to prefer', () => {
    // The threshold is doing its job here and must go on doing it: a graph with a real hub says
    // the hub's name and leaves the rest until somebody zooms or hovers.
    //
    // Zoomed OUT, because the fit zooms a small graph past 1.25 and that rule shows every label on
    // its own — which would make this pass whatever the degree rule did.
    box = { w: 240, h: 180 };
    const spokes = Array.from({ length: 30 }, (_, i) => ({ id: `s${i}`, label: `Spoke ${i}` }));
    const nodes = [{ id: 'hub', label: 'Hub' }, ...spokes];
    const links = spokes.map((n) => ({ source: 'hub', target: n.id }));

    render(<KnowledgeGraph caption="The record" nodes={nodes} links={links} />);

    expect(painted).toContain('Hub');
    expect(painted).not.toContain('Spoke 7');
  });
});

describe('a graph with more names than room', () => {
  /** Enough nodes in a small box that the layout cannot keep their labels apart. */
  const CROWD = Array.from({ length: 40 }, (_, i) => ({
    id: `n${i}`,
    label: `A reasonably long deliverable name ${i}`,
  }));

  it('drops the labels that would land on top of another', () => {
    // The fix above turns every label on when nothing is a hub, which is right — and in a sparse
    // graph is also dense: with no links there is nothing pulling nodes together, so the layout
    // spreads them evenly and forty names land on each other. Naming everything and naming nothing
    // are the same result if the names cannot be read.
    box = { w: 420, h: 300 };

    render(<KnowledgeGraph caption="The record" nodes={CROWD} links={[]} />);

    expect(painted.length).toBeGreaterThan(0);
    expect(painted.length).toBeLessThan(CROWD.length);
  });

  // WHAT IS NOT GUARDED HERE, AND WHY
  //
  // The ORDER labels are placed in — focused node, then by degree — is not separately specified.
  // Ordering only decides when several eligible labels collide, and which pair collides is the
  // simulation's business: every spec that isolated it turned out to pass with the ordering removed
  // (the degree threshold had already silenced the competition) or to depend on where the layout
  // happened to put two nodes. A spec asserting positions would be asserting the simulation rather
  // than the rule, and a spec that passes with the rule deleted guards nothing.
  //
  // So the rule stands on the check above — some labels are dropped — and on being read.
});
