import { describe, it, expect, vi } from 'vitest';
import { act, useState } from 'react';
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

function Open({ onChange }: { onChange?: (v: string | null) => void }) {
  const [value, setValue] = useState<string | null>(null);
  return (
    <Combobox label="Subject" placeholder="Pick or type" options={OPTIONS} value={value} allowCustom
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

describe('Combobox — a label somebody can read', () => {
  it('shows the label, as the gallery does', async () => {
    // The component rendered every label `sr-only` while components/inputs.html showed a
    // visible one. A form built from the gallery and a form built from the component did
    // not agree, and this was always the one field on a page with no visible label.
    render(<Harness />);
    const label = document.querySelector('label.field-label');
    expect(label).toHaveTextContent('Client');
    expect(label).not.toHaveClass('sr-only');
    expect(box()).toHaveAccessibleName('Client');
  });

  it('hides it only when asked', async () => {
    render(
      <Combobox label="Client" options={OPTIONS} value={null} onChange={() => {}} labelHidden />,
    );
    expect(document.querySelector('label.field-label')).toHaveClass('sr-only');
    expect(box()).toHaveAccessibleName('Client');   // still named, just not shown
  });
});

describe('Combobox — a value the list does not hold', () => {
  it('refuses one by default, so a closed vocabulary stays closed', async () => {
    const u = userEvent.setup();
    const onChange = vi.fn();
    render(<Harness onChange={onChange} />);
    await u.click(box());
    await u.keyboard('Something Else{Enter}');
    await u.tab();

    expect(onChange).not.toHaveBeenCalled();
    expect(box()).toHaveValue('');            // and the abandoned edit reverts
  });

  it('commits typed text on Enter when the field accepts one', async () => {
    const u = userEvent.setup();
    const onChange = vi.fn();
    render(<Open onChange={onChange} />);
    await u.click(box());
    await u.keyboard('the ledger{Enter}');

    expect(onChange).toHaveBeenCalledWith('the ledger');
    expect(box()).toHaveValue('the ledger');  // and it SURVIVES the render it caused
    expect(screen.queryByRole('listbox')).toBeNull();
  });

  it('commits typed text on tabbing out', async () => {
    const u = userEvent.setup();
    const onChange = vi.fn();
    render(<Open onChange={onChange} />);
    await u.click(box());
    await u.keyboard('retry policy');
    await u.tab();

    expect(onChange).toHaveBeenCalledWith('retry policy');
    expect(box()).toHaveValue('retry policy');
  });

  it('commits typed text on clicking away', async () => {
    // THE ONE PEOPLE ACTUALLY DO, and a different code path from Tab: the
    // dismiss-on-outside-click listener runs first and used to revert the query
    // before the field had committed it. A test that only tabbed out passed
    // while clicking away silently discarded what was typed.
    const u = userEvent.setup();
    const onChange = vi.fn();
    render(<><Open onChange={onChange} /><button type="button">elsewhere</button></>);
    await u.click(box());
    await u.keyboard('retry policy');
    await u.click(screen.getByRole('button', { name: 'elsewhere' }));

    expect(onChange).toHaveBeenCalledWith('retry policy');
    expect(box()).toHaveValue('retry policy');
  });

  it('commits typed text when focus is moved off it programmatically', async () => {
    // Neither Tab nor a click: a script or an assistive technology moving focus.
    // Both other paths commit before blur ever runs, so without this the input's
    // own blur handler is unreachable and could be deleted without a test noticing.
    const u = userEvent.setup();
    const onChange = vi.fn();
    render(<><Open onChange={onChange} /><button type="button">elsewhere</button></>);
    await u.click(box());
    await u.keyboard('retry policy');
    await act(async () => { screen.getByRole('button', { name: 'elsewhere' }).focus(); });

    expect(onChange).toHaveBeenCalledWith('retry policy');
  });

  it('still prefers an option when one is chosen', async () => {
    const u = userEvent.setup();
    const onChange = vi.fn();
    render(<Open onChange={onChange} />);
    await u.click(box());
    await u.keyboard('Atlas{ArrowDown}{Enter}');

    expect(onChange).toHaveBeenCalledWith('al');   // the option's value, not its label
  });

  it('clears rather than committing an empty string', async () => {
    const u = userEvent.setup();
    const onChange = vi.fn();
    render(<Open onChange={onChange} />);
    await u.click(box());
    await u.keyboard('draft');
    await u.tab();
    await u.clear(box());
    await u.tab();

    expect(onChange).toHaveBeenLastCalledWith(null);
  });
});

describe('Combobox — an empty list is not a failed search', () => {
  it('says nothing to choose from when there are no options at all', async () => {
    // It told the reader "no match for what you typed" before they had typed anything — an answer
    // to a question nobody asked, about a search that never ran.
    const u = userEvent.setup();
    render(<Combobox label="Subject" options={[]} value={null} onChange={() => {}} />);
    await u.click(screen.getByRole('combobox'));

    expect(screen.getByText('Nothing to choose from yet')).toBeInTheDocument();
    expect(screen.queryByText('No matches')).toBeNull();
  });

  it('says no matches only once a query has ruled them out', async () => {
    const u = userEvent.setup();
    render(<Harness />);
    await u.click(screen.getByRole('combobox'));
    await u.keyboard('zzzz');

    expect(screen.getByText('No matches')).toBeInTheDocument();
    expect(screen.queryByText('Nothing to choose from yet')).toBeNull();
  });
});

describe('Combobox — the caller does not have to hold its list still', () => {
  /**
   * A NEW ARRAY OF THE SAME OPTIONS IS THE SAME OPTIONS.
   *
   * `options={xs.map(...)}` is what nearly every caller writes, and it hands a
   * fresh array on every render. This derived the committed option from that
   * array and synced the input's text from the OBJECT it found, so a new array
   * meant a new object, the effect fired on every render, and each fire
   * scheduled another. In a browser React ends it with "Maximum update depth
   * exceeded" and the field is dead from the moment somebody picks something.
   *
   * That loop needs a real layout to start — under jsdom the width measured on
   * opening never changes, so the render that feeds the cycle never happens.
   * What IS reproducible here is the same effect firing when it should not, and
   * it is visible as the thing it does: it throws away what is being typed.
   */
  function Field({ tick }: { tick: number }) {
    const [value, setValue] = useState<string | null>(null);
    return (
      <div data-tick={tick}>
        <Combobox label="Client" placeholder="Search clients"
          options={OPTIONS.map((o) => ({ ...o }))} value={value} onChange={setValue} />
      </div>
    );
  }

  it('keeps what is being typed when the caller re-renders around it', async () => {
    const u = userEvent.setup();
    const { rerender } = render(<Field tick={1} />);

    // Something committed, because that is when the array actually holds an
    // object to be found again: with nothing chosen the lookup answers null
    // either way, and null compares equal to null.
    await u.click(box());
    await u.click(screen.getByRole('option', { name: /Atlas Logistics/ }));

    await u.click(box());
    await u.clear(box());
    await u.keyboard('North');

    // Anything at all in the parent: a poll answering, a sibling's state.
    rerender(<Field tick={2} />);

    expect(box()).toHaveValue('North');
    expect(screen.getByRole('option', { name: /Northlake Health/ })).toBeInTheDocument();
    expect(screen.queryByRole('option', { name: /Atlas Logistics/ })).toBeNull();
  });

  it('still reverts to the committed label when the field is left', async () => {
    const u = userEvent.setup();
    render(<Harness />);
    await u.click(box());
    await u.click(screen.getByRole('option', { name: /Northlake Health/ }));
    await u.click(box());
    await u.keyboard('zzz');
    await u.tab();

    expect(box()).toHaveValue('Northlake Health');
  });
});
