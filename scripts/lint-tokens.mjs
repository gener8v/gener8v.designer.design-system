#!/usr/bin/env node
// Structural checks that keep the bundle and the stylesheet from drifting apart.
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const D = 'design';
const css = readFileSync(join(D, 'styles.css'), 'utf8');
const adherence = JSON.parse(readFileSync(join(D, '_adherence.oxlintrc.json'), 'utf8'));
const readme = readFileSync(join(D, 'readme.md'), 'utf8');
const fails = [];
const fail = (m) => fails.push(m);

/* A — token round-trip -------------------------------------------------- */
// Only :root declarations are design tokens. Component-scoped custom
// properties (--btn-h and friends) are implementation detail, not vocabulary.
const rootBlock = css.match(/:root\s*\{([\s\S]*?)\n\}/)?.[1] ?? '';
const declared = new Set([...rootBlock.matchAll(/(--[a-z0-9-]+):/g)].map((m) => m[1]));
const registered = new Set(adherence['x-omelette'].tokens);
for (const t of registered) if (!declared.has(t)) fail(`registered but not in styles.css: ${t}`);
for (const t of declared) if (!registered.has(t)) fail(`in styles.css but not registered: ${t}`);

/* A2 — every var() reference must resolve --------------------------------- */
// A property declared anywhere in the sheet (component-scoped, like --btn-h)
// resolves fine. A property that is NOT declared is only legal if the reference
// supplies a fallback — that is the signal it is meant to be set by the caller,
// e.g. style="--progress: 62". Anything else is a typo waiting to render wrong.
const anywhere = new Set([...css.matchAll(/(--[a-z0-9-]+)\s*:/g)].map((m) => m[1]));
for (const m of css.matchAll(/var\((--[a-z0-9-]+)\s*(,?)/g)) {
  const [, name, hasFallback] = m;
  if (anywhere.has(name) || hasFallback) continue;
  fail(`styles.css references undeclared ${name} with no fallback`);
}

/* B — component pages must not carry raw values ------------------------- */
// foundations/ is exempt: documenting raw values is its whole job.
const compDir = join(D, 'components');
if (existsSync(compDir)) {
  for (const f of readdirSync(compDir).filter((f) => f.endsWith('.html'))) {
    const src = readFileSync(join(compDir, f), 'utf8');
    const body = src.replace(/<style>[\s\S]*?<\/style>/g, ''); // scaffolding is exempt
    for (const m of body.matchAll(/style="([^"]*)"/g)) {
      if (/#[0-9a-fA-F]{3,8}\b/.test(m[1])) fail(`${f}: raw hex in inline style — ${m[1].slice(0, 60)}`);
      if (/\b\d+(\.\d+)?px\b/.test(m[1])) fail(`${f}: raw px in inline style — ${m[1].slice(0, 60)}`);
    }
    if (!/^<!--\s*@dsCard\s+group="[^"]+"\s+name="[^"]+"\s+subtitle="[^"]+"\s+viewport="\d+x\d+"\s*-->/.test(src))
      fail(`${f}: missing or malformed @dsCard marker on line 1`);
  }
}

/* B2 — the adaptive layer must cover state-by-colour components ---------- */
// Several stylesheets may each carry a forced-colors block; the requirement is
// that the union covers the state-by-colour components, not that one block does.
const joinAll = (re) => [...css.matchAll(re)].map((m) => m[1]).join('\n') || undefined;
const forced = joinAll(/@media \(forced-colors: active\)\s*\{([\s\S]*?)\n\}\n/g);
const print = joinAll(/@media print\s*\{([\s\S]*?)\n\}\n/g);
if (!forced) fail('no @media (forced-colors: active) block — state carried by fill alone will vanish');
if (!print) fail('no @media print block — printed deliverables will carry screen chrome');
if (forced) {
  // Each of these conveys state only through background colour.
  for (const sel of ['.btn-primary', '.tag', '.progress-bar', '.checkbox:checked',
                     '.switch:checked', '[aria-current]', ':focus-visible']) {
    if (!forced.includes(sel)) fail(`forced-colors block does not handle ${sel}`);
  }
}
if (print) {
  for (const sel of ['.nav', '.toast-region', 'thead']) {
    if (!print.includes(sel)) fail(`print block does not handle ${sel}`);
  }
}

/* C — every class the readme promises must actually exist ---------------- */
const promised = [...readme.matchAll(/`(\.[a-z][a-z0-9-]*)`/g)].map((m) => m[1]);
for (const cls of [...new Set(promised)]) {
  if (!new RegExp(`\\${cls}[\\s,:.{>~+\\[]`).test(css)) fail(`readme names ${cls} but styles.css has no such selector`);
}

/* D — every foundations/components page must declare a card -------------- */
for (const dir of ['foundations', 'components']) {
  if (!existsSync(join(D, dir))) continue;
  for (const f of readdirSync(join(D, dir)).filter((f) => f.endsWith('.html'))) {
    const first = readFileSync(join(D, dir, f), 'utf8').split('\n')[0];
    if (!first.includes('@dsCard')) fail(`${dir}/${f}: no @dsCard marker`);
  }
}

if (fails.length) { console.error('✗ token lint\n' + fails.map((f) => '  · ' + f).join('\n')); process.exit(1); }
console.log(`✓ token lint — ${declared.size} tokens round-trip, component pages clean, readme accurate`);
