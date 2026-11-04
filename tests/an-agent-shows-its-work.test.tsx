// @vitest-environment jsdom
import { useState } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import {
  ConfirmCard, Conversation, ToolChip, Turn, toolWords, type ConfirmState,
} from '../packages/ui/src/index.js';
import { expectNoA11yViolations } from './a11y.js';

afterEach(cleanup);

describe('a tool call is a chip', () => {
  it('says what the tool does while it runs, beside a pulse, and says it is running', () => {
    const { container } = render(<ToolChip label={toolWords('list_requirements')} args={{ capability: 'Reporting' }} />);
    const chip = container.querySelector('.tool-chip')!;
    expect(chip).toHaveAttribute('data-state', 'running');
    expect(chip).toHaveAttribute('aria-busy', 'true');
    expect(chip.querySelector('.live-pulse')).toHaveAttribute('aria-hidden', 'true');
    expect(screen.getByRole('button')).toHaveAccessibleName('List requirements, running');
  });

  it('puts the result where the label was once there is one', () => {
    const { container } = render(<ToolChip label="List requirements" result="Listed 6 requirements" />);
    expect(container.querySelector('.tool-chip')).toHaveAttribute('data-state', 'done');
    expect(container).toHaveTextContent('Listed 6 requirements');
    expect(container).not.toHaveTextContent('List requirements');
    expect(container.querySelector('.live-pulse')).toBeNull();
  });

  it('is not a button when there is nothing to open', () => {
    render(<ToolChip label="List requirements" result="Listed 6 requirements" />);
    expect(screen.queryByRole('button')).toBeNull();
  });

  it('opens to its arguments and its detail, and closes again', () => {
    render(<ToolChip label="Move requirement" result="Moved REQ-014 to M2"
      args={{ requirement_id: 'REQ-014', milestone: { id: 'm2', sequence: 2 } }} detail="200 OK" />);
    const toggle = screen.getByRole('button', { name: 'Moved REQ-014 to M2' });
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    fireEvent.click(toggle);
    expect(toggle).toHaveAttribute('aria-expanded', 'true');
    const detail = document.getElementById(toggle.getAttribute('aria-controls')!)!;
    expect(detail).toHaveTextContent('requirement idREQ-014');
    expect(detail).toHaveTextContent('milestone{"id":"m2","sequence":2}');
    expect(detail).toHaveTextContent('200 OK');
    fireEvent.click(toggle);
    expect(screen.queryByText('200 OK')).toBeNull();
  });

  it('says refused and failed in words, not in a colour', () => {
    const { container, rerender } = render(<ToolChip label="Start run" result="Not allowed from the chat" state="refused" />);
    expect(container.querySelector('.tool-chip')).toHaveAttribute('data-state', 'refused');
    expect(screen.getByText('refused')).toHaveClass('tag', 'tag-danger');
    rerender(<ToolChip label="Start run" result="The engine did not answer" state="failed" labels={{ failed: 'did not run' }} />);
    expect(screen.getByText('did not run')).toHaveClass('tag-danger');
  });

  it('writes a tool name as words', () => {
    expect(toolWords('list_requirements')).toBe('List requirements');
    expect(toolWords('assign-to-milestone')).toBe('Assign to milestone');
    expect(toolWords('__')).toBe('Working');
  });
});

function Asking({ onConfirm, spend, tier }: { onConfirm?: () => Promise<unknown>; spend?: boolean | string; tier?: 'confirm' | 'approval' }) {
  const [state, setState] = useState<ConfirmState>('open');
  return (
    <>
      <button type="button">Before</button>
      <ConfirmCard summary="Move REQ-014 to Milestone 2" values={[{ label: 'Fee', value: '$12,000' }]}
        tier={tier} spend={spend} state={state}
        onConfirm={async () => { await onConfirm?.(); setState('confirmed'); }}
        onCancel={() => setState('cancelled')} />
    </>
  );
}

describe('a change that needs a person asks one', () => {
  it('shows the change and its values, named as a change waiting for you', () => {
    render(<ConfirmCard summary="Move REQ-014 to Milestone 2" values={[{ label: 'Fee', value: '$12,000' }]} />);
    const card = screen.getByRole('group', { name: 'A change waiting for you' });
    expect(card).toHaveAttribute('data-tier', 'confirm');
    expect(card).toHaveTextContent('Move REQ-014 to Milestone 2');
    expect(card.querySelector('dl.confirm-card-values')).toHaveTextContent('Fee$12,000');
    expect(screen.getByRole('button', { name: 'Confirm Change' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
  });

  it('confirms, holds Cancel while it is busy, then stays as a record of the answer', async () => {
    let finish!: () => void;
    const wait = new Promise<void>((r) => { finish = r; });
    render(<Asking onConfirm={() => wait} />);
    const yes = screen.getByRole('button', { name: 'Confirm Change' });
    yes.focus();
    fireEvent.click(yes);
    expect(yes).toHaveAttribute('aria-busy', 'true');
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeDisabled();
    await act(async () => { finish(); await wait; });
    expect(screen.queryByRole('button', { name: 'Confirm Change' })).toBeNull();
    expect(screen.getByRole('status')).toHaveTextContent('confirmed');
    // The pressed button is gone; the card holds the focus rather than the page.
    expect(screen.getByRole('group', { name: 'A change waiting for you' })).toHaveFocus();
  });

  it('takes Cancel as an answer', () => {
    render(<Asking />);
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(screen.getByRole('status')).toHaveTextContent('cancelled');
  });

  it('says it costs money before the button, and the button says Approve Spend', () => {
    render(<Asking spend="starts a billed run" />);
    const card = screen.getByRole('group', { name: 'A change that costs money, waiting for you' });
    expect(card).toHaveAttribute('data-spend', 'true');
    expect(card).toHaveTextContent('costs moneystarts a billed run');
    expect(screen.getByText('costs money')).toHaveClass('tag-danger');
    expect(screen.getByRole('button', { name: 'Approve Spend' })).toBeInTheDocument();
  });

  it('asks for approval at the approval tier, and records it as approved', async () => {
    render(<Asking tier="approval" />);
    await act(async () => { fireEvent.click(screen.getByRole('button', { name: 'Approve' })); });
    expect(screen.getByRole('status')).toHaveTextContent('approved');
  });

  it('sends an approval it cannot take here to where it can be taken', () => {
    const go = vi.fn();
    render(<ConfirmCard summary="Replace the plan" tier="approval"
      elsewhere={{ note: 'Needs approval in Plan', action: { label: 'Open Approvals', onActivate: go } }} />);
    expect(screen.queryByRole('button', { name: 'Approve' })).toBeNull();
    expect(screen.getByText('Needs approval in Plan')).toHaveClass('tag-warning');
    fireEvent.click(screen.getByRole('button', { name: 'Open Approvals' }));
    expect(go).toHaveBeenCalled();
  });

  it('offers nothing to answer to a reader who can only read', () => {
    render(<ConfirmCard summary="Move REQ-014 to Milestone 2" readOnly onConfirm={() => {}} />);
    expect(screen.queryByRole('button')).toBeNull();
    expect(screen.getByText('read only')).toBeInTheDocument();
  });

  it('says a yes that did not land was not made, and why', () => {
    render(<ConfirmCard summary="Move REQ-014 to Milestone 2" state="failed" problem="The milestone was withdrawn." />);
    const status = screen.getByRole('status');
    expect(status).toHaveTextContent('not made');
    expect(status).toHaveTextContent('The milestone was withdrawn.');
  });

  it('passes axe inside a conversation, open and answered', async () => {
    const { container } = render(
      <Conversation label="Plan chat">
        <Turn side="sent">What is not covered?</Turn>
        <ToolChip label="List requirements" result="Listed 6 requirements" args={{ uncovered: true }} defaultOpen />
        <ToolChip label="Move requirement" />
        <ConfirmCard summary="Move REQ-014 to Milestone 2" values={[{ label: 'Milestone', value: 'Build the close' }]} />
        <ConfirmCard summary="Start a run" spend state="confirmed" />
      </Conversation>,
    );
    await expectNoA11yViolations(container);
  });
});
