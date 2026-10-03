// Content model (spec §13). Content files are plain typed data; no logic lives here except helpers
// that derive fields (segments, hasBlank) so the hand-written data stays close to the dossier format.

export type RegionId = 'r0' | 'r1' | 'r2' | 'r3' | 'r4' | 'r5';

export type Category = 'basics' | 'restaurant' | 'shopping' | 'hotel' | 'transport' | 'help';

export const BLANK = '＿＿';

export interface Phrase {
  id: string; // 'r2-p13'
  regionId: RegionId;
  kind: 'say' | 'hear'; // 'hear' = «Lo que te dirán»
  kana: string; // with spaces between segments
  romaji: string;
  es: string;
  note?: string;
  kanji?: string; // natural form with kanji, for «Enseñar al personal»
  /** Text sent to the TTS when the kana field contains Latin (e.g. «Wi-Fi»). */
  speech?: string;
  segments: string[]; // derived from kana.split(' ')
  category: Category;
  hasBlank?: boolean; // contains ＿＿
  equivalents?: string[]; // ids of phrases that are also correct in a situation
  suggestedReplies?: string[]; // only for 'hear': ids of valid replies
  generated?: boolean; // not in the dossier: flagged for review
  /** Not a dossier entry on its own (e.g. はい split from «はい / いいえ»). Usable as an option, hidden in the Grimoire. */
  hidden?: boolean;
  /** Excluded from build/type exercises (e.g. «はい / いいえ»). */
  production?: boolean;
  /** Dossier number inside its region list, for display («frase 13»). */
  n?: number;
}

export interface KanaChar {
  id: string; // 'h-ka', 'k-sha'
  char: string;
  romaji: string;
  script: 'hiragana' | 'katakana';
  group: 'basic' | 'dakuten' | 'handakuten' | 'yoon' | 'extended';
  row: string; // 'k', 's', 'ky'...
}

export interface PracticeWord {
  id: string;
  regionId: RegionId;
  kana: string;
  romaji: string;
  es: string;
  requiredKana: string[];
}

export interface InfoCard {
  id: string;
  regionId: RegionId;
  type: 'grammar' | 'culture' | 'pronunciation' | 'alert';
  title: string;
  body: string; // simple markdown: paragraphs separated by blank lines, «- » bullets, **bold**
  examples?: { jp: string; romaji: string; es: string }[];
}

export type NodeKind = 'intro' | 'phrases' | 'kana' | 'heard' | 'review' | 'prices' | 'signs' | 'listening' | 'boss' | 'finalBoss';

export interface LessonNode {
  id: string; // 'r2-3'
  regionId: RegionId;
  title: string;
  /** One line shown in the bottom sheet: what you will learn. */
  summary: string;
  kind: NodeKind;
  phraseIds: string[];
  kanaIds: string[];
  infoCardIds: string[];
  practiceWordIds?: string[];
  sceneId?: string;
  /** Survival kanji trained with E14 in this node. */
  kanjiIds?: string[];
  /** Extra drills: 'prices' adds E12, 'clock' adds E13. */
  extras?: ('prices' | 'clock')[];
  recommendedDate: string; // ISO 'YYYY-MM-DD' ('' for extra nodes)
  /** Outside the dossier calendar («Tu ruta»): never «Hoy toca», not counted as «behind». */
  extra?: boolean;
  /** Human label from the dossier calendar («Mié 7 – Jue 8»). */
  dayLabel: string;
}

export type ScenarioOption = { phraseId: string } | { gesture: string };

export interface Scenario {
  id: string;
  regionId: RegionId;
  promptEs: string;
  correctPhraseIds: string[]; // or [] when the right answer is a gesture
  gestureAnswer?: string; // e.g. «No hace falta decir nada; basta un gesto o どうも»
  acceptAll?: boolean; // several valid answers
  explanation?: string;
}

export interface SceneTurn {
  /** NPC line: a phrase id (usually a 'hear' phrase) or raw text for generated lines. */
  npc?: { phraseId: string } | { kana: string; romaji: string; es: string; generated: true };
  /** Narration in Spanish shown above the turn. */
  narration?: string;
  /** Player choices: phrase ids; `correct` lists the acceptable ones. A gesture option is allowed. */
  options?: ScenarioOption[];
  correct?: (string | 'gesture')[];
  /** Fill value for ＿＿ in the player phrase (e.g. the hotel name) */
  fill?: string;
}

export interface Scene {
  id: string;
  regionId: RegionId;
  title: string;
  setting: string;
  npcRole: 'clerk' | 'receptionist' | 'waiter' | 'conductor' | 'passerby' | 'driver';
  turns: SceneTurn[];
}

export interface Region {
  id: RegionId;
  name: string;
  theme: string; // short ambient subtitle
  dateLabel: string; // «5–11 oct»
  startDate: string;
  endDate: string;
}

export interface KanjiSign {
  id: string;
  kanji: string;
  romaji: string;
  es: string;
  sign: 'door' | 'toilet' | 'station' | 'price' | 'shop' | 'notice' | 'board' | 'direction' | 'menu' | 'onsen';
  group: 'base' | 'transport' | 'street' | 'menu' | 'onsen';
}

// ─── helpers ────────────────────────────────────────────────────────────────

type PhraseInput = Omit<Phrase, 'segments' | 'hasBlank' | 'kind' | 'regionId' | 'category'> &
  Partial<Pick<Phrase, 'kind' | 'category'>>;

export function definePhrases(regionId: RegionId, defaultCategory: Category, kind: 'say' | 'hear', list: PhraseInput[]): Phrase[] {
  return list.map((p) => {
    const kana = p.kana.trim();
    const singleSegment = kana.includes('/') || p.production === false;
    return {
      ...p,
      regionId,
      kind: p.kind ?? kind,
      category: p.category ?? defaultCategory,
      kana,
      segments: singleSegment ? [kana] : kana.split(/\s+/),
      hasBlank: kana.includes(BLANK) || undefined,
    };
  });
}
