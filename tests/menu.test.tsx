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

/**
 * A menu longer than its side has room for.
 *
 * The width was held against the viewport and the height was not, so a long menu — a dozen draft
 * versions, say — ran past the bottom of a laptop screen. `.menu-popup` is FIXED: the page scrolls
 * under it, so the rows past the edge could not be reached by pointer or by arrow key.
 *
 * The cap is the room the chosen side actually has, which is why it is measured rather than typed:
 * no static value knows where the trigger is.
 */
describe('Menu — held to the room it has', () => {
  // The hook's defaults for the gap to the anchor and the distance kept from the viewport edge.
  // Written out because the arithmetic is the whole of what these cases check.
  const OFFSET = 6;
  const PADDING = 8;
  // jsdom reports a nought-high document and a nought-sized rect for everything, so a case about
  // room has to say how much room there is.
  const VIEWPORT = 800;

  const rect = (top: number, height: number): DOMRect => ({
    top, bottom: top + height, left: 0, right: 120, width: 120, height,
    x: 0, y: top, toJSON: () => ({}),
  }) as DOMRect;

  const viewport = () =>
    vi.spyOn(document.documentElement, 'clientHeight', 'get').mockReturnValue(VIEWPORT);

  it('is capped to the room below its trigger', async () => {
    const u = userEvent.setup();
    viewport();
    const { trigger } = setup();
    vi.spyOn(trigger, 'getBoundingClientRect').mockReturnValue(rect(0, 20));

    await u.click(trigger);

    expect(screen.getByRole('menu').style.maxBlockSize)
      .toBe(`${VIEWPORT - 20 - OFFSET - PADDING}px`);
  });

  it('shrinks the cap as the trigger moves down the screen', async () => {
    const u = userEvent.setup();
    viewport();
    const { trigger } = setup();
    const room = 40;
    vi.spyOn(trigger, 'getBoundingClientRect').mockReturnValue(rect(VIEWPORT - room - 20, 20));

    await u.click(trigger);

    expect(screen.getByRole('menu').style.maxBlockSize).toBe(`${room - OFFSET - PADDING}px`);
  });

  /**
   * The one that was unreachable rather than merely clipped.
   *
   * A menu taller than the screen, triggered at the bottom, flips above its anchor — and the
   * placement subtracted the height it WANTED. The top came out negative, which on a fixed element
   * is off the edge of the window with nothing able to scroll to it.
   */
  it('never places itself above the top of the screen', async () => {
    const u = userEvent.setup();
    viewport();
    const { trigger } = setup();
    vi.spyOn(Element.prototype, 'getBoundingClientRect').mockImplementation(function (this: Element) {
      if (this === trigger) return rect(VIEWPORT - 2, 4);
      if (this.getAttribute('role') === 'menu') return rect(0, 900);
      return rect(0, 0);
    });

    await u.click(trigger);

    const menu = screen.getByRole('menu');
    expect(Number.parseFloat(menu.style.top)).toBeGreaterThanOrEqual(0);
    expect(menu.style.maxBlockSize).toBe(`${VIEWPORT - 2 - OFFSET - PADDING}px`);
  });
});
