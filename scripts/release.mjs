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

// THE CREDENTIAL, BEFORE ANYTHING ELSE
//
// A dry run cannot catch a bad token: `npm publish --dry-run` never contacts the registry, so it
// reports a clean release for a credential that cannot write a byte. 0.2.0 found that out the
// expensive way — the dry run passed, the real run chose the version, ran the gates, and only then
// got `E404 PUT .../@gener8v%2ftokens` because the token in CI had no write on the scope.
//
// So this runs FIRST, in dry runs too, and costs a second. What it proves is identity: that the
// registry knows who this credential is. A token that authenticates but lacks write on the scope
// still only surfaces at publish — npm answers 404 rather than 403 for that, and there is no
// read-only way to ask.
console.log(`\n▸ checking the registry credential`);
try {
  const who = execFileSync('npm', ['whoami'], { stdio: ['ignore', 'pipe', 'pipe'] }).toString().trim();
  console.log(`  authenticated as ${who}`);
} catch {
  console.error(`\n✗ the registry does not know this credential — \`npm whoami\` failed.`
    + `\n  In CI: NPM_TOKEN is missing, expired, or malformed. Set it with \`gh secret set NPM_TOKEN\`.`
    + `\n  Locally: npm login --scope=@gener8v`
    + `\n\n  Nothing was bumped and nothing was published.`);
  process.exit(1);
}

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

// Everything past this line runs AFTER an irreversible publish, so nothing here
// may abort the run. It did once: 0.2.0 reached npm, the version commit failed
// on a runner with no git identity, and the tag never happened — so the registry
// said 0.2.0 while the repository said 0.1.0. A publish cannot be taken back,
// which makes the bookkeeping best-effort and LOUD: attempt every step, then say
// precisely what a human still has to do.
//
// Re-releasing a version already set in the manifests also produces no diff, and
// `git commit` exits non-zero on an empty commit. The tag is the part that has to
// happen either way, so it is downstream of neither the commit nor its failure.
const problems = [];
const attempt = (what, fn) => {
  try {
    fn();
  } catch (err) {
    problems.push(`${what} — ${String(err.message).split('\n')[0]}`);
  }
};

attempt('staging the manifests', () => run('git', ['add', ...manifests]));

let staged = '';
attempt('reading the staged manifests', () => {
  staged = execFileSync('git', ['diff', '--cached', '--name-only']).toString().trim();
});
if (staged) attempt('committing the version bump', () =>
  run('git', ['commit', '-m', `Release ${version}`]));
else console.log('  manifests already at this version — nothing to commit');

let existing = '';
attempt('listing tags', () => {
  existing = execFileSync('git', ['tag', '-l', `v${version}`]).toString().trim();
});
if (existing) console.log(`  tag v${version} already exists`);
else attempt('tagging the release', () =>
  run('git', ['tag', '-a', `v${version}`, '-m', `Release ${version}`]));

if (problems.length) {
  console.error(`\n✗ ${version} IS PUBLISHED — npm has it. The repository does not:`);
  for (const problem of problems) console.error(`    ${problem}`);
  console.error(`\n  Reconcile by hand, or the registry and this repository disagree:`);
  console.error(`    set packages/*/package.json to ${version}, commit, tag v${version},`);
  console.error(`    then: git push origin main --follow-tags`);
  process.exit(1);
}

console.log(`\n✓ released ${version} — push with: git push origin main --follow-tags`);
