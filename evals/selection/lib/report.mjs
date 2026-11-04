// Aggregation and the markdown report.

/** Mean and spread of one number per repetition. */
export function stats(xs) {
  if (!xs.length) return { mean: 0, min: 0, max: 0, sd: 0, n: 0 };
  const mean = xs.reduce((a, b) => a + b, 0) / xs.length;
  const sd = Math.sqrt(xs.reduce((a, b) => a + (b - mean) ** 2, 0) / xs.length);
  return { mean, min: Math.min(...xs), max: Math.max(...xs), sd, n: xs.length };
}

const avg = (xs) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0);

/** Pass rate and mean recall over a subset of runs, once per repetition, then summarised. */
function slice(runs) {
  const reps = [...new Set(runs.map((r) => r.rep))].sort((a, b) => a - b);
  const perRep = reps.map((rep) => runs.filter((r) => r.rep === rep));
  return {
    cases: new Set(runs.map((r) => r.case)).size,
    runs: runs.length,
    passRate: stats(perRep.map((rs) => avg(rs.map((r) => (r.pass ? 1 : 0))))),
    recall: stats(perRep.map((rs) => avg(rs.map((r) => r.recall)))),
    forbidRate: stats(perRep.map((rs) => avg(rs.map((r) => (r.forbidHits.length ? 1 : 0))))),
  };
}

const count = (xs) => Object.entries(xs.reduce((m, x) => ((m[x] = (m[x] ?? 0) + 1), m), {})).sort((a, b) => b[1] - a[1]).map(([k, n]) => ({ name: k, n }));

export function aggregate(meta, cases, runs) {
  const byCase = cases.filter((c) => runs.some((r) => r.case === c.id)).map((c) => {
    const rs = runs.filter((r) => r.case === c.id);
    return {
      id: c.id, family: c.family, groups: c.groups ?? [], template: c.template ?? null,
      runs: rs.length,
      passRate: avg(rs.map((r) => (r.pass ? 1 : 0))),
      recall: avg(rs.map((r) => r.recall)),
      missing: count(rs.flatMap((r) => r.missing)),
      forbidHits: count(rs.flatMap((r) => r.forbidHits)),
      templateMatch: c.template ? avg(rs.map((r) => (r.templateMatch ? 1 : 0))) : null,
      templatesSeen: count(rs.flatMap((r) => r.templatesSeen)),
      picked: count(rs.flatMap((r) => [...r.used, ...(r.usedViaClass ?? []).map((n) => `${n} (class)`)])),
      skillFired: avg(rs.map((r) => (r.skillFired ? 1 : 0))),
      errors: rs.filter((r) => r.error).map((r) => r.error),
    };
  });
  const families = [...new Set(cases.map((c) => c.family))];
  const groups = [...new Set(cases.flatMap((c) => c.groups ?? []))].sort();
  const totalUsd = runs.reduce((a, r) => a + r.costUsd, 0);
  return {
    meta,
    overall: slice(runs),
    byFamily: Object.fromEntries(families.map((f) => [f, slice(runs.filter((r) => r.family === f))]).filter(([, s]) => s.runs)),
    byGroup: Object.fromEntries(groups.map((g) => [g, slice(runs.filter((r) => r.groups.includes(g)))]).filter(([, s]) => s.runs)),
    templates: (() => { const t = runs.filter((r) => r.templateMatch !== null); return { runs: t.length, matchRate: avg(t.map((r) => (r.templateMatch ? 1 : 0))) }; })(),
    skillFiredRate: avg(runs.map((r) => (r.skillFired ? 1 : 0))),
    reactImportRate: avg(runs.map((r) => (r.importsReact ? 1 : 0))),
    docsRead: (() => {
      const areas = Object.keys(runs[0]?.docsRead ?? {});
      return Object.fromEntries(areas.map((a) => {
        const read = runs.filter((r) => r.docsRead?.[a]);
        const unread = runs.filter((r) => !r.docsRead?.[a]);
        return [a, { rate: avg(runs.map((r) => (r.docsRead?.[a] ? 1 : 0))), passWhenRead: read.length ? avg(read.map((r) => (r.pass ? 1 : 0))) : null, passWhenNot: unread.length ? avg(unread.map((r) => (r.pass ? 1 : 0))) : null }];
      }));
    })(),
    cost: {
      totalUsd,
      perRunUsd: runs.length ? totalUsd / runs.length : 0,
      perFullPassUsd: meta.repeat ? totalUsd / meta.repeat : totalUsd,
      meanRunSeconds: avg(runs.map((r) => r.durationMs)) / 1000,
      wallClockSeconds: meta.wallClockMs == null ? null : meta.wallClockMs / 1000,
    },
    cases: byCase,
    runs,
  };
}

const pct = (x) => `${(x * 100).toFixed(0)}%`;
const spread = (s) => (s.n > 1 ? `${pct(s.mean)} (${pct(s.min)}–${pct(s.max)})` : pct(s.mean));
const names = (xs, k = 4) => xs.slice(0, k).map((x) => `${x.name}${x.n > 1 ? `×${x.n}` : ''}`).join(', ') || '—';

export function renderMarkdown(r) {
  const m = r.meta;
  const L = [];
  L.push(`# Component-selection eval — ${m.label}`, '');
  L.push(`- Date: ${m.date}`);
  L.push(`- Model: \`${m.model}\`${m.modelsReported.length ? ` (reported: ${m.modelsReported.map((x) => `\`${x}\``).join(', ')})` : ''}${m.dryRun ? ' — **dry run on recorded outputs, not a measurement**' : ''}`);
  L.push(`- Commit: \`${m.commit ?? 'unknown'}\``);
  L.push(`- ${m.cases} cases × ${m.repeat} repeat${m.repeat > 1 ? 's' : ''} = ${m.runs} runs`);
  if (m.rescoredFrom) L.push(`- Re-scored from saved runs (${m.rescoredFrom}); cost and time are those of the original runs`);
  L.push(`- Cost: $${r.cost.totalUsd.toFixed(2)} total, $${r.cost.perFullPassUsd.toFixed(2)} per full pass, $${r.cost.perRunUsd.toFixed(3)} per run; mean run ${r.cost.meanRunSeconds.toFixed(0)}s${r.cost.wallClockSeconds != null ? `, wall clock ${(r.cost.wallClockSeconds / 60).toFixed(1)} min at concurrency ${m.concurrency ?? '?'}` : ''}`, '');
  L.push('## Overall', '');
  L.push('Figures are the mean over repeats, with the lowest and highest repeat in brackets.', '');
  L.push('| Measure | Score |', '| --- | --- |');
  L.push(`| Pass rate | ${spread(r.overall.passRate)} |`);
  L.push(`| Recall of expected components | ${spread(r.overall.recall)} |`);
  L.push(`| Runs with a forbidden pick | ${spread(r.overall.forbidRate)} |`);
  L.push(`| Template match (screen cases) | ${r.templates.runs ? pct(r.templates.matchRate) : '—'} |`);
  L.push(`| Skill invoked | ${pct(r.skillFiredRate)} |`);
  L.push(`| Runs importing \`@gener8v/ui\` React components | ${pct(r.reactImportRate)} |`, '');
  L.push('A component counts whether it is imported from `@gener8v/ui` or written by hand as its classes. "(class)" in the tables marks the second.', '');
  if (Object.keys(r.docsRead).length) {
    L.push('## What the runs read', '', 'This is a diagnostic and is not part of the score. It shows which parts of the plugin each run opened or searched, and the pass rate with and without that read.', '');
    L.push('| Docs | Runs that read them | Pass when read | Pass when not |', '| --- | --- | --- | --- |');
    const p = (x) => (x == null ? '—' : pct(x));
    for (const [a, d] of Object.entries(r.docsRead)) L.push(`| ${a} | ${pct(d.rate)} | ${p(d.passWhenRead)} | ${p(d.passWhenNot)} |`);
    L.push('');
  }
  L.push('## By family', '', '| Family | Cases | Pass rate | Recall | Forbidden pick |', '| --- | --- | --- | --- | --- |');
  for (const [f, s] of Object.entries(r.byFamily)) L.push(`| ${f} | ${s.cases} | ${spread(s.passRate)} | ${spread(s.recall)} | ${spread(s.forbidRate)} |`);
  L.push('', '## By confusable group', '', 'A case can sit in more than one group.', '', '| Group | Cases | Pass rate | Recall | Forbidden pick |', '| --- | --- | --- | --- | --- |');
  for (const [g, s] of Object.entries(r.byGroup)) L.push(`| ${g} | ${s.cases} | ${spread(s.passRate)} | ${spread(s.recall)} | ${spread(s.forbidRate)} |`);
  const worst = [...r.cases].sort((a, b) => a.passRate - b.passRate || a.recall - b.recall).filter((c) => c.passRate < 1);
  L.push('', '## Failing cases, worst first', '');
  if (!worst.length) L.push('None.');
  else {
    L.push('| Case | Pass | Recall | Missing | Forbidden picked | Template | Picked instead (top) |', '| --- | --- | --- | --- | --- | --- | --- |');
    for (const c of worst) {
      const tpl = c.template ? `${pct(c.templateMatch)} want \`${c.template}\`, saw ${names(c.templatesSeen, 3)}` : '—';
      L.push(`| \`${c.id}\` | ${pct(c.passRate)} | ${c.recall.toFixed(2)} | ${names(c.missing)} | ${names(c.forbidHits)} | ${tpl} | ${names(c.picked, 8)} |`);
    }
  }
  L.push('', '## All cases', '', '| Case | Family | Pass | Recall | Skill | Picked |', '| --- | --- | --- | --- | --- | --- |');
  for (const c of r.cases) L.push(`| \`${c.id}\` | ${c.family} | ${pct(c.passRate)} | ${c.recall.toFixed(2)} | ${pct(c.skillFired)} | ${names(c.picked, 8)} |`);
  const errs = r.cases.filter((c) => c.errors.length);
  if (errs.length) { L.push('', '## Run errors', ''); for (const c of errs) L.push(`- \`${c.id}\`: ${c.errors.join('; ')}`); }
  L.push('');
  return L.join('\n');
}
