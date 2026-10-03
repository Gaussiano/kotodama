import { definePhrases, type InfoCard, type LessonNode, type PracticeWord, type Scenario } from './types';
import { kanaIdsFor, kanaInRows } from './kana';

// Región 3 · El mercado (19–25 oct) — tiendas, konbini y dinero — spec §10.4

export const R3_SAY = definePhrases('r3', 'shopping', 'say', [
  { id: 'r3-p1', n: 1, kana: 'いくらですか', romaji: 'ikura desu ka', es: '¿Cuánto es?' },
  { id: 'r3-p2', n: 2, kana: 'これは いくらですか', romaji: 'kore wa ikura desu ka', es: '¿Cuánto cuesta esto?' },
  { id: 'r3-p3', n: 3, kana: 'これは なんですか', romaji: 'kore wa nan desu ka', es: '¿Qué es esto?', note: 'Imprescindible en el súper.' },
  { id: 'r3-p4', n: 4, kana: '＿＿は ありますか', romaji: '＿＿ wa arimasu ka', es: '¿Tienen ＿＿?', note: 'Repaso.', equivalents: ['r2-p13'] },
  { id: 'r3-p5', n: 5, kana: 'これを ください', romaji: 'kore o kudasai', es: 'Me llevo esto', note: 'Repaso.', equivalents: ['r2-p8'] },
  { id: 'r3-p6', n: 6, kana: 'カード、つかえますか', romaji: 'kādo, tsukaemasu ka', es: '¿Se puede pagar con tarjeta?' },
  { id: 'r3-p7', n: 7, kana: 'げんきんで', romaji: 'genkin de', es: 'En efectivo' },
  { id: 'r3-p8', n: 8, kana: 'ふくろを ください', romaji: 'fukuro o kudasai', es: 'Una bolsa, por favor', note: 'Las bolsas se cobran aparte.' },
  { id: 'r3-p9', n: 9, kana: 'ふくろは いりません', romaji: 'fukuro wa irimasen', es: 'No necesito bolsa', note: 'O だいじょうぶです.', equivalents: ['r1-p9'] },
  { id: 'r3-p10', n: 10, kana: 'あたためて ください', romaji: 'atatamete kudasai', es: 'Caliéntelo, por favor', note: 'En el konbini.' },
  { id: 'r3-p11', n: 11, kana: 'おはしを ください', romaji: 'o-hashi o kudasai', es: 'Unos palillos, por favor' },
  { id: 'r3-p12', n: 12, kana: 'みているだけです', romaji: 'mite iru dake desu', es: 'Solo estoy mirando' },
  { id: 'r3-p13', n: 13, kana: 'しちゃくしても いいですか', romaji: 'shichaku shite mo ii desu ka', es: '¿Me lo puedo probar?' },
  { id: 'r3-p14', n: 14, kana: 'めんぜいできますか', romaji: 'menzei dekimasu ka', es: '¿Hacen tax-free?', note: 'Ver la tarjeta del tax-free.' },
  // Replies listed in the guardian scenarios (spec §10.4). Hidden from the Grimoire list.
  { id: 'r3-p15', kana: 'はい、おねがいします', romaji: 'hai, onegai shimasu', es: 'Sí, por favor', hidden: true },
  { id: 'r3-p16', kana: 'カードで', romaji: 'kādo de', es: 'Con tarjeta', hidden: true },
]);

export const R3_HEAR = definePhrases('r3', 'shopping', 'hear', [
  { id: 'r3-h1', kana: 'ふくろは ごりようですか', romaji: 'fukuro wa go-riyō desu ka', es: '¿Quiere bolsa?', suggestedReplies: ['r3-p15', 'r3-p9', 'r1-p9'] },
  { id: 'r3-h2', kana: 'あたためますか', romaji: 'atatamemasu ka', es: '¿Se lo caliento?', suggestedReplies: ['r3-p15', 'r1-p9'] },
  { id: 'r3-h3', kana: 'おはしは おつけしますか', romaji: 'o-hashi wa o-tsuke shimasu ka', es: '¿Le pongo palillos?', suggestedReplies: ['r3-p15', 'r1-p9'] },
  { id: 'r3-h4', kana: 'ポイントカードは おもちですか', romaji: 'pointo kādo wa o-mochi desu ka', es: '¿Tiene tarjeta de puntos?', note: 'いいえ.', suggestedReplies: ['r1-p8b'] },
  { id: 'r3-h5', kana: 'おしはらいは？', romaji: 'o-shiharai wa?', es: '¿Cómo va a pagar?', note: 'カードで / げんきんで.', suggestedReplies: ['r3-p16', 'r3-p7'] },
  { id: 'r3-h6', kana: '＿＿えんに なります', romaji: '＿＿ en ni narimasu', es: 'Son ＿＿ yenes', suggestedReplies: ['r1-p8a'] },
]);

export const R3_CARDS: InfoCard[] = [
  {
    id: 'r3-g-kore',
    regionId: 'r3',
    type: 'grammar',
    title: 'これ · それ · あれ · どれ',
    body: '**Solos:** これ (esto) · それ (eso) · あれ (aquello) · どれ (cuál).\n\n**+ cosa:** この · その · あの · どの.\n\n**Lugares:** ここ (aquí) · そこ (ahí) · あそこ (allí) · どこ (dónde).',
    examples: [
      { jp: 'これは なんですか', romaji: 'kore wa nan desu ka', es: '¿qué es esto?' },
      { jp: 'トイレは どこですか', romaji: 'toire wa doko desu ka', es: '¿dónde está el baño?' },
    ],
  },
  {
    id: 'r3-g-numbers',
    regionId: 'r3',
    type: 'grammar',
    title: 'Números',
    body: '1–10: いち · に · さん · よん · ご · ろく · なな · はち · きゅう · じゅう.\n\nDecenas: にじゅう (20), さんじゅうご (35). Cientos: ひゃく; ojo con さんびゃく (300), ろっぴゃく (600) y はっぴゃく (800). Miles: せん; さんぜん (3.000), はっせん (8.000). Diez mil: いちまん.',
    examples: [
      { jp: 'ひゃくごじゅう', romaji: 'hyaku gojū', es: '150' },
      { jp: 'にせんろっぴゃく', romaji: 'nisen roppyaku', es: '2.600' },
      { jp: 'いちまん ごせん', romaji: 'ichiman gosen', es: '15.000' },
    ],
  },
  {
    id: 'r3-g-de',
    regionId: 'r3',
    type: 'grammar',
    title: 'で = «con» / «por medio de»',
    body: 'Indica el medio con el que haces algo.',
    examples: [
      { jp: 'カードで', romaji: 'kādo de', es: 'con tarjeta' },
      { jp: 'げんきんで', romaji: 'genkin de', es: 'en efectivo' },
      { jp: 'でんしゃで', romaji: 'densha de', es: 'en tren' },
    ],
  },
  {
    id: 'r3-a-taxfree',
    regionId: 'r3',
    type: 'alert',
    title: 'Tax-free: cambia el 1 de noviembre de 2026',
    body: 'Desde el 1 de noviembre de 2026, Japón pasa a un sistema de reembolso. En la tienda pagas el precio con el 10 % de impuesto, enseñas el pasaporte, y la devolución se tramita en la aduana antes de salir del país.\n\nEl mínimo es de 5.000 yenes sin impuestos en la misma tienda el mismo día. No se pueden consumir en Japón los productos comprados así.\n\n**Consulta el procedimiento de tu aeropuerto antes de volar.**',
  },
  {
    id: 'r3-c-market',
    regionId: 'r3',
    type: 'culture',
    title: 'En la tienda',
    body: '- El dinero se deja en la bandejita de la caja (トレー).\n- Por la tarde hay descuentos en el súper: 半額 (mitad de precio) y 割引 (descuento).\n- Casi no hay papeleras en la calle.\n- No se suele comer andando.',
  },
  {
    id: 'r3-c-katakana',
    regionId: 'r3',
    type: 'culture',
    title: 'El katakana es tu idioma',
    body: 'El katakana se usa para palabras extranjeras, y por eso videojuegos y anime están llenos de él. La raya ー alarga la vocal.',
    examples: [
      { jp: 'ゲーム', romaji: 'gēmu', es: 'videojuego' },
      { jp: 'コーヒー', romaji: 'kōhī', es: 'café' },
    ],
  },
];

const word = (id: string, kana: string, romaji: string, es: string): PracticeWord => ({ id, regionId: 'r3', kana, romaji, es, requiredKana: kanaIdsFor(kana) });

export const R3_WORDS: PracticeWord[] = [
  word('r3-w-gemu', 'ゲーム', 'gēmu', 'videojuego'),
  word('r3-w-hairaru', 'ハイラル', 'Hairaru', 'Hyrule'),
  word('r3-w-furiren', 'フリーレン', 'Furīren', 'Frieren'),
  word('r3-w-hinmeru', 'ヒンメル', 'Hinmeru', 'Himmel'),
  word('r3-w-kohi', 'コーヒー', 'kōhī', 'café'),
  word('r3-w-biru', 'ビール', 'bīru', 'cerveza'),
  word('r3-w-kare', 'カレー', 'karē', 'curry'),
  word('r3-w-keki', 'ケーキ', 'kēki', 'pastel'),
  word('r3-w-kado', 'カード', 'kādo', 'tarjeta'),
  word('r3-w-aitemu', 'アイテム', 'aitemu', 'objeto'),
  word('r3-w-sebu', 'セーブ', 'sēbu', 'guardar partida'),
  word('r3-w-bosu', 'ボス', 'bosu', 'jefe'),
];

const K = (rows: string[]) => kanaInRows('katakana', rows);

export const R3_NODES: LessonNode[] = [
  { id: 'r3-1', regionId: 'r3', title: '¿Cuánto es?', summary: 'Preguntar precios y qué es algo. Números 1–10. Katakana ア–ソ.', kind: 'phrases', phraseIds: ['r3-p1', 'r3-p2', 'r3-p3'], kanaIds: K(['a', 'k', 's']), infoCardIds: ['r3-g-kore', 'r3-g-numbers'], extras: ['prices'], recommendedDate: '2026-10-19', dayLabel: 'Lun 19 oct' },
  { id: 'r3-2', regionId: 'r3', title: 'Pagar', summary: '¿Tienen…?, me llevo esto, tarjeta o efectivo. Números hasta 100. Katakana タ–ホ.', kind: 'phrases', phraseIds: ['r3-p4', 'r3-p5', 'r3-p6', 'r3-p7'], kanaIds: K(['t', 'n', 'h']), infoCardIds: ['r3-g-de'], extras: ['prices'], recommendedDate: '2026-10-20', dayLabel: 'Mar 20 oct' },
  { id: 'r3-3', regionId: 'r3', title: 'Bolsas y comida', summary: 'La bolsa y calentar la comida del konbini. Cientos, miles y まん. Katakana マ–ン.', kind: 'phrases', phraseIds: ['r3-p8', 'r3-p9', 'r3-p10'], kanaIds: K(['m', 'y', 'r', 'w', 'nn']), infoCardIds: ['r3-c-market'], extras: ['prices'], recommendedDate: '2026-10-21', dayLabel: 'Mié 21 oct' },
  { id: 'r3-4', regionId: 'r3', title: 'De tiendas', summary: 'Palillos, solo mirar, probarse ropa y tax-free. Tenten y maru en katakana.', kind: 'phrases', phraseIds: ['r3-p11', 'r3-p12', 'r3-p13', 'r3-p14'], kanaIds: K(['g', 'z', 'd', 'b', 'p']), infoCardIds: ['r3-a-taxfree', 'r3-c-katakana'], recommendedDate: '2026-10-22', dayLabel: 'Jue 22 oct' },
  { id: 'r3-5', regionId: 'r3', title: 'Lo que te dirán en el konbini', summary: 'Las seis preguntas de la caja y qué responder. Escena: en la caja del konbini.', kind: 'heard', phraseIds: ['r3-h1', 'r3-h2', 'r3-h3', 'r3-h4', 'r3-h5', 'r3-h6'], kanaIds: [], infoCardIds: [], sceneId: 'scene-3', recommendedDate: '2026-10-23', dayLabel: 'Vie 23 oct' },
  { id: 'r3-6', regionId: 'r3', title: 'Precios', summary: 'Entrenar el oído con precios reales y leer palabras en katakana.', kind: 'prices', phraseIds: [], kanaIds: [], infoCardIds: [], practiceWordIds: R3_WORDS.map((w) => w.id), recommendedDate: '2026-10-24', dayLabel: 'Sáb 24 oct' },
  { id: 'r3-boss', regionId: 'r3', title: 'Guardián del mercado', summary: 'Precios en voz alta y las respuestas del konbini. Apruebas con un 80 %.', kind: 'boss', phraseIds: [], kanaIds: [], infoCardIds: [], recommendedDate: '2026-10-25', dayLabel: 'Dom 25 oct' },
];

export const R3_SCENARIOS: Scenario[] = [
  { id: 'r3-s1', regionId: 'r3', promptEs: 'Ves algo raro en una estantería.', correctPhraseIds: ['r3-p3'] },
];
