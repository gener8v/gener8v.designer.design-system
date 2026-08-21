#!/usr/bin/env node
// Generates every downstream artifact from packages/tokens/src/theme.mjs.
// Nothing below design/ or packages/tailwind-preset/ is hand-edited.

import { readFileSync, writeFileSync, readdirSync, mkdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { ramp, neutralRamp, hexToRgb, STEPS } from './src/color.mjs';
import { theme, SPACE_BASE, SPACE_EXTRA, TYPE_SCALE, MOTION, CONTAINERS, CONTROL_H } from './src/theme.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, '..', '..');
const p = (...s) => join(ROOT, ...s);
const write = (rel, body) => {
  const abs = p(rel);
  mkdirSync(dirname(abs), { recursive: true });
  writeFileSync(abs, body);
  console.log('  ✓', rel);
};

/* ------------------------------------------------------------------ tokens */

const { palette: pal, semantic, fonts, density, radius } = theme;

const ramps = {
  neutral: neutralRamp(pal.hue, pal.neutralChroma),
  accent: ramp(pal.accent),
  'accent-2': ramp(pal.accent2),
  success: ramp(semantic.success),
  warning: ramp(semantic.warning),
  danger: ramp(semantic.danger),
};

const px = (n) => `${n}px`;
const rgbaFrom = (hex, a) => {
  const [r, g, b] = hexToRgb(hex).map((v) => Math.round(v * 255));
  return `rgba(${r}, ${g}, ${b}, ${a})`;
};
const ink = ramps.neutral[900];

// The token table. `kind` mirrors the reference system exactly — including
// --color-text being registered as "font" rather than "color".
const tokens = [];
const T = (name, value, kind) => { tokens.push({ name, value, kind }); return [name, value]; };

/* --- colour roles (the fixed vocabulary) --- */
T('--color-bg', pal.bg, 'color');
T('--color-surface', pal.surface, 'color');
T('--color-text', pal.text, 'font');
T('--color-accent', pal.accent, 'color');
T('--color-accent-2', pal.accent2, 'color');
T('--color-divider', `color-mix(in srgb, ${ink} 12%, transparent)`, 'color');

/* --- ramps --- */
for (const key of ['neutral', 'accent', 'accent-2']) {
  for (const s of STEPS) T(`--color-${key}-${s}`, ramps[key][s], 'color');
}

/* --- action: what actually fills a button --- */
T('--color-action', ramps.accent[700], 'color');
T('--color-action-hover', ramps.accent[800], 'color');
T('--color-action-active', ramps.accent[900], 'color');

/* --- section band (saturation as presence, at page scale) --- */
T('--color-section', ramps.accent[900], 'color');
T('--color-section-glow', ramps.accent[800], 'color');
T('--color-section-ghost', ramps.accent[700], 'color');

/* --- chart series -----------------------------------------------------
   A categorical palette needs hues our interface deliberately does not have:
   the system keeps chroma low outside the accent, and status colours are
   RESERVED — reusing danger as "series 4" makes a neutral series read as an
   alarm. So the series palette is its own parameter.

   Every value below was produced by the data-viz validator, not chosen: slot 1
   is our accent so charts stay on-brand, slot 3 is our accent-2, and that
   substitution measurably improved worst-case colour-blind separation from
   ΔE 9.1 to 16.3. Under all-pairs forms (scatter, bubble, maps) only the first
   three slots clear the floors — slot 4 lands at ΔE 13.7, below the 15 gate. */
const SERIES_LIGHT = ['#2664EC', '#EB6834', '#289FC1', '#EDA100', '#E87BA4', '#008300', '#4A3AA7', '#E34948'];
const SERIES_DARK  = ['#5C8FF5', '#D95926', '#007D9B', '#C98500', '#D55181', '#008300', '#9085E9', '#E66767'];
SERIES_LIGHT.forEach((hex, i) => T(`--series-${i + 1}`, hex, 'color'));

/* --- extensions: semantic status ramps --- */
// Five steps, not nine: tint (100), border (300), base (600), hover (700),
// pressed (800). The other four existed only to fill a swatch wall.
for (const key of ['success', 'warning', 'danger']) {
  T(`--color-${key}`, ramps[key][600], 'color');
  for (const s of [100, 300, 700, 800]) T(`--color-${key}-${s}`, ramps[key][s], 'color');
}

/* --- type --- */
T('--font-heading', `"${fonts.heading.family}", system-ui, sans-serif`, 'font');
T('--font-heading-weight', String(fonts.headingWeight), 'font');
T('--font-body', `"${fonts.body.family}", system-ui, sans-serif`, 'font');
T('--font-mono', `"${fonts.mono.family}", ui-monospace, SFMono-Regular, Menlo, monospace`, 'font');
for (const [k, [size, lh, tr]] of Object.entries(TYPE_SCALE)) {
  T(`--text-${k}`, size, 'font');
  T(`--leading-${k}`, lh, 'font');
  T(`--tracking-${k}`, tr, 'font');
}

/* --- space --- */
const allSpace = Object.entries({ ...SPACE_BASE, ...SPACE_EXTRA })
  .sort((a, b) => Number(a[0]) - Number(b[0]));
for (const [k, v] of allSpace) T(`--space-${k}`, px(v), 'spacing');

/* --- radius --- */
T('--radius-xs', '2px', 'radius');
T('--radius-sm', '4px', 'radius');
T('--radius-md', `${radius}px`, 'radius');
T('--radius-lg', '10px', 'radius');
T('--radius-full', '9999px', 'radius');

/* --- elevation: soft, low-alpha, large-blur. Airy pages cast faint shadows. --- */
T('--shadow-sm', `0 1px 2px ${rgbaFrom(ink, 0.05)}, 0 0 0 1px ${rgbaFrom(ink, 0.05)}`, 'shadow');
T('--shadow-md', `0 4px 14px -2px ${rgbaFrom(ink, 0.08)}, 0 0 0 1px ${rgbaFrom(ink, 0.05)}`, 'shadow');
T('--shadow-lg', `0 18px 44px -10px ${rgbaFrom(ink, 0.14)}, 0 0 0 1px ${rgbaFrom(ink, 0.05)}`, 'shadow');

/* --- control heights --- */
for (const [k, v] of Object.entries(CONTROL_H)) T(`--control-h-${k}`, `${v}px`, 'size');

/* --- motion, containers, focus --- */
for (const [k, v] of Object.entries(MOTION)) T(k, v, 'motion');
for (const [k, v] of Object.entries(CONTAINERS)) T(k, v, 'size');
T('--ring-width', '2px', 'size');
T('--ring-offset', '2px', 'size');
T('--ring-color', 'var(--color-accent)', 'color');

/* --------------------------------------------------------------- styles.css */

const googleFamilies = [
  `Inter:wght@${fonts.heading.weights.join(';')}`,
  `IBM+Plex+Mono:wght@${fonts.mono.weights.join(';')}`,
];

const section = (label) => `\n  /* ${label} */\n`;
const emit = (list) => list.map((t) => `  ${t.name}: ${t.value};`).join('\n');
const byKind = (...kinds) => tokens.filter((t) => kinds.includes(t.kind));
const pick = (re) => tokens.filter((t) => re.test(t.name));

const tokenBlock = `:root {
${section('Colour roles').trim()}
${emit(pick(/^--color-(bg|surface|text|accent|accent-2|divider)$/))}
${section('Neutral ramp')}${emit(pick(/^--color-neutral-\d/))}
${section('Accent ramp')}${emit(pick(/^--color-accent-\d00$/))}
${section('Accent-2 ramp')}${emit(pick(/^--color-accent-2-\d00$/))}
${section('Action')}${emit(pick(/^--color-action/))}
${section('Chart series')}${emit(pick(/^--series-\d/))}
${section('Section band')}${emit(pick(/^--color-section/))}
${section('Status')}${emit(pick(/^--color-(success|warning|danger)/))}
${section('Type')}${emit(pick(/^--font-/))}
${emit(pick(/^--(text|leading|tracking)-/))}
${section('Space')}${emit(byKind('spacing'))}
${section('Radius')}${emit(byKind('radius'))}
${section('Elevation')}${emit(byKind('shadow'))}
${section('Motion')}${emit(byKind('motion'))}
${section('Controls')}${emit(pick(/^--control-h-/))}
${section('Layout')}${emit(pick(/^--container-/))}
${section('Focus')}${emit(pick(/^--ring-/))}
}
`;

const partials = [];
const basePath = p('packages/tokens/src/base.css');
if (existsSync(basePath)) partials.push(readFileSync(basePath, 'utf8'));
const compDir = p('packages/tokens/src/components');
if (existsSync(compDir)) {
  for (const f of readdirSync(compDir).filter((f) => f.endsWith('.css')).sort()) {
    partials.push(readFileSync(join(compDir, f), 'utf8'));
  }
}

const seriesDark = SERIES_DARK.map((hex, i) => `    --series-${i + 1}: ${hex};`).join('\n');
const darkSeriesBlock = `
/* Chart series in a dark host. The system's own ground stays light — these
   exist so a chart embedded in a dark application still validates. Steps are
   the same eight hues re-stepped for a dark surface, not an automatic flip,
   and all eight clear 3:1 against #182030. */
@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) {
${seriesDark}
  }
}
:root[data-theme="dark"] {
${seriesDark}
}
`;

const css = `/* ${theme.name} design system — GENERATED by packages/tokens/build.mjs.
   Do not edit. Change packages/tokens/src/theme.mjs (tokens),
   src/base.css (base layer) or src/components/*.css (component layer). */

@import url('https://fonts.googleapis.com/css2?family=${googleFamilies.join('&family=')}&display=swap');

${tokenBlock}
${darkSeriesBlock}
${partials.join('\n')}`;

write('design/styles.css', css);
// The package ships the same sheet. Generated, not copied — a hand-copied
// duplicate is exactly the drift the whole build exists to prevent.
write('packages/tokens/styles.css', css);

/* --------------------------------------------------------------- theme.json */

write('design/theme.json', JSON.stringify({
  name: theme.name,
  palette: {
    hue: pal.hue, band: pal.band, scheme: pal.scheme, sat: pal.sat,
    pin: pal.pin, bg: pal.bg, surface: pal.surface, text: pal.text,
    accent: pal.accent, accent2: pal.accent2,
  },
  fonts: {
    heading: fonts.heading, body: fonts.body, headingWeight: fonts.headingWeight,
  },
  density, radius,
  layoutStyle: theme.layoutStyle,
  imageTreatment: theme.imageTreatment,
  photo: theme.photo,
  iconSet: theme.iconSet,
  buttonStyle: theme.buttonStyle,
}, null, 2) + '\n');

/* --------------------------------------------------- _adherence.oxlintrc.json */

const families = [fonts.heading.family, fonts.body.family, fonts.mono.family]
  .filter((v, i, a) => a.indexOf(v) === i);
const names = tokens.map((t) => t.name).sort();
const kinds = {};
for (const t of tokens) kinds[t.name] = t.kind;

write('design/_adherence.oxlintrc.json', JSON.stringify({
  plugins: ['react', 'import'],
  rules: {
    'react/forbid-elements': ['warn', { forbid: [] }],
    'no-restricted-imports': ['warn', { patterns: [] }],
    'no-restricted-syntax': ['warn',
      { selector: 'Literal[value=/#[0-9a-fA-F]{3,8}\\b/]',
        message: 'Raw hex color — use a design-system color token via var().' },
      { selector: 'Literal[value=/\\b\\d+px\\b/]',
        message: 'Raw px value — use a design-system spacing token via var().' },
      { selector: `Literal[value=/font-family\\s*:\\s*(?!['\\"]?(?:${families.map((f) => f.replace(/ /g, '\\\\s')).join('|')}))/i]`,
        message: `Font not provided by the design system. Available: ${families.join(', ')}.` },
    ],
  },
  overrides: [{ files: ['**/index.js'], rules: { 'no-restricted-imports': 'off' } }],
  'x-omelette': { components: {}, tokens: names, tokenKinds: kinds, fontFamilies: families },
}, null, 2) + '\n');

/* ------------------------------------------------------- tokens package dist */

const jsonTokens = Object.fromEntries(tokens.map((t) => [t.name, t.value]));
write('packages/tokens/dist/tokens.mjs',
  `// GENERATED — do not edit.\nexport const tokens = ${JSON.stringify(jsonTokens, null, 2)};\nexport default tokens;\n`);
write('packages/tokens/dist/tokens.d.ts',
  `// GENERATED — do not edit.\nexport declare const tokens: {\n${
    tokens.map((t) => `  ${JSON.stringify(t.name)}: string;`).join('\n')}\n};\nexport default tokens;\n`);
write('packages/tokens/dist/tokens.json', JSON.stringify(jsonTokens, null, 2) + '\n');

/* ------------------------------------------------------------ tailwind v4 */

const twSpace = [...byKind('spacing')].map((t) => `  --spacing-${t.name.replace('--space-', '')}: ${t.value};`);
const twColor = tokens.filter((t) => t.kind === 'color' && t.name.startsWith('--color-') && t.value.startsWith('#'))
  .map((t) => `  ${t.name}: ${t.value};`);
write('packages/tailwind-preset/theme.css', `/* GENERATED — do not edit. Tailwind v4 theme over the same tokens.
   Usage:  @import "tailwindcss";  @import "@gener8v/tailwind-preset/theme.css"; */
@theme {
${twColor.join('\n')}
${twSpace.join('\n')}
${Object.entries(TYPE_SCALE).map(([k, [s]]) => `  --text-${k}: ${s};`).join('\n')}
  --font-sans: "${fonts.body.family}", system-ui, sans-serif;
  --font-mono: "${fonts.mono.family}", ui-monospace, monospace;
${byKind('radius').map((t) => `  --radius-${t.name.replace('--radius-', '')}: ${t.value};`).join('\n')}
${byKind('shadow').map((t) => `  --shadow-${t.name.replace('--shadow-', '')}: ${t.value};`).join('\n')}
${byKind('motion').map((t) => `  ${t.name}: ${t.value};`).join('\n')}
}
`);

/* ------------------------------------------------------------- figma (DTCG) */

const dtcgKind = { color: 'color', spacing: 'dimension', radius: 'dimension', shadow: 'shadow', font: 'fontFamily', motion: 'duration', size: 'dimension' };
const dtcg = {};
for (const t of tokens) {
  const [, group, ...rest] = t.name.split('-');
  const path = rest.length ? [group, rest.join('-')] : [group, 'DEFAULT'];
  dtcg[path[0]] ??= {};
  dtcg[path[0]][path[1]] = { $value: t.value, $type: dtcgKind[t.kind] ?? 'other' };
}
write('figma/plugin/tokens.json', JSON.stringify({ $description: `${theme.name} design tokens (DTCG)`, ...dtcg }, null, 2) + '\n');

console.log(`\n${tokens.length} tokens generated.`);
