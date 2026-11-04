/**
 * The choosing gate, checked: it has to pass on the repository and fail on each thing it exists
 * to catch. A gate that cannot fail is a comment.
 */
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import {
  ROOT, load, validate, packageExports, stylesheetClasses, indexRows, dirsWithoutWhen, renderAll, stale,
  ownerOf, MARK_START, MARK_END,
} from '../scripts/choosing.mjs';

const rd = (p: string) => readFileSync(join(ROOT, p), 'utf8');

type Entry = {
  name: string; family: string; job: string; use: string[];
  not: { when: string; use: string; because: string }[];
  neighbours: string[]; react: string[]; hooks?: string[]; css: string[]; page: string | null;
};

const entry = (over: Partial<Entry> & { name: string }): Entry => ({
  family: 'navigation', job: 'do a thing', use: ['When it fits.'],
  not: [{ when: 'it does not', use: 'Other', because: 'the other one does.' }],
  neighbours: ['Other'], react: [over.name], css: [`.${over.name.toLowerCase()}`], page: null,
  ...over,
});

/** A small, valid world to break one thing at a time. */
function world(entries: Entry[], extra: Partial<Parameters<typeof validate>[0]> = {}) {
  return validate({
    families: ['navigation', 'input'],
    entries,
    screens: [],
    exports: { components: entries.flatMap((e) => e.react), other: [] },
    classes: new Set(entries.flatMap((e) => e.css)),
    rows: [],
    exists: () => true,
    ...extra,
  });
}

const tabs = entry({ name: 'Tabs', not: [{ when: 'views', use: 'Segmented', because: 'it is a radiogroup.' }], neighbours: ['Segmented'] });
const segmented = entry({ name: 'Segmented', not: [{ when: 'panels', use: 'Tabs', because: 'it is a tablist.' }], neighbours: ['Tabs'] });

describe('the choosing gate', () => {
  it('passes on the repository as it stands', async () => {
    const reg = await load();
    const problems = validate({
      families: Object.keys(reg.FAMILIES),
      entries: reg.entries,
      screens: reg.screens,
      exports: packageExports(rd('packages/ui/src/index.ts')),
      classes: stylesheetClasses(rd('design/styles.css')),
      rows: indexRows(rd('design/readme.md')),
      exists: (p: string) => existsSync(join(ROOT, p)),
      missingWhen: dirsWithoutWhen(),
    });
    expect(problems).toEqual([]);
  });

  it('finds the generated files current', async () => {
    const reg = await load();
    const rendered = renderAll(reg, rd('skills/gener8v-design-system/SKILL.md'));
    const read = (p: string) => (existsSync(join(ROOT, p)) ? rd(p) : null);
    expect(stale(rendered, read)).toEqual([]);
  });

  it('a valid pair passes', () => {
    expect(world([tabs, segmented])).toEqual([]);
  });

  it('fails on an exported component nobody claims', () => {
    const problems = world([tabs, segmented], {
      exports: { components: ['Tabs', 'Segmented', 'Tooltip'], other: [] },
    });
    expect(problems.join('\n')).toMatch(/exports Tooltip, and no when\.ts claims it/);
  });

  it('fails on a component directory with no when.ts', () => {
    expect(world([tabs, segmented], { missingWhen: ['Tooltip'] }).join('\n')).toMatch(/Tooltip\/ has no when\.ts/);
  });

  it('fails on a class family in the index nobody claims', () => {
    const problems = world([tabs, segmented], { rows: [['.tabs'], ['.tooltip', '.tooltip-arrow']] });
    expect(problems.join('\n')).toMatch(/components\.md lists \.tooltip/);
    expect(problems.join('\n')).not.toMatch(/lists \.tabs/);
  });

  it('fails on a "not when" that names a component that does not exist', () => {
    const broken = { ...tabs, not: [{ when: 'views', use: 'SegmentedControl', because: 'x.' }] };
    expect(world([broken, segmented]).join('\n')).toMatch(/"not" names SegmentedControl/);
  });

  it('fails on a neighbour that does not exist', () => {
    const broken = { ...tabs, neighbours: ['Segmented', 'TabStrip'] };
    expect(world([broken, segmented]).join('\n')).toMatch(/"neighbours" names TabStrip/);
  });

  it('fails on an entry that points at itself', () => {
    const broken = { ...tabs, not: [{ when: 'x', use: 'Tabs', because: 'y.' }] };
    expect(world([broken, segmented]).join('\n')).toMatch(/points at itself/);
  });

  it('fails on an entry with no "not when"', () => {
    expect(world([{ ...tabs, not: [] }, segmented]).join('\n')).toMatch(/"not" is empty/);
  });

  it('fails on a family it does not know', () => {
    expect(world([{ ...tabs, family: 'widgets' }, segmented]).join('\n')).toMatch(/family "widgets"/);
  });

  it('fails on a class the stylesheet does not have, and on a class claimed twice', () => {
    const problems = world([{ ...tabs, css: ['.tabs', '.tab-strip'] }, { ...segmented, css: ['.tabs'] }], {
      classes: new Set(['.tabs']),
    });
    expect(problems.join('\n')).toMatch(/class \.tab-strip is not in styles\.css/);
    expect(problems.join('\n')).toMatch(/class root \.tabs is also claimed by Tabs/);
  });

  it('fails on a React name the package does not export', () => {
    const problems = world([{ ...tabs, react: ['Tabs', 'TabPanel'] }, segmented], {
      exports: { components: ['Tabs', 'Segmented'], other: [] },
    });
    expect(problems.join('\n')).toMatch(/React export TabPanel is not exported/);
  });

  it('fails on a screen whose template or component is missing', () => {
    const problems = world([tabs, segmented], {
      screens: [{ screen: 'a page', template: 'templates/nowhere/', implies: ['Tabs', 'Shell'], note: '' }],
      exists: (p: string) => !p.includes('nowhere'),
    });
    expect(problems.join('\n')).toMatch(/template design\/templates\/nowhere\/ does not exist/);
    expect(problems.join('\n')).toMatch(/implies Shell/);
  });

  it('reports a generated file that differs, and a stray one', () => {
    const rendered = { 'a.md': 'new', 'b.md': 'same' };
    const disk: Record<string, string> = { 'a.md': 'old', 'b.md': 'same', 'c.md': 'stray' };
    expect(stale(rendered, (p: string) => disk[p] ?? null, Object.keys(disk))).toEqual([
      'a.md', 'c.md (not generated by anything — remove it)',
    ]);
  });

  it('gives a class to the entry with the longest root', () => {
    const table = entry({ name: 'Table', css: ['.table'] });
    const pager = entry({ name: 'TablePager', css: ['.table-pager'] });
    expect(ownerOf('.table-pager-range', [table, pager])?.name).toBe('TablePager');
    expect(ownerOf('.table-wrap', [table, pager])?.name).toBe('Table');
    expect(ownerOf('.tablet', [table, pager])).toBeNull();
  });

  it('keeps everything outside the router markers in SKILL.md', async () => {
    const reg = await load();
    const skill = `before\n${MARK_START}\nold router\n${MARK_END}\nafter\n`;
    const out = renderAll(reg, skill)['skills/gener8v-design-system/SKILL.md'];
    expect(out.startsWith('before\n')).toBe(true);
    expect(out.endsWith('\nafter\n')).toBe(true);
    expect(out).not.toMatch(/old router/);
    expect(out).toMatch(/What are you building\?/);
  });
});
