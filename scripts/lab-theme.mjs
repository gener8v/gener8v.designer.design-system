// Shared by the page generator and the dev server, so the authored component pages and the
// generated foundations pages get the SAME control rather than two that drift.

/*
 * THE LAB CAN SHOW ITS OWN DARK MODE.
 *
 * The system shipped a dark ground and its own showcase had no way to display it, which is the
 * design-system equivalent of a feature with no door.
 *
 * Three states, and the middle one stamps NOTHING: `@media (prefers-color-scheme: dark)` is what
 * makes "system" work, so writing `data-theme="system"` would match neither rule and pin a reader
 * who asked for neither. Applied in the HEAD, before first paint — an effect after paint flashes
 * the whole page white on every navigation for somebody reading in dark.
 */
export const THEME_BOOT = `<script>
(function () {
  try {
    var g = localStorage.getItem('gener8v.lab.theme');
    if (g === 'light' || g === 'dark') document.documentElement.setAttribute('data-theme', g);
  } catch (e) { /* private windows throw on access; the OS preference still applies */ }
})();
</script>`;

export const THEME_CONTROL = `<div class="lab-theme">
  <div class="segmented" role="radiogroup" aria-label="Ground">
    <button type="button" class="segmented-item" role="radio" data-ground="system">System</button>
    <button type="button" class="segmented-item" role="radio" data-ground="light">Light</button>
    <button type="button" class="segmented-item" role="radio" data-ground="dark">Dark</button>
  </div>
</div>
<script>
(function () {
  var KEY = 'gener8v.lab.theme';
  var root = document.documentElement;
  var buttons = [].slice.call(document.querySelectorAll('[data-ground]'));
  function read() { try { return localStorage.getItem(KEY) || 'system'; } catch (e) { return 'system'; } }
  function paint(g) {
    buttons.forEach(function (b) { b.setAttribute('aria-checked', String(b.dataset.ground === g)); });
  }
  function set(g) {
    if (g === 'system') root.removeAttribute('data-theme');
    else root.setAttribute('data-theme', g);
    try { g === 'system' ? localStorage.removeItem(KEY) : localStorage.setItem(KEY, g); } catch (e) {}
    paint(g);
  }
  buttons.forEach(function (b) { b.addEventListener('click', function () { set(b.dataset.ground); }); });
  paint(read());
})();
</script>`;

export const THEME_CSS = `
.lab-theme { position: fixed; inset-block-start: var(--space-4); inset-inline-end: var(--space-4); z-index: 90; }
@media print { .lab-theme { display: none; } }
`;
