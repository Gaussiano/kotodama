import type { Category, InfoCard, LessonNode, Phrase, PracticeWord, Region, RegionId, Scenario } from './types';
import { R0_CARDS, R0_NODES, R0_WORDS } from './r0';
import { R1_CARDS, R1_HEAR, R1_NODES, R1_SAY, R1_SCENARIOS, R1_WORDS } from './r1';
import { R2_CARDS, R2_HEAR, R2_NODES, R2_SAY, R2_SCENARIOS, R2_WORDS } from './r2';
import { R3_CARDS, R3_HEAR, R3_NODES, R3_SAY, R3_SCENARIOS, R3_WORDS } from './r3';
import { R4_CARDS, R4_HEAR, R4_NODES, R4_SAY, R4_SCENARIOS, R4_WORDS } from './r4';

export * from './types';
export { SCENES, SCENE_BY_ID } from './scenes';
export { KANJI, KANJI_BY_ID } from './kanji';
export { ALL_KANA, HIRAGANA, KATAKANA, KANA_BY_ID, ROW_ORDER, kanaIdsFor, kanaInRows } from './kana';

export const REGIONS: Region[] = [
  { id: 'r0', name: 'El campamento', theme: 'Hoguera, tierra', dateLabel: '3–4 oct', startDate: '2026-10-03', endDate: '2026-10-04' },
  { id: 'r1', name: 'El pueblo inicial', theme: 'Saludos y cortesía', dateLabel: '5–11 oct', startDate: '2026-10-05', endDate: '2026-10-11' },
  { id: 'r2', name: 'La taberna', theme: 'Restaurantes', dateLabel: '12–18 oct', startDate: '2026-10-12', endDate: '2026-10-18' },
  { id: 'r3', name: 'El mercado', theme: 'Tiendas, konbini y dinero', dateLabel: '19–25 oct', startDate: '2026-10-19', endDate: '2026-10-25' },
  { id: 'r4', name: 'El gran viaje', theme: 'Hotel, transporte y ayuda', dateLabel: '26 oct – 1 nov', startDate: '2026-10-26', endDate: '2026-11-01' },
];
export const REGION_BY_ID: Record<RegionId, Region> = Object.fromEntries(REGIONS.map((r) => [r.id, r])) as Record<RegionId, Region>;
export const REGION_ORDER: RegionId[] = ['r0', 'r1', 'r2', 'r3', 'r4'];

export const PHRASES: Phrase[] = [...R1_SAY, ...R1_HEAR, ...R2_SAY, ...R2_HEAR, ...R3_SAY, ...R3_HEAR, ...R4_SAY, ...R4_HEAR];
export const PHRASE_BY_ID: Record<string, Phrase> = Object.fromEntries(PHRASES.map((p) => [p.id, p]));

export const CARDS: InfoCard[] = [...R0_CARDS, ...R1_CARDS, ...R2_CARDS, ...R3_CARDS, ...R4_CARDS];
export const CARD_BY_ID: Record<string, InfoCard> = Object.fromEntries(CARDS.map((c) => [c.id, c]));

export const WORDS: PracticeWord[] = [...R0_WORDS, ...R1_WORDS, ...R2_WORDS, ...R3_WORDS, ...R4_WORDS];
export const WORD_BY_ID: Record<string, PracticeWord> = Object.fromEntries(WORDS.map((w) => [w.id, w]));

export const NODES: LessonNode[] = [...R0_NODES, ...R1_NODES, ...R2_NODES, ...R3_NODES, ...R4_NODES];
export const NODE_BY_ID: Record<string, LessonNode> = Object.fromEntries(NODES.map((n) => [n.id, n]));

export const SCENARIOS: Scenario[] = [...R1_SCENARIOS, ...R2_SCENARIOS, ...R3_SCENARIOS, ...R4_SCENARIOS];
export const SCENARIO_BY_ID: Record<string, Scenario> = Object.fromEntries(SCENARIOS.map((s) => [s.id, s]));

export const CATEGORY_LABEL: Record<Category | 'hear', string> = {
  basics: 'Básicos',
  restaurant: 'Restaurante',
  shopping: 'Tiendas',
  hotel: 'Hotel',
  transport: 'Moverse',
  help: 'Ayuda',
  hear: 'Lo que te dirán',
};

export const nodesOfRegion = (regionId: RegionId) => NODES.filter((n) => n.regionId === regionId);
export const phrasesOfRegion = (regionId: RegionId) => PHRASES.filter((p) => p.regionId === regionId);

/** Key dates of the plan (spec §1, §9, §11). */
export const PLAN = {
  trainingStart: '2026-10-03',
  trainingEnd: '2026-11-01',
  tripStart: '2026-11-02',
  tripEnd: '2026-11-16',
  /** Boxes 4–5 review at half interval from here (spec §8). */
  intensiveFrom: '2026-10-26',
} as const;
