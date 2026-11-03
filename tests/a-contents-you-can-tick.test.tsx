// @vitest-environment jsdom
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
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

  describe('a section rewritten in this run', () => {
    const written: ContentsItem[] = ITEMS.map((i) => (i.id === 's2-4' ? { ...i, live: 'written' } : { ...i, live: null }));

    it('is marked with a dot, never a tick, where the entry is not reviewed', () => {
      render(<Contents items={written} reviewed={[]} onReviewedChange={() => {}} />);
      const link = screen.getByRole('link', { name: /2.4 Data Lineage/ });
      const mark = link.querySelector('svg.contents-written');
      expect(mark).not.toBeNull();
      expect(mark!.querySelector('circle')).not.toBeNull();
      expect(mark!.querySelector('path')).toBeNull();
      expect(mark).toHaveAttribute('aria-hidden', 'true');
    });

    it('draws no mark of its own beside a ticked review box, and still says it in words', () => {
      render(<Contents items={written} reviewed={['s2-4']} onReviewedChange={() => {}} />);
      const link = screen.getByRole('link', { name: /2.4 Data Lineage, rewritten in this run/ });
      expect(link.querySelector('.contents-live')).toBeNull();
      expect(link.querySelector('svg')).toBeNull();
      expect(screen.getByRole('checkbox', { name: 'Reviewed: 2.4 Data Lineage' })).toBeChecked();
    });

    it('follows the box: unticking brings the dot back, under the caller’s review key', () => {
      const keyed = written.map((i) => ({ ...i, reviewKey: `${i.id}:h1` }));
      const { rerender } = render(<Contents items={keyed} reviewed={['s2-4:h1']} onReviewedChange={() => {}} />);
      expect(document.querySelector('.contents-written')).toBeNull();
      rerender(<Contents items={keyed} reviewed={[]} onReviewedChange={() => {}} />);
      expect(document.querySelector('.contents-written')).not.toBeNull();
    });

    it('keeps the dot when review is not wired, since there is no box to carry it', () => {
      render(<Contents items={written} reviewed={['s2-4']} />);
      expect(document.querySelector('.contents-written')).not.toBeNull();
    });

    it('passes axe, reviewed and not', async () => {
      const { container } = render(
        <main><Contents items={written} reviewed={['s2-4']} onReviewedChange={() => {}} />
          <Contents items={written} reviewed={[]} onReviewedChange={() => {}} aria-label="Contents again" /></main>,
      );
      await expectNoA11yViolations(container);
    });
  });

  describe('against a utility that strips the box', () => {
    const css = readFileSync(resolve(process.cwd(), 'design/styles.css'), 'utf8');

    it('carries a second class, and loading carries it too', () => {
      render(<Contents items={ITEMS} />);
      expect(screen.getByRole('navigation', { name: 'Contents' })).toHaveClass('contents', 'contents-nav');
      cleanup();
      render(<Contents items={[]} loading />);
      expect(screen.getByRole('navigation', { name: 'Contents' })).toHaveClass('contents', 'contents-nav');
    });

    it('sets display on a selector more specific than the single class Tailwind generates', () => {
      expect(css).toMatch(/nav\.contents,\s*\.contents-nav\s*\{\s*display:\s*block;/);
    });

    it('ships the block on Tailwind’s utility in the preset', () => {
      const theme = readFileSync(resolve(process.cwd(), 'packages/tailwind-preset/theme.css'), 'utf8');
      expect(theme).toContain('@source not inline("contents");');
    });
  });
});

describe('the rail in a pane and the section being written', () => {
  const css = readFileSync(resolve(process.cwd(), 'design/styles.css'), 'utf8');

  it('subtracts the pane’s offset from the window, defaulting to nothing', () => {
    expect(css).toMatch(/max-block-size:\s*calc\(\s*100dvh\s*-\s*var\(--paper-aside-viewport-offset, 0px\)\s*-\s*var\(--paper-aside-top, var\(--space-8\)\)\s*-\s*var\(--space-8\)\s*\)/);
  });

  it('gives a section’s tint the same room on the right as on the left, without narrowing the text', () => {
    const rule = css.match(/\.live-section \{[^}]*\}/)![0];
    expect(rule).toContain('padding-inline-start: var(--space-4)');
    expect(rule).toContain('padding-inline-end: var(--space-4)');
    expect(rule).toContain('margin-inline-end: calc(-1 * var(--space-4))');
  });
});
