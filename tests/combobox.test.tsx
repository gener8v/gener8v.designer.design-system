import { describe, it, expect, vi } from 'vitest';
import { useState } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Combobox } from '../packages/ui/src/index.js';
import type { ComboboxOption } from '../packages/ui/src/index.js';

const OPTIONS: ComboboxOption[] = [
  { value: 'va', label: 'Commonwealth of Virginia' },
  { value: 'nh', label: 'Northlake Health' },
  { value: 'mf', label: 'Meridian Financial', disabled: true },
  { value: 'al', label: 'Atlas Logistics' },
];

function Harness({ onChange }: { onChange?: (v: string | null) => void }) {
  const [value, setValue] = useState<string | null>(null);
  return (
    <Combobox label="Client" placeholder="Search clients" options={OPTIONS} value={value}
      onChange={(v) => { setValue(v); onChange?.(v); }} />
  );
}

const box = () => screen.getByRole('combobox');

describe('Combobox — ARIA 1.2 pattern', () => {
  it('is a combobox with a name and no list until asked', () => {
    render(<Harness />);
    expect(box()).toHaveAccessibleName('Client');
    expect(box()).toHaveAttribute('aria-expanded', 'false');
    expect(box()).toHaveAttribute('aria-autocomplete', 'list');
    expect(screen.queryByRole('listbox')).toBeNull();
  });

  it('keeps DOM focus in the input and tracks the option with aria-activedescendant', async () => {
    const u = userEvent.setup();
    render(<Harness />);
    await u.click(box());
    await u.keyboard('{ArrowDown}');
    expect(box()).toHaveFocus();                       // focus never leaves the input
    const activeId = box().getAttribute('aria-activedescendant');
    expect(activeId).toBeTruthy();
    expect(document.getElementById(activeId!)).toHaveAttribute('role', 'option');
  });

  it('typing filters the list', async () => {
    const u = userEvent.setup();
    render(<Harness />);
    await u.click(box());
    await u.type(box(), 'north');
    const options = screen.getAllByRole('option');
    expect(options).toHaveLength(1);
    expect(options[0]).toHaveTextContent('Northlake Health');
  });

  it('arrow keys skip disabled options', async () => {
    const u = userEvent.setup();
    render(<Harness />);
    await u.click(box());
    await u.keyboard('{ArrowDown}{ArrowDown}{ArrowDown}');
    const activeId = box().getAttribute('aria-activedescendant')!;
    expect(document.getElementById(activeId)).toHaveTextContent('Atlas Logistics');
  });

  it('Enter commits the active option', async () => {
    const u = userEvent.setup();
    const onChange = vi.fn();
    render(<Harness onChange={onChange} />);
    await u.click(box());
    await u.keyboard('{ArrowDown}{ArrowDown}{Enter}');
    expect(onChange).toHaveBeenCalledWith('nh');
    expect(box()).toHaveValue('Northlake Health');
    expect(screen.queryByRole('listbox')).toBeNull();
  });

  it('clicking an option commits it', async () => {
    const u = userEvent.setup();
    const onChange = vi.fn();
    render(<Harness onChange={onChange} />);
    await u.click(box());
    await u.click(screen.getByText('Atlas Logistics'));
    expect(onChange).toHaveBeenCalledWith('al');
  });

  it('Escape reverts an abandoned edit rather than clearing the value', async () => {
    const u = userEvent.setup();
    render(<Harness />);
    await u.click(box());
    await u.keyboard('{ArrowDown}{Enter}');            // commit Virginia
    expect(box()).toHaveValue('Commonwealth of Virginia');
    await u.clear(box());
    await u.type(box(), 'xyz');
    await u.keyboard('{Escape}');
    expect(box()).toHaveValue('Commonwealth of Virginia');   // draft discarded
  });

  it('Escape on a closed combobox clears the selection', async () => {
    const u = userEvent.setup();
    const onChange = vi.fn();
    render(<Harness onChange={onChange} />);
    await u.click(box());
    await u.keyboard('{ArrowDown}{Enter}');
    await u.keyboard('{Escape}');   // list already closed by Enter
    expect(onChange).toHaveBeenLastCalledWith(null);
    expect(box()).toHaveValue('');
  });

  it('reports no matches rather than showing an empty box', async () => {
    const u = userEvent.setup();
    render(<Harness />);
    await u.click(box());
    await u.type(box(), 'zzzz');
    expect(screen.getByText('No matches')).toBeInTheDocument();
    expect(screen.queryAllByRole('option')).toHaveLength(0);
  });
});
