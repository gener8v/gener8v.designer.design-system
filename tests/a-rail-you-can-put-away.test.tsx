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
  it('empties rather than abbreviates', () => {
    // A rail of unlabelled icons is a rail nobody can read without learning it first, and this
    // product has no icon vocabulary to learn. So putting it away puts it away, and the control to
    // bring it back is the only thing left.
    expect(declarationsFor('.sidebar[data-narrow] .sidebar-section')['display']).toBe('none');
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
