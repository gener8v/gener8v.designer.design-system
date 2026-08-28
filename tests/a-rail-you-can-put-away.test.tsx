import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const RULES = readFileSync(join(__dirname, '..', 'design', 'styles.css'), 'utf8').replace(
  /\/\*[\s\S]*?\*\//g,
  '',
);

function declarationsFor(selector: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const m of RULES.matchAll(/([^{}]+)\{([^}]*)\}/g)) {
    if (!(m[1] ?? '').split(',').map((s) => s.trim()).includes(selector)) continue;
    for (const line of (m[2] ?? '').split(';')) {
      const [property, ...rest] = line.split(':');
      if (property?.trim() && rest.length) out[property.trim()] = rest.join(':').trim();
    }
  }
  return out;
}

describe('a rail you can put away', () => {
  it('keeps the destinations, and drops the words', () => {
    // THIS USED TO ASSERT THE OPPOSITE, on the argument that "this product has no icon vocabulary
    // to learn". That premise expired: every destination in the rail now carries a mark chosen for
    // what the surface holds, so folding no longer has to choose between a wall of words and a
    // blank strip. It empties the LABELS and keeps the marks.
    //
    // The full behaviour is guarded in `a-way-out-and-a-folded-rail`; what is kept here is the
    // thing this file exists for — that folding is not cosmetic.
    expect(declarationsFor('.sidebar[data-narrow] .sidebar-section')['display']).not.toBe('none');
    expect(declarationsFor('.sidebar[data-narrow] .sidebar-item')['font-size']).toBe('0');
  });

  it('gives the width back, which is the whole point', () => {
    // THE GUARD THAT WAS MISSING WHEN THIS SHIPPED BROKEN. Three tests covered emptying the rail,
    // keeping the control and turning the arrow — every observable EXCEPT the one the feature is
    // for. So a fold that hid the contents and stayed 240px passed all three: a control that made
    // the page worse and gave nothing back.
    const open = declarationsFor('.sidebar')['inline-size'];
    const folded = declarationsFor('.sidebar[data-narrow]')['inline-size'];
    expect(open).toBeTruthy();
    expect(folded).toBeTruthy();
    expect(folded).not.toBe(open);
  });

  it('holds its width rather than taking a share of one', () => {
    // A rail is a WIDTH. As a flex child without this it shrinks to whatever the main pane leaves,
    // and then folding it changes nothing anybody can see.
    expect(declarationsFor('.sidebar')['flex']).toBe('none');
  });

  it('keeps the control that brings it back', () => {
    // The one thing that must survive the fold. A rail with no way out of the folded state is a
    // navigation menu somebody has permanently deleted.
    expect(declarationsFor('.sidebar[data-narrow] .sidebar-fold')['align-self']).toBe('center');
    expect(declarationsFor('.sidebar-fold')['cursor']).toBe('pointer');
  });

  it('turns the arrow to point where it would move the rail', () => {
    // The only thing a control with no words can say about what it does.
    expect(declarationsFor('.sidebar[data-narrow] .sidebar-fold svg')['transform']).toContain(
      'rotate(180deg)',
    );
  });
});
