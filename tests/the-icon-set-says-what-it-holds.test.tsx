import { describe, expect, it } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
// @ts-expect-error -- plain .mjs script, no type declarations
import { readIcons, renderPage, renderReadme, splice } from '../scripts/icons.mjs';

const SRC = join(__dirname, '..', 'packages', 'icons', 'src');
const INDEX = readFileSync(join(SRC, 'index.ts'), 'utf8');
const README = readFileSync(join(SRC, '..', 'README.md'), 'utf8');
const PAGE = readFileSync(join(__dirname, '..', 'design', 'foundations', 'icons.html'), 'utf8');

const exported = [...INDEX.matchAll(/export \{ (\w+) \}/g)].map((m) => m[1]!);

describe('the icon set says what it holds', () => {
  it('exports every icon in the directory', () => {
    // A file nobody exports is a glyph that exists and cannot be used — and the next person adds
    // it again under a different name.
    const files = readdirSync(SRC)
      .filter((f) => f.endsWith('.tsx'))
      .map((f) => f.replace('.tsx', ''));
    expect(files.filter((f) => !exported.includes(f))).toEqual([]);
  });

  it('every icon has a meaning, a group and one path', () => {
    // readIcons throws on an icon the catalogue cannot render, naming the file.
    expect(readIcons().map((i) => i.name)).toEqual([...exported].sort((a, b) => a.localeCompare(b)));
  });

  it('the readme and the demo page show the set the package holds', () => {
    // THE README STATED A COUNT AND NAMED ALL TWENTY-ONE, and the demo page drew eight. Adding icons
    // left both describing a set that no longer existed, on the pages somebody reads to find out
    // what is available — so they add a second copy of something already here. Both are now
    // rendered from the icon files: the README by `pnpm build:icons`, the page by `pnpm build`.
    const icons = readIcons();
    expect(README, 'README is stale: run pnpm build:icons').toBe(splice(README, renderReadme(icons), 'README'));
    expect(PAGE.includes(renderPage(icons)), 'icons.html is stale: run pnpm build').toBe(true);
  });

  it('says what each one is FOR, not just what it is called', () => {
    // A subset defined by USE has to record the use, or the next reader cannot tell whether a
    // glyph is load-bearing or decoration — and deletes the wrong one.
    // A SENTENCE BEYOND THE BOILERPLATE. Every file opens with the Phosphor name and the sizing
    // note; what has to be there as well is what the glyph MEANS here. Counting lines was the
    // first attempt and it flagged the icons that did state a purpose, because three lines is
    // what a stated purpose looks like.
    const silent = readdirSync(SRC)
      .filter((f) => f.endsWith('.tsx'))
      .filter((f) => {
        const body = readFileSync(join(SRC, f), 'utf8');
        const comment = body.slice(body.indexOf('/**'), body.indexOf('*/'));
        const beyond = comment
          .replace(/Phosphor `[\w-]+` at regular weight\./, '')
          .replace(/Sized in em so it tracks the type\./, '')
          .replace(/[/*\s]/g, '');
        return beyond.length < 20;
      });
    expect(silent, `no stated purpose: ${silent.join(', ')}`).toEqual([]);
  });
});
