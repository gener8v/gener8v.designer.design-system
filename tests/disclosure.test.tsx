import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Accordion, AccordionItem, Segmented, SegmentedItem } from '../packages/ui/src/index.js';

describe('Accordion', () => {
  it('wires aria-expanded and aria-controls to a real panel', () => {
    render(<AccordionItem title="What counts as an unknown?">A control with no evidence.</AccordionItem>);
    const trigger = screen.getByRole('button');
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    const panelId = trigger.getAttribute('aria-controls')!;
    expect(document.getElementById(panelId)).toBeTruthy();
  });

  it('removes collapsed content from the accessibility tree, not just the viewport', async () => {
    const u = userEvent.setup();
    render(<AccordionItem title="Q">Hidden answer</AccordionItem>);
    expect(screen.queryByText('Hidden answer')).not.toBeVisible();
    await u.click(screen.getByRole('button'));
    expect(screen.getByText('Hidden answer')).toBeVisible();
    expect(screen.getByRole('button')).toHaveAttribute('aria-expanded', 'true');
  });

  it('type="single" closes the previously open item', async () => {
    const u = userEvent.setup();
    render(
      <Accordion type="single" defaultOpen={['a']}>
        <AccordionItem value="a" title="First">One</AccordionItem>
        <AccordionItem value="b" title="Second">Two</AccordionItem>
      </Accordion>);
    expect(screen.getByText('One')).toBeVisible();
    await u.click(screen.getByText('Second'));
    expect(screen.getByText('Two')).toBeVisible();
    expect(screen.getByText('One')).not.toBeVisible();
  });

  it('type="multiple" keeps both open', async () => {
    const u = userEvent.setup();
    render(
      <Accordion defaultOpen={['a']}>
        <AccordionItem value="a" title="First">One</AccordionItem>
        <AccordionItem value="b" title="Second">Two</AccordionItem>
      </Accordion>);
    await u.click(screen.getByText('Second'));
    expect(screen.getByText('One')).toBeVisible();
    expect(screen.getByText('Two')).toBeVisible();
  });
});

describe('Segmented', () => {
  it('is a radiogroup with roving tabindex', () => {
    render(
      <Segmented aria-label="Range">
        <SegmentedItem checked>Quarter</SegmentedItem>
        <SegmentedItem checked={false}>Year</SegmentedItem>
      </Segmented>);
    expect(screen.getByRole('radiogroup')).toBeInTheDocument();
    const [a, b] = screen.getAllByRole('radio');
    expect(a).toHaveAttribute('aria-checked', 'true');
    expect(a).toHaveAttribute('tabindex', '0');
    expect(b).toHaveAttribute('tabindex', '-1');
  });

  it('arrow keys move and select', async () => {
    const u = userEvent.setup();
    const onSelectIndex = vi.fn();
    render(
      <Segmented aria-label="Range" onSelectIndex={onSelectIndex}>
        <SegmentedItem checked>Quarter</SegmentedItem>
        <SegmentedItem checked={false}>Year</SegmentedItem>
        <SegmentedItem checked={false}>All time</SegmentedItem>
      </Segmented>);
    const radios = screen.getAllByRole('radio');
    radios[0].focus();
    await u.keyboard('{ArrowRight}');
    expect(radios[1]).toHaveFocus();
    expect(onSelectIndex).toHaveBeenCalledWith(1);
    await u.keyboard('{ArrowLeft}{ArrowLeft}');
    expect(radios[2]).toHaveFocus();  // wrapped backwards
  });
});
