// @vitest-environment jsdom
import { afterEach, expect, test } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { useState } from 'react';
import { Filter } from '../packages/ui/src/index.js';
import { expectNoA11yViolations } from './a11y.js';

/**
 * Readers combine answers — the gaps AND the conflicts — so a dimension can hold several values.
 * The tick column, the keyboard and the menu are the ones a single-value filter already has.
 */
afterEach(cleanup);

const OPTIONS = [
  { value: 'gap', label: 'Gap', count: 12 },
  { value: 'conflict', label: 'Conflict', count: 3 },
  { value: 'unknown', label: 'Unknown', count: 0 },
];

function Kinds({ start = [] as string[] }) {
  const [values, setValues] = useState<string[]>(start);
  return (
    <>
      <Filter multiple name="Kind" values={values} onChange={setValues} anyLabel="Any kind" options={OPTIONS} />
      <p>{values.length ? `Showing ${values.join(' + ')}` : 'Not narrowed'}</p>
    </>
  );
}

const trigger = () => screen.getByRole('button', { name: /Kind/ });

test('reads as the dimension while nothing is chosen', () => {
  render(<Kinds />);
  expect(trigger()).toHaveTextContent(/^Kind$/);
  expect(trigger()).not.toHaveClass('filter-on');
});

test('the values are checkboxes, and ticking one leaves the menu open for the next', () => {
  render(<Kinds />);
  fireEvent.click(trigger());
  fireEvent.click(screen.getByRole('menuitemcheckbox', { name: /Gap/ }));
  expect(screen.getByRole('menu')).toBeTruthy();
  fireEvent.click(screen.getByRole('menuitemcheckbox', { name: /Conflict/ }));
  expect(screen.getByText('Showing gap + conflict')).toBeTruthy();
  expect(screen.getByRole('menuitemcheckbox', { name: /Gap/ })).toHaveAttribute('aria-checked', 'true');
  expect(screen.getByRole('menuitemcheckbox', { name: /Unknown/ })).toHaveAttribute('aria-checked', 'false');
});

test('one chosen shows the value; several show how many', () => {
  const { unmount } = render(<Kinds start={['conflict']} />);
  expect(trigger()).toHaveTextContent('KindConflict');
  unmount();
  render(<Kinds start={['conflict', 'gap']} />);
  expect(trigger()).toHaveTextContent('Kind· 2 chosen');
  expect(trigger()).toHaveAttribute('data-many');
});

test('the set comes back in the options’ order, whatever order it was ticked in', () => {
  render(<Kinds start={['unknown']} />);
  fireEvent.click(trigger());
  fireEvent.click(screen.getByRole('menuitemcheckbox', { name: /Gap/ }));
  expect(screen.getByText('Showing gap + unknown')).toBeTruthy();
});

test('unticking and letting go both work', () => {
  render(<Kinds start={['gap', 'conflict']} />);
  fireEvent.click(trigger());
  fireEvent.click(screen.getByRole('menuitemcheckbox', { name: /Gap/ }));
  expect(screen.getByText('Showing conflict')).toBeTruthy();
  fireEvent.click(screen.getByRole('menuitemcheckbox', { name: 'Any kind' }));
  expect(screen.getByText('Not narrowed')).toBeTruthy();
});

test('each value can say how many rows carry it', () => {
  render(<Kinds />);
  fireEvent.click(trigger());
  const counts = [...document.querySelectorAll('.filter-option-count')].map((c) => c.textContent);
  expect(counts).toEqual(['12', '3', '0']);
});

test('arrows still move through the values', () => {
  render(<Kinds />);
  fireEvent.keyDown(trigger(), { key: 'ArrowDown' });
  return Promise.resolve().then(() => {
    expect(document.activeElement).toHaveAttribute('role', 'menuitemcheckbox');
    fireEvent.keyDown(document.activeElement!, { key: 'ArrowDown' });
    expect(document.activeElement).toHaveTextContent(/Gap/);
  });
});

test('a single-value filter is unchanged: radios, and a choice closes the menu', () => {
  function One() {
    const [v, setV] = useState<string | null>(null);
    return <Filter name="Kind" value={v} onChange={setV} options={OPTIONS} />;
  }
  render(<One />);
  fireEvent.click(trigger());
  fireEvent.click(screen.getByRole('menuitemradio', { name: /Gap/ }));
  expect(screen.queryByRole('menu')).toBeNull();
  expect(trigger()).toHaveTextContent('KindGap');
});

test('passes axe open', async () => {
  render(<main><Kinds start={['gap', 'conflict']} /></main>);
  fireEvent.click(trigger());
  await expectNoA11yViolations(document.body);
});
