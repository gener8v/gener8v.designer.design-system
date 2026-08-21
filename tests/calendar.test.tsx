import { describe, it, expect, vi } from 'vitest';
import { useState } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Calendar, toISO } from '../packages/ui/src/index.js';

// "today" is injected rather than the clock being frozen — a component that
// needs a fake timer to be testable is a component with a hidden dependency.
const TODAY = '2026-08-21';

function Harness({ onChange, min, max }: { onChange?: (v: string) => void; min?: string; max?: string }) {
  const [value, setValue] = useState<string | null>('2026-08-14');
  return <Calendar today={TODAY} value={value} min={min} max={max}
    onChange={(v) => { setValue(v); onChange?.(v); }} />;
}

const grid = () => screen.getByRole('grid');
const focused = () => grid().querySelector('[tabindex="0"]') as HTMLElement;

describe('Calendar', () => {
  it('is a labelled grid showing the selected month', () => {
    render(<Harness />);
    expect(grid()).toHaveAccessibleName('August 2026');
  });

  it('keeps exactly one day in the Tab sequence', () => {
    render(<Harness />);
    expect(grid().querySelectorAll('[tabindex="0"]')).toHaveLength(1);
    expect(focused()).toHaveAccessibleName(/August 14, 2026/);
  });

  it('gives every day a full unambiguous name', () => {
    render(<Harness />);
    expect(focused()).toHaveAccessibleName('Friday, August 14, 2026');
  });

  it('arrows move a day and a week', async () => {
    const u = userEvent.setup();
    render(<Harness />);
    focused().focus();
    await u.keyboard('{ArrowRight}');
    expect(focused()).toHaveAccessibleName(/August 15, 2026/);
    await u.keyboard('{ArrowDown}');
    expect(focused()).toHaveAccessibleName(/August 22, 2026/);
    await u.keyboard('{ArrowUp}{ArrowLeft}');
    expect(focused()).toHaveAccessibleName(/August 14, 2026/);
  });

  it('crosses a month boundary rather than clamping', async () => {
    const u = userEvent.setup();
    render(<Harness />);
    focused().focus();
    await u.keyboard('{ArrowDown}{ArrowDown}{ArrowDown}');  // 14 → 4 Sept
    expect(grid()).toHaveAccessibleName('September 2026');
    expect(focused()).toHaveAccessibleName(/September 4, 2026/);
  });

  it('PageUp and PageDown move a month', async () => {
    const u = userEvent.setup();
    render(<Harness />);
    focused().focus();
    await u.keyboard('{PageDown}');
    expect(grid()).toHaveAccessibleName('September 2026');
    await u.keyboard('{PageUp}{PageUp}');
    expect(grid()).toHaveAccessibleName('July 2026');
  });

  it('Enter selects the focused day', async () => {
    const u = userEvent.setup();
    const onChange = vi.fn();
    render(<Harness onChange={onChange} />);
    focused().focus();
    await u.keyboard('{ArrowRight}{Enter}');
    expect(onChange).toHaveBeenCalledWith('2026-08-15');
  });

  it('marks today separately from the selection', () => {
    render(<Harness />);
    const todayCell = screen.getByRole('button', { name: /August 21, 2026/ });
    expect(todayCell).toHaveAttribute('aria-current', 'date');
    expect(todayCell.closest('td')).toHaveAttribute('aria-selected', 'false');
    expect(focused().closest('td')).toHaveAttribute('aria-selected', 'true');
    expect(focused()).not.toHaveAttribute('aria-current');
  });

  it('disables days outside min/max and refuses to select them', async () => {
    const u = userEvent.setup();
    const onChange = vi.fn();
    render(<Harness onChange={onChange} min="2026-08-10" max="2026-08-20" />);
    expect(screen.getByRole('button', { name: /August 9, 2026/ })).toHaveAttribute('aria-disabled', 'true');
    expect(screen.getByRole('button', { name: /August 21, 2026/ })).toHaveAttribute('aria-disabled', 'true');
    focused().focus();
    await u.keyboard('{ArrowUp}{Enter}');   // 7 August — before min
    expect(onChange).not.toHaveBeenCalled();
  });

  it('toISO pads month and day', () => {
    expect(toISO(2026, 0, 5)).toBe('2026-01-05');
    expect(toISO(2026, 11, 31)).toBe('2026-12-31');
  });
});
