# GENER8V design system

GENER8V is a light, airy, professional interface for a senior-led AI consulting practice that works in
regulated, governed and auditable environments. A near-white ground, Inter set at weight 500 for
headings, an authored 4px space scale, 6px radii, and one blue used as an action colour rather than
as decoration. Contrast comes from the tonal ramps and from whitespace, not from heavy
type or saturated fills. Where a page needs presence it gets one full-bleed band; everywhere else the
ground stays quiet.

## How to use this

- Link the one stylesheet from every page — `<link rel="stylesheet" href="styles.css">` (adjust the
  relative path) — and take every colour, font, space, radius and shadow from its variables
  (`var(--color-*)`, `var(--font-*)`, `var(--space-*)`, `var(--radius-*)`, `var(--shadow-*)`,
  `var(--control-h-*)`). Never hard-code a hex, a font name, or a px value the tokens already carry.
- Build with the classes below rather than inventing parallel ones. The component pages are plain
  HTML — view source and copy the markup.
- The same class names are what `@gener8v/ui` ships as React components, so markup written against
  this system ports to a React app without a visual rewrite.
- Everything was generated from `packages/tokens/src/theme.mjs` in the source repository. To change
  the look, change the theme and rebuild — never hand-edit `styles.css`, `theme.json` or the
  foundations pages.

## Direction

Left-aligned and asymmetric. Flush-left headings, content hugging the left edge with whitespace
carried on the right. Buttons are solid-filled and a view gets exactly one primary. Corners are tight
— `--radius-md` is 6px — because airiness here comes from whitespace and type weight, not from soft
corners. Section rhythm is large: `--space-20` (80px) is the default block padding and `--space-24`
(96px) is not excessive. Reach for a bigger space step before reaching for a divider; `.hr` exists
but this system prefers air.

Every scale is authored, not computed. A step name is its multiple of 4px, so `--space-12` is 48px
and you can read the value off the name. There are no fractional pixel values anywhere in the system.

## Colour

A white ground (`--color-bg`) with `--color-surface` `#F7F9FC` for raised panels, `--color-text`
`#111827`, and a single accent `#2563EB` — the blue already carried by gener8v.com.

Actions do not fill with the accent itself. `--color-action` (`#2664EC`, ramp step 600) fills a
primary button, `--color-action-hover` and `--color-action-active` step down from there. The accent
stays for focus rings, links, the dot grid and chart series. That one indirection is what keeps the
interface from reading as default framework blue, and it puts the primary button at 8.02:1.

`--color-accent-2` `#0891B2` exists for a second data series and nothing else — never a second button
colour. `success`, `warning` and `danger` carry five steps each (tint, border, base, hover, pressed),
not a full ramp; a status colour that needs nine steps is being used as decoration.

Each role carries a 100–900 ramp generated in OKLCH on one shared perceptual lightness scale, so the
same step of any ramp has the same visual weight. On this light ground use 100–200 for tinted fills
and hovers, 300 for borders, 500–600 as the role's base, and 700–900 for text on tints and for pressed
states. Prefer a ramp step over an ad-hoc `color-mix()`.

Neutral chroma **rises** toward the dark end: `--color-neutral-100` is almost white while
`--color-neutral-900` is distinctly cool. That is deliberate — it is what keeps a light interface from
reading as undesigned default grey. Never substitute pure `#000` or `#808080`.

`--color-accent` on white is 5.17:1 — fine for chrome, but text in the accent should use
`--color-accent-700`. `--color-neutral-500` is **3.17:1 on white and must not carry text**; it is for
borders, icons and other chrome. Secondary and muted copy uses `--color-neutral-600` — that is what
`.muted` and `.label` are set to. For elevation use `--shadow-sm/md/lg`, which are already tuned soft
and low-alpha for a light ground; do not write ad-hoc box-shadows.

## Type

Inter for headings over Inter for body, loaded as `--font-heading` / `--font-body`. IBM Plex Mono
(`--font-mono`) is the technical voice: section markers, figures and data labels, via
`.label` and `.num`. It never sets body copy.

Headings are weight **500** and never heavier. Hierarchy is carried by size and space. This is the
single most important rule in the system — bolding a heading to 700 undoes the airiness that
everything else is built to produce.

## Charts

`--series-1` … `--series-8` are the categorical palette. **Assign them in fixed order and
never cycle** — a ninth series folds into “Other”, it is never a generated hue, because two
entities painted the same colour is a lie the chart tells silently.

Every value was produced by the data-viz validator, not chosen. Slot 1 is the accent and
slot 3 is `--color-accent-2`, so charts stay on-brand; that substitution measurably raised
worst-case colour-blind separation from ΔE 9.1 to 16.3. Under all-pairs forms — scatter,
bubble, maps — **only the first three slots are legal**; slot 4 measures ΔE 13.7, below the
15 floor. `pnpm lint:palette` re-runs all of this, including a check that the cap of three
is still correct.

Status colours are **reserved**. `--color-danger` is never “series 4” — a neutral series
painted in the alarm colour reads as an alarm.

Sequential magnitude uses one hue, `--color-accent-400` → `-800`. Diverging uses two hues
with a neutral `--color-neutral-300` midpoint — never a rainbow, never a hue at the middle.

One y-axis, always. Bars sit on zero; a magnitude axis starting elsewhere makes a 3% gap
look like 300%. Lines may float, because a trend is about change. Text wears text tokens,
never the series colour — a swatch beside a label carries identity.

## Secrets and integration state

A masked credential's value **must not be in the DOM**. A CSS mask over the real string
leaves the secret in the markup, in devtools, and in any DOM snapshot — `Credential`
renders a substitute string and only mounts the real value once revealed. **Copy never
requires reveal**: making someone display a key in order to copy it is how keys end up in
screenshots and screen shares. Write-once secrets drop the reveal control entirely.

Connection state is a reserved status colour *and* a word. A write scope is tinted while
read scopes are not — in a list of twelve, the one that can change something is the only
one worth a second look. An expiring key is a warning; only an expired one is an error.

## Validation

Validation-on-advance uses **native constraint validation**, not a schema library. The
system ships native controls, so `checkValidity()` already knows `required`, `type`,
`min`, `max` and `pattern` — with no dependency and no version coupling to whatever an
engagement picks. `useStepValidation` accepts a caller-supplied `validate` for anything
beyond that, so the two compose rather than compete.

Failures render an `ErrorSummary` at the top of the step, each entry linking to its field,
and focus moves to the summary rather than the first field — on a long step the summary is
the only place that says how many problems there are.

## Icons

Phosphor (https://phosphoricons.com) at **regular** weight, inline SVG on `currentColor`. Inside
`.btn` they are sized in `em` so they scale with the control. Icon-only controls always carry an
`aria-label`.

## Interaction states

States are themed, never browser defaults. Every interactive element gets a `:hover` tint and a
pressed state one step further down the ramp (`--color-accent-700` hover, `--color-accent-800`
pressed for solid fills; a ramp tint for ghost and subtle variants). Keyboard focus is
`:focus-visible { outline: 2px solid var(--color-accent); outline-offset: 2px; }` — never leave the
default blue ring. `::selection` is an accent tint. Disabled drops to 45% opacity and sets the
`disabled` attribute. Transitions run at `--dur-fast` on `--ease-out`, an expo-out curve carried over
from gener8v.com.

Interactive controls sit on `--control-h-*`. `--control-h-md` is 44px, a WCAG 2.2 target-size floor
rather than a rhythm value, which is why it is not density-scaled. Buttons, inputs and selects share
these heights so they line up in a row. `xs` and `sm` are for dense contexts only.

## Components

| Class | What it is | Shown in |
| --- | --- | --- |
| `.btn` with `.btn-primary`, `.btn-secondary`, `.btn-ghost`, `.btn-subtle`, `.btn-destructive`, `.btn-link` | Actions — the primary is a solid accent fill, one per view | components/buttons.html |
| `.btn-xs`, `.btn-sm`, `.btn-lg`, `.btn-xl` | Size steps on the shared control heights | components/buttons.html |
| `.btn-icon`, `.btn-block`, `.is-loading` | Square icon-only, full width, spinner | components/buttons.html |
| `.btn-group` | Segmented row of adjoining buttons | components/buttons.html |
| `.card` with `.card-quiet`, `.card-raised`, `.card-interactive`, `.card-pad-sm/-lg` | Hairline surfaces — a border separates, a shadow only floats | components/cards.html |
| `.card-kicker`, `.card-title`, `.card-body`, `.card-meta` | Card parts; the kicker is the mono voice | components/cards.html |
| `.panel` with `.panel-header`, `.panel-title`, `.panel-body` | Hosts a region — a table, a form, a list | components/cards.html |
| `.tag` with `.tag-neutral`, `.tag-accent`, `.tag-success`, `.tag-warning`, `.tag-danger`, `.tag-outline`, `.tag-dot` | Status labels — every variant maps to a meaning | components/cards.html |
| `.stepper` / `.stepper-vertical` with `.step`, `.step-marker`, `.step-label`, `.step-connector` | Step position via `data-state` + `aria-current="step"` | components/flow.html |
| `.progress` with `.progress-bar`, `.progress-indeterminate`; `.progress-ring` | Real `role="progressbar"`, never decoration | components/flow.html |
| `.spinner`, `.skeleton` (+ `-text`, `-title`, `-circle`) | Busy and placeholder | components/flow.html |
| `.pagination` with `.pagination-item`, `.pagination-gap` | Paged navigation | components/flow.html |
| `.timeline` with `.timeline-item`, `.timeline-marker`, `.timeline-time`, `.timeline-title`, `.timeline-body` | Chronology | components/flow.html |
| `.state` with `.state-icon`, `.state-title`, `.state-body`, `.state-actions`, `.state-detail` | The six states, tone via `data-tone` | components/states.html |
| `.flow` shell: `.flow-rail`, `.flow-main`, `.flow-header`, `.flow-content`, `.flow-fields`, `.flow-footer` | The prescribed multi-step structure | templates/intake/ |
| `.dialog-backdrop` + `.dialog` with `.dialog-title`, `.dialog-body`, `.dialog-actions` | Modal at the top elevation | components/feedback.html |
| `.alert` with `.alert-title`, `.alert-body`, `.alert-actions` | Inline banner, tone via `data-tone` | components/feedback.html |
| `.toast-region` + `.toast` with `.toast-title`, `.toast-body`, `.toast-close` | Transient notice in a live region | components/feedback.html |
| `.tooltip`, `.callout` with `.callout-title` | Floating hint; a quiet aside in prose | components/feedback.html |
| `.menu` with `.menu-item`, `.menu-item-danger`, `.menu-label`, `.menu-sep`, `.menu-shortcut` | Dropdown menu; keyboard highlight matches hover | components/disclosure.html |
| `.accordion` with `.accordion-item`, `.accordion-trigger`, `.accordion-panel` | Disclosure; chevron rotates from `aria-expanded` | components/disclosure.html |
| `.segmented` with `.segmented-item` | A radiogroup, not a tablist — it filters, it does not swap panels | components/disclosure.html |
| `.stat` with `.stat-label`, `.stat-value`, `.stat-note`, `.stat-delta` | KPI tile; figures tabular | components/data.html |
| `.meter` with `.meter-track`, `.meter-fill` | A level that is true — not `.progress`, which is a task advancing | components/data.html |
| `.dl` (+ `.dl-stacked`) | Record detail | components/data.html |
| `.avatar` (+ `-sm`, `-lg`, `.avatar-group`) | Person mark | components/data.html |
| `.paper` with `.paper-ground`, `.paper-aside` | A sheet a document sits on, and the page behind it. Prose is read; a table is scanned — only the first gets a sheet, and navigation goes on the ground beside it | — |
| `.shelf` with `.shelf-zone`, `.shelf-item`, `.shelf-grip` | Moving a thing between two places. Drag by the grip, or space/arrows/space by keyboard; the row itself opens the item | — |
| `.conversation` with `.turn`, `.turn-body`, `.turn-meta`, `.turn-pending` | A person asking and a system answering — `data-side="sent"` is a bubble, `received` is prose at full measure | — |
| `.split` with `.split-aside`, `.split-handle`, `.split-main` | Reader-sized pane: drag the handle, click it to collapse. `role="separator"` | — |
| `.combobox` with `.listbox`, `.listbox-option`, `.listbox-empty` | ARIA 1.2 combobox — focus stays in the input; `allowCustom` accepts a value the list does not hold | components/inputs.html |
| `.slider` (+ `.slider-head`, `.slider-value`) | Native range; fill driven by `--slider-pct` | components/inputs.html |
| `.dropzone` with `.file-list`, `.file-item`, `.file-name`, `.file-size` | File drop over a real `input[type=file]` | components/inputs.html |
| `.calendar` with `.calendar-grid`, `.calendar-day` | `role="grid"` month view; dates are `YYYY-MM-DD` strings | components/inputs.html |
| `.popover` with `.popover-title`, `.popover-actions` | Non-modal floating panel — Tab is not trapped | — |
| `.card-media` | Image slot that bleeds to the card's edges | templates/purchase/ |
| `.qty` with `.qty-btn`, `.qty-input` | Quantity stepper over a real number input | templates/purchase/ |
| `.radio-cards` with `.radio-card`, `.radio-card-title`, `.radio-card-note`, `.radio-card-meta` | A choice that carries a description and a figure | templates/purchase/ |
| `.summary` with `.summary-row`, `.summary-total`, `.summary-note` | Totals — one emphasised row per summary | templates/purchase/ |
| `.token-input` with `.token-input-field`, `.tag-remove` | Removable tokens; Backspace removes the last | templates/work-item-create/ |
| `.checklist` with `.checklist-item`, `.checklist-text`, `.checklist-note` | Criteria; done items recede, never disappear | templates/work-item-close/ |
| `.comment` with `.comment-head`, `.comment-text`, `.comment-compose` | Activity thread and composer | templates/work-item-close/ |
| `.graph` with `.graph-canvas`, `.graph-node`, `.graph-edge`, `.graph-legend`, `.graph-index` | Knowledge graph — canvas, Barnes–Hut, radius by sqrt(degree) | components/graph.html |
| `.command-backdrop` + `.command` with `.command-search`, `.command-list`, `.command-item`, `.command-group`, `.command-footer` | Command palette — a dialog, not a dropdown | components/command.html |
| `.tree` with `.tree-group`, `.tree-item`, `.tree-twisty`, `.tree-label`, `.tree-count` | Hierarchy — one Tab stop, arrows inside | components/command.html |
| `.code` with `.code-head`, `.code-copy` | Code block; no bundled tokenizer | components/command.html |
| `.chart` with `.chart-head`, `.chart-legend`, `.chart-plot`, `.chart-grid`, `.chart-axis`, `.chart-bar`, `.chart-line`, `.chart-tooltip` | Charts — thin marks, recessive grid, table view always available | components/charts.html |
| `.sparkline` | A shape beside a figure — no axes, no legend | components/charts.html |
| `.doc-list` / `.doc-row` / `.doc-type` / `.doc-grid` / `.doc-card` | Document library — type is a mono badge, never a coloured chip | components/library.html |
| `.doc-preview` with `.reader`, `.sheet` | Preview pane; reader measure capped at 72ch | components/library.html |
| `.connection` with `.connection-mark`, `.connection-status` | Integration state — status in words, never colour alone | components/integrations.html |
| `.credential` | Masked secret; the value is not in the DOM until revealed | components/integrations.html |
| `.key-list` / `.key-row` / `.scopes` / `.scope` | API keys, scopes, expiry | components/integrations.html |
| `.rule`, `.endpoint` | Event rule as a sentence; inbound webhook | components/integrations.html |
| `.slide` with `.slide-title`, `.slide-list`, `.slide-divider` | Deck slides, type sized in container units | templates/deck/ |
| `.error-summary` | Validation summary linking to each field | — |
| `.label` | The mono label — section markers, figures and data labels. NEVER above a heading: an eyebrow is a quiet line the eye reaches before the loud one, and it names something the reader can already see | foundations/type.html |
| `.lede`, `.muted`, `.num`, `.mono` | Intro paragraph, secondary text, tabular figures, technical identifiers | foundations/type.html |
| `.table` in `.table-wrap`, with `.table-compact`, `.table-sticky`, `.table-empty` | Data tables — hairline rules, mono headers, `aria-sort` | components/table.html |
| `.container`, `.section`, `.stack`, `.row`, `.hr` | Layout primitives and the section rhythm | foundations/layout.html |
| `.section-band` | The one full-bleed deep-ink band per page — a flat field, never a gradient | foundations/image.html |
| `.bg-dot-grid`, `.bg-noise` | Atmosphere on otherwise empty ground | foundations/image.html |

## Do

- Keep chroma low outside the accent; lean on `--color-neutral-*` for surfaces, borders and muted text.
- Use the large space steps — this system is airy on purpose.
- Give every figure a hairline border and `--radius-md`; images sit *on* the light ground.
- Put technical labels, section markers and figures in the mono face.

## Don't

- Do not bolden headings past weight 500.
- Do not flood large areas with the accent. The exception is `.section-band`, used at most once a page.
- Do not use a gradient. The band is a flat field; gradients are the fastest way to look generated.
- Do not introduce a second accent colour for a second button. There is one action colour.
- Do not stack heavy shadows; elevation here is a hairline plus a wide, faint ambient blur.
- Do not use pure black or pure white for text or borders — every value comes from the ramps.
- Do not put a second primary button on a view.
- Do not give a card a shadow just to separate it — that is what the hairline is for.
- Do not use a tag that carries no status. A decorative tag is noise.
- Do not ship a flow that handles only the happy path. All six states or none.
- Do not move the forward action. Back is left, forward is right, in every flow.
- Do not use `.progress` for a level or `.meter` for a task. They mean different things.
- Do not pass a `Date` across a date-picker boundary. Calendar dates are `YYYY-MM-DD`
  strings; a `Date` carries a time and a zone and will eventually move a deadline by a day.
- Do not hide a file input with `display: none` — it leaves the tab order. Use `.sr-only`.
- Do not put more than one emphasised total in a summary. The total is where the eye lands.
- Do not remove a checked criterion from view. In audited work the record of what was
  checked is part of the artifact.
- Do not describe an irreversible action in prose alone. Enumerate what it will write.
- Do not build a dual-axis chart. Two scales the reader cannot compare is the single most
  common charting mistake — use two charts, or index both to a common base.
- Do not cycle the series palette, and do not reuse a status colour as a series.
- Do not invent a fourth tone vocabulary. `data-tone` means the same thing on
  `.alert`, `.toast`, `.state` and `.callout`.

## Files

- `styles.css` — the only stylesheet: the token sheet (`:root` variables, ramps, base type) plus the
  component layer. Link it from every page.
- `readme.md` — this guide.
- `theme.json` — the parameters the system was derived from.
- `thumbnail.html` — the project cover.
- `foundations/color.html` — the roles, the six ramps, and measured contrast on the page ground.
- `foundations/type.html` — the scale at real sizes, the pairing, and the mono voice.
- `foundations/layout.html` — space, control heights, radius, elevation and the section rhythm.
- `foundations/icons.html` — the icon set at interface sizes, inline and in buttons.
- `foundations/image.html` — figure treatment and the atmosphere utilities.
- `components/buttons.html` — every button variant, size and state.
- `components/cards.html` — cards, the panel, and the status tags.
- `components/forms.html` — fields, inputs, select, choice controls and the switch.
- `components/navigation.html` — header, hamburger, drawer, sidebar, breadcrumbs, tabs.
- `components/table.html` — data tables, compact and empty.
- `components/flow.html` — stepper, progress, spinner, skeleton, pagination, timeline.
- `components/states.html` — the six states a flow passes through.
- `components/feedback.html` — dialog, alerts, toast, tooltip and callout.
- `components/disclosure.html` — menu, accordion and the segmented control.
- `components/data.html` — stats, meters, description lists and avatars.
- `components/inputs.html` — combobox, slider, file drop and the calendar.
- `components/graph.html` — the knowledge graph, at readable and at corpus scale.
- `components/command.html` — the command palette, the tree and the code block.
- `components/charts.html` — bar, stacked, line and sparkline, with the series palette.
- `components/library.html` — the document library: list, grid and preview panes.
- `components/integrations.html` — connections, credentials, API keys and event rules.
- `templates/app-shell/` — the layout every client application starts from.
- `templates/landing/` — the marketing voice.
- `templates/deck/` — eight slides sized in container units.
- `templates/purchase/` — a four-step buy flow.
- `templates/work-item-create/` — describe, label and attach.
- `templates/work-item-close/` — criteria, outcome, evidence and an irreversible confirm.
- `templates/intake/` — the flow shell as a working multi-step journey.
