# GENER8V design system

A light, airy interface for delivering AI into regulated, governed and auditable
environments. One token source, one stylesheet, and a React library that renders the
**same class names** as the static HTML — so markup ports either direction without a
visual rewrite.

```
pnpm install
pnpm dev      # the design lab at localhost:4321
pnpm check    # every gate below
```

## What is here

Six things are generated from one. Knowing which is which is the difference between a
change that holds and one CI reverts.

| Path | What it is | Authored or generated |
| --- | --- | --- |
| `packages/tokens/src/theme.mjs` | **The source of truth.** 144 tokens | **Authored** — start here |
| `packages/tokens/src/base.css` | Reset, base type, focus ring, layout utilities | **Authored** |
| `packages/tokens/src/components/*.css` | The component layer, one file per family | **Authored** |
| `design/components/*.html` | Every component rendered, as plain HTML | **Authored** |
| `design/templates/*/` | Designed screens to copy | **Authored** |
| `design/styles.css` | The only stylesheet | Generated |
| `design/foundations/*.html`, `design/index.html` | Foundations pages, home | Generated |
| `design/theme.json`, `design/_adherence.oxlintrc.json` | Machine records | Generated |
| `packages/tokens/dist/`, `packages/tokens/styles.css` | The token package | Generated |
| `packages/tailwind-preset/theme.css` | Tailwind `@theme` | Generated |
| `figma/plugin/tokens.json` | DTCG for Figma | Generated |
| `skills/…/references/components.md` | The class index the skill reads | Generated |
| `packages/ui/src/*/when.ts`, `packages/ui/src/*.when.ts` | Which component for which job, and which not — one beside each component | **Authored** |
| `skills/…/references/choosing/*.md`, the router in `SKILL.md` | The choosing guide, per family, cut from the `when.ts` files by `pnpm build:choosing` | Generated |
| `packages/ui/src/` | React components | **Authored** |
| `packages/icons/src/` | 18 Phosphor glyphs | **Authored** (extracted) |
| `examples/consumer-check/` | Packaging fixture — **not** a design reference | **Authored** |
| `docs/specs/`, `docs/gap-analysis.md`, `docs/adoption-prompt.md` | Reasoning and handover | **Authored** |

Each package carries its own README explaining its role: [`tokens`](packages/tokens/README.md)
· [`ui`](packages/ui/README.md) · [`icons`](packages/icons/README.md) ·
[`tailwind-preset`](packages/tailwind-preset/README.md).

## Working in this repository

Four things are true here that are not true of most design systems, and each one will bite
a change that ignores it.

**1 · One source, six outputs.** Editing `design/styles.css` does nothing — the next build
overwrites it, and CI fails the reproducibility check. Change `packages/tokens/src/theme.mjs`
(values) or `packages/tokens/src/components/*.css` (the component layer), then rebuild.

**2 · The static HTML and the React components share class names.** `design/components/buttons.html`
and `packages/ui/src/Button` both produce `class="btn btn-primary"`. This is enforced:
`pnpm lint:parity` fails if the HTML uses a class no component can emit. Adding a component
means touching four places — the CSS, a preview page, the React component, and a `when.ts`
beside it saying what it is for and when not to use it — or a gate stops you.

**3 · `design/` is the lab *and* a shipped artifact.** Those pages are served locally for
review, pushed to Claude's design system, and are what the React port is derived from. They
are not throwaway demos.

**4 · State lives in ARIA.** `aria-current`, `aria-selected`, `aria-expanded`, `aria-invalid`,
`aria-sort` — the CSS styles the attribute. There is no `.is-active` class anywhere, and
adding one means the visual and the accessibility tree can disagree.

The design rules themselves — what makes something on-brand — are in
**[`design/readme.md`](design/readme.md)**. Read that before building a screen. It is
lint-gated against the stylesheet, so it cannot claim a class that does not exist.

## The gates

| Gate | What it prevents |
| --- | --- |
| `lint:tokens` | A token in the stylesheet that nothing registers, a `var()` with no fallback that resolves to nothing, a readme that names a class the CSS does not have, a forced-colors or print block that stops covering state-by-colour components |
| `lint:contrast` | Any text or chrome pair falling under WCAG 2.2 AA, computed in OKLCH from the real ramps |
| `lint:palette` | The chart series palette drifting out of colour-blind separation — including a check that the documented three-series cap for scatter/map forms is still correct |
| `lint:parity` | The static HTML using a class no React component can emit |
| `lint:choosing` | An exported component or an indexed class family with no `when.ts` entry, a "not when" or a neighbour naming a component that does not exist, or a stale `references/choosing/*.md` or `SKILL.md` router |
| `smoke` | The **built** package failing to render, or an ARIA reference not resolving |
| `verify:consumer` | A broken `exports` map, a missing `files` entry, or an undefined export reaching an engagement — it resolves the packages by name from outside the workspace and **executes**, which the in-repo tests cannot |
| `test` | 400 tests: keyboard contracts, focus management, axe across every component family, the product language rules, and a harness test proving axe can actually fail |
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

All four are **public** on npm under the MIT license, and carry `publishConfig.access: "public"`
explicitly. A scoped package defaults to restricted, so without it the first publish of a new
package would fail for anyone not in the `@gener8v` org; stating it makes the intent unmissable.

### Where the publish token goes

Only publishing needs a token. Installing needs nothing.

**Never in this repository.** `.npmrc` is gitignored so a local one cannot be committed.

| Where | How |
| --- | --- |
| Your machine | `npm config set //registry.npmjs.org/:_authToken=<token>` — writes `~/.npmrc`, outside any repo. Or `npm login --scope=@gener8v`. |
| GitHub Actions | `gh secret set NPM_TOKEN` — the release workflow reads it as `NODE_AUTH_TOKEN`; `actions/setup-node` generates the `.npmrc` at runtime. |

Use an **Automation** token for CI (it bypasses 2FA); a Publish token is fine locally.

## Who consumes this

**One product, not two.**
[gener8v.product-owner.traisee](https://github.com/gener8v/gener8v.product-owner.traisee) — the
delivery record — imports `@gener8v/ui/styles.css` and `@gener8v/tailwind-preset/theme.css` and
defines no tokens of its own.

**And one that does not.**
[gener8v.product-owner.triage](https://github.com/gener8v/gener8v.product-owner.triage), the engine
console, is on Radix, lucide-react and recharts, with its own tokens in its own `index.css`. It
depends on nothing published here.

That is worth stating plainly because this file said the opposite until 2026-09-04, and the same
wrong sentence had reached two other repositories. The claim was inherited from a handoff note
about the record and generalised to "both front ends" without anybody checking the second one's
`package.json` — which names no `@gener8v` package at all.

Whether Triage should adopt the system is a real question and an open one. What it is not is
already true.

**A release does not reach a consumer on its own.** Consumers pin by caret on a `0.x` version, and
a caret on `0.x` pins MINOR — `^0.46.0` will not take `0.47.0`. Releasing is therefore two steps:
publish here, then bump the consumer. Four releases once sat unconsumed because only the first was
done.

## The product language rules

`packages/ui/src/language.ts` exports `problems(text, surface)`, which reads a label and returns
which of the eleven rules it breaks — grammatical form per surface, no gerunds on actionable
surfaces, no articles, Title Case on buttons and column headers, sentence case elsewhere.

It is a **check, not a document**, because a style guide nothing runs is a style guide nobody
follows. Rule 10 is the one that makes it usable: when a rule and clarity conflict, clarity wins and
the exception gets logged. A consumer runs `problems()` over its own labels and keeps a named
exception list; a list that grows is evidence the rule needs revising, not that the labels do.

## Starting a new project

### 1. Install

The packages are **public** on npm (MIT). No token, no `.npmrc`, no org membership.

```bash
npm i @gener8v/ui @gener8v/tokens @gener8v/icons
```
```tsx
import '@gener8v/ui/styles.css';          // one stylesheet, first
import { Button, Flow, BarChart } from '@gener8v/ui';
```

CI needs no secret either — a plain `npm ci` resolves them.

### 2. Teach Claude Code the rules

```
/plugin marketplace add gener8v/gener8v.designer.design-system
```

The repo is public, so this needs no GitHub access. A local checkout works too:
`/plugin marketplace add /path/to/gener8v.designer.design-system`.

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

## License

[MIT](LICENSE) — the repository and all four `@gener8v/*` packages. Use it, fork it, ship it.
