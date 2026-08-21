import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useState } from 'react';
import { render, screen, act, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  CommandPalette, Tree, ToastProvider, useToast, Button, CodeBlock,
} from '../packages/ui/src/index.js';
import type { Command, TreeNode } from '../packages/ui/src/index.js';

/* ------------------------------------------------------------- command */

const run = vi.fn();
const COMMANDS: Command[] = [
  { id: 'close', label: 'Close work item', group: 'Work items', note: '⌘⇧C', onRun: run },
  { id: 'clone', label: 'Clone into a new item', group: 'Work items', onRun: run },
  { id: 'export', label: 'Export audit log', group: 'Engagement', keywords: 'download csv', onRun: run },
];

function Palette({ onClose = () => {} }) {
  return <CommandPalette open onClose={onClose} commands={COMMANDS} />;
}

describe('CommandPalette', () => {
  beforeEach(() => run.mockClear());

  it('is a modal dialog with focus in the search field', () => {
    render(<Palette />);
    expect(screen.getByRole('dialog')).toHaveAttribute('aria-modal', 'true');
    expect(screen.getByRole('combobox')).toHaveFocus();
  });

  it('tracks the highlighted row without moving DOM focus', async () => {
    const u = userEvent.setup();
    render(<Palette />);
    const input = screen.getByRole('combobox');
    await u.keyboard('{ArrowDown}');
    expect(input).toHaveFocus();
    const activeId = input.getAttribute('aria-activedescendant')!;
    expect(document.getElementById(activeId)).toHaveTextContent('Clone into a new item');
  });

  it('matches hidden keywords as well as labels', async () => {
    const u = userEvent.setup();
    render(<Palette />);
    await u.type(screen.getByRole('combobox'), 'csv');
    const options = screen.getAllByRole('option');
    expect(options).toHaveLength(1);
    expect(options[0]).toHaveTextContent('Export audit log');
  });

  it('Enter runs the highlighted command and closes', async () => {
    const u = userEvent.setup();
    const onClose = vi.fn();
    render(<Palette onClose={onClose} />);
    await u.keyboard('{ArrowDown}{ArrowDown}{Enter}');
    expect(run).toHaveBeenCalledTimes(1);
    expect(onClose).toHaveBeenCalled();
  });

  it('reports no match rather than showing an empty list', async () => {
    const u = userEvent.setup();
    render(<Palette />);
    await u.type(screen.getByRole('combobox'), 'zzzz');
    expect(screen.getByText('No matching command')).toBeInTheDocument();
  });
});

/* ---------------------------------------------------------------- tree */

const NODES: TreeNode[] = [
  { id: 'ac', label: 'AC — Access control', meta: '12', children: [
    { id: 'ac2', label: 'AC-2 Account management' },
    { id: 'ac6', label: 'AC-6 Least privilege' },
  ] },
  { id: 'au', label: 'AU — Audit', children: [{ id: 'au6', label: 'AU-6 Audit review' }] },
  { id: 'sc', label: 'SC — Communications' },
];

const rows = () => screen.getAllByRole('treeitem');
const btn = (name: RegExp) => screen.getByRole('button', { name });

describe('Tree', () => {
  it('is a single Tab stop with one roving tabindex', () => {
    render(<Tree nodes={NODES} aria-label="Controls" />);
    const buttons = screen.getAllByRole('button');
    expect(buttons.filter((b) => b.getAttribute('tabindex') === '0')).toHaveLength(1);
  });

  it('hides collapsed children from the accessibility tree', () => {
    render(<Tree nodes={NODES} aria-label="Controls" />);
    expect(rows()).toHaveLength(3);
    expect(screen.queryByText('AC-2 Account management')).toBeNull();
  });

  it('ArrowRight expands, then descends into the group', async () => {
    const u = userEvent.setup();
    render(<Tree nodes={NODES} aria-label="Controls" />);
    btn(/AC — Access control/).focus();
    await u.keyboard('{ArrowRight}');
    expect(screen.getByText('AC-2 Account management')).toBeInTheDocument();
    await u.keyboard('{ArrowRight}');
    expect(btn(/AC-2 Account management/)).toHaveFocus();
  });

  it('ArrowLeft collapses, then rises to the parent', async () => {
    const u = userEvent.setup();
    render(<Tree nodes={NODES} aria-label="Controls" defaultExpanded={['ac']} />);
    btn(/AC-2 Account management/).focus();
    await u.keyboard('{ArrowLeft}');
    expect(btn(/AC — Access control/)).toHaveFocus();
    await u.keyboard('{ArrowLeft}');
    expect(screen.queryByText('AC-2 Account management')).toBeNull();
  });

  it('Down moves through visible rows only, skipping collapsed children', async () => {
    const u = userEvent.setup();
    render(<Tree nodes={NODES} aria-label="Controls" />);
    btn(/AC — Access control/).focus();
    await u.keyboard('{ArrowDown}');
    expect(btn(/AU — Audit/)).toHaveFocus();      // AC's children are collapsed
  });

  it('reports expansion and selection to assistive tech', async () => {
    const u = userEvent.setup();
    const onSelect = vi.fn();
    render(<Tree nodes={NODES} aria-label="Controls" selected="au" onSelect={onSelect} />);
    expect(rows().find((r) => r.textContent?.startsWith('AU'))).toHaveAttribute('aria-selected', 'true');
    expect(rows()[0]).toHaveAttribute('aria-expanded', 'false');
    await u.click(btn(/AC — Access control/));
    expect(rows()[0]).toHaveAttribute('aria-expanded', 'true');
    expect(onSelect).toHaveBeenCalledWith('ac');
  });
});

/* --------------------------------------------------------------- toast */

function ToastHarness() {
  const { toast } = useToast();
  return <Button onClick={() => toast({ title: 'Scope saved', body: 'v4', tone: 'success', duration: 1000 })}>Save</Button>;
}

describe('ToastProvider', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  // fireEvent rather than userEvent: userEvent awaits internally, and under
  // fake timers those awaits never resolve.
  const click = (el: HTMLElement) => act(() => { fireEvent.click(el); });

  it('queues into a live region and auto-dismisses', () => {
    render(<ToastProvider><ToastHarness /></ToastProvider>);
    expect(screen.getByRole('region', { name: 'Notifications' })).toHaveAttribute('aria-live', 'polite');
    click(screen.getByText('Save'));
    expect(screen.getByText('Scope saved')).toBeInTheDocument();
    act(() => { vi.advanceTimersByTime(1200); });
    expect(screen.queryByText('Scope saved')).toBeNull();
  });

  it('caps the stack rather than piling up', () => {
    render(<ToastProvider max={2}><ToastHarness /></ToastProvider>);
    const save = screen.getByText('Save');
    click(save); click(save); click(save);
    expect(screen.getAllByText('Scope saved')).toHaveLength(2);
  });

  it('a dismiss button removes its own toast', () => {
    render(<ToastProvider><ToastHarness /></ToastProvider>);
    click(screen.getByText('Save'));
    click(screen.getByRole('button', { name: 'Dismiss' }));
    expect(screen.queryByText('Scope saved')).toBeNull();
  });

  it('throws a useful error outside a provider', () => {
    const quiet = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<ToastHarness />)).toThrow(/must be used inside/);
    quiet.mockRestore();
  });
});

describe('CodeBlock', () => {
  it('renders code verbatim inside pre/code', () => {
    const { container } = render(<CodeBlock code={'a\n  b'} title="install.sh" copyable />);
    expect(container.querySelector('pre.code code')?.textContent).toBe('a\n  b');
    expect(screen.getByText('install.sh')).toBeInTheDocument();
    expect(screen.getByText('Copy')).toBeInTheDocument();
  });
});
