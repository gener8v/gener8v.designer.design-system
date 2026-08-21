import { describe, it, expect, vi } from 'vitest';
import { useState } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expectNoA11yViolations } from './a11y.js';
import {
  useStepValidation, ErrorSummary, Field, FieldLabel, Input, Button, FlowFooter,
} from '../packages/ui/src/index.js';
import type { StepIssue } from '../packages/ui/src/index.js';

function Step({ onAdvance, extra }: { onAdvance: () => void; extra?: () => StepIssue[] }) {
  const { formRef, issues, tryAdvance } = useStepValidation(extra ? { validate: extra } : {});
  return (
    <div>
      <ErrorSummary issues={issues} />
      <div ref={formRef as React.RefObject<HTMLDivElement>}>
        <Field>
          <FieldLabel htmlFor="org">Client organisation</FieldLabel>
          <Input id="org" required />
        </Field>
        <Field>
          <FieldLabel htmlFor="mail">Contact email</FieldLabel>
          <Input id="mail" type="email" required />
        </Field>
      </div>
      <FlowFooter>
        <Button variant="primary" onClick={() => void tryAdvance(onAdvance)}>Continue</Button>
      </FlowFooter>
    </div>
  );
}

describe('validation on advance', () => {
  it('shows nothing until the user tries to advance', () => {
    render(<Step onAdvance={() => {}} />);
    expect(screen.queryByRole('alert')).toBeNull();
  });

  it('blocks advance and reports every problem, not just the first', async () => {
    const u = userEvent.setup();
    const onAdvance = vi.fn();
    render(<Step onAdvance={onAdvance} />);
    await u.click(screen.getByText('Continue'));
    expect(onAdvance).not.toHaveBeenCalled();
    const summary = screen.getByRole('alert');
    expect(summary).toHaveTextContent(/2 problems/);
    expect(summary.querySelectorAll('a')).toHaveLength(2);
  });

  it('marks the offending controls with aria-invalid', async () => {
    const u = userEvent.setup();
    render(<Step onAdvance={() => {}} />);
    await u.click(screen.getByText('Continue'));
    expect(screen.getByLabelText('Client organisation')).toHaveAttribute('aria-invalid', 'true');
  });

  it('a summary entry moves focus to its field', async () => {
    const u = userEvent.setup();
    render(<Step onAdvance={() => {}} />);
    await u.click(screen.getByText('Continue'));
    await u.click(screen.getByRole('alert').querySelectorAll('a')[1]!);
    expect(screen.getByLabelText('Contact email')).toHaveFocus();
  });

  it('advances once the step is valid, and clears aria-invalid', async () => {
    const u = userEvent.setup();
    const onAdvance = vi.fn();
    render(<Step onAdvance={onAdvance} />);
    await u.click(screen.getByText('Continue'));          // fails
    await u.type(screen.getByLabelText('Client organisation'), 'Commonwealth of Virginia');
    await u.type(screen.getByLabelText('Contact email'), 'a@example.gov');
    await u.click(screen.getByText('Continue'));
    expect(onAdvance).toHaveBeenCalledTimes(1);
    expect(screen.getByLabelText('Contact email')).not.toHaveAttribute('aria-invalid');
    expect(screen.queryByRole('alert')).toBeNull();
  });

  it('composes with a caller-supplied validator', async () => {
    const u = userEvent.setup();
    const onAdvance = vi.fn();
    render(<Step onAdvance={onAdvance}
      extra={() => [{ fieldId: 'org', message: 'That client is already under an active engagement' }]} />);
    await u.type(screen.getByLabelText('Client organisation'), 'Northlake');
    await u.type(screen.getByLabelText('Contact email'), 'a@example.gov');
    await u.click(screen.getByText('Continue'));
    expect(onAdvance).not.toHaveBeenCalled();
    expect(screen.getByRole('alert')).toHaveTextContent(/already under an active engagement/);
  });

  it('has no axe violations when reporting', async () => {
    const u = userEvent.setup();
    const { container } = render(<main><h1>Intake</h1><Step onAdvance={() => {}} /></main>);
    await u.click(screen.getByText('Continue'));
    await expectNoA11yViolations(container);
  });
});
