import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const RULES = readFileSync(join(__dirname, '..', 'design', 'styles.css'), 'utf8');

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

/**
 * A shelf row opens the item; the grip drags it.
 *
 * When both switched the cursor, the grip's own signal meant nothing — a reader crossing the card
 * was already in "this does something", so the change at the grip read as noise rather than as the
 * one gesture here that is not a click.
 */
describe('one thing switches the cursor', () => {
  it('leaves the row alone', () => {
    expect(declarationsFor('.shelf-item').cursor, 'the whole row claims a cursor again')
      .toBeUndefined();
  });

  it('keeps the grip saying what it is', () => {
    expect(declarationsFor('.shelf-grip').cursor).toBe('grab');
    expect(declarationsFor('.shelf-grip:active').cursor).toBe('grabbing');
  });

  it('still shows the row is interactive', () => {
    // Removing the cursor must not remove the affordance — the hover treatment is what says a row
    // can be pressed, and dropping both would leave a card that looks inert.
    const hover = declarationsFor('.shelf-item:hover');
    expect(Object.keys(hover).length, 'the row no longer responds to a pointer at all')
      .toBeGreaterThan(0);
  });

  it('centres the grip on the row it drags', () => {
    // `.shelf-item` starts its children at the top, which is right for an icon belonging to the
    // TITLE and wrong for a handle representing the whole card: a grip level with the first of
    // three lines looks like it grabs that line.
    expect(declarationsFor('.shelf-item')['align-items']).toBe('flex-start');
    expect(declarationsFor('.shelf-grip')['align-self']).toBe('center');
  });

  it('does not nudge it off centre afterwards', () => {
    // The old rule pinned it with a -1px top margin, which fought the centring it now has.
    expect(declarationsFor('.shelf-grip')['margin-block-start']).toBeUndefined();
  });
});
