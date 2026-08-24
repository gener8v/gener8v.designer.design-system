# @gener8v/tokens

The source of truth for the GENER8V design system. Everything else in the repository is
generated from one file here.

```bash
npm i @gener8v/tokens      # private to the @gener8v npm org
```
```ts
import tokens from '@gener8v/tokens';
tokens['--color-action'];      // '#1547B7'
tokens['--control-h-md'];      // '44px'
```
```css
@import '@gener8v/tokens/styles.css';   /* the whole stylesheet, if not using @gener8v/ui */
```

## What generates what

`src/theme.mjs` is the only file anyone edits. `pnpm build:tokens` fans it out:

```
src/theme.mjs
  ├──▶ design/styles.css                    the only stylesheet — tokens + component layer
  ├──▶ packages/tokens/styles.css           the same sheet, shipped in this package
  ├──▶ dist/tokens.{mjs,d.ts,json}          the same values as JS, for logic and tests
  ├──▶ design/theme.json                    machine-readable record of the parameters
  ├──▶ design/_adherence.oxlintrc.json      lint config a consuming repo can enforce
  ├──▶ packages/tailwind-preset/theme.css   the same values as Tailwind utilities
  ├──▶ figma/plugin/tokens.json             DTCG, for the Figma generator
  ├──▶ design/foundations/*.html            the foundations pages, from the real values
  ├──▶ design/index.html                    the home page
  └──▶ skills/…/references/components.md    the class index the Claude skill reads
```

**Never hand-edit any of those.** CI rebuilds and fails if a generated file differs, so a
hand-edit cannot reach `main`. Change `src/theme.mjs`, or the component CSS in
`src/components/`, and rebuild.

## What is in here

| File | What it holds |
| --- | --- |
| `src/theme.mjs` | Palette pins, fonts, density, radius, the space and type scales, control heights |
| `src/color.mjs` | The OKLCH engine — ramp generation, gamut mapping, WCAG contrast. No dependencies |
| `src/base.css` | Reset, base typography, focus ring, layout primitives, atmosphere utilities |
| `src/components/*.css` | The component layer, one file per family. `zz-adaptive.css` is last on purpose — it holds the forced-colors and print overrides |
| `build.mjs` | Emits tokens, the stylesheet, theme.json, the adherence config |
| `build-pages.mjs` | Emits the foundations pages, home page, responsive harness and skill reference |

## How the ramps work

Every ramp is generated in OKLCH on one shared perceptual lightness scale, so the same step
of any ramp carries the same visual weight. Two details are load-bearing:

**Neutral chroma rises toward the dark end.** `--color-neutral-100` is almost white while
`-900` is distinctly cool. That is what keeps a light interface from reading as undesigned
default grey. It is a different curve from the accent ramps, not an oversight.

**Actions do not use the accent.** `--color-action` is ramp step 700 (`#1547B7`). The accent
`#2563EB` stays for focus rings, links and atmosphere. That one indirection is what stops the
interface reading as default framework blue, and it puts the primary button at 8.02:1.

## The vocabulary

| Group | Names |
| --- | --- |
| Roles | `--color-bg` `--color-surface` `--color-text` `--color-accent` `--color-accent-2` `--color-divider` |
| Action | `--color-action` `--color-action-hover` `--color-action-active` |
| Ramps | `--color-{neutral,accent,accent-2}-{100…900}` |
| Status | `--color-{success,warning,danger}` + `-{100,300,700,800}` — **reserved**, never decoration |
| Chart series | `--series-1` … `--series-8` — fixed order, never cycled |
| Type | `--font-{heading,heading-weight,body,mono}` `--text-*` `--leading-*` `--tracking-*` |
| Space | `--space-{1…32}` — the name is the multiple of 4px, so `--space-12` is 48px |
| Controls | `--control-h-{xs,sm,md,lg,xl}` — buttons, inputs and selects share these |
| Radius | `--radius-{xs,sm,md,lg,full}` |
| Elevation | `--shadow-{sm,md,lg}` |
| Motion | `--ease-out` `--ease-in-out` `--dur-{fast,base,slow}` |

Scales are **authored, not computed**. There are no fractional pixel values anywhere — an
earlier version multiplied a base by a density factor and produced `14.4px`, which is how a
system starts looking unconsidered.

## Changing the look

Edit `src/theme.mjs`, run `pnpm check`. Two gates will argue with you if the change is
unsafe: `lint:contrast` fails any text or chrome pair under WCAG 2.2 AA computed from the
real ramps, and `lint:palette` re-runs the data-viz validator over the chart series —
including a check that the documented three-series cap for scatter and map forms is still
correct.

That is the point of the gates. A colour change that breaks colour-blind separation should
fail loudly, not ship.
