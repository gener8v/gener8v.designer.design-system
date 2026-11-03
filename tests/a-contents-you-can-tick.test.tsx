// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { Contents, PaperAside } from '../packages/ui/src/index.js';
import type { ContentsItem } from '../packages/ui/src/index.js';
import { expectNoA11yViolations } from './a11y.js';

/**
 * A document's contents: where you are, how to get elsewhere, which sections you have reviewed,
 * and which one a run is writing now.
 */
afterEach(cleanup);

const ITEMS: ContentsItem[] = [
  { id: 's1', text: '1 Purpose and Scope' },
  { id: 's2-4', text: '2.4 Data Lineage', depth: 2, live: 'written' },
  { id: 's2-5', text: '2.5 Account Hierarchy', depth: 2, live: 'writing' },
  { id: 's2-6', text: '2.6 Reporting Cadence', depth: 2, live: 'queued' },
];

describe('contents', () => {
  it('draws nothing over too few headings to be worth a column', () => {
    const { container } = render(<Contents items={ITEMS.slice(0, 2)} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('is navigation, marks the current entry in ARIA and indents by depth', () => {
    render(<Contents items={ITEMS} current="s2-5" />);
    const nav = screen.getByRole('navigation', { name: 'Contents' });
    expect(nav).toBeInTheDocument();
    const here = screen.getByRole('link', { name: /2.5 Account Hierarchy/ });
    expect(here).toHaveAttribute('aria-current', 'location');
    expect(here.closest('li')).toHaveAttribute('data-depth', '2');
    expect(here).toHaveAttribute('title', '2.5 Account Hierarchy');
  });

  it('says a section’s live state in words as well as marks', () => {
    render(<Contents items={ITEMS} />);
    expect(screen.getByRole('link', { name: /2.5 Account Hierarchy, being written now/ })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /2.4 Data Lineage, rewritten in this run/ })).toBeInTheDocument();
  });

  it('counts and toggles review marks under the caller’s keys', () => {
    const onReviewedChange = vi.fn();
    render(<Contents items={ITEMS.map((i) => ({ ...i, reviewKey: `${i.id}:abc` }))}
      reviewed={['s1:abc']} onReviewedChange={onReviewedChange} />);
    expect(screen.getByText('1/4 reviewed')).toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: 'Reviewed: 1 Purpose and Scope' })).toBeChecked();
    fireEvent.click(screen.getByRole('checkbox', { name: 'Reviewed: 2.4 Data Lineage' }));
    expect(onReviewedChange).toHaveBeenCalledWith('s2-4:abc', true);
  });

  it('has no checkboxes unless review is wired', () => {
    render(<Contents items={ITEMS} reviewed={['s1']} />);
    expect(screen.queryByRole('checkbox')).toBeNull();
  });

  it('scrolls to the heading and sets the hash, or hands the click to the caller', () => {
    const scroll = vi.fn();
    render(<main><h2 id="s2-5">2.5</h2><Contents items={ITEMS} /></main>);
    document.getElementById('s2-5')!.scrollIntoView = scroll;
    fireEvent.click(screen.getByRole('link', { name: /2.5 Account Hierarchy/ }));
    expect(scroll).toHaveBeenCalled();
    expect(window.location.hash).toBe('#s2-5');
    expect(screen.getByRole('link', { name: /2.5 Account Hierarchy/ })).toHaveAttribute('aria-current', 'location');
    cleanup();

    const onNavigate = vi.fn();
    render(<Contents items={ITEMS} onNavigate={onNavigate} />);
    fireEvent.click(screen.getByRole('link', { name: /2.4 Data Lineage/ }));
    expect(onNavigate).toHaveBeenCalledWith('s2-4', expect.anything());
  });

  it('is busy while the document arrives', () => {
    render(<Contents items={[]} loading />);
    expect(screen.getByRole('navigation', { name: 'Contents' })).toHaveAttribute('aria-busy', 'true');
  });

  it('passes axe, in a rail beside the sheet', async () => {
    const { container } = render(
      <main><PaperAside><Contents items={ITEMS} current="s1" reviewed={['s1']} onReviewedChange={() => {}} /></PaperAside></main>,
    );
    await expectNoA11yViolations(container);
  });
});
