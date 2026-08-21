# @gener8v/tokens

One source of truth, generated outward.

```
src/theme.mjs ──▶ styles.css              the stylesheet every page links
              ──▶ dist/tokens.{mjs,d.ts,json}
              ──▶ ../tailwind-preset/theme.css
              ──▶ ../../design/theme.json, _adherence.oxlintrc.json
              ──▶ ../../figma/plugin/tokens.json   (DTCG)
```

```ts
import tokens from '@gener8v/tokens';
tokens['--color-action'];   // '#1547B7'
```

Ramps are generated in OKLCH on a shared perceptual lightness scale, so the same
step of any ramp carries the same visual weight. Never hand-edit the outputs —
change `src/theme.mjs` and rebuild.
