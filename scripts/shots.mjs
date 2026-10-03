// Visual review (spec §19.5): screenshots at 390×844 in both themes. Run `npm run build` first.
// Usage: node scripts/shots.mjs [--port 4173]
import { chromium } from 'playwright';
import { createServer } from 'node:http';
import { readFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const dist = join(root, 'dist');
const out = join(root, 'screenshots');
await mkdir(out, { recursive: true });

const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.json': 'application/json', '.webmanifest': 'application/manifest+json' };
const server = createServer(async (req, res) => {
  let p = decodeURIComponent((req.url ?? '/').split('?')[0]).replace(/^\/kotodama/, '') || '/';
  if (p === '/' || p === '') p = '/index.html';
  let file = join(dist, p);
  if (!existsSync(file)) file = join(dist, 'index.html');
  try {
    const data = await readFile(file);
    res.writeHead(200, { 'content-type': MIME[extname(file)] ?? 'application/octet-stream' });
    res.end(data);
  } catch {
    res.writeHead(404).end();
  }
});
await new Promise((r) => server.listen(0, r));
const port = server.address().port;
const base = `http://localhost:${port}/kotodama/`;

const browser = await chromium.launch();
const steps = JSON.parse(process.env.SHOTS ?? 'null') ?? [
  { name: 'onboarding', path: '#/onboarding' },
  { name: 'map', path: '#/', setup: 'onboarded' },
  { name: 'lesson-r1-1', path: '#/lesson/r1-1', setup: 'onboarded', after: 'lesson' },
];

for (const scheme of ['light', 'dark']) {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, colorScheme: scheme, locale: 'es-ES' });
  const page = await ctx.newPage();
  page.on('pageerror', (e) => console.error(`[${scheme}] page error:`, e.message));
  page.on('console', (m) => m.type() === 'error' && console.error(`[${scheme}] console:`, m.text()));
  for (const step of steps) {
    await page.goto(base);
    if (step.setup === 'onboarded') {
      await page.evaluate(() => localStorage.setItem('kotodama-settings', JSON.stringify({ state: { onboarded: true, theme: 'system', romajiMode: 'auto', dailyGoal: 20, heartsEnabled: true, voiceRate: 1, userName: 'Alex', sfx: true, vibration: true, reducedMotion: false, exchangeRate: 170, voiceURI: null }, version: 1 })));
    }
    await page.reload(); // hydrate the seeded settings before routing
    await page.goto(base + step.path);
    await page.waitForTimeout(600);
    if (step.after === 'lesson') {
      await page.waitForSelector('text=Lo tengo', { timeout: 5000 }).catch(() => {});
      await page.screenshot({ path: join(out, `${step.name}-card-${scheme}.png`) });
      await page.click('text=Lo tengo').catch(() => {});
      await page.waitForTimeout(400);
      await page.screenshot({ path: join(out, `${step.name}-choice-${scheme}.png`) });
      const opt = page.locator('[role=option]').first();
      if (await opt.count()) {
        await opt.click();
        await page.click('text=Comprobar');
        await page.waitForTimeout(400);
        await page.screenshot({ path: join(out, `${step.name}-feedback-${scheme}.png`) });
      }
      continue;
    }
    await page.screenshot({ path: join(out, `${step.name}-${scheme}.png`), fullPage: step.fullPage ?? false });
  }
  await ctx.close();
}
await browser.close();
server.close();
console.log('screenshots written to', out);
