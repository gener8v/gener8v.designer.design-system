import { describe, expect, it, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/react';
import { DocList, DocRow } from '../packages/ui/src/index.js';

/**
 * A row that is not a file.
 *
 * `kindOf` reads an extension, which is right for a document library and wrong for a list of
 * RECORDS. A standard, a deliverable and a decision are all markdown, so badging them by format
 * gives three identical "MD" badges and tells a reader nothing about which is which.
 *
 * A consumer with its own vocabulary had the choice of that or hand-rolling the whole list, and
 * chose the second — which is how a rail ends up with its own hover state, its own selected state
 * and its own idea of what a row looks like.
 */
afterEach(cleanup);

const badge = (container: HTMLElement) => container.querySelector('.doc-type')?.textContent;

describe('a row in a list of records', () => {
  it('says what kind of record it is, not what file it happens to be', () => {
    const { container } = render(
      <DocList>
        <DocRow name="SOX-04 Gap & Disposition Log" label="STD" sub="v3" />
      </DocList>
    );

    expect(badge(container)).toBe('STD');
  });

  it('still reads the extension when nobody says otherwise', () => {
    // The library case, unchanged — a consumer that has files should not have to name their kinds.
    const { container } = render(
      <DocList>
        <DocRow name="handbook.pdf" />
      </DocList>
    );

    expect(badge(container)).toBe('PDF');
  });

  it('marks the selected row through aria, not a class', () => {
    // `.doc-row[aria-selected="true"]` is what the system styles, so the visual and the
    // accessibility tree cannot disagree about which row is open.
    const { container } = render(
      <DocList>
        <DocRow name="a" selected />
        <DocRow name="b" />
      </DocList>
    );

    const rows = [...container.querySelectorAll('.doc-row')];
    expect(rows.map((r) => r.getAttribute('aria-selected'))).toEqual(['true', null]);
  });
});
