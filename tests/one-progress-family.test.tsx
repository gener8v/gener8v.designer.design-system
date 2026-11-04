import { describe, expect, it, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { readFileSync } from 'node:fs';
import { expectNoA11yViolations } from './a11y.js';
import {
  Progress, ProgressRing, ProgressMark, ProgressGlyph, SegmentedProgress, ProgressList, FileList,
  FileProgress, Stepper, Step, Lanes, LiveMark, Spinner,
} from '../packages/ui/src/index.js';

/**
 * ONE PROGRESS FAMILY.
 *
 * The bar, the ring, the spinner, the stepper, a row's live bar, a segmented bar, a checklist and a
 * file row were drawn five different ways: three ticks, five track colours, three stroke rules, and
 * a stepper tick that sat 9.7px under its marker's centre. These tests hold the contract they now
 * share — the ARIA, the six states and the one glyph source — and the stylesheet rules that make
 * the centring structural rather than tuned.
 */
afterEach(cleanup);

const css = readFileSync('design/styles.css', 'utf8');

describe('a linear progress', () => {
  it('is a named progressbar with its value, and the visible label names it', () => {
    render(<Progress label="Importing evidence" value={62} helper="128 of 206 files" />);
    const bar = screen.getByRole('progressbar', { name: 'Importing evidence' });
    expect(bar).toHaveAttribute('aria-valuenow', '62');
    expect(bar).toHaveAttribute('aria-valuemin', '0');
    expect(bar).toHaveAttribute('aria-valuemax', '100');
    expect(bar).toHaveAccessibleDescription('128 of 206 files');
    expect(screen.getByText('62%')).toHaveClass('progress-value');
  });

  it('reports a count out of max, and says it in words', () => {
    render(<Progress label="Controls" value={14} max={20} valueLabel="14/20" />);
    const bar = screen.getByRole('progressbar', { name: 'Controls' });
    expect(bar).toHaveAttribute('aria-valuemax', '20');
    expect(bar).toHaveAttribute('aria-valuetext', '14 of 20');
  });

  it('carries no value at all when indeterminate, so it is never read as stuck', () => {
    render(<Progress aria-label="Working" />);
    const bar = screen.getByRole('progressbar', { name: 'Working' });
    expect(bar).not.toHaveAttribute('aria-valuenow');
    expect(bar).toHaveClass('progress-indeterminate');
  });

  it('takes a size and a tone, and a bare bar keeps the old markup', () => {
    const { container } = render(<Progress value={40} size="sm" tone="danger" aria-label="Upload" />);
    const bar = container.querySelector('.progress')!;
    expect(bar).toHaveClass('progress-sm');
    expect(bar).toHaveAttribute('data-tone', 'danger');
    expect(bar.parentElement).toBe(container);
  });
});

describe('a circular progress', () => {
  it('puts the value inside from 48px, and beside the ring below that', () => {
    const { rerender } = render(<ProgressRing value={62} aria-label="Coverage" />);
    expect(screen.getByRole('progressbar', { name: 'Coverage' })).toHaveTextContent('62%');
    rerender(<ProgressRing size="sm" value={62} label="Coverage" />);
    const ring = screen.getByRole('progressbar', { name: 'Coverage' });
    expect(ring).toHaveTextContent('');
    expect(screen.getByText('62%')).toHaveClass('progress-value');
  });

  it('holds an icon or nothing when told to, and spins without a value', () => {
    const { container, rerender } = render(
      <ProgressRing value={100} tone="success" aria-label="Done"><ProgressGlyph glyph="check" /></ProgressRing>);
    expect(container.querySelector('.progress-ring .progress-glyph')).not.toBeNull();
    rerender(<ProgressRing aria-label="Loading" />);
    const ring = screen.getByRole('progressbar', { name: 'Loading' });
    expect(ring).not.toHaveAttribute('aria-valuenow');
    expect(ring).toHaveClass('progress-ring-indeterminate');
  });
});

describe('the six states, one mapping', () => {
  it('draws a mark per state, decoratively', () => {
    const { container } = render(<>
      {(['queued', 'current', 'complete', 'failed', 'stopped', 'skipped'] as const).map((s) =>
        <ProgressMark key={s} state={s} />)}
    </>);
    const marks = [...container.querySelectorAll('.progress-mark')];
    expect(marks.map((m) => m.getAttribute('data-state'))).toEqual(
      ['queued', 'current', 'complete', 'failed', 'stopped', 'skipped']);
    for (const m of marks) expect(m).toHaveAttribute('aria-hidden', 'true');
  });

  it('gives every ended state a glyph in the stylesheet, so none rests on colour', () => {
    for (const state of ['complete', 'failed', 'stopped', 'skipped']) {
      expect(css).toContain(`.progress-mark[data-state="${state}"]::after`);
      expect(css).toContain(`.step[data-state="${state}"] .step-marker::after`);
    }
  });

  it('says a step\'s state in words, and keeps upcoming unstamped', () => {
    const { container } = render(
      <Stepper>
        <Step state="complete" index={1} label="Registered" />
        <Step state="stopped" index={2} label="Repository" description="Paused" />
        <Step state="skipped" index={3} label="Webhook" />
        <Step state="upcoming" index={4} label="Project" />
      </Stepper>);
    const steps = [...container.querySelectorAll('.step')];
    expect(steps.map((s) => s.getAttribute('data-state'))).toEqual(['complete', 'stopped', 'skipped', null]);
    expect(steps[0]).toHaveTextContent('Registered, complete');
    expect(steps[1]).toHaveTextContent('Repository, stopped');
    expect(container.querySelector('.step-description')).toHaveTextContent('Paused');
  });
});

describe('one glyph source', () => {
  it('draws every tick and cross in the live family from the stylesheet, not from SVG or text', () => {
    const { container } = render(<>
      <Lanes aria-label="Agents" items={[
        { id: 'a', label: 'Reader', lane: 'done' }, { id: 'b', label: 'Checker', lane: 'failed' },
        { id: 'c', label: 'Mapper', lane: 'skipped' },
      ]} />
      <LiveMark state="written" />
      <LiveMark state="failed" />
    </>);
    expect(container.querySelectorAll('svg')).toHaveLength(0);
    expect([...container.querySelectorAll('.progress-glyph')].map((g) => g.getAttribute('data-glyph')))
      .toEqual(['check', 'cross', 'minus', 'check', 'cross']);
    expect(container.textContent).not.toMatch(/[✓✔×✕✗]/);
  });

  it('centres a glyph by construction: absolutely placed, auto margins, no translate', () => {
    // The tick used to be a grid item beside an invisible number, which put it in a second row.
    const rule = /\.step-marker::after\s*\{([^}]*)\}/.exec(css)![1];
    expect(rule).toMatch(/position:\s*absolute/);
    expect(rule).toMatch(/inset:\s*0/);
    expect(rule).toMatch(/margin:\s*auto/);
    expect(css).not.toMatch(/translateY\(-0\.053em\)/);
  });
});

describe('a segmented progress', () => {
  it('reports how many finished and says the whole breakdown in words', () => {
    render(<SegmentedProgress label="Evidence checks" total={10} segments={[
      { state: 'complete', value: 6 }, { state: 'failed', value: 1 },
    ]} />);
    const bar = screen.getByRole('progressbar', { name: 'Evidence checks' });
    expect(bar).toHaveAttribute('aria-valuenow', '7');
    expect(bar).toHaveAttribute('aria-valuemax', '10');
    expect(bar).toHaveAttribute('aria-valuetext', '6 done, 1 failed, 3 to go');
    expect(screen.getByText('7 of 10')).toBeInTheDocument();
  });
});

describe('a checklist of work', () => {
  const items = (webhook: 'current' | 'failed' | 'complete') => [
    { id: 'repo', label: 'Connect the repository', state: 'complete' as const },
    { id: 'hook', label: 'Wire the webhook', state: webhook },
    { id: 'prior', label: 'Import last year', state: 'skipped' as const },
  ];

  it('counts what is owed, is busy while a task runs, and names each task\'s state', () => {
    const { container } = render(<ProgressList label="Setting up" items={items('current')} />);
    expect(screen.getByRole('region', { name: 'Setting up' })).toHaveAttribute('aria-busy', 'true');
    expect(screen.getByText('1 of 2')).toBeInTheDocument();
    expect(screen.getByRole('progressbar', { name: 'Setting up' })).toHaveAttribute('aria-valuetext', '1 of 2 done');
    expect(container.querySelector('[aria-current="step"]')).toHaveTextContent('Wire the webhook, In progress');
  });

  it('announces a failure and the end, and nothing in between', () => {
    const { container, rerender } = render(<ProgressList label="Setting up" items={items('current')} />);
    const live = container.querySelector('[aria-live="polite"]')!;
    expect(live).toHaveTextContent('');
    rerender(<ProgressList label="Setting up" items={items('failed')} />);
    expect(live).toHaveTextContent('Wire the webhook: Failed');
    rerender(<ProgressList label="Setting up" items={items('complete')} />);
    expect(live).toHaveTextContent('All 2 done');
  });
});

describe('a file on its way', () => {
  it('is a named bar with a cancel that says what it cancels', () => {
    render(<FileList><FileProgress name="Q3.xlsx" size={2048} state="current" value={50} onCancel={() => {}} /></FileList>);
    expect(screen.getByRole('progressbar', { name: 'Q3.xlsx' })).toHaveAttribute('aria-valuenow', '50');
    expect(screen.getByRole('button', { name: 'Cancel Q3.xlsx' })).toBeInTheDocument();
    expect(screen.getByText('1.0 KB of 2.0 KB')).toBeInTheDocument();
  });

  it('fails with its reason and a retry, and lands without a bar', () => {
    const { rerender, container } = render(<FileList>
      <FileProgress name="Q3.xlsx" state="failed" value={38} error="The connection closed." onRetry={() => {}} />
    </FileList>);
    expect(screen.getByText('The connection closed.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Retry Q3.xlsx' })).toBeInTheDocument();
    expect(container.querySelector('[aria-live]')).toHaveTextContent('Q3.xlsx: Failed');
    rerender(<FileList><FileProgress name="Q3.xlsx" state="complete" /></FileList>);
    expect(screen.queryByRole('progressbar')).toBeNull();
    expect(screen.getByText('Uploaded')).toBeInTheDocument();
  });
});

describe('stacked rows line up', () => {
  it('gives inline bars fixed label and value columns, so stacked bars start and end at one x', () => {
    const rule = /\.progress-inline\s*\{([^}]*)\}/.exec(css)![1];
    expect(rule).toMatch(/display:\s*grid/);
    expect(rule).toContain('var(--progress-label-w');
    expect(rule).toContain('var(--progress-value-w');
  });

  it('renders both action slots in every file row, so a row without Retry keeps the column', () => {
    const { container } = render(<FileList>
      <FileProgress name="a.pdf" state="current" value={10} onCancel={() => {}} />
      <FileProgress name="b.pdf" state="failed" value={10} onRetry={() => {}} onRemove={() => {}} />
    </FileList>);
    for (const row of container.querySelectorAll('.file-progress')) {
      expect(row.querySelectorAll(':scope > .file-progress-slot')).toHaveLength(2);
    }
    expect(css).toMatch(/\.file-list > \.file-progress\s*\{\s*grid-template-columns:\s*subgrid/);
  });

  it('sets a status word in the body face and a figure in the mono', () => {
    const { container } = render(<FileList>
      <FileProgress name="a.pdf" state="current" value={10} />
      <FileProgress name="b.pdf" state="queued" />
    </FileList>);
    const [figure, word] = [...container.querySelectorAll('.progress-value')];
    expect(figure).not.toHaveClass('progress-status');
    expect(word).toHaveClass('progress-status');
  });

  it('gives a ring\'s words one title line, whatever its size', () => {
    const { container } = render(<>
      <ProgressRing size="lg" value={6} max={9} label="Agents" helper="4 min in" />
      <ProgressRing size="sm" value={67} label="Sections" helper="§2.5" />
    </>);
    for (const text of container.querySelectorAll('.progress-ring-text')) {
      expect(text.children[0]).toHaveClass('progress-head');
      expect(text.children).toHaveLength(2);
    }
  });
});

describe('a stepper on a phone', () => {
  it('measures its own width and goes vertical below 30rem, wrapping rather than clipping above', () => {
    expect(css).toMatch(/\.stepper \{[^}]*container: stepper \/ inline-size/);
    expect(css).toMatch(/\.stepper \{[^}]*flex-wrap: wrap/);
    const narrow = /@container stepper \(max-width: 30rem\) \{([\s\S]*?)\n\}/.exec(css)![1];
    expect(narrow).toMatch(/> \.step[^{]*\{[^}]*flex: 1 0 100%/);
    expect(narrow).toMatch(/\.step-connector \{ display: none; \}/);
    // The rail keeps its row and shows the current label whole.
    expect(narrow).toMatch(/\.stepper-rail > \.step\[aria-current="step"\] > \.step-label \{[^}]*max-content/);
  });
});

describe('the family has no axe violations', () => {
  it('in every new and refined form', async () => {
    const { container } = render(<main>
      <Progress label="Import" value={40} helper="Reading" />
      <Progress layout="inline" label="Controls" value={3} max={5} />
      <ProgressRing size="sm" value={30} label="Coverage" helper="Rising" />
      <Spinner label="Loading" />
      <SegmentedProgress aria-label="Checks" segments={[{ state: 'complete', value: 2 }, { state: 'queued', value: 1 }]} />
      <ProgressList label="Setup" items={[{ id: 'a', label: 'One', state: 'current' }]} />
      <FileList><FileProgress name="a.pdf" state="current" value={10} onCancel={() => {}} /></FileList>
      <Stepper size="sm"><Step state="complete" index={1} label="One" /><Step state="current" index={2} label="Two" /></Stepper>
    </main>);
    await expectNoA11yViolations(container);
  });
});
