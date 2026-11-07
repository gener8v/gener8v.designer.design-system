#!/usr/bin/env node
// Generates design/foundations/*.html and design/thumbnail.html straight from
// the tokens, so a foundations page can never disagree with the stylesheet.

import { writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { contrast, STEPS } from './src/color.mjs';
import { docsScript, navData, docsAsset, overviewPage, getStartedPage, guidancePages } from './docs/site.mjs';
import { theme, TYPE_SCALE, SPACE_BASE, SPACE_EXTRA, CONTROL_H } from './src/theme.mjs';
import tokens from './dist/tokens.mjs';
import { load as loadChoosing, indexRows, ownerOf } from '../../scripts/choosing.mjs';
import { readIcons, renderPage as renderIconGrid } from '../../scripts/icons.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const write = (rel, body) => {
  mkdirSync(dirname(join(ROOT, rel)), { recursive: true });
  writeFileSync(join(ROOT, rel), body);
  console.log('  ✓', rel);
};

const SCAFFOLD = `
/* Demo scaffolding only — everything visual comes from ../styles.css. The specimen column
   (.demo, .demo-head, .note) is shared by every docs page and lives in assets/docs.js. */
.ramp { display: grid; grid-template-columns: repeat(9, 1fr); gap: 2px; margin-bottom: var(--space-2); }
.ramp div { forced-color-adjust: none; aspect-ratio: 1 / 1.35; border-radius: var(--radius-xs); display: flex; align-items: flex-end; justify-content: center; padding-bottom: 4px; font-family: var(--font-mono); font-size: 9px; }
.roles { display: grid; grid-template-columns: repeat(3, 1fr); gap: var(--space-3); }
.role { border: 1px solid var(--color-divider); border-radius: var(--radius-sm); overflow: hidden; }
.role .chip { height: 56px; forced-color-adjust: none; }
.role .meta { padding: var(--space-2); font-family: var(--font-mono); font-size: 10px; line-height: 1.5; }
.kv { display: grid; grid-template-columns: 8ch 1fr; gap: var(--space-2) var(--space-4); font-family: var(--font-mono); font-size: var(--text-xs); align-items: center; }
`;




const page = (name, card, body, extraCss = '') => `<!-- @dsCard group="${card.group}" name="${card.name}" subtitle="${card.subtitle}" viewport="${card.viewport}" -->
<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${theme.name} — ${card.name}</title>
<link rel="stylesheet" href="../styles.css" />
${docsScript('../')}
<style>${SCAFFOLD}${extraCss}</style>
</head>
<body>
<main class="demo">
${body}
</main>
</body>
</html>
`;

const t = (n) => tokens[n];
const rampRow = (prefix) => `<div class="ramp">${STEPS.map((s) => {
  const hex = t(`--color-${prefix}-${s}`);
  const fg = contrast(hex, '#FFFFFF') >= 3 ? '#fff' : t('--color-neutral-900');
  return `<div style="background:${hex};color:${fg}">${s}</div>`;
}).join('')}</div>`;

/* ------------------------------------------------------------------ colour */

const roles = [
  ['--color-bg', 'Page ground'], ['--color-surface', 'Raised surface'], ['--color-text', 'Body ink'],
  ['--color-accent', 'Action'], ['--color-accent-2', 'Secondary accent'], ['--color-divider', 'Hairline'],
];
write('design/foundations/color.html', page('color', {
  group: 'Foundations', name: 'Color',
  subtitle: 'Six roles, two working ramps, and status held to five steps — generated in OKLCH',
  viewport: '640x820',
}, `
  <p class="demo-head label">Roles</p>
  <div class="roles">${roles.map(([k, d]) => `<div class="role">
      <div class="chip" style="background:${t(k)};${k === '--color-bg' || k === '--color-divider' ? 'box-shadow:inset 0 0 0 1px var(--color-divider)' : ''}"></div>
      <div class="meta">${k}<br><span class="muted">${t(k)}</span><br><span class="muted">${d}</span></div>
    </div>`).join('')}</div>

  <p class="demo-head label">Neutral — the workhorse. Near-white at 100, cool ink at 900</p>${rampRow('neutral')}
  <p class="demo-head label">Accent — the only colour that carries an action</p>${rampRow('accent')}

  <p class="demo-head label">Reserved</p>
  <div class="kv" style="grid-template-columns:14ch 1fr">
    <span>accent-2</span>
    <span style="display:flex;align-items:center;gap:var(--space-2)">
      ${[300, 500, 700].map((s) => `<span style="width:var(--space-6);height:var(--space-6);border-radius:var(--radius-xs);background:${t(`--color-accent-2-${s}`)}"></span>`).join('')}
      <span class="muted">data series only — never a second button colour</span></span>
    ${['success', 'warning', 'danger'].map((k) => `<span>${k}</span>
      <span style="display:flex;align-items:center;gap:var(--space-2)">
        ${[100, 300, 600, 700, 800].map((s) => `<span style="width:var(--space-6);height:var(--space-6);border-radius:var(--radius-xs);background:${t(s === 600 ? `--color-${k}` : `--color-${k}-${s}`)}"></span>`).join('')}
        <span class="muted">tint · border · base · hover · pressed</span></span>`).join('')}
  </div>

  <p class="demo-head label">Contrast on the page ground</p>
  <div class="kv">
    ${['--color-text', '--color-neutral-700', '--color-neutral-500', '--color-accent', '--color-accent-700', '--color-danger']
      .map((k) => {
        const r = contrast(t(k), t('--color-bg'));
        return `<span>${r.toFixed(2)}:1</span><span class="muted">${k} — ${r >= 4.5 ? 'body text' : r >= 3 ? 'large text and chrome only' : 'decorative only'}</span>`;
      }).join('')}
  </div>

  <p class="note">Chroma stays low outside the accent. Neutral chroma rises toward the dark end, so
  shadows read cool and highlights stay near-white — the greys are tinted, never flat. Prefer a ramp
  step over an ad-hoc <code>color-mix()</code>.</p>
`));

/* -------------------------------------------------------------------- type */

write('design/foundations/type.html', page('type', {
  group: 'Foundations', name: 'Typography',
  subtitle: 'Inter at 500 for headings over Inter for body, with IBM Plex Mono as the technical voice',
  viewport: '640x900',
}, `
  <p class="demo-head label">Scale</p>
  ${Object.entries(TYPE_SCALE).reverse().map(([k, [size, lh, tr]]) => `
  <div style="display:flex;align-items:baseline;gap:var(--space-4);flex-wrap:wrap;margin-bottom:var(--space-3);border-bottom:1px solid var(--color-divider);padding-bottom:var(--space-3)">
    <span class="label" style="flex:none;width:6ch">${k}</span>
    <span style="flex:1 1 auto;min-inline-size:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-family:var(--font-heading);font-weight:var(--font-heading-weight);font-size:${size};line-height:${lh};letter-spacing:${tr};color:var(--color-neutral-900)">Regulated AI</span>
    <span class="muted num" style="flex:none;margin-left:auto;font-family:var(--font-mono);font-size:10px">${size} / ${lh}</span>
  </div>`).join('')}

  <p class="demo-head label">Pairing</p>
  <h3>Clarity before automation</h3>
  <p style="margin-top:var(--space-3)">We build AI for environments that must be auditable. Body copy is
  Inter at 16px on a 1.65 line height — long measures stay readable because the leading is generous,
  not because the type is large.</p>

  <p class="demo-head label">The technical voice</p>
  <p class="label">01 / Capability</p>
  <p class="num" style="font-family:var(--font-mono);font-size:var(--text-2xl);color:var(--color-neutral-900);margin-top:var(--space-2)">$3,000,000</p>
  <p class="note">IBM Plex Mono carries section markers, figures and technical labels — never body copy.
  Figures use <code>.num</code> for tabular alignment. Headings never go past weight
  ${theme.fonts.headingWeight}; hierarchy is size and space, and that restraint is the whole reason
  this system reads as airy.</p>
`));

/* ------------------------------------------------------------------ layout */

const spaceAll = Object.entries({ ...SPACE_BASE, ...SPACE_EXTRA }).sort((a, b) => +a[0] - +b[0]);
write('design/foundations/layout.html', page('layout', {
  group: 'Foundations', name: 'Spacing & elevation',
  subtitle: `A 4px spacing scale, ${theme.radius}px radius, and three soft elevation steps tuned for a light ground`,
  viewport: '640x820',
}, `
  <p class="demo-head label">Space — 4px base × ${theme.density} density</p>
  <div class="kv" style="grid-template-columns:10ch 1fr">
    ${spaceAll.map(([k]) => `<span>--space-${k}</span>
      <span style="display:flex;align-items:center;gap:var(--space-3)">
        <span style="display:block;height:12px;width:${t(`--space-${k}`)};background:var(--color-accent-300);border-radius:2px"></span>
        <span class="muted">${t(`--space-${k}`)}</span></span>`).join('')}
  </div>

  <p class="demo-head label">Control heights — buttons, inputs and selects share these</p>
  <div class="kv" style="grid-template-columns:16ch 1fr">
    ${Object.keys(CONTROL_H).map((k) => `<span>--control-h-${k}</span>
      <span style="display:flex;align-items:center;gap:var(--space-3)">
        <span style="display:block;width:var(--space-16);height:${t(`--control-h-${k}`)};background:var(--color-neutral-200);border-radius:var(--radius-sm)"></span>
        <span class="muted">${t(`--control-h-${k}`)}</span></span>`).join('')}
  </div>

  <p class="demo-head label">Radius</p>
  <div class="row">
    ${['xs', 'sm', 'md', 'lg'].map((k) => `<span style="display:grid;place-items:center;width:var(--space-16);height:var(--space-16);background:var(--color-accent-100);border:1px solid var(--color-accent-300);border-radius:var(--radius-${k});font-family:var(--font-mono);font-size:10px;color:var(--color-accent-800)">${t(`--radius-${k}`)}</span>`).join('')}
  </div>

  <p class="demo-head label">Elevation — soft, low alpha, large blur</p>
  <div class="row" style="gap:var(--space-4)">
    ${['sm', 'md', 'lg'].map((k) => `<span style="display:grid;place-items:center;width:var(--space-24);height:var(--space-16);background:var(--color-bg);border-radius:var(--radius-md);box-shadow:var(--shadow-${k});font-family:var(--font-mono);font-size:10px">${k}</span>`).join('')}
  </div>

  <p class="demo-head label">Section rhythm</p>
  <div class="kv" style="grid-template-columns:16ch 1fr">
    <span>.section</span><span class="muted">${t('--space-20')} block padding — the default</span>
    <span>.section-tight</span><span class="muted">${t('--space-12')}</span>
    <span>.section-loose</span><span class="muted">${t('--space-24')}</span>
    <span>.container</span><span class="muted">max ${t('--container-xl')}, ${t('--space-6')} inline padding</span>
  </div>

  <p class="note">Whitespace is the primary design element here. Reach for a larger space step before
  reaching for a divider — <code>.hr</code> exists but this system prefers air.</p>
`));

/* ------------------------------------------------------------------- icons */

// The set comes from the icon files themselves (scripts/icons.mjs reads them), so this page
// shows every icon @gener8v/icons exports and cannot fall behind the package.
const ICON_SET = readIcons();
const svg = (name, size = 20) => `<svg width="${size}" height="${size}" viewBox="0 0 256 256" fill="currentColor" aria-hidden="true"><path d="${ICON_SET.find((i) => i.name === name).path}"/></svg>`;

const ICON_CSS = `
.icon-blurb { margin: 0 0 var(--space-3); color: var(--color-neutral-600); font-size: var(--text-sm); }
.icon-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(136px, 1fr)); gap: var(--space-2); margin-bottom: var(--space-5); }
.icon-cell { display: grid; justify-items: center; gap: var(--space-2); padding: var(--space-3) var(--space-2); border: 1px solid var(--color-divider); border-radius: var(--radius-sm); color: var(--color-neutral-700); }
.icon-cell code { font-family: var(--font-mono); font-size: 11px; color: var(--color-neutral-600); background: none; padding: 0; overflow-wrap: anywhere; text-align: center; }
`;

write('design/foundations/icons.html', page('icons', {
  group: 'Foundations', name: 'Icons',
  subtitle: 'Every icon in @gener8v/icons by group, inline SVG on currentColor, sized in em so they track the type',
  viewport: '640x560',
}, `
${renderIconGrid(ICON_SET)}

  <p class="demo-head label">Interface sizes</p>
  <div class="row" style="gap:var(--space-5);color:var(--color-neutral-700);align-items:flex-end">
    ${[16, 20, 24, 32].map((s) => `<span style="display:grid;gap:var(--space-2);justify-items:center">${svg('MagnifyingGlass', s)}<span class="label">${s}</span></span>`).join('')}
  </div>

  <p class="demo-head label">Inline and in buttons</p>
  <p>Icons inherit <code>currentColor</code> and sit on the text baseline
    <span style="display:inline-flex;vertical-align:-0.15em">${svg('ArrowRight', 16)}</span>
    so they never need their own colour token.</p>
  <div class="row" style="margin-top:var(--space-4)">
    <button type="button" class="btn btn-primary">Continue${svg('ArrowRight', 16)}</button>
    <button type="button" class="btn btn-secondary btn-icon" aria-label="Search">${svg('MagnifyingGlass')}</button>
    <button type="button" class="btn btn-ghost btn-icon" aria-label="More">${svg('DotsThree')}</button>
  </div>

  <p class="note">Phosphor at <strong>regular</strong> weight. Inside <code>.btn</code> icons are sized
  in <code>em</code> (1.15em), so they scale with the button rather than needing a size per variant.
  Icon-only controls always carry an <code>aria-label</code>.</p>
`, ICON_CSS));

/* ----------------------------------------------------------------- imagery */

write('design/foundations/image.html', page('image', {
  group: 'Foundations', name: 'Imagery',
  subtitle: 'Figures sit on the ground with a hairline and a radius; atmosphere comes from dot grid and grain',
  viewport: '640x620',
}, `
  <p class="demo-head label">Figure treatment</p>
  <figure style="margin:0">
    <div style="border:1px solid var(--color-divider);border-radius:var(--radius-md);overflow:hidden;background:var(--color-surface);padding:var(--space-8);display:grid;place-items:center">
      <img src="../assets/logo.png" alt="GENER8V" style="height:var(--space-24);width:auto" />
    </div>
    <figcaption class="label" style="margin-top:var(--space-3)">Figure 01 — the mark on a surface panel</figcaption>
  </figure>

  <p class="demo-head label">Atmosphere</p>
  <div class="row" style="gap:var(--space-3);align-items:stretch">
    <div class="bg-dot-grid" style="flex:1;height:var(--space-24);border:1px solid var(--color-divider);border-radius:var(--radius-md)"></div>
    <div class="section-band" style="flex:1;height:var(--space-24);border-radius:var(--radius-md);display:grid;place-items:center">
      <span class="label">Section band</span>
    </div>
  </div>

  <p class="note">This is a light system: images sit <em>on</em> the ground rather than blending into it.
  Give every figure a hairline border and <code>--radius-md</code>. The dot grid and the grain overlay
  supply atmosphere on otherwise empty ground; the saturated band is the one place the accent floods,
  and it is used once per page at most.</p>
`));

/* --------------------------------------------------------------- thumbnail */

write('design/thumbnail.html', `<!doctype html>
<html lang="en"><head><meta charset="utf-8" /><title>${theme.name}</title>
<link rel="stylesheet" href="styles.css" />
<style>
body { display: grid; place-items: center; min-height: 100svh; }
.cover { width: 100%; max-width: 520px; padding: var(--space-10); }
.sw { display: grid; grid-template-columns: repeat(6, 1fr); gap: 4px; margin-top: var(--space-8); }
.sw div { aspect-ratio: 1; border-radius: var(--radius-xs); }
</style></head>
<body class="bg-dot-grid">
<div class="cover">
  <h1>${theme.name}</h1>
  <p class="lede" style="margin-top:var(--space-4)">AI delivered in regulated, governed and auditable environments.</p>
  <div class="sw">
    ${['--color-neutral-900', '--color-neutral-600', '--color-neutral-300', '--color-neutral-100', '--color-accent-700', '--color-accent']
      .map((k) => `<div style="background:${t(k)}"></div>`).join('')}
  </div>
</div>
</body></html>
`);

/* ------------------------------------------------------------------- index */
// The front door. Cards are read from each page's own @dsCard marker, so this
// page cannot claim a component exists that does not, or describe it wrongly.

import { readdirSync, readFileSync as read } from 'node:fs';

const cardOf = (rel) => {
  const first = read(join(ROOT, 'design', rel), 'utf8').split('\n')[0];
  const attr = (k) => first.match(new RegExp(`${k}="([^"]*)"`))?.[1] ?? '';
  return first.includes('@dsCard')
    ? { path: rel, name: attr('name'), subtitle: attr('subtitle'), group: attr('group') }
    : null;
};

const collect = (dir) => {
  let files = [];
  try { files = readdirSync(join(ROOT, 'design', dir)).filter((f) => f.endsWith('.html')); } catch { return []; }
  return files.map((f) => cardOf(`${dir}/${f}`)).filter(Boolean);
};

const TEMPLATES = [
  { path: 'templates/intake/index.html', name: 'Engagement intake',
    subtitle: 'The flow shell as a working four-step journey, with the vertical rail and a persistent footer' },
  { path: 'templates/purchase/index.html', name: 'Purchase a product',
    subtitle: 'Four-step buy flow — basket with quantity steppers, delivery radio cards, sticky order summary' },
  { path: 'templates/work-item-create/index.html', name: 'Create a work item',
    subtitle: 'Describe, label and attach — token input, segmented type, combobox owner, evidence drop' },
  { path: 'templates/work-item-close/index.html', name: 'Close a work item',
    subtitle: 'Acceptance checklist, resolution outcome, evidence, activity thread and an irreversible confirm' },
  { path: 'templates/app-shell/index.html', name: 'Application shell',
    subtitle: 'Header, rail, breadcrumbs, stat row and a data panel — the layout every client app starts from' },
  { path: 'templates/landing/index.html', name: 'Landing page',
    subtitle: 'Hero, the one saturated stat band, feature cards and a close — the marketing voice' },
  { path: 'templates/deck/index.html', name: 'Presentation deck',
    subtitle: 'Eight 16:9 slides sized in container units, so one deck reads the same in a grid or projected' },
];

const foundations = collect('foundations');
const components = collect('components');

// The documentation site: nav data + the shared chrome script, Overview, Get started, Guidance.
const { FAMILIES: DOC_FAMILIES, entries: docEntries, screens: docScreens } = await loadChoosing();
const nav = navData({ foundations, components, templates: TEMPLATES, FAMILIES: DOC_FAMILIES });
write('design/assets/docs.js', docsAsset(nav));
write('design/index.html', overviewPage({ nav, themeName: theme.name }));
write('design/get-started.html', getStartedPage({ themeName: theme.name }));
const guidance = guidancePages({ FAMILIES: DOC_FAMILIES, entries: docEntries, screens: docScreens, themeName: theme.name });
for (const [rel, body] of Object.entries(guidance)) write(rel, body);


/* -------------------------------------------------- responsive check harness */
// Chrome will not size a window below ~500px, so a true mobile viewport has to
// be measured inside an iframe. The page list is generated, never hand-kept.

const allPages = [
  'index.html',
  'get-started.html',
  ...Object.keys(guidance).map((p) => p.replace(/^design\//, '')),
  ...components.map((c) => c.path),
  ...foundations.map((c) => c.path),
  ...TEMPLATES.map((c) => c.path),
];

write('design/_responsive.html', `<!doctype html><html><head><meta charset="utf-8">
<title>Responsive check</title>
<style>body{font:13px ui-monospace,monospace;margin:16px}iframe{width:390px;height:700px;border:1px solid #ccc}</style>
</head><body><div id="out">measuring…</div><div id="frames"></div>
<script>
const PAGES = ${JSON.stringify(allPages)};
window.RESULTS = [];
(async () => {
  for (const p of PAGES) {
    const f = document.createElement('iframe');
    f.src = '/' + p; document.getElementById('frames').appendChild(f);
    await new Promise(r => { f.onload = r; });
    const d = f.contentDocument.documentElement;
    const offenders = [...f.contentDocument.querySelectorAll('body *')]
      .filter(e => { const r = e.getBoundingClientRect();
        return r.width > 0 && r.right > d.clientWidth + 1
          && getComputedStyle(e.parentElement || e).overflowX !== 'auto'; })
      .slice(0, 4).map(e => e.tagName.toLowerCase() + '.' + (e.className||'').toString().split(' ')[0]
        + '@' + e.getBoundingClientRect().right.toFixed(0));
    window.RESULTS.push({ page: p, vw: d.clientWidth, scrollW: d.scrollWidth,
      overflow: d.scrollWidth > d.clientWidth + 1, offenders });
    f.remove();
  }
  document.getElementById('out').textContent = 'done — ' + window.RESULTS.filter(r=>r.overflow).length + ' failing';
})();
</script></body></html>
`);

/* --------------------------------------------- skill component reference */
// Extracted from readme.md's class table so the skill's index cannot claim a
// component the stylesheet does not have.

const readme = read(join(ROOT, 'design', 'readme.md'), 'utf8');
const tableRows = [...readme.matchAll(/^\| (`[^|]+`) \| ([^|]+) \| ([^|]+) \|$/gm)]
  .filter((m) => !m[1].includes('Class'));

// The React column comes from the `when.ts` beside each component: the entry that owns each class
// on the row (longest class root wins), and its exports. `pnpm lint:choosing` fails on a row with
// no owner, so a blank cell here means a CSS-only part, not a gap.
const { entries: choosing } = await loadChoosing();
const reactFor = (row) => {
  const names = [];
  for (const cls of indexRows(row[0])[0] ?? []) {
    const e = ownerOf(cls, choosing);
    for (const r of e?.react ?? []) if (!names.includes(r)) names.push(r);
  }
  return names.length ? names.map((n) => `\`${n}\``).join(', ') : '—';
};

write('skills/gener8v-design-system/references/components.md',
`# Component index

Generated from \`design/readme.md\`. Every class here exists in \`styles.css\` and is
producible by \`@gener8v/ui\` — both facts are gated by \`pnpm check\`.

Prefer these over inventing a parallel class. If you need something that is not here,
add it to the system, not to the consuming app.

Which one to use for a job, and which not to: \`choosing/<family>.md\`, routed from SKILL.md.

| Class | React | What it is | Shown in |
| --- | --- | --- | --- |
${tableRows.map((m) => `| ${m[1]} | ${reactFor(m)} | ${m[2].trim()} | ${m[3].trim()} |`).join('\n')}

## Tokens

${Object.keys(tokens).length} tokens. The vocabulary:

| Group | Names |
| --- | --- |
| Colour roles | \`--color-bg\` \`--color-surface\` \`--color-text\` \`--color-accent\` \`--color-accent-2\` \`--color-divider\` |
| Action | \`--color-action\` \`--color-action-hover\` \`--color-action-active\` |
| Ramps | \`--color-{neutral,accent,accent-2}-{100…900}\` |
| Status | \`--color-{success,warning,danger}\` + \`-{100,300,700,800}\` — **reserved** |
| Chart series | \`--series-1\` … \`--series-8\` — fixed order, never cycled |
| Section band | \`--color-section\` \`--color-section-glow\` \`--color-section-ghost\` |
| Type | \`--font-heading\` \`--font-heading-weight\` \`--font-body\` \`--font-mono\` \`--text-*\` \`--leading-*\` \`--tracking-*\` |
| Space | \`--space-{1,2,3,4,5,6,8,10,12,16,20,24,32}\` — the name is the multiple of 4px |
| Controls | \`--control-h-{xs,sm,md,lg,xl}\` — buttons, inputs and selects share these |
| Radius | \`--radius-{xs,sm,md,lg,full}\` |
| Elevation | \`--shadow-{sm,md,lg}\` |
| Motion | \`--ease-out\` \`--ease-in-out\` \`--dur-{fast,base,slow}\` |
| Layout | \`--container-{sm,md,lg,xl,2xl}\` |
| Focus | \`--ring-width\` \`--ring-offset\` \`--ring-color\` |
`);
