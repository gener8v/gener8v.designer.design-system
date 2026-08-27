import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { render, screen } from '@testing-library/react';
import { Transcript, TranscriptTurn } from '../packages/ui/src/Transcript/Transcript.js';

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

const session = (
  <Transcript label="BTS leadership, 25 August">
    <TranscriptTurn speaker="Walsh, Sarah" action={<button type="button">Code</button>}>
      We have had no architect since March.
    </TranscriptTurn>
    <TranscriptTurn speaker="Taylor Turner" mark={<span>CAP-02</span>}>
      Who picks up that work now?
    </TranscriptTurn>
  </Transcript>
);

describe('a transcript you can work from', () => {
  it('is an ordered list, because the sequence is the content', () => {
    // A transcript whose order is a rendering detail is one where "the second session contradicted
    // the first" cannot be said.
    const { container } = render(session);
    expect(container.querySelector('ol')).toBeInTheDocument();
    expect(container.querySelectorAll('li')).toHaveLength(2);
  });

  it('names the session for a reader who cannot see it', () => {
    render(session);
    expect(screen.getByRole('list', { name: 'BTS leadership, 25 August' })).toBeInTheDocument();
  });

  it('keeps an action in the tab order while it is hidden', () => {
    // THE RULE THIS COMPONENT IS MOST LIKELY TO LOSE. Hiding the per-turn control with
    // `display: none` would remove it from the tab order, and a keyboard reader would have a
    // transcript they can read and cannot act on — a whole class of user locked out of the work.
    render(session);
    expect(screen.getByRole('button', { name: 'Code' })).toBeInTheDocument();
    expect(declarationsFor('.on-demand')['display']).toBeUndefined();
    expect(declarationsFor('.on-demand')['visibility']).toBeUndefined();
    expect(declarationsFor('.on-demand')['opacity']).toBe('0');
  });

  it('reveals the action on focus as well as on hover', () => {
    // The keyboard path. Without `:focus-within` the control is tabbable and invisible, which is
    // worse than either state on its own.
    expect(RULES).toContain('.on-demand-row:focus-within .on-demand');
  });

  it('reveals the action where there is no pointer at all', () => {
    // On a touch screen hover never happens, so the reveal never fires and the control is
    // unreachable — the same failure as `display: none`, arrived at from the other side.
    expect(RULES).toMatch(/@media \(hover: none\)[\s\S]{0,200}\.on-demand/);
  });

  it('puts every turn in a row that reveals its controls together', () => {
    // Per ROW, not per control. A control appearing only when pointed at directly is one the
    // reader has to find before they can use it.
    const { container } = render(session);
    expect(container.querySelector('li')?.className).toContain('on-demand-row');
  });

  it('never hides what a turn is evidence of', () => {
    // A mark is DATA. Hiding it behind a hover would mean the only way to see how far the coding
    // has got is to sweep the pointer down three hundred rows.
    render(session);
    expect(screen.getByText('CAP-02')).toBeInTheDocument();
    expect(declarationsFor('.transcript-mark')['opacity']).toBeUndefined();
  });

  it('holds the words to a measure', () => {
    // A speaker's stretch runs to a paragraph, and a line crossing the whole window is one the eye
    // loses on the return.
    expect(declarationsFor('.transcript-said')['max-inline-size']).toBe('72ch');
  });

  it('marks the stretch being worked on, and only that one', () => {
    // PRESENCE, not the value — `[data-current]` is what the stylesheet keys on, and asserting
    // the string React happened to render would break on a change nothing can see. Both turns are
    // checked so a mutation that always sets it fails here.
    const { container } = render(
      <Transcript label="s">
        <TranscriptTurn speaker="A" current>
          being coded
        </TranscriptTurn>
        <TranscriptTurn speaker="B">not yet</TranscriptTurn>
      </Transcript>,
    );
    const turns = [...container.querySelectorAll('li')];
    expect(turns.map((t) => t.hasAttribute('data-current'))).toEqual([true, false]);
  });

  it('shows every speaker it is given rather than collapsing runs', () => {
    // Consecutive turns by one speaker arrive already merged — the parser does it, because it is a
    // property of the text rather than of the rendering. Collapsing here would hide a change of
    // speaker the caller believed it was showing.
    render(
      <Transcript label="s">
        <TranscriptTurn speaker="A">one</TranscriptTurn>
        <TranscriptTurn speaker="A">two</TranscriptTurn>
      </Transcript>,
    );
    expect(screen.getAllByText('A')).toHaveLength(2);
  });
});
