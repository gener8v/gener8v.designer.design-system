/**
 * Whether a key press belongs to somebody typing, or to a control that wants the key for itself.
 *
 * A `J` typed into a reason box is a `J`, and an arrow in a text field moves the caret. Page-level
 * keys — list movement, stepping through sources — stand down for all of these.
 */
export function isTypingTarget(target: EventTarget | null): boolean {
  if (typeof HTMLElement === 'undefined' || !(target instanceof HTMLElement)) return false;
  if (target.isContentEditable) return true;
  return Boolean(target.closest(
    'input, textarea, select, [contenteditable="true"], [role="combobox"], [role="textbox"], [role="slider"], [role="spinbutton"]',
  ));
}

/**
 * Whether a modal surface is open that does NOT contain `within` — so a page's own keys stand
 * down while a dialog owns the keyboard, but keys bound inside that dialog still work.
 */
export function modalAbove(within?: Element | null): boolean {
  if (typeof document === 'undefined') return false;
  const open = document.querySelectorAll('[role="dialog"][aria-modal="true"], [role="alertdialog"][aria-modal="true"], dialog[open]');
  if (!open.length) return false;
  const top = open[open.length - 1]!;
  return !(within && top.contains(within));
}

/** A key press with a modifier is somebody's shortcut, never a page key. */
export const modified = (e: KeyboardEvent) => e.metaKey || e.ctrlKey || e.altKey;
