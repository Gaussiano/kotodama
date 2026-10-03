// 360×780 pass (spec §17 phase 5): reuse shots.mjs with a narrower viewport via env.
process.env.SHOT_WIDTH = '360';
process.env.SHOT_HEIGHT = '780';
await import('./shots.mjs');
