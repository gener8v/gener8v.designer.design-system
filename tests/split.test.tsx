import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { fireEvent } from '@testing-library/react';
import { Split } from '../packages/ui/src/index.js';

/**
 * A pane the reader sizes, and collapses.
 *
 * A fixed side panel is a guess about content nobody has seen. It was wrong on the record's vault,
 * where twenty-four document names — the one thing the panel exists to show — were each clipped
 * mid-word beside an empty gutter.
 */
const split = (props = {}) => (
  <Split label="Resize the list" aside={<p>the list</p>} {...props}>
    <p>the document</p>
  </Split>
);

const handle = () => screen.getByRole('separator');
const aside = () => document.querySelector('.split-aside') as HTMLElement;

describe('Split — the WAI-ARIA window splitter', () => {
  it('reports its position rather than only showing it', () => {
    render(split({ initial: 300, max: 600 }));
    expect(handle()).toHaveAttribute('aria-orientation', 'vertical');
    expect(handle()).toHaveAttribute('aria-valuenow', '300');
    expect(handle()).toHaveAttribute('aria-valuemax', '600');
    expect(handle()).toHaveAccessibleName('Resize the list');
  });

  it('resizes with the arrows and stays inside its bounds', async () => {
    const u = userEvent.setup();
    const onResize = vi.fn();
    render(split({ initial: 200, min: 180, max: 240, onResize }));
    await u.tab();
    expect(handle()).toHaveFocus();          // one Tab stop, and it is reachable

    await u.keyboard('{ArrowRight}');
    expect(onResize).toHaveBeenLastCalledWith(224);
    await u.keyboard('{ArrowRight}');
    expect(onResize).toHaveBeenLastCalledWith(240);   // clamped at max, not 248
    await u.keyboard('{ArrowLeft}{ArrowLeft}{ArrowLeft}');
    expect(onResize).toHaveBeenLastCalledWith(180);   // clamped at min
  });

  it('collapses on Enter and reports zero while shut', async () => {
    // A separator that reports 288 while the panel is closed is reporting the wrong thing.
    const u = userEvent.setup();
    render(split({ initial: 288 }));
    await u.tab();
    await u.keyboard('{Enter}');

    expect(handle()).toHaveAttribute('aria-valuenow', '0');
    expect(document.querySelector('.split[data-collapsed]')).not.toBeNull();
  });

  it('collapses on a click, which is not a zero-length drag', () => {
    // The handle is the same element for both gestures, so they are told apart on release. Without
    // the slop, the two-pixel wobble of a real click reads as a drag and the panel never collapses
    // — which is how a click-to-collapse handle feels broken.
    const onCollapse = vi.fn();
    render(split({ onCollapse }));

    fireEvent.pointerDown(handle(), { clientX: 300 });
    fireEvent.pointerMove(window, { clientX: 302 });   // inside the slop
    fireEvent.pointerUp(window, { clientX: 302 });

    expect(onCollapse).toHaveBeenCalledWith(true);
  });

  it('does not collapse when the press was a real drag', () => {
    // Toggling here would undo the width the reader just chose.
    const onCollapse = vi.fn();
    const onResize = vi.fn();
    render(split({ initial: 280, max: 600, onCollapse, onResize }));

    fireEvent.pointerDown(handle(), { clientX: 300 });
    fireEvent.pointerMove(window, { clientX: 380 });
    fireEvent.pointerUp(window, { clientX: 380 });

    expect(onResize).toHaveBeenLastCalledWith(360);
    expect(onCollapse).not.toHaveBeenCalled();
  });

  it('gives the panel back on a drag out from collapsed', () => {
    // The handle is the only way back, so dragging it must reopen rather than do nothing.
    const onCollapse = vi.fn();
    render(split({ collapsed: true, min: 180, onCollapse }));

    fireEvent.pointerDown(handle(), { clientX: 100 });
    fireEvent.pointerMove(window, { clientX: 200 });
    fireEvent.pointerUp(window, { clientX: 200 });

    expect(onCollapse).toHaveBeenCalledWith(false);
  });

  it('hides the panel from the accessibility tree when collapsed, not just from view', () => {
    render(split({ collapsed: true }));
    expect(aside()).not.toBeVisible();
  });

  it('comes back at least as wide as its own minimum', () => {
    // A panel that reopens below `min` is a panel whose minimum means nothing, and the reader has
    // to drag it out before they can read what they just reopened. Seen on a real screen: it came
    // back at half the width it was set to.
    // Starts SHUT and holding a width below the minimum, so the click under test is the reopen —
    // which is the only call that can be wrong. The first version of this test started open, so
    // the click collapsed instead and the only value recorded was 0. It passed whatever the
    // component did.
    const onResize = vi.fn();
    render(split({ initial: 40, min: 200, collapsed: true, onResize }));

    fireEvent.pointerDown(handle(), { clientX: 100 });
    fireEvent.pointerUp(window, { clientX: 100 });   // a click: toggles it open

    expect(onResize).toHaveBeenCalledWith(200);
  });
});
