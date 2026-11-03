// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { Citation, SourceCard, useDelegatedHoverCard } from '../packages/ui/src/index.js';
import { expectNoA11yViolations } from './a11y.js';

/**
 * A citation in sanitised HTML, previewed in place. The markers are not React elements, so the
 * card is opened by delegation on the container — with HoverCard's dwell, grace and Escape.
 */
beforeEach(() => { vi.useFakeTimers(); });
afterEach(() => { cleanup(); vi.useRealTimers(); });

const HTML = '<p>Three hierarchies are in use <a class="citation" data-source="4" href="#s4">S4</a>, '
  + 'rebuilt each quarter <a class="citation" data-source="7" href="#s7">S7</a>, and one '
  + '<a class="citation" data-source="12" data-missing href="#s12">S12</a>.</p>';

/** Held, not rebuilt per render: React re-applies a new `__html` object, which would replace the markers. */
const SANITISED = { __html: HTML };

const FILES: Record<string, string> = { 4: 'Internal Ops Meetings — Running Notes.docx', 7: 'Reporting Team Interview.m4a' };

function Doc({ onOpen = vi.fn() }) {
  const peek = useDelegatedHoverCard({
    selector: 'a.citation[data-source]', openDelay: 300, closeDelay: 100, size: 'md',
    accepts: (el) => !el.hasAttribute('data-missing'),
  });
  const n = peek.anchor?.dataset.source ?? '';
  return (
    <main>
      <div {...peek.bind} dangerouslySetInnerHTML={SANITISED} />
      {peek.card(n ? (
        <SourceCard id={`S${n}`} file={FILES[n]} locator="Page 3" excerpt="they all disagree" truncated
          action={{ label: 'Open at Passage', href: `#evidence-${n}`, onActivate: () => onOpen(n) }} />
      ) : null)}
    </main>
  );
}

const marker = (name: string) => screen.getByRole('link', { name });
const card = () => document.querySelector('.hover-card');
const wait = (ms: number) => act(() => { vi.advanceTimersByTime(ms); });

describe('a citation you can peek at', () => {
  it('opens after the dwell on hover, and the marker is described by the card', () => {
    render(<Doc />);
    fireEvent.mouseOver(marker('S4'));
    wait(200);
    expect(card()).toBeNull();
    wait(100);
    expect(card()).toHaveTextContent('Internal Ops Meetings — Running Notes.docx');
    expect(card()).toHaveClass('popover', 'popover-md');
    expect(marker('S4')).toHaveAccessibleDescription(/Internal Ops Meetings/);
  });

  it('moves to the next marker without closing first, and lets go of the last one', () => {
    render(<Doc />);
    fireEvent.mouseOver(marker('S4'));
    wait(300);
    fireEvent.mouseOut(marker('S4'), { relatedTarget: marker('S7') });
    fireEvent.mouseOver(marker('S7'));
    wait(100);
    expect(card()).toHaveTextContent('Reporting Team Interview.m4a');
    expect(marker('S4')).not.toHaveAttribute('aria-describedby');
  });

  it('opens on keyboard focus, and closes on Escape without moving focus', () => {
    render(<Doc />);
    act(() => { marker('S7').focus(); });
    wait(300);
    expect(card()).not.toBeNull();
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(card()).toBeNull();
    expect(marker('S7')).toHaveFocus();
  });

  it('stays open while the pointer is on the card, then closes after the grace', () => {
    render(<Doc />);
    fireEvent.mouseOver(marker('S4'));
    wait(300);
    fireEvent.mouseOut(marker('S4'));
    wait(50);
    fireEvent.mouseEnter(card()!);
    wait(500);
    expect(card()).not.toBeNull();
    fireEvent.mouseLeave(card()!);
    wait(100);
    expect(card()).toBeNull();
  });

  it('leaves a marker the caller does not accept alone', () => {
    render(<Doc />);
    fireEvent.mouseOver(marker('S12'));
    wait(500);
    expect(card()).toBeNull();
  });

  it('opens at the passage on a plain click, and leaves a modified click to the link', () => {
    const onOpen = vi.fn();
    render(<Doc onOpen={onOpen} />);
    fireEvent.mouseOver(marker('S4'));
    wait(300);
    const open = screen.getByRole('link', { name: 'Open at Passage' });
    fireEvent.click(open, { metaKey: true });
    expect(onOpen).not.toHaveBeenCalled();
    fireEvent.click(open);
    expect(onOpen).toHaveBeenCalledWith('4');
  });
});

describe('the marker and the card', () => {
  it('draws a missing source as an unlinked marker that says so', () => {
    render(<p>Mentioned once <Citation missing>S12</Citation>.</p>);
    expect(screen.queryByRole('link')).toBeNull();
    expect(screen.getByText('S12')).toHaveAttribute('data-missing');
    expect(screen.getByText('(source not found)', { exact: false })).toHaveClass('sr-only');
  });

  it('says a gone source in words, and is busy while one is fetched', () => {
    const { rerender, container } = render(<SourceCard id="S12" file="Q3 Hierarchy Review.xlsx" missing action={{ label: 'Open at Passage', href: '#' }} />);
    expect(screen.getByText(/not in the corpus/)).toBeInTheDocument();
    expect(screen.queryByRole('link')).toBeNull();
    rerender(<SourceCard id="S7" file="Reporting Team Interview.m4a" loading />);
    expect(container.querySelector('.source-card')).toHaveAttribute('aria-busy', 'true');
  });

  it('passes axe open', async () => {
    render(<Doc />);
    fireEvent.mouseOver(marker('S4'));
    wait(300);
    vi.useRealTimers();
    await expectNoA11yViolations(document.body);
  });
});
