// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { ErrorBoundary } from '../packages/ui/src/index.js';
import { expectNoA11yViolations } from './a11y.js';

/**
 * One region that throws while rendering shows a plain error state in its own place. The frame
 * around it stays, the error's own words are never shown, and moving on — a new `resetKey` —
 * recovers it.
 */
beforeEach(() => { vi.spyOn(console, 'error').mockImplementation(() => {}); });
afterEach(() => { cleanup(); vi.restoreAllMocks(); });

const SECRET = 'TypeError: cannot read properties of undefined (reading "total") at /srv/internal/report.ts';

function Report({ broken }: { broken: boolean }) {
  if (broken) throw new Error(SECRET);
  return <p>Quarterly totals</p>;
}

function Frame({ path, broken, onError }: { path: string; broken: boolean; onError?: () => void }) {
  return (
    <>
      <header><nav aria-label="Main"><a href="/">Home</a></nav></header>
      <main>
        <ErrorBoundary resetKey={path} {...(onError ? { onError } : {})}>
          <Report broken={broken} />
        </ErrorBoundary>
      </main>
    </>
  );
}

describe('ErrorBoundary', () => {
  it('renders its children when nothing throws', () => {
    render(<Frame path="/reports" broken={false} />);
    expect(screen.getByText('Quarterly totals')).toBeInTheDocument();
    expect(screen.queryByRole('alert')).toBeNull();
  });

  it('keeps the frame and shows an error State, never the error text', async () => {
    const { container } = render(<Frame path="/reports" broken />);
    expect(screen.getByRole('navigation', { name: 'Main' })).toBeInTheDocument();
    const alert = screen.getByRole('alert');
    expect(alert).toHaveClass('state');
    expect(alert).toHaveAttribute('data-tone', 'danger');
    expect(alert).toHaveTextContent('This part could not be shown');
    expect(container).not.toHaveTextContent(/TypeError|reading "total"|internal/);
    await expectNoA11yViolations(container);
  });

  it('hands the error to onError', () => {
    const onError = vi.fn();
    render(<Frame path="/reports" broken onError={onError} />);
    expect(onError).toHaveBeenCalledTimes(1);
    expect((onError.mock.calls[0]![0] as Error).message).toBe(SECRET);
    expect(onError.mock.calls[0]![1]).toHaveProperty('componentStack');
  });

  it('clears when the resetKey changes', () => {
    const { rerender } = render(<Frame path="/reports" broken />);
    expect(screen.getByRole('alert')).toBeInTheDocument();
    // Same key: the error stays, even though the child would render now.
    rerender(<Frame path="/reports" broken={false} />);
    expect(screen.getByRole('alert')).toBeInTheDocument();
    rerender(<Frame path="/reports/q3" broken={false} />);
    expect(screen.queryByRole('alert')).toBeNull();
    expect(screen.getByText('Quarterly totals')).toBeInTheDocument();
  });

  it('a new key that still throws shows the error again, not a blank', () => {
    const { rerender } = render(<Frame path="/a" broken />);
    rerender(<Frame path="/b" broken />);
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('Try again renders the children once more', () => {
    let broken = true;
    function Flaky() {
      if (broken) throw new Error('first render');
      return <p>Loaded</p>;
    }
    render(<main><ErrorBoundary><Flaky /></ErrorBoundary></main>);
    broken = false;
    fireEvent.click(screen.getByRole('button', { name: 'Try again' }));
    expect(screen.getByText('Loaded')).toBeInTheDocument();
  });

  it('takes its own words, or a whole fallback handed reset', () => {
    const { rerender } = render(
      <main><ErrorBoundary labels={{ title: 'The chart could not be drawn', retry: 'Draw again' }}><Report broken /></ErrorBoundary></main>,
    );
    expect(screen.getByRole('alert')).toHaveTextContent('The chart could not be drawn');
    expect(screen.getByRole('button', { name: 'Draw again' })).toBeInTheDocument();
    rerender(<main><ErrorBoundary resetKey="x" fallback={(reset) => <button type="button" onClick={reset}>Reload panel</button>}><Report broken /></ErrorBoundary></main>);
    expect(screen.getByRole('button', { name: 'Reload panel' })).toBeInTheDocument();
  });
});
