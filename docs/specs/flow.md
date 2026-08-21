# Flows

Layered on purpose: loose **parts** anyone can compose, plus a prescribed **shell**
built from them. An engagement whose process fits uses the shell; one that does not
drops to the parts. Nothing is a dead end.

## Parts

| Part | Notes |
| --- | --- |
| `Stepper` / `Step` | Position via `data-state` + `aria-current="step"`. A connector belongs to the step it *leaves*, so it fills only when that step is complete. |
| `Progress` | Real `role="progressbar"`. Omit `value` for the indeterminate form. |
| `ProgressRing` | One conic gradient driven by a `--progress` custom property. No SVG. |
| `Spinner` | `aria-hidden` unless given a `label` — the busy region should announce, not the glyph. |
| `Skeleton` | Always `aria-hidden`. |
| `Pagination` | `aria-current="page"` on the active page; the gap is `aria-hidden`. |
| `Timeline` | Rail line stops at the last marker rather than running past it. |

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
