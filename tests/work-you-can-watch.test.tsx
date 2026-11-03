// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen, within } from '@testing-library/react';
import {
  AGENT_LANES, Lanes, LiveIndicator, LiveMark, LiveProgress, LiveSection, Pulse, liveWhere,
} from '../packages/ui/src/index.js';
import type { LaneItem } from '../packages/ui/src/index.js';
import { expectNoA11yViolations } from './a11y.js';

/**
 * Work happening now, drawn where the work is: a pulse, its words, a row's progress, a section
 * being written, and the agents as lanes. Motion is never the only signal, and never required.
 */
afterEach(() => { cleanup(); vi.restoreAllMocks(); });

const RUN: LaneItem[] = [
  { id: 'risk', label: 'Risk scorer', lane: 'waiting' },
  { id: 'milestone', label: 'Milestone writer', lane: 'running' },
  { id: 'theme', label: 'Theme finder', lane: 'running' },
  { id: 'transcript', label: 'Transcript reader', lane: 'done', detail: '14 transcripts' },
];

const lane = (name: RegExp) => screen.getByRole('region', { name });

describe('a pulse and its words', () => {
  it('keeps the pulse out of the accessibility tree', () => {
    const { container } = render(<Pulse tone="success" />);
    const dot = container.querySelector('.live-pulse')!;
    expect(dot).toHaveAttribute('aria-hidden', 'true');
    expect(dot).toHaveAttribute('data-tone', 'success');
  });

  it('says the state politely, and stills the pulse once it has stopped', () => {
    const { container, rerender } = render(<LiveIndicator label="Run Starting" />);
    expect(screen.getByRole('status')).toHaveTextContent('Run Starting');
    rerender(<LiveIndicator label="New Versions" tone="success" active={false} />);
    expect(screen.getByRole('status')).toHaveTextContent('New Versions');
    expect(container.querySelector('.live-pulse')).toHaveAttribute('data-still');
  });

  it('can keep its words for assistive tech only', () => {
    render(<LiveIndicator label="Agents Working" hideLabel />);
    expect(screen.getByText('Agents Working')).toHaveClass('sr-only');
  });
});

describe("a section's mark and the section", () => {
  it('draws nothing for a section the run is not touching', () => {
    const { container } = render(<LiveMark state={undefined} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('says each state in words, and the words can be the caller’s', () => {
    const { rerender } = render(<LiveMark state="writing" />);
    expect(screen.getByText('Writing Now')).toHaveClass('tag-accent');
    rerender(<LiveMark state="written" labels={{ written: 'New Version' }} />);
    expect(screen.getByText('New Version')).toHaveClass('tag-success');
  });

  it('is busy while being written, so half a paragraph is not read as finished', () => {
    const { rerender } = render(<LiveSection live="writing" aria-label="§2.5 Account Hierarchy"><p>…</p></LiveSection>);
    const section = screen.getByRole('region', { name: '§2.5 Account Hierarchy' });
    expect(section).toHaveAttribute('aria-busy', 'true');
    expect(section).toHaveAttribute('data-live', 'writing');
    rerender(<LiveSection live="written" aria-label="§2.5 Account Hierarchy"><p>…</p></LiveSection>);
    expect(section).not.toHaveAttribute('aria-busy');
  });

  it('writes where the work is in a few characters', () => {
    expect(liveWhere([])).toBe('');
    expect(liveWhere(['2.5'])).toBe('§2.5');
    expect(liveWhere(['2.5', '2.6', '3.1'])).toBe('§2.5 +2');
  });
});

describe("a row's live progress", () => {
  it('names the bar with how far it has got', () => {
    render(<LiveProgress state="active" where="§2.5 +1" value={4} max={6} noun="sections" />);
    const bar = screen.getByRole('progressbar', { name: '4 of 6 sections done' });
    expect(bar).toHaveAttribute('aria-valuenow', '67');
    expect(screen.getByText('§2.5 +1')).toBeInTheDocument();
    expect(screen.getByText('4/6')).toBeInTheDocument();
  });

  it('is indeterminate when nobody knows how far', () => {
    render(<LiveProgress state="active" where="Rewriting" noun="sections" />);
    expect(screen.getByRole('progressbar')).not.toHaveAttribute('aria-valuenow');
  });

  it('says queued, done and stopped in words, with no bar', () => {
    const { rerender } = render(<LiveProgress state="queued" max={9} noun="sections" />);
    expect(screen.getByText('Queued')).toBeInTheDocument();
    expect(screen.getByText('9 sections')).toBeInTheDocument();
    rerender(<LiveProgress state="done" labels={{ done: 'New Version' }} />);
    expect(screen.getByText('New Version')).toBeInTheDocument();
    expect(screen.queryByRole('progressbar')).toBeNull();
    rerender(<LiveProgress state="failed" value={3} max={8} />);
    expect(screen.getByText('Stopped')).toBeInTheDocument();
  });
});

describe('lanes', () => {
  it('shows waiting and working while the run is going, and the exceptions only when occupied', () => {
    render(<Lanes items={RUN} aria-label="Agents in this run" />);
    expect(lane(/Waiting/)).toBeInTheDocument();
    expect(lane(/Working/)).toBeInTheDocument();
    expect(lane(/Done/)).toBeInTheDocument();
    expect(screen.queryByRole('region', { name: /Stopped/ })).toBeNull();
    expect(within(lane(/Working/)).getAllByRole('listitem')).toHaveLength(2);
    expect(within(lane(/Done/)).getByText('14 transcripts')).toBeInTheDocument();
  });

  it('drops the going lanes once the run is over, keeping Done', () => {
    render(<Lanes items={RUN.map((i) => ({ ...i, lane: 'done' }))} aria-label="Agents" />);
    expect(screen.queryByRole('region', { name: /Waiting/ })).toBeNull();
    expect(within(lane(/Done/)).getAllByRole('listitem')).toHaveLength(4);
  });

  it('counts the rest of a long lane, keeping the next of a queue and the latest of the finished', () => {
    const many: LaneItem[] = [
      ...Array.from({ length: 8 }, (_, i) => ({ id: `w${i}`, label: `Queued ${i}`, lane: 'waiting' })),
      ...Array.from({ length: 22 }, (_, i) => ({ id: `d${i}`, label: `Finished ${i}`, lane: 'done' })),
    ];
    render(<Lanes items={many} max={6} aria-label="Agents" />);
    const done = within(lane(/Done/));
    expect(done.getByText('+16')).toBeInTheDocument();
    expect(done.getByText('Finished 21')).toBeInTheDocument();
    expect(done.queryByText('Finished 0')).toBeNull();
    const waiting = within(lane(/Waiting/));
    expect(waiting.getByText('Queued 0')).toBeInTheDocument();
    expect(waiting.queryByText('Queued 7')).toBeNull();
    expect(waiting.getByText('+2')).toHaveTextContent('+2 more');
  });

  it('says an arrival in a finished lane, once, politely', () => {
    const { container, rerender } = render(<Lanes items={RUN} aria-label="Agents" />);
    const live = container.querySelector('[aria-live="polite"]')!;
    expect(live).toHaveTextContent('');
    rerender(<Lanes items={RUN.map((i) => (i.id === 'theme' ? { ...i, lane: 'done' } : i))} aria-label="Agents" />);
    expect(live).toHaveTextContent('Theme finder: Done');
  });

  it('slides a pill that changes lane, and does not under reduced motion', () => {
    const animate = vi.fn();
    (Element.prototype as unknown as { animate: unknown }).animate = animate;
    let n = 0;
    vi.spyOn(Element.prototype, 'getBoundingClientRect').mockImplementation(() => {
      n += 40;
      return { left: n, top: n, right: n, bottom: n, width: 10, height: 10, x: n, y: n, toJSON() {} } as DOMRect;
    });
    const media = (reduce: boolean) => vi.spyOn(window, 'matchMedia').mockImplementation(
      (q: string) => ({ matches: reduce && q.includes('reduce'), media: q } as MediaQueryList));

    media(false);
    const { rerender } = render(<Lanes items={RUN} aria-label="Agents" />);
    rerender(<Lanes items={RUN.map((i) => (i.id === 'theme' ? { ...i, lane: 'done' } : i))} aria-label="Agents" />);
    expect(animate).toHaveBeenCalled();

    animate.mockClear();
    media(true);
    rerender(<Lanes items={RUN.map((i) => (i.id === 'milestone' ? { ...i, lane: 'done' } : i))} aria-label="Agents" />);
    expect(animate).not.toHaveBeenCalled();
    delete (Element.prototype as unknown as { animate?: unknown }).animate;
  });

  it('is busy before the first answer, and says when there is nothing', () => {
    const { rerender } = render(<Lanes items={[]} loading aria-label="Agents" />);
    expect(screen.getByRole('group', { name: 'Agents' })).toHaveAttribute('aria-busy', 'true');
    rerender(<Lanes items={[]} aria-label="Agents" empty="No run has started on this project." />);
    expect(screen.getByText('No run has started on this project.')).toBeInTheDocument();
  });

  it('ships the agent lanes in the record’s words', () => {
    expect(AGENT_LANES.map((l) => l.label)).toEqual(['Waiting', 'Working', 'Done', 'Stopped', 'Skipped']);
  });

  it('passes axe', async () => {
    const { container } = render(
      <main>
        <LiveIndicator label="Agents Working" />
        <Lanes items={[...RUN, { id: 'cite', label: 'Citation checker', lane: 'failed' }]} max={2} aria-label="Agents" />
        <LiveProgress state="active" where="§2.5" value={4} max={6} noun="sections" />
        <LiveSection live="writing" aria-label="§2.5 Account Hierarchy">
          <h2>§2.5 Account Hierarchy <LiveMark state="writing" /></h2><p>Three hierarchies are in use.</p>
        </LiveSection>
      </main>,
    );
    await expectNoA11yViolations(container);
  });
});
