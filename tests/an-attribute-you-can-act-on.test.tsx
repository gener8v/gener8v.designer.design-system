import { describe, expect, it, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fireEvent, render, screen } from '@testing-library/react';
import { Facet, Facets } from '../packages/ui/src/Facet/Facet.js';

const RULES = readFileSync(join(__dirname, '..', 'design', 'styles.css'), 'utf8');

/** The declarations for a selector, outside any media query. */
function declarationsFor(selector: string): Record<string, string> {
  const out: Record<string, string> = {};
  const withoutComments = RULES.replace(/\/\*[\s\S]*?\*\//g, '');
  const stripped = withoutComments.replace(/@media[^{]*\{(?:[^{}]*\{[^{}]*\})*[^{}]*\}/g, '');
  for (const m of stripped.matchAll(/([^{}]+)\{([^}]*)\}/g)) {
    if (!(m[1] ?? '').split(',').map((s) => s.trim()).includes(selector)) continue;
    for (const line of (m[2] ?? '').split(';')) {
      const [property, ...rest] = line.split(':');
      if (property?.trim() && rest.length) out[property.trim()] = rest.join(':').trim();
    }
  }
  return out;
}

describe('an attribute you can act on', () => {
  it('is a button when it narrows and a span when it does not', () => {
    // THE WHOLE AFFORDANCE. An attribute that cannot narrow anything must not look or behave
    // like a control, and one that can must be reachable by keyboard — which a span is not.
    const { container: acts } = render(
      <Facet name="Agent" value="friction-extractor" onClick={() => {}} />,
    );
    expect(acts.querySelector('button.facet')).not.toBeNull();

    const { container: inert } = render(<Facet name="Agent" value="friction-extractor" />);
    expect(inert.querySelector('button')).toBeNull();
    expect(inert.querySelector('span.facet')).not.toBeNull();
  });

  it('narrows when pressed', () => {
    const narrow = vi.fn();
    render(<Facet name="Written" value="2026-08-27" onClick={narrow} />);
    fireEvent.click(screen.getByRole('button'));
    expect(narrow).toHaveBeenCalledTimes(1);
  });

  it('says which dimension the value belongs to', () => {
    // A bare "friction-extractor" is a string a reader has to place. The name places it.
    const { container } = render(<Facet name="Agent" value="friction-extractor" />);
    expect(container.querySelector('.facet-name')?.textContent).toBe('Agent');
    expect(container.querySelector('.facet-value')?.textContent).toBe('friction-extractor');
  });

  it('tells a screen reader which one is holding the list', () => {
    // `aria-pressed` IS the state — a facet that only went blue would be a control whose
    // position nobody not looking at it can read.
    render(<Facet name="Agent" value="rewriter" active onClick={() => {}} />);
    expect(screen.getByRole('button').getAttribute('aria-pressed')).toBe('true');

    render(<Facet name="Agent" value="critic" onClick={() => {}} />);
    expect(screen.getByRole('button', { name: /critic/ }).getAttribute('aria-pressed')).toBe(
      'false',
    );
  });

  it('renders nothing rather than a name with a blank after it', () => {
    // "AGAINST ·" followed by nothing looks like a broken row. The consumer knows whether the
    // value is missing or unread and says so in words; the component will not guess.
    const { container } = render(<Facet name="Against" value="" />);
    expect(container.querySelector('.facet')).toBeNull();
  });

  it('states an absence in a quieter voice than a fact', () => {
    const { container } = render(<Facet name="Against" value="no standard named" muted />);
    expect(container.querySelector('.facet')?.className).toContain('facet-muted');
    const muted = declarationsFor('.facet-muted .facet-value');
    const plain = declarationsFor('.facet-value');
    expect(muted.color, 'an absence is set in the same weight as a fact').not.toBe(plain.color);
  });

  it('reads as held down rather than as another colour of tag', () => {
    // A DIFFERENT STATUS is what a Tag carries. This is a control's POSITION, so it takes the
    // accent the system uses for "this is the live thing" and a border the resting state has not.
    const held = declarationsFor(".facet[aria-pressed='true']");
    expect(held.background, 'the active facet is not marked').toBeTruthy();
    expect(held['border-color'], 'the active facet has no edge').toBeTruthy();
    expect(held.background).toContain('accent');
  });

  it('does not promise a press the resting attribute cannot deliver', () => {
    // The hover tint lives on `button.facet`, NOT on `.facet` — a span that lit up under the
    // cursor would offer a filter that is not there.
    const anyFacet = declarationsFor('.facet');
    expect(anyFacet.cursor, 'every facet claims to be pressable').toBeUndefined();
    expect(declarationsFor('button.facet').cursor).toBe('pointer');
  });

  it('uses the label idiom the rest of the system uses', () => {
    // Two settings that differ by a hair are how a design system stops being one.
    const name = declarationsFor('.facet-name');
    const label = declarationsFor('.label-bare');
    expect(name['letter-spacing']).toBe(label['letter-spacing']);
    expect(name['text-transform']).toBe(label['text-transform']);
    expect(name['font-weight']).toBe(label['font-weight']);
  });

  it('wraps rather than pushing a row wider than its column', () => {
    const row = declarationsFor('.facets');
    expect(row['flex-wrap']).toBe('wrap');
  });

  it('keeps a value on one line', () => {
    // A date broken across two lines stops being a date.
    expect(declarationsFor('.facet')['white-space']).toBe('nowrap');
  });

  it('is the container it says it is', () => {
    const { container } = render(
      <Facets>
        <Facet name="Agent" value="rewriter" />
      </Facets>,
    );
    expect(container.querySelector('.facets > .facet')).not.toBeNull();
  });
});
