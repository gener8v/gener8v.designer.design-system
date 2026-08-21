# @gener8v/icons

The Phosphor subset the GENER8V design system uses — 18 icons, not 1,500.

Vendoring a whole icon set into a design system makes every consumer carry
1,500 glyphs to render eight. These are the ones the system's own components
and templates reference; add more by dropping the path in and rebuilding.

```tsx
import { ArrowRight, Warning } from '@gener8v/icons';

<button className="btn btn-primary">Continue<ArrowRight /></button>
```

Sized in `em`, so an icon tracks the type of whatever contains it. `aria-hidden`
by default; pass `aria-label` to make one meaningful on its own.
