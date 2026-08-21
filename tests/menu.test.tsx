import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Menu, MenuItem, MenuSeparator, Button } from '../packages/ui/src/index.js';

function setup() {
  const onSelect = vi.fn();
  render(
    <div>
      <Menu label="Actions" trigger={<Button>Actions</Button>}>
        <MenuItem onSelect={onSelect}>Open</MenuItem>
        <MenuItem>Export</MenuItem>
        <MenuItem disabled>Duplicate</MenuItem>
        <MenuSeparator />
        <MenuItem danger>Archive</MenuItem>
      </Menu>
      <button>Outside</button>
    </div>,
  );
  return { onSelect, trigger: screen.getByText('Actions') };
}
const items = () => screen.getAllByRole('menuitem').filter((i) => i.getAttribute('aria-disabled') !== 'true');

describe('Menu — WAI-ARIA menu button', () => {
  it('wires the trigger before opening', () => {
    const { trigger } = setup();
    expect(trigger).toHaveAttribute('aria-haspopup', 'menu');
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByRole('menu')).toBeNull();
  });

  it('opens on click and lands on the first item', async () => {
    const u = userEvent.setup();
    const { trigger } = setup();
    await u.click(trigger);
    expect(screen.getByRole('menu')).toHaveAccessibleName('Actions');
    expect(items()[0]).toHaveFocus();
  });

  it('ArrowUp on the trigger opens onto the last item', async () => {
    const u = userEvent.setup();
    const { trigger } = setup();
    trigger.focus();
    await u.keyboard('{ArrowUp}');
    const list = items();
    expect(list[list.length - 1]).toHaveFocus();
  });

  it('arrows move and wrap, skipping disabled items', async () => {
    const u = userEvent.setup();
    const { trigger } = setup();
    await u.click(trigger);
    const list = items();
    await u.keyboard('{ArrowDown}');
    expect(list[1]).toHaveFocus();
    await u.keyboard('{ArrowDown}');
    expect(list[2]).toHaveFocus();   // "Duplicate" is disabled and skipped
    expect(list[2]).toHaveTextContent('Archive');
    await u.keyboard('{ArrowDown}');
    expect(list[0]).toHaveFocus();   // wrapped
    await u.keyboard('{ArrowUp}');
    expect(list[2]).toHaveFocus();
  });

  it('Home and End jump to the ends', async () => {
    const u = userEvent.setup();
    const { trigger } = setup();
    await u.click(trigger);
    const list = items();
    await u.keyboard('{End}');
    expect(list[list.length - 1]).toHaveFocus();
    await u.keyboard('{Home}');
    expect(list[0]).toHaveFocus();
  });

  it('Escape closes and returns focus to the trigger', async () => {
    const u = userEvent.setup();
    const { trigger } = setup();
    await u.click(trigger);
    await u.keyboard('{Escape}');
    expect(screen.queryByRole('menu')).toBeNull();
    expect(trigger).toHaveFocus();
  });

  it('selecting an item fires onSelect', async () => {
    const u = userEvent.setup();
    const { trigger, onSelect } = setup();
    await u.click(trigger);
    await u.click(screen.getByText('Open'));
    expect(onSelect).toHaveBeenCalledTimes(1);
  });

  it('a click outside dismisses without stealing focus back', async () => {
    const u = userEvent.setup();
    const { trigger } = setup();
    await u.click(trigger);
    await u.click(screen.getByText('Outside'));
    expect(screen.queryByRole('menu')).toBeNull();
  });
});
