import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const RULES = readFileSync(join(__dirname, '..', 'design', 'styles.css'), 'utf8');
const WITHOUT_COMMENTS = RULES.replace(/\/\*[\s\S]*?\*\//g, '');

/**
 * `[hidden]` has to beat the component layer, or it beats nothing.
 *
 * The user agent hides `[hidden]` with `display: none` from its own origin, and any author rule
 * setting `display` outranks that. This system sets one on a hundred classes, so `<div class="tabs"
 * hidden>` computed `display: flex` and drew — and a consumer who reached for the platform's own
 * way of hiding something got a panel that was still on the page.
 *
 * **The worst version of this is that it half worked.** `.panel` and a bare `<p>` disappeared
 * because neither sets `display`, so the bug only showed on the elements that happened to be flex
 * containers — which is every strip, every tag and every alert.
 */
describe('hidden means hidden', () => {
  /** Every class that sets a display other than `none`, which is the whole competition. */
  const settingDisplay = (): string[] => {
    const found = new Set<string>();
    for (const m of WITHOUT_COMMENTS.matchAll(/([^{}]+)\{([^}]*)\}/g)) {
      const body = m[2] ?? '';
      if (!/(^|[;\s])display\s*:/.test(body) || /display\s*:\s*none/.test(body)) continue;
      for (const sel of (m[1] ?? '').split(',')) {
        const bare = sel.trim().match(/^\.([a-z0-9-]+)$/i);
        if (bare?.[1]) found.add(bare[1]);
      }
    }
    return [...found];
  };

  it('reads a stylesheet with components in it, or it is checking nothing', () => {
    expect(settingDisplay().length).toBeGreaterThan(50);
  });

  /**
   * `!important` is the only weapon that reaches, because the competition is specificity rather
   * than order — and it is scoped to one attribute nothing else should be fighting over.
   */
  it('wins against every class that sets a display', () => {
    const rule = WITHOUT_COMMENTS.match(/\[hidden\]\s*\{([^}]*)\}/);

    expect(rule, 'The base layer declares no rule for [hidden]').not.toBeNull();
    expect(rule?.[1]?.replace(/\s+/g, ' ').trim()).toMatch(/display:\s*none\s*!important/);
  });

  /**
   * **Nothing else may claim the attribute.** A later rule setting `display` on `[hidden]`
   * without `!important` loses to this one, but one *with* it would be a second answer to one
   * question — which is the thing this system will not have two of.
   */
  it('is the only rule the attribute answers to', () => {
    const claims = [...WITHOUT_COMMENTS.matchAll(/([^{}]*\[hidden\][^{}]*)\{([^}]*)\}/g)].filter(
      (m) => /(^|[;\s])display\s*:/.test(m[2] ?? ''),
    );

    expect(claims.map((m) => (m[1] ?? '').trim())).toEqual(['[hidden]']);
  });
});
