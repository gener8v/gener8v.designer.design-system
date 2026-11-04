/* THE DOCUMENTATION CHROME, for static pages.
 *
 * Source for `design/assets/docs.js`; `packages/tokens/build-pages.mjs` prepends the nav data and
 * the stylesheet and writes the result. Every docs page loads it with ONE line in its head:
 *
 *   <script src="../assets/docs.js"></script>                      a docs page
 *   <script src="../../assets/docs.js" data-docs="template"></script>   a template (no rail)
 *
 * Why a script and not a build-time wrapper: twenty component pages are hand-written and
 * hand-edited, and a wrapper would turn each of them into generated output nobody may touch. With
 * this, a component page stays a plain HTML file that also works on its own, and the nav lives in
 * one place.
 *
 * It runs in the head, before first paint, so the theme is applied and the layout reserved before
 * anything is drawn. The links it writes are relative — taken from its own `src` — so the site works
 * at the root of a host and under a sub-path alike. */
(function () {
  'use strict';
  var NAV = window.__DOCS_NAV__;
  var KEY = 'gener8v.docs.theme';
  var OPEN_KEY = 'gener8v.docs.open';
  var root = document.documentElement;
  var me = document.currentScript;
  var prefix = (me && me.getAttribute('src') || '').replace(/assets\/docs\.js(\?.*)?$/, '');
  var mode = (me && me.getAttribute('data-docs')) || 'page';

  /* ---------------------------------------------------------------- theme
   * LIGHT UNLESS SOMEBODY CHOSE DARK. Stamping `data-theme="light"` is what stops the OS preference
   * from flipping the page: the stylesheet's dark block is `:root:not([data-theme="light"])`. */
  function storedTheme() {
    try { return localStorage.getItem(KEY) === 'dark' ? 'dark' : 'light'; } catch (e) { return 'light'; }
  }
  function setTheme(g, save) {
    root.setAttribute('data-theme', g);
    if (save) { try { localStorage.setItem(KEY, g); } catch (e) { /* private windows throw */ } }
    var radios = document.querySelectorAll('[data-docs-theme]');
    for (var i = 0; i < radios.length; i++) {
      var on = radios[i].getAttribute('data-docs-theme') === g;
      radios[i].setAttribute('aria-checked', String(on));
      radios[i].tabIndex = on ? 0 : -1;
    }
  }
  setTheme(storedTheme(), false);
  root.setAttribute('data-docs', mode);
  var style = document.createElement('style');
  style.textContent = window.__DOCS_CSS__;
  document.head.appendChild(style);

  /* ---------------------------------------------------------------- where am I */
  function norm(path) { return path.replace(/index\.html$/, '').replace(/\.html$/, '').replace(/\/+$/, '/'); }
  function resolve(p) { return new URL(prefix + p, location.href); }
  var here = norm(location.pathname);
  function isHere(p) { return norm(resolve(p).pathname) === here; }

  var ICON = {
    out: '<svg viewBox="0 0 256 256" fill="currentColor" aria-hidden="true" focusable="false"><path d="M200,64V168a8,8,0,0,1-16,0V83.31L69.66,197.66a8,8,0,0,1-11.32-11.32L172.69,72H88a8,8,0,0,1,0-16H192A8,8,0,0,1,200,64Z"/></svg>',
    back: '<svg viewBox="0 0 256 256" fill="currentColor" aria-hidden="true" focusable="false"><path d="M224,128a8,8,0,0,1-8,8H59.31l58.35,58.34a8,8,0,0,1-11.32,11.32l-72-72a8,8,0,0,1,0-11.32l72-72a8,8,0,0,1,11.32,11.32L59.31,120H216A8,8,0,0,1,224,128Z"/></svg>',
  };
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;'); }

  var current = null;
  NAV.sections.forEach(function (s) {
    s.items.forEach(function (it) { if (isHere(it.path)) current = { section: s, item: it }; });
  });

  if (mode === 'template') {
    document.addEventListener('DOMContentLoaded', function () {
      var bar = document.createElement('div');
      bar.className = 'docs-return';
      bar.innerHTML = '<a href="' + esc(prefix + NAV.templatesHref) + '">' + ICON.back + 'Design system</a>'
        + (current ? '<span aria-hidden="true">/</span><span>' + esc(current.item.title) + '</span>' : '');
      document.body.insertBefore(bar, document.body.firstChild);
    });
    return;
  }

  /* ---------------------------------------------------------------- the rail */
  function readOpen() {
    try { var v = JSON.parse(localStorage.getItem(OPEN_KEY) || 'null'); return v && typeof v === 'object' ? v : {}; } catch (e) { return {}; }
  }
  function saveOpen(id, open) {
    var v = readOpen(); v[id] = open;
    try { localStorage.setItem(OPEN_KEY, JSON.stringify(v)); } catch (e) { /* not fatal */ }
  }

  function item(it, external) {
    var cur = current && current.item === it;
    return '<a class="sidebar-item" href="' + esc(prefix + it.path) + '"' + (cur ? ' aria-current="page"' : '') + '>'
      + esc(it.title) + (external ? '<span class="docs-ext" title="Opens full screen">' + ICON.out + '<span class="sr-only"> (opens full screen)</span></span>' : '') + '</a>';
  }

  function rail(idp) {
    var open = readOpen();
    var html = '<nav class="sidebar" aria-label="Design system">';
    NAV.sections.forEach(function (s) {
      if (!s.title) {
        html += '<div class="sidebar-section">' + s.items.map(function (it) { return item(it); }).join('') + '</div>';
        return;
      }
      var mine = current && current.section === s;
      var expanded = mine || (s.id in open ? open[s.id] : false);
      var id = idp + '-' + s.id;
      html += '<div class="sidebar-section">'
        + '<button type="button" class="sidebar-group sidebar-group-toggle" aria-expanded="' + expanded + '" aria-controls="' + id + '" data-section="' + s.id + '">' + esc(s.title) + '</button>'
        + '<div id="' + id + '" class="sidebar-section-items"' + (expanded ? '' : ' hidden') + '>'
        + s.items.map(function (it) { return item(it, s.external); }).join('')
        + '</div></div>';
    });
    return html + '</nav>' + foot();
  }

  function foot() {
    return '<div class="docs-foot">'
      + '<div class="segmented" role="radiogroup" aria-label="Theme">'
      + '<button type="button" class="segmented-item" role="radio" data-docs-theme="light">Light</button>'
      + '<button type="button" class="segmented-item" role="radio" data-docs-theme="dark">Dark</button>'
      + '</div>'
      + '<p class="docs-foot-links"><a href="' + NAV.links.site + '">gener8v.com</a><a href="' + NAV.links.github + '">GitHub</a><a href="' + NAV.links.license + '">MIT licence</a></p>'
      + '</div>';
  }

  function header() {
    return '<header class="docs-top"><nav class="nav" aria-label="Site">'
      + '<button type="button" class="hamburger docs-burger" aria-expanded="false" aria-controls="docs-drawer" aria-label="Open navigation">'
      + '<span class="hamburger-box"><span class="hamburger-bar"></span><span class="hamburger-bar"></span><span class="hamburger-bar"></span></span></button>'
      + '<a class="nav-brand" href="' + esc(prefix + 'index.html') + '"><img src="' + esc(prefix + 'assets/logo.png') + '" alt="" />GENER8V<span class="docs-brand-sub">Design system</span></a>'
      + '<div class="nav-links">'
      + '<a class="nav-item docs-out" href="' + NAV.links.github + '">GitHub</a>'
      + '<a class="nav-item docs-out" href="' + NAV.links.site + '">gener8v.com' + ICON.out + '</a>'
      + '</div></nav></header>';
  }

  /* ---------------------------------------------------------------- the drawer
   * The system's Drawer, as markup: a modal from the start edge that traps Tab, closes on Escape
   * and on the scrim, and gives focus back to the button that opened it. */
  var burger, scrim, panel, lastFocus;
  function focusables() {
    return [].slice.call(panel.querySelectorAll('a[href], button:not([disabled]), [tabindex="0"]'))
      .filter(function (el) { return !el.closest('[hidden]') && el.tabIndex !== -1; });
  }
  function openDrawer() {
    lastFocus = document.activeElement;
    scrim.hidden = false; panel.hidden = false;
    root.classList.add('docs-locked');
    burger.setAttribute('aria-expanded', 'true');
    var cur = panel.querySelector('[aria-current="page"]');
    (cur || panel.querySelector('.drawer-close')).focus();
  }
  function closeDrawer() {
    if (panel.hidden) return;
    scrim.hidden = true; panel.hidden = true;
    root.classList.remove('docs-locked');
    burger.setAttribute('aria-expanded', 'false');
    (lastFocus && lastFocus.focus ? lastFocus : burger).focus();
  }

  function wire(scope) {
    [].forEach.call(scope.querySelectorAll('.sidebar-group-toggle'), function (b) {
      b.addEventListener('click', function () {
        var open = b.getAttribute('aria-expanded') !== 'true';
        b.setAttribute('aria-expanded', String(open));
        document.getElementById(b.getAttribute('aria-controls')).hidden = !open;
        saveOpen(b.getAttribute('data-section'), open);
      });
    });
    [].forEach.call(scope.querySelectorAll('[role="radiogroup"]'), function (group) {
      var radios = [].slice.call(group.querySelectorAll('[data-docs-theme]'));
      radios.forEach(function (r, i) {
        r.addEventListener('click', function () { setTheme(r.getAttribute('data-docs-theme'), true); });
        r.addEventListener('keydown', function (e) {
          var d = e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? -1 : 0;
          if (!d) return;
          e.preventDefault();
          var next = radios[(i + d + radios.length) % radios.length];
          setTheme(next.getAttribute('data-docs-theme'), true);
          next.focus();
        });
      });
    });
  }

  function build() {
    var main = document.querySelector('main');
    if (main) {
      if (!main.id) main.id = 'main';
      if (!main.hasAttribute('tabindex')) main.setAttribute('tabindex', '-1');
      /* A page that has no heading of its own takes its name and line from its @dsCard, which is
         where the overview's card reads them too — one source for what a page is called. */
      var meta = current && current.item;
      if (meta && !main.querySelector('h1')) {
        var head = document.createElement('div');
        head.className = 'docs-head';
        head.innerHTML = '<h1>' + esc(meta.title) + '</h1>' + (meta.subtitle ? '<p class="lede">' + esc(meta.subtitle) + '</p>' : '');
        main.insertBefore(head, main.firstChild);
      }
    }
    var chrome = document.createElement('div');
    chrome.innerHTML = '<a class="docs-skip" href="#' + (main ? main.id : 'main') + '">Skip to content</a>'
      + header()
      + '<div class="docs-rail">' + rail('docs-rail') + '</div>'
      + '<div class="drawer-scrim docs-drawer" hidden></div>'
      + '<div class="drawer-panel docs-drawer" id="docs-drawer" data-side="start" role="dialog" aria-modal="true" aria-label="Navigation" hidden>'
      + '<button type="button" class="drawer-close" aria-label="Close navigation"><svg viewBox="0 0 16 16" aria-hidden="true" focusable="false"><path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" fill="none"/></svg></button>'
      + rail('docs-drawer') + '</div>';
    var nodes = [].slice.call(chrome.childNodes);
    for (var i = nodes.length - 1; i >= 0; i--) document.body.insertBefore(nodes[i], document.body.firstChild);

    burger = document.querySelector('.docs-burger');
    scrim = document.querySelector('.drawer-scrim.docs-drawer');
    panel = document.getElementById('docs-drawer');
    burger.addEventListener('click', openDrawer);
    scrim.addEventListener('click', closeDrawer);
    panel.querySelector('.drawer-close').addEventListener('click', closeDrawer);
    panel.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { e.preventDefault(); closeDrawer(); return; }
      if (e.key !== 'Tab') return;
      var f = focusables(); if (!f.length) return;
      var first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    });
    /* A drawer left open while the window widens past the rail's breakpoint would trap focus in a
       panel the reader can no longer see the point of. */
    var wide = window.matchMedia('(min-width: 960px)');
    var onWide = function () { if (wide.matches) closeDrawer(); };
    if (wide.addEventListener) wide.addEventListener('change', onWide);

    wire(document);
    setTheme(root.getAttribute('data-theme'), false);
    var cur = document.querySelector('.docs-rail [aria-current="page"]');
    if (cur) { var list = cur.closest('.sidebar'); list.scrollTop = Math.max(0, cur.offsetTop - list.clientHeight / 2); }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', build);
  else build();
})();
