# @gener8v/ui

The React layer of the GENER8V design system.

```bash
npm i @gener8v/ui          # private to the @gener8v npm org
```
```tsx
import '@gener8v/ui/styles.css';   // once, at the app root
import { Button, Flow, BarChart } from '@gener8v/ui';
```

## The one thing to understand

**These components render the same class names as the design system's static HTML.**

```html
<!-- design/components/buttons.html -->
<button type="button" class="btn btn-primary">Continue</button>
```
```tsx
<Button variant="primary">Continue</Button>
// → <button type="button" class="btn btn-primary">Continue</button>
```

That is not a coincidence and it is not decoration — it is the property the whole system
is built around. HTML written against the design system (including HTML Claude generates,
because `design/readme.md` teaches it these classes) drops into a React app with no visual
rewrite. And a component here can never quietly diverge from the documented look, because
`pnpm lint:parity` fails if the static HTML uses a class no component can emit.

If you find yourself adding a `className` that is not in `design/styles.css`, stop. Either
the class belongs in the system — add it to `packages/tokens/src/components/` and a preview
page — or you are styling something locally that should not be styled locally.

## Where this sits

```
packages/tokens/src/theme.mjs      the source of truth — 135 tokens
        │
        ├──▶ design/styles.css     the only stylesheet; shipped here as dist/styles.css
        │            │
        │            ├──▶ design/**.html     static pages, the visual reference
        │            └──▶ @gener8v/ui        this package — same classes
        │
        ├──▶ @gener8v/tokens       the same values as JS/JSON, for logic
        └──▶ @gener8v/tailwind-preset   the same values as Tailwind utilities
```

`@gener8v/icons` is independent — 18 Phosphor glyphs, no dependency on this package.

## What is in here

258 exports across 50 families. The ones worth knowing:

| Area | Exports |
| --- | --- |
| Actions | `Button` `ButtonGroup` |
| Surfaces | `Card` `CardLink` `Panel` `Tag` |
| Forms | `Field` `Input` `Textarea` `Select` `Combobox` `Checkbox` `Radio` `Switch` `Slider` `FileUpload` `TokenInput` `Quantity` `RadioCard` |
| Navigation | `Nav` `Sidebar` `Breadcrumbs` `Tabs` `Tree` `Hamburger` `Drawer` `PagerChip` `Contents` `Menu` `CommandPalette` `Kbd` `ShortcutList` `useListKeys` |
| Flow | `Flow` `Stepper` `Progress` `Meter` `Timeline` `Feed` `Lanes` `LiveProgress` `LiveIndicator` `Pulse` `LiveMark` `LiveSection` `State` `StateArt` `useStepValidation` `ErrorSummary` |
| Feedback | `Dialog` `Alert` `Toast` `ToastProvider`/`useToast` `Tooltip` `Popover` `HoverCard` `useDelegatedHoverCard` `Callout` |
| Data | `Table` `usePagedTable` `TablePager` `Matrix` `Diff` `Stat` `DescriptionList` `Avatar` `BarChart` `LineChart` `Sparkline` `KnowledgeGraph` |
| Library & integrations | `DocList` `DocPreview` `Reader` `Citation` `SourceCard` `Connection` `Credential` `KeyRow` `Rule` |

`design/components/*.html` shows every one of them rendered. View source and copy the markup.

## Conventions this package holds to

**State lives in ARIA, not in a class.** `NavItem` takes `current` and emits
`aria-current="page"`; `Th` takes `sort` and emits `aria-sort`; `Input` takes `invalid` and
emits `aria-invalid`. The CSS styles the attribute. There is no `.is-active`, and the visual
and the accessibility tree cannot drift apart.

**Accessibility is enforced by types where it can be.** An icon-only `Button` requires
`aria-label` — it is a compile error without one, not a review comment.

**Behaviour is real, or the component says it is not.** `Dialog` and `Drawer` share
`useModalBehavior`: Escape closes, focus moves in and returns to the trigger, Tab cycles,
background scroll locks with a depth counter for nesting. `Tabs`, `Tree`, `Menu`,
`Combobox` and `Calendar` each implement their full WAI-ARIA keyboard contract. Where
something is genuinely unfinished — `Tooltip` ships the surface but not collision-aware
positioning — the doc comment says so rather than pretending.

**Native elements wherever one exists.** `Slider` is `<input type="range">`; `FileUpload`
wraps a real file input hidden with `.sr-only`, never `display: none`, so it stays in the
tab order. Reimplementing these loses keyboard behaviour, value announcement and form
participation, and usually gets at least one of them wrong.

**Dates cross the boundary as `YYYY-MM-DD` strings**, never `Date` objects. A `Date`
carries a time and a zone; a calendar date has neither.

**A masked secret is not in the DOM.** `Credential` renders a substitute string and only
mounts the real value once revealed — a CSS mask leaves the secret in the markup and in any
DOM snapshot.

## Peer dependencies

React 18 or 19. Nothing else — no component library, no icon set, no chart library, no
form-validation library. That is deliberate: each would make every consumer inherit a
choice the design system has no business making for an application.

## Changing something here

This package is one of six outputs of one source. Read the repository root README before
editing, run `pnpm check` before calling anything done, and add the class to
`packages/tokens/src/components/` plus a preview page in `design/components/` — a component
that emits a class the design system does not document will fail the parity gate.
