import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { render } from '@testing-library/react';
import {
  Claim,
  ClaimActions,
  ClaimBody,
  ClaimReason,
  ClaimStanding,
  ClaimText
} from '../packages/ui/src/Claim/Claim.js';

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
 * A consumer hand-rolled this shape because the system had no word for it, and got the hierarchy
 * exactly backwards: the quiet rationale was capped at a measure and the loud assertion ran the
 * full nineteen hundred pixels of the surface.
 */
describe('a claim you have to adjudicate', () => {
  it('measures the assertion, which is the loudest prose on the row', () => {
    const text = declarationsFor('.claim-text')['max-inline-size'] ?? '';
    expect(text, 'the claim runs the width of the surface again').toMatch(/\d+ch/);
  });

  it('measures the argument too, and never more tightly than the claim', () => {
    // The inversion, stated as an assertion a mutation can break: capping the reason while
    // letting the claim run is the exact defect this component exists to prevent.
    const claim = parseInt(declarationsFor('.claim-text')['max-inline-size'] ?? '0', 10);
    const reason = parseInt(declarationsFor('.claim-reason')['max-inline-size'] ?? '0', 10);
    expect(reason).toBeGreaterThan(0);
    expect(claim).toBeGreaterThanOrEqual(reason);
  });

  it('gives the argument its own voice rather than running it on', () => {
    // A rule marks it as a different voice from the claim, not a continuation of it.
    expect(declarationsFor('.claim-reason')['border-inline-start']).toBeTruthy();
  });

  it('puts whose argument it is on its own line', () => {
    // An inline label ahead of prose reads as a run-on, which is how the hand-rolled version read:
    // "WHY IT HAD NO HOME · This is about program delivery discipline…"
    expect(declarationsFor('.claim-reason-by').display).toBe('block');
  });

  it('names the author, because a rationale with no author is an assertion', () => {
    const { container } = render(
      <ClaimReason by="the coder">it is related to but distinct from SG-03</ClaimReason>
    );
    expect(container.querySelector('.claim-reason-by')?.textContent).toBe('the coder');
  });

  it('omits the author line rather than leaving an empty one', () => {
    const { container } = render(<ClaimReason>no author here</ClaimReason>);
    expect(container.querySelector('.claim-reason-by')).toBeNull();
  });

  it('keeps the controls level with the claim\'s first line', () => {
    // A control centred on a block whose height depends on how much somebody said is one a reader
    // has to look for.
    expect(declarationsFor('.claim')['align-items']).toBe('flex-start');
    expect(declarationsFor('.claim-actions').flex).toBe('none');
  });

  it('lets what is settled sit back without disappearing', () => {
    const { container } = render(<Claim settled />);
    expect(container.querySelector('.claim')?.hasAttribute('data-settled')).toBe(true);
    expect(declarationsFor('.claim[data-settled]').background).toBeTruthy();
    // AND WHAT IS WAITING DOES NOT.
    const { container: open } = render(<Claim />);
    expect(open.querySelector('.claim')?.hasAttribute('data-settled')).toBe(false);
  });

  it('assembles', () => {
    const { container } = render(
      <Claim>
        <ClaimBody>
          <ClaimText>projects start with ambitious goals and scope gets abandoned</ClaimText>
          <ClaimReason by="the coder">distinct from SG-03 portfolio management</ClaimReason>
          <ClaimStanding mark={<span>proposed</span>} what="Not a capability">
            read by assistant, not yet confirmed
          </ClaimStanding>
        </ClaimBody>
        <ClaimActions>
          <button type="button">Answer</button>
        </ClaimActions>
      </Claim>
    );
    for (const cls of ['.claim-body', '.claim-text', '.claim-reason', '.claim-standing', '.claim-actions']) {
      expect(container.querySelector(cls), `${cls} did not render`).not.toBeNull();
    }
  });
});
