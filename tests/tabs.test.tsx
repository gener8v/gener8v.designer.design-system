import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Tabs, Tab } from '../packages/ui/src/index.js';

function setup(props: Partial<React.ComponentProps<typeof Tabs>> = {}) {
  const onSelectIndex = vi.fn();
  render(
    <Tabs aria-label="Sections" onSelectIndex={onSelectIndex} {...props}>
      <Tab selected>Overview</Tab>
      <Tab selected={false}>Scope</Tab>
      <Tab selected={false} disabled>Skipped</Tab>
      <Tab selected={false}>Audit</Tab>
    </Tabs>,
  );
  return { onSelectIndex, tabs: screen.getAllByRole('tab') };
}

describe('Tabs roving tabindex', () => {
  it('exposes only the selected tab to the Tab sequence', () => {
    const { tabs } = setup();
    expect(tabs[0]).toHaveAttribute('tabindex', '0');
    expect(tabs[1]).toHaveAttribute('tabindex', '-1');
  });

  it('ArrowRight moves focus and activates', async () => {
    const u = userEvent.setup();
    const { onSelectIndex, tabs } = setup();
    tabs[0].focus();
    await u.keyboard('{ArrowRight}');
    expect(tabs[1]).toHaveFocus();
    expect(onSelectIndex).toHaveBeenCalledWith(1);
  });

  it('skips disabled tabs', async () => {
    const u = userEvent.setup();
    const { tabs } = setup();
    tabs[1].focus();
    await u.keyboard('{ArrowRight}');
    expect(tabs[3]).toHaveFocus(); // index 2 is disabled
  });

  it('wraps at both ends', async () => {
    const u = userEvent.setup();
    const { tabs } = setup();
    tabs[3].focus();
    await u.keyboard('{ArrowRight}');
    expect(tabs[0]).toHaveFocus();
    await u.keyboard('{ArrowLeft}');
    expect(tabs[3]).toHaveFocus();
  });

  it('Home and End jump to the ends', async () => {
    const u = userEvent.setup();
    const { tabs } = setup();
    tabs[1].focus();
    await u.keyboard('{End}');
    expect(tabs[3]).toHaveFocus();
    await u.keyboard('{Home}');
    expect(tabs[0]).toHaveFocus();
  });

  it('vertical orientation uses Up/Down and announces itself', async () => {
    const u = userEvent.setup();
    const { tabs } = setup({ orientation: 'vertical' });
    expect(screen.getByRole('tablist')).toHaveAttribute('aria-orientation', 'vertical');
    tabs[0].focus();
    await u.keyboard('{ArrowDown}');
    expect(tabs[1]).toHaveFocus();
    await u.keyboard('{ArrowRight}'); // wrong axis — must not move
    expect(tabs[1]).toHaveFocus();
  });
});
