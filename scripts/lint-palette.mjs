#!/usr/bin/env node
// Gates the chart series palette against the data-viz checks. The palette was
// derived by running this validator; without it in CI, a later token edit could
// quietly break colour-blind separation and nothing would say so.
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import tokens from '../packages/tokens/dist/tokens.json' with { type: 'json' };

const HERE = dirname(fileURLToPath(import.meta.url));
const validator = join(HERE, 'vendor', 'validate_palette.js');

const light = Array.from({ length: 8 }, (_, i) => tokens[`--series-${i + 1}`]);
if (light.some((v) => !v)) { console.error('✗ palette — --series-1..8 not all defined'); process.exit(1); }

const runs = [
  ['categorical, light', [light.join(','), '--mode', 'light', '--surface', tokens['--color-bg']]],
  // Scatter/bubble/map forms compare every pair, not just neighbours. Only the
  // first three slots clear the floors — that cap is a documented rule, so it
  // is gated rather than remembered.
  ['all-pairs cap of 3', [light.slice(0, 3).join(','), '--mode', 'light', '--surface', tokens['--color-bg'], '--pairs', 'all']],
  ['sequential accent ramp', [[400, 500, 600, 700, 800].map((s) => tokens[`--color-accent-${s}`]).join(','),
    '--ordinal', '--mode', 'light', '--surface', tokens['--color-bg']]],
];

let bad = 0;
for (const [name, args] of runs) {
  try {
    execFileSync('node', [validator, ...args], { stdio: 'pipe' });
    console.log(`  ✓ ${name}`);
  } catch (e) {
    bad++;
    console.error(`  ✗ ${name}\n${e.stdout?.toString() ?? ''}`);
  }
}

// A fourth slot must still fail all-pairs — if it ever passes, the documented
// cap is stale and the docs are lying.
try {
  execFileSync('node', [validator, light.slice(0, 4).join(','), '--mode', 'light',
    '--surface', tokens['--color-bg'], '--pairs', 'all'], { stdio: 'pipe' });
  console.error('  ✗ the documented all-pairs cap of 3 is stale — 4 slots now pass');
  bad++;
} catch { console.log('  ✓ all-pairs cap of 3 still correct (4 slots fail, as documented)'); }

if (bad) { console.error(`\n✗ palette — ${bad} check(s) failed`); process.exit(1); }
console.log('✓ palette — series palette validates for CVD separation, contrast and lightness band');
