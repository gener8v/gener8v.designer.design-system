#!/usr/bin/env node
// The icon catalogue, read from the icon files themselves. Each file is the single source: its
// name, its Phosphor source, what it is for and its @group live in the file's doc comment.
//   - packages/icons/README.md: this script writes the tables between the icons:start /
//     icons:end markers. Run with --write to update; without it, it fails if they are stale.
//   - design/foundations/icons.html: packages/tokens/build-pages.mjs renders the grid with
//     renderPage() when it builds the foundations pages.
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SRC = join(ROOT, 'packages/icons/src');
const README = join(ROOT, 'packages/icons/README.md');

/** Display order and headings. An icon whose @group is not here fails the build. */
export const GROUPS = [
  ['Actions', 'Actions', 'Things a person does to what is on the screen.'],
  ['Navigation', 'Navigation', 'Moving between surfaces, and opening what is folded away.'],
  ['Status', 'Status', 'The state of something, readable at a glance.'],
  ['Records', 'Records', 'The things a record holds.'],
  ['Communication', 'Communication', 'What people said, and the channel it came through.'],
  ['People', 'People and agents', 'Who did the work. An agent is never drawn as a person.'],
  ['Access', 'Access', 'Signing in, and what is private.'],
  ['Grounds', 'Grounds', 'The three grounds an observation can rest on: said, observed, inferred.'],
  ['Governance', 'Governance', 'Whether a rule is in force, and what has moved underneath it.'],
];

export function readIcons(src = SRC) {
  return readdirSync(src)
    .filter((f) => f.endsWith('.tsx'))
    .map((f) => {
      const body = readFileSync(join(src, f), 'utf8');
      const name = f.replace('.tsx', '');
      const comment = body.slice(body.indexOf('/**') + 3, body.indexOf('*/'));
      const lines = comment.split('\n').map((l) => l.replace(/^\s*\*\s?/, '').trim());
      const phosphor = /Phosphor `([\w-]+)`/.exec(lines[0])?.[1];
      const group = /@group (\w+)/.exec(comment)?.[1];
      const purpose = lines.slice(1).filter((l) => l && !l.startsWith('@')).join(' ');
      const path = /<path d="([^"]+)"/.exec(body)?.[1];
      if (!phosphor || !group || !purpose || !path) {
        throw new Error(`${f}: needs a Phosphor name, a purpose, an @group and one <path>`);
      }
      if (!GROUPS.some(([key]) => key === group)) throw new Error(`${f}: unknown @group ${group}`);
      return { name, phosphor, group, purpose, path };
    })
    .sort((a, b) => a.name.localeCompare(b.name));
}

const grouped = (icons) =>
  GROUPS.map(([key, title, blurb]) => ({ title, blurb, icons: icons.filter((i) => i.group === key) }));

export function renderReadme(icons) {
  const out = [`${icons.length} icons in ${GROUPS.length} groups.`];
  for (const { title, blurb, icons: set } of grouped(icons)) {
    out.push('', `### ${title}`, '', blurb, '', '| Icon | Phosphor source | Use it for |', '|---|---|---|');
    for (const i of set) out.push(`| \`${i.name}\` | \`${i.phosphor}\` | ${i.purpose} |`);
  }
  return out.join('\n');
}

const esc = (s) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

export function renderPage(icons) {
  const out = [];
  for (const { title, blurb, icons: set } of grouped(icons)) {
    out.push(`  <p class="demo-head label">${esc(title)} · ${set.length}</p>`);
    out.push(`  <p class="icon-blurb">${esc(blurb)}</p>`);
    out.push('  <div class="icon-grid">');
    for (const i of set) {
      out.push(`    <div class="icon-cell" title="${esc(i.purpose.replace(/`/g, ''))}"><svg width="24" height="24" viewBox="0 0 256 256" fill="currentColor" aria-hidden="true"><path d="${i.path}"/></svg><code>${i.name}</code></div>`);
    }
    out.push('  </div>');
  }
  return out.join('\n');
}

const START = '<!-- icons:start -->';
const END = '<!-- icons:end -->';

export function splice(doc, body, file) {
  const a = doc.indexOf(START);
  const b = doc.indexOf(END);
  if (a < 0 || b < a) throw new Error(`${file}: missing ${START} / ${END} markers`);
  return `${doc.slice(0, a + START.length)}\n${body}\n${doc.slice(b)}`;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const write = process.argv.includes('--write');
  const icons = readIcons();
  const doc = readFileSync(README, 'utf8');
  const next = splice(doc, renderReadme(icons), README);
  if (next !== doc && !write) {
    console.error('packages/icons/README.md is out of date — run pnpm build:icons');
    process.exit(1);
  }
  if (next !== doc) writeFileSync(README, next);
  console.log(`${icons.length} icons ${write ? 'written' : 'up to date'}`);
}
