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
console.log('icons written');
