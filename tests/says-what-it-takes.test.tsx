import { describe, expect, it } from 'vitest';
import { useState } from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Combobox, InputAddon, InputGroup, Input, RadioCard, RadioCards } from '../packages/ui/src/index.js';

/** A combobox that keeps what it is given, so a spec can see what was committed. */
function Picking({ options, allowCustom }: { options: { value: string; label: string }[]; allowCustom?: boolean }) {
  const [value, setValue] = useState<string | null>(null);
  return (
    <>
      <Combobox label="What is this about?" options={options} value={value}
        onChange={setValue} allowCustom={allowCustom} />
      <p data-testid="value">{value ?? ''}</p>
    </>
  );
}

describe('a field that takes what the list does not have', () => {
  it('offers what you typed as something you can pick', () => {
    // THE DEFECT: `allowCustom` was invisible. A list holding nothing said "Nothing to choose
    // from yet" — the one message that is never true of a field accepting anything — and the
    // person who needed a subject the record did not have yet read it as a dead end and asked
    // how to create one. The answer, "type it and leave the field", was written nowhere.
    render(<Picking options={[{ value: 'd-1', label: 'One writer at a time' }]} allowCustom />);
    const input = screen.getByRole('combobox');
    fireEvent.change(input, { target: { value: 'our payment stack' } });

    const offer = screen.getByRole('option', { name: /our payment stack/ });
    fireEvent.click(offer);

    expect(screen.getByTestId('value').textContent).toBe('our payment stack');
  });

  it('does not offer to invent a name the list already holds', () => {
    // A second name for a thing the record already names is a thing nobody finds later, so the
    // real option must win — and appear once, not twice.
    render(<Picking options={[{ value: 'd-1', label: 'One writer at a time' }]} allowCustom />);
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'One writer at a time' } });

    expect(screen.getAllByRole('option', { name: /One writer at a time/ })).toHaveLength(1);
  });

  it('says what to do when it has nothing to offer', () => {
    render(<Picking options={[]} allowCustom />);
    fireEvent.click(screen.getByRole('button', { name: /suggestions/i }));

    expect(screen.getByText(/type to add your own/i)).toBeTruthy();
    // And the other case is untouched: a field that only picks still says so.
    expect(screen.queryByText(/nothing to choose from yet/i)).toBeNull();
  });

  it('still says there is nothing when there is nothing you can do', () => {
    render(<Picking options={[]} />);
    fireEvent.click(screen.getByRole('button', { name: /suggestions/i }));

    expect(screen.getByText(/nothing to choose from yet/i)).toBeTruthy();
  });
});

describe('a field with words attached to it', () => {
  it('keeps the question on the control, not only in the sentence', () => {
    // The addon is the part of the sentence nobody has to type. A screen reader gets the row as a
    // run of text, so the field still needs the question on itself.
    const { container } = render(
      <InputGroup>
        <Input aria-label="What must stay true" defaultValue="one writer at a time" />
        <InputAddon>must stay true</InputAddon>
      </InputGroup>,
    );

    expect(container.querySelector('.input-group')).not.toBeNull();
    expect(screen.getByLabelText('What must stay true')).toBeTruthy();
  });
});

describe('choices that belong to one question', () => {
  it('can sit side by side rather than down the page', () => {
    // Three short options stacked read as three separate questions.
    const { container } = render(
      <RadioCards columns={3}>
        <RadioCard name="d" value="a" title="Chosen" checked readOnly />
        <RadioCard name="d" value="b" title="Inherited" readOnly />
        <RadioCard name="d" value="c" title="Nobody knows" readOnly />
      </RadioCards>,
    );

    expect(container.querySelector('.radio-cards')?.getAttribute('data-columns')).toBe('3');
  });
});
