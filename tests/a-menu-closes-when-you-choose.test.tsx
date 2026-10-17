// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { Menu, MenuItem, MenuLabel, MenuSeparator, MenuSub } from '../packages/ui/src/index.js';

/**
 * Choosing something closes the menu.
 *
 * **It closed on Escape, on Tab, on a press outside and on a second press of
 * its own trigger — and not on the one thing a menu is opened to do.** So the
 * popup stayed over the content the choice had just changed, and the ways out
 * were the ones nobody looks for. A consumer narrowing a register with three
 * `Filter`s met three popups it had to dismiss by hand.
 *
 * What makes it worth a file of its own is everything inside a menu that is
 * *not* a choice: a label, a separator, a disabled row and a `MenuSub`
 * trigger. Dismissing on any of those is a different defect — closing the menu
 * that holds the flyout somebody has just opened is the worst of them.
 */

afterEach(cleanup);

const menu = (onPick = vi.fn()) => (
  <Menu trigger={<button type="button">Account</button>} label="Account">
    <MenuLabel>Signed in</MenuLabel>
    <MenuItem onSelect={onPick}>Profile</MenuItem>
    <MenuSeparator />
    <MenuItem disabled onSelect={onPick}>
      Billing
    </MenuItem>
    <MenuSub label="Theme">
      <MenuItem selected onSelect={onPick}>
        System
      </MenuItem>
      <MenuItem selected={false} onSelect={onPick}>
        Dark
      </MenuItem>
    </MenuSub>
    <MenuItem onSelect={onPick}>Sign out</MenuItem>
  </Menu>
);

const open = () => {
  render(menu());
  fireEvent.click(screen.getByRole('button', { name: 'Account' }));
  return screen.getByRole('menu', { name: 'Account' });
};

const shut = () => screen.queryByRole('menu', { name: 'Account' }) === null;

describe('a menu closes when you choose', () => {
  it('dismisses on a choice', async () => {
    open();
    fireEvent.click(screen.getByRole('menuitem', { name: 'Sign out' }));
    await waitFor(() => expect(shut()).toBe(true));
  });

  /* The pattern's own rule: activating an item returns focus to the trigger,
     so the next Tab carries on from where the reader was. */
  it('gives the trigger its focus back', async () => {
    open();
    fireEvent.click(screen.getByRole('menuitem', { name: 'Profile' }));
    await waitFor(() =>
      expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Account' })),
    );
  });

  it('stays open on the label and on a separator', () => {
    const popup = open();
    fireEvent.click(screen.getByText('Signed in'));
    expect(shut()).toBe(false);

    fireEvent.click(popup.querySelector('hr')!);
    expect(shut()).toBe(false);
  });

  /* A disabled row refuses to select; dismissing on it would say the press
     did something. */
  it('stays open on a row that refuses', () => {
    open();
    fireEvent.click(screen.getByRole('menuitem', { name: 'Billing' }));
    expect(shut()).toBe(false);
  });

  /**
   * The one that would be worst to get wrong: a submenu's trigger is a
   * `menuitem` of this menu, and its press opens the flyout rather than
   * choosing anything.
   */
  it('stays open when a flyout is opened from it', async () => {
    open();
    fireEvent.click(screen.getByRole('menuitem', { name: /Theme/ }));
    await waitFor(() => expect(screen.getByRole('menuitemradio', { name: 'Dark' })).toBeTruthy());
    expect(shut()).toBe(false);
  });

  /** And closes once the choice inside the flyout is made. */
  it('dismisses on a choice made inside a flyout', async () => {
    open();
    fireEvent.click(screen.getByRole('menuitem', { name: /Theme/ }));
    const chosen = await screen.findByRole('menuitemradio', { name: 'Dark' });
    fireEvent.click(chosen);
    await waitFor(() => expect(shut()).toBe(true));
  });
});
