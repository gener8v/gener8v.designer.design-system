#!/usr/bin/env node
// WCAG 2.2 contrast gate over the pairs the system actually renders.
import { contrast } from '../packages/tokens/src/color.mjs';
import tokens from '../packages/tokens/dist/tokens.mjs';

const t = (n) => tokens[n];
const WHITE = '#FFFFFF';

const pairs = [
  ['body text on ground',        t('--color-text'),          t('--color-bg'),           4.5],
  ['paragraph on ground',        t('--color-neutral-700'),   t('--color-bg'),           4.5],
  ['.muted / .label on ground',  t('--color-neutral-600'),   t('--color-bg'),           4.5],
  ['neutral-500 as chrome only', t('--color-neutral-500'),   t('--color-bg'),           3.0],
  ['body text on surface',       t('--color-text'),          t('--color-surface'),      4.5],
  ['link on ground',             t('--color-accent-700'),    t('--color-bg'),           4.5],
  ['primary button label',       WHITE,                      t('--color-action'),        4.5],
  ['primary hover label',        WHITE,                      t('--color-action-hover'),  4.5],
  ['destructive button label',   WHITE,                      t('--color-danger'),       4.5],
  ['secondary button label',     t('--color-neutral-800'),   t('--color-bg'),           4.5],
  ['ghost button label',         t('--color-neutral-700'),   t('--color-bg'),           4.5],
  ['subtle button label',        t('--color-accent-800'),    t('--color-accent-100'),   4.5],
  ['section band label',         WHITE,                      t('--color-section'),       4.5],
  ['accent as chrome',           t('--color-accent'),        t('--color-bg'),           3.0],
  ['focus ring on ground',       t('--color-accent'),        t('--color-bg'),           3.0],
  ['tag: accent',                t('--color-accent-700'),    t('--color-accent-100'),    4.5],
  ['tag: success',               t('--color-success-700'),   t('--color-success-100'),   4.5],
  ['tag: warning',               t('--color-warning-700'),   t('--color-warning-100'),   4.5],
  ['tag: danger',                t('--color-danger-700'),    t('--color-danger-100'),    4.5],
  ['tag: neutral',               t('--color-neutral-700'),   t('--color-neutral-100'),   4.5],
  // The code ground. Nothing checked this surface until it gained syntax colours, and the body
  // text on it was never gated either.
  ['code text on code ground',   t('--color-neutral-200'),   t('--color-neutral-900'),   4.5],
  ['code: comment',              t('--color-neutral-400'),   t('--color-neutral-900'),   4.5],
  ['code: string',               t('--color-success-300'),   t('--color-neutral-900'),   4.5],
  ['code: keyword',              t('--color-accent-300'),    t('--color-neutral-900'),   4.5],
  ['code: number',               t('--color-warning-300'),   t('--color-neutral-900'),   4.5],
  ['code: name',                 t('--color-accent-200'),    t('--color-neutral-900'),   4.5],
  ['code head label',            t('--color-neutral-400'),   t('--color-neutral-800'),   4.5],
  // A struck item is quieter, not unreadable — 500 is 3.17:1 and carries chrome, never text.
  ['checklist: done item',       t('--color-neutral-600'),   t('--color-bg'),            4.5],
  ['card border on ground',      t('--color-neutral-200'),   t('--color-bg'),            1.2],
  ['border on ground',           t('--color-neutral-300'),   t('--color-bg'),            1.5],
];

let bad = 0;
for (const [name, fg, bg, min] of pairs) {
  const r = contrast(fg, bg);
  const ok = r >= min;
  if (!ok) bad++;
  console.log(`${ok ? '✓' : '✗'} ${name.padEnd(26)} ${r.toFixed(2)}:1  (min ${min})  ${fg} on ${bg}`);
}
if (bad) { console.error(`\n✗ contrast — ${bad} pair(s) below target`); process.exit(1); }
console.log('\n✓ contrast — all pairs meet WCAG 2.2 targets');
