import type { RegionId } from '@/content';
import type { RomajiMode } from '@/store/settingsStore';

/** Romaji visibility (spec §7.4). `revealed` = the answer has been checked or the hint was used. */
export function romajiVisible(mode: RomajiMode, regionId: RegionId | 'dojo', revealed: boolean): boolean {
  switch (mode) {
    case 'always':
      return true;
    case 'never':
      return false;
    case 'after':
      return revealed;
    case 'auto':
      if (regionId === 'dojo') return revealed;
      if (regionId === 'r0' || regionId === 'r1' || regionId === 'r2' || regionId === 'r5') return true;
      return revealed;
  }
}

/** In auto mode for R3–R4, a «Ver romaji» hint button exists and counts as a hint. */
export function romajiHintAvailable(mode: RomajiMode, regionId: RegionId | 'dojo'): boolean {
  return mode === 'auto' && (regionId === 'r3' || regionId === 'r4' || regionId === 'dojo');
}
