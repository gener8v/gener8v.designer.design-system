# @gener8v/icons

The Phosphor subset the GENER8V design system actually uses. Eighteen icons, not 1,500.

```bash
npm i @gener8v/icons       # private to the @gener8v npm org
```
```tsx
import { ArrowRight, Warning } from '@gener8v/icons';

<button className="btn btn-primary">Continue<ArrowRight /></button>
```

## Why a subset

Vendoring a whole icon set into a design system makes every consumer carry 1,500 glyphs to
render eight. These are the ones the system's own components and templates reference,
extracted from them — so the set is defined by use, not by what a library happened to ship.

`ArrowRight` `CaretDown` `CaretLeft` `CaretRight` `Check` `DotsThree` `DownloadSimple`
`File` `Folder` `Image` `Info` `Lock` `MagnifyingGlass` `Plus` `Trash` `UploadSimple`
`Warning` `X`

## Conventions

**Sized in `em`**, so an icon tracks the type of whatever contains it. Inside `.btn` the CSS
sets `1.15em`, so the same component works at every button size without a per-size override.

**`aria-hidden` by default.** An icon beside a label is decoration and must not be announced
twice. Pass `aria-label` to make one meaningful on its own — and if it is meaningful on its
own inside a button, use `<Button iconOnly aria-label="…">`, which requires the label at
compile time.

**`fill="currentColor"`**, always. An icon never carries its own colour token; it inherits
from the text around it. That is why the same glyph works on a light card and inside a
filled button with no variant.

## Adding one

Phosphor at **regular** weight, 256 viewBox. Drop the path into a new file in `src/`
following the existing shape, export it from `src/index.ts`, and rebuild. Do not add a
second weight — mixing weights in one interface reads as two icon sets.

## Relationship to the rest

Independent. No dependency on `@gener8v/ui` or `@gener8v/tokens` — it only needs React. The
design system's static HTML inlines the same SVG paths directly, since a static page has no
bundler to import from.
