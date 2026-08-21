import { describe, it, expect, vi } from 'vitest';
import { useState } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Dialog, Drawer, Button } from '../packages/ui/src/index.js';

function Harness() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button onClick={() => setOpen(true)}>Open</button>
      <Dialog open={open} onClose={() => setOpen(false)} title="Archive this engagement?"
        actions={<><Button onClick={() => setOpen(false)}>Cancel</Button><Button variant="primary">Archive</Button></>}>
        Nothing is deleted.
      </Dialog>
    </>
  );
}

describe('Dialog', () => {
  it('renders nothing while closed', () => {
    render(<Dialog open={false} onClose={() => {}} title="T" />);
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('labels itself from its own title', () => {
    render(<Dialog open onClose={() => {}} title="Archive?" />);
    expect(screen.getByRole('dialog')).toHaveAccessibleName('Archive?');
  });

  it('moves focus in on open and restores it to the trigger on close', async () => {
    const u = userEvent.setup();
    render(<Harness />);
    const trigger = screen.getByText('Open');
    await u.click(trigger);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toHaveFocus();
    await u.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(trigger).toHaveFocus();
  });

  it('cycles Tab inside the panel', async () => {
    const u = userEvent.setup();
    render(<Harness />);
    await u.click(screen.getByText('Open'));
    const cancel = screen.getByText('Cancel');
    const archive = screen.getByText('Archive');
    expect(cancel).toHaveFocus();
    await u.tab();
    expect(archive).toHaveFocus();
    await u.tab();
    expect(cancel).toHaveFocus();          // wrapped forward
    await u.tab({ shift: true });
    expect(archive).toHaveFocus();         // wrapped backward
  });

  it('locks background scroll and restores it exactly', async () => {
    const u = userEvent.setup();
    document.body.style.overflow = 'scroll';
    render(<Harness />);
    await u.click(screen.getByText('Open'));
    expect(document.body.style.overflow).toBe('hidden');
    await u.keyboard('{Escape}');
    expect(document.body.style.overflow).toBe('scroll');
  });

  it('closes on backdrop click, but not when dismissOnBackdrop is off', async () => {
    const u = userEvent.setup();
    const onClose = vi.fn();
    const { rerender, container } = render(
      <Dialog open onClose={onClose} title="T" />);
    await u.click(container.querySelector('.dialog-backdrop')!);
    expect(onClose).toHaveBeenCalledTimes(1);

    rerender(<Dialog open onClose={onClose} title="T" dismissOnBackdrop={false} />);
    await u.click(container.querySelector('.dialog-backdrop')!);
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});

describe('Drawer', () => {
  it('shares the modal behaviour — Escape closes', async () => {
    const u = userEvent.setup();
    const onClose = vi.fn();
    render(<Drawer open onClose={onClose} aria-label="Menu"><a href="#x">Link</a></Drawer>);
    expect(screen.getByRole('dialog')).toHaveAccessibleName('Menu');
    await u.keyboard('{Escape}');
    expect(onClose).toHaveBeenCalled();
  });

  it('closes when the scrim is clicked', async () => {
    const u = userEvent.setup();
    const onClose = vi.fn();
    const { container } = render(
      <Drawer open onClose={onClose} aria-label="Menu"><a href="#x">Link</a></Drawer>);
    await u.click(container.querySelector('.drawer-scrim')!);
    expect(onClose).toHaveBeenCalled();
  });
});
