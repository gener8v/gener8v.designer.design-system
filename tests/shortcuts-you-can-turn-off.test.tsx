// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { useState } from 'react';
import {
  ShortcutsProvider, ShortcutHelp, useShortcuts, closeTopLayer, readSingleKeys, writeSingleKeys,
  SHORTCUTS_STORAGE_KEY,
} from '../packages/ui/src/index.js';
import { expectNoA11yViolations } from './a11y.js';

/**
 * Page keys that stand down while somebody types, that one switch turns off (WCAG 2.1.4) and
 * that stay off next visit, Escape that takes away one thing at a time, and one list of every key
 * the screens on the page have bound.
 */
beforeEach(() => window.localStorage.clear());
afterEach(() => { cleanup(); vi.restoreAllMocks(); });

const press = (key: string, init: Partial<KeyboardEventInit> = {}, target: Element | Window = window) =>
  fireEvent.keyDown(target, { key, ...init });

function Inbox({ next = vi.fn(), done = vi.fn(), enabled = true }) {
  const [menu, setMenu] = useState(true);
  const [search, setSearch] = useState('draft');
  useShortcuts([
    { key: ['j', 'ArrowDown'], does: 'Next message', run: next },
    { key: 'e', does: 'Mark done', run: done },
    {
      key: 'Escape',
      does: 'Close or clear, one thing at a time',
      run: () => closeTopLayer([
        { open: menu, close: () => setMenu(false) },
        { open: search !== '', close: () => setSearch('') },
      ]),
    },
  ], { title: 'Inbox', enabled });
  return (
    <main>
      <input aria-label="Search" value={search} onChange={(e) => setSearch(e.target.value)} />
      <button type="button">Reply</button>
      <p data-testid="menu">{menu ? 'menu open' : 'menu closed'}</p>
    </main>
  );
}

function Everywhere({ find = vi.fn() }) {
  useShortcuts([{ key: '/', does: 'Search', run: find }], { title: 'Everywhere' });
  return null;
}

describe('useShortcuts', () => {
  it('runs a single key, either case, and takes the event', () => {
    const next = vi.fn();
    render(<ShortcutsProvider><Inbox next={next} /></ShortcutsProvider>);
    expect(press('j')).toBe(false);
    press('J', { shiftKey: true });
    press('ArrowDown');
    expect(next).toHaveBeenCalledTimes(3);
  });

  it('stands down while typing in a field', () => {
    const next = vi.fn();
    render(<ShortcutsProvider><Inbox next={next} /></ShortcutsProvider>);
    expect(press('j', {}, screen.getByLabelText('Search'))).toBe(true);
    expect(next).not.toHaveBeenCalled();
  });

  it('stands down with Ctrl, Meta or Alt held', () => {
    const done = vi.fn();
    render(<ShortcutsProvider><Inbox done={done} /></ShortcutsProvider>);
    press('e', { ctrlKey: true });
    press('e', { metaKey: true });
    press('e', { altKey: true });
    expect(done).not.toHaveBeenCalled();
  });

  it('stands down under a modal dialog', () => {
    const done = vi.fn();
    render(<ShortcutsProvider><Inbox done={done} /><div role="dialog" aria-modal="true" aria-label="Settings" /></ShortcutsProvider>);
    press('e');
    expect(done).not.toHaveBeenCalled();
  });

  it('leaves a key another handler already took', () => {
    const done = vi.fn();
    render(<ShortcutsProvider><Inbox done={done} /></ShortcutsProvider>);
    const e = new KeyboardEvent('keydown', { key: 'e', bubbles: true, cancelable: true });
    e.preventDefault();
    act(() => { window.dispatchEvent(e); });
    expect(done).not.toHaveBeenCalled();
  });

  it('leaves Enter on a button to the button', () => {
    const open = vi.fn();
    function Page() {
      useShortcuts([{ key: 'Enter', run: open }]);
      return <main><button type="button">Reply</button></main>;
    }
    render(<Page />);
    press('Enter', {}, screen.getByRole('button', { name: 'Reply' }));
    expect(open).not.toHaveBeenCalled();
    press('Enter');
    expect(open).toHaveBeenCalledTimes(1);
  });

  it('is off while not enabled', () => {
    const next = vi.fn();
    render(<ShortcutsProvider><Inbox next={next} enabled={false} /></ShortcutsProvider>);
    press('j');
    expect(next).not.toHaveBeenCalled();
  });

  it('Escape closes one layer per press, works inside a field, and is left alone when nothing is open', () => {
    render(<ShortcutsProvider><Inbox /></ShortcutsProvider>);
    const search = screen.getByLabelText('Search');
    expect(press('Escape', {}, search)).toBe(false);
    expect(screen.getByTestId('menu')).toHaveTextContent('menu closed');
    expect(search).toHaveValue('draft');
    press('Escape', {}, search);
    expect(search).toHaveValue('');
    expect(press('Escape')).toBe(true);
  });
});

describe('the single-key off-switch (WCAG 2.1.4)', () => {
  it('turns single keys off and leaves Escape and the arrows working', () => {
    const next = vi.fn();
    const done = vi.fn();
    render(<ShortcutsProvider><Inbox next={next} done={done} /><ShortcutHelp /></ShortcutsProvider>);
    const toggle = screen.getByRole('switch', { name: /Single-key shortcuts/ });
    expect(toggle).toBeChecked();
    fireEvent.click(toggle);
    expect(toggle).not.toBeChecked();
    press('e');
    press('j');
    expect(done).not.toHaveBeenCalled();
    expect(next).not.toHaveBeenCalled();
    press('ArrowDown');
    expect(next).toHaveBeenCalledTimes(1);
    press('Escape');
    expect(screen.getByTestId('menu')).toHaveTextContent('menu closed');
  });

  it('is stored, and read back on the next visit', () => {
    const { unmount } = render(<ShortcutsProvider><ShortcutHelp /></ShortcutsProvider>);
    fireEvent.click(screen.getByRole('switch'));
    expect(window.localStorage.getItem(SHORTCUTS_STORAGE_KEY)).toBe('off');
    unmount();
    const done = vi.fn();
    render(<ShortcutsProvider><Inbox done={done} /><ShortcutHelp /></ShortcutsProvider>);
    expect(screen.getByRole('switch')).not.toBeChecked();
    press('e');
    expect(done).not.toHaveBeenCalled();
  });

  it('is kept per person under the key it is given', () => {
    render(<ShortcutsProvider storageKey="g8v.shortcuts.person-2"><ShortcutHelp /></ShortcutsProvider>);
    fireEvent.click(screen.getByRole('switch'));
    expect(window.localStorage.getItem('g8v.shortcuts.person-2')).toBe('off');
    expect(window.localStorage.getItem(SHORTCUTS_STORAGE_KEY)).toBeNull();
  });

  it('survives storage that throws: on by default, and the switch still works for the visit', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => { throw new Error('denied'); });
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('quota'); });
    expect(readSingleKeys()).toBe(true);
    expect(() => writeSingleKeys(false)).not.toThrow();
    const done = vi.fn();
    render(<ShortcutsProvider><Inbox done={done} /><ShortcutHelp /></ShortcutsProvider>);
    press('e');
    expect(done).toHaveBeenCalledTimes(1);
    fireEvent.click(screen.getByRole('switch'));
    press('e');
    expect(done).toHaveBeenCalledTimes(1);
  });

  it('survives storage that is missing altogether', () => {
    const real = Object.getOwnPropertyDescriptor(window, 'localStorage')!;
    Object.defineProperty(window, 'localStorage', { get: () => { throw new Error('blocked'); }, configurable: true });
    try {
      expect(readSingleKeys(SHORTCUTS_STORAGE_KEY, false)).toBe(false);
      expect(() => writeSingleKeys(true)).not.toThrow();
    } finally {
      Object.defineProperty(window, 'localStorage', real);
    }
  });

  it('honours the stored switch even without a provider', () => {
    window.localStorage.setItem(SHORTCUTS_STORAGE_KEY, 'off');
    const done = vi.fn();
    render(<Inbox done={done} />);
    press('e');
    expect(done).not.toHaveBeenCalled();
  });
});

describe('ShortcutHelp', () => {
  it('lists every screen\'s registered keys, by screen, with the switch', async () => {
    render(
      <ShortcutsProvider>
        <Inbox />
        <Everywhere />
        <div role="dialog" aria-label="Keyboard shortcuts"><ShortcutHelp /></div>
      </ShortcutsProvider>,
    );
    const inbox = screen.getByRole('region', { name: 'Inbox' });
    expect(inbox).toHaveTextContent('Next message');
    expect(inbox).toHaveTextContent('Down Arrow');
    expect(inbox).toHaveTextContent('Esc');
    expect(screen.getByRole('region', { name: 'Everywhere' })).toHaveTextContent('Search');
    expect(screen.getAllByRole('term').map((t) => t.textContent)).toContain('E');
    await expectNoA11yViolations(document.body);
  });

  it('drops a screen\'s keys when it unmounts or is disabled', () => {
    function Page({ show, on }: { show: boolean; on: boolean }) {
      return (
        <ShortcutsProvider>
          {show ? <Inbox enabled={on} /> : null}
          <Everywhere />
          <ShortcutHelp />
        </ShortcutsProvider>
      );
    }
    const { rerender } = render(<Page show on />);
    expect(screen.queryByRole('region', { name: 'Inbox' })).not.toBeNull();
    rerender(<Page show on={false} />);
    expect(screen.queryByRole('region', { name: 'Inbox' })).toBeNull();
    rerender(<Page show on />);
    expect(screen.queryByRole('region', { name: 'Inbox' })).not.toBeNull();
    rerender(<Page show={false} on />);
    expect(screen.queryByRole('region', { name: 'Inbox' })).toBeNull();
    expect(screen.getByRole('region', { name: 'Everywhere' })).toBeInTheDocument();
  });

  it('says so when nothing is bound', () => {
    render(<ShortcutsProvider><main><ShortcutHelp /></main></ShortcutsProvider>);
    expect(screen.getByText('This page has no keyboard shortcuts.')).toBeInTheDocument();
  });
});
