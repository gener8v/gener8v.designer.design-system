import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Menu, MenuItem, MenuSub } from '../packages/ui/src/index.js';

/**
 * A menu item that opens a menu.
 *
 * A flat menu that groups with headings grows with every group: the account
 * settings sink further down a list somebody opened for one of them, and a
 * heading over a single row spends a line saying a thing exists and another
 * being it.
 *
 * The behaviour worth holding is the part that is easy to get wrong — the
 * parent must not steer the child's rows. A submenu renders its own
 * `role="menu"` inside the parent's DOM, so a plain query hands the parent its
 * child's items and arrowing down the account menu walks into the open flyout
 * and out the other side.
 */
describe('MenuSub — a menu item that opens a menu', () => {
  const menu = (onPick = vi.fn()) => (
    <Menu trigger={<button type="button">Account</button>} label="Account">
      <MenuItem onSelect={vi.fn()}>Profile</MenuItem>
      <MenuSub label="Theme">
        <MenuItem selected onSelect={onPick}>System</MenuItem>
        <MenuItem selected={false} onSelect={onPick}>Light</MenuItem>
        <MenuItem selected={false} onSelect={onPick}>Dark</MenuItem>
      </MenuSub>
      <MenuItem onSelect={vi.fn()}>Sign out</MenuItem>
    </Menu>
  );

  const open = async () => {
    render(menu());
    screen.getByRole('button', { name: 'Account' }).click();
    return await screen.findByRole('menuitem', { name: /Theme/ });
  };

  it('says it opens a menu, and says whether it is open', async () => {
    const trigger = await open();
    expect(trigger.getAttribute('aria-haspopup')).toBe('menu');
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
  });

  it('opens on ArrowRight and lands on the first choice', async () => {
    const trigger = await open();
    fireEvent.keyDown(trigger, { key: 'ArrowRight' });
    await waitFor(() => expect(trigger.getAttribute('aria-expanded')).toBe('true'));
    await waitFor(() => expect(document.activeElement?.textContent).toContain('System'));
  });

  it('closes on ArrowLeft and gives the row back its focus', async () => {
    const trigger = await open();
    fireEvent.keyDown(trigger, { key: 'ArrowRight' });
    await waitFor(() => expect(trigger.getAttribute('aria-expanded')).toBe('true'));

    const sub = screen.getByRole('menu', { name: 'Theme' });
    fireEvent.keyDown(sub, { key: 'ArrowLeft' });
    await waitFor(() => expect(trigger.getAttribute('aria-expanded')).toBe('false'));
    expect(document.activeElement).toBe(trigger);
  });

  /**
   * The one that would rot silently. Both menus are in the same DOM, so a
   * parent that queries for every `menuitem` inside itself walks into its
   * child — and the fault reads as "the arrow keys are odd" rather than as a
   * bug with a cause.
   */
  it('does not steer its child: the parent arrows over four rows, not seven', async () => {
    const trigger = await open();
    fireEvent.keyDown(trigger, { key: 'ArrowRight' });
    await waitFor(() => expect(trigger.getAttribute('aria-expanded')).toBe('true'));

    const parent = screen.getByRole('menu', { name: 'Account' });
    const seen: string[] = [];
    for (let i = 0; i < 4; i += 1) {
      fireEvent.keyDown(parent, { key: 'ArrowDown' });
      seen.push(document.activeElement?.textContent ?? '');
    }
    /* Profile, Theme, Sign out — and back to Profile. Never System or Dark. */
    expect(seen.some((t) => /System|Light|Dark/.test(t))).toBe(false);
  });

  it('carries a choice through, and the flyout is a radio group of its own', async () => {
    const onPick = vi.fn();
    render(menu(onPick));
    screen.getByRole('button', { name: 'Account' }).click();
    const trigger = await screen.findByRole('menuitem', { name: /Theme/ });
    fireEvent.keyDown(trigger, { key: 'ArrowRight' });

    const choices = await screen.findAllByRole('menuitemradio');
    expect(choices.map((c) => c.getAttribute('aria-checked'))).toEqual(['true', 'false', 'false']);
    choices[2]!.click();
    expect(onPick).toHaveBeenCalledOnce();
  });
});
