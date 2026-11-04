# Component index

Generated from `design/readme.md`. Every class here exists in `styles.css` and is
producible by `@gener8v/ui` — both facts are gated by `pnpm check`.

Prefer these over inventing a parallel class. If you need something that is not here,
add it to the system, not to the consuming app.

Which one to use for a job, and which not to: `choosing/<family>.md`, routed from SKILL.md.

| Class | React | What it is | Shown in |
| --- | --- | --- | --- |
| `.btn` with `.btn-primary`, `.btn-secondary`, `.btn-ghost`, `.btn-subtle`, `.btn-destructive`, `.btn-link` | `Button`, `ButtonLink` | Actions — the primary is a solid accent fill, one per view | components/buttons.html |
| `.btn-xs`, `.btn-sm`, `.btn-lg`, `.btn-xl` | `Button`, `ButtonLink` | Size steps on the shared control heights | components/buttons.html |
| `.btn-icon`, `.btn-block`, `.is-loading` | `Button`, `ButtonLink` | Square icon-only, full width, spinner | components/buttons.html |
| `.btn-group` | `ButtonGroup` | Segmented row of adjoining buttons | components/buttons.html |
| `.card` with `.card-quiet`, `.card-raised`, `.card-interactive`, `.card-pad-sm/-lg` | `Card`, `CardLink`, `CardKicker`, `CardTitle`, `CardBody`, `CardMeta`, `CardMedia` | Hairline surfaces — a border separates, a shadow only floats | components/cards.html |
| `.card-kicker`, `.card-title`, `.card-body`, `.card-meta` | `Card`, `CardLink`, `CardKicker`, `CardTitle`, `CardBody`, `CardMeta`, `CardMedia` | Card parts; the kicker is the mono voice | components/cards.html |
| `.panel` with `.panel-header`, `.panel-title`, `.panel-body` | `Panel`, `PanelHeader`, `PanelTitle`, `PanelBody` | Hosts a region — a table, a form, a list | components/cards.html |
| `.tag` with `.tag-neutral`, `.tag-accent`, `.tag-success`, `.tag-warning`, `.tag-danger`, `.tag-outline`, `.tag-dot` | `Tag` | Status labels — every variant maps to a meaning | components/cards.html |
| `.stepper` / `.stepper-vertical` / `.stepper-rail` with `.step`, `.step-marker`, `.step-label`, `.step-connector` | `Stepper`, `Step` | Step position via `data-state` + `aria-current="step"`. Markers when each step is an act; the rail when the sequence is a position. `--stepper-complete` retints what is behind | components/flow.html |
| `.progress` with `.progress-bar`, `.progress-indeterminate`; `.progress-ring` | `Progress`, `ProgressRing` | Real `role="progressbar"`, never decoration | components/flow.html |
| `.pagination` with `.pagination-item`, `.pagination-gap` | `Pagination`, `PaginationItem`, `PaginationGap` | Paged navigation | components/flow.html |
| `.timeline` with `.timeline-item`, `.timeline-marker`, `.timeline-time`, `.timeline-title`, `.timeline-body` | `Timeline`, `TimelineItem` | Chronology | components/flow.html |
| `.live-pulse`, `.live-indicator`, `.live-mark`, `.live-section` (`data-live`), `.live-progress` with `.live-progress-where`, `.live-progress-bar`, `.live-progress-count` | `Pulse`, `LiveIndicator`, `LiveMark`, `LiveSection`, `LiveProgress` | Work happening now, drawn where the work is. The pulse always sits beside words; under reduced motion it is a still halo | components/live.html |
| `.lanes` with `.lane`, `.lane-name`, `.lane-count`, `.lane-items`, `.lane-item`, `.lane-item-detail`, `.lane-more` | `Lanes` | Swimlanes of pills by state; a pill that changes lane slides there, except under reduced motion | components/live.html |
| `.contents` with `.contents-head`, `.contents-count`, `.contents-list`, `.contents-item`, `.contents-link`, `.contents-check` | `Contents` | A document's contents — `aria-current="location"`, optional reviewed boxes, the same live marks as the sections | components/reading.html |
| `.kbd`, `.shortcut-list` with `.shortcut`, `.shortcut-keys`, `.shortcut-does` | `Kbd`, `ShortcutList` | A key drawn as a key, and keys with what they do. Not `.key-list`, which is API keys | components/reading.html |
| `.pager-chip` with `.pager-chip-step`, `.pager-chip-label`; `.drawer-head`, `.drawer-body` | `PagerChip`, `Drawer` | Stepping through a set in place (`S4 of 19`), in a drawer whose head is pinned above a scrolling body | components/reading.html |
| `.table-pager` with `.table-pager-range` | `TablePager` | Under a paged table: the range on show and the pages. Nothing for a table that fits on one page | components/table.html |
| `.chart-hbars` with `.chart-hbar-row`, `.chart-hbar-label`, `.chart-hbar-track`, `.chart-hbar`, `.chart-hbar-value` | `BarChart` | Bars across the page — the name above, the figure at the end | components/charts.html |
| `.state` with `.state-icon`, `.state-title`, `.state-body`, `.state-actions`, `.state-detail` | `State`, `StateIcon`, `StateTitle`, `StateBody`, `StateActions`, `StateDetail`, `StateArt` | The six states, tone via `data-tone` | components/states.html |
| `.state-art` with `.state-art-mark` | `State`, `StateIcon`, `StateTitle`, `StateBody`, `StateActions`, `StateDetail`, `StateArt` | A line drawing for an empty state — grid, history, library, inbox, search. `currentColor` plus one accent mark; hidden from assistive tech | components/states.html |
| `.flow` shell: `.flow-rail`, `.flow-main`, `.flow-header`, `.flow-content`, `.flow-fields`, `.flow-footer` | `Flow`, `FlowRail`, `FlowRailTitle`, `FlowMain`, `FlowHeader`, `FlowStepOf`, `FlowTitle`, `FlowLede`, `FlowContent`, `FlowFields`, `FlowFooter`, `FlowFooterStatus` | The prescribed multi-step structure | templates/intake/ |
| `.dialog-backdrop` + `.dialog` with `.dialog-title`, `.dialog-body`, `.dialog-actions` | `Dialog` | Modal at the top elevation. A column: only the body scrolls, and the actions stay in view with or without a tone | components/feedback.html |
| `.alert` with `.alert-title`, `.alert-body`, `.alert-actions` | `Alert`, `AlertTitle`, `AlertBody`, `AlertActions` | Inline banner, tone via `data-tone` | components/feedback.html |
| `.toast-region` + `.toast` with `.toast-title`, `.toast-body`, `.toast-close` | `ToastRegion`, `Toast`, `ToastTitle`, `ToastBody`, `ToastClose` | Transient notice in a live region | components/feedback.html |
| `.tooltip`, `.callout` with `.callout-title` | `Tooltip`, `Callout`, `CalloutTitle` | Floating hint; a quiet aside in prose | components/feedback.html |
| `.menu` with `.menu-item`, `.menu-item-danger`, `.menu-label`, `.menu-sep`, `.menu-shortcut` | `Menu`, `MenuIdentity`, `MenuItem`, `MenuLabel`, `MenuSeparator`, `MenuShortcut`, `MenuSub` | Dropdown menu; keyboard highlight matches hover | components/disclosure.html |
| `.accordion` with `.accordion-item`, `.accordion-trigger`, `.accordion-panel` | `Accordion`, `AccordionItem` | Disclosure; chevron rotates from `aria-expanded` | components/disclosure.html |
| `.segmented` with `.segmented-item` | `Segmented`, `SegmentedItem` | A radiogroup, not a tablist — it filters, it does not swap panels | components/disclosure.html |
| `.stat` with `.stat-label`, `.stat-value`, `.stat-note`, `.stat-delta` | `Stat`, `StatRow`, `StatLabel`, `StatValue`, `StatNote`, `StatDelta` | KPI tile; figures tabular | components/data.html |
| `.meter` with `.meter-track`, `.meter-fill` | `Meter` | A level that is true — not `.progress`, which is a task advancing | components/data.html |
| `.meter-threshold`, `.meter-target` | `Meter` | A meter's target: a tick across the track and the words beside the figure — never the tick alone | components/data.html |
| `.paper` with `.paper-ground`, `.paper-aside` | `Paper`, `PaperAside`, `PaperGround` | A sheet a document sits on, and the page behind it. Prose is read; a table is scanned — only the first gets a sheet, and navigation goes on the ground beside it | — |
| `.shelf` with `.shelf-zone`, `.shelf-item`, `.shelf-grip` | `Shelf` | Moving a thing between two places. Drag by the grip, or space/arrows/space by keyboard; the row itself opens the item | — |
| `.conversation` with `.turn`, `.turn-body`, `.turn-meta`, `.turn-pending` | `Conversation`, `Turn`, `TurnPending` | A person asking and a system answering — `data-side="sent"` is a bubble, `received` is prose at full measure | components/agent.html |
| `.tool-chip` (`data-state`) with `.tool-chip-toggle`, `.tool-chip-caret`, `.tool-chip-label`, `.tool-chip-detail`, `.tool-chip-args`, `.tool-chip-more` | `ToolChip` | An agent's tool call as a chip: running, then its result; refused and failed in a tag; arguments a press away | components/agent.html |
| `.confirm-card` (`data-tier`, `data-spend`, `data-state`) with `.confirm-card-flags`, `.confirm-card-spend`, `.confirm-card-summary`, `.confirm-card-values`, `.confirm-card-actions`, `.confirm-card-outcome`, `.confirm-card-problem` | `ConfirmCard` | A proposed change asking a person to confirm or approve it, inline in a conversation; stays as a record once answered | components/agent.html |
| `.split` with `.split-aside`, `.split-handle`, `.split-main` | `Split` | Reader-sized pane: drag the handle, click it to collapse. `role="separator"` | — |
| `.combobox` with `.listbox`, `.listbox-option`, `.listbox-empty` | `Combobox` | ARIA 1.2 combobox — focus stays in the input; `allowCustom` accepts a value the list does not hold | components/inputs.html |
| `.dropzone` with `.file-list`, `.file-item`, `.file-name`, `.file-size` | `FileUpload`, `FileList`, `FileItem` | File drop over a real `input[type=file]` | components/inputs.html |
| `.calendar` with `.calendar-grid`, `.calendar-day` | `Calendar` | `role="grid"` month view; dates are `YYYY-MM-DD` strings | components/inputs.html |
| `.popover` with `.popover-title`, `.popover-actions` | `Popover`, `PopoverTitle`, `PopoverActions` | Non-modal floating panel — Tab is not trapped | — |
| `.popover-sm`, `.popover-md`, `.popover-lg` | `Popover`, `PopoverTitle`, `PopoverActions` | Popover and hover card widths — `lg` is a reading width capped to the window that scrolls inside itself | components/live.html |
| `.citation` (+ `data-missing`) with `.source-card`, `.source-card-file`, `.source-card-id`, `.source-card-locator`, `.source-card-excerpt`, `.source-card-action` | `Citation`, `SourceCard` | A citation marker in prose and what it points at. A missing source is dashed, unlinked and says so in words | components/reading.html |
| `.card-media` | `Card`, `CardLink`, `CardKicker`, `CardTitle`, `CardBody`, `CardMeta`, `CardMedia` | Image slot that bleeds to the card's edges | templates/purchase/ |
| `.qty` with `.qty-btn`, `.qty-input` | `Quantity` | Quantity stepper over a real number input | templates/purchase/ |
| `.radio-cards` with `.radio-card`, `.radio-card-title`, `.radio-card-note`, `.radio-card-meta` | `RadioCards`, `RadioCard` | A choice that carries a description and a figure | templates/purchase/ |
| `.summary` with `.summary-row`, `.summary-total`, `.summary-note` | `Summary`, `SummaryRow`, `SummaryNote` | Totals — one emphasised row per summary | templates/purchase/ |
| `.token-input` with `.token-input-field`, `.tag-remove` | `TokenInput`, `Tag` | Removable tokens; Backspace removes the last | templates/work-item-create/ |
| `.checklist` with `.checklist-item`, `.checklist-text`, `.checklist-note` | `Checklist`, `ChecklistItem` | Criteria; done items recede, never disappear | templates/work-item-close/ |
| `.comment` with `.comment-head`, `.comment-text`, `.comment-compose` | `Comment`, `CommentCompose`, `CommentActions` | Activity thread and composer | templates/work-item-close/ |
| `.graph` with `.graph-canvas`, `.graph-node`, `.graph-edge`, `.graph-legend`, `.graph-index` | `KnowledgeGraph` | Knowledge graph — canvas, Barnes–Hut, radius by sqrt(degree) | components/graph.html |
| `.layered-graph` with `.layered-graph-canvas`, `.layered-graph-edges`, `.layered-graph-layer`, `.layered-graph-head`, `.layered-graph-list`, `.layered-graph-group`, `.layered-graph-group-head`, `.layered-graph-node` (`data-size`, `data-variant`, `data-uncovered`), `.layered-graph-code`, `.layered-graph-label`, `.layered-graph-meta`, `.layered-graph-links` | `LayeredGraph` | Coverage graph — layers left to right, nodes as buttons in lists, lines drawn in svg and hidden; stacks with the lines as words below 30rem of its own width | components/coverage.html |
| `.command-backdrop` + `.command` with `.command-search`, `.command-list`, `.command-item`, `.command-group`, `.command-footer` | `CommandPalette` | Command palette — a dialog, not a dropdown | components/command.html |
| `.tree` with `.tree-group`, `.tree-item`, `.tree-twisty`, `.tree-label`, `.tree-count` | `Tree` | Hierarchy — one Tab stop, arrows inside | components/command.html |
| `.code` with `.code-head`, `.code-copy` | `CodeBlock` | Code block; no bundled tokenizer | components/command.html |
| `.chart` with `.chart-head`, `.chart-legend`, `.chart-plot`, `.chart-grid`, `.chart-axis`, `.chart-bar`, `.chart-line`, `.chart-tooltip` | `ChartFrame`, `BarChart`, `LineChart` | Charts — thin marks, recessive grid, table view always available | components/charts.html |
| `.sparkline` | `Sparkline` | A shape beside a figure — no axes, no legend | components/charts.html |
| `.doc-list` / `.doc-row` / `.doc-type` / `.doc-grid` / `.doc-card` | `DocType`, `DocList`, `DocRow`, `DocGrid`, `DocCard` | Document library — type is a mono badge, never a coloured chip | components/library.html |
| `.doc-preview` with `.reader`, `.sheet` | `DocPreview`, `DocPreviewHead`, `DocPreviewTitle`, `DocPreviewActions`, `DocPreviewBody`, `Reader`, `Sheet` | Preview pane; reader measure capped at 72ch | components/library.html |
| `.connection` with `.connection-mark`, `.connection-status` | `Connection`, `ConnectionMark`, `ConnectionBody`, `ConnectionName`, `ConnectionNote`, `ConnectionActions`, `ConnectionStatus` | Integration state — status in words, never colour alone | components/integrations.html |
| `.credential` | `Credential` | Masked secret; the value is not in the DOM until revealed | components/integrations.html |
| `.key-list` / `.key-row` / `.scopes` / `.scope` | `KeyList`, `KeyRow`, `Scopes`, `Scope` | API keys, scopes, expiry | components/integrations.html |
| `.rule`, `.endpoint` | `Rule`, `Endpoint` | Event rule as a sentence; inbound webhook | components/integrations.html |
| `.slide` with `.slide-title`, `.slide-list`, `.slide-divider` | — | Deck slides, type sized in container units | templates/deck/ |
| `.error-summary` | `ErrorSummary` | Validation summary linking to each field | — |
| `.label` | — | The mono label — section markers, figures and data labels. NEVER above a heading: an eyebrow is a quiet line the eye reaches before the loud one, and it names something the reader can already see | foundations/type.html |
| `.lede`, `.muted`, `.num`, `.mono` | — | Intro paragraph, secondary text, tabular figures, technical identifiers | foundations/type.html |
| `.table` in `.table-wrap`, with `.table-compact`, `.table-sticky`, `.table-empty` | `TableWrap`, `Table`, `TableToolbar`, `Th`, `Td`, `TableEmpty`, `TableEmptyTitle` | Data tables — hairline rules, mono headers, `aria-sort` | components/table.html |
| `.matrix` in `.matrix-wrap`, with `.matrix-col`, `.matrix-row`, `.matrix-cell`, `.matrix-total`, `.matrix-flag` | `Matrix` | Coverage grid — a real table, one Tab stop with arrow keys, pinned headings, scrolls in its own frame. Tone via `data-tone`, never without a mark | components/table.html |
| `.diff` with `.diff-ins`, `.diff-del`, `.diff-pane`, `.diff-line`, `.diff-sign` | `Diff` | Before and after — struck through and underlined, so a change never rests on colour alone | components/library.html |
| `.container`, `.section`, `.stack`, `.row`, `.hr` | — | Layout primitives and the section rhythm | foundations/layout.html |
| `.section-band` | — | The one full-bleed deep-ink band per page — a flat field, never a gradient | foundations/image.html |
| `.bg-dot-grid`, `.bg-noise` | — | Atmosphere on otherwise empty ground | foundations/image.html |

## Tokens

144 tokens. The vocabulary:

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
