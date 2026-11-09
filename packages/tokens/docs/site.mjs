// The documentation site: the nav data and chrome script, the Overview, Get started, and the
// Guidance pages. Called from build-pages.mjs, so `pnpm build:tokens` (and therefore `pnpm check`)
// regenerates all of it and CI's "generated output is reproducible" step covers it.

import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));

export const LINKS = {
  site: 'https://www.gener8v.com/',
  github: 'https://github.com/gener8v/gener8v.designer.design-system',
  license: 'https://github.com/gener8v/gener8v.designer.design-system/blob/main/LICENSE',
};

/** The one line every docs page carries. `prefix` is the path back to `design/`. */
export const docsScript = (prefix, template = false) =>
  `<script src="${prefix}assets/docs.js"${template ? ' data-docs="template"' : ''}></script>`;

export const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
/** when.ts prose: escaped, with `code` spans kept as code. */
const prose = (s) => esc(s).replace(/`([^`]+)`/g, '<code>$1</code>');
const cap = (s) => (s && /[a-z]/.test(s[0]) ? s[0].toUpperCase() + s.slice(1) : s);
const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

const ICON = {
  arrow: '<svg viewBox="0 0 256 256" fill="currentColor" aria-hidden="true"><path d="M221.66,133.66l-72,72a8,8,0,0,1-11.32-11.32L196.69,136H40a8,8,0,0,1,0-16H196.69L138.34,61.66a8,8,0,0,1,11.32-11.32l72,72A8,8,0,0,1,221.66,133.66Z"/></svg>',
  out: '<svg viewBox="0 0 256 256" fill="currentColor" aria-hidden="true"><path d="M200,64V168a8,8,0,0,1-16,0V83.31L69.66,197.66a8,8,0,0,1-11.32-11.32L172.69,72H88a8,8,0,0,1,0-16H192A8,8,0,0,1,200,64Z"/></svg>',
  warning: '<svg viewBox="0 0 256 256" fill="currentColor" aria-hidden="true"><path d="M236.8,188.09,149.35,36.22h0a24.76,24.76,0,0,0-42.7,0L19.2,188.09a23.51,23.51,0,0,0,0,23.72A24.35,24.35,0,0,0,40.55,224h174.9a24.35,24.35,0,0,0,21.33-12.19A23.51,23.51,0,0,0,236.8,188.09ZM120,104a8,8,0,0,1,16,0v40a8,8,0,0,1-16,0Zm8,88a12,12,0,1,1,12-12A12,12,0,0,1,128,192Z"/></svg>',
  access: '<svg viewBox="0 0 256 256" fill="currentColor" aria-hidden="true"><path d="M173.66,98.34a8,8,0,0,1,0,11.32l-56,56a8,8,0,0,1-11.32,0l-24-24a8,8,0,0,1,11.32-11.32L112,148.69l50.34-50.35A8,8,0,0,1,173.66,98.34ZM232,128A104,104,0,1,1,128,24,104.11,104.11,0,0,1,232,128Zm-16,0a88,88,0,1,0-88,88A88.1,88.1,0,0,0,216,128Z"/></svg>',
  tokens: '<svg viewBox="0 0 256 256" fill="currentColor" aria-hidden="true"><path d="M230.91,172A8,8,0,0,1,228,182.91l-96,56a8,8,0,0,1-8.06,0l-96-56A8,8,0,0,1,36,169.09l92,53.65,92-53.65A8,8,0,0,1,230.91,172ZM220,121.09l-92,53.65L36,121.09A8,8,0,0,0,28,134.91l96,56a8,8,0,0,0,8.06,0l96-56A8,8,0,1,0,220,121.09ZM24,80a8,8,0,0,1,4-6.91l96-56a8,8,0,0,1,8.06,0l96,56a8,8,0,0,1,0,13.82l-96,56a8,8,0,0,1-8.06,0l-96-56A8,8,0,0,1,24,80Zm23.88,0L128,126.74,208.12,80,128,33.26Z"/></svg>',
  agent: '<svg viewBox="0 0 256 256" fill="currentColor" aria-hidden="true"><path d="M69.12,94.15,28.5,128l40.62,33.85a8,8,0,1,1-10.24,12.29l-48-40a8,8,0,0,1,0-12.29l48-40a8,8,0,0,1,10.24,12.3Zm176,27.7-48-40a8,8,0,1,0-10.24,12.3L227.5,128l-40.62,33.85a8,8,0,1,0,10.24,12.29l48-40a8,8,0,0,0,0-12.29ZM162.73,32.48a8,8,0,0,0-10.25,4.79l-64,176a8,8,0,0,0,4.79,10.26A8.14,8.14,0,0,0,96,224a8,8,0,0,0,7.52-5.27l64-176A8,8,0,0,0,162.73,32.48Z"/></svg>',
};

export const PACKAGES = [
  ['@gener8v/ui', 'React components that render the same class names as the HTML.'],
  ['@gener8v/tokens', 'One token source: CSS variables, TypeScript and DTCG.'],
  ['@gener8v/tailwind-preset', 'A Tailwind v4 theme over the same tokens.'],
  ['@gener8v/icons', 'The icon subset the system uses, tree-shakeable.'],
];

const INSTALL = 'npm i @gener8v/ui @gener8v/tokens @gener8v/icons';

/* ------------------------------------------------------------------ nav */

const FOUNDATION_ORDER = ['color', 'type', 'layout', 'icons', 'image', 'language'];
const TEMPLATE_ORDER = ['app-shell', 'landing', 'deck', 'intake', 'purchase', 'work-item-create', 'work-item-close'];

export function navData({ foundations, components, templates, FAMILIES }) {
  const order = (list, keys) => [...list].sort((a, b) => keys.indexOf(a.key) - keys.indexOf(b.key));
  const f = order(foundations.map((c) => ({ ...c, key: c.path.replace(/^foundations\/|\.html$/g, '') })), FOUNDATION_ORDER);
  const c = [...components].sort((a, b) => a.name.localeCompare(b.name));
  const t = order(templates.map((x) => ({ ...x, key: x.path.split('/')[1] })), TEMPLATE_ORDER);
  const item = (x) => ({ title: x.name, subtitle: x.subtitle, path: x.path });
  return {
    links: LINKS,
    templatesHref: 'index.html#templates',
    sections: [
      { id: 'start', items: [
        { title: 'Overview', path: 'index.html' },
        { title: 'Get started', path: 'get-started.html' },
      ] },
      { id: 'foundations', title: 'Foundations', items: f.map(item) },
      { id: 'components', title: 'Components', items: c.map(item) },
      { id: 'templates', title: 'Templates', external: true, items: t.map(item) },
      { id: 'guidance', title: 'Guidance', items: Object.entries(FAMILIES).map(([k, v]) => ({
        title: v.title, subtitle: `Which component for ${v.question}`, path: `guidance/${k}.html`,
      })) },
    ],
  };
}

export function docsAsset(nav) {
  const css = readFileSync(join(HERE, 'docs.css'), 'utf8');
  const client = readFileSync(join(HERE, 'client.js'), 'utf8');
  return `/* GENERATED by packages/tokens/build-pages.mjs from packages/tokens/docs/ — do not edit. */
window.__DOCS_NAV__ = ${JSON.stringify(nav, null, 1)};
window.__DOCS_CSS__ = ${JSON.stringify(css)};
${client}`;
}

/* ------------------------------------------------------------- page shell */

/** A generated docs page. `prefix` is the path back to design/. */
export function shell({ title, prefix, description, css = '', head = '', body }) {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${esc(title)}</title>
${description ? `<meta name="description" content="${esc(description)}" />\n` : ''}${head}<link rel="stylesheet" href="${prefix}styles.css" />
${docsScript(prefix)}
<style>
${PAGE_CSS}${css}
</style>
</head>
<body>
${body}
</body>
</html>
`;
}

/* Scaffolding shared by the generated docs pages. Tokens only. */
const PAGE_CSS = `/* Page scaffolding only — every component comes from styles.css. */
.doc { max-inline-size: calc(var(--space-4) * 72); margin-inline: auto; padding: var(--space-10) var(--space-6) var(--space-24); }
.doc-prose { max-inline-size: 68ch; }
.doc-section { margin-block-start: var(--space-16); }
.doc-section > h2 { font-size: var(--text-2xl); }
.doc-rule { display: block; inline-size: var(--space-12); block-size: var(--space-1); margin-block-end: var(--space-4); border-radius: var(--radius-full); background: linear-gradient(90deg, var(--color-accent-600), var(--color-accent-2-500)); }
.doc-steps { list-style: none; padding: 0; margin: var(--space-6) 0 0; display: grid; gap: var(--space-8); counter-reset: step; }
.doc-steps > li { display: grid; grid-template-columns: var(--space-8) minmax(0, 1fr); gap: var(--space-4); counter-increment: step; }
.doc-steps > li::before { content: counter(step); display: grid; place-items: center; inline-size: var(--space-8); block-size: var(--space-8); border-radius: var(--radius-full); background: var(--color-accent-100); color: var(--color-accent-800); font-family: var(--font-mono); font-size: var(--text-sm); }
.doc-steps h3 { font-size: var(--text-lg); }
.doc-steps p { margin-block-start: var(--space-2); max-inline-size: 64ch; }
.doc-steps .code { margin-block-start: var(--space-3); max-inline-size: calc(var(--space-4) * 45); }
.doc-pkgs { list-style: none; padding: 0; margin: var(--space-6) 0 0; display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); border-block-start: 1px solid var(--color-divider); }
.doc-pkgs li { padding: var(--space-4) var(--space-4) var(--space-4) 0; border-block-end: 1px solid var(--color-divider); }
.doc-pkgs a { font-family: var(--font-mono); font-size: var(--text-sm); color: var(--color-accent-700); }
.doc-pkgs p { margin-block-start: var(--space-1); font-size: var(--text-sm); color: var(--color-neutral-600); }
@media (max-width: 640px) { .doc-pkgs { grid-template-columns: minmax(0, 1fr); } }
`;

/* -------------------------------------------------------------- overview */

/* THE OVERVIEW WEARS GENER8V.COM'S "ICE" LOOK, AND ONLY THE OVERVIEW DOES.
 *
 * The front door matches the site it hangs off: Geist type, square corners, frosted blue-white
 * surfaces with crystal facets, hairline-joined cells and one deep band. All of it is page
 * scaffolding built from the system's tokens, so it follows light and dark like everything else.
 * The components themselves are untouched — the live specimen in the hero is the real `.panel`,
 * `.table`, `.tag`, `.alert` and `.btn`, rounded corners and all, so what the page shows is what
 * the packages ship. */

const DISPLAY_FONT = `<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Geist:wght@400..800&family=Geist+Mono:wght@400..600&display=swap" />
`;

/** Crystal facets: a jittered triangular lattice, tinted from the accent ramps, fading out from the
 *  top-left. Deterministic, so the generated page is reproducible byte for byte. */
const FACETS = (() => {
  const COLS = 9, ROWS = 5, W = 1600, H = 900;
  const rand = (n) => { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
  const pt = (c, r) => {
    const j = c === 0 || c === COLS || r === 0 || r === ROWS ? 0 : 1;
    return [(c / COLS) * W + (rand(c * 31 + r * 7) - 0.5) * 120 * j, (r / ROWS) * H + (rand(c * 13 + r * 29) - 0.5) * 110 * j];
  };
  const paths = [];
  for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
    const [a, b, d, e] = [pt(c, r), pt(c + 1, r), pt(c, r + 1), pt(c + 1, r + 1)];
    const pair = (c + r) % 2 === 0 ? [[a, b, e], [a, e, d]] : [[a, b, d], [b, e, d]];
    pair.forEach((tri, k) => {
      const seed = c * 17 + r * 53 + k * 101;
      const d = `M${tri.map((p) => p.map((v) => v.toFixed(1)).join(' ')).join(' L')} Z`;
      paths.push(`<path class="t${Math.floor(rand(seed) * 4)}" d="${d}" fill-opacity="${(0.25 + rand(seed + 7) * 0.5).toFixed(2)}"/>`);
    });
  }
  return `<svg class="ov-facets" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">
      <defs><linearGradient id="ov-facet-light" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff" stop-opacity="0.9"/><stop offset="0.55" stop-color="#fff" stop-opacity="0.15"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
      <mask id="ov-facet-fade"><rect width="${W}" height="${H}" fill="url(#ov-facet-light)"/></mask></defs>
      <g mask="url(#ov-facet-fade)">${paths.join('')}</g>
    </svg>`;
})();

/** A grid of cells on shared hairlines. `cols` is the count at full width; it halves, then goes to
 *  one. Every count used divides its list, or the first item is featured across two columns. */
const cards = (items, cols, featured = false) => `<div class="ov-cells" style="--cols:${cols}">${items.map((c, i) => `
  <a class="ov-cell${featured && i === 0 ? ' ov-featured' : ''}" href="${esc(c.path)}">
    <span class="ov-cell-title">${esc(c.title)}${ICON.arrow}</span>
    <span class="ov-cell-body">${esc(c.subtitle)}</span>
  </a>`).join('')}</div>`;

const OVERVIEW_CSS = `
/* Geist across this page, the docs chrome included, so the frame and the page agree. */
body:has(> main.ov) { font-family: "Geist", var(--font-body); }
/* Headings don't inherit the body face: base.css sets them to --font-heading (Inter). Without this
   the page's headings drew in Inter at Geist's tight tracking, which crowds the letters. */
.ov :is(h1, h2, h3, h4) { font-family: "Geist", var(--font-heading); }
.ov code, .ov pre, .ov-mono { font-family: "Geist Mono", var(--font-mono); }
html[data-docs="page"] body > main.ov { margin: 0; max-inline-size: none; }
.ov-wrap { position: relative; max-inline-size: calc(var(--space-4) * 76); margin-inline: 0 auto; padding-inline: var(--space-6); }
@media (min-width: 1280px) { .ov-wrap { margin-inline-start: var(--space-6); } }

/* Square, everywhere this page draws its own surface. */
.ov .code, .ov-install, .ov-btn, .ov-cell, .ov-frame { border-radius: 0; }

/* --- hero: a frosted sky with the facets showing through ---------------------------------- */
.ov-hero {
  position: relative;
  overflow: hidden;
  padding-block: var(--space-24) var(--space-20);
  background: linear-gradient(135deg,
    color-mix(in srgb, var(--color-accent-200) 70%, var(--color-bg)),
    var(--color-bg) 48%,
    color-mix(in srgb, var(--color-accent-2-100) 80%, var(--color-bg)));
  border-block-end: 1px solid color-mix(in srgb, var(--color-accent-300) 60%, transparent);
}
.ov-facets { position: absolute; inset: 0; inline-size: 100%; block-size: 100%; pointer-events: none; opacity: 0.85; }
.ov-facets path { stroke: var(--color-accent-300); stroke-opacity: 0.5; stroke-width: 1; }
.ov-facets .t0 { fill: var(--color-bg); }
.ov-facets .t1 { fill: var(--color-accent-100); }
.ov-facets .t2 { fill: var(--color-accent-200); }
.ov-facets .t3 { fill: var(--color-accent-2-100); }
.ov-gridlines {
  position: absolute; inset: 0; pointer-events: none;
  background-image:
    linear-gradient(to right, color-mix(in srgb, var(--color-accent-300) 22%, transparent) 1px, transparent 1px),
    linear-gradient(to bottom, color-mix(in srgb, var(--color-accent-300) 22%, transparent) 1px, transparent 1px);
  background-size: var(--space-16) var(--space-16);
  mask-image: radial-gradient(ellipse 70% 80% at 30% 40%, #000, transparent 75%);
}
.ov-hero-grid { position: relative; display: grid; grid-template-columns: minmax(0, 1.05fr) minmax(0, 1fr); gap: var(--space-12); align-items: center; }
.ov-title { font-size: clamp(var(--text-4xl), 5.2vw, calc(var(--text-4xl) * 1.95)); font-weight: 700; letter-spacing: -0.035em; line-height: 1; color: var(--color-neutral-900); }
.ov-title span { display: block; padding-block-end: 0.08em; }
.ov-grad { background: linear-gradient(90deg, var(--color-accent-600), var(--color-accent-2-600)); -webkit-background-clip: text; background-clip: text; color: transparent; }
.ov-hairline { display: block; block-size: 1px; max-inline-size: calc(var(--space-4) * 36); margin-block: var(--space-8) var(--space-6);
  background: linear-gradient(90deg, color-mix(in srgb, var(--color-accent-600) 60%, transparent), color-mix(in srgb, var(--color-accent-300) 70%, transparent), transparent); }
.ov-tagline { font-size: var(--text-2xl); font-weight: 600; letter-spacing: -0.02em; line-height: 1.3; color: var(--color-neutral-900); max-inline-size: 30ch; }
.ov-tagline b { font-weight: 600; color: var(--color-accent-700); }
.ov-lede { margin-block-start: var(--space-4); font-size: var(--text-lg); line-height: 1.6; color: var(--color-neutral-700); max-inline-size: 44ch; }
.ov-lede strong { color: var(--color-neutral-900); font-weight: 600; }
.ov-ctas { display: flex; flex-wrap: wrap; gap: var(--space-3); margin-block-start: var(--space-8); }
.ov-btn { display: inline-flex; align-items: center; justify-content: center; gap: var(--space-2); min-block-size: var(--control-h-xl); padding-inline: var(--space-6);
  font-weight: 600; font-size: var(--text-base); text-decoration: none; border: 1px solid transparent; transition: background-color .15s, border-color .15s, transform .15s; }
.ov-btn svg { inline-size: 1em; block-size: 1em; transition: transform .15s; }
.ov-btn:hover svg { transform: translateX(2px); }
.ov-btn-primary { color: #fff; background: linear-gradient(135deg, var(--color-action), var(--color-action-hover)); box-shadow: 0 14px 30px -14px color-mix(in srgb, var(--color-action) 70%, transparent); }
.ov-btn-primary:hover { background: var(--color-action-hover); color: #fff; }
.ov-btn-ghost { color: var(--color-neutral-900); background: color-mix(in srgb, var(--color-bg) 75%, transparent); border-color: color-mix(in srgb, var(--color-accent-300) 80%, transparent); }
.ov-btn-ghost:hover { background: var(--color-bg); border-color: var(--color-accent-600); color: var(--color-neutral-900); }
.ov-install { display: inline-flex; align-items: center; gap: var(--space-3); margin-block-start: var(--space-5); padding: var(--space-2) var(--space-4);
  border: 1px solid color-mix(in srgb, var(--color-accent-300) 70%, transparent); background: color-mix(in srgb, var(--color-bg) 70%, transparent);
  font-size: var(--text-sm); color: var(--color-neutral-800); max-inline-size: 100%; overflow-x: auto; white-space: nowrap; }
.ov-install span { color: var(--color-accent-700); user-select: none; }

/* The specimen sits in a frosted frame; the panel inside is the real component. */
.ov-frame { position: relative; padding: var(--space-3); border: 1px solid color-mix(in srgb, var(--color-accent-300) 60%, transparent);
  background: color-mix(in srgb, var(--color-bg) 55%, transparent); backdrop-filter: blur(6px);
  box-shadow: 0 40px 80px -50px color-mix(in srgb, var(--color-accent-700) 55%, transparent); }
.ov-frame::before { content: ""; position: absolute; inset-inline: 0; inset-block-start: -1px; block-size: 1px; background: linear-gradient(90deg, transparent, var(--color-accent-600), transparent); }
.ov-specimen { background: var(--color-bg); }
.ov-specimen .panel-body { display: grid; gap: var(--space-5); }
.ov-specimen-actions { display: flex; justify-content: flex-end; gap: var(--space-3); flex-wrap: wrap; }
.ov-caption { margin-block-start: var(--space-3); font-size: var(--text-xs); color: var(--color-neutral-600); text-align: end; }

/* --- the figures: drop caps set into their own sentences, on a frosted band ---------------- */
.ov-figures { position: relative; overflow: hidden; margin-block-start: var(--space-16); border: 1px solid color-mix(in srgb, var(--color-accent-300) 60%, transparent);
  background: linear-gradient(135deg, var(--color-accent-100), var(--color-bg) 50%, color-mix(in srgb, var(--color-accent-2-100) 80%, var(--color-bg))); }
.ov-figures .ov-facets { opacity: 0.7; }
.ov-figures ul { position: relative; list-style: none; margin: 0; padding: 0; display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); }
.ov-figures li { padding: var(--space-8); border-block-end: 1px solid color-mix(in srgb, var(--color-accent-300) 50%, transparent); }
.ov-figures li:nth-child(odd) { border-inline-end: 1px solid color-mix(in srgb, var(--color-accent-300) 50%, transparent); }
.ov-figures li:nth-last-child(-n+2) { border-block-end: 0; }
.ov-figures p { font-size: var(--text-lg); line-height: 1.7; color: var(--color-neutral-600); }
.ov-figures strong { font-weight: 600; color: var(--color-neutral-900); }
.ov-cap { float: left; margin-inline-end: var(--space-3); padding-block-start: 0.14em; margin-block-start: calc(-0.14em - var(--space-1)); font-size: calc(var(--text-5xl) * 1.55); font-weight: 700; line-height: 0.72; letter-spacing: -0.04em; }

/* --- sections -------------------------------------------------------------------------- */
.ov-section { padding-block: var(--space-24) 0; }
.ov-head { display: grid; grid-template-columns: minmax(0, 1.2fr) minmax(0, 1fr); gap: var(--space-6) var(--space-16); align-items: center; margin-block-end: var(--space-10); }
.ov-section h2 { font-size: var(--text-5xl); font-weight: 700; letter-spacing: -0.035em; line-height: 1.04; color: var(--color-neutral-900); }
.ov-head p { font-size: var(--text-lg); line-height: 1.6; color: var(--color-neutral-600); }

/* Cells on shared hairlines: the page's one card language. */
.ov-cells { display: grid; grid-template-columns: repeat(var(--cols), minmax(0, 1fr)); gap: 1px;
  background: color-mix(in srgb, var(--color-neutral-900) 9%, transparent); border: 1px solid color-mix(in srgb, var(--color-neutral-900) 10%, transparent); }
.ov-cell { position: relative; display: flex; flex-direction: column; gap: var(--space-2); padding: var(--space-6); text-decoration: none; color: inherit;
  background: color-mix(in srgb, var(--color-bg) 92%, var(--color-accent-100)); transition: background-color .2s; }
.ov-cell::before { content: ""; position: absolute; inset-inline: 0; inset-block-start: 0; block-size: 2px; opacity: 0; transition: opacity .2s;
  background: linear-gradient(90deg, var(--color-accent-600), var(--color-accent-2-600), transparent); }
.ov-cell:hover { background: var(--color-bg); }
.ov-cell:hover::before, .ov-cell:focus-visible::before { opacity: 1; }
.ov-cell:focus-visible { outline: 2px solid var(--color-accent-600); outline-offset: -2px; }
.ov-cell-title { display: flex; align-items: center; justify-content: space-between; gap: var(--space-3); font-size: var(--text-lg); font-weight: 600; letter-spacing: -0.01em; color: var(--color-neutral-900); }
.ov-cell-title svg { inline-size: var(--space-4); block-size: var(--space-4); flex: none; color: color-mix(in srgb, var(--color-accent-600) 55%, transparent); transition: transform .2s, color .2s; }
.ov-cell:hover .ov-cell-title svg { transform: translateX(2px); color: var(--color-accent-600); }
.ov-cell-body { font-size: var(--text-sm); line-height: 1.6; color: var(--color-neutral-600); }
.ov-featured { grid-column: span 2; background: linear-gradient(135deg, var(--color-accent-100), var(--color-bg)); }

/* Reasons: the icon sits beside its title as a marker, not above it as a header. */
.ov-reason { padding: var(--space-8); }
.ov-reason .ov-cell-title { justify-content: flex-start; font-size: var(--text-xl); }
.ov-mark { display: inline-grid; place-items: center; inline-size: var(--space-10); block-size: var(--space-10); flex: none;
  border: 1px solid color-mix(in srgb, var(--color-accent-2-600) 30%, transparent); background: var(--color-bg); color: var(--color-accent-2-700); }
.ov-mark svg { inline-size: var(--space-5); block-size: var(--space-5); color: inherit; }
.ov-reason .ov-cell-body { margin-block-start: var(--space-3); font-size: var(--text-base); }

/* Get started */
.ov-start { display: grid; grid-template-columns: minmax(0, 1.4fr) minmax(0, 1fr); gap: var(--space-16); align-items: start; }
.ov-steps { list-style: none; padding: 0; margin: 0; display: grid; gap: var(--space-8); counter-reset: step; }
.ov-steps > li { display: grid; grid-template-columns: var(--space-10) minmax(0, 1fr); gap: var(--space-5); counter-increment: step; }
.ov-steps > li::before { content: counter(step); display: grid; place-items: center; inline-size: var(--space-10); block-size: var(--space-10);
  border: 1px solid color-mix(in srgb, var(--color-accent-600) 35%, transparent); background: var(--color-accent-100); color: var(--color-accent-700); font-family: "Geist Mono", var(--font-mono); font-size: var(--text-sm); font-weight: 600; }
.ov-steps h3 { font-size: var(--text-xl); font-weight: 600; letter-spacing: -0.01em; }
.ov-steps p { margin-block-start: var(--space-1); color: var(--color-neutral-600); max-inline-size: 60ch; }
.ov-steps .code { margin-block-start: var(--space-3); }
.ov-pkgs { list-style: none; margin: 0; padding: 0; border-block-start: 1px solid var(--color-divider); }
.ov-pkgs li { padding-block: var(--space-4); border-block-end: 1px solid var(--color-divider); }
.ov-pkgs a { font-family: "Geist Mono", var(--font-mono); font-size: var(--text-sm); font-weight: 500; color: var(--color-accent-700); }
.ov-pkgs p { margin-block-start: var(--space-1); font-size: var(--text-sm); color: var(--color-neutral-600); }
.ov-aside-title { font-size: var(--text-xl); font-weight: 600; margin-block-end: var(--space-4); }
.ov-note { margin-block-start: var(--space-5); font-size: var(--text-sm); color: var(--color-neutral-600); }

/* Browse */
.ov-group { margin-block-start: var(--space-16); }
.ov-group h3 { display: flex; align-items: baseline; gap: var(--space-3); margin-block-end: var(--space-4); font-size: var(--text-2xl); font-weight: 700; letter-spacing: -0.02em; }
.ov-group h3 .ov-mono { font-size: var(--text-sm); font-weight: 500; color: var(--color-neutral-600); }

/* The close: the one deep band, which is dark in both themes. */
.ov-close { position: relative; overflow: hidden; margin-block-start: var(--space-24); padding-block: var(--space-20); }
.ov-close .ov-gridlines { mask-image: radial-gradient(ellipse 60% 90% at 80% 20%, #000, transparent 75%);
  background-image: linear-gradient(to right, color-mix(in srgb, #fff 8%, transparent) 1px, transparent 1px), linear-gradient(to bottom, color-mix(in srgb, #fff 8%, transparent) 1px, transparent 1px); }
.ov-close::before { content: ""; position: absolute; inset: 0; pointer-events: none;
  background: radial-gradient(60% 90% at 0% 0%, color-mix(in srgb, var(--color-section-ghost) 70%, transparent), transparent 70%); }
.ov-close .ov-wrap { display: grid; grid-template-columns: minmax(0, 1.3fr) minmax(0, 1fr); gap: var(--space-10) var(--space-16); align-items: end; }
.ov-close h2 { font-size: var(--text-5xl); font-weight: 700; letter-spacing: -0.035em; line-height: 1.04; }
.ov-close h2 span { color: color-mix(in srgb, #fff 70%, transparent); }
.ov-close p { margin-block-start: var(--space-5); font-size: var(--text-lg); line-height: 1.6; max-inline-size: 52ch; }
.ov-close .ov-ctas { margin: 0; justify-content: flex-end; }
.ov-btn-light { color: var(--color-section); background: #fff; }
.ov-btn-light:hover { background: color-mix(in srgb, #fff 88%, transparent); color: var(--color-section); }
.ov-btn-line { color: #fff; border-color: color-mix(in srgb, #fff 40%, transparent); }
.ov-btn-line:hover { border-color: #fff; color: #fff; background: color-mix(in srgb, #fff 8%, transparent); }
.ov-foot { padding-block: var(--space-8); font-size: var(--text-sm); color: var(--color-neutral-600); }
.ov-foot a { color: var(--color-neutral-800); }

@media (max-width: 1180px) {
  .ov-hero-grid, .ov-start, .ov-head, .ov-close .ov-wrap { grid-template-columns: minmax(0, 1fr); }
  .ov-close .ov-ctas { justify-content: flex-start; }
  .ov-cells { grid-template-columns: repeat(min(var(--cols), 2), minmax(0, 1fr)); }
}
@media (max-width: 760px) {
  .ov-figures ul { grid-template-columns: minmax(0, 1fr); }
  .ov-figures li:nth-child(odd) { border-inline-end: 0; }
  .ov-figures li:nth-last-child(2) { border-block-end: 1px solid color-mix(in srgb, var(--color-accent-300) 50%, transparent); }
  .ov-section h2, .ov-close h2 { font-size: var(--text-4xl); }
}
@media (max-width: 560px) {
  .ov-hero { padding-block: var(--space-16) var(--space-12); }
  .ov-cells { grid-template-columns: minmax(0, 1fr); }
  .ov-featured { grid-column: auto; }
  .ov-figures li { padding: var(--space-6); }
  .ov-cap { font-size: calc(var(--text-5xl) * 1.3); }
  .ov-btn { inline-size: 100%; }
  .ov-specimen .table th, .ov-specimen .table td { padding-inline: var(--space-2); }
  .ov-install { white-space: normal; font-size: var(--text-xs); overflow-x: visible; }
}
@media (prefers-reduced-motion: reduce) { .ov-btn, .ov-btn svg, .ov-cell, .ov-cell::before, .ov-cell-title svg { transition: none; } }
`;

function specimen() {
  return `<div class="panel ov-specimen" inert>
        <div class="panel-header">
          <span class="panel-title">Model release 4.2 — review</span>
          <span class="tag tag-warning tag-dot">Awaiting sign-off</span>
        </div>
        <div class="panel-body">
          <div class="stat-row">
            <div class="stat"><p class="stat-value">48<span class="muted"> / 50</span></p><p class="stat-label">Evaluations passed</p></div>
            <div class="stat"><p class="stat-value">2</p><p class="stat-label">Open findings</p></div>
            <div class="stat"><p class="stat-value">3<span class="muted"> of 4</span></p><p class="stat-label">Approvers</p></div>
          </div>
          <div class="table-wrap">
            <table class="table table-compact">
              <thead><tr><th scope="col">Control</th><th scope="col">Owner</th><th scope="col">Status</th></tr></thead>
              <tbody>
                <tr><td>Bias and fairness suite</td><td>Model risk</td><td><span class="tag tag-success">Passed</span></td></tr>
                <tr><td>Prompt-injection suite</td><td>Security</td><td><span class="tag tag-warning">2 findings</span></td></tr>
                <tr><td>Data lineage evidence</td><td>Data governance</td><td><span class="tag tag-success">Evidenced</span></td></tr>
              </tbody>
            </table>
          </div>
          <div class="alert" data-tone="warning">
            ${ICON.warning}
            <div class="alert-content"><p class="alert-title">Two findings have no owner</p><p class="alert-body">Assign them before release; they stay on the audit record either way.</p></div>
          </div>
          <div class="ov-specimen-actions">
            <button type="button" class="btn btn-secondary">Request Changes</button>
            <button type="button" class="btn btn-primary">Approve Release</button>
          </div>
        </div>
      </div>`;
}

export function overviewPage({ nav, themeName }) {
  const sec = (id) => nav.sections.find((s) => s.id === id).items;
  const foundations = sec('foundations');
  const components = sec('components');
  const templates = sec('templates');
  const guidance = sec('guidance');
  // The record, counted from the nav itself so a figure can never drift from the list it counts.
  const figures = [
    [components.length, 'components', 'rendered from one set of class names — copy the HTML, or import the React.'],
    [templates.length, 'templates', 'to start a screen from: an application shell, a landing page, a deck and worked flows.'],
    ['AA', 'contrast on every text pair,', 'measured in light and in dark. CI fails the build if one slips.'],
    [PACKAGES.length, 'packages, one version,', 'public on npm under MIT. No token, no account.'],
  ];
  return shell({
    title: `${themeName} Design System`,
    prefix: '',
    description: 'Open-source tokens, React components and page templates for products in regulated, governed and auditable environments.',
    head: DISPLAY_FONT,
    css: OVERVIEW_CSS,
    body: `<main class="ov">
  <section class="ov-hero" aria-labelledby="ov-title">
    ${FACETS}
    <div class="ov-gridlines" aria-hidden="true"></div>
    <div class="ov-wrap">
      <div class="ov-hero-grid">
        <div>
          <h1 class="ov-title" id="ov-title">${themeName} <span class="ov-grad">Design System</span></h1>
          <span class="ov-hairline" aria-hidden="true"></span>
          <p class="ov-tagline">Interfaces you can <b>rely on</b>, <b>audit</b> and <b>ship</b>.</p>
          <p class="ov-lede">Open-source tokens, React components and page templates for products in
            <strong>regulated, governed and auditable</strong> environments.</p>
          <div class="ov-ctas">
            <a class="ov-btn ov-btn-primary" href="#components">Browse Components${ICON.arrow}</a>
            <a class="ov-btn ov-btn-ghost" href="get-started.html">Get Started</a>
          </div>
          <p class="ov-install ov-mono"><span aria-hidden="true">$</span><code>${INSTALL}</code></p>
        </div>
        <figure>
          <div class="ov-frame">
            ${specimen()}
          </div>
          <figcaption class="ov-caption">Rendered live with the system's own classes — nothing on this panel is a picture.</figcaption>
        </figure>
      </div>

      <section class="ov-figures" aria-label="The system in numbers">
        ${FACETS}
        <ul>${figures.map(([n, lead, rest]) => `
          <li><p><span class="ov-cap ov-grad">${n}</span><strong>${lead}</strong> ${rest}</p></li>`).join('')}
        </ul>
      </section>
    </div>
  </section>

  <section class="ov-section" aria-labelledby="ov-why">
    <div class="ov-wrap">
      <div class="ov-head">
        <h2 id="ov-why">Built to be <span class="ov-grad">relied on.</span></h2>
        <p>Every rule is checked rather than assumed — so a product built on it inherits the checks, not just the look.</p>
      </div>
      <div class="ov-cells" style="--cols:3">
        <div class="ov-cell ov-reason">
          <p class="ov-cell-title"><span class="ov-mark">${ICON.access}</span>Accessible by default</p>
          <p class="ov-cell-body">Every text pair is measured for contrast in light and dark, and the components run under axe — both gate CI, so a regression fails the build rather than reaching a user.</p>
        </div>
        <div class="ov-cell ov-reason">
          <p class="ov-cell-title"><span class="ov-mark">${ICON.tokens}</span>One token source</p>
          <p class="ov-cell-body">Colour, type, space and motion are defined once and emitted as CSS variables, TypeScript, a Tailwind preset and DTCG for design tools.</p>
        </div>
        <div class="ov-cell ov-reason">
          <p class="ov-cell-title"><span class="ov-mark">${ICON.agent}</span>Built for AI-assisted delivery</p>
          <p class="ov-cell-body">A Claude Code plugin teaches the rules and the class names, and a which-component-for-which-job guide says what to reach for — and what not to.</p>
        </div>
      </div>
    </div>
  </section>

  <section class="ov-section" aria-labelledby="ov-start">
    <div class="ov-wrap">
      <div class="ov-head">
        <h2 id="ov-start">Three steps <span class="ov-grad">to the first screen.</span></h2>
        <p>Install, import one stylesheet, and teach Claude Code the rules. Then start from a template rather than a blank file.</p>
      </div>
      <div class="ov-start">
        <div>
          <ol class="ov-steps">
            <li><div><h3>Install</h3><p>Public on npm under MIT. No token, no account.</p>
              <pre class="code"><code data-language="sh">${INSTALL}</code></pre></div></li>
            <li><div><h3>Import</h3><p>One stylesheet first, then the components.</p>
              <pre class="code"><code data-language="tsx">import '@gener8v/ui/styles.css';
import { Button, Table, Dialog } from '@gener8v/ui';</code></pre></div></li>
            <li><div><h3>Add the Claude Code plugin</h3><p>It teaches Claude the rules, the class names, the templates and which component fits which job.</p>
              <pre class="code"><code data-language="sh">/plugin marketplace add gener8v/gener8v.designer.design-system</code></pre></div></li>
          </ol>
          <p style="margin-block-start:var(--space-8)"><a class="ov-btn ov-btn-ghost" href="get-started.html">The Full Guide${ICON.arrow}</a></p>
        </div>
        <div>
          <h3 class="ov-aside-title">Packages</h3>
          <ul class="ov-pkgs">${PACKAGES.map(([n, d]) => `
            <li><a href="https://www.npmjs.com/package/${n}">${n}</a><p>${d}</p></li>`).join('')}
          </ul>
          <p class="ov-note">Source, issues and releases on <a href="${LINKS.github}">GitHub</a>. Open source under the <a href="${LINKS.license}">MIT licence</a>.</p>
        </div>
      </div>
    </div>
  </section>

  <section class="ov-section" id="browse" aria-labelledby="ov-browse">
    <div class="ov-wrap">
      <div class="ov-head">
        <h2 id="ov-browse">Everything, <span class="ov-grad">in plain markup.</span></h2>
        <p>Every page shows the real markup — view the source and copy it. The React components in <code>@gener8v/ui</code> render the same class names.</p>
      </div>

      <div class="ov-group"><h3 id="foundations">Foundations <span class="ov-mono">${foundations.length}</span></h3>
      ${cards(foundations, 3)}</div>

      <div class="ov-group"><h3 id="components">Components <span class="ov-mono">${components.length}</span></h3>
      ${cards(components, 4)}</div>

      <div class="ov-group"><h3 id="templates">Templates <span class="ov-mono">${templates.length} · open full screen</span></h3>
      ${cards(templates, 4, true)}</div>

      <div class="ov-group"><h3 id="guidance">Guidance <span class="ov-mono">which component for which job</span></h3>
      ${cards(guidance, 4)}</div>
    </div>
  </section>

  <section class="section-band ov-close" aria-labelledby="ov-close">
    <div class="ov-gridlines" aria-hidden="true"></div>
    <div class="ov-wrap">
      <div>
        <h2 id="ov-close">Built by ${themeName}. <span>Used on our own work.</span></h2>
        <p>The team behind this system builds and runs systems for international, heavily regulated businesses — the team you rely on to deliver when it counts.</p>
      </div>
      <div class="ov-ctas">
        <a class="ov-btn ov-btn-light" href="${LINKS.site}">Visit gener8v.com${ICON.out}</a>
        <a class="ov-btn ov-btn-line" href="${LINKS.github}">Source on GitHub</a>
      </div>
    </div>
  </section>
  <footer class="ov-wrap ov-foot">${themeName} design system · <a href="${LINKS.site}">gener8v.com</a> · <a href="${LINKS.github}">GitHub</a> · MIT</footer>
</main>`,
  });
}

/* ------------------------------------------------------------ get started */

export function getStartedPage({ themeName }) {
  return shell({
    title: `Get started — ${themeName} Design System`,
    prefix: '',
    body: `<main class="doc">
  <div class="docs-head">
    <h1>Get started</h1>
    <p class="lede">Install the packages, import one stylesheet, and teach Claude Code the rules. Then start a screen from a template rather than from a blank file.</p>
  </div>
  <ol class="doc-steps">
    <li><div><h3>Install</h3>
      <p>The packages are public on npm under MIT. No token, no <code>.npmrc</code>, no account — and CI needs no secret either.</p>
      <pre class="code"><code data-language="sh">${INSTALL}</code></pre></div></li>
    <li><div><h3>Import the stylesheet, then the components</h3>
      <p>One stylesheet carries the tokens and every component class. Import it first.</p>
      <pre class="code"><code data-language="tsx">import '@gener8v/ui/styles.css';          // one stylesheet, first
import { Button, Flow, BarChart } from '@gener8v/ui';</code></pre>
      <p>Not on React? The same classes work in plain HTML: link <code>styles.css</code> and copy the markup from any component page.</p></div></li>
    <li><div><h3>Using Tailwind</h3>
      <p>The preset maps the same tokens into a Tailwind v4 theme, so utilities and components agree.</p>
      <pre class="code"><code data-language="sh">npm i @gener8v/tailwind-preset</code></pre></div></li>
    <li><div><h3>Teach Claude Code the rules</h3>
      <p>The plugin gives Claude the hard rules, the class names, where the templates are, and the guidance on which component fits which job — without this repository being open.</p>
      <pre class="code"><code data-language="sh">/plugin marketplace add gener8v/gener8v.designer.design-system</code></pre></div></li>
    <li><div><h3>Enforce it</h3>
      <p>Copy <code>design/_adherence.oxlintrc.json</code> into the project and point its lint at it. It fails on raw hex, raw px and fonts the system does not provide.</p></div></li>
    <li><div><h3>Start from a template</h3>
      <p><a href="templates/app-shell/index.html">Application shell</a> for an app, <a href="templates/landing/index.html">Landing page</a> for marketing, <a href="templates/deck/index.html">Presentation deck</a> for slides, and four worked flows. Copy one and replace the content.</p></div></li>
  </ol>

  <section class="doc-section" aria-labelledby="pkgs">
    <span class="doc-rule" aria-hidden="true"></span>
    <h2 id="pkgs">Packages</h2>
    <p class="doc-prose muted" style="margin-block-start:var(--space-3)">All four release on one version.</p>
    <ul class="doc-pkgs">${PACKAGES.map(([n, d]) => `
      <li><a href="https://www.npmjs.com/package/${n}">${n}</a><p>${d}</p></li>`).join('')}
    </ul>
    <p class="muted" style="margin-block-start:var(--space-6);font-size:var(--text-sm)">Source on <a href="${LINKS.github}">GitHub</a> · <a href="${LINKS.license}">MIT licence</a></p>
  </section>
</main>`,
  });
}

/* --------------------------------------------------------------- guidance */

const GUIDANCE_CSS = `
.gd-table td, .gd-table th { white-space: normal; vertical-align: top; font-size: var(--text-sm); }
.gd-table td:first-child { min-inline-size: 12ch; }
.gd-table code { overflow-wrap: anywhere; }
/* NARROW: EACH ROW A BLOCK. Five columns in a phone's width wrap one word to a line. Below 40rem of
   the table's own room, each row stacks: the job as its lead line, then labelled lines. The explicit
   ARIA roles keep the table semantics when the display changes; the header row stays for assistive
   tech and leaves the screen. */
.gd-wrap { container-type: inline-size; }
@container (max-width: 40rem) {
  .gd-table, .gd-table tbody, .gd-table tr, .gd-table td { display: block; inline-size: auto; }
  .gd-table thead { position: absolute; inline-size: 1px; block-size: 1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap; }
  .gd-table tr { padding-block: var(--space-1) var(--space-3); }
  .gd-table tr.gd-first { border-block-start: 1px solid var(--color-divider); padding-block-start: var(--space-4); }
  .gd-table tr.gd-first:first-child { border-block-start: 0; padding-block-start: 0; }
  .table.gd-table tbody td { padding: var(--space-1) 0; border: 0; min-inline-size: 0; background: none; }
  .gd-table td.gd-lead { font-size: var(--text-base); font-weight: 500; color: var(--color-neutral-900); padding-block-end: var(--space-2); }
  .gd-table td[data-label]::before { content: attr(data-label); display: block; font-size: var(--text-xs); color: var(--color-neutral-600); }
}
.gd-entry { margin-block-start: var(--space-12); padding-block-start: var(--space-8); border-block-start: 1px solid var(--color-divider); }
.gd-entry h2 { font-size: var(--text-2xl); display: flex; align-items: center; gap: var(--space-3); flex-wrap: wrap; }
.gd-entry h2 + p { margin-block-start: var(--space-3); font-size: var(--text-lg); color: var(--color-neutral-800); max-inline-size: 64ch; }
.gd-cols { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: var(--space-6); margin-block-start: var(--space-5); }
.gd-cols h3 { font-size: var(--text-sm); font-weight: 600; color: var(--color-neutral-900); }
.gd-cols ul { margin: var(--space-2) 0 0; padding-inline-start: var(--space-5); display: grid; gap: var(--space-2); font-size: var(--text-sm); color: var(--color-neutral-700); }
.gd-meta { margin-block-start: var(--space-5); display: flex; flex-wrap: wrap; align-items: center; gap: var(--space-2) var(--space-4); font-size: var(--text-sm); color: var(--color-neutral-600); }
.gd-meta code { font-size: var(--text-xs); }
.gd-other { margin-block-start: var(--space-16); }
@media (max-width: 720px) { .gd-cols { grid-template-columns: minmax(0, 1fr); } }
`;

export function guidancePages({ FAMILIES, entries, screens, themeName }) {
  const out = {};
  const fams = Object.keys(FAMILIES);
  const byName = new Map(entries.map((e) => [e.name, e]));
  const link = (name, family) => {
    const e = byName.get(name);
    if (!e) return `<code>${esc(name)}</code>`;
    const href = e.family === family ? `#${slug(name)}` : `${e.family}.html#${slug(name)}`;
    return `<a href="${href}"><code>${esc(name)}</code></a>`;
  };
  for (const family of fams) {
    const f = FAMILIES[family];
    const mine = entries.filter((e) => e.family === family);
    const screenTable = family === 'screens' && screens.length ? `
  <section class="doc-section" aria-labelledby="screen-types">
    <span class="doc-rule" aria-hidden="true"></span>
    <h2 id="screen-types">Screen types</h2>
    <p class="doc-prose" style="margin-block-start:var(--space-3)">Start a screen from a template, not from a blank file.</p>
    <div class="table-wrap gd-wrap" style="margin-block-start:var(--space-5)"><table class="table gd-table" role="table">
      <thead role="rowgroup"><tr role="row"><th scope="col" role="columnheader">Screen</th><th scope="col" role="columnheader">Start from</th><th scope="col" role="columnheader">Uses</th><th scope="col" role="columnheader">When</th></tr></thead>
      <tbody role="rowgroup">${screens.map((s) => `
        <tr role="row" class="gd-first"><td role="cell" class="gd-lead">${prose(cap(s.screen))}</td><td role="cell" data-label="Start from"><a href="../${s.template}index.html">${esc(s.template.replace(/^templates\/|\/$/g, ''))}</a></td><td role="cell" data-label="Uses">${s.implies.map((i) => link(i, family)).join(', ')}</td><td role="cell" data-label="When">${prose(s.note)}</td></tr>`).join('')}
      </tbody></table></div>
  </section>` : '';

    const glance = mine.flatMap((e) => e.not.map((n, i) => `
        <tr role="row"${i === 0 ? ' class="gd-first"' : ''}>${i === 0 ? `<td role="cell" class="gd-lead" rowspan="${e.not.length}">${prose(cap(e.job))}</td><td role="cell" data-label="Use" rowspan="${e.not.length}"><a href="#${slug(e.name)}"><code>${esc(e.name)}</code></a></td>` : ''}<td role="cell" data-label="Not when">${prose(cap(n.when))}</td><td role="cell" data-label="Instead">${link(n.use, family)}</td><td role="cell" data-label="Because">${prose(cap(n.because))}</td></tr>`)).join('');

    const sections = mine.map((e) => {
      const parts = [];
      if (e.react.length) parts.push(`React ${e.react.map((r) => `<code>${esc(r)}</code>`).join(' ')}`);
      if (e.hooks?.length) parts.push(`Hooks ${e.hooks.map((r) => `<code>${esc(r)}</code>`).join(' ')}`);
      if (e.css.length) parts.push(`Classes ${e.css.map((r) => `<code>${esc(r)}</code>`).join(' ')}`);
      return `
  <section class="gd-entry" id="${slug(e.name)}" aria-labelledby="${slug(e.name)}-h">
    <h2 id="${slug(e.name)}-h"><code>${esc(e.name)}</code></h2>
    <p>${prose(cap(e.job))}.</p>
    <div class="gd-cols">
      <div><h3>Use when</h3><ul>${e.use.map((u) => `<li>${prose(u)}</li>`).join('')}</ul></div>
      <div><h3>Not when</h3><ul>${e.not.map((n) => `<li>${prose(cap(n.when))} → ${link(n.use, family)}. ${prose(cap(n.because))}</li>`).join('')}</ul></div>
    </div>
    <p class="gd-meta"><span>Confused with ${e.neighbours.map((n) => link(n, family)).join(', ')}</span>${parts.map((p) => `<span>${p}</span>`).join('')}</p>
    <p class="gd-meta">${e.page
      ? `<a class="btn btn-secondary btn-sm" href="../${esc(e.page.endsWith('/') ? `${e.page}index.html` : e.page)}">See it on the ${e.page.startsWith('templates/') ? 'template' : 'demo page'}${ICON.arrow}</a>`
      : '<span>No demo page yet.</span>'}</p>
  </section>`;
    }).join('');

    out[`design/guidance/${family}.html`] = shell({
      title: `${f.title} — Guidance — ${themeName} Design System`,
      prefix: '../',
      css: GUIDANCE_CSS,
      body: `<main class="doc">
  <div class="docs-head">
    <h1>${esc(f.title)}</h1>
    <p class="lede">Which component to use for ${esc(f.question)}. Find the job, take the component, and read the “not when” before you commit: it names the thing people reach for by mistake, and what to use instead.</p>
  </div>
${screenTable}
  <section class="doc-section" aria-labelledby="at-a-glance">
    <span class="doc-rule" aria-hidden="true"></span>
    <h2 id="at-a-glance">At a glance</h2>
    <div class="table-wrap gd-wrap" style="margin-block-start:var(--space-5)"><table class="table gd-table" role="table">
      <thead role="rowgroup"><tr role="row"><th scope="col" role="columnheader">Job</th><th scope="col" role="columnheader">Use</th><th scope="col" role="columnheader">Not when</th><th scope="col" role="columnheader">Instead</th><th scope="col" role="columnheader">Because</th></tr></thead>
      <tbody role="rowgroup">${glance}
      </tbody></table></div>
  </section>
${sections}
  <p class="gd-other muted">Other guides: ${fams.filter((x) => x !== family).map((x) => `<a href="${x}.html">${esc(FAMILIES[x].title)}</a>`).join(' · ')}</p>
  <p class="muted" style="font-size:var(--text-sm);margin-block-start:var(--space-3)">Generated from the <code>when.ts</code> beside each component — the same data the Claude Code plugin reads.</p>
</main>`,
    });
  }
  return out;
}
