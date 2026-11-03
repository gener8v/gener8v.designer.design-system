// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { Kbd, ShortcutList, stepIndex, useListKeys } from '../packages/ui/src/index.js';
import { expectNoA11yViolations } from './a11y.js';

/**
 * Keys drawn as keys, and a list moved through from the keyboard the way a triage inbox is: real
 * focus, one tab stop, and never while somebody is typing or a dialog owns the keyboard.
 */
afterEach(cleanup);

const FINDINGS = ['Three hierarchies in use', 'Nightly extract corrects itself', 'Board pack closes early'];

function Triage({ onOpen = vi.fn(), accept = vi.fn(), enabled = true }) {
  const { itemProps, active } = useListKeys({ count: FINDINGS.length, onOpen, keys: { a: accept }, enabled });
  return (
    <main>
      <input aria-label="Reason" />
      <ul aria-label="Findings">
        {FINDINGS.map((f, i) => <li key={f} {...itemProps(i)}>{f}</li>)}
      </ul>
      <p data-testid="active">{active}</p>
    </main>
  );
}

const item = (i: number) => screen.getByText(FINDINGS[i]!);
const press = (key: string, target: Element | Window = window) => fireEvent.keyDown(target, { key });

describe('keys', () => {
  it('draws a key as <kbd>', () => {
    render(<p>Press <Kbd>J</Kbd></p>);
    expect(screen.getByText('J').tagName).toBe('KBD');
    expect(screen.getByText('J')).toHaveClass('kbd');
  });

  it('lists shortcuts as terms and descriptions, with glyphs given spoken names', () => {
    render(<ShortcutList items={[
      { keys: ['J', '↓'], does: 'Next finding' },
      { keys: [['⇧', '?']], does: 'Show these keys' },
    ]} />);
    const terms = screen.getAllByRole('term');
    expect(terms[0]).toHaveTextContent(/^J\s*or\s*↓Down Arrow$/);
    expect(screen.getByText('Down Arrow')).toHaveClass('sr-only');
    expect(terms[1]).toHaveTextContent('Shift');
    expect(screen.getAllByRole('definition')[0]).toHaveTextContent('Next finding');
  });
});

describe('moving through a list', () => {
  it('holds at the ends, or wraps when asked', () => {
    expect(stepIndex(-1, 3, 1)).toBe(0);
    expect(stepIndex(2, 3, 1)).toBe(2);
    expect(stepIndex(2, 3, 1, true)).toBe(0);
    expect(stepIndex(0, 3, -1, true)).toBe(2);
    expect(stepIndex(0, 0, 1)).toBe(-1);
  });

  it('keeps one item in the tab order, and moves real focus with J and K', () => {
    render(<Triage />);
    expect(item(0)).toHaveAttribute('tabindex', '0');
    expect(item(1)).toHaveAttribute('tabindex', '-1');
    press('j');
    expect(item(0)).toHaveFocus();
    press('j');
    expect(item(1)).toHaveFocus();
    expect(item(1)).toHaveAttribute('tabindex', '0');
    expect(item(0)).toHaveAttribute('tabindex', '-1');
    press('k');
    expect(item(0)).toHaveFocus();
  });

  it('takes the arrows, Home and End only once focus is in the list', () => {
    render(<Triage />);
    press('ArrowDown');
    expect(document.body).toHaveFocus();
    act(() => { item(0).focus(); });
    press('ArrowDown', item(0));
    expect(item(1)).toHaveFocus();
    press('End', item(1));
    expect(item(2)).toHaveFocus();
    press('Home', item(2));
    expect(item(0)).toHaveFocus();
  });

  it('opens with Enter on the item, and hands bound keys the item with focus', () => {
    const onOpen = vi.fn();
    const accept = vi.fn();
    render(<Triage onOpen={onOpen} accept={accept} />);
    press('j'); press('j');
    press('Enter', item(1));
    expect(onOpen).toHaveBeenCalledWith(1);
    press('A', item(1));
    expect(accept).toHaveBeenCalledWith(1);
  });

  it('never acts while somebody is typing', () => {
    const accept = vi.fn();
    render(<Triage accept={accept} />);
    const reason = screen.getByRole('textbox', { name: 'Reason' });
    reason.focus();
    press('j', reason);
    press('a', reason);
    expect(reason).toHaveFocus();
    expect(accept).not.toHaveBeenCalled();
  });

  it('stands down under a modal dialog, and with a modifier held', () => {
    const accept = vi.fn();
    render(<><Triage accept={accept} /><div role="dialog" aria-modal="true" aria-label="Reject finding" /></>);
    press('j');
    expect(document.body).toHaveFocus();
    cleanup();
    render(<Triage accept={accept} />);
    fireEvent.keyDown(window, { key: 'a', metaKey: true });
    expect(accept).not.toHaveBeenCalled();
  });

  it('does nothing when switched off', () => {
    render(<Triage enabled={false} />);
    press('j');
    expect(document.body).toHaveFocus();
  });

  it('passes axe', async () => {
    const { container } = render(
      <div>
        <Triage />
        <ShortcutList items={[{ keys: ['J', '↓'], does: 'Next finding' }, { keys: [['⇧', '?']], does: 'Show these keys' }]} />
      </div>,
    );
    await expectNoA11yViolations(container);
  });
});
