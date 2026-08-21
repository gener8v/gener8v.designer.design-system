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
