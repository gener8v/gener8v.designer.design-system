import axe from 'axe-core';

/**
 * Runs axe against a container and fails with the readable rule descriptions
 * rather than a raw violation dump.
 */
export async function expectNoA11yViolations(container: HTMLElement) {
  const results = await axe.run(container, {
    // Colour contrast is proven separately, in OKLCH, against the real tokens —
    // jsdom has no layout engine and cannot compute it.
    rules: { 'color-contrast': { enabled: false } },
  });
  if (results.violations.length > 0) {
    const detail = results.violations
      .map((v) => `  · [${v.id}] ${v.help}\n    ${v.nodes.map((n) => n.html).join('\n    ')}`)
      .join('\n');
    throw new Error(`axe found ${results.violations.length} violation(s):\n${detail}`);
  }
}
