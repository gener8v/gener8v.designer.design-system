import { describe, expect, it, beforeAll } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { render, screen } from '@testing-library/react';
import { act } from 'react';
import { Alert, AlertTitle, AlertBody, Tabs, Tab } from '../packages/ui/src/index.js';

beforeAll(() => {
  const style = document.createElement('style');
  style.textContent = readFileSync(join(__dirname, '..', 'design', 'styles.css'), 'utf8');
  document.head.appendChild(style);
});

describe('an alert', () => {
  it('puts its title above its body, not beside it', () => {
    // `.alert` is a flex ROW so the icon can sit beside the message. That only works if the
    // message is ONE flex item — the component rendered the title and the body as separate
    // children, so they became two items side by side and the body's top margin did nothing.
    const { container } = render(
      <Alert tone="danger"><AlertTitle>No standards</AlertTitle><AlertBody>Nothing measures it.</AlertBody></Alert>,
    );
    const content = container.querySelector('.alert-content');

    expect(content).not.toBeNull();
    expect(content!.querySelector('.alert-title')).not.toBeNull();
    expect(content!.querySelector('.alert-body')).not.toBeNull();
  });

  it('rules off its title from the body below it', () => {
    // The same treatment the rail's group headings carry: a heading and the thing it heads need a
    // boundary, not only a gap.
    const { container } = render(
      <Alert tone="danger"><AlertTitle>No standards</AlertTitle><AlertBody>Nothing measures it.</AlertBody></Alert>,
    );

    // The SHORTHAND, because jsdom stores what was declared and does not expand it into
    // `border-block-end-style` — asserting the longhand tests jsdom, not the rule.
    expect(getComputedStyle(container.querySelector('.alert-title')!).borderBlockEnd).toMatch(/1px solid/);
  });

  it('gives that stack the width the alert has', () => {
    // The rule under the title spans the TITLE'S box, and the title is as wide as the stack around
    // it. Left at the default `flex: 0 1 auto` the stack sits at its own longest line while the
    // alert fills whatever it is given, so the rule stopped partway across a band of colour and
    // read as something half drawn.
    const { container } = render(
      <Alert tone="warning"><AlertTitle>Saved</AlertTitle><AlertBody>It took.</AlertBody></Alert>,
    );

    expect(getComputedStyle(container.querySelector('.alert-content')!).flexGrow).toBe('1');
  });

  it('leaves a title-only alert without a rule hanging in space', () => {
    // Nothing follows it, so there is nothing to be separated from.
    const { container } = render(<Alert tone="warning"><AlertTitle>Saved</AlertTitle></Alert>);

    expect(getComputedStyle(container.querySelector('.alert-title')!).borderBlockEnd).not.toMatch(/1px solid/);
  });

  it('keeps the icon out of that stack', () => {
    // An icon passed as a child would land inside the message and push the title down a line,
    // which is why it is a prop.
    const { container } = render(
      <Alert tone="warning" icon={<svg data-testid="glyph" />}><AlertTitle>T</AlertTitle></Alert>,
    );

    expect(container.querySelector('.alert-content svg')).toBeNull();
    expect(container.querySelector('.alert > svg')).not.toBeNull();
  });
});

describe('a tab', () => {
  it('carries no mark when its label explains itself', () => {
    // A mark on every tab explains nothing.
    const { container } = render(<Tabs><Tab selected>Coverage</Tab></Tabs>);

    expect(container.querySelector('.tab-hint')).toBeNull();
  });

  it('marks a label that needs explaining, and describes the tab itself', () => {
    // The TAB is the tooltip's trigger, so hover and focus both reach it and nothing interactive
    // is nested inside a button.
    const { container } = render(
      <Tabs><Tab selected hint="Every standard on the shared shelf.">Library</Tab></Tabs>,
    );
    const tab = container.querySelector<HTMLButtonElement>('.tab')!;

    expect(container.querySelector('.tab-hint')).not.toBeNull();
    // The mark is decoration; the tooltip carries the words.
    expect(container.querySelector('.tab-hint')!.getAttribute('aria-hidden')).toBe('true');

    // `aria-describedby` is wired only while the tooltip is OPEN — pointing it at an element that
    // is not in the document would be worse than not wiring it. Focus opens it immediately,
    // because a keyboard user has already committed by the time they land.
    act(() => tab.focus());

    expect(tab.getAttribute('aria-describedby')).toBeTruthy();
    expect(screen.getByText('Every standard on the shared shelf.')).toBeTruthy();
  });
});
