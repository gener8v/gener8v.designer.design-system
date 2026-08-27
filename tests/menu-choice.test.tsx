import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Menu, MenuItem } from '../packages/ui/src/index.js';

/**
 * A mark must not move the thing it marks.
 *
 * A menu of choices drew a tick on the chosen row and nothing on the others, so that row's label
 * sat one icon plus one gap to the right of every other row's. Reading which project was current
 * meant reading an indent, and choosing a different one made the whole list shuffle.
 */
describe('Menu — a menu of choices', () => {
  const menu = (current: string) => (
    <Menu trigger={<button type="button">Project</button>} label="Project">
      {['personify', 'vafb', 'demo'].map((p) => (
        <MenuItem key={p} selected={p === current} onSelect={vi.fn()}>{p}</MenuItem>
      ))}
    </Menu>
  );

  it('is a radio group, so a reader is told which is checked', async () => {
    render(menu('demo'));
    screen.getByRole('button', { name: 'Project' }).click();

    const items = await screen.findAllByRole('menuitemradio');
    expect(items).toHaveLength(3);
    expect(items.map((i) => i.getAttribute('aria-checked'))).toEqual(['false', 'false', 'true']);
  });

  it('reserves the mark on every row, not only the chosen one', async () => {
    // The fix, stated as the thing that was wrong: the mark is in the DOM for all three, and
    // hidden rather than absent on the two that are not chosen — so every label starts at the
    // same place and nothing moves when the choice moves.
    render(menu('demo'));
    screen.getByRole('button', { name: 'Project' }).click();

    const items = await screen.findAllByRole('menuitemradio');
    for (const item of items) expect(item.querySelector('.menu-mark')).not.toBeNull();
  });

  it('leaves a menu of actions without a mark column', async () => {
    // A list of things to DO is not a list of things to choose between, and giving it a gutter for
    // a mark it never draws indents every action for no reason.
    render(
      <Menu trigger={<button type="button">More</button>} label="More">
        <MenuItem onSelect={vi.fn()}>Rename</MenuItem>
        <MenuItem onSelect={vi.fn()}>Delete</MenuItem>
      </Menu>,
    );
    screen.getByRole('button', { name: 'More' }).click();

    const items = await screen.findAllByRole('menuitem');
    expect(items).toHaveLength(2);
    for (const item of items) expect(item.querySelector('.menu-mark')).toBeNull();
  });
});
