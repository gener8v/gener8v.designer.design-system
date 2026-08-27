import { describe, it, expect, vi } from 'vitest';
import { useEffect } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Accordion, AccordionItem } from '../packages/ui/src/index.js';

describe('Accordion — a panel nobody opened', () => {
  function Counting({ onMount }: { onMount: () => void }) {
    useEffect(() => { onMount(); }, [onMount]);
    return <p>panel content</p>;
  }

  it('mounts closed panel content by default, so find-in-page still reaches it', async () => {
    const mounted = vi.fn();
    render(
      <Accordion>
        <AccordionItem title="Details" value="a"><Counting onMount={mounted} /></AccordionItem>
      </Accordion>,
    );
    expect(mounted).toHaveBeenCalledTimes(1);
    expect(screen.getByText('panel content')).toBeInTheDocument();
  });

  it('keeps it out of the DOM until opened when asked to', async () => {
    // A panel whose content fetches on mount fetches whether or not anybody opened it, and a list
    // of twenty disclosures then makes twenty requests for a question most readers never ask.
    const u = userEvent.setup();
    const mounted = vi.fn();
    render(
      <Accordion>
        <AccordionItem title="Details" value="a" unmountClosed>
          <Counting onMount={mounted} />
        </AccordionItem>
      </Accordion>,
    );

    expect(mounted).not.toHaveBeenCalled();
    expect(screen.queryByText('panel content')).toBeNull();

    await u.click(screen.getByRole('button', { name: 'Details' }));
    expect(mounted).toHaveBeenCalledTimes(1);
    expect(screen.getByText('panel content')).toBeInTheDocument();
  });

  it('still resolves aria-controls while closed', async () => {
    // An id pointing at nothing is worse than an empty region: the trigger would announce a
    // relationship to an element that is not there.
    render(
      <Accordion>
        <AccordionItem title="Details" value="a" unmountClosed><p>panel content</p></AccordionItem>
      </Accordion>,
    );
    const id = screen.getByRole('button', { name: 'Details' }).getAttribute('aria-controls');
    expect(id).toBeTruthy();
    expect(document.getElementById(id!)).not.toBeNull();
  });
});
