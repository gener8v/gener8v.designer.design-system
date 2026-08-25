import { describe, expect, it, beforeAll, afterEach, vi } from 'vitest';
import { render, cleanup } from '@testing-library/react';
import { KnowledgeGraph } from '../packages/ui/src/index.js';

/**
 * The graph draws once and stops, so it has to notice its own box changing.
 *
 * The simulation runs until it settles and then cancels itself. After that, only a WINDOW resize
 * re-fitted anything — so a canvas whose size arrives late kept whatever scale it was given while
 * it had none, and a canvas that was remounted was never sized at all: `draw` writes the backing
 * store from `clientWidth`, and a fresh canvas starts at the HTML default of 300×150.
 *
 * A consumer hit both. Forty-five nodes, a correctly-sized element, and 849 painted pixels out of
 * 428,048 — then, after toggling to the paired list and back, a 300×150 canvas with nothing on it.
 *
 * WHAT IS STUBBED AND WHY
 *
 * jsdom has no 2d context and does no layout, so `getContext` and `clientWidth` are both faked.
 * That is honest here: the fix is about WHEN the canvas is measured and redrawn, not about what
 * gets painted. What it is painted with is the browser's business and was checked there.
 */

let box = { w: 800, h: 500 };
const observed: Element[] = [];
let fire: (() => void) | undefined;

beforeAll(() => {
  const ctx = new Proxy({}, { get: () => () => undefined }) as CanvasRenderingContext2D;
  HTMLCanvasElement.prototype.getContext = (() => ctx) as HTMLCanvasElement['getContext'];
  for (const [prop, read] of [['clientWidth', () => box.w], ['clientHeight', () => box.h]] as const) {
    Object.defineProperty(HTMLCanvasElement.prototype, prop, { get: read, configurable: true });
  }
  globalThis.ResizeObserver = class {
    constructor(cb: () => void) { fire = cb; }
    observe(el: Element) { observed.push(el); }
    disconnect() { /* nothing to release in a stub */ }
    unobserve() { /* nothing to release in a stub */ }
  } as unknown as typeof ResizeObserver;
  // The layout loop runs on rAF; settle it synchronously so a test does not wait on frames.
  vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => { cb(0); return 1; });
  vi.stubGlobal('cancelAnimationFrame', () => undefined);
});

afterEach(() => { observed.length = 0; cleanup(); });

const NODES = [{ id: 'a', label: 'A' }, { id: 'b', label: 'B' }];
const LINKS = [{ source: 'a', target: 'b' }];

describe('a graph that has stopped drawing', () => {
  it('watches its own canvas, not only the window', () => {
    const { container } = render(<KnowledgeGraph caption="c" nodes={NODES} links={LINKS} />);

    expect(observed).toContain(container.querySelector('.graph-canvas'));
  });

  it('re-sizes its backing store when the box changes after it settled', () => {
    // The failure this exists for: the element gets its real size after first paint — a tab panel
    // becoming visible — and nothing ever measures again.
    box = { w: 300, h: 150 };
    const { container } = render(<KnowledgeGraph caption="c" nodes={NODES} links={LINKS} />);
    const canvas = container.querySelector('canvas')!;
    const before = canvas.width;

    box = { w: 900, h: 600 };
    fire?.();

    expect(before).toBeLessThan(canvas.width);
    expect(canvas.width).toBeGreaterThanOrEqual(900);
  });
});
