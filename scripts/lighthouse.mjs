// Phase 5 audit (spec §15, §17): Lighthouse PWA/accessibility/performance on the built app.
// Uses Playwright's Chromium so no separate Chrome install is needed. Run `npm run build` first.
import lighthouse from 'lighthouse';
import { launch } from 'chrome-launcher';
import { chromium } from 'playwright';
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const dist = join(root, 'dist');
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.json': 'application/json', '.webmanifest': 'application/manifest+json' };
const server = createServer(async (req, res) => {
  let p = decodeURIComponent((req.url ?? '/').split('?')[0]).replace(/^\/kotodama/, '') || '/';
  if (p === '/' || p === '') p = '/index.html';
  let file = join(dist, p);
  if (!existsSync(file)) file = join(dist, 'index.html');
  try {
    const data = await readFile(file);
    res.writeHead(200, { 'content-type': MIME[extname(file)] ?? 'application/octet-stream', 'cache-control': 'public, max-age=3600' });
    res.end(data);
  } catch {
    res.writeHead(404).end();
  }
});
await new Promise((r) => server.listen(0, r));
const url = `http://localhost:${server.address().port}/kotodama/`;

const chromePath = chromium.executablePath();
const chrome = await launch({ chromePath, chromeFlags: ['--headless=new', '--no-sandbox'] });
const result = await lighthouse(url, { port: chrome.port, output: 'json', logLevel: 'error', onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'], formFactor: 'mobile', screenEmulation: { mobile: true, width: 390, height: 844, deviceScaleFactor: 2, disabled: false } });
const cats = result.lhr.categories;
for (const [k, v] of Object.entries(cats)) console.log(`${k}: ${Math.round((v.score ?? 0) * 100)}`);
const failing = Object.values(result.lhr.audits).filter((a) => a.score !== null && a.score < 0.9 && !a.scoreDisplayMode?.includes('notApplicable'));
for (const a of failing) console.log(` - ${a.id}: ${a.title} (${Math.round((a.score ?? 0) * 100)})`);
const sw = result.lhr.audits['installable-manifest'] ?? result.lhr.audits['service-worker'];
if (sw) console.log('pwa check:', sw.id, sw.score);
await chrome.kill();
server.close();
