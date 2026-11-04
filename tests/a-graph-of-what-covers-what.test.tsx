// @vitest-environment jsdom
import { useState } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  LayeredGraph, Tag, edgePath, layoutGraph, uncoveredIds,
  type LayeredEdge, type LayeredLayer,
} from '../packages/ui/src/index.js';
import { expectNoA11yViolations } from './a11y.js';

afterEach(cleanup);

const CSS = readFileSync(join(__dirname, '..', 'design', 'styles.css'), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');

/** The delivery record's plan: requirements by capability, milestones in sequence, the statement of work. */
const LAYERS: LayeredLayer[] = [
  {
    id: 'requirements', label: 'Requirements by capability', coverable: true, width: 54,
    groups: [
      { label: 'Reporting', nodes: [
        { id: 'REQ-1', code: 'REQ-1', label: 'Export the trial balance' },
        { id: 'REQ-2', code: 'REQ-2', label: 'Reconcile intercompany' },
      ] },
      { label: 'Access', nodes: [{ id: 'REQ-3', code: 'REQ-3', label: 'Single sign-on' }] },
    ],
  },
  {
    id: 'milestones', label: 'Milestones in sequence', ordered: true, width: 36,
    nodes: [
      { id: 'm1', code: 'M1', label: 'Discovery' },
      { id: 'm2', code: 'M2', label: 'Build the close' },
      { id: 'sow', label: 'Statement of work', variant: 'terminal', meta: <Tag variant="neutral">not drafted</Tag> },
    ],
  },
];
const EDGES: LayeredEdge[] = [
  { from: 'REQ-1', to: 'm1' },
  { from: 'REQ-1', to: 'm2' },
  { from: 'REQ-3', to: 'm2' },
  { from: 'm1', to: 'm2', kind: 'sequence' },
  { from: 'm2', to: 'sow', kind: 'sequence' },
];

describe('the layout', () => {
  it('finds what nothing covers, in the coverable layers only', () => {
    expect(uncoveredIds(LAYERS, EDGES)).toEqual(['REQ-2']);
  });

  it('shares the width by weight, with a gutter between layers for the lines', () => {
    const l = layoutGraph(LAYERS, EDGES);
    expect(l.layers.map((x) => [Math.round(x.x0), Math.round(x.x1)])).toEqual([[0, 54], [64, 100]]);
  });

  it('stacks a grouped layer from the top and spreads a short sequence down its height', () => {
    const l = layoutGraph(LAYERS, EDGES);
    const [reqs, ms] = l.layers;
    expect(reqs!.heads.map((h) => h.y)).toEqual([0, 94]);
    expect(reqs!.nodes.map((n) => n.y)).toEqual([34, 64, 128]);
    // Three nodes, four even gaps: the last one ends where the drawing does, less one gap.
    const gaps = ms!.nodes.map((n, i) => n.y - (i ? ms!.nodes[i - 1]!.y + ms!.nodes[i - 1]!.h : 0));
    expect(new Set(gaps.map((g) => g.toFixed(2))).size).toBe(1);
    expect(l.height).toBeGreaterThanOrEqual(58 * 2 + 44 + 4 * 12);
  });

  it('curves a link from one layer to the next, and runs a sequence down the middle of its layer', () => {
    const l = layoutGraph(LAYERS, EDGES);
    expect(edgePath(l, EDGES[0]!)).toMatch(/^M 54 46 C 59 46, 59 [\d.]+, 64 [\d.]+$/);
    expect(edgePath(l, EDGES[3]!)).toMatch(/^M 82 [\d.]+ L 82 [\d.]+$/);
    expect(edgePath(l, { from: 'REQ-1', to: 'nowhere' })).toBeNull();
  });
});

describe('the graph', () => {
  it('is lists of real buttons; the lines are a drawing nobody is read', () => {
    const { container } = render(<LayeredGraph aria-label="Plan" layers={LAYERS} edges={EDGES} />);
    expect(container.querySelector('svg.layered-graph-edges')).toHaveAttribute('aria-hidden', 'true');
    expect(container.querySelectorAll('svg path')).toHaveLength(5);
    const reqs = screen.getByRole('list', { name: 'Requirements by capability' });
    expect(reqs.tagName).toBe('UL');
    expect(within(reqs).getByRole('list', { name: 'Reporting' })).toBeInTheDocument();
    expect(screen.getByRole('list', { name: 'Milestones in sequence' }).tagName).toBe('OL');
  });

  it('names each node with what covers it', () => {
    render(<LayeredGraph aria-label="Plan" layers={LAYERS} edges={EDGES} />);
    expect(screen.getByRole('button', { name: 'REQ-1: Export the trial balance. In Discovery, Build the close.' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'REQ-2: Reconcile intercompany. Not covered.' })).toHaveAttribute('data-uncovered', 'true');
    expect(screen.getByRole('button', { name: 'M2: Build the close. Covers 2.' })).toBeInTheDocument();
  });

  it('counts the uncovered in the layer’s head and in the group’s', () => {
    const { container } = render(<LayeredGraph aria-label="Plan" layers={LAYERS} edges={EDGES} />);
    expect(container.querySelector('.layered-graph-head')).toHaveTextContent('1 uncovered');
    const heads = container.querySelectorAll('.layered-graph-group-head');
    expect(heads[0]).toHaveTextContent('Reporting1 uncovered');
    expect(heads[1]).not.toHaveTextContent('uncovered');
  });

  it('says on a phone, in words, what the lines say', () => {
    const { container } = render(<LayeredGraph aria-label="Plan" layers={LAYERS} edges={EDGES} />);
    const lines = [...container.querySelectorAll('.layered-graph-links')].map((el) => el.textContent);
    expect(lines.slice(0, 3)).toEqual(['In M1, M2', 'Not covered', 'In M2']);
    expect(CSS).toMatch(/@container layered-graph \(min-width: 30rem\)/);
    expect(CSS).toMatch(/\.layered-graph-links \{ display: none; \}/);
  });

  it('opens a node on a click, and marks the open one pressed with its lines lit', () => {
    const open = vi.fn();
    const { container } = render(<LayeredGraph aria-label="Plan" layers={LAYERS} edges={EDGES} selected="m1" onNodeOpen={open} />);
    fireEvent.click(screen.getByRole('button', { name: /^M2:/ }));
    expect(open).toHaveBeenCalledWith('m2');
    expect(screen.getByRole('button', { name: /^M1:/ })).toHaveAttribute('aria-pressed', 'true');
    expect(container.querySelectorAll('path[data-lit]')).toHaveLength(1);
  });

  it('lights a node’s lines while it is hovered or focused', () => {
    const { container } = render(<LayeredGraph aria-label="Plan" layers={LAYERS} edges={EDGES} />);
    fireEvent.focus(screen.getByRole('button', { name: /^REQ-1:/ }));
    expect(container.querySelectorAll('path[data-lit]')).toHaveLength(2);
    // The lit lines are drawn last, so nothing unlit crosses over them.
    const paths = [...container.querySelectorAll('path')];
    expect(paths.slice(-2).every((p) => p.hasAttribute('data-lit'))).toBe(true);
  });

  it('assigns by dragging a node onto one in the next layer — never onto the terminal one', () => {
    const assign = vi.fn();
    render(<LayeredGraph aria-label="Plan" layers={LAYERS} edges={EDGES} onAssign={assign} />);
    const req = screen.getByRole('button', { name: /^REQ-2:/ });
    expect(req).toHaveAttribute('draggable', 'true');
    const data = new Map<string, string>();
    const dataTransfer = { setData: (k: string, v: string) => data.set(k, v), getData: (k: string) => data.get(k) ?? '', effectAllowed: '', dropEffect: '' };
    fireEvent.dragStart(req, { dataTransfer });
    const m2 = screen.getByRole('button', { name: /^M2:/ });
    fireEvent.dragOver(m2, { dataTransfer });
    expect(m2).toHaveAttribute('data-over', 'true');
    fireEvent.drop(m2, { dataTransfer });
    expect(assign).toHaveBeenCalledWith('REQ-2', 'm2');
    expect(screen.getByRole('button', { name: /^Statement of work/ })).not.toHaveAttribute('data-droppable');
  });

  it('gives dragging a keyboard twin: A picks up, Enter puts down, each step said aloud', async () => {
    const u = userEvent.setup();
    const assign = vi.fn();
    const { container } = render(<LayeredGraph aria-label="Plan" layers={LAYERS} edges={EDGES} onAssign={assign} />);
    const req = screen.getByRole('button', { name: /^REQ-2:/ });
    expect(req).toHaveAccessibleDescription(/Press A to pick up/);
    req.focus();
    await u.keyboard('a');
    const said = container.querySelector('[aria-live="polite"]')!;
    expect(said).toHaveTextContent('REQ-2 picked up. Choose in Milestones in sequence and press Enter');
    expect(screen.getByRole('button', { name: /^M1:/ })).toHaveFocus();
    expect(screen.getByRole('button', { name: /^M1:/ })).toHaveAttribute('data-target', 'true');
    await u.keyboard('{ArrowDown}');
    screen.getByRole('button', { name: /^M2:/ }).focus();
    await u.keyboard('{Enter}');
    expect(assign).toHaveBeenCalledWith('REQ-2', 'm2');
    expect(said).toHaveTextContent('REQ-2 put in M2.');
    expect(req).toHaveFocus();
  });

  it('puts a picked-up node back on Escape, and does not open what it lands on', async () => {
    const u = userEvent.setup();
    const assign = vi.fn();
    const open = vi.fn();
    const { container } = render(<LayeredGraph aria-label="Plan" layers={LAYERS} edges={EDGES} onAssign={assign} onNodeOpen={open} />);
    const req = screen.getByRole('button', { name: /^REQ-1:/ });
    req.focus();
    await u.keyboard('a');
    await u.keyboard('{Escape}');
    expect(container.querySelector('[aria-live="polite"]')).toHaveTextContent('REQ-1 put back.');
    expect(req).toHaveFocus();
    expect(container.querySelector('[data-target]')).toBeNull();
    expect(assign).not.toHaveBeenCalled();
    expect(open).not.toHaveBeenCalled();
  });

  it('offers neither the drag nor the pick-up to a reader who can only read', () => {
    render(<LayeredGraph aria-label="Plan" layers={LAYERS} edges={EDGES} onAssign={() => {}} readOnly />);
    const req = screen.getByRole('button', { name: /^REQ-1:/ });
    expect(req).not.toHaveAttribute('draggable');
    expect(req).not.toHaveAccessibleDescription();
  });

  it('brings the uncovered forward on request, or any ids it is given', () => {
    const { container, rerender } = render(<LayeredGraph aria-label="Plan" layers={LAYERS} edges={EDGES} highlight="uncovered" />);
    expect(container.querySelector('.layered-graph')).toHaveAttribute('data-highlight', 'true');
    expect([...container.querySelectorAll('[data-highlighted]')].map((b) => b.getAttribute('aria-label')?.split(':')[0]))
      .toEqual(['REQ-2']);
    rerender(<LayeredGraph aria-label="Plan" layers={LAYERS} edges={EDGES} highlight={['m1', 'REQ-3']} />);
    expect(container.querySelectorAll('[data-highlighted]')).toHaveLength(2);
  });

  it('says what the caller says, when the caller has its own words', () => {
    render(<LayeredGraph aria-label="Plan" layers={LAYERS} edges={EDGES}
      describe={(n, l) => (l.uncovered ? 'Not in any milestone.' : l.covers.length ? `Covers ${l.covers.length} requirements.` : '')} />);
    expect(screen.getByRole('button', { name: 'REQ-2: Reconcile intercompany. Not in any milestone.' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'M2: Build the close. Covers 2 requirements.' })).toBeInTheDocument();
  });

  it('keeps working when its parent holds the edges and adds one', () => {
    function Plan() {
      const [edges, setEdges] = useState(EDGES);
      return <LayeredGraph aria-label="Plan" layers={LAYERS} edges={edges}
        onAssign={(from, to) => setEdges((e) => [...e, { from, to }])} />;
    }
    const { container } = render(<Plan />);
    const data = new Map<string, string>();
    const dataTransfer = { setData: (k: string, v: string) => data.set(k, v), getData: (k: string) => data.get(k) ?? '' };
    fireEvent.dragStart(screen.getByRole('button', { name: /^REQ-2:/ }), { dataTransfer });
    fireEvent.drop(screen.getByRole('button', { name: /^M1:/ }), { dataTransfer });
    expect(screen.getByRole('button', { name: 'REQ-2: Reconcile intercompany. In Discovery.' })).not.toHaveAttribute('data-uncovered');
    expect(container.querySelector('.layered-graph-head')).not.toHaveTextContent('uncovered');
  });

  it('shows what it is given when there is nothing to draw', () => {
    render(<LayeredGraph aria-label="Plan" layers={[{ id: 'a', label: 'A', nodes: [] }]} edges={[]} empty={<p>No requirements yet.</p>} />);
    expect(screen.getByText('No requirements yet.')).toBeInTheDocument();
  });

  it('passes axe', async () => {
    const { container } = render(<LayeredGraph aria-label="Plan" layers={LAYERS} edges={EDGES} selected="m1" onAssign={() => {}} highlight="uncovered" />);
    await expectNoA11yViolations(container);
  });
});
