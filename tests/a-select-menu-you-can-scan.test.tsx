// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { SelectMenu, useListbox } from '../packages/ui/src/index.js';
import type { SelectMenuItem } from '../packages/ui/src/index.js';
import { expectNoA11yViolations } from './a11y.js';

/**
 * A button that shows the chosen value and opens a list drawn by the system: the collapsible
 * listbox pattern, with notes, groups and disabled options. The key contract itself is
 * `useListbox`'s and is proven in a-listbox-you-can-type-into; these prove the component wires it.
 */
afterEach(() => { cleanup(); });

const ACCOUNTS: SelectMenuItem[] = [
  { group: 'Healthcare', options: [
    { value: 'northlake', label: 'Northlake Health', note: 'Two open renewals' },
  ] },
  { group: 'Finance and logistics', options: [
    { value: 'meridian', label: 'Meridian Financial' },
    { value: 'atlas', label: 'Atlas Logistics', note: 'Contract under review' },
  ] },
  { group: 'Public sector', options: [
    { value: 'ridgeway', label: 'Ridgeway Transit Authority', note: 'Archived', disabled: true },
  ] },
];

function Harness({ initial = null as string | null, onChange = vi.fn(), ...rest }: {
  initial?: string | null;
  onChange?: (v: string) => void;
  disabled?: boolean;
  name?: string;
  labelHidden?: boolean;
}) {
  const [value, setValue] = useState<string | null>(initial);
  return (
    <main>
      <h1>Assign</h1>
      <form aria-label="Assign">
        <SelectMenu label="Account" options={ACCOUNTS} value={value}
          onChange={(v) => { setValue(v); onChange(v); }} {...rest} />
        <button type="button">After</button>
      </form>
    </main>
  );
}

const trigger = () => screen.getByRole('button', { name: /^Account/ });
const list = () => screen.getByRole('listbox');
const active = () => {
  const id = list().getAttribute('aria-activedescendant');
  return id ? document.getElementById(id) : null;
};
const key = (el: Element, k: string) => fireEvent.keyDown(el, { key: k });

describe('SelectMenu', () => {
  it('is a button named by its label and its value, with no list until asked', () => {
    render(<Harness initial="meridian" />);
    expect(trigger()).toHaveAccessibleName('Account Meridian Financial');
    expect(trigger()).toHaveAttribute('aria-haspopup', 'listbox');
    expect(trigger()).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByRole('listbox')).toBeNull();
  });

  it('shows the placeholder while nothing is chosen', () => {
    render(<Harness />);
    expect(trigger()).toHaveTextContent('Choose…');
    expect(trigger().querySelector('.select-menu-value')).toHaveAttribute('data-placeholder');
  });

  it('opens on the chosen option, named by the label, with focus in the list', () => {
    render(<Harness initial="atlas" />);
    key(trigger(), 'Enter');
    expect(list()).toHaveFocus();
    expect(list()).toHaveAccessibleName('Account');
    expect(trigger()).toHaveAttribute('aria-controls', list().id);
    expect(active()).toHaveTextContent('Atlas Logistics');
    expect(screen.getByRole('option', { name: /Atlas Logistics/ })).toHaveAttribute('aria-selected', 'true');
  });

  it('moves focus into the list once it is placed, though a hidden list refuses focus', () => {
    // A browser will not focus a `visibility: hidden` element, and the list is hidden until
    // `useAnchoredPosition` has measured it. jsdom focuses it anyway, so the refusal is put back.
    const focus = HTMLElement.prototype.focus;
    HTMLElement.prototype.focus = function (this: HTMLElement, ...args) {
      if (this.style.visibility === 'hidden') return;
      focus.apply(this, args);
    };
    try {
      render(<Harness initial="meridian" />);
      key(trigger(), 'Enter');
      expect(list()).toHaveFocus();
      key(list(), 'ArrowDown');
      expect(active()).toHaveTextContent('Atlas Logistics');
    } finally {
      HTMLElement.prototype.focus = focus;
    }
  });

  it('draws groups as named groups, notes under labels and disabled options', () => {
    render(<Harness />);
    key(trigger(), 'ArrowDown');
    const groups = screen.getAllByRole('group');
    expect(groups.map((g) => g.getAttribute('aria-labelledby') && document.getElementById(g.getAttribute('aria-labelledby')!)?.textContent))
      .toEqual(['Healthcare', 'Finance and logistics', 'Public sector']);
    expect(screen.getByRole('option', { name: /Northlake Health/ })).toHaveTextContent('Two open renewals');
    expect(screen.getByRole('option', { name: /Ridgeway/ })).toHaveAttribute('aria-disabled', 'true');
  });

  it('moves across groups with the arrows, Home and End, and never lands on a disabled option', () => {
    render(<Harness />);
    key(trigger(), 'ArrowDown');
    expect(active()).toHaveTextContent('Northlake Health');
    key(list(), 'ArrowDown');
    expect(active()).toHaveTextContent('Meridian Financial');
    key(list(), 'End');
    expect(active()).toHaveTextContent('Atlas Logistics');
    key(list(), 'ArrowDown');
    expect(active()).toHaveTextContent('Atlas Logistics');
    key(list(), 'Home');
    expect(active()).toHaveTextContent('Northlake Health');
  });

  it('jumps on a letter and chooses with Enter, giving focus back to the button', () => {
    const onChange = vi.fn();
    render(<Harness onChange={onChange} />);
    key(trigger(), 'Enter');
    key(list(), 'a');
    expect(active()).toHaveTextContent('Atlas Logistics');
    key(list(), 'Enter');
    expect(onChange).toHaveBeenCalledWith('atlas');
    expect(screen.queryByRole('listbox')).toBeNull();
    expect(trigger()).toHaveFocus();
    expect(trigger()).toHaveAccessibleName('Account Atlas Logistics');
  });

  it('chooses with Space and with a click', async () => {
    const u = userEvent.setup();
    const onChange = vi.fn();
    render(<Harness onChange={onChange} />);
    key(trigger(), 'Enter');
    key(list(), ' ');
    expect(onChange).toHaveBeenLastCalledWith('northlake');
    await u.click(trigger());
    await u.click(screen.getByRole('option', { name: /Meridian/ }));
    expect(onChange).toHaveBeenLastCalledWith('meridian');
    expect(trigger()).toHaveFocus();
  });

  it('does not call onChange for the option already chosen, or for a disabled one', async () => {
    const u = userEvent.setup();
    const onChange = vi.fn();
    render(<Harness initial="meridian" onChange={onChange} />);
    key(trigger(), 'Enter');
    key(list(), 'Enter');
    expect(onChange).not.toHaveBeenCalled();
    await u.click(trigger());
    fireEvent.click(screen.getByRole('option', { name: /Ridgeway/ }));
    expect(onChange).not.toHaveBeenCalled();
  });

  it('closes on Escape with no change, and the Escape does not reach the page', () => {
    const onChange = vi.fn();
    const page = vi.fn();
    const onPage = (e: KeyboardEvent) => { if (e.key === 'Escape') page(); };
    document.addEventListener('keydown', onPage);
    render(<Harness initial="meridian" onChange={onChange} />);
    key(trigger(), 'Enter');
    key(list(), 'ArrowDown');
    key(list(), 'Escape');
    document.removeEventListener('keydown', onPage);
    expect(screen.queryByRole('listbox')).toBeNull();
    expect(onChange).not.toHaveBeenCalled();
    expect(trigger()).toHaveFocus();
    expect(page).not.toHaveBeenCalled();
  });

  it('closes on a press outside', async () => {
    const u = userEvent.setup();
    render(<Harness />);
    await u.click(trigger());
    expect(list()).toBeInTheDocument();
    await u.click(screen.getByRole('heading', { name: 'Assign' }));
    expect(screen.queryByRole('listbox')).toBeNull();
  });

  it('does not open while disabled', async () => {
    const u = userEvent.setup();
    render(<Harness disabled />);
    expect(trigger()).toBeDisabled();
    await u.click(trigger());
    expect(screen.queryByRole('listbox')).toBeNull();
  });

  it('submits its value through a hidden input when given a name', () => {
    render(<Harness initial="atlas" name="account" />);
    const form = screen.getByRole('form', { name: 'Assign' }) as HTMLFormElement;
    expect(new FormData(form).get('account')).toBe('atlas');
  });

  it('keeps a visually hidden label for assistive technology', () => {
    render(<Harness labelHidden initial="atlas" />);
    expect(trigger()).toHaveAccessibleName('Account Atlas Logistics');
    expect(document.querySelector('.select-menu .field-label')).toHaveClass('sr-only');
  });

  it('passes axe closed and open', async () => {
    const { container } = render(<Harness initial="meridian" />);
    await expectNoA11yViolations(container);
    key(trigger(), 'Enter');
    await expectNoA11yViolations(container);
  });
});

/**
 * A list placed with `position: fixed` is its own options' offsetParent, so their offsetTop is
 * already measured from the list. The hook subtracted the list's distance from the top of the
 * page as well and never scrolled down.
 */
describe('useListbox in a positioned list', () => {
  const ROWS = ['One', 'Two', 'Three', 'Four', 'Five', 'Six'];
  function Fixed() {
    const [open, setOpen] = useState(false);
    const lb = useListbox({
      count: ROWS.length, open, onOpenChange: setOpen, selectedIndex: -1,
      textOf: (i) => ROWS[i]!, onChoose: () => {},
    });
    return (
      <div {...lb.rootProps()}>
        <button type="button" {...lb.buttonProps()}>Rows</button>
        {open ? (
          <ul aria-label="Rows" {...lb.listProps()}>
            {ROWS.map((r, i) => <li key={r} {...lb.optionProps(i)}>{r}</li>)}
          </ul>
        ) : null}
      </div>
    );
  }

  it('scrolls by the options\' own offset when the list is their offsetParent', () => {
    render(<Fixed />);
    key(screen.getByRole('button', { name: 'Rows' }), 'ArrowDown');
    const ul = screen.getByRole('listbox');
    Object.defineProperty(ul, 'clientHeight', { value: 80, configurable: true });
    Object.defineProperty(ul, 'scrollHeight', { value: 240, configurable: true });
    Object.defineProperty(ul, 'offsetTop', { value: 500, configurable: true });
    screen.getAllByRole('option').forEach((o, i) => {
      Object.defineProperty(o, 'offsetParent', { value: ul, configurable: true });
      Object.defineProperty(o, 'offsetTop', { value: i * 40, configurable: true });
      Object.defineProperty(o, 'offsetHeight', { value: 40, configurable: true });
    });
    key(ul, 'End');
    expect(ul.scrollTop).toBe(5 * 40 + 40 - 80);
  });
});
