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

/* DARK MODE CANNOT INVENT A TOKEN.
 *
 * The dark block overrides VALUES. It must never introduce a name `:root` does not declare,
 * because a component reading that name in light mode would get nothing at all — and the failure
 * would appear only for readers who never switch themes, which is most of them.
 *
 * This is exactly the drift a generated system is supposed to make impossible, so it is checked
 * rather than assumed.
 */
{
  const { darkTokens } = await import('../packages/tokens/dist/tokens.mjs');
  const unknown = Object.keys(darkTokens).filter((n) => !declared.has(n));
  if (unknown.length) fail(`dark mode overrides names :root never declares: ${unknown.join(', ')}`);
  // And the OVERRIDES have to reach both states. "System" stamps no attribute, so
  // `prefers-color-scheme` is the only thing separating light from dark there, and an explicit
  // choice has to win over it.
  //
  // Counted on the ground colour rather than on the selectors: `base.css` sets `color-scheme` on
  // the same selectors for its own reasons, so their mere presence proves nothing about whether
  // the TOKENS are overridden. A first version of this check passed while the attribute selector
  // was misspelled, for exactly that reason.
  const ground = `--color-bg: ${darkTokens['--color-bg']};`;
  const blocks = {
    'prefers-color-scheme (the "system" default)':
      /@media \(prefers-color-scheme: dark\)\s*\{\s*:root:not\(\[data-theme="light"\]\)\s*\{([\s\S]*?)\n  \}/.exec(css),
    '[data-theme="dark"] (an explicit choice)':
      /\n:root\[data-theme="dark"\]\s*\{([\s\S]*?)\n\}/.exec(css),
  };
  for (const [state, m] of Object.entries(blocks)) {
    if (!m) fail(`dark mode has no override block for ${state}`);
    else if (!m[1].includes(ground)) fail(`the ${state} block does not set the dark ground`);
  }
}

/* A PANEL THAT IS DARK IN BOTH MODES NEEDS A FOREGROUND THAT IS TOO.
 *
 * `--color-inverse` exists because a code block, a tooltip and a chart readout are dark on a light
 * page ON PURPOSE. Their text has to come from `--color-on-inverse` for the same reason: a ramp
 * step MIRRORS in dark mode, so `color: var(--color-neutral-100)` on an inverse panel is near-white
 * on white paper and near-black on black — and a tooltip renders as an empty box.
 *
 * That shipped. Three of the four inverse panels had it, and it was invisible in light mode.
 */
{
  const rules = [...css.matchAll(/([^{}]+)\{([^}]*background:\s*[^;]*--color-inverse[^;]*;[^}]*)\}/g)];
  for (const [, selector, body] of rules) {
    const colour = /(?:^|[;\s])color:\s*([^;]+);/.exec(body);
    if (!colour) continue;
    if (!colour[1].includes('--color-on-inverse')) {
      const where = selector.replace(/\/\*[\s\S]*?\*\//g, '').trim();
      fail(`${where} sits on --color-inverse but takes its text from `
        + `${colour[1].trim()} — a ramp step mirrors in dark mode and this panel does not`);
    }
  }
}

if (fails.length) { console.error('✗ token lint\n' + fails.map((f) => '  · ' + f).join('\n')); process.exit(1); }
console.log(`✓ token lint — ${declared.size} tokens round-trip, component pages clean, readme accurate`);
