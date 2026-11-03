#!/usr/bin/env node
/**
 * Runs from inside a consuming package, so `@gener8v/ui` resolves through the
 * real `exports` map and the real `files` allowlist — not by relative path
 * into `packages/`, which is what a monorepo test does and why one would pass
 * even with a broken entry point.
 *
 * This has to EXECUTE. `vite build` bundles without evaluating, so an assertion
 * living in the bundled source never runs and the check silently passes.
 */
import * as ui from '@gener8v/ui';
import * as icons from '@gener8v/icons';
import tokens from '@gener8v/tokens';

const missing = [];
const check = (pkg, mod) => {
  const names = Object.keys(mod);
  if (names.length === 0) missing.push(`${pkg} exports nothing`);
  for (const name of names) if (mod[name] === undefined) missing.push(`${pkg} → ${name} is undefined`);
  return names.length;
};

const uiCount = check('@gener8v/ui', ui);
const iconCount = check('@gener8v/icons', icons);

for (const t of ['--color-action', '--control-h-md', '--series-1', '--space-6', '--radius-md']) {
  if (!tokens[t]) missing.push(`@gener8v/tokens → ${t} missing`);
}

// A handful of load-bearing entry points named explicitly, so removing one from
// the index is caught even though the loop above only sees what is exported.
for (const name of ['Button', 'Flow', 'Dialog', 'BarChart', 'KnowledgeGraph', 'Combobox',
                    'Credential', 'useStepValidation', 'useToast', 'cx']) {
  if (ui[name] === undefined) missing.push(`@gener8v/ui → ${name} is not exported`);
}

if (missing.length) {
  console.error(`✗ consumer — package entry points are incomplete:\n  ${missing.join('\n  ')}`);
  process.exit(1);
}
console.log(`✓ consumer — ${uiCount} ui + ${iconCount} icon exports resolve through the exports map; `
  + `${Object.keys(tokens).length} tokens readable`);

// A Tailwind v4 consumer whose source merely contains the word "contents" must not get Tailwind's
// `display: contents` utility, which would strip the box from the Contents component. The preset
// blocks it with `@source not inline("contents")`; the component also keeps its own box.
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const twBin = new URL('./node_modules/@tailwindcss/cli/dist/index.mjs', import.meta.url).pathname;
const compiled = execFileSync(process.execPath, [twBin, '-i', 'src/tailwind-entry.css'], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
if (/display:\s*contents/.test(compiled)) {
  console.error('✗ consumer — Tailwind generated `display: contents` for a source holding the word "contents"; the preset must block it');
  process.exit(1);
}
const uiCss = readFileSync(require.resolve('@gener8v/ui/styles.css'), 'utf8');
if (!/nav\.contents,\s*\.contents-nav\s*\{\s*display:\s*block/.test(uiCss)) {
  console.error('✗ consumer — styles.css does not keep the Contents component’s box (nav.contents, .contents-nav { display: block })');
  process.exit(1);
}
console.log('✓ consumer — Tailwind does not generate display: contents for the preset’s consumers, and Contents keeps its box');
