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

  it('names the panel with the trigger that opens it', async () => {
    // `role="region"` is a landmark. Unnamed it is announced as "region" and nothing else, and a
    // page of six disclosures carries six of them — which reads worse than no landmark at all.
    // The WAI-ARIA accordion pattern names the panel by the button that controls it, and the
    // heading a reader presses is the name they already have for what is inside.
    //
    // Asserted open, because an accessible name is not computed for a `hidden` element at all —
    // the closed panel's name is checked as the attribute it is, in the case below.
    const u = userEvent.setup();
    render(
      <Accordion>
        <AccordionItem title="Details" value="a"><p>panel content</p></AccordionItem>
      </Accordion>,
    );
    await u.click(screen.getByRole('button', { name: 'Details' }));
    expect(screen.getByRole('region')).toHaveAccessibleName('Details');
  });

  it('carries the name before anybody opens it', () => {
    // The name comes off the trigger, so it is there while the panel is shut and its children are
    // not mounted — which is the state a reader moving by landmark meets first.
    render(
      <Accordion>
        <AccordionItem title="Details" value="a" unmountClosed><p>panel content</p></AccordionItem>
      </Accordion>,
    );
    const trigger = screen.getByRole('button', { name: 'Details' });
    const panel = document.getElementById(trigger.getAttribute('aria-controls')!)!;
    expect(trigger.id).not.toBe('');
    expect(panel.getAttribute('aria-labelledby')).toBe(trigger.id);
  });

  it('gives two items on one page two different names', () => {
    // The ids are built from the item's own value, or from `useId` where none was given. Two
    // panels sharing a name is the same fault as none: a landmark list that cannot be chosen from.
    render(
      <Accordion>
        <AccordionItem title="First"><p>one</p></AccordionItem>
        <AccordionItem title="Second"><p>two</p></AccordionItem>
      </Accordion>,
    );
    const names = screen.getAllByRole('region', { hidden: true }).map((r) => r.getAttribute('aria-labelledby'));
    expect(new Set(names).size).toBe(2);
  });
});
