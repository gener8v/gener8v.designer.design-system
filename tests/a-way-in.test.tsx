import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { render, screen } from '@testing-library/react';
import { Entry } from '../packages/ui/src/Entry/Entry.js';

const RULES = readFileSync(join(__dirname, '..', 'design', 'styles.css'), 'utf8');

/**
 * The declarations for a selector, OUTSIDE any media query.
 *
 * Collecting every matching rule lets a `@media` override win, so this reported the PHONE value
 * for `.entry` and a guard about the panel's width failed against a stylesheet that was correct.
 * The overrides have guards of their own; this reads the base.
 */
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

const gate = (
  <Entry
    mark="TRAISEE"
    title="Sign in to the delivery record"
    lede="This record is private to the project it belongs to."
    alternatives={<button type="button">Sign in with GitHub</button>}
    note="A password signs you in. Getting access is separate."
  >
    <button type="button">Sign in</button>
  </Entry>
);

describe('a way in', () => {
  it('names the product', () => {
    // A credentials form carrying no name is one somebody has to take on trust, and taking
    // credential forms on trust is the habit this industry spends its time trying to break.
    render(gate);
    expect(screen.getByText('TRAISEE')).toBeInTheDocument();
  });

  it('puts the mark above the title, not beside it', () => {
    // Beside, at the same size, they read as one phrase — "TRAISEE Sign in" — and the product's
    // name stops being the product's name.
    const { container } = render(gate);
    const mark = container.querySelector('.entry-mark')!;
    const title = container.querySelector('.entry-title')!;
    expect(mark.compareDocumentPosition(title) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(mark.parentElement).toBe(title.parentElement);
  });

  it('leads with a heading, so the page is not a form with no subject', () => {
    render(gate);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      'Sign in to the delivery record',
    );
  });

  it('separates another door from a quieter version of the same one', () => {
    // A second sign-in control drawn slightly smaller reads as a variant of the first rather than
    // as a different way in. The rule is what says they are different things, and it costs no
    // words.
    expect(declarationsFor('.entry-alternatives')['border-block-start']).toBeTruthy();
  });

  it('holds the panel narrow, because a sign-in form is two fields', () => {
    // At a document's width the eye travels the whole window between the label and the box.
    expect(declarationsFor('.entry')['max-inline-size']).toBe('26rem');
  });

  it('sits the panel on a ground, so it reads as placed rather than stranded', () => {
    expect(declarationsFor('.entry-ground')['background']).toBe('var(--color-surface)');
    expect(declarationsFor('.entry')['background']).toBe('var(--color-bg)');
  });

  it('drops the sheet on a phone', () => {
    // The ground would be two visible strips either side of something already the full width,
    // which reads as a rendering fault rather than as a card.
    expect(RULES).toMatch(/@media \(max-width: 480px\)[\s\S]{0,400}\.entry\b/);
  });

  it('renders nothing for the parts it was not given', () => {
    // A gate with no alternative way in must not draw an empty rule across itself.
    const { container } = render(
      <Entry mark="M" title="T">
        <button type="button">Go</button>
      </Entry>,
    );
    expect(container.querySelector('.entry-alternatives')).toBeNull();
    expect(container.querySelector('.entry-note')).toBeNull();
    expect(container.querySelector('.entry-lede')).toBeNull();
  });
});
