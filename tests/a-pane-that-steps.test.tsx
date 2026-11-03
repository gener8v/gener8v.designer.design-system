// @vitest-environment jsdom
import { useState } from 'react';
import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { Drawer, PagerChip } from '../packages/ui/src/index.js';
import { expectNoA11yViolations } from './a11y.js';

/**
 * A side pane that steps through a set — a document's sources, in order — without the reader
 * leaving the document: a pinned head with `S4 of 19`, buttons, and ← →.
 */
afterEach(cleanup);

const SOURCES = [1, 4, 7, 19];

function Evidence() {
  const [at, setAt] = useState(1);
  return (
    <Drawer open onClose={() => {}} aria-label="Cited evidence" size="lg" header={
      <>
        <PagerChip label={`S${SOURCES[at]} of ${SOURCES.length}`} arrowKeys aria-label="Sources"
          previousLabel="Previous Source" nextLabel="Next Source"
          onPrevious={at > 0 ? () => setAt(at - 1) : undefined}
          onNext={at < SOURCES.length - 1 ? () => setAt(at + 1) : undefined} />
        <h2>Internal Ops Meetings — Running Notes.docx</h2>
      </>
    }>
      <input aria-label="Find in transcript" />
      <p>We have the ledger hierarchy, the reporting one, and whatever sales ops keeps.</p>
    </Drawer>
  );
}

describe('a pane that steps', () => {
  it('pins a head above a body that scrolls on its own, at a reading width', () => {
    render(<Evidence />);
    const pane = screen.getByRole('dialog', { name: 'Cited evidence' });
    expect(pane).toHaveAttribute('data-size', 'lg');
    expect(pane.querySelector('.drawer-head')).toContainElement(screen.getByRole('group', { name: 'Sources' }));
    expect(pane.querySelector('.drawer-body')).toContainElement(screen.getByRole('textbox'));
  });

  it('leaves a drawer without a head exactly as it was', () => {
    render(<Drawer open onClose={() => {}} aria-label="Menu"><a href="#a">A</a></Drawer>);
    const pane = screen.getByRole('dialog', { name: 'Menu' });
    expect(pane.querySelector('.drawer-head, .drawer-body')).toBeNull();
    expect(pane).not.toHaveAttribute('data-size');
  });

  it('steps with its buttons and disables the one that leads nowhere', () => {
    render(<Evidence />);
    expect(screen.getByText('S4 of 4')).toHaveAttribute('aria-live', 'polite');
    fireEvent.click(screen.getByRole('button', { name: 'Previous Source' }));
    expect(screen.getByText('S1 of 4')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Previous Source' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Next Source' })).toBeEnabled();
  });

  it('steps with the arrows from inside its own dialog, never from a field', () => {
    render(<Evidence />);
    fireEvent.keyDown(document.body, { key: 'ArrowRight' });
    expect(screen.getByText('S7 of 4')).toBeInTheDocument();
    const field = screen.getByRole('textbox', { name: 'Find in transcript' });
    fireEvent.keyDown(field, { key: 'ArrowRight' });
    expect(screen.getByText('S7 of 4')).toBeInTheDocument();
    fireEvent.keyDown(document.body, { key: 'ArrowLeft', altKey: true });
    expect(screen.getByText('S7 of 4')).toBeInTheDocument();
  });

  it('stands down under another dialog', () => {
    render(<>
      <PagerChip label="Finding 2 of 7" arrowKeys onNext={() => { throw new Error('stepped'); }} />
      <div role="dialog" aria-modal="true" aria-label="Reject finding" />
    </>);
    expect(() => fireEvent.keyDown(document.body, { key: 'ArrowRight' })).not.toThrow();
  });

  it('passes axe', async () => {
    render(<Evidence />);
    await expectNoA11yViolations(document.body);
  });
});
