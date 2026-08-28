import { describe, expect, it } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const SRC = join(__dirname, '..', 'packages', 'icons', 'src');
const INDEX = readFileSync(join(SRC, 'index.ts'), 'utf8');
const README = readFileSync(join(SRC, '..', 'README.md'), 'utf8');

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

  it('lists every exported icon in the readme', () => {
    // THE README STATED A COUNT AND NAMED ALL TWENTY-ONE. Adding icons left it describing a set
    // that no longer existed — on the page somebody reads to find out what is available, so the
    // cost of the staleness is that they add a second copy of something already here.
    // THE LIST, not the prose. The paragraphs below it name several icons while explaining what
    // they are for, so a whole-file search passes on a mention and the SCANNABLE list — the thing
    // somebody actually reads to find out what is available — can quietly lose an entry.
    const list = README.slice(
      README.indexOf('`ArrowRight`'),
      README.indexOf('## The set grew')
    );
    expect(list, 'the backticked list of names was not found').toContain('`ArrowRight`');
    const missing = exported.filter((name) => !list.includes(`\`${name}\``));
    expect(missing, `not in the readme list: ${missing.join(', ')}`).toEqual([]);
  });

  it('states the count it actually holds', () => {
    expect(README).toContain(`${exported.length} icons, not 1,500`);
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
