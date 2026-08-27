// The single source of truth for the GENER8V design system.
// Everything else in this repository is generated from this file.

export const theme = {
  name: 'GENER8V',

  // radius is the `md` step. density is recorded for the bundle's theme.json
  // but multiplies nothing — the space scale is authored, not derived.
  density: 1,
  radius: 6,

  palette: {
    hue: 263,            // OKLCH hue of the site's own greys and blue
    band: 'light',
    scheme: 'duo',
    sat: 0.07,
    neutralChroma: 0.032, // matches gener8v.com's cool ink (#111827)
    pin: { bg: '#FFFFFF', surface: '#F7F9FC', accent: '#2563EB' },
    bg: '#FFFFFF',
    surface: '#F7F9FC',
    text: '#111827',
    accent: '#2563EB',   // blue-600, the site's action colour
    accent2: '#0891B2',  // cyan-600 — DATA SERIES ONLY, never a second button colour

    // THE DARK GROUND, PINNED THE SAME WAY THE LIGHT ONE IS.
    //
    // Light mode pins `bg`, `surface` and `text` rather than deriving them, because a page's
    // ground is a decision and not a step on a ramp. Dark mode is the same decision made twice, so
    // it is declared here rather than computed from an inversion nobody chose.
    //
    // `surface` is the neutral ramp's darkest step, which is also the ground every dark panel in
    // the system already used — so a code block and a raised card land on the same colour instead
    // of two near-blacks that almost match.
    dark: { bg: '#0F1522', surface: '#182030' },
  },

  semantic: {
    success: '#059669',
    warning: '#D97706',
    danger: '#DC2626',
  },

  fonts: {
    // A SERIF FOR HEADINGS, AND IT IS NOT DECORATION.
    //
    // Heading and body were both Inter at 500 — so a heading was body text, very slightly bolder,
    // and every scrap of hierarchy had to come from size alone. On a surface where the heading is
    // small (a section inside a page) there was nothing left to carry it, and the product filled
    // the gap with an 11px mono label above a 20px grey sentence: the name of the thing set
    // smaller than the commentary about it. That is not a spacing bug, it is a missing voice.
    //
    // Source Serif 4 is screen-tuned, pairs with Inter by design, and reads as a document rather
    // than as an interface — which is what a record somebody attaches to a filing should read as.
    heading: { family: 'Source Serif 4', class: 'serif', weights: [400, 500, 600] },
    body: { family: 'Inter', class: 'grotesque', weights: [300, 400, 500, 600] },
    mono: { family: 'IBM Plex Mono', class: 'mono', weights: [400, 500, 600] },
    // 600 rather than 500: a serif at display sizes needs the weight to hold its own against a
    // grotesque body, and the family change is now what carries the hierarchy anyway.
    headingWeight: 600,
  },

  layoutStyle: 'left',
  iconSet: 'phosphor',
  buttonStyle: 'solid',
  imageTreatment: 'none',
  photo: 'gener8v',
};

// Authored, not computed. The step name IS the multiple of 4px, so --space-12
// is 48px and you can read the value off the name. Airiness comes from which
// steps a layout reaches for, never from inflating the scale into fractions.
export const SPACE_BASE = { 1: 4, 2: 8, 3: 12, 4: 16, 6: 24, 8: 32 };
export const SPACE_EXTRA = { 5: 20, 10: 40, 12: 48, 16: 64, 20: 80, 24: 96, 32: 128 };

// size / line-height / tracking
export const TYPE_SCALE = {
  xs:   ['12px', '1.5',  '0.01em'],
  sm:   ['14px', '1.55', '0.005em'],
  base: ['16px', '1.65', '0'],
  lg:   ['18px', '1.6',  '-0.005em'],
  xl:   ['20px', '1.55', '-0.01em'],
  '2xl':['24px', '1.4',  '-0.015em'],
  '3xl':['30px', '1.3',  '-0.02em'],
  '4xl':['36px', '1.2',  '-0.022em'],
  '5xl':['48px', '1.12', '-0.025em'],
  '6xl':['60px', '1.05', '-0.03em'],
};

// Interactive control heights. Deliberately NOT density-scaled: 44px is an
// ergonomic floor from WCAG 2.2 target-size, not part of the visual rhythm.
// Buttons, inputs and selects all sit on these, so they line up in a row.
export const CONTROL_H = { xs: 28, sm: 36, md: 44, lg: 52, xl: 60 };

export const MOTION = {
  '--ease-out': 'cubic-bezier(0.16, 1, 0.3, 1)',   // already the site's easing
  '--ease-in-out': 'cubic-bezier(0.65, 0, 0.35, 1)',
  '--dur-fast': '140ms',
  '--dur-base': '200ms',
  '--dur-slow': '420ms',
};

export const CONTAINERS = {
  // A rail beside a document — wide enough for a contents entry to be read at a glance, narrow
  // enough that it is plainly not the document. A LAYOUT DIMENSION: this was reached for on the
  // spacing scale, where the nearest step is 96px, and a 96px rail wrapped every entry to twelve
  // lines and still overflowed.
  '--rail-w': '240px',
  '--container-sm': '640px',
  '--container-md': '768px',
  '--container-lg': '1024px',
  '--container-xl': '1280px',
  '--container-2xl': '1440px',
};
