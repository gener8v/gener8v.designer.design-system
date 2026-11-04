// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { Button, Dialog, Field, FieldLabel, Input } from '../packages/ui/src/index.js';
import { expectNoA11yViolations } from './a11y.js';

afterEach(cleanup);

const CSS = readFileSync(join(__dirname, '..', 'design', 'styles.css'), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
const rule = (selector: string) => {
  const esc = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`(?:^|\\})\\s*${esc}\\s*\\{([^}]*)\\}`, 'm').exec(CSS)?.[1] ?? '';
};

/** A form long enough to be taller than a phone. */
function Terms({ tone }: { tone?: 'accent' }) {
  return (
    <Dialog open onClose={() => {}} tone={tone} title="Statement of work terms"
      actions={<><Button>Cancel</Button><Button variant="primary">Draft Statement</Button></>}>
      <form aria-label="Terms">
        {Array.from({ length: 14 }, (_, i) => (
          <Field key={i}>
            <FieldLabel htmlFor={`term-${i}`}>{`Term ${i + 1}`}</FieldLabel>
            <Input id={`term-${i}`} />
          </Field>
        ))}
      </form>
    </Dialog>
  );
}

/**
 * The dialog's rows were `auto auto minmax(0, 1fr) auto` — four, counting the tone band. Without a
 * tone the body sat in an `auto` row and never scrolled, and on a phone a long form pushed its own
 * buttons off the dialog. The delivery record set `tone="accent"` on every form dialog to get
 * round it.
 */
describe('a dialog keeps its buttons', () => {
  it('lays out as a column, so there is no row for a missing tone band to miscount', () => {
    const dialog = rule('.dialog');
    expect(dialog).toMatch(/display:\s*flex/);
    expect(dialog).toMatch(/flex-direction:\s*column/);
    expect(dialog).not.toMatch(/grid-template-rows/);
    expect(dialog).toMatch(/max-block-size:\s*calc\(100dvh/);
  });

  it('lets the body alone give way and scroll; the band, the title and the actions keep their size', () => {
    const body = rule('.dialog-body');
    expect(body).toMatch(/flex:\s*0 1 auto/);
    expect(body).toMatch(/min-block-size:\s*0/);
    expect(body).toMatch(/overflow-y:\s*auto/);
    expect(CSS).toMatch(/\.dialog::before, \.dialog-title, \.dialog-actions \{\s*flex: none;?\s*\}/);
  });

  it.each([
    ['without a tone', undefined],
    ['with a tone', 'accent' as const],
  ])('puts a long form in the body and the actions after it, %s', (_, tone) => {
    render(<Terms tone={tone} />);
    const dialog = screen.getByRole('dialog', { name: 'Statement of work terms' });
    const parts = [...dialog.children].map((el) => el.className);
    expect(parts).toEqual(['dialog-title', 'dialog-body', 'dialog-actions']);
    expect(dialog.querySelector('.dialog-body')).toContainElement(screen.getByRole('form', { name: 'Terms' }));
    expect(dialog.querySelector('.dialog-actions')).toContainElement(screen.getByRole('button', { name: 'Draft Statement' }));
    if (tone) expect(dialog).toHaveAttribute('data-tone', 'accent');
    else expect(dialog).not.toHaveAttribute('data-tone');
  });

  it('wraps the actions on a narrow dialog rather than pushing one off the side', () => {
    expect(rule('.dialog-actions')).toMatch(/flex-wrap:\s*wrap/);
  });

  it('passes axe, with and without a tone', async () => {
    const { unmount } = render(<Terms />);
    await expectNoA11yViolations(document.body);
    unmount();
    render(<Terms tone="accent" />);
    await expectNoA11yViolations(document.body);
  });
});
