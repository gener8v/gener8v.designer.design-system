import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

/**
 * A modal names the layer it is on, or it is not modal.
 *
 * The drawer's scrim and panel were positioned with no `z-index`, so they sat
 * above the page only for as long as nothing else on it was raised — and the
 * panel says `aria-modal="true"`, which is a promise about the whole surface.
 *
 * A sticky page header with `z-index: 2` is the most ordinary thing a screen
 * has, and it painted its own white band across an open drawer in the product
 * that reads this system: the panel's heading came out sliced in half and the
 * two lines under it were gone. Nothing was wrong with the drawer's layout —
 * every box measured where it should be. It was the paint order.
 *
 * Positioned and unlayered is the shape of that fault, so that is what this
 * reads: an overlay declares its layer, and no overlay sits below the backdrop
 * a dialog already uses.
 */
const STYLES = readFileSync(join(__dirname, '..', 'design', 'styles.css'), 'utf8');

/** The selectors this system draws over the surface rather than in it. */
const OVERLAYS = [
  '.dialog-backdrop',
  '.drawer-scrim',
  '.drawer-panel',
  '.toast-region',
  '.command-backdrop',
];

/** The `z-index` a rule declares, or null where it declares none. */
function layerOf(css: string, selector: string): number | null {
  const at = css.indexOf(`\n${selector} {`);
  if (at === -1) return null;
  const block = css.slice(at, css.indexOf('\n}', at));
  const found = block.match(/z-index:\s*(-?\d+)/);
  return found ? Number(found[1]) : null;
}

describe('the check itself', () => {
  it('reports an overlay that names no layer', () => {
    expect(layerOf('\n.drawer-panel {\n  position: absolute;\n}\n', '.drawer-panel')).toBeNull();
  });

  it('reads the layer where one is named', () => {
    expect(layerOf('\n.drawer-panel {\n  z-index: 50;\n}\n', '.drawer-panel')).toBe(50);
  });
});

describe('every overlay in the system', () => {
  it('names the layer it is on', () => {
    const unlayered = OVERLAYS.filter((s) => layerOf(STYLES, s) === null);
    expect(unlayered, `positioned over the page and stacked by luck: ${unlayered.join(', ')}`)
      .toEqual([]);
  });

  /** A drawer takes the surface exactly as a dialog does, so it sits no lower. */
  it('puts the drawer no lower than the backdrop a dialog uses', () => {
    const dialog = layerOf(STYLES, '.dialog-backdrop')!;
    expect(layerOf(STYLES, '.drawer-scrim')).toBeGreaterThanOrEqual(dialog);
    expect(layerOf(STYLES, '.drawer-panel')).toBeGreaterThanOrEqual(dialog);
  });
});
