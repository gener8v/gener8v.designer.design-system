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

## Releasing

The four packages are **one system on one version** — a component change usually
touches tokens, the stylesheet and the React layer at once, and independent semver
would leave a consumer working out which `@gener8v/ui` pairs with which
`@gener8v/tokens`.

```bash
pnpm release 0.2.0 --dry     # verify, pack, revert — publishes nothing
pnpm release 0.2.0           # gates, bump, publish, commit, tag
```

Or run the **release** workflow in Actions (manual dispatch, dry-run by default).

All four carry `publishConfig.access: "restricted"`. That is deliberate rather than
relying on npm's default for scoped packages: a stray `--access public` overrides a
default, and publishing brand IP to the public registry is not undoable.

### Where the token goes

**Never in this repository.** `.npmrc` is gitignored so a local one cannot be committed.

| Where | How |
| --- | --- |
| Your machine | `npm config set //registry.npmjs.org/:_authToken=<token>` — writes `~/.npmrc`, outside any repo. Or `npm login --scope=@gener8v`. |
| GitHub Actions | `gh secret set NPM_TOKEN` — the release workflow reads it as `NODE_AUTH_TOKEN`; `actions/setup-node` generates the `.npmrc` at runtime. |

Use an **Automation** token for CI (it bypasses 2FA); a Publish token is fine locally.

## Starting a new project

### 1. Install

The packages are **private** to the `@gener8v` npm org, so the consuming machine needs
auth — the same `~/.npmrc` token used to publish. Nothing goes in the project repo.

```bash
npm i @gener8v/ui @gener8v/tokens @gener8v/icons
```
```tsx
import '@gener8v/ui/styles.css';          // one stylesheet, first
import { Button, Flow, BarChart } from '@gener8v/ui';
```

For that project's **CI**, add its own `NPM_TOKEN` secret and let `actions/setup-node`
write the `.npmrc`:

```yaml
- uses: actions/setup-node@v4
  with:
    node-version: 24
    registry-url: https://registry.npmjs.org
    scope: '@gener8v'
- run: npm ci
  env:
    NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
```

### 2. Teach Claude Code the rules

```
/plugin marketplace add gener8v/gener8v.designer.design-system
```

The repo is private, so the machine needs GitHub access to it. A local path works with no
auth at all: `/plugin marketplace add /path/to/gener8v.designer.design-system`.

Claude then knows the ten hard rules, the class names, and where the templates are —
without the design system repo being open.

### 3. Enforce it

Copy `design/_adherence.oxlintrc.json` into the project and point its lint at it. It
fails on raw hex, raw px, and fonts the system does not provide — which is what stops a
codebase drifting off-brand between reviews.

### 4. Start from a template, not from nothing

`design/templates/` holds designed screens: `app-shell` for an application,
`landing` for marketing, `deck` for a presentation, and three worked flows.
Copy one and replace the content. `examples/` is a packaging fixture, not a starting
point.

## Where Claude picks it up

| Surface | Mechanism | Set up by |
| --- | --- | --- |
| A code repository | the Claude Code plugin + npm packages | `/plugin marketplace add`, `npm i` |
| claude.ai chat and Artifacts | the DesignSync bundle | pushing `design/` (see below) |
| Anything else | `styles.css` on its own | linking the stylesheet |

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
4. **Then call `register_assets`.** The `@dsCard` markers on line 1 of each page are
   *not* enough on their own: after a clean upload the pane reported “No cards yet”, and
   only an explicit `register_assets` call made them appear. The tool documentation
   describes that call as legacy and unnecessary, which is not what actually happens.
   Skipping it leaves a project with every file present and nothing to look at.

### What matters, and what does not

`readme.md` and `styles.css` are load-bearing — about 140 KB of the 590 KB, and the only
two files that change what Claude generates. The component pages drive the visual browser
in the Design System pane; the templates are copy-whole starting points.

**It is a snapshot.** Change a token and the uploaded bundle is stale until re-pushed.
There is no watcher — re-run the steps above after any change to
`packages/tokens/src/theme.mjs` or the component layer.

Only root-level `.html` counts as a “page” in the pane's file picker; everything under
`components/` and `foundations/` shows up as a **card**, which is what you want. Do not
push `design/_responsive.html` — it is a test harness, not a design artifact.

## Rules that are not preferences

Headings never go past weight 500. Actions fill with `--color-action`, not the accent.
`--color-neutral-500` never carries text. State lives in ARIA, not in a class. No
gradients. Never cycle the chart series palette or reuse a status colour as a series. No
dual-axis charts. All six flow states or none. A masked secret is not in the DOM.

`design/readme.md` is the full guide.
