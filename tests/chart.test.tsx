import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expectNoA11yViolations } from './a11y.js';
import { BarChart, LineChart, Sparkline, ticks, extent, seriesColor, MAX_SERIES } from '../packages/ui/src/index.js';

const SERIES = [
  { label: 'Open', values: [4, 7, 2] },
  { label: 'Resolved', values: [9, 12, 6] },
];
const CATS = ['AC', 'AU', 'IA'];

describe('chart scales', () => {
  it('picks tick steps that produce a readable count', () => {
    // The bug: integer thresholds turned 0–91 into two gridlines.
    expect(ticks(0, 91, 4)).toEqual([0, 20, 40, 60, 80]);
    expect(ticks(0, 300, 4)).toEqual([0, 100, 200, 300]);
    for (const [a, b] of [[0, 1], [0, 7], [-20, 80], [0, 1_250_000]] as const) {
      const t = ticks(a, b, 4);
      expect(t.length).toBeGreaterThanOrEqual(3);
      expect(t.length).toBeLessThanOrEqual(8);
    }
  });

  it('anchors a magnitude extent to zero', () => {
    expect(extent([40, 55, 62])).toEqual([0, 62]);
    // …but a trend may float
    expect(extent([40, 55, 62], false)).toEqual([40, 62]);
  });

  it('assigns categorical colours in fixed order and never cycles', () => {
    expect(seriesColor(0)).toBe('var(--series-1)');
    expect(seriesColor(MAX_SERIES - 1)).toBe(`var(--series-${MAX_SERIES})`);
    // A 9th series must not repaint as slot 1
    expect(seriesColor(MAX_SERIES)).not.toBe(seriesColor(0));
  });
});

describe('BarChart', () => {
  it('names itself and carries a legend for multiple series', () => {
    render(<BarChart title="Findings" categories={CATS} series={SERIES} />);
    expect(screen.getByRole('img')).toHaveAccessibleName(/Findings/);
    expect(screen.getByText('Open')).toBeInTheDocument();
    expect(screen.getByText('Resolved')).toBeInTheDocument();
  });

  it('omits the legend for a single series — the title names it', () => {
    render(<BarChart title="Open findings" categories={CATS} series={[SERIES[0]!]} />);
    expect(screen.queryByText('Open')).toBeNull();
  });

  it('offers a table view, which is the relief for low-contrast marks', async () => {
    const u = userEvent.setup();
    render(<BarChart title="Findings" categories={CATS} series={SERIES} />);
    await u.click(screen.getByText('Show table'));
    const table = screen.getByRole('table');
    expect(table).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'Open' })).toBeInTheDocument();
    expect(screen.getByRole('rowheader', { name: 'AU' })).toBeInTheDocument();
    expect(screen.getAllByRole('cell').map((c) => c.textContent)).toContain('12');
  });

  it('says so when series exceed the palette rather than cycling', () => {
    const many = Array.from({ length: 11 }, (_, i) => ({ label: `S${i}`, values: [1, 2, 3] }));
    render(<BarChart title="Many" categories={CATS} series={many} />);
    expect(screen.getByText(/3 folded into/)).toBeInTheDocument();
  });
});

describe('LineChart', () => {
  it('renders one line per series with 2px strokes', () => {
    const { container } = render(<LineChart title="Coverage" categories={CATS} series={SERIES} />);
    expect(container.querySelectorAll('path.chart-line')).toHaveLength(2);
  });

  it('exposes a hit target per category for the crosshair', () => {
    const { container } = render(<LineChart title="Coverage" categories={CATS} series={SERIES} />);
    expect(container.querySelectorAll('rect.chart-hit')).toHaveLength(CATS.length);
  });
});

describe('Sparkline', () => {
  it('carries a text label, since it has no axes', () => {
    render(<Sparkline values={[1, 4, 3, 8]} label="Auditability trend, up 29 points" />);
    expect(screen.getByRole('img')).toHaveAccessibleName('Auditability trend, up 29 points');
  });
});

describe('axe — charts', () => {
  it('bar, line and sparkline', async () => {
    const { container } = render(
      <main>
        <h1>Analysis</h1>
        <BarChart title="Findings by family" categories={CATS} series={SERIES} />
        <LineChart title="Coverage over time" categories={CATS} series={SERIES} />
        <Sparkline values={[1, 4, 3, 8]} label="Trend" />
      </main>);
    await expectNoA11yViolations(container);
  });
});
