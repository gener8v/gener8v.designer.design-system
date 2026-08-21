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
