// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { Button, ToastProvider, useToast, ToastRegion, Toast, ToastTitle, ToastAction, ToastClose } from '../packages/ui/src/index.js';
import type { ToastSpec } from '../packages/ui/src/index.js';
import { expectNoA11yViolations } from './a11y.js';

/**
 * A toast that reports what just happened and offers one way to take it back. It does not leave
 * before the action can be used, the action is a real button in the live region, and pressing it
 * puts focus back where the person was.
 */
beforeEach(() => vi.useFakeTimers());
afterEach(() => { cleanup(); vi.useRealTimers(); });

// fireEvent rather than userEvent: userEvent awaits internally, and under fake timers those awaits
// never resolve.
const click = (el: HTMLElement) => act(() => { fireEvent.click(el); });

function Archive({ spec }: { spec: ToastSpec }) {
  const { toast } = useToast();
  return <main><Button onClick={() => toast(spec)}>Archive</Button></main>;
}

describe('a toast with an action', () => {
  it('renders the action as a button in the live region, before the dismiss', async () => {
    const onAction = vi.fn();
    const { container } = render(<ToastProvider><Archive spec={{ title: 'Moved to the archive', action: { label: 'Undo', onAction } }} /></ToastProvider>);
    click(screen.getByText('Archive'));
    const region = screen.getByRole('region', { name: 'Notifications' });
    const undo = screen.getByRole('button', { name: 'Undo' });
    expect(region).toHaveAttribute('aria-live', 'polite');
    expect(region).toContainElement(undo);
    expect(undo).toHaveClass('toast-action');
    expect(undo).toHaveAttribute('type', 'button');
    const buttons = Array.from(region.querySelectorAll('button'));
    expect(buttons.map((b) => b.getAttribute('aria-label') ?? b.textContent)).toEqual(['Undo', 'Dismiss']);
    // axe schedules with timers of its own.
    vi.useRealTimers();
    await expectNoA11yViolations(container);
  });

  it('runs the action once and dismisses the toast', () => {
    const onAction = vi.fn();
    render(<ToastProvider><Archive spec={{ title: 'Moved to the archive', action: { label: 'Undo', onAction } }} /></ToastProvider>);
    click(screen.getByText('Archive'));
    click(screen.getByRole('button', { name: 'Undo' }));
    expect(onAction).toHaveBeenCalledTimes(1);
    expect(screen.queryByText('Moved to the archive')).toBeNull();
  });

  it('does not time out by default, so the action cannot leave before it is reached', () => {
    render(<ToastProvider defaultDuration={1000}><Archive spec={{ title: 'Moved to the archive', action: { label: 'Undo', onAction: vi.fn() } }} /></ToastProvider>);
    click(screen.getByText('Archive'));
    act(() => { vi.advanceTimersByTime(60_000); });
    expect(screen.getByRole('button', { name: 'Undo' })).toBeInTheDocument();
  });

  it('a toast without an action still times out as before', () => {
    render(<ToastProvider defaultDuration={1000}><Archive spec={{ title: 'Saved' }} /></ToastProvider>);
    click(screen.getByText('Archive'));
    act(() => { vi.advanceTimersByTime(1200); });
    expect(screen.queryByText('Saved')).toBeNull();
  });

  it('with a duration given, holds while keyboard focus is in it', () => {
    render(<ToastProvider><Archive spec={{ title: 'Moved to the archive', duration: 1000, action: { label: 'Undo', onAction: vi.fn() } }} /></ToastProvider>);
    const trigger = screen.getByText('Archive');
    click(trigger);
    const undo = screen.getByRole('button', { name: 'Undo' });
    act(() => { fireEvent.focus(undo, { relatedTarget: trigger }); undo.focus(); });
    act(() => { vi.advanceTimersByTime(5000); });
    expect(undo).toBeInTheDocument();
    act(() => { trigger.focus(); fireEvent.blur(undo, { relatedTarget: trigger }); });
    act(() => { vi.advanceTimersByTime(1200); });
    expect(screen.queryByText('Moved to the archive')).toBeNull();
  });

  it('reached by keyboard, the action puts focus back where the person was', () => {
    const onAction = vi.fn();
    render(<ToastProvider><Archive spec={{ title: 'Moved to the archive', action: { label: 'Undo', onAction } }} /></ToastProvider>);
    const trigger = screen.getByText('Archive');
    act(() => { trigger.focus(); });
    click(trigger);
    const undo = screen.getByRole('button', { name: 'Undo' });
    act(() => { undo.focus(); fireEvent.focus(undo, { relatedTarget: trigger }); });
    expect(undo).toHaveFocus();
    act(() => { fireEvent.keyDown(undo, { key: 'Enter' }); fireEvent.click(undo); });
    expect(onAction).toHaveBeenCalledTimes(1);
    expect(trigger).toHaveFocus();
  });
});

describe('ToastAction', () => {
  it('composes by hand like the other parts', async () => {
    vi.useRealTimers();
    const { container } = render(
      <main>
        <ToastRegion>
          <Toast><div><ToastTitle>Moved to the archive</ToastTitle></div><ToastAction>Undo</ToastAction><ToastClose /></Toast>
        </ToastRegion>
      </main>,
    );
    expect(screen.getByRole('button', { name: 'Undo' })).toHaveClass('btn', 'btn-secondary', 'btn-sm', 'toast-action');
    await expectNoA11yViolations(container);
  });
});
