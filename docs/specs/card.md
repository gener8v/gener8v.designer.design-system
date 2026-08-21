# Card, Panel, Tag

## Card
Hairline surface: 1px `--color-neutral-200`, `--radius-lg`, `--space-6` padding.
A border separates; a shadow is reserved for things that genuinely float.

| Class | Role |
| --- | --- |
| `.card` | Default — bordered, on the page ground |
| `.card-quiet` | Surface tint, no border. For a card inside a card |
| `.card-raised` | Shadow instead of border. Only when it floats |
| `.card-interactive` | The whole card is one link target. Renders `<a>`, never a div with onClick |
| `.card-pad-sm` / `.card-pad-lg` | `--space-4` / `--space-8` |

Parts: `.card-kicker` (mono, a section marker or classification — never a subtitle),
`.card-title`, `.card-body`, `.card-meta` (top-ruled footer row).

## Panel
Hosts a region rather than a snippet. `.panel-header` carries the title and at most
one action; `.panel-body` holds the table, form or list.

## Tag
Status only. Six variants, each mapped to a meaning: neutral (draft), accent (in
progress), success, warning, danger, outline (archived/inert). `.tag-dot` prefixes a
filled dot for rows where even a tint is too much weight.

Text sits on ramp step **700**, not 800 — 800 is near-black and amber in particular
goes brown there. All five pairs measure 6.7–7.6:1.

## Accessibility
- `.card-interactive` must be an `<a href>` or `<button>`, never a div with a handler.
- A tag conveying state that is not otherwise in the text needs the state in its text
  content, not colour alone.
- `.card-title` is a `<p>` by default — pass a heading element when the card is a
  landmark in the page outline.
