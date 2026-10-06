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

## A client's colours

The palette above is GENER8V's own — its theme file says so, hue 263 matching the cool ink of
the firm's site. A client engagement wears the client's. That is a **brand**, and it is a
palette and nothing else:

```css
@import "@gener8v/ui/styles.css";
@import "@gener8v/tokens/brands/mutual-assurance.css";
```

Declare one in `packages/tokens/src/brands.mjs` — a hue, a chroma, the three pinned grounds, and
optionally an action colour. The build generates its sheet from the same `neutralRamp` the house
theme uses, so a brand's nine steps are this system's lightness curve in another hue rather than
hexes taken off a screenshot. `pnpm check` holds every brand to the same contrast ratios as the
house, against its own ground.

**A brand may not move anything but colour.** Not the space scale, not the radii, not the type
scale, not a class name — those are what make a product recognisable as one of these whoever's
colours it wears, and a brand that could move them would be a fork.

It is light-only unless the brand pins a dark ground. A warm paper has no dark counterpart that
is still paper, and the system will not invent one.

Without this, a client product hand-rolls nine neutral steps in its own stylesheet, picks the two
selectors that scope them to light mode, and keeps a lint exemption so it can hold raw hexes.
Every later engagement then does that work again, differently.

## Hard rules

These are not preferences. Breaking one produces work that is off-brand or inaccessible.

1. **Headings are weight 500, never heavier.** Hierarchy is size and space. This single
   restraint is most of what "airy" means here.
2. **Actions fill with `--color-action` (`#2664EC`), not `--color-accent`.** The accent
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
11. **A label names its kind.** A button is an action **verb** — `Answer`, `Record`,
    `Publish`. A navigation item is a **noun** — `Decisions`, `Standards`. Neither is a
    sentence, a clause or a question. "Answer for it" makes a reader parse a phrase before
    they can decide whether to press it; "Answer" does not.
12. **A status is a `Tag`; an action is a `Button`.** Never a bare `<button>` styled to
    look like a link. Where the two sit together — a row that reports a state and offers
    the way out of it — they must differ in **shape**, not only in colour. Two small
    coloured words side by side read as two statuses, and the reader cannot tell what is
    being reported from what they can do about it.
13. **Words are not the interface.** A status is one or two words, not a sentence. Prose
    belongs in a lede, a hint or a state's body — the places built to carry it — and never
    in a tag, a label or a control.
14. **A page reads top to bottom as a funnel**: what you are looking at, then what is true
    of it, then what you can do about it. A figure reading "66 requirements **this** module
    defines" placed above the module picker sends the reader looking upward for an
    antecedent that is not there yet.
15. **Never restate a selection.** If a control shows which thing is selected, no heading
    repeats it. Two places to read one fact is one place too many, and the day they
    disagree the reader has no way to tell which is right.
16. **A title sits above its description, never beside it.** Two strings sharing a baseline
    read as one run-on sentence in two type sizes. This is the most common way a flex row
    goes wrong: a title and its body become siblings in a ROW, and the body's top margin
    silently does nothing.
17. **A finding that names a gap offers the way out of it.** An empty state, a red status,
    a count of what nobody has done — if the reader can act on it, the action is *there*,
    not on another screen they have to guess at. A sentence that reports a problem and
    stops is a sentence people learn to scroll past.
18. **Absence names its cause.** "Not yet", "nobody looked", "we could not read it" and
    "you are not allowed to see it" are four different things, and only one of them is a
    finding. A zero is an answer *only* if something counted; where the count failed, show
    no figure rather than a confident nought. A skeleton means "still reading" and never
    "nothing to show" or "the read failed" — it is the one element that never tells you it
    has finished.
19. **The operating system draws none of this.** A native `<select>`'s open list and a
    `title` attribute's tooltip are painted by the OS: no token reaches them, and neither
    survives touch or a keyboard. Use `Menu`, `Combobox`, `RadioCards` and `Tooltip`.
20. **A component asks for the layout it depends on.** A body that scrolls needs a bounded
    height; a shell that is `block-size: 100%` needs a parent that has one. A component
    that declares the first and never requests the second works in the demo and fails in
    every real page — and a percentage resolves against a parent's *height*, so a parent
    with only a `min-height` answers `auto`.

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
