import { definePhrases, type InfoCard, type LessonNode, type PracticeWord, type Scenario } from './types';
import { kanaIdsFor, kanaInRows } from './kana';

// Región 2 · La taberna (12–18 oct) — restaurantes — spec §10.3

export const R2_SAY = definePhrases('r2', 'restaurant', 'say', [
  { id: 'r2-p1', n: 1, kana: 'ふたりです', romaji: 'futari desu', es: 'Somos dos', note: 'Enseña dos dedos.', kanji: '二人です' },
  { id: 'r2-p2', n: 2, kana: 'ふたり、おねがいします', romaji: 'futari, onegai shimasu', es: 'Mesa para dos, por favor' },
  { id: 'r2-p3', n: 3, kana: 'よやくしていません', romaji: 'yoyaku shite imasen', es: 'No tengo reserva' },
  { id: 'r2-p4', n: 4, kana: '＿＿で よやくしています', romaji: '＿＿ de yoyaku shite imasu', es: 'Tengo reserva a nombre de ＿＿' },
  { id: 'r2-p5', n: 5, kana: 'すみません！', romaji: 'sumimasen!', es: '¡Perdone! (para llamar al camarero)', note: 'Es normal decirlo en voz alta. Hay mesas con timbre.', equivalents: ['r1-p6'] },
  { id: 'r2-p6', n: 6, kana: 'メニューを ください', romaji: 'menyū o kudasai', es: 'La carta, por favor' },
  { id: 'r2-p7', n: 7, kana: 'えいごの メニューは ありますか', romaji: 'eigo no menyū wa arimasu ka', es: '¿Tienen carta en inglés?' },
  { id: 'r2-p8', n: 8, kana: 'これを ください', romaji: 'kore o kudasai', es: 'Esto, por favor', note: 'Señalando la foto. Funciona siempre.' },
  { id: 'r2-p9', n: 9, kana: 'これを ふたつ ください', romaji: 'kore o futatsu kudasai', es: 'Dos de esto, por favor' },
  { id: 'r2-p10', n: 10, kana: 'おすすめは なんですか', romaji: 'osusume wa nan desu ka', es: '¿Qué me recomienda?' },
  { id: 'r2-p11', n: 11, kana: 'おみずを ください', romaji: 'o-mizu o kudasai', es: 'Agua, por favor', note: 'El agua y el té suelen ser gratis.' },
  { id: 'r2-p12', n: 12, kana: 'なまビール ふたつ', romaji: 'nama bīru futatsu', es: 'Dos cañas', note: 'なまビール = cerveza de barril.' },
  { id: 'r2-p13', n: 13, kana: 'しょうゆは ありますか', romaji: 'shōyu wa arimasu ka', es: '¿Tienen salsa de soja?', note: 'En el bote: 醤油.' },
  { id: 'r2-p14', n: 14, kana: 'フォークを もらえますか', romaji: 'fōku o moraemasu ka', es: '¿Me puede dar un tenedor?', note: 'Ver la tarjeta «¿Prestar un tenedor?».' },
  { id: 'r2-p15', n: 15, kana: '＿＿ぬきで おねがいします', romaji: '＿＿ nuki de onegai shimasu', es: 'Sin ＿＿, por favor', note: 'わさびぬきで = sin wasabi.' },
  { id: 'r2-p16', n: 16, kana: '＿＿アレルギーが あります', romaji: '＿＿ arerugī ga arimasu', es: 'Tengo alergia a ＿＿' },
  { id: 'r2-p17', n: 17, kana: 'いただきます', romaji: 'itadakimasu', es: '(Antes de comer) ¡Que aproveche!' },
  { id: 'r2-p18', n: 18, kana: 'おいしいです！', romaji: 'oishii desu!', es: '¡Está buenísimo!' },
  { id: 'r2-p19', n: 19, kana: 'ごちそうさまでした', romaji: 'gochisōsama deshita', es: 'Gracias por la comida', note: 'Al terminar o al salir.' },
  { id: 'r2-p20', n: 20, kana: 'おかいけい おねがいします', romaji: 'o-kaikei onegai shimasu', es: 'La cuenta, por favor', note: 'Gesto: índices en X.', kanji: 'お会計 おねがいします' },
  { id: 'r2-p21', n: 21, kana: 'かんぱい！', romaji: 'kanpai!', es: '¡Salud!' },
  // From the note on ごちゅうもんは おきまりですか («Si no: まだです»). Needed as a reply in E8 and scene 2.
  { id: 'r2-p22', kana: 'まだです', romaji: 'mada desu', es: 'Todavía no', note: 'Cuando te preguntan si ya has decidido.', hidden: true },
]);

export const R2_HEAR = definePhrases('r2', 'restaurant', 'hear', [
  { id: 'r2-h1', kana: 'なんめいさまですか', romaji: 'nanmei-sama desu ka', es: '¿Cuántas personas?', note: 'Responde ふたりです.', suggestedReplies: ['r2-p1', 'r2-p2'] },
  { id: 'r2-h2', kana: 'しょうしょう おまちください', romaji: 'shōshō o-machi kudasai', es: 'Espere un momento', suggestedReplies: ['r1-p8a'] },
  { id: 'r2-h3', kana: 'こちらへ どうぞ', romaji: 'kochira e dōzo', es: 'Por aquí, por favor', suggestedReplies: [] },
  { id: 'r2-h4', kana: 'ごちゅうもんは おきまりですか', romaji: 'go-chūmon wa o-kimari desu ka', es: '¿Ya han decidido?', note: 'Si no: まだです.', suggestedReplies: ['r2-p22', 'r2-p8'] },
  { id: 'r2-h5', kana: 'おのみものは？', romaji: 'o-nomimono wa?', es: '¿Y para beber?', suggestedReplies: ['r2-p12', 'r2-p11'] },
  { id: 'r2-h6', kana: 'いじょうで よろしいですか', romaji: 'ijō de yoroshii desu ka', es: '¿Eso es todo?', note: 'はい.', suggestedReplies: ['r1-p8a'] },
  { id: 'r2-h7', kana: 'おかいけいは レジで おねがいします', romaji: 'o-kaikei wa reji de onegai shimasu', es: 'Se paga en caja', suggestedReplies: ['r1-p8a'] },
]);

export const R2_CARDS: InfoCard[] = [
  {
    id: 'r2-g-kudasai',
    regionId: 'r2',
    type: 'grammar',
    title: 'X を ください',
    body: '«Deme X». を se pronuncia «o».',
    examples: [
      { jp: 'メニューを ください', romaji: 'menyū o kudasai', es: 'la carta, por favor' },
      { jp: 'おみずを ください', romaji: 'o-mizu o kudasai', es: 'agua, por favor' },
    ],
  },
  {
    id: 'r2-g-arimasuka',
    regionId: 'r2',
    type: 'grammar',
    title: 'X は ありますか',
    body: '«¿Tienen X?». Respuesta negativa: すみません、ありません.',
    examples: [{ jp: 'しょうゆは ありますか', romaji: 'shōyu wa arimasu ka', es: '¿tienen salsa de soja?' }],
  },
  {
    id: 'r2-g-no',
    regionId: 'r2',
    type: 'grammar',
    title: 'の = «de», pero al revés',
    body: 'A の B = B de A.',
    examples: [
      { jp: 'ゼルダの でんせつ', romaji: 'Zeruda no densetsu', es: 'la leyenda de Zelda' },
      { jp: 'そうそうの フリーレン', romaji: 'Sōsō no Furīren', es: 'título original de Frieren: «la Frieren del último adiós»' },
      { jp: 'えいごの メニュー', romaji: 'eigo no menyū', es: 'carta en inglés' },
    ],
  },
  {
    id: 'r2-g-count',
    regionId: 'r2',
    type: 'grammar',
    title: 'Contar',
    body: '**Personas:** ひとり · ふたり · さんにん · よにん · ごにん.\n\n**Cosas:** ひとつ · ふたつ · みっつ · よっつ · いつつ.',
    examples: [
      { jp: 'ふたり', romaji: 'futari', es: 'dos personas' },
      { jp: 'ふたつ', romaji: 'futatsu', es: 'dos cosas' },
    ],
  },
  {
    id: 'r2-c-fork',
    regionId: 'r2',
    type: 'culture',
    title: '¿Prestar un tenedor?',
    body: '«Prestar» (かす) implica que tú lo devuelves, y en un restaurante suena raro. Lo natural es もらえますか («¿puedo recibir?»). Para un bolígrafo que devuelves enseguida sí vale ペンを かして ください.\n\nEl japonés traduce situaciones, no palabras.',
    examples: [
      { jp: 'フォークを もらえますか', romaji: 'fōku o moraemasu ka', es: '¿me puede dar un tenedor?' },
      { jp: 'ペンを かして ください', romaji: 'pen o kashite kudasai', es: '¿me presta un boli?' },
    ],
  },
  {
    id: 'r2-c-table',
    regionId: 'r2',
    type: 'culture',
    title: 'En la mesa',
    body: '- No se deja propina.\n- Se paga en caja, a la salida.\n- Máquinas de tickets (しょっけん / 食券) en los locales de ramen.\n- Sorber los fideos está bien.\n- No se clavan los palillos de pie en el arroz ni se pasa comida de palillo a palillo.\n- La おしぼり es para las manos.',
  },
  {
    id: 'r2-c-cutlery',
    regionId: 'r2',
    type: 'culture',
    title: 'Vocabulario de mesa',
    body: 'Lo que puedes pedir con を ください o を もらえますか.',
    examples: [
      { jp: 'フォーク', romaji: 'fōku', es: 'tenedor' },
      { jp: 'スプーン', romaji: 'supūn', es: 'cuchara' },
      { jp: 'ナイフ', romaji: 'naifu', es: 'cuchillo' },
      { jp: 'おはし', romaji: 'o-hashi', es: 'palillos' },
      { jp: 'おしぼり', romaji: 'o-shibori', es: 'toallita para las manos' },
    ],
  },
];

const word = (id: string, kana: string, romaji: string, es: string): PracticeWord => ({ id, regionId: 'r2', kana, romaji, es, requiredKana: kanaIdsFor(kana) });

export const R2_WORDS: PracticeWord[] = [
  word('r2-w-gohan', 'ごはん', 'gohan', 'arroz / comida'),
  word('r2-w-mizu', 'みず', 'mizu', 'agua'),
  word('r2-w-wasabi', 'わさび', 'wasabi', 'wasabi'),
  word('r2-w-shoyu', 'しょうゆ', 'shōyu', 'salsa de soja'),
  word('r2-w-yakitori', 'やきとり', 'yakitori', 'brochetas de pollo'),
  word('r2-w-tenpura', 'てんぷら', 'tenpura', 'tempura'),
  word('r2-w-ryokan', 'りょかん', 'ryokan', 'posada tradicional'),
  word('r2-w-gyudon', 'ぎゅうどん', 'gyūdon', 'bol de arroz con ternera'),
];

const H = (rows: string[]) => kanaInRows('hiragana', rows);

export const R2_NODES: LessonNode[] = [
  { id: 'r2-1', regionId: 'r2', title: 'En la puerta', summary: 'Somos dos, mesa para dos y la reserva. Kana は.', kind: 'phrases', phraseIds: ['r2-p1', 'r2-p2', 'r2-p3', 'r2-p4'], kanaIds: H(['h']), infoCardIds: [], recommendedDate: '2026-10-12', dayLabel: 'Lun 12 oct' },
  { id: 'r2-2', regionId: 'r2', title: 'Pedir', summary: 'Llamar al camarero, la carta y «esto, por favor». Gramática: を ください. Kana ま.', kind: 'phrases', phraseIds: ['r2-p5', 'r2-p6', 'r2-p7', 'r2-p8', 'r2-p9'], kanaIds: H(['m']), infoCardIds: ['r2-g-kudasai'], recommendedDate: '2026-10-13', dayLabel: 'Mar 13 oct' },
  { id: 'r2-3', regionId: 'r2', title: 'Preguntar', summary: 'Recomendaciones, agua, cañas y salsa de soja. Gramática: ありますか. Kana や y ら.', kind: 'phrases', phraseIds: ['r2-p10', 'r2-p11', 'r2-p12', 'r2-p13'], kanaIds: H(['y', 'r']), infoCardIds: ['r2-g-arimasuka'], recommendedDate: '2026-10-14', dayLabel: 'Mié 14 oct' },
  { id: 'r2-4', regionId: 'r2', title: 'El tenedor y las alergias', summary: 'Pedir cubiertos, quitar el wasabi y avisar de alergias. Kana わ, を, ん y tenten.', kind: 'phrases', phraseIds: ['r2-p14', 'r2-p15', 'r2-p16'], kanaIds: H(['w', 'nn', 'g', 'z', 'd', 'b', 'p']), infoCardIds: ['r2-c-fork', 'r2-c-cutlery'], recommendedDate: '2026-10-15', dayLabel: 'Jue 15 oct' },
  { id: 'r2-5', regionId: 'r2', title: 'Comer y pagar', summary: 'Que aproveche, está buenísimo, la cuenta y salud. Gramática: の y contar. Kana combinadas.', kind: 'phrases', phraseIds: ['r2-p17', 'r2-p18', 'r2-p19', 'r2-p20', 'r2-p21'], kanaIds: H(['ky', 'sh', 'ch', 'ny', 'hy', 'my', 'ry', 'gy', 'j', 'by', 'py']), infoCardIds: ['r2-g-no', 'r2-g-count', 'r2-c-table'], practiceWordIds: R2_WORDS.map((w) => w.id), recommendedDate: '2026-10-16', dayLabel: 'Vie 16 oct' },
  { id: 'r2-6', regionId: 'r2', title: 'Lo que te dirán', summary: 'Las siete frases del camarero y cómo contestar. Escena: cena en el izakaya.', kind: 'heard', phraseIds: ['r2-h1', 'r2-h2', 'r2-h3', 'r2-h4', 'r2-h5', 'r2-h6', 'r2-h7'], kanaIds: [], infoCardIds: [], sceneId: 'scene-2', recommendedDate: '2026-10-17', dayLabel: 'Sáb 17 oct' },
  { id: 'r2-boss', regionId: 'r2', title: 'Guardián de la taberna', summary: 'Todo lo de la taberna, sin tarjetas. Apruebas con un 80 %.', kind: 'boss', phraseIds: [], kanaIds: [], infoCardIds: [], recommendedDate: '2026-10-18', dayLabel: 'Dom 18 oct' },
];

export const R2_SCENARIOS: Scenario[] = [
  { id: 'r2-s1', regionId: 'r2', promptEs: 'Te preguntan なんめいさまですか.', correctPhraseIds: ['r2-p1'] },
  { id: 'r2-s2', regionId: 'r2', promptEs: 'Queréis dos cañas.', correctPhraseIds: ['r2-p12'] },
  { id: 'r2-s3', regionId: 'r2', promptEs: 'Prefieres un tenedor.', correctPhraseIds: ['r2-p14'] },
  { id: 'r2-s4', regionId: 'r2', promptEs: 'Quieres salsa de soja.', correctPhraseIds: ['r2-p13'] },
  { id: 'r2-s5', regionId: 'r2', promptEs: 'Sushi sin wasabi.', correctPhraseIds: ['r2-p15'] },
  { id: 'r2-s6', regionId: 'r2', promptEs: 'Antes de comer.', correctPhraseIds: ['r2-p17'] },
  { id: 'r2-s7', regionId: 'r2', promptEs: 'Quieres pagar.', correctPhraseIds: ['r2-p20'] },
  { id: 'r2-s8', regionId: 'r2', promptEs: 'Al salir del restaurante.', correctPhraseIds: ['r2-p19'] },
];
