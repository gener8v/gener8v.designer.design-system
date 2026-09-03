import { describe, expect, it } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

/**
 * No page puts a quiet line above its loud one.
 *
 * The eyebrow — a mono `.label` sitting over a headline — was on the index, the thumbnail, the
 * landing template, the page-band demo, and on nineteen surfaces of the product that reads this
 * system. It is the last survivor of a header written as a sentence split across three elements:
 * a small label as the subject, a headline as the verb, a grey clause as the rest.
 *
 * Two things are wrong with it and neither is spacing. It inverts the order every reader has held
 * since print, because the first thing the eye reaches is the quietest thing on the page. And what
 * it says is almost always a category the reader has just chosen and can still see — the nav item
 * they clicked, highlighted, one column to the left.
 *
 * `.label` KEEPS EVERY OTHER JOB. It is the right thing on a figure, a data label, a section
 * marker that is the only heading its section has. What it may not be is a kicker over a heading,
 * and "directly above" is what separates the two.
 */
const DESIGN = join(__dirname, '..', 'design');

function pages(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    return entry.isDirectory() ? pages(path) : entry.name.endsWith('.html') ? [path] : [];
  });
}

describe('nothing sits above a heading', () => {
  it('puts no label over a headline on any page in the system', () => {
    const offenders: string[] = [];
    for (const page of pages(DESIGN)) {
      const lines = readFileSync(page, 'utf8').split('\n');
      lines.forEach((line, i) => {
        // The demo heads (`.demo-head label`) title a specimen rather than kicking off a page,
        // and they are the one place a mono line legitimately introduces what follows.
        if (!/class="label"/.test(line) || /demo-head/.test(line)) return;
        if (/<h[1-4]/.test(lines.slice(i + 1, i + 3).join(' '))) {
          offenders.push(`${page.slice(DESIGN.length + 1)}:${i + 1} ${line.trim().slice(0, 60)}`);
        }
      });
    }

    expect(offenders, `a label kicks off a heading:\n  ${offenders.join('\n  ')}`).toEqual([]);
  });
});
