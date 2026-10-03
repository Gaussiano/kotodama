import type { InfoCard, LessonNode, PracticeWord } from './types';
import { kanaIdsFor } from './kana';

// Región 0 · El campamento (3–4 oct) — spec §10.1

export const R0_CARDS: InfoCard[] = [
  { id: 'r0-c-h', regionId: 'r0', type: 'pronunciation', title: 'h', body: 'Una «j» muy suave, como un suspiro.', examples: [{ jp: 'はい', romaji: 'hai', es: 'sí' }] },
  { id: 'r0-c-r', regionId: 'r0', type: 'pronunciation', title: 'r', body: 'La «r» suave de «pero».', examples: [{ jp: 'ラーメン', romaji: 'rāmen', es: 'ramen' }] },
  { id: 'r0-c-j', regionId: 'r0', type: 'pronunciation', title: 'j', body: 'Como en inglés *jeans*.', examples: [{ jp: 'じゃあね', romaji: 'jā ne', es: 'hasta luego' }] },
  { id: 'r0-c-g', regionId: 'r0', type: 'pronunciation', title: 'g', body: 'Siempre fuerte: *ge* = «gue».', examples: [{ jp: 'げんき', romaji: 'genki', es: 'con energía' }] },
  { id: 'r0-c-z', regionId: 'r0', type: 'pronunciation', title: 'z', body: 'Una «s» zumbante.', examples: [{ jp: 'みず', romaji: 'mizu', es: 'agua' }] },
  { id: 'r0-c-sh', regionId: 'r0', type: 'pronunciation', title: 'sh, ch, ts', body: 'Como *shhh*, «chico» y *tsunami*.', examples: [{ jp: 'すし', romaji: 'sushi', es: 'sushi' }] },
  { id: 'r0-c-long', regionId: 'r0', type: 'pronunciation', title: 'ō, ū', body: 'Vocal larga: dura el doble.', examples: [{ jp: 'ありがとう', romaji: 'arigatō', es: 'gracias' }] },
  { id: 'r0-c-u', regionId: 'r0', type: 'pronunciation', title: 'u final', body: 'Casi muda en です y ます: se oyen «des» y «mas».', examples: [{ jp: 'です', romaji: 'desu', es: 'es / soy' }, { jp: 'ます', romaji: 'masu', es: '(terminación educada)' }] },
  { id: 'r0-c-double', regionId: 'r0', type: 'pronunciation', title: 'Consonantes dobles (kk, tt)', body: 'Una micropausa justo antes.', examples: [{ jp: 'きって', romaji: 'kitte', es: 'sello' }] },
  {
    id: 'r0-c-scripts',
    regionId: 'r0',
    type: 'culture',
    title: 'Los tres alfabetos',
    body: 'El **hiragana** es para palabras japonesas y gramática. El **katakana**, para palabras extranjeras (cartas de restaurante, videojuegos). Y los **kanji** son caracteres con significado: solo necesitas reconocer unos pocos.\n\nCada kana es una sílaba.',
    examples: [
      { jp: 'すし', romaji: 'sushi', es: 'hiragana' },
      { jp: 'メニュー', romaji: 'menyū', es: 'katakana' },
      { jp: '駅', romaji: 'eki', es: 'kanji: estación' },
    ],
  },
];

const word = (id: string, kana: string, romaji: string, es: string): PracticeWord => ({
  id,
  regionId: 'r0',
  kana,
  romaji,
  es,
  requiredKana: kanaIdsFor(kana),
});

/** Example words from the pronunciation cards, used by E4/E10 in R0-1. */
export const R0_WORDS: PracticeWord[] = [
  word('r0-w-hai', 'はい', 'hai', 'sí'),
  word('r0-w-ramen', 'ラーメン', 'rāmen', 'ramen'),
  word('r0-w-jaane', 'じゃあね', 'jā ne', 'hasta luego'),
  word('r0-w-genki', 'げんき', 'genki', 'con energía'),
  word('r0-w-mizu', 'みず', 'mizu', 'agua'),
  word('r0-w-sushi', 'すし', 'sushi', 'sushi'),
  word('r0-w-arigato', 'ありがとう', 'arigatō', 'gracias'),
  word('r0-w-kitte', 'きって', 'kitte', 'sello'),
];

export const R0_NODES: LessonNode[] = [
  {
    id: 'r0-1',
    regionId: 'r0',
    title: 'Pronunciación',
    summary: 'Los sonidos que engañan a un hispanohablante. Sin vidas: solo escuchar y repetir.',
    kind: 'intro',
    phraseIds: [],
    kanaIds: [],
    infoCardIds: ['r0-c-h', 'r0-c-r', 'r0-c-j', 'r0-c-g', 'r0-c-z', 'r0-c-sh', 'r0-c-long', 'r0-c-u', 'r0-c-double'],
    practiceWordIds: R0_WORDS.map((w) => w.id),
    recommendedDate: '2026-10-03',
    dayLabel: 'Sáb 3 oct',
  },
  {
    id: 'r0-2',
    regionId: 'r0',
    title: 'Vocales あいうえお',
    summary: 'Las cinco vocales en hiragana y los tres alfabetos.',
    kind: 'kana',
    phraseIds: [],
    kanaIds: ['h-a', 'h-i', 'h-u', 'h-e', 'h-o'],
    infoCardIds: ['r0-c-scripts'],
    recommendedDate: '2026-10-04',
    dayLabel: 'Dom 4 oct',
  },
];
