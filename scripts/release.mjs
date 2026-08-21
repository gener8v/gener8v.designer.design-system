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

const manifests = PACKAGES.map((n) => `packages/${n}/package.json`);
const restore = () => run('git', ['checkout', '--', ...manifests], { stdio: 'ignore' });

console.log(`\n▸ setting all packages to ${version}`);
for (const name of PACKAGES) {
  const file = `packages/${name}/package.json`;
  // Patch the version line rather than round-tripping the JSON: re-serialising
  // rewrites unicode escapes and key order, producing a diff that has nothing
  // to do with the release.
  const src = readFileSync(file, 'utf8');
  const next = src.replace(/^(\s*"version":\s*")[^"]+(")/m, `$1${version}$2`);
  if (next === src && !src.includes(`"version": "${version}"`)) {
    console.error(`\n✗ could not find a version field in ${file}`);
    process.exit(1);
  }
  writeFileSync(file, next);
  console.log(`  @gener8v/${name} → ${version}`);
}

console.log(`\n▸ publishing${dry ? ' (dry run)' : ''}`);
try {
  for (const name of PACKAGES) {
    run('npm', ['publish', ...(dry ? ['--dry-run'] : []), '--access', 'restricted'],
        { cwd: `packages/${name}` });
  }
} catch (err) {
  // A half-published release must not leave bumped manifests behind, or the
  // next attempt starts from a version that partly exists.
  restore();
  console.error(`\n✗ publish failed — manifests restored. Packages already pushed`
    + ` in this run stay published; npm versions cannot be reused, so bump before retrying.`);
  process.exit(1);
}

if (dry) {
  restore();
  console.log('\n✓ dry run complete — versions reverted, nothing published');
  process.exit(0);
}

run('git', ['add', ...PACKAGES.map((n) => `packages/${n}/package.json`)]);
run('git', ['commit', '-m', `Release ${version}`]);
run('git', ['tag', `v${version}`]);
console.log(`\n✓ released ${version} — push with: git push origin main --tags`);
