// @vitest-environment jsdom
import { afterEach, expect, test } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { useState } from 'react';
import { Filter, Filters } from '../packages/ui/src/index.js';

/**
 * What a filter must do that a segmented strip does not.
 *
 * The dimension stays readable whether or not it holds a value, the values are
 * a radio group rather than a row of buttons, and letting go of the filter is
 * offered rather than requiring the reader to remember which value meant *all*.
 */

afterEach(cleanup);

function Narrowing({ start = null }: { start?: string | null }) {
  const [value, setValue] = useState<string | null>(start);
  return (
    <Filters>
      <Filter
        name="Type"
        value={value}
        onChange={setValue}
        anyLabel="Any type"
        options={[
          { value: 'lesson', label: 'Daily lesson' },
          { value: 'key', label: 'Educator answer key' },
        ]}
      />
      <p>{value === null ? 'Not narrowed' : `Narrowed to ${value}`}</p>
    </Filters>
  );
}

test('the dimension is on the control before anything is chosen', () => {
  render(<Narrowing />);
  expect(screen.getByRole('button', { name: /Type/ })).toBeTruthy();
});

test('choosing a value narrows, and the dimension stays on the control', () => {
  render(<Narrowing />);
  fireEvent.click(screen.getByRole('button', { name: /Type/ }));
  fireEvent.click(screen.getByRole('menuitemradio', { name: 'Daily lesson' }));
  expect(screen.getByText('Narrowed to lesson')).toBeTruthy();
  /* Not `Daily lesson` alone: three pills carrying only their answers are three
     answers with the questions thrown away. */
  expect(screen.getByRole('button', { name: /Type/ })).toBeTruthy();
});

test('the values are a radio group, so a reader is told which is current', () => {
  render(<Narrowing start="key" />);
  fireEvent.click(screen.getByRole('button', { name: /Type/ }));
  expect(
    screen.getByRole('menuitemradio', { name: 'Educator answer key' }).getAttribute('aria-checked'),
  ).toBe('true');
  expect(
    screen.getByRole('menuitemradio', { name: 'Daily lesson' }).getAttribute('aria-checked'),
  ).toBe('false');
});

test('letting the filter go is a choice on the menu, not a value to remember', () => {
  render(<Narrowing start="lesson" />);
  fireEvent.click(screen.getByRole('button', { name: /Type/ }));
  fireEvent.click(screen.getByRole('menuitemradio', { name: 'Any type' }));
  expect(screen.getByText('Not narrowed')).toBeTruthy();
});

test('no clearing choice is offered where the dimension must always hold one', () => {
  render(
    <Filter
      name="Sort"
      value="newest"
      onChange={() => {}}
      options={[{ value: 'newest', label: 'Newest' }]}
    />,
  );
  fireEvent.click(screen.getByRole('button', { name: /Sort/ }));
  expect(screen.queryByRole('menuitemradio', { name: /Any/ })).toBeNull();
});
