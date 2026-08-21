import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { expectNoA11yViolations } from './a11y.js';

/**
 * A gate that cannot fail proves nothing. These assert the axe harness really
 * detects the classes of defect the component tests claim to rule out.
 */
describe('the a11y harness itself', () => {
  it('catches an icon-only control with no accessible name', async () => {
    const { container } = render(
      <main><button type="button"><svg viewBox="0 0 16 16" aria-hidden="true" /></button></main>);
    await expect(expectNoA11yViolations(container)).rejects.toThrow(/button-name/);
  });

  it('catches an input with no label', async () => {
    const { container } = render(<main><input type="text" /></main>);
    await expect(expectNoA11yViolations(container)).rejects.toThrow(/label/);
  });

  it('catches a broken aria reference', async () => {
    const { container } = render(
      <main><div role="dialog" aria-labelledby="does-not-exist">x</div></main>);
    await expect(expectNoA11yViolations(container)).rejects.toThrow(/aria-valid-attr-value|aria-labelledby/);
  });

  it('catches a table cell outside a table', async () => {
    const { container } = render(<main><div role="cell">orphan</div></main>);
    await expect(expectNoA11yViolations(container)).rejects.toThrow(/required-parent/);
  });
});
