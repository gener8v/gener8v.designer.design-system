#!/usr/bin/env node
/**
 * Fixed-version release: all four packages move together.
 *
 * They are one system — a component change usually touches tokens, the
 * stylesheet and the React layer at once. Independent semver would mean four
 * version numbers to reason about for a change that is conceptually one thing,
 * and a consumer working out which @gener8v/ui pairs with which @gener8v/tokens.
 *
 *   pnpm release 0.2.0        bump, verify, publish, tag
 *   pnpm release 0.2.0 --dry  everything except publishing and tagging
 */
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';

const PACKAGES = ['tokens', 'tailwind-preset', 'icons', 'ui'];  // dependency order
const version = process.argv[2];
const dry = process.argv.includes('--dry');

if (!/^\d+\.\d+\.\d+(-[\w.]+)?$/.test(version ?? '')) {
  console.error('Usage: pnpm release <version> [--dry]   e.g. pnpm release 0.2.0');
  process.exit(1);
}

const run = (cmd, args, opts = {}) =>
  execFileSync(cmd, args, { stdio: 'inherit', ...opts });

// Never ship a release that cannot pass its own gates.
console.log(`\n▸ verifying`);
run('pnpm', ['check']);

// A dirty tree means the tag would not describe what was published.
const dirty = execFileSync('git', ['status', '--porcelain']).toString().trim();
if (dirty && !dry) {
  console.error(`\n✗ working tree is dirty — commit first, or the tag will not match what ships:\n${dirty}`);
  process.exit(1);
}

console.log(`\n▸ setting all packages to ${version}`);
for (const name of PACKAGES) {
  const file = `packages/${name}/package.json`;
  const pkg = JSON.parse(readFileSync(file, 'utf8'));
  pkg.version = version;
  writeFileSync(file, JSON.stringify(pkg, null, 2) + '\n');
  console.log(`  @gener8v/${name} → ${version}`);
}

console.log(`\n▸ publishing${dry ? ' (dry run)' : ''}`);
for (const name of PACKAGES) {
  run('npm', ['publish', ...(dry ? ['--dry-run'] : []), '--access', 'restricted'],
      { cwd: `packages/${name}` });
}

if (dry) {
  run('git', ['checkout', '--', ...PACKAGES.map((n) => `packages/${n}/package.json`)]);
  console.log('\n✓ dry run complete — versions reverted, nothing published');
  process.exit(0);
}

run('git', ['add', ...PACKAGES.map((n) => `packages/${n}/package.json`)]);
run('git', ['commit', '-m', `Release ${version}`]);
run('git', ['tag', `v${version}`]);
console.log(`\n✓ released ${version} — push with: git push origin main --tags`);
