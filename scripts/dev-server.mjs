#!/usr/bin/env node
// Serves design/ so component pages can be reviewed in a real browser.
import { createServer } from 'node:http';
import { readFile, stat, readdir } from 'node:fs/promises';
import { THEME_BOOT, THEME_CONTROL, THEME_CSS } from './lab-theme.mjs';
import { join, extname, resolve } from 'node:path';

const ROOT = resolve(process.cwd(), 'design');
const PORT = Number(process.env.PORT ?? 4321);
/** The ground control, on any page that has not already been given one. */
function withGroundControl(html) {
  if (html.includes('lab-theme')) return html;
  return html
    .replace('</head>', `<style>${THEME_CSS}</style>${THEME_BOOT}</head>`)
    .replace(/<body([^>]*)>/, (m) => `${m}${THEME_CONTROL}`);
}

const MIME = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8', '.json': 'application/json',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg',
  '.woff2': 'font/woff2', '.ico': 'image/x-icon',
};

async function index() {
  const rows = [];
  for (const dir of ['foundations', 'components', 'templates']) {
    let entries = [];
    try { entries = await readdir(join(ROOT, dir), { withFileTypes: true }); } catch { continue; }
    const files = entries.filter((e) => e.isFile() && e.name.endsWith('.html')).map((e) => `${dir}/${e.name}`);
    if (files.length) rows.push(`<h2>${dir}</h2><ul>${files.map((f) => `<li><a href="/${f}">${f}</a></li>`).join('')}</ul>`);
  }
  return `<!doctype html><meta charset="utf-8"><title>GENER8V design lab</title>
<link rel="stylesheet" href="/styles.css">
<main class="container section"><p class="label">Design lab</p><h1>GENER8V</h1>${rows.join('')}</main>`;
}

createServer(async (req, res) => {
  const url = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  if (url === '/' || url === '/index.html') {
    // Prefer the generated home page; fall back to a listing if not built yet.
    try {
      const body = await readFile(join(ROOT, 'index.html'));
      res.writeHead(200, { 'content-type': MIME['.html'], 'cache-control': 'no-store' });
      return res.end(body);
    } catch {
      res.writeHead(200, { 'content-type': MIME['.html'] });
      return res.end(await index());
    }
  }
  const file = join(ROOT, url);
  if (!file.startsWith(ROOT)) { res.writeHead(403); return res.end('forbidden'); }
  try {
    const s = await stat(file);
    if (!s.isFile()) throw new Error('not a file');
    const body = await readFile(file);
    /*
     * THE COMPONENT PAGES ARE AUTHORED, SO THEY GET THE CONTROL HERE.
     *
     * `build-pages.mjs` puts the ground control on the pages it generates. The sixteen component
     * pages are hand-written, and sixteen copies of one script is sixteen things to keep in step —
     * so the server adds it to any page that does not already carry it. Same snippet, imported
     * from the same module, which is the whole point.
     */
    const html = extname(file) === '.html' ? withGroundControl(body.toString('utf8')) : body;
    res.writeHead(200, { 'content-type': MIME[extname(file)] ?? 'application/octet-stream', 'cache-control': 'no-store' });
    res.end(html);
  } catch {
    res.writeHead(404, { 'content-type': MIME['.html'] });
    res.end('<h1>404</h1>');
  }
}).listen(PORT, () => console.log(`design lab → http://localhost:${PORT}`));
