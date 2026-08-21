#!/usr/bin/env node
// Guards the architectural bet: every COMPONENT-layer class the static HTML
// uses must be producible by a React component. If the HTML gains a variant the
// library cannot emit, that is drift, and it fails here rather than in a client
// repo six months later.
//
// Base-layer utilities (.label, .row, .container …) are plain CSS anyone can
// use and need no component. Page-local scaffolding is ignored by definition.
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const fails = [];
const UI = 'packages/ui/src';
const COMPONENT_CSS = 'packages/tokens/src/components';

/** Class selectors defined in the component layer — these need a React counterpart. */
// A stylesheet may declare `@parity-exempt: <reason>` when its component is not
// DOM-rendered — a canvas painter emits no per-element classes. The reason
// lives beside the CSS so the exemption cannot become a silent escape hatch.
const componentClasses = new Set();
const exemptions = [];
for (const f of readdirSync(COMPONENT_CSS).filter((f) => f.endsWith('.css'))) {
  const css = readFileSync(join(COMPONENT_CSS, f), 'utf8');
  const exempt = /@parity-exempt:\s*([^*]+)/.exec(css);
  if (exempt) { exemptions.push(f); continue; }
  for (const m of css.matchAll(/\.([a-z][a-z0-9-]*)/g)) componentClasses.add(m[1]);
}

/** Classes a component file can emit: string literals plus `prefix-${union}`. */
function producible(file) {
  const src = readFileSync(file, 'utf8');
  const out = new Set();
  for (const m of src.matchAll(/'([a-z][a-z0-9-]*)'/g)) out.add(m[1]);
  // JSX attributes use double quotes: className="select-wrap"
  for (const m of src.matchAll(/className="([a-z0-9-\s]+)"/g))
    for (const cls of m[1].trim().split(/\s+/)) out.add(cls);
  for (const tm of src.matchAll(/`([a-z-]+)-\$\{(\w+)\}`/g)) {
    const [, prefix, varName] = tm;
    const typeName = varName.replace(/^(\w)/, (c) => c.toUpperCase());
    // the union is named e.g. TagVariant, not Variant — allow a prefix
    const union = src.match(new RegExp(`export type \\w*${typeName}\\s*=([\\s\\S]*?);`));
    if (!union) { fails.push(`${file}: cannot resolve union for \${${varName}}`); continue; }
    for (const v of union[1].matchAll(/'([a-z]+)'/g)) out.add(`${prefix}-${v[1]}`);
  }
  return out;
}

// Every .tsx in a component directory, not just <dir>/<dir>.tsx — a family
// like Chart legitimately splits across BarChart, LineChart and Sparkline.
const emitted = new Set();
for (const dir of readdirSync(UI, { withFileTypes: true }).filter((d) => d.isDirectory())) {
  const here = join(UI, dir.name);
  for (const f of readdirSync(here).filter((f) => f.endsWith('.tsx'))) {
    for (const c of producible(join(here, f))) emitted.add(c);
  }
}

let checked = 0;
for (const f of readdirSync('design/components').filter((f) => f.endsWith('.html'))) {
  const src = readFileSync(join('design/components', f), 'utf8');
  // Classes the page defines for itself are scaffolding, whatever they are named.
  const local = new Set();
  for (const block of src.matchAll(/<style>([\s\S]*?)<\/style>/g))
    for (const m of block[1].matchAll(/\.([a-z][a-z0-9-]*)/g)) local.add(m[1]);

  const body = src.replace(/<style>[\s\S]*?<\/style>/g, '');
  for (const m of body.matchAll(/class="([^"]+)"/g)) {
    for (const cls of m[1].split(/\s+/)) {
      if (local.has(cls) || !componentClasses.has(cls)) continue;
      checked++;
      if (!emitted.has(cls)) fails.push(`${f}: "${cls}" is used in HTML but no React component emits it`);
    }
  }
}

const unique = [...new Set(fails)];
if (unique.length) { console.error('✗ parity\n' + unique.map((f) => '  · ' + f).join('\n')); process.exit(1); }
console.log(`✓ parity — ${checked} component-class uses in HTML, all producible by @gener8v/ui`
  + (exemptions.length ? ` (${exemptions.length} exempt: ${exemptions.join(', ')})` : ''));
