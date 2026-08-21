# GENER8V design system

A light, airy interface for delivering AI into regulated, governed and auditable
environments. One token source, one stylesheet, and a React library that renders the
**same class names** as the static HTML — so markup ports either direction without a
visual rewrite.

```
pnpm install
pnpm dev      # the design lab at localhost:4321
pnpm check    # seven gates
```

## What is here

```
design/            the lab AND the deliverable — static HTML, served, reviewed, exported
packages/tokens/   one source → CSS, TypeScript, Tailwind, DTCG, adherence config
packages/ui/       React: 183 exports, same classes as the HTML
packages/icons/    the 18-icon Phosphor subset the system actually uses
packages/tailwind-preset/   Tailwind v4 @theme over the same tokens
examples/          a packaging fixture — NOT a design reference
skills/            the Claude Code skill
figma/plugin/      DTCG tokens for the Figma generator
docs/              component specs and the workflow gap analysis
```

## Architecture

`packages/tokens/src/theme.mjs` is canonical. One build fans out, so drift is structurally
impossible rather than merely discouraged:

```
theme.mjs ──▶ design/styles.css            the only stylesheet
          ──▶ design/theme.json
          ──▶ design/_adherence.oxlintrc.json
          ──▶ packages/tokens/dist/tokens.{mjs,d.ts,json}
          ──▶ packages/tailwind-preset/theme.css
          ──▶ figma/plugin/tokens.json
          ──▶ skills/…/references/components.md
```

Nothing below `design/` is hand-edited. `git diff --exit-code design/` proves it.

## The gates

| Gate | What it prevents |
| --- | --- |
| `lint:tokens` | A token in the stylesheet that nothing registers, a `var()` with no fallback that resolves to nothing, a readme that names a class the CSS does not have, a forced-colors or print block that stops covering state-by-colour components |
| `lint:contrast` | Any text or chrome pair falling under WCAG 2.2 AA, computed in OKLCH from the real ramps |
| `lint:palette` | The chart series palette drifting out of colour-blind separation — including a check that the documented three-series cap for scatter/map forms is still correct |
| `lint:parity` | The static HTML using a class no React component can emit |
| `smoke` | The **built** package failing to render, or an ARIA reference not resolving |
| `verify:consumer` | A broken `exports` map, a missing `files` entry, or an undefined export reaching an engagement — it resolves the packages by name from outside the workspace and **executes**, which the in-repo tests cannot |
| `test` | 118 tests: keyboard contracts, focus management, axe across every component family, and a harness test proving axe can actually fail |
| `bench:graph` | The knowledge graph missing its 60fps budget, or the layout diverging |

Plus a responsive harness (`design/_responsive.html`) that measures every page at a true
375px viewport inside an iframe, because Chrome will not size a window that narrow.

## Using it in an engagement

```bash
npm i @gener8v/ui @gener8v/tokens @gener8v/icons
```
```tsx
import '@gener8v/ui/styles.css';
import { Button, Flow, BarChart } from '@gener8v/ui';
```

For Claude Code:

```
/plugin marketplace add gener8v/design-system
```

Copy `design/_adherence.oxlintrc.json` into a client repo to fail its lint on raw hex
values, raw px, and fonts the system does not provide.

## Publishing to Claude's design system (DesignSync)

Two different surfaces, and they need different things:

| Surface | Mechanism | Covers |
| --- | --- | --- |
| A code repository | the Claude Code plugin, already installed | Writing components, editing an app, importing `@gener8v/ui` |
| claude.ai chat and Artifacts | **the DesignSync push** | Mockups, one-off pages, generated HTML — where no repo is present |

Pushing uploads `design/` — 37 files, ~590 KB — to a **design-system project you own**
on claude.ai. It is an upload to your own private account: not a deploy, nothing public,
and deleting the project removes it.

The effect: ask Claude for a screen in a chat and it emits `<button class="btn
btn-primary">` against your stylesheet instead of inventing a palette. That markup drops
straight into a `@gener8v/ui` app, because the React components render the same classes.

### To push

1. `pnpm build:tokens` — the bundle is generated; never hand-edit it.
2. `pnpm check` — do not publish a bundle that does not pass its own gates.
3. Ask Claude Code to push it. It uses the `DesignSync` tool: `list_projects` to find the
   target, `finalize_plan` to lock the exact paths (you approve that list), then
   `write_files`. Target a project of type `PROJECT_TYPE_DESIGN_SYSTEM` — pushing to an
   ordinary project does not make it one, and the type cannot be changed afterwards.

### What matters, and what does not

`readme.md` and `styles.css` are load-bearing — about 140 KB of the 590 KB, and the only
two files that change what Claude generates. The component pages drive the visual browser
in the Design System pane; the templates are copy-whole starting points.

**It is a snapshot.** Change a token and the uploaded bundle is stale until re-pushed.
There is no watcher — re-run the three steps above after any change to
`packages/tokens/src/theme.mjs` or the component layer.

## Rules that are not preferences

Headings never go past weight 500. Actions fill with `--color-action`, not the accent.
`--color-neutral-500` never carries text. State lives in ARIA, not in a class. No
gradients. Never cycle the chart series palette or reuse a status colour as a series. No
dual-axis charts. All six flow states or none. A masked secret is not in the DOM.

`design/readme.md` is the full guide.
