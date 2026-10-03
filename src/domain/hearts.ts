// Hearts (spec §5): max 5, regenerate 1 every 30 min, computed lazily from timestamps.

export const MAX_HEARTS = 5;
export const REGEN_MS = 30 * 60 * 1000;

export interface Hearts {
  count: number;
  updatedAt: string; // ISO timestamp of the last change (regen reference)
}

export function regenHearts(h: Hearts, now: Date): Hearts {
  if (h.count >= MAX_HEARTS) return { count: MAX_HEARTS, updatedAt: now.toISOString() };
  const elapsed = now.getTime() - new Date(h.updatedAt).getTime();
  if (elapsed < REGEN_MS) return h;
  const gained = Math.floor(elapsed / REGEN_MS);
  const count = Math.min(MAX_HEARTS, h.count + gained);
  const updatedAt =
    count >= MAX_HEARTS ? now.toISOString() : new Date(new Date(h.updatedAt).getTime() + gained * REGEN_MS).toISOString();
  return { count, updatedAt };
}

export function loseHeart(h: Hearts, now: Date): Hearts {
  const cur = regenHearts(h, now);
  if (cur.count <= 0) return cur;
  // Start the regen clock when leaving the full state.
  const updatedAt = cur.count === MAX_HEARTS ? now.toISOString() : cur.updatedAt;
  return { count: cur.count - 1, updatedAt };
}

export function gainHeart(h: Hearts, now: Date, n = 1): Hearts {
  const cur = regenHearts(h, now);
  return { count: Math.min(MAX_HEARTS, cur.count + n), updatedAt: cur.updatedAt };
}

/** Milliseconds until the next heart, or 0 when full. */
export function msToNextHeart(h: Hearts, now: Date): number {
  const cur = regenHearts(h, now);
  if (cur.count >= MAX_HEARTS) return 0;
  const next = new Date(cur.updatedAt).getTime() + REGEN_MS;
  return Math.max(0, next - now.getTime());
}
