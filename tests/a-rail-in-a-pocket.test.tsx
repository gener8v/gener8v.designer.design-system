// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { useState } from 'react';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { Drawer, Sidebar, SidebarItem, SidebarSection } from '../packages/ui/src/index.js';
import { expectNoA11yViolations } from './a11y.js';

afterEach(cleanup);

const CSS = readFileSync(join(__dirname, '..', 'design', 'styles.css'), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');

/** The delivery record's shell: groups that fold, and on a phone the same rail in a drawer. */
describe('a rail in a pocket', () => {
  it('folds a group under the shell’s control, so the shell can remember it', () => {
    function Shell() {
      const [open, setOpen] = useState(false);
      return (
        <Sidebar aria-label="Delivery">
          <SidebarSection label="Governance" collapsible open={open} onOpenChange={setOpen}>
            <SidebarItem href="#">Audit log</SidebarItem>
          </SidebarSection>
          <p>{open ? 'remembered open' : 'remembered shut'}</p>
        </Sidebar>
      );
    }
    render(<Shell />);
    const toggle = screen.getByRole('button', { name: 'Governance' });
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    fireEvent.click(toggle);
    expect(toggle).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByText('remembered open')).toBeTruthy();
  });

  it('still folds on its own when nobody controls it', () => {
    render(<Sidebar><SidebarSection label="Delivery" collapsible><SidebarItem href="#">Findings</SidebarItem></SidebarSection></Sidebar>);
    const toggle = screen.getByRole('button', { name: 'Delivery' });
    fireEvent.click(toggle);
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByRole('link', { name: 'Findings' })).toBeNull();
  });

  it('comes from the start edge as a drawer, and the rail gives up its own surface inside it', () => {
    render(
      <Drawer open onClose={() => {}} side="start" aria-label="Navigation">
        <Sidebar aria-label="Delivery"><SidebarItem href="#" current>Findings</SidebarItem></Sidebar>
      </Drawer>,
    );
    expect(screen.getByRole('dialog', { name: 'Navigation' })).toHaveAttribute('data-side', 'start');
    expect(CSS).toMatch(/\.drawer-panel\[data-side="start"\] \{[^}]*inset-inline-start: 0/);
    expect(CSS).toMatch(/\.drawer-panel > \.sidebar \{[^}]*inline-size: auto/);
  });

  it('keeps the end edge by default', () => {
    render(<Drawer open onClose={() => {}} aria-label="Menu" />);
    expect(screen.getByRole('dialog', { name: 'Menu' })).not.toHaveAttribute('data-side');
  });

  it('passes axe', async () => {
    render(
      <Drawer open onClose={() => {}} side="start" aria-label="Navigation">
        <Sidebar aria-label="Delivery">
          <SidebarSection label="Delivery" collapsible><SidebarItem href="#" current>Findings</SidebarItem></SidebarSection>
        </Sidebar>
      </Drawer>,
    );
    await expectNoA11yViolations(document.body);
  });
});
