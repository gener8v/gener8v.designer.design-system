// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen, within } from '@testing-library/react';
import { Avatar, Feed, FeedGroup, FeedItem } from '../packages/ui/src/index.js';
import { expectNoA11yViolations } from './a11y.js';

afterEach(cleanup);

const Icon = () => <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M0 0h16v16H0z" /></svg>;

function Sample() {
  return (
    <Feed aria-label="Activity">
      <FeedGroup actor="Dana Whitfield" when={<time dateTime="2026-11-02T14:02">14:02</time>}
        avatar={<Avatar size="sm" name="Dana Whitfield" />}>
        <FeedItem kind="Opened a finding" time="14:02" current>AU-6 has no evidence for Q3.</FeedItem>
        <FeedItem kind="Attached evidence" marker="icon" icon={<Icon />}>Q3 review log.xlsx</FeedItem>
      </FeedGroup>
      <FeedGroup actor="Sam Okafor">
        <FeedItem kind="Answered" marker="number" />
        <FeedItem kind="Answered" marker="number" number={7} />
      </FeedGroup>
    </Feed>
  );
}

describe('who did what, grouped by who', () => {
  it('is an ordered list of people, each an ordered list of acts named after its actor', () => {
    render(<Sample />);
    const feed = screen.getByRole('list', { name: 'Activity' });
    expect(feed.tagName).toBe('OL');
    const dana = screen.getByRole('list', { name: 'Dana Whitfield' });
    expect(within(dana).getAllByRole('listitem')).toHaveLength(2);
    expect(screen.getByRole('list', { name: 'Sam Okafor' })).toBeTruthy();
  });

  it('carries the actor once, not on every row', () => {
    render(<Sample />);
    expect(screen.getAllByText('Dana Whitfield')).toHaveLength(1);
  });

  it('says what kind of mark it carries, and the mark is decoration', () => {
    const { container } = render(<Sample />);
    const items = container.querySelectorAll('.feed-item');
    expect([...items].map((i) => i.getAttribute('data-marker'))).toEqual(['dot', 'icon', 'number', 'number']);
    expect(items[0]).toHaveAttribute('data-state', 'current');
    expect(items[2]!.querySelector('.feed-marker')).toBeEmptyDOMElement(); // counted by CSS
    expect(items[3]!.querySelector('.feed-marker')).toHaveTextContent('7');
    items.forEach((i) => expect(i.querySelector('.feed-marker')).toHaveAttribute('aria-hidden', 'true'));
  });

  it('passes axe', async () => {
    const { container } = render(<main><Sample /></main>);
    await expectNoA11yViolations(container);
  });
});
