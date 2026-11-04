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
export function shell({ title, prefix, description, css = '', body }) {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${esc(title)}</title>
${description ? `<meta name="description" content="${esc(description)}" />\n` : ''}<link rel="stylesheet" href="${prefix}styles.css" />
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

/** Card grid. `cols` is the column count at full width; it halves, then goes to one. Every count
 *  used divides its list, or the first item is featured across two columns so the rows fill. */
const cards = (items, cols, featured = false) => `<div class="ov-grid" style="--cols:${cols}">${items.map((c, i) => `
  <a class="card card-interactive card-pad-sm${featured && i === 0 ? ' ov-featured' : ''}" href="${esc(c.path)}">
    <p class="card-title">${esc(c.title)}</p>
    <p class="card-body">${esc(c.subtitle)}</p>
  </a>`).join('')}</div>`;

const OVERVIEW_CSS = `
html[data-docs="page"] body > main.ov { margin: 0; max-inline-size: none; }
.ov-wrap { max-inline-size: calc(var(--space-4) * 72); margin-inline: auto; padding-inline: var(--space-6); }
/* THE ATMOSPHERE gener8v.com wears: a light ground washed with soft blue and a little teal. */
.ov-hero {
  position: relative;
  overflow: hidden;
  padding-block: var(--space-20) var(--space-20);
  background:
    radial-gradient(60% 70% at 85% 10%, color-mix(in srgb, var(--color-accent-300) 45%, transparent), transparent 70%),
    radial-gradient(50% 60% at 40% 90%, color-mix(in srgb, var(--color-accent-2-300) 30%, transparent), transparent 70%),
    linear-gradient(180deg, color-mix(in srgb, var(--color-accent-100) 70%, var(--color-bg)), var(--color-bg));
  border-block-end: 1px solid var(--color-divider);
}
.ov-hero-grid { display: grid; grid-template-columns: minmax(0, 1.05fr) minmax(0, 1fr); gap: var(--space-12); align-items: center; }
/* The heavy headline is gener8v.com's, and is this page's alone: the system's own headings stay at 500. */
.ov-title { font-size: clamp(var(--text-4xl), 5vw, calc(var(--text-4xl) * 1.6)); font-weight: 600; letter-spacing: -0.025em; line-height: 1.05; color: var(--color-neutral-900); }
.ov-grad { background: linear-gradient(90deg, var(--color-accent-700), var(--color-accent-2-700)); -webkit-background-clip: text; background-clip: text; color: transparent; }
.ov-lede { margin-block-start: var(--space-6); font-size: var(--text-xl); line-height: 1.5; color: var(--color-neutral-700); max-inline-size: 34ch; }
.ov-lede strong { color: var(--color-neutral-900); font-weight: 600; }
.ov-ctas { display: flex; flex-wrap: wrap; gap: var(--space-3); margin-block-start: var(--space-8); }
.ov-install { display: inline-flex; align-items: center; gap: var(--space-3); margin-block-start: var(--space-6); padding: var(--space-2) var(--space-4); border: 1px solid var(--color-divider); border-radius: var(--radius-full); background: color-mix(in srgb, var(--color-bg) 70%, transparent); font-family: var(--font-mono); font-size: var(--text-sm); color: var(--color-neutral-800); max-inline-size: 100%; overflow-x: auto; white-space: nowrap; }
.ov-install span { color: var(--color-neutral-600); user-select: none; }
.ov-specimen { box-shadow: var(--shadow-lg); background: var(--color-bg); }
.ov-specimen .panel-body { display: grid; gap: var(--space-5); }
.ov-specimen-actions { display: flex; justify-content: flex-end; gap: var(--space-3); flex-wrap: wrap; }
.ov-caption { margin-block-start: var(--space-3); font-size: var(--text-xs); color: var(--color-neutral-600); text-align: end; }
.ov-section { padding-block: var(--space-20) 0; }
.ov-section h2 { font-size: var(--text-3xl); font-weight: 600; letter-spacing: -0.015em; }
.ov-section-lede { margin-block-start: var(--space-3); color: var(--color-neutral-700); max-inline-size: 60ch; }
.ov-reasons { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: var(--space-5); margin-block-start: var(--space-8); }
.ov-reason svg { inline-size: var(--space-6); block-size: var(--space-6); color: var(--color-accent-700); }
.ov-reason .card-title { margin-block-start: var(--space-4); font-size: var(--text-lg); }
.ov-reason .card-body { margin-block-start: var(--space-2); }
.ov-start { display: grid; grid-template-columns: minmax(0, 1.4fr) minmax(0, 1fr); gap: var(--space-12); align-items: start; }
.ov-browse h3 { font-size: var(--text-xl); margin-block: var(--space-12) var(--space-4); display: flex; align-items: baseline; gap: var(--space-3); }
.ov-browse h3 .muted { font-size: var(--text-sm); font-weight: 400; }
.ov-grid { display: grid; grid-template-columns: repeat(var(--cols), minmax(0, 1fr)); gap: var(--space-4); }
.ov-grid .card-title { font-size: var(--text-base); }
.ov-grid .card-body { margin-block-start: var(--space-1); font-size: var(--text-sm); }
.ov-featured { grid-column: span 2; background: color-mix(in srgb, var(--color-accent-100) 55%, var(--color-bg)); }
.ov-foot { margin-block-start: var(--space-24); padding-block: var(--space-8); border-block-start: 1px solid var(--color-divider); font-size: var(--text-sm); color: var(--color-neutral-600); }
.ov-foot a { color: var(--color-neutral-800); }
@media (max-width: 1180px) {
  .ov-hero-grid, .ov-start { grid-template-columns: minmax(0, 1fr); }
  .ov-lede { max-inline-size: 48ch; }
}
@media (max-width: 1180px) { .ov-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
@media (max-width: 900px) { .ov-reasons { grid-template-columns: minmax(0, 1fr); } }
@media (max-width: 560px) {
  .ov-hero { padding-block: var(--space-12); }
  .ov-grid { grid-template-columns: minmax(0, 1fr); }
  .ov-featured { grid-column: auto; }
  .ov-specimen .stat-row { grid-auto-flow: row; }
  .ov-specimen .stat-row > .stat { padding-inline: 0; border-inline-start: 0; }
}
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
            <button type="button" class="btn btn-secondary">Request changes</button>
            <button type="button" class="btn btn-primary">Approve release</button>
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
  return shell({
    title: `${themeName} Design System`,
    prefix: '',
    description: 'Open-source tokens, React components and page templates for AI products in regulated, governed and auditable environments.',
    css: OVERVIEW_CSS,
    body: `<main class="ov">
  <section class="ov-hero" aria-labelledby="ov-title">
    <div class="ov-wrap ov-hero-grid">
      <div>
        <h1 class="ov-title" id="ov-title">${themeName} <span class="ov-grad">Design System</span></h1>
        <p class="ov-lede">Open-source tokens, React components and page templates for AI products in
          <strong>regulated, governed and auditable</strong> environments.</p>
        <div class="ov-ctas">
          <a class="btn btn-primary btn-lg" href="#components">Browse components${ICON.arrow}</a>
          <a class="btn btn-secondary btn-lg" href="get-started.html">Get started</a>
        </div>
        <p class="ov-install"><span aria-hidden="true">$</span><code>${INSTALL}</code></p>
      </div>
      <figure>
        ${specimen()}
        <figcaption class="ov-caption">Rendered live with the system's own classes — nothing on this panel is a picture.</figcaption>
      </figure>
    </div>
  </section>

  <section class="ov-section" aria-labelledby="ov-why">
    <div class="ov-wrap">
      <span class="doc-rule" aria-hidden="true"></span>
      <h2 id="ov-why">Why this system</h2>
      <div class="ov-reasons">
        <div class="card ov-reason">${ICON.access}
          <p class="card-title">Accessible by default</p>
          <p class="card-body">Every text pair is measured for contrast in light and dark, and the components run under axe — both gate CI, so a regression fails the build rather than reaching a user.</p>
        </div>
        <div class="card ov-reason">${ICON.tokens}
          <p class="card-title">One token source</p>
          <p class="card-body">Colour, type, space and motion are defined once and emitted as CSS variables, TypeScript, a Tailwind preset and DTCG for design tools.</p>
        </div>
        <div class="card ov-reason">${ICON.agent}
          <p class="card-title">Built for AI-assisted delivery</p>
          <p class="card-body">A Claude Code plugin teaches the rules and the class names, and a which-component-for-which-job guide says what to reach for — and what not to.</p>
        </div>
      </div>
    </div>
  </section>

  <section class="ov-section" aria-labelledby="ov-start">
    <div class="ov-wrap ov-start">
      <div>
        <span class="doc-rule" aria-hidden="true"></span>
        <h2 id="ov-start">Get started</h2>
        <ol class="doc-steps">
          <li><div><h3>Install</h3><p>Public on npm under MIT. No token, no account.</p>
            <pre class="code"><code data-language="sh">${INSTALL}</code></pre></div></li>
          <li><div><h3>Import</h3><p>One stylesheet first, then the components.</p>
            <pre class="code"><code data-language="tsx">import '@gener8v/ui/styles.css';
import { Button, Table, Dialog } from '@gener8v/ui';</code></pre></div></li>
          <li><div><h3>Add the Claude Code plugin</h3><p>It teaches Claude the rules, the class names, the templates and which component fits which job.</p>
            <pre class="code"><code data-language="sh">/plugin marketplace add gener8v/gener8v.designer.design-system</code></pre></div></li>
        </ol>
        <p style="margin-block-start:var(--space-8)"><a class="btn btn-secondary" href="get-started.html">The full guide${ICON.arrow}</a></p>
      </div>
      <div>
        <h3 style="font-size:var(--text-lg)">Packages</h3>
        <ul class="doc-pkgs" style="grid-template-columns:minmax(0,1fr)">${PACKAGES.map(([n, d]) => `
          <li><a href="https://www.npmjs.com/package/${n}">${n}</a><p>${d}</p></li>`).join('')}
        </ul>
        <p class="muted" style="margin-block-start:var(--space-6);font-size:var(--text-sm)">Source, issues and releases on
          <a href="${LINKS.github}">GitHub</a>. Open source under the <a href="${LINKS.license}">MIT licence</a>.</p>
      </div>
    </div>
  </section>

  <section class="ov-section ov-browse" id="browse" aria-labelledby="ov-browse">
    <div class="ov-wrap">
      <span class="doc-rule" aria-hidden="true"></span>
      <h2 id="ov-browse">Browse</h2>
      <p class="ov-section-lede">Every page shows the real markup — view the source and copy it. The React components in <code>@gener8v/ui</code> render the same class names.</p>

      <h3 id="foundations">Foundations <span class="muted">${foundations.length}</span></h3>
      ${cards(foundations, 3)}

      <h3 id="components">Components <span class="muted">${components.length}</span></h3>
      ${cards(components, 4)}

      <h3 id="templates">Templates <span class="muted">${templates.length} · open full screen</span></h3>
      ${cards(templates, 4, true)}

      <h3 id="guidance">Guidance <span class="muted">which component for which job</span></h3>
      ${cards(guidance, 4)}

      <footer class="ov-foot">${themeName} design system · <a href="${LINKS.site}">gener8v.com</a> · <a href="${LINKS.github}">GitHub</a> · MIT</footer>
    </div>
  </section>
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
.gd-table td, .gd-table th { white-space: normal; vertical-align: top; }
.gd-table td:first-child { min-inline-size: 14ch; }
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
    <div class="table-wrap" style="margin-block-start:var(--space-5)"><table class="table gd-table">
      <thead><tr><th scope="col">Screen</th><th scope="col">Start from</th><th scope="col">Uses</th><th scope="col">When</th></tr></thead>
      <tbody>${screens.map((s) => `
        <tr><td>${prose(cap(s.screen))}</td><td><a href="../${s.template}index.html">${esc(s.template.replace(/^templates\/|\/$/g, ''))}</a></td><td>${s.implies.map((i) => link(i, family)).join(', ')}</td><td>${prose(s.note)}</td></tr>`).join('')}
      </tbody></table></div>
  </section>` : '';

    const glance = mine.flatMap((e) => e.not.map((n, i) => `
        <tr>${i === 0 ? `<td rowspan="${e.not.length}">${prose(cap(e.job))}</td><td rowspan="${e.not.length}"><a href="#${slug(e.name)}"><code>${esc(e.name)}</code></a></td>` : ''}<td>${prose(cap(n.when))}</td><td>${link(n.use, family)}</td><td>${prose(cap(n.because))}</td></tr>`)).join('');

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
    <div class="table-wrap" style="margin-block-start:var(--space-5)"><table class="table gd-table">
      <thead><tr><th scope="col">Job</th><th scope="col">Use</th><th scope="col">Not when</th><th scope="col">Instead</th><th scope="col">Because</th></tr></thead>
      <tbody>${glance}
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
