---
name: gener8v-design-system
description: Use when building or restyling any user interface for a GENER8V engagement — pages, components, dashboards, forms, flows, charts, decks. Supplies the tokens, class names and rules that keep generated UI on-brand and accessible. Triggers on "design system", "GENER8V styling", "make this on-brand", "build a page/screen/component", "style this", or any UI work inside a repository that depends on @gener8v/ui or links styles.css.
---

# GENER8V design system

A light, airy interface for a firm delivering AI into **regulated, governed and auditable**
environments. Near-white ground, Inter at weight 500 for headings, an authored 4px space
scale, 6px radii, one blue used as an action colour rather than as decoration.

## The one thing to get right

**Take every value from a token. Never write a hex, a font name, or a px value the tokens
already carry.** Link the stylesheet and use its class names; do not invent a parallel set.

```html
<link rel="stylesheet" href="styles.css">
```
```tsx
import '@gener8v/ui/styles.css';
import { Button, Card, Flow, BarChart } from '@gener8v/ui';
```

The React components render the **same class names** as the static HTML, so markup written
against this system ports either direction without a visual rewrite.

## Hard rules

These are not preferences. Breaking one produces work that is off-brand or inaccessible.

1. **Headings are weight 500, never heavier.** Hierarchy is size and space. This single
   restraint is most of what "airy" means here.
2. **Actions fill with `--color-action` (`#1547B7`), not `--color-accent`.** The accent
   stays for focus rings, links and atmosphere. One primary button per view.
3. **`--color-neutral-500` must not carry text** — 3.17:1 on white. Secondary copy uses
   `--color-neutral-600` (`.muted`, `.label`).
4. **State lives in ARIA, not in a class.** `aria-current`, `aria-selected`, `aria-expanded`,
   `aria-invalid`, `aria-sort`. Style from the attribute so the visual and the accessibility
   tree cannot disagree. There is no `.is-active`.
5. **No gradients.** The one saturated area is `.section-band`, a flat field, once a page.
6. **Never cycle the chart series palette, and never reuse a status colour as a series.**
   A ninth series folds into "Other". Scatter/bubble/map forms are capped at three series.
7. **No dual-axis charts.** Bars sit on zero.
8. **All six states or none**: loading, empty, **partial**, error, denied, success. Partial
   is the one that matters in audited work — a figure from three of five sources must say so.
9. **A masked secret is not in the DOM.** Render a substitute string; mount the real value
   only on reveal. Copy never requires reveal.
10. **Irreversible actions enumerate what they will write.** Prose saying "this cannot be
    undone" is not the same artifact.

## Where to look

- `design/readme.md` — the full class table and the do/don't list. **Read this before
  building a screen.** It is gated by a lint, so it cannot drift from the stylesheet.
- `design/components/*.html` — every component, every variant, as plain HTML. View source
  and copy the markup; that is what these pages are for.
- `design/templates/` — copy-whole starting points: app shell, landing, deck, and three
  worked flows (purchase, create a work item, close a work item). **Start a screen from
  one of these.** `examples/` is a packaging fixture, not a design reference.
- `references/components.md` — the class index, if you only need the names.
- `docs/specs/*.md` — anatomy, variants, keyboard maps per component family.

## Checking your work

```
pnpm check
```

Runs seven gates: token round-trip, WCAG contrast, chart-palette validation, HTML↔React
parity, a built-package smoke test, the test suite, and the graph benchmark.

`design/_adherence.oxlintrc.json` is generated and can be dropped into a **client repo** to
fail its lint on raw hex values, raw px, and fonts the system does not provide.

## What not to reach for

Do not add a component library, an icon set, a chart library, or a form-validation library.
The system already covers buttons, forms, navigation, tables, flows, feedback, disclosure,
data display, charts, a knowledge graph, a document library and integration/credential
management. If something genuinely is missing, add it to the system rather than to the
consuming app — and run `pnpm check` before calling it done.
