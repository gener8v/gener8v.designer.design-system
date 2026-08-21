# @gener8v/tailwind-preset

Tailwind v4 `@theme` generated from the same tokens as `styles.css`, so
utilities and the component layer can never disagree.

```css
@import "tailwindcss";
@import "@gener8v/tailwind-preset/theme.css";
```

Then `bg-accent`, `p-6`, `rounded-md`, `text-2xl` resolve to the system's values.
Prefer the semantic classes (`.btn`, `.card`) for anything the system already
names — utilities are for layout the system does not cover.
