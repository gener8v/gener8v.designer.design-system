# Flows

Layered on purpose: loose **parts** anyone can compose, plus a prescribed **shell**
built from them. An engagement whose process fits uses the shell; one that does not
drops to the parts. Nothing is a dead end.

## Parts

| Part | Notes |
| --- | --- |
| `Stepper` / `Step` | Position via `data-state` + `aria-current="step"`. A connector belongs to the step it *leaves*, so it fills only when that step is complete (or skipped). `size="sm"`, `description`, and the six progress states. Each step says its state in words. |
| `Progress` | Real `role="progressbar"`. Omit `value` for the indeterminate form. `label` / `helper` lay out by the family rule. |
| `ProgressRing` | Conic gradient + radial mask, driven by `--progress`. Stroke = diameter / 8. |
| `Spinner` | The indeterminate ring at 16 / 24 / 32px. `aria-hidden` unless given a `label` — the busy region should announce, not the glyph. |
| `SegmentedProgress` | One track split by state, a legend, and the breakdown as `aria-valuetext`. |
| `ProgressList` | Tasks with marks and a count. `aria-busy` while one runs; announces a failure and the end only. |
| `FileProgress` | A transfer row: name, percent, 4px bar, size or reason, cancel / retry / remove. |
| `Skeleton` | Always `aria-hidden`. |
| `Pagination` | `aria-current="page"` on the active page; the gap is `aria-hidden`. |
| `Timeline` | Rail line stops at the last marker rather than running past it. |

## The progress family

One anatomy, one state map, one glyph source, one rule for words. Every indicator above reads it.

**Anatomy tokens.** `--progress-track` (neutral-200), `--progress-fill` (the action colour),
`--progress-fill-success|warning|danger` (the 700 steps, which mirror for dark mode),
`--progress-h-sm|md|lg` = 4 / 6 / 8px, `--progress-gap` = 2px between segments,
`--progress-radius` = full, `--progress-circle-xs|sm|md|lg|xl` = 16 / 24 / 32 / 48 / 64px. A ring's
stroke is its diameter over 8, so every stroke is a whole pixel.

**Label and value.** Label at the start, value at the end, helper underneath.

| Form | Layout |
| --- | --- |
| Stacked bar | Label and value on one line above the track; helper below it. |
| Inline bar | Label · track · value on one line (rows, cells, `LiveProgress`). |
| Ring ≥ 48px | Value inside; label and helper beside the ring. |
| Ring < 48px | Nothing inside (or an icon); label, value and helper beside it. |

Values are tabular figures in the mono voice; a value that is a status word (`Uploaded`,
`Waiting`) uses the body face (`.progress-status`).

**Narrow containers.** Below a 30rem container the marker stepper goes vertical (every name
whole, the same marks and connectors, no count to compute); the rail keeps its row and shows the
current label alone. Above 30rem steps wrap rather than clip.

**Rows that stack share columns.** Inline bars have fixed label and value tracks
(`--progress-label-w`, `--progress-value-w`). Transfer rows in a `FileList` take the list's
columns as a subgrid (body, retry slot, dismiss slot). An active `LiveProgress` is four fixed
columns. A ring's text is always a title line plus one supporting line, and the ring is centred on
it.

**States.**

| State | Word | Glyph | Disc | Segment / fill |
| --- | --- | --- | --- | --- |
| `queued` | Queued | — | hollow, neutral-300 edge | track |
| `current` | In progress | — | action edge + halo (stepper); the spinner (running task) | `--progress-fill` |
| `complete` | Done | check | success-100, success-300 edge, success-700 glyph | `--progress-fill-success` |
| `failed` | Failed | cross | danger tint | `--progress-fill-danger` |
| `stopped` | Stopped | alert (`!`) | warning tint | `--progress-fill-warning` |
| `skipped` | Skipped | minus | dashed neutral edge | neutral-400 |

A bar's fill is the progress colour while the work moves; a `tone` replaces it only when the whole
task has ended, and it always comes with its glyph and word. Nothing is conveyed by colour alone.

**Glyphs.** Phosphor Bold geometry (24-unit stroke on 256, round caps and joins) embedded as CSS
mask images, each viewBox centred on its ink. A mask because it needs no markup (the stepper's
existing marker draws its tick from CSS alone), no React and no icon package, paints in one colour
token, and can be repainted in `CanvasText` under forced colours. A glyph is absolutely placed and
centred with `inset: 0; margin: auto`, never placed in a grid beside other content.

**Motion.** Under reduced motion the indeterminate bar hops start → middle → end, fading between
places; the ring, the spinner and a running mark keep turning at 1.8s.

**Not added.** Progress inside a button: `.btn.is-loading` already holds a button's label and width,
and a determinate fill would put a second bar on a view's one primary control.

## The six states

Most systems ship the happy path and let each app invent the rest. All six, every time:

| Kind | Tone | Must answer |
| --- | --- | --- |
| `loading` | neutral | What is being fetched |
| `empty` | neutral | Why it is empty, and the one action that fills it |
| `partial` | warning | **How much** succeeded, and that figures exclude the rest |
| `error` | danger | What failed, whether anything changed, what to do — plus `StateDetail` |
| `denied` | neutral | Who can grant access |
| `success` | success | What is now true, and where to go next |

`partial` is the one that matters most in audited work. A figure computed from three
of five sources must say so rather than presenting itself as complete.

## The shell

`Flow` → `FlowRail` (vertical `Stepper`) + `FlowMain` (`FlowHeader`, `FlowContent`
with `FlowFields`, `FlowFooter`).

Rules the shell enforces:
- Back sits left, forward sits right, in every flow. A user never hunts for advance.
- `FlowFooterStatus` sits between them and carries save state, never an action.
- `FlowFields` caps the measure so a form never runs the full width of a wide screen.
- Below 720px the rail becomes a horizontal strip — a 264px rail on a phone is most
  of the screen.

## Open

Validation-on-advance is not implemented yet: the shell lays out the footer but does
not gate `Continue` on the current step being valid. That needs a form-state
decision (native constraint validation vs a schema library) — worth settling before
the first engagement uses it.
