import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Shelf } from '../packages/ui/src/index.js';

/**
 * Moving a thing between two places.
 *
 * The guards that carry the weight are the keyboard ones. A drag-only control is one a keyboard
 * cannot operate at all, and in an audited product the people most likely to be using one — a CRO,
 * a compliance officer, an auditor — are exactly the people it is for.
 */
const ZONES: [{ id: string; title: string; empty: string }, { id: string; title: string; empty: string }] = [
  { id: 'on', title: 'Working with', empty: 'Nothing yet' },
  { id: 'off', title: 'Available', empty: 'Nothing left' },
];

const shelf = (over: Record<string, unknown> = {}) => (
  <Shelf
    zones={ZONES}
    items={{
      on: [{ id: 'pm', name: 'Project Management', fixed: 'Applies to every project' }],
      off: [{ id: 'sox', name: 'SOX 404', note: 'Not taken down yet' }],
    }}
    onMove={vi.fn()}
    {...over}
  />
);

const grip = (name: string) => screen.getByRole('button', { name: `Move ${name}` });

describe('Shelf — a keyboard can do everything a pointer can', () => {
  it('picks up, moves and drops with the keyboard alone', async () => {
    const onMove = vi.fn();
    const u = userEvent.setup();
    render(shelf({ onMove }));

    grip('SOX 404').focus();
    await u.keyboard(' ');
    expect(grip('SOX 404')).toHaveAttribute('aria-pressed', 'true');

    await u.keyboard('{ArrowLeft}');
    await u.keyboard(' ');

    expect(onMove).toHaveBeenCalledWith('sox', 'on');
  });

  it('says what happened, because a reader who cannot see the lift has no other way to know', async () => {
    const u = userEvent.setup();
    render(shelf());

    grip('SOX 404').focus();
    await u.keyboard(' ');

    const live = document.querySelector('[aria-live="polite"]');
    expect(live?.textContent).toContain('picked up');
    expect(live?.textContent).toContain('space to drop');
  });

  it('names where it would land, so arrows are not pressed into silence', async () => {
    const u = userEvent.setup();
    render(shelf());
    grip('SOX 404').focus();
    await u.keyboard(' {ArrowLeft}');

    expect(document.querySelector('[aria-live="polite"]')?.textContent).toContain('Working with');
  });

  it('escape leaves it where it was, and keeps the focus', async () => {
    const onMove = vi.fn();
    const u = userEvent.setup();
    render(shelf({ onMove }));

    grip('SOX 404').focus();
    await u.keyboard(' {ArrowLeft}{Escape}');

    expect(onMove).not.toHaveBeenCalled();
    // Losing focus here would END the interaction rather than cancelling it.
    expect(grip('SOX 404')).toHaveFocus();
  });

  it('dropping where it started moves nothing', async () => {
    const onMove = vi.fn();
    const u = userEvent.setup();
    render(shelf({ onMove }));

    grip('SOX 404').focus();
    await u.keyboard('  ');   // pick up, drop again

    expect(onMove).not.toHaveBeenCalled();
    expect(document.querySelector('[aria-live="polite"]')?.textContent).toContain('put back');
  });
});

describe('Shelf — what cannot move says so first', () => {
  it('offers no grip on a fixed item', () => {
    // A control that exists and refuses invites the attempt it refuses.
    render(shelf());
    expect(screen.queryByRole('button', { name: 'Move Project Management' })).toBeNull();
  });

  it('shows the reason instead of the note', () => {
    render(shelf());
    expect(screen.getByText('Applies to every project')).toBeInTheDocument();
  });
});

describe('Shelf — the row opens, the grip drags', () => {
  it('a click on the row opens the item', async () => {
    const onOpen = vi.fn();
    const u = userEvent.setup();
    render(shelf({ onOpen }));

    await u.click(screen.getByText('SOX 404'));
    expect(onOpen).toHaveBeenCalledWith('sox');
  });

  it('a click on the grip does not', async () => {
    // If the whole row were draggable, every click would begin a drag nobody asked for — and if
    // the grip opened the item, every attempt to drag would navigate away.
    const onOpen = vi.fn();
    const u = userEvent.setup();
    render(shelf({ onOpen }));

    await u.click(grip('SOX 404'));
    expect(onOpen).not.toHaveBeenCalled();
  });
});

describe('Shelf — the pointer path is the same mechanism', () => {
  it('a drop on a zone moves the item', () => {
    const onMove = vi.fn();
    render(shelf({ onMove }));

    fireEvent.dragStart(grip('SOX 404'));
    const target = screen.getByText('Working with').closest('.shelf-zone')!;
    fireEvent.dragOver(target);
    fireEvent.drop(target);

    expect(onMove).toHaveBeenCalledWith('sox', 'on');
  });

  it('marks the zone it would land in', () => {
    render(shelf());
    fireEvent.dragStart(grip('SOX 404'));
    const target = screen.getByText('Working with').closest('.shelf-zone')!;
    fireEvent.dragOver(target);

    expect(target).toHaveAttribute('data-over');
  });
});

describe('a shelf in a rail', () => {
  it('keeps its two places stacked when the room it has is not the room the window has', () => {
    // The zones go side by side at a 900px WINDOW. A shelf living in a 260px rail never has that
    // room however wide the window is, and the media query cannot see the difference — so the two
    // zones sat as two 120px columns with a word per line in each.
    const { container } = render(
      <Shelf layout="stack" zones={ZONES} items={{ on: [{ id: 'sox', name: 'SOX' }], off: [] }}
        onMove={() => {}} />,
    );

    expect(container.querySelector('.shelf')?.getAttribute('data-layout')).toBe('stack');
  });
});
