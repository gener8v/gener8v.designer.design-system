import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Button, ButtonLink } from '../packages/ui/src/Button/Button.js';

describe('an action that is a link', () => {
  it('is an anchor with a destination, not a button with a handler', () => {
    // THE WHOLE POINT. A button with a click handler cannot be opened in a new tab, cannot be
    // copied, and does nothing before JavaScript arrives. An action that navigates is a link.
    render(<ButtonLink href="/api/deliverables/D1/download">Download this document</ButtonLink>);
    const action = screen.getByRole('link', { name: 'Download this document' });
    expect(action.tagName).toBe('A');
    expect(action).toHaveAttribute('href', '/api/deliverables/D1/download');
  });

  it('wears the same classes as the button it matches', () => {
    // Two elements that read as one control in a row must not drift apart. The classes are the
    // system's, so a link and a button beside each other line up on the same control scale.
    const { container: link } = render(<ButtonLink href="/x" variant="link" size="xs">Go</ButtonLink>);
    const { container: button } = render(<Button variant="link" size="xs">Go</Button>);
    expect(link.firstElementChild?.className).toBe(button.firstElementChild?.className);
  });

  it('carries every variant and size the button does', () => {
    const { container } = render(
      <ButtonLink href="/x" variant="primary" size="lg" block>Send</ButtonLink>,
    );
    const action = container.firstElementChild;
    expect(action?.className).toContain('btn-primary');
    expect(action?.className).toContain('btn-lg');
    expect(action?.className).toContain('btn-block');
  });

  it('names an icon-only action, because there is no text to read', () => {
    render(<ButtonLink href="/x" iconOnly aria-label="Download" ><span /></ButtonLink>);
    expect(screen.getByRole('link', { name: 'Download' })).toBeInTheDocument();
  });
});
