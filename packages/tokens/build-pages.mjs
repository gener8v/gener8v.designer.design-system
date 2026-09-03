#!/usr/bin/env node
// Generates design/foundations/*.html and design/thumbnail.html straight from
// the tokens, so a foundations page can never disagree with the stylesheet.

import { writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { contrast, STEPS } from './src/color.mjs';
import { THEME_BOOT, THEME_CONTROL, THEME_CSS } from '../../scripts/lab-theme.mjs';
import { theme, TYPE_SCALE, SPACE_BASE, SPACE_EXTRA, CONTROL_H } from './src/theme.mjs';
import tokens from './dist/tokens.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const write = (rel, body) => {
  mkdirSync(dirname(join(ROOT, rel)), { recursive: true });
  writeFileSync(join(ROOT, rel), body);
  console.log('  ✓', rel);
};

const SCAFFOLD = `
/* Demo scaffolding only — everything visual comes from ../styles.css. */
.demo { max-width: 620px; margin: 0 auto; padding: var(--space-8) var(--space-6) var(--space-16); }
.demo-head { margin: var(--space-10) 0 var(--space-4); }
.demo-head:first-child { margin-top: 0; }
.note { font-size: var(--text-sm); color: var(--color-neutral-600); max-width: 58ch; margin-top: var(--space-4); }
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
<style>${SCAFFOLD}${THEME_CSS}${extraCss}</style>
${THEME_BOOT}
</head>
<body>
${THEME_CONTROL}
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

const ICONS = {
  'arrow-right': 'M221.66,133.66l-72,72a8,8,0,0,1-11.32-11.32L196.69,136H40a8,8,0,0,1,0-16H196.69L138.34,61.66a8,8,0,0,1,11.32-11.32l72,72A8,8,0,0,1,221.66,133.66Z',
  plus: 'M224,128a8,8,0,0,1-8,8H136v80a8,8,0,0,1-16,0V136H40a8,8,0,0,1,0-16h80V40a8,8,0,0,1,16,0v80h80A8,8,0,0,1,224,128Z',
  check: 'M229.66,77.66l-128,128a8,8,0,0,1-11.32,0l-56-56a8,8,0,0,1,11.32-11.32L96,188.69,218.34,66.34a8,8,0,0,1,11.32,11.32Z',
  search: 'M229.66,218.34l-50.07-50.06a88.11,88.11,0,1,0-11.31,11.31l50.06,50.07a8,8,0,0,0,11.32-11.32ZM40,112a72,72,0,1,1,72,72A72.08,72.08,0,0,1,40,112Z',
  'dots-three': 'M156,128a28,28,0,1,1-28-28A28,28,0,0,1,156,128ZM48,100a28,28,0,1,0,28,28A28,28,0,0,0,48,100Zm160,0a28,28,0,1,0,28,28A28,28,0,0,0,208,100Z',
  download: 'M224,152v56a16,16,0,0,1-16,16H48a16,16,0,0,1-16-16V152a8,8,0,0,1,16,0v56H208V152a8,8,0,0,1,16,0Zm-101.66,5.66a8,8,0,0,0,11.32,0l40-40a8,8,0,0,0-11.32-11.32L136,132.69V40a8,8,0,0,0-16,0v92.69L93.66,106.34a8,8,0,0,0-11.32,11.32Z',
  trash: 'M216,48H176V40a24,24,0,0,0-24-24H104A24,24,0,0,0,80,40v8H40a8,8,0,0,0,0,16h8V208a16,16,0,0,0,16,16H192a16,16,0,0,0,16-16V64h8a8,8,0,0,0,0-16ZM96,40a8,8,0,0,1,8-8h48a8,8,0,0,1,8,8v8H96Zm96,168H64V64H192ZM112,104v64a8,8,0,0,1-16,0V104a8,8,0,0,1,16,0Zm48,0v64a8,8,0,0,1-16,0V104a8,8,0,0,1,16,0Z',
  warning: 'M236.8,188.09,149.35,36.22h0a24.76,24.76,0,0,0-42.7,0L19.2,188.09a23.51,23.51,0,0,0,0,23.72A24.35,24.35,0,0,0,40.55,224h174.9a24.35,24.35,0,0,0,21.33-12.19A23.51,23.51,0,0,0,236.8,188.09ZM120,104a8,8,0,0,1,16,0v40a8,8,0,0,1-16,0Zm8,88a12,12,0,1,1,12-12A12,12,0,0,1,128,192Z',
};
const svg = (n, size = 20) => `<svg width="${size}" height="${size}" viewBox="0 0 256 256" fill="currentColor"><path d="${ICONS[n]}"/></svg>`;

write('design/foundations/icons.html', page('icons', {
  group: 'Foundations', name: 'Icons',
  subtitle: 'Phosphor, inline SVG on currentColor, sized in em so they track the type',
  viewport: '640x560',
}, `
  <p class="demo-head label">The set at 24px</p>
  <div class="row" style="gap:var(--space-4);color:var(--color-neutral-700)">
    ${Object.keys(ICONS).map((n) => `<span title="${n}">${svg(n, 24)}</span>`).join('')}
  </div>

  <p class="demo-head label">Interface sizes</p>
  <div class="row" style="gap:var(--space-5);color:var(--color-neutral-700);align-items:flex-end">
    ${[16, 20, 24, 32].map((s) => `<span style="display:grid;gap:var(--space-2);justify-items:center">${svg('search', s)}<span class="label">${s}</span></span>`).join('')}
  </div>

  <p class="demo-head label">Inline and in buttons</p>
  <p>Icons inherit <code>currentColor</code> and sit on the text baseline
    <span style="display:inline-flex;vertical-align:-0.15em">${svg('arrow-right', 16)}</span>
    so they never need their own colour token.</p>
  <div class="row" style="margin-top:var(--space-4)">
    <button type="button" class="btn btn-primary">Continue${svg('arrow-right', 16)}</button>
    <button type="button" class="btn btn-secondary btn-icon" aria-label="Search">${svg('search')}</button>
    <button type="button" class="btn btn-ghost btn-icon" aria-label="More">${svg('dots-three')}</button>
  </div>

  <p class="note">Phosphor at <strong>regular</strong> weight. Inside <code>.btn</code> icons are sized
  in <code>em</code> (1.15em), so they scale with the button rather than needing a size per variant.
  Icon-only controls always carry an <code>aria-label</code>.</p>
`));

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

const cardGrid = (items) => `<div class="index-grid">${items.map((c) => `
  <a class="card card-interactive card-pad-sm" href="${c.path}">
    <p class="card-kicker mono">${c.path}</p>
    <p class="card-title" style="font-size:var(--text-lg)">${c.name}</p>
    <p class="card-body">${c.subtitle}</p>
  </a>`).join('')}</div>`;

const swatches = (prefix, steps) => steps.map((s) =>
  `<span class="index-chip" style="background:${t(`--color-${prefix}-${s}`)}" title="--color-${prefix}-${s}"></span>`).join('');

const foundations = collect('foundations');
const components = collect('components');

write('design/index.html', `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${theme.name} — Design system</title>
<link rel="stylesheet" href="styles.css" />
${THEME_BOOT}
<style>
${THEME_CSS}
/* Page scaffolding only — every component below comes from styles.css. */
.index-hero { border-block-end: 1px solid var(--color-neutral-200); }
.index-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: var(--space-4); }
.index-chip { forced-color-adjust: none; display: inline-block; inline-size: var(--space-6); block-size: var(--space-6); border-radius: var(--radius-xs); }
.index-row { display: flex; align-items: center; gap: var(--space-4); flex-wrap: wrap; }
.index-facts { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: var(--space-4); }
.index-fact { padding: var(--space-4); border: 1px solid var(--color-neutral-200); border-radius: var(--radius-lg); }
.index-fact-n { font-family: var(--font-mono); font-size: var(--text-2xl); color: var(--color-neutral-900); font-variant-numeric: tabular-nums; }
.index-sec { margin-block-start: var(--space-16); }
</style>
</head>
<body>

${THEME_CONTROL}
<header class="index-hero bg-dot-grid">
  <div class="container section-tight">
    <h1>${theme.name}</h1>
    <p class="lede" style="margin-block-start:var(--space-4);max-inline-size:60ch">
      A light, airy interface for delivering AI in regulated, governed and auditable
      environments. One stylesheet, one token source, and the same class names in the
      static HTML and in <code>@gener8v/ui</code>.
    </p>
    <div class="index-row" style="margin-block-start:var(--space-6)">
      <a class="btn btn-primary" href="foundations/color.html">Foundations<svg viewBox="0 0 256 256" fill="currentColor"><path d="M221.66,133.66l-72,72a8,8,0,0,1-11.32-11.32L196.69,136H40a8,8,0,0,1,0-16H196.69L138.34,61.66a8,8,0,0,1,11.32-11.32l72,72A8,8,0,0,1,221.66,133.66Z"/></svg></a>
      <a class="btn btn-secondary" href="readme.md">Read the guide</a>
    </div>
  </div>
</header>

<main class="container" style="padding-block:var(--space-12) var(--space-24)">

  <div class="index-facts">
    <div class="index-fact"><p class="index-fact-n">${tokens ? Object.keys(tokens).length : 0}</p><p class="label" style="margin-block-start:var(--space-1)">Tokens</p></div>
    <div class="index-fact"><p class="index-fact-n">${components.length}</p><p class="label" style="margin-block-start:var(--space-1)">Component pages</p></div>
    <div class="index-fact"><p class="index-fact-n">${foundations.length}</p><p class="label" style="margin-block-start:var(--space-1)">Foundations</p></div>
    <div class="index-fact"><p class="index-fact-n">${theme.radius}px</p><p class="label" style="margin-block-start:var(--space-1)">Radius</p></div>
  </div>

  <section class="index-sec">
    <p class="label">At a glance</p>
    <div class="stack" style="margin-block-start:var(--space-4);gap:var(--space-5)">
      <div class="index-row">
        <span class="muted" style="inline-size:9ch;font-size:var(--text-sm)">Neutral</span>
        ${swatches('neutral', [100, 200, 300, 400, 500, 600, 700, 800, 900])}
      </div>
      <div class="index-row">
        <span class="muted" style="inline-size:9ch;font-size:var(--text-sm)">Accent</span>
        ${swatches('accent', [100, 200, 300, 400, 500, 600, 700, 800, 900])}
      </div>
      <div class="index-row">
        <span class="muted" style="inline-size:9ch;font-size:var(--text-sm)">Action</span>
        <span class="index-chip" style="background:${t('--color-action')}"></span>
        <code style="font-size:var(--text-xs)">${t('--color-action')}</code>
        <span class="muted" style="font-size:var(--text-xs)">fills a primary button — the accent stays for focus rings and links</span>
      </div>
      <div class="index-row">
        <span class="muted" style="inline-size:9ch;font-size:var(--text-sm)">Type</span>
        <span style="font-family:var(--font-heading);font-weight:var(--font-heading-weight);font-size:var(--text-2xl)">Inter 500</span>
        <span class="mono" style="color:var(--color-neutral-600)">IBM Plex Mono</span>
      </div>
    </div>
  </section>

  <section class="index-sec">
    <p class="label">Foundations</p>
    <div style="margin-block-start:var(--space-4)">${cardGrid(foundations)}</div>
  </section>

  <section class="index-sec">
    <p class="label">Components</p>
    <div style="margin-block-start:var(--space-4)">${cardGrid(components)}</div>
  </section>

  <section class="index-sec">
    <p class="label">Templates</p>
    <div style="margin-block-start:var(--space-4)">${cardGrid(TEMPLATES)}</div>
  </section>

  <section class="index-sec">
    <p class="label">Pick it up</p>
    <div class="panel" style="margin-block-start:var(--space-4)">
      <div class="panel-body">
        <p class="card-body">Link the one stylesheet and take every value from its variables. The
          React library ships the same class names, so markup written against this system ports
          without a visual rewrite.</p>
        <pre class="mono" style="margin-block-start:var(--space-4);padding:var(--space-4);background:var(--color-surface);border-radius:var(--radius-md);overflow-x:auto;white-space:pre"><code>&lt;link rel="stylesheet" href="styles.css"&gt;

npm i @gener8v/ui @gener8v/tokens</code></pre>
      </div>
    </div>
  </section>

</main>
</body>
</html>
`);


/* -------------------------------------------------- responsive check harness */
// Chrome will not size a window below ~500px, so a true mobile viewport has to
// be measured inside an iframe. The page list is generated, never hand-kept.

const allPages = [
  'index.html',
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

write('skills/gener8v-design-system/references/components.md',
`# Component index

Generated from \`design/readme.md\`. Every class here exists in \`styles.css\` and is
producible by \`@gener8v/ui\` — both facts are gated by \`pnpm check\`.

Prefer these over inventing a parallel class. If you need something that is not here,
add it to the system, not to the consuming app.

| Class | What it is | Shown in |
| --- | --- | --- |
${tableRows.map((m) => `| ${m[1]} | ${m[2].trim()} | ${m[3].trim()} |`).join('\n')}

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
