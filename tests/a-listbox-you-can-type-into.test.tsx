// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { useState } from 'react';
import { useListbox } from '../packages/ui/src/index.js';
import { expectNoA11yViolations } from './a11y.js';

/**
 * The collapsible listbox keyboard contract, from the WAI-ARIA Authoring Practices: open on the
 * chosen option, move without wrapping, skip what is disabled, type to jump, and close on Tab
 * without dropping focus to the page.
 */
afterEach(() => { cleanup(); vi.useRealTimers(); });

const FRUIT = ['Apple', 'Apricot', 'Banana', 'Blackberry', 'Cherry', 'Blueberry', 'Date'];

function Picker({ disabled = [] as number[], initial = -1, onChoose = vi.fn() }) {
  const [open, setOpen] = useState(false);
  const [chosen, setChosen] = useState(initial);
  const lb = useListbox({
    count: FRUIT.length,
    open,
    onOpenChange: setOpen,
    selectedIndex: chosen,
    textOf: (i) => FRUIT[i]!,
    isDisabled: (i) => disabled.includes(i),
    onChoose: (i) => { setChosen(i); onChoose(i); },
  });
  return (
    <main>
      <div {...lb.rootProps()}>
        <span id="fruit-label">Fruit</span>
        <button type="button" aria-labelledby="fruit-label fruit-value" {...lb.buttonProps()}>
          <span id="fruit-value">{chosen >= 0 ? FRUIT[chosen] : 'Choose'}</span>
        </button>
        {open ? (
          <ul aria-labelledby="fruit-label" {...lb.listProps()}>
            {FRUIT.map((f, i) => <li key={f} {...lb.optionProps(i)}>{f}</li>)}
          </ul>
        ) : null}
      </div>
      <button type="button">After</button>
    </main>
  );
}

const button = () => screen.getByRole('button', { name: /Fruit/ });
const list = () => screen.getByRole('listbox');
const activeText = () => {
  const id = list().getAttribute('aria-activedescendant');
  return id ? document.getElementById(id)?.textContent : null;
};
const key = (el: Element, k: string, init: Partial<KeyboardEventInit> = {}) => fireEvent.keyDown(el, { key: k, ...init });

describe('useListbox', () => {
  it('opens from the button with the list focused on the chosen option', () => {
    render(<Picker initial={2} />);
    key(button(), 'Enter');
    expect(list()).toHaveFocus();
    expect(button()).toHaveAttribute('aria-expanded', 'true');
    expect(button()).toHaveAttribute('aria-controls', list().id);
    expect(activeText()).toBe('Banana');
    expect(screen.getByRole('option', { name: 'Banana' })).toHaveAttribute('aria-selected', 'true');
  });

  it('opens on the first option with ↓, the last with ↑', () => {
    render(<Picker />);
    key(button(), 'ArrowDown');
    expect(activeText()).toBe('Apple');
    key(list(), 'Escape');
    key(button(), 'ArrowUp');
    expect(activeText()).toBe('Date');
  });

  it('does not wrap at either end', () => {
    render(<Picker />);
    key(button(), 'ArrowDown');
    key(list(), 'ArrowUp');
    expect(activeText()).toBe('Apple');
    key(list(), 'End');
    key(list(), 'ArrowDown');
    expect(activeText()).toBe('Date');
  });

  it('skips disabled options with the arrows, Home and End', () => {
    render(<Picker disabled={[0, 1, 6]} />);
    key(button(), 'ArrowDown');
    expect(activeText()).toBe('Banana');
    key(list(), 'ArrowUp');
    expect(activeText()).toBe('Banana');
    key(list(), 'End');
    expect(activeText()).toBe('Blueberry');
    expect(screen.getByRole('option', { name: 'Apple' })).toHaveAttribute('aria-disabled', 'true');
  });

  it('type-ahead: repeating a letter cycles through the options that start with it', () => {
    render(<Picker />);
    key(button(), 'Enter');
    key(list(), 'b');
    expect(activeText()).toBe('Banana');
    key(list(), 'b');
    expect(activeText()).toBe('Blackberry');
    key(list(), 'b');
    expect(activeText()).toBe('Blueberry');
    key(list(), 'b');
    expect(activeText()).toBe('Banana');
  });

  it('type-ahead: a word typed quickly matches the word, and skips disabled options', () => {
    vi.useFakeTimers();
    render(<Picker disabled={[2]} />);
    key(button(), 'Enter');
    key(list(), 'b');
    expect(activeText()).toBe('Blackberry');
    key(list(), 'l');
    key(list(), 'u');
    expect(activeText()).toBe('Blueberry');
    act(() => { vi.advanceTimersByTime(600); });
    key(list(), 'a');
    expect(activeText()).toBe('Apple');
  });

  it('chooses with Enter and gives focus back to the button', () => {
    const onChoose = vi.fn();
    render(<Picker onChoose={onChoose} />);
    key(button(), 'Enter');
    key(list(), 'ArrowDown');
    key(list(), 'Enter');
    expect(onChoose).toHaveBeenCalledWith(1);
    expect(screen.queryByRole('listbox')).toBeNull();
    expect(button()).toHaveFocus();
    expect(button()).toHaveTextContent('Apricot');
  });

  it('does not choose a disabled option on a click', () => {
    const onChoose = vi.fn();
    render(<Picker disabled={[1]} onChoose={onChoose} />);
    fireEvent.click(button());
    fireEvent.click(screen.getByRole('option', { name: 'Apricot' }));
    expect(onChoose).not.toHaveBeenCalled();
    expect(list()).toBeInTheDocument();
  });

  it('Escape closes without a change and does not reach the page', () => {
    const onChoose = vi.fn();
    const outer = vi.fn();
    render(<Picker initial={0} onChoose={onChoose} />);
    key(button(), 'Enter');
    key(list(), 'ArrowDown');
    window.addEventListener('keydown', outer);
    key(list(), 'Escape');
    window.removeEventListener('keydown', outer);
    expect(screen.queryByRole('listbox')).toBeNull();
    expect(onChoose).not.toHaveBeenCalled();
    expect(button()).toHaveFocus();
    expect(outer).not.toHaveBeenCalled();
  });

  it('Tab closes the list at once and leaves focus on the button, not the page', () => {
    render(<Picker />);
    key(button(), 'Enter');
    const tab = key(list(), 'Tab');
    // Removed synchronously, before the browser would move focus on.
    expect(screen.queryByRole('listbox')).toBeNull();
    expect(button()).toHaveFocus();
    // Tab is left to the browser, so it carries on to the next control.
    expect(tab).toBe(true);
    key(button(), 'Enter');
    expect(key(list(), 'Tab', { shiftKey: true })).toBe(false);
    expect(button()).toHaveFocus();
  });

  it('scrolls the list, never the page, to keep the active option in view', () => {
    const into = vi.fn();
    Element.prototype.scrollIntoView = into;
    render(<Picker />);
    key(button(), 'Enter');
    const ul = list();
    Object.defineProperty(ul, 'scrollHeight', { value: 300, configurable: true });
    Object.defineProperty(ul, 'clientHeight', { value: 100, configurable: true });
    screen.getAllByRole('option').forEach((o, i) => {
      Object.defineProperty(o, 'offsetTop', { value: i * 40, configurable: true });
      Object.defineProperty(o, 'offsetHeight', { value: 40, configurable: true });
    });
    key(ul, 'End');
    expect(ul.scrollTop).toBe(6 * 40 + 40 - 100);
    key(ul, 'Home');
    expect(ul.scrollTop).toBe(0);
    expect(into).not.toHaveBeenCalled();
  });

  it('a press outside closes it', () => {
    render(<Picker />);
    fireEvent.click(button());
    expect(list()).toBeInTheDocument();
    fireEvent.mouseDown(screen.getByRole('button', { name: 'After' }));
    expect(screen.queryByRole('listbox')).toBeNull();
  });

  it('has no axe violations while open', async () => {
    render(<Picker initial={1} />);
    key(button(), 'Enter');
    await expectNoA11yViolations(document.body);
  });
});
