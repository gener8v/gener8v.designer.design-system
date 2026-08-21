// OKLab / OKLCH colour maths (Björn Ottosson) with sRGB gamut mapping.
// No dependencies — this file is the whole colour engine.

const srgbToLinear = (c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
const linearToSrgb = (c) => (c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055);

function linSrgbToOklab(r, g, b) {
  const l = 0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b;
  const m = 0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b;
  const s = 0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b;
  const l_ = Math.cbrt(l), m_ = Math.cbrt(m), s_ = Math.cbrt(s);
  return [
    0.2104542553 * l_ + 0.793617785 * m_ - 0.0040720468 * s_,
    1.9779984951 * l_ - 2.428592205 * m_ + 0.4505937099 * s_,
    0.0259040371 * l_ + 0.7827717662 * m_ - 0.808675766 * s_,
  ];
}

function oklabToLinSrgb(L, a, b) {
  const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = L - 0.0894841775 * a - 1.291485548 * b;
  const l = l_ ** 3, m = m_ ** 3, s = s_ ** 3;
  return [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ];
}

export function hexToRgb(hex) {
  const h = hex.replace('#', '').trim();
  const full = h.length === 3 ? h.split('').map((c) => c + c).join('') : h;
  return [
    parseInt(full.slice(0, 2), 16) / 255,
    parseInt(full.slice(2, 4), 16) / 255,
    parseInt(full.slice(4, 6), 16) / 255,
  ];
}

const to255 = (v) => Math.round(Math.min(1, Math.max(0, v)) * 255);
export const rgbToHex = ([r, g, b]) =>
  '#' + [r, g, b].map((v) => to255(v).toString(16).padStart(2, '0')).join('').toUpperCase();

export function hexToOklch(hex) {
  const [r, g, b] = hexToRgb(hex).map(srgbToLinear);
  const [L, a, bb] = linSrgbToOklab(r, g, b);
  const C = Math.hypot(a, bb);
  let H = (Math.atan2(bb, a) * 180) / Math.PI;
  if (H < 0) H += 360;
  return { L, C, H };
}

function oklchToSrgbRaw(L, C, H) {
  const rad = (H * Math.PI) / 180;
  const lin = oklabToLinSrgb(L, C * Math.cos(rad), C * Math.sin(rad));
  return lin.map(linearToSrgb);
}

const inGamut = (rgb) => rgb.every((v) => v >= -0.0001 && v <= 1.0001);

// Reduce chroma until the colour fits sRGB, preserving L and H.
export function oklchToHex(L, C, H) {
  if (inGamut(oklchToSrgbRaw(L, C, H))) return rgbToHex(oklchToSrgbRaw(L, C, H));
  let lo = 0, hi = C;
  for (let i = 0; i < 28; i++) {
    const mid = (lo + hi) / 2;
    if (inGamut(oklchToSrgbRaw(L, mid, H))) lo = mid; else hi = mid;
  }
  return rgbToHex(oklchToSrgbRaw(L, lo, H));
}

// WCAG 2.2 relative luminance + contrast, computed from hex.
export function luminance(hex) {
  const [r, g, b] = hexToRgb(hex).map(srgbToLinear);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function contrast(a, b) {
  const la = luminance(a), lb = luminance(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

// The shared perceptual lightness scale. Recovered from the Nocturne reference
// system's neutral ramp, so every ramp step carries the same visual weight.
export const STEPS = [100, 200, 300, 400, 500, 600, 700, 800, 900];
export const LIGHTNESS = [0.966, 0.923, 0.855, 0.762, 0.655, 0.548, 0.443, 0.34, 0.245];

// Chroma tapers toward both ends of the ramp so the lightest and darkest steps
// stay near-neutral, the way a printed ink ramp behaves.
const BELL = [0.30, 0.52, 0.74, 0.92, 1.0, 0.96, 0.82, 0.62, 0.40];

/**
 * Build a 100–900 ramp on the shared lightness scale.
 * Chroma is normalised so the step nearest `pin`'s own lightness reproduces
 * `pin`'s chroma — the ramp is genuinely "that colour, lighter and darker".
 */
export function ramp(pinHex, { chromaScale = 1 } = {}) {
  const { L: pinL, C: pinC, H } = hexToOklch(pinHex);
  let nearest = 0;
  for (let i = 1; i < LIGHTNESS.length; i++) {
    if (Math.abs(LIGHTNESS[i] - pinL) < Math.abs(LIGHTNESS[nearest] - pinL)) nearest = i;
  }
  const unit = (pinC / BELL[nearest]) * chromaScale;
  const out = {};
  STEPS.forEach((step, i) => {
    out[step] = oklchToHex(LIGHTNESS[i], unit * BELL[i], H);
  });
  return out;
}

// Neutrals do NOT use the bell. Chroma rises toward the dark end, so the
// highlights stay near-white while the shadows go distinctly cool — the
// behaviour of the greys already on gener8v.com, and the thing that keeps a
// light interface from reading as an undesigned default grey.
const NEUTRAL_CURVE = [0.14, 0.32, 0.50, 0.66, 0.76, 0.84, 0.92, 0.97, 1.0];

/** A near-neutral ramp: the ground hue, near-white at 100, cool ink at 900. */
export function neutralRamp(hue, chromaMax) {
  const out = {};
  STEPS.forEach((step, i) => {
    out[step] = oklchToHex(LIGHTNESS[i], chromaMax * NEUTRAL_CURVE[i], hue);
  });
  return out;
}
