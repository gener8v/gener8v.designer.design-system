import { describe, expect, it, afterEach } from 'vitest';
import { render, cleanup, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button, Menu, MenuIdentity, MenuItem } from '../packages/ui/src/index.js';

/**
 * The account menu's header is a fact, not a destination.
 *
 * The tempting shortcut is to build it out of `MenuItem` — it already has the padding and the
 * layout. It also has `role="menuitem"`, which puts it in the arrow-key ring and gives it a hover
 * highlight, and a row that lights up under the cursor is a row somebody will try to click. There
 * is nothing there to click.
 */
afterEach(cleanup);

const account = (
  <Menu label="Account" trigger={<Button aria-label="Account" iconOnly>·</Button>}>
    <MenuIdentity name="Thomas Eaves" detail="thomas@gener8v.com" />
    <MenuItem>Settings</MenuItem>
    <MenuItem>Sign out</MenuItem>
  </Menu>
);

describe('an account menu', () => {
  it('opens onto the first thing you can actually do, not onto your own name', async () => {
    const user = userEvent.setup();
    render(account);

    await user.click(screen.getByLabelText('Account'));

    expect(document.activeElement).toBe(screen.getByRole('menuitem', { name: 'Settings' }));
  });

  it('does not stop on the identity when arrowing round the ring', async () => {
    const user = userEvent.setup();
    render(account);
    await user.click(screen.getByLabelText('Account'));

    // Two items, so a third press must be back at the first — unless the identity joined the ring.
    await user.keyboard('{ArrowDown}{ArrowDown}');

    expect(document.activeElement).toBe(screen.getByRole('menuitem', { name: 'Settings' }));
  });

  it('shows the detail that tells two accounts apart', async () => {
    const user = userEvent.setup();
    render(account);
    await user.click(screen.getByLabelText('Account'));

    expect(screen.getByText('thomas@gener8v.com')).toBeTruthy();
    // Initials come from the name, so the glyph is not a second thing to keep in step.
    expect(screen.getByText('TE')).toBeTruthy();
  });
});
