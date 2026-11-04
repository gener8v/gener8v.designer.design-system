# Feedback

One tone vocabulary — `neutral` · `accent` · `success` · `warning` · `danger` — shared
by `Alert`, `Toast`, `State` and `Callout`. A fifth vocabulary is how a system starts
meaning three different things by "warning".

## Dialog and Drawer
Both use `useModalBehavior`, so they cannot drift. It provides:
- Escape closes
- focus moves into the panel on open, returns to the trigger on close
- Tab cycles inside the panel (hidden elements excluded)
- background scroll locked, with a depth counter so nested modals restore correctly

`Dialog` wires `aria-labelledby` to its own `title` via `useId`. `dismissOnBackdrop`
defaults to true; turn it off for destructive confirmations.

## Alert
`role="alert"` when tone is danger or warning (assertive), `role="status"` otherwise
(polite), and no live role at all unless `live` is set — a banner present on first
paint should not announce.

## Toast
`ToastRegion` must be mounted **before** a toast is inserted, or the insertion is not
announced. `ToastClose` is a component rather than a class on a bare `Button` so the
accessible name and icon cannot be forgotten at the call site.

A toast may carry **one action**, for taking back what just happened: `ToastSpec.action =
{ label, onAction }`, drawn by `ToastAction` before `ToastClose`.
- It is a real button inside the live region, so it is announced with the toast and reached by Tab.
- A toast with an action defaults to `duration: 0`: an action that leaves before somebody reaches
  it is a broken promise. With a duration given, the timer pauses while the pointer is over the
  region or keyboard focus is in it.
- Pressing it runs `onAction` and dismisses the toast. Focus goes back to where it was before it
  entered the region, not to the page.
- Undo, never a decision. A toast is polite and can be missed; a decision goes in a `Dialog`, and
  an agent's proposed change in a `ConfirmCard`.

## ErrorBoundary
Wraps a region — a routed page inside the app frame, a detail pane, a chart — and shows
`State kind="error"` with `role="alert"` when what it wraps throws while rendering. The frame
around it stays.
- The error's own text is never shown. It goes to `onError(error, info)` for the log.
- A new `resetKey` clears the error: the path for a page, the record id for a pane. No router is
  assumed. "Try again" clears it in place; `fallback` replaces the whole state and is handed
  `reset`.
- Render errors only. A request that fails is a `State` the screen renders itself.

## Callout
A rule, not a filled box. A box competes with the cards around it.

## Open — Tooltip positioning

`Tooltip` ships the **surface only**. Positioning is deliberately absent: doing it
correctly needs collision detection against the viewport, and a naive
absolutely-positioned version breaks at the screen edges — which is exactly where the
dense screens that use tooltips put them.

Resolve by pairing it with Base UI's Popover positioner, or CSS anchor positioning if
the engagement's browser matrix allows. Until then, treat `Tooltip` as unfinished and
prefer `.field-hint` or `Callout` for anything load-bearing.
