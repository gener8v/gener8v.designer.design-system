import { describe, expect, it, beforeAll } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { render } from '@testing-library/react';
import { Sidebar, SidebarSection, SidebarGroup, SidebarItem } from '../packages/ui/src/index.js';
import userEvent from '@testing-library/user-event';

/**
 * A rail built from a list of groups spaces itself the way a hand-written one does.
 *
 * `.sidebar` is a flex column: its own `gap` separates the items, and `.sidebar-group:first-child`
 * drops the leading heading's margin. Both rules read the rail's DIRECT children, so they hold only
 * while headings and items are siblings — which they are in a rail written out by hand, and are not
 * the moment groups come from data and something has to wrap them.
 *
 * A consumer hit exactly that. Every heading was the first child of its own wrapper, so every
 * heading lost its margin rather than only the first, and the rail's gap fell between the wrappers
 * instead of between the items: no separation above "Governance", and items flush against each
 * other all the way down.
 *
 * The stylesheet goes into jsdom because the fix is a declaration, not markup.
 *
 * WHAT JSDOM CAN AND CANNOT SAY HERE
 *
 * It resolves a literal — `display: flex` comes back as `flex`. It does NOT resolve custom
 * properties or map logical properties onto physical ones: `margin-block-start: var(--space-4)`
 * comes back as the string `var(--space-4)`, and `margin-top` as `0px`. So a spec that parses these
 * as pixels is asserting jsdom's serialisation rather than the gap.
 *
 * What is still worth asserting is WHICH RULE APPLIES: an unset margin comes back empty or `0px`,
 * and one the section rule set comes back as the token reference. That distinguishes the defect
 * from the fix, which is the whole job. The pixels were measured in a browser against the design
 * lab: 16px between groups, 4px between items, and 0 above the first heading.
 */
beforeAll(() => {
  const style = document.createElement('style');
  style.textContent = readFileSync(join(__dirname, '..', 'design', 'styles.css'), 'utf8');
  document.head.appendChild(style);
});

function GroupedRail() {
  return (
    <Sidebar aria-label="rail">
      <SidebarSection label="The work">
        <SidebarItem href="#" current>Attention</SidebarItem>
        <SidebarItem href="#">Deliverables</SidebarItem>
      </SidebarSection>
      <SidebarSection label="Governance">
        <SidebarItem href="#">Standards</SidebarItem>
      </SidebarSection>
    </Sidebar>
  );
}

describe('a rail built from a list of groups', () => {
  it('spaces the items inside a group', () => {
    // The rail's own gap cannot reach them once they are wrapped, so the section carries one.
    const { container } = render(<GroupedRail />);
    const section = container.querySelector('.sidebar-section')!;

    expect(getComputedStyle(section).display).toBe('flex');
    expect(getComputedStyle(section).gap).toMatch(/var\(--space/);
  });

  it('separates one group from the next', () => {
    // The defect: every heading was a `:first-child`, so every heading had margin 0 and the groups
    // ran together.
    const { container } = render(<GroupedRail />);
    const [first, second] = [...container.querySelectorAll('.sidebar-section')];
    const declared = (el: Element) => getComputedStyle(el).marginBlockStart;

    // Nothing sets a margin on the first — `.sidebar-section + .sidebar-section` cannot match it.
    expect(declared(first)).not.toMatch(/var\(--space/);
    expect(declared(second)).toMatch(/var\(--space/);
  });

  // NO SPEC FOR THE HEADING'S OWN MARGIN INSIDE A SECTION.
  //
  // `.sidebar-group:first-child` already zeroes it, because the heading is the section's first
  // child. An explicit reset was written, and removing it left this spec green — a rule that does
  // nothing and a spec that cannot fail. Both went.

  it('leaves a hand-written flat rail alone', () => {
    // The flat form is the documented one and stays correct: the leading heading has no margin, a
    // later one does, and neither is inside a section.
    const { container } = render(
      <Sidebar aria-label="flat">
        <SidebarGroup>Delivery</SidebarGroup>
        <SidebarItem href="#">Engagements</SidebarItem>
        <SidebarGroup>Governance</SidebarGroup>
        <SidebarItem href="#">Audit log</SidebarItem>
      </Sidebar>,
    );
    const [first, second] = [...container.querySelectorAll('.sidebar-group')];
    const declared = (el: Element) => getComputedStyle(el).marginBlockStart;

    expect(declared(first)).toBe('0px');
    expect(declared(second)).toMatch(/var\(--space/);
  });
});

describe('a group that collapses', () => {
	it('folds its items out of the accessibility tree, not just out of sight', async () => {
		// `hidden`, not a zero height. A collapsed group a screen reader still walks is a group that
		// was never collapsed — the same call the accordion panel makes.
		const { container } = render(
			<Sidebar aria-label="rail">
				<SidebarSection label="Governance" collapsible>
					<SidebarItem href="#">Standards</SidebarItem>
				</SidebarSection>
			</Sidebar>,
		);
		const toggle = container.querySelector('.sidebar-group-toggle')!;
		expect(toggle.getAttribute('aria-expanded')).toBe('true');

		await userEvent.click(toggle);

		expect(toggle.getAttribute('aria-expanded')).toBe('false');
		expect(container.querySelector('.sidebar-section-items')?.hasAttribute('hidden')).toBe(true);
	});

	it('names the region the heading controls', () => {
		// Without `aria-controls` the button announces an expanded state for nothing in particular.
		const { container } = render(
			<Sidebar aria-label="rail">
				<SidebarSection label="Governance" collapsible>
					<SidebarItem href="#">Standards</SidebarItem>
				</SidebarSection>
			</Sidebar>,
		);
		const toggle = container.querySelector('.sidebar-group-toggle')!;

		expect(container.querySelector(`#${CSS.escape(toggle.getAttribute('aria-controls')!)}`)).not.toBeNull();
	});

	it('leaves a plain section with no control to read past', () => {
		// Collapsing is opt-in. A rail of two groups does not need it, and a control that does
		// nothing useful is still one somebody has to read past.
		const { container } = render(
			<Sidebar aria-label="rail">
				<SidebarSection label="The work">
					<SidebarItem href="#">Attention</SidebarItem>
				</SidebarSection>
			</Sidebar>,
		);

		expect(container.querySelector('.sidebar-group-toggle')).toBeNull();
		expect(container.querySelector('p.sidebar-group')?.textContent).toBe('The work');
	});
});
