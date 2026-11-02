// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { HoverCard } from '../packages/ui/src/index.js';
import { expectNoA11yViolations } from './a11y.js';

beforeEach(() => { vi.useFakeTimers(); });
afterEach(() => { cleanup(); vi.useRealTimers(); });

const card = () => document.querySelector('.hover-card');

function setup(onOpenChange = vi.fn()) {
  render(<main><HoverCard openDelay={300} closeDelay={100} onOpenChange={onOpenChange}
    trigger={<a href="#au-6">AU-6</a>} content={<p>Reviewed weekly.</p>} /></main>);
  return screen.getByRole('link', { name: 'AU-6' });
}

describe('a card you point at', () => {
  it('waits before opening on hover, so a sweep across a list opens nothing', () => {
    const link = setup();
    fireEvent.mouseEnter(link);
    act(() => { vi.advanceTimersByTime(200); });
    expect(card()).toBeNull();
    fireEvent.mouseLeave(link);
    act(() => { vi.advanceTimersByTime(500); });
    expect(card()).toBeNull();
  });

  it('opens on hover after the dwell, and the trigger is described by it', () => {
    const onOpenChange = vi.fn();
    const link = setup(onOpenChange);
    fireEvent.mouseEnter(link);
    act(() => { vi.advanceTimersByTime(300); });
    expect(card()).toHaveTextContent('Reviewed weekly.');
    expect(card()).toHaveClass('popover');
    expect(link).toHaveAccessibleDescription('Reviewed weekly.');
    expect(link).not.toHaveAttribute('title');
    expect(onOpenChange).toHaveBeenCalledWith(true);
  });

  it('opens on keyboard focus too, and closes on blur', () => {
    const link = setup();
    act(() => { link.focus(); });
    act(() => { vi.advanceTimersByTime(300); });
    expect(card()).not.toBeNull();
    act(() => { link.blur(); });
    expect(card()).toBeNull();
  });

  it('closes on Escape and leaves focus where it was', () => {
    const link = setup();
    act(() => { link.focus(); });
    act(() => { vi.advanceTimersByTime(300); });
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(card()).toBeNull();
    expect(document.activeElement).toBe(link);
  });

  it('stays open while the pointer travels onto it', () => {
    const link = setup();
    fireEvent.mouseEnter(link);
    act(() => { vi.advanceTimersByTime(300); });
    fireEvent.mouseLeave(link);
    act(() => { vi.advanceTimersByTime(50); });
    fireEvent.mouseEnter(card()!);
    act(() => { vi.advanceTimersByTime(500); });
    expect(card()).not.toBeNull();
    fireEvent.mouseLeave(card()!);
    act(() => { vi.advanceTimersByTime(100); });
    expect(card()).toBeNull();
  });

  it('passes axe open', async () => {
    const link = setup();
    fireEvent.mouseEnter(link);
    act(() => { vi.advanceTimersByTime(300); });
    vi.useRealTimers();
    await expectNoA11yViolations(document.body);
  });
});
