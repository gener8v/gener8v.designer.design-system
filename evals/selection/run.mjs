#!/usr/bin/env node
// Component-selection eval: does Claude, with this repository's plugin loaded,
// pick the right components and starting template for a design task?
//
//   pnpm eval:selection [--cases <glob>] [--repeat N] [--label name] [--model id]
//                       [--concurrency N] [--max-turns N] [--record dir] [--keep]
//   pnpm eval:selection --from <dir>      re-score runs saved with --record, no model
//   pnpm eval:selection:dry               re-score the fixtures in recorded/, no model
//
// See evals/selection/README.md.
import { execFileSync } from 'node:child_process';
import { mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { runCase } from './lib/claude.mjs';
import { scoreRun } from './lib/score.mjs';
import { aggregate, renderMarkdown } from './lib/report.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, '../..');
export const FAMILIES = ['screens', 'status-and-feedback', 'navigation', 'data', 'input', 'reading', 'agents-and-live-work'];

function parseArgs(argv) {
  const o = {
    cases: '*', repeat: 1, label: null, model: 'sonnet', concurrency: 4, maxTurns: 40,
    timeoutMs: 15 * 60_000, dryRun: false, from: null, record: null, keep: false, out: join(HERE, 'results'),
  };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    const v = () => argv[++i];
    if (a === '--cases') o.cases = v();
    else if (a === '--repeat') o.repeat = Number(v());
    else if (a === '--label') o.label = v();
    else if (a === '--model') o.model = v();
    else if (a === '--concurrency' || a === '-j') o.concurrency = Number(v());
    else if (a === '--max-turns') o.maxTurns = Number(v());
    else if (a === '--timeout') o.timeoutMs = Number(v()) * 1000;
    else if (a === '--dry-run') o.dryRun = true;
    else if (a === '--from') o.from = resolve(v());
    else if (a === '--record') o.record = resolve(v());
    else if (a === '--keep') o.keep = true;
    else if (a === '--out') o.out = resolve(v());
    else if (a === '--help' || a === '-h') { console.log(readFileSync(fileURLToPath(import.meta.url), 'utf8').split('\n').slice(1, 8).join('\n')); process.exit(0); }
    else throw new Error(`Unknown argument: ${a}`);
  }
  if (!(o.repeat >= 1)) throw new Error('--repeat must be at least 1');
  if (o.dryRun) o.from ??= join(HERE, 'recorded');
  o.label ??= o.dryRun ? 'dry-run' : o.from ? 'rescored' : o.model;
  return o;
}

const globRe = (g) => new RegExp(`^${g.split(',').map((p) => p.trim().replace(/\.json$/, '').replace(/[.+^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*').replace(/\?/g, '.')).join('|')}$`);

export function loadCases(glob = '*') {
  const dir = join(HERE, 'cases');
  const re = globRe(glob);
  const cases = readdirSync(dir).filter((f) => f.endsWith('.json')).sort()
    .map((f) => JSON.parse(readFileSync(join(dir, f), 'utf8')))
    .filter((c) => re.test(c.id));
  for (const c of cases) {
    if (!FAMILIES.includes(c.family)) throw new Error(`${c.id}: unknown family ${c.family}`);
    if (!c.prompt) throw new Error(`${c.id}: no prompt`);
    if (!(c.expect?.length || c.expect_any?.length)) throw new Error(`${c.id}: nothing expected`);
  }
  return cases;
}

async function pool(jobs, n, fn) {
  const out = new Array(jobs.length);
  let next = 0;
  await Promise.all(Array.from({ length: Math.min(n, jobs.length) }, async () => {
    while (next < jobs.length) { const i = next++; out[i] = await fn(jobs[i], i); }
  }));
  return out;
}

async function main() {
  const o = parseArgs(process.argv.slice(2));
  const cases = loadCases(o.cases);
  if (!cases.length) throw new Error(`No case matches ${o.cases}`);
  const jobs = [];
  let fromMeta = null;
  if (o.from) {
    // Saved runs stand in for the model: re-score them under the current scorer
    // and cases, without credentials or cost. Files are <case>.json or <case>.<rep>.json.
    try { fromMeta = JSON.parse(readFileSync(join(o.from, '_meta.json'), 'utf8')); } catch { /* fixtures have none */ }
    const files = readdirSync(o.from).filter((f) => f.endsWith('.json') && f !== '_meta.json');
    for (const kase of cases) {
      for (const f of files) {
        if (f === `${kase.id}.json`) jobs.push({ kase, rep: 0, file: join(o.from, f) });
        else if (f.startsWith(`${kase.id}.`)) {
          const rep = Number(f.slice(kase.id.length + 1, -'.json'.length));
          if (Number.isInteger(rep)) jobs.push({ kase, rep, file: join(o.from, f) });
        }
      }
    }
    o.repeat = Math.max(1, ...jobs.map((j) => j.rep + 1));
  } else {
    for (let r = 0; r < o.repeat; r++) for (const kase of cases) jobs.push({ kase, rep: r });
  }
  const started = Date.now();
  console.error(`${o.from ? `Re-scoring ${o.from}` : `Model ${o.model}`}: ${cases.length} cases, ${jobs.length} runs`);

  const runs = await pool(jobs, o.from ? 1 : o.concurrency, async ({ kase, rep, file }) => {
    let run;
    if (file) {
      run = JSON.parse(readFileSync(file, 'utf8'));
    } else {
      run = await runCase({ kase, model: o.model, pluginRoot: ROOT, fixtureDir: join(HERE, 'fixture/consumer'), maxTurns: o.maxTurns, timeoutMs: o.timeoutMs, keep: o.keep });
      if (o.record) {
        mkdirSync(o.record, { recursive: true });
        const { files, finalText, readPaths, skillFired, models, costUsd, durationMs, turns, tools, error } = run;
        const saved = { case: kase.id, rep, models, costUsd, durationMs, turns, tools, error, skillFired, readPaths, finalText, files };
        writeFileSync(join(o.record, `${kase.id}.${rep}.json`), JSON.stringify(saved, null, 2) + '\n');
      }
    }
    const score = scoreRun(kase, run);
    const line = `${score.pass ? 'PASS' : 'FAIL'} ${kase.id}#${rep} recall=${score.recall.toFixed(2)}${score.forbidHits.length ? ` forbid=${score.forbidHits.join(',')}` : ''}${score.missing.length ? ` missing=${score.missing.join(',')}` : ''}${run.error ? ` error=${run.error}` : ''}${run.costUsd ? ` $${run.costUsd.toFixed(3)}` : ''}`;
    console.error(line);
    return {
      case: kase.id, family: kase.family, groups: kase.groups ?? [], rep, ...score,
      costUsd: run.costUsd ?? 0, durationMs: run.durationMs ?? 0, turns: run.turns ?? 0,
      models: run.models ?? [], tools: run.tools ?? {}, error: run.error ?? null,
      finalText: (run.finalText ?? '').slice(0, 1200),
    };
  });

  const done = runs.filter(Boolean);
  if (o.from && done.length === 0) throw new Error(`No saved runs in ${o.from} match these cases`);
  const meta = {
    label: o.label,
    date: new Date().toISOString(),
    model: fromMeta?.model ?? (o.from ? 'recorded' : o.model),
    modelsReported: [...new Set(done.flatMap((r) => r.models))],
    dryRun: o.dryRun,
    rescoredFrom: o.from && !o.dryRun ? fromMeta?.label ?? o.from : null,
    repeat: o.repeat,
    cases: [...new Set(done.map((r) => r.case))].length,
    runs: done.length,
    commit: fromMeta?.commit ?? (() => { try { return execFileSync('git', ['rev-parse', 'HEAD'], { cwd: ROOT, encoding: 'utf8' }).trim(); } catch { return null; } })(),
    wallClockMs: o.from ? fromMeta?.wallClockMs ?? null : Date.now() - started,
    maxTurns: fromMeta?.maxTurns ?? o.maxTurns,
    concurrency: o.from ? fromMeta?.concurrency ?? null : o.concurrency,
  };
  if (o.record && !o.from) {
    const saved = { label: o.label, model: o.model, repeat: o.repeat, maxTurns: o.maxTurns, concurrency: o.concurrency, wallClockMs: meta.wallClockMs, commit: meta.commit, date: meta.date };
    writeFileSync(join(o.record, '_meta.json'), JSON.stringify(saved, null, 2) + '\n');
  }
  const result = aggregate(meta, cases, done);
  mkdirSync(o.out, { recursive: true });
  const stem = join(o.out, `${meta.date.slice(0, 10)}-${o.label.replace(/[^\w.-]+/g, '_')}`);
  writeFileSync(`${stem}.json`, JSON.stringify(result, null, 2) + '\n');
  writeFileSync(`${stem}.md`, renderMarkdown(result));
  console.error(`\nPass rate ${(result.overall.passRate.mean * 100).toFixed(1)}% (spread ${(result.overall.passRate.min * 100).toFixed(1)}–${(result.overall.passRate.max * 100).toFixed(1)}), recall ${result.overall.recall.mean.toFixed(3)}, cost $${result.cost.totalUsd.toFixed(2)}`);
  console.error(`Wrote ${stem}.json and ${stem}.md`);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((e) => { console.error(e.message); process.exit(1); });
}
