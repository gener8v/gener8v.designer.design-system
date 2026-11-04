# Changelog

All four packages (`@gener8v/tokens`, `@gener8v/tailwind-preset`, `@gener8v/icons`,
`@gener8v/ui`) release on one version. Entries before 0.58.0 are in the commit history and the
pull requests behind each `Release x.y.z` commit.

## 0.60.0

One fix and three components the delivery record built for its Plan view, promoted and generalised.
Additive apart from the dialog's layout, which renders the same where it already worked, and the
modal scrim, which changes only in dark mode.

### Fixed

- **`Dialog` without a `tone` keeps its buttons.** The dialog's rows were `grid-template-rows: auto
  auto minmax(0, 1fr) auto`, counting the tone band as the first row. Without a tone the body sat
  in an `auto` row and the actions in the squeezable `1fr` one, so on a phone a long form pushed
  its own buttons off the dialog. The record set `tone="accent"` on its form dialogs to get round
  it. `.dialog` is now a flex column: the band, the title and the actions keep their size
  (`flex: none`), and the body alone shrinks and scrolls (`flex: 0 1 auto; min-block-size: 0`),
  with or without a tone. Also: `max-block-size` uses `100dvh` where supported, the actions wrap,
  the body keeps room for a field's focus ring at its edge, and below 480px the space above the
  actions is a step smaller. The record can drop the load-bearing `tone="accent"`.
- **Modal backdrops stay dark in dark mode.** `.dialog-backdrop`, `.drawer-scrim` and
  `.command-backdrop` mixed `--color-neutral-900` into transparent. That step mirrors to the
  lightest ink in dark mode, so the page behind a dialog, a drawer or the command palette turned
  light grey instead of receding. New token **`--color-scrim`**: the same near-black in both
  modes, never mirrored. All three overlays use it, at their existing strengths (56%, 32%, 28%).
  There are now 144 tokens.

### Added

- **`LayeredGraph`** (`layered-graph.css`), a coverage graph. Layers read left to right, with a
  line for everything one layer's node covers in the next.
  - `LayeredGraph({ layers, edges, 'aria-label', selected?, highlight?: 'uncovered' | string[],
    onNodeOpen?(id), onAssign?(fromId, toId), assign?: { from, to }, readOnly?, assignKey? = 'a',
    headings? = true, describe?(node, links), labels?, empty? })`.
  - `LayeredLayer { id, label, nodes? | groups?: { label, nodes }[], ordered?, size?: 'sm' | 'md',
    coverable?, width? }`, `LayeredNode { id, label, code?, meta?, variant?: 'terminal',
    description? }`, `LayeredEdge { from, to, kind?: 'link' | 'sequence' }`.
  - Nodes are real buttons in real lists (`ul`, `ol` for an ordered layer, a list of lists for a
    grouped one), each named with what covers it ("REQ-002: Reconcile intercompany. Not
    covered."). The svg lines are `aria-hidden`. Hover, focus or selection lights a node's lines.
  - Drag a node from `assign.from` onto one in `assign.to` (by default the first two layers). The
    keyboard twin: `A` picks up, Enter on a target puts down, Escape puts back. Each step is said
    in a polite live region. A `terminal` node never takes a drop.
  - In a `coverable` layer, a node with no `link` out is uncovered: dashed and tinted, and counted
    in the layer's head and its group's. `highlight` rings the uncovered nodes or any given ids.
  - Below 30rem of its own width (a container query) the layers stack, the drawing goes, and each
    node shows its links as words: `In M1, M2`, `Not covered`.
  - Helpers: `layoutGraph`, `edgePath`, `uncoveredIds`, `layerNodes`, `LAYERED_METRICS`.
- **`ToolChip`** (`agent.css`): `{ label, result?, state?: 'running' | 'done' | 'refused' |
  'failed', args?, detail?, open?, defaultOpen?, onOpenChange?, formatKey?, formatValue?, labels? }`.
  While running it shows the label beside a pulse and says "running"; when done the result takes
  the label's place. Refused and failed show a tag. The args and detail open on a press, and a chip
  with nothing to open is not a button. `toolWords('list_requirements')` gives `List requirements`.
- **`ConfirmCard`** (`agent.css`): `{ summary, values?: { label, value }[], tier?: 'confirm' |
  'approval', spend?: boolean | ReactNode, state?: 'open' | 'confirmed' | 'cancelled' | 'failed',
  problem?, onConfirm?, onCancel?, pending?, readOnly?, elsewhere?: { note, action? }, labels? }`.
  The yes button says Confirm Change, Approve, or Approve Spend when the change costs money (a
  `costs money` tag comes before it). Cancel is held while a returned promise settles. Once
  answered, the buttons go and the answer stays in a polite status. If the pressed button took
  the focus, the card takes it.

Showcase: `components/coverage.html`, `components/agent.html`, and on `components/feedback.html` a
long form at phone width with and without a tone. Forced colours, print and reduced motion are
covered in `zz-adaptive`.

## 0.59.1

Four fixes found adopting 0.59.0 in the delivery record. No API changes; the record can drop its
workarounds (below).

### Fixed

- **`Contents` drew two ticks on a reviewed, rewritten entry.** "Rewritten in this run" is now a
  small filled dot (`svg.contents-written`), not a tick, and it is left out where the entry's review
  box is checked. The screen-reader words ", rewritten in this run" stay either way. Without review
  wired there is no box, so the dot stays. The record's `reviewedContents()` workaround can go.
- **Tailwind's `display: contents` utility stripped the `Contents` box.** Tailwind v4 generates it
  for any source that contains the word "contents", and it beat the component's class, which set no
  `display`. Three layers: `@gener8v/tailwind-preset/theme.css` now ships
  `@source not inline("contents")`, so the utility is not generated; the component's root is
  `class="contents contents-nav"`; and `nav.contents, .contents-nav { display: block }` keeps the
  box whatever else is generated. The old class stays. Consumers can remove their own
  `@source not inline('contents')`. Cost: a consumer who really wants Tailwind's `contents` utility
  must add `@source inline("contents")` after the preset import. The consumer-check package now
  compiles a Tailwind source holding the word and fails if the utility appears.
- **`PaperAside` overflowed the window inside a scrolling pane.** Its cap was `100dvh` less the
  sticky gap, which assumes the page scrolls under the window. New `--paper-aside-viewport-offset`
  (default `0px`): the pane's distance from the top of the window. The cap is now
  `100dvh - viewport offset - sticky top - bottom gap`. In an app with a 64px bar over a scrolling
  pane, set `--paper-aside-viewport-offset: 64px` and drop any `.paper-aside` max-height override.
  Shown in the reading showcase.
- **`LiveSection`'s tint ran to the text's right edge.** It now has `--space-4` of inline-end padding,
  cancelled by an equal negative margin, so the tint reaches as far past the text on the right as on
  the left and the text keeps its measure and left edge, in step with sibling sections.

## 0.59.0

Additive. Components the delivery record built for itself and listed as candidates, promoted and
generalised beyond their one use. Nothing that rendered before renders differently, except two
corrections listed under Changed.

### Added

- **Live activity** (`live.css`). Work happening now, drawn where the work is.
  - `Pulse({ tone?: 'accent' | 'success' | 'warning' | 'danger' })` — decorative, `aria-hidden`.
    Under reduced motion the ring stops leaving and stays as a still halo.
  - `LiveIndicator({ label, tone?, active? = true, hideLabel? })` — the pulse with its words in a
    polite `role="status"`; `active={false}` stills the pulse.
  - `LiveMark({ state: 'writing' | 'queued' | 'written' | 'failed' | undefined, labels? })` — a
    section's mark: a tag with a pulse, tick or cross and a word. Nothing for no state.
  - `LiveSection({ live?, as?: 'section' | 'div' | 'article' })` — `data-live` drives a side bar
    and tint; writing breathes and sets `aria-busy`; queued recedes; written keeps full ink.
  - `LiveProgress({ state: 'queued' | 'active' | 'done' | 'failed', where?, value?, max?, noun?,
    labels?, progressLabel? })` — a row's mark: pulse, where (`§2.5 +1`), a bar named `4 of 6
    sections done` and `4/6`; indeterminate without `max`. A table row holding an active mark is
    tinted and edged.
  - `liveWhere(places, prefix = '§')` — `§2.5`, `§2.5 +1`.
  - `Lanes({ items: LaneItem[], lanes? = AGENT_LANES, 'aria-label', max?, hideDetail?, loading?,
    empty? })` with `LaneItem { id, label, lane, detail? }` and `Lane { id, label, tone?, marker?:
    'pulse' | 'tick' | 'cross' | 'none', show?: 'always' | 'while-active' | 'when-occupied', keep?:
    'first' | 'last', announce? }`. Counts per lane, `+N` overflow keeping the right end of each
    lane, a FLIP slide when a pill changes lane (off under reduced motion), and a polite "Theme
    finder: Done" when an item arrives in an `announce` lane. `AGENT_LANES` is Waiting, Working,
    Done, Stopped, Skipped.
- **Keys** (`keys.css`).
  - `Kbd` — `<kbd class="kbd">`.
  - `ShortcutList({ items: { keys: (string | string[])[], does }[] })` — a `<dl>`; alternatives
    joined by "or", chords by a drawn "+"; arrow and modifier glyphs get spoken names. Named so as
    not to clash with the integrations family's `.key-list`.
  - `useListKeys({ count, onOpen?, keys?, enabled?, wrap? })` → `{ active, focus, itemProps }` —
    roving real focus: J/K anywhere, ↑/↓/Home/End once in the list, Enter on the item, any bound
    single key; never while typing, with a modifier, or under a modal that does not hold the list.
    `stepIndex` and `isTypingTarget` are exported.
- **`Contents`** (`contents.css`) — `{ items: { id, text, depth?, live?, after?, reviewKey? }[],
  title?, current?, spy? = true, minItems? = 3, reviewed?, onReviewedChange?, onNavigate?, loading? }`.
  Scroll-spy by IntersectionObserver, `aria-current="location"`, two-line clamp with the full title,
  optional reviewed checkboxes and a "4/78 reviewed" figure under caller-owned keys, and the same
  live marks as the sections, said in words for assistive tech.
- **`useDelegatedHoverCard({ selector, openDelay?, closeDelay?, placement?, align?, size?, accepts?,
  onOpenChange?, className? })`** → `{ bind, anchor, open, close, card(content) }` — HoverCard for
  markers inside sanitised HTML, by event delegation on the container. Same dwell, grace, Escape,
  `aria-describedby` and placement; re-measures when it moves to another marker.
- **`Citation({ missing?, ...anchor })`** and **`SourceCard({ id?, file?, locator?, excerpt?,
  truncated?, action?: { label, href?, onActivate? }, missing?, loading? })`** (`citation.css`) — a
  marker in prose (missing: dashed, unlinked, says so) and what it points at. `mark` is themed to
  the accent tint in both themes, for the passage a citation opened.
- **`PagerChip({ label, onPrevious?, onNext?, previousLabel?, nextLabel?, arrowKeys? })`**
  (`pager.css`) — `‹ S4 of 19 ›`; a missing handler disables its button; ← → with the typing and
  dialog guards; the label is a polite live region.
- **`Drawer header` and `size="lg"`** — a pinned `.drawer-head` above a `.drawer-body` that scrolls
  on its own; `lg` is a reading width that takes the screen on a phone.
- **`usePagedTable(rows, { pageSize? = 25, sort?: { value, initial? } })`** → `{ rows, sorted, page,
  pages, total, pageSize, from, to, setPage, sortProps, sortKey, direction, clearSort }` — sorted
  across every row, then paged; a new sort goes to page 1; a shrinking set keeps a page that exists.
  **`TablePager({ paged, label, noun?, siblings? })`** — "Showing 26–50 of 61 documents", Previous,
  numbers with gaps (`pageRange`) and Next; nothing for a single page.
- **`BarChart orientation="horizontal"`** — bars across the page in HTML, the name above and the
  figure at the end, grouped or stacked, a zero rule, the same table view.
- **`Popover size`** (`'sm' | 'md' | 'lg'`, `md` default) and **`HoverCard size`** (`sm` default) —
  `.popover-sm`, `.popover-md`, `.popover-lg`; `lg` is capped to the window and scrolls inside.
- `useAnchoredPosition` takes `anchorKey`, to re-measure when one floating element moves anchors.

### Changed

- **`PaperAside` is held to the window and scrolls inside itself** (`max-block-size`, `overflow-y:
  auto`, `overscroll-behavior: contain`), so a rail taller than the screen reaches its last entry.
  Its sticky offset is `--paper-aside-top` (default `--space-8`) for an app with a fixed top bar.
  Below 1100px, where the rail sits above the sheet, nothing changes.
- **`mark`** is the accent tint instead of the browser's yellow.

## 0.58.0

Additive. Nothing that rendered before renders differently.

### Added

- **`Meter` against a target.** `max`, `threshold`, `thresholdLabel` and `tone="auto"`. The
  target is a tick across the track and words beside the figure ("Target 80%"), which the meter
  references with `aria-describedby`. `auto` is success at or above the target, warning below.
  `max` defaults to 100, so existing meters are unchanged.
- **`Matrix`** — a coverage grid. A real `<table>` with `th scope` on both axes, one Tab stop with
  arrow-key movement (Home/End, Ctrl+Home/End, PageUp/PageDown), Enter or Space to open a cell,
  row labels that open the row, optional row and column totals, rotated column headings, pinned
  headings and row labels, and a scroll frame of its own so a phone page stays still. A cell's
  `title` is read by assistive tech in place of the mark and shown in a readout on hover and focus.
- **`HoverCard`** — the popover surface, opened by hover and by keyboard focus after `openDelay`,
  kept open while the pointer is on it, closed by Escape without moving focus.
- **`Feed`, `FeedGroup`, `FeedItem`** — activity grouped by actor. Ordered lists, the actor once
  per run, and a marker of `dot`, `number` (counted by CSS, or given) or `icon`.
- **`Diff`** and **`diff()`** — before and after, `inline` or `split`, by `word` or `line`.
  Compact LCS, no dependency. `<ins>`/`<del>` with an underline and a strike, a `+`/`−` gutter by
  line, and visually hidden "Added:"/"Removed:" for screen readers. Never colour alone.
- **`State` `art`** and **`StateArt`** — line drawings for an empty state: `grid`, `history`,
  `library`, `inbox`, `search`, or your own element. `currentColor` plus one accent mark, hidden
  from assistive tech, correct in both themes.
- **`Filter multiple`** — `values: string[]` and `onChange(values)`. The trigger reads as the
  dimension, the one chosen value, or "Name · 2". Each option can carry a `count`, shown in the
  menu. Still `Menu` underneath: same tick column and keyboard.
- **`MenuItem checked`** — `role="menuitemcheckbox"`; pressing one leaves the menu open.
- **`SidebarSection open` / `onOpenChange`** — controlled folding, so a shell can remember which
  groups a reader closed.
- **`Drawer side="start"`**, and a sidebar placed directly in a drawer drops its own width,
  ground and edge — the rail-on-wide, drawer-on-phone shell with one `Sidebar`.
