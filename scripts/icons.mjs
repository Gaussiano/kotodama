// Renders the PWA icons from public/icons/icon.svg. Dev-only (sharp); outputs are committed.
import sharp from 'sharp';
import { readFileSync, writeFileSync } from 'node:fs';

const svg = readFileSync(new URL('../public/icons/icon.svg', import.meta.url));
const out = (name) => new URL(`../public/icons/${name}`, import.meta.url);

const render = (size) => sharp(svg, { density: 384 }).resize(size, size).png().toBuffer();

writeFileSync(out('icon-192.png'), await render(192));
writeFileSync(out('icon-512.png'), await render(512));
writeFileSync(out('apple-touch-icon.png'), await render(180));

// Maskable: same art inside the 80 % safe zone over the forest green.
const inner = await render(410);
const maskable = await sharp({ create: { width: 512, height: 512, channels: 4, background: '#1D5C48' } })
  .composite([{ input: inner, left: 51, top: 51 }])
  .png()
  .toBuffer();
writeFileSync(out('icon-maskable-512.png'), maskable);

// Android launcher icons (only when the Capacitor project exists).
import { existsSync, mkdirSync } from 'node:fs';
const res = new URL('../android/app/src/main/res/', import.meta.url);
if (existsSync(res)) {
  const densities = { mdpi: 48, hdpi: 72, xhdpi: 96, xxhdpi: 144, xxxhdpi: 192 };
  for (const [d, size] of Object.entries(densities)) {
    const dir = new URL(`mipmap-${d}/`, res);
    mkdirSync(dir, { recursive: true });
    const png = await render(size);
    writeFileSync(new URL('ic_launcher.png', dir), png);
    writeFileSync(new URL('ic_launcher_round.png', dir), await sharp(png).composite([{ input: Buffer.from(`<svg width="${size}" height="${size}"><circle cx="${size / 2}" cy="${size / 2}" r="${size / 2}"/></svg>`), blend: 'dest-in' }]).png().toBuffer());
    // Adaptive foreground: 108 dp canvas, art inside the 72 dp safe zone.
    const fg = Math.round(size * 108 / 48);
    const innerSize = Math.round(fg * 0.6);
    writeFileSync(new URL('ic_launcher_foreground.png', dir), await sharp({ create: { width: fg, height: fg, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } }).composite([{ input: await render(innerSize), left: Math.round((fg - innerSize) / 2), top: Math.round((fg - innerSize) / 2) }]).png().toBuffer());
  }
  console.log('android icons written');
}
console.log('icons written');
