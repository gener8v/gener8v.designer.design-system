# Navigation: Nav, Sidebar, Drawer, Tabs

## One cue for "you are here"
The current place is marked once: a soft tinted pill (`--color-accent-500` mixed at 14% over
the ground) with the label in `--color-neutral-900` at weight 600. No left bar, no saturated
fill, no accent-coloured text. The same indicator is used on `.nav-item`, `.sidebar-item` and
on both inside `.drawer-panel`.

| State | Treatment |
| --- | --- |
| Rest | `--color-neutral-700` label, no fill |
| Hover | `--color-text` mixed at 6% — a neutral tint, never mistaken for current |
| Current (`aria-current`) | Accent-500 tint at 14%, ink label, weight 600 |
| Current + hover | Accent-500 tint at 20% |
| Focus | The system ring (`:focus-visible`), unchanged |

Items are full pills (`--radius-full`). Sidebar items sit on `--control-h-md`. The mix is
composited over transparency so it works on the page ground and on the rail's surface in
both themes; `pnpm lint:contrast` checks the ink label on every combination (11–14:1).

Active state is driven by `aria-current` (and `aria-selected` on tabs), never a class.

## Header (`.nav`)
The header collapses by its **own** width: `.nav` is a size container named `nav`, and below
720px of its own inline size `.nav-links` hides and `.nav-burger` shows. It never scrolls
sideways. Put a `.hamburger.nav-burger` in every header that has links (`<Hamburger inNav>`
in React), or a collapsed header has no navigation.

## Sidebar groups
`.sidebar-group` is a quiet label: body family, `--text-xs`, weight 500,
`--color-neutral-600`, sentence case as authored. No rule underneath; groups are separated by
`--space-6` of air. A collapsible group (`.sidebar-group-toggle`) keeps the chevron.

## Drawer
Links in a drawer are the same size as in the header or rail. There is no drawer-specific
padding or font size.

## Tabs
The 2px `--color-action` underline is the indicator. The selected label goes to ink
(`--color-neutral-900`), not to the accent, so selection is not said twice in blue.
