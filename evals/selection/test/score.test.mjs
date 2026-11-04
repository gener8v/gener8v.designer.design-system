// The scorer and the case files, checked without a model. Run: pnpm eval:selection:test
import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { extract, scoreRun, uses } from '../lib/score.mjs';
import { loadCases } from '../run.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, '../../..');
const file = (content, path = 'src/App.tsx') => ({ path, content });

test('a component counts only when imported from @gener8v/ui and referenced', () => {
  const u = extract([file(`import { Tabs, Tab, Dialog } from '@gener8v/ui';\nexport const A = () => <Tabs><Tab>x</Tab></Tabs>;`)]);
  assert.ok(uses(u, 'Tabs'));
  assert.ok(!uses(u, 'Dialog'), 'imported but unused');
  const local = extract([file(`function Tabs() { return null }\nexport const A = () => <Tabs />;`)]);
  assert.ok(!uses(local, 'Tabs'), 'a hand-rolled Tabs is not the system one');
});

test('aliases, classes, packages, native elements and title attributes', () => {
  const u = extract([file(`import { Menu as M } from '@gener8v/ui';\nimport { LineChart } from 'recharts';\nexport const A = () => <div className="segmented x"><M /><select title="t" /></div>;`)]);
  assert.ok(uses(u, 'Menu'));
  assert.ok(uses(u, 'Segmented'), 'root class counts for the component');
  assert.ok(uses(u, '.segmented'));
  assert.ok(uses(u, 'pkg:recharts'));
  assert.ok(!uses(u, 'LineChart'), 'a third-party LineChart is not the system one');
  assert.ok(uses(u, '<select>'));
  assert.ok(uses(u, 'attr:title'));
  const dlg = extract([file(`import { Dialog } from '@gener8v/ui';\nexport const A = () => <Dialog title="Delete" />;`)]);
  assert.ok(!uses(dlg, 'attr:title'), 'a component prop named title is not the native attribute');
});

test('comments do not count', () => {
  const u = extract([file(`import { Tabs } from '@gener8v/ui';\n// <Tabs> would be wrong here\n/* Tabs */\nexport const A = () => null;`)]);
  assert.ok(!uses(u, 'Tabs'));
});

test('scoreRun: recall, expect_any, forbid and template', () => {
  const kase = { id: 'x', family: 'screens', expect: ['Sidebar', 'Field'], expect_any: [['Stat', 'StatRow']], forbid: [{ component: 'Meter', reason: '' }], template: 'app-shell' };
  const files = [file(`import { Sidebar, StatRow, Meter } from '@gener8v/ui';\nexport const A = () => <><Sidebar /><StatRow /><Meter /></>;`)];
  const s = scoreRun(kase, { files, finalText: '', readPaths: ['/x/design/templates/app-shell/index.html'] });
  assert.equal(s.recall, 2 / 3);
  assert.deepEqual(s.missing, ['Field']);
  assert.deepEqual(s.forbidHits, ['Meter']);
  assert.equal(s.templateMatch, true);
  assert.equal(s.pass, false);
  const wrongTpl = scoreRun(kase, { files, finalText: 'Started from design/templates/intake', readPaths: [] });
  assert.equal(wrongTpl.templateMatch, false);
});

test('every case file is well formed and names real components', () => {
  const index = readFileSync(join(ROOT, 'packages/ui/src/index.ts'), 'utf8');
  const exported = new Set([...index.matchAll(/export\s*\{([\s\S]*?)\}/g)].flatMap((m) => m[1].split(',').map((s) => s.trim()).filter(Boolean)));
  const templates = new Set(readdirSync(join(ROOT, 'design/templates')));
  const cases = loadCases('*');
  assert.ok(cases.length >= 30, `${cases.length} cases`);
  const ids = new Set();
  for (const c of cases) {
    assert.ok(!ids.has(c.id), `duplicate ${c.id}`); ids.add(c.id);
    for (const t of [...(c.expect ?? []), ...(c.expect_any ?? []).flat(), ...(c.forbid ?? []).map((f) => f.component)]) {
      if (/^(\.|pkg:|attr:|<)/.test(t)) continue;
      assert.ok(exported.has(t), `${c.id}: ${t} is not exported by @gener8v/ui`);
    }
    for (const f of c.forbid ?? []) assert.ok(f.reason, `${c.id}: forbid ${f.component} has no reason`);
    if (c.template) assert.ok(templates.has(c.template), `${c.id}: no template ${c.template}`);
    for (const t of [...(c.expect ?? []), ...(c.expect_any ?? []).flat()]) {
      if (/^[A-Z]/.test(t) && t.length > 3) assert.ok(!new RegExp(`\\b${t}\\b`).test(c.prompt), `${c.id}: the prompt names ${t}`);
    }
  }
});

test('recorded outputs score as recorded', () => {
  const dir = join(HERE, '../recorded');
  const cases = Object.fromEntries(loadCases('*').map((c) => [c.id, c]));
  const recs = readdirSync(dir).filter((f) => f.endsWith('.json'));
  assert.ok(recs.length > 0);
  for (const f of recs) {
    const rec = JSON.parse(readFileSync(join(dir, f), 'utf8'));
    const s = scoreRun(cases[rec.case], rec);
    if (rec.expectedScore) {
      assert.equal(s.pass, rec.expectedScore.pass, `${f}: pass`);
      assert.deepEqual(s.forbidHits, rec.expectedScore.forbidHits, `${f}: forbid`);
      assert.deepEqual(s.missing, rec.expectedScore.missing, `${f}: missing`);
    }
  }
});
