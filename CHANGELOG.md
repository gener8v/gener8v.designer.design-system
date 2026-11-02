# Changelog

All four packages (`@gener8v/tokens`, `@gener8v/tailwind-preset`, `@gener8v/icons`,
`@gener8v/ui`) release on one version. Entries before 0.58.0 are in the commit history and the
pull requests behind each `Release x.y.z` commit.

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
