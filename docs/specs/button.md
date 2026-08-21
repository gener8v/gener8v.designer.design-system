# Button

## Anatomy
`[ leading icon ] label [ trailing icon ]` inside a single interactive box.
Icon-only collapses to a square; the accessible name then comes from `aria-label`.

## Variants
| Class | Role | Use |
| --- | --- | --- |
| `.btn-primary` | Solid accent fill | The one action the page wants. Max one per view. |
| `.btn-secondary` | Bordered, surface fill | Equal-weight alternatives; the workhorse. |
| `.btn-ghost` | Transparent | Low-emphasis, dense toolbars, table rows. |
| `.btn-subtle` | Accent tint | Accent emphasis without the weight of a fill. |
| `.btn-destructive` | Solid danger fill | Irreversible actions only. |
| `.btn-link` | Inline text | Reads as a link, behaves as a button. |

## Sizes
`xs` `sm` `md` (default) `lg` `xl` — padding and type scale together; radius steps
from `--radius-sm` at xs/sm to `--radius-md` at md and up.

## Modifiers
`.btn-icon` square · `.btn-block` full width · `.is-loading` spinner replaces leading icon

## States
rest · hover · active · `:focus-visible` (2px accent ring, 2px offset) · disabled · loading

## Accessibility
- Real `<button>`; `<a class="btn">` only when it navigates.
- Icon-only requires `aria-label`.
- Loading sets `aria-busy="true"` and keeps the label in the accessible tree.
- Disabled uses the `disabled` attribute, never pointer-events alone.
- Hit target ≥ 44px at `md` and up; `xs`/`sm` are for dense contexts only.

## Tokens consumed
`--color-accent{,-100..900}` `--color-neutral-{100,200,300,700,800,900}` `--color-danger{,-700,-800}`
`--space-{1,2,3,4,5,6}` `--radius-{sm,md,full}` `--shadow-sm` `--text-{xs,sm,base,lg}`
`--dur-fast` `--ease-out` `--ring-*`
