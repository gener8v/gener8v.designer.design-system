# Component index

Generated from `design/readme.md`. Every class here exists in `styles.css` and is
producible by `@gener8v/ui` — both facts are gated by `pnpm check`.

Prefer these over inventing a parallel class. If you need something that is not here,
add it to the system, not to the consuming app.

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
| `.conversation` with `.turn`, `.turn-body`, `.turn-meta`, `.turn-pending` | A person asking and a system answering — `data-side="sent"` is a bubble, `received` is prose at full measure | — |
| `.split` with `.split-aside`, `.split-handle`, `.split-main` | Reader-sized pane: drag the handle, click it to collapse. `role="separator"` | — |
| `.combobox` with `.listbox`, `.listbox-option`, `.listbox-empty` | ARIA 1.2 combobox — focus stays in the input; `allowCustom` accepts a value the list does not hold | components/inputs.html |
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
| `.label` | The mono eyebrow — section markers and technical labels | foundations/type.html |
| `.lede`, `.muted`, `.num`, `.mono` | Intro paragraph, secondary text, tabular figures, technical identifiers | foundations/type.html |
| `.table` in `.table-wrap`, with `.table-compact`, `.table-sticky`, `.table-empty` | Data tables — hairline rules, mono headers, `aria-sort` | components/table.html |
| `.container`, `.section`, `.stack`, `.row`, `.hr` | Layout primitives and the section rhythm | foundations/layout.html |
| `.section-band` | The one full-bleed deep-ink band per page — a flat field, never a gradient | foundations/image.html |
| `.bg-dot-grid`, `.bg-noise` | Atmosphere on otherwise empty ground | foundations/image.html |

## Tokens

142 tokens. The vocabulary:

| Group | Names |
| --- | --- |
| Colour roles | `--color-bg` `--color-surface` `--color-text` `--color-accent` `--color-accent-2` `--color-divider` |
| Action | `--color-action` `--color-action-hover` `--color-action-active` |
| Ramps | `--color-{neutral,accent,accent-2}-{100…900}` |
| Status | `--color-{success,warning,danger}` + `-{100,300,700,800}` — **reserved** |
| Chart series | `--series-1` … `--series-8` — fixed order, never cycled |
| Section band | `--color-section` `--color-section-glow` `--color-section-ghost` |
| Type | `--font-heading` `--font-heading-weight` `--font-body` `--font-mono` `--text-*` `--leading-*` `--tracking-*` |
| Space | `--space-{1,2,3,4,5,6,8,10,12,16,20,24,32}` — the name is the multiple of 4px |
| Controls | `--control-h-{xs,sm,md,lg,xl}` — buttons, inputs and selects share these |
| Radius | `--radius-{xs,sm,md,lg,full}` |
| Elevation | `--shadow-{sm,md,lg}` |
| Motion | `--ease-out` `--ease-in-out` `--dur-{fast,base,slow}` |
| Layout | `--container-{sm,md,lg,xl,2xl}` |
| Focus | `--ring-width` `--ring-offset` `--ring-color` |
