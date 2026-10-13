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
    // ONE FAMILY. A second one was tried — a serif for headings — and taken back out: a product
    // that reads as one thing does not need two voices, and the hierarchy problem it was reaching
    // for was never a family problem.
    //
    // What was actually missing was a SIZE. Heading and body were both Inter at 500, so a heading
    // was body text very slightly bolder — and `h2` at 36px is a PAGE heading, which left nothing
    // for the name of a section inside a dense surface. Every surface filled that gap with an
    // 11px mono label above a 20px grey sentence: the name of the thing set smaller than the
    // commentary about it.
    //
    // `SectionHead` is that size, and 600 is the weight that makes it read as a heading beside
    // 400 body text. Size and weight, one family.
    heading: { family: 'Inter', class: 'grotesque', weights: [300, 400, 500, 600] },
    body: { family: 'Inter', class: 'grotesque', weights: [300, 400, 500, 600] },
    mono: { family: 'IBM Plex Mono', class: 'mono', weights: [400, 500, 600] },
    // 600, not the old 500: with no family change to carry it, the weight has to.
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

// Interactive control heights. Deliberately NOT density-scaled: these are
// ergonomics rather than visual rhythm, and buttons, inputs and selects all
// sit on them so they line up in a row.
//
// The floor is WCAG 2.2 2.5.8 Target Size (Minimum) at 24px. 2.5.5 asks 44 at
// AAA and the default sat there; at that height a button is the heaviest thing
// on a dense screen of figures.
export const CONTROL_H = { xs: 24, sm: 30, md: 36, lg: 44, xl: 52 };

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
  '--rail-w': '260px',
  '--container-sm': '640px',
  '--container-md': '768px',
  '--container-lg': '1024px',
  '--container-xl': '1280px',
  '--container-2xl': '1440px',
};
