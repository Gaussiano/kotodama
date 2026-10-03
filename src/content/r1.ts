import { definePhrases, type InfoCard, type LessonNode, type PracticeWord, type Scenario } from './types';
import { kanaIdsFor, kanaInRows } from './kana';

// Región 1 · El pueblo inicial (5–11 oct) — saludos y cortesía — spec §10.2

export const R1_SAY = definePhrases('r1', 'basics', 'say', [
  { id: 'r1-p1', n: 1, kana: 'おはようございます', romaji: 'ohayō gozaimasu', es: 'Buenos días', note: 'Hasta media mañana. Con amigos basta con おはよう.' },
  { id: 'r1-p2', n: 2, kana: 'こんにちは', romaji: 'konnichiwa', es: 'Hola / buenas tardes', note: 'El は del final se lee «wa».' },
  { id: 'r1-p3', n: 3, kana: 'こんばんは', romaji: 'konbanwa', es: 'Buenas noches (al llegar)', note: 'Para saludar a partir del atardecer.' },
  { id: 'r1-p4', n: 4, kana: 'ありがとうございます', romaji: 'arigatō gozaimasu', es: 'Muchas gracias', note: 'Tu hechizo más usado del viaje.' },
  { id: 'r1-p5', n: 5, kana: 'どうも', romaji: 'dōmo', es: 'Gracias (versión corta)', note: 'Para la cajera o quien te sujeta la puerta.' },
  { id: 'r1-p6', n: 6, kana: 'すみません', romaji: 'sumimasen', es: 'Disculpe / perdón / gracias por la molestia', note: 'El comodín: llamar a alguien, pedir paso, disculparte.' },
  { id: 'r1-p7', n: 7, kana: 'ごめんなさい', romaji: 'gomen nasai', es: 'Lo siento', note: 'Más personal. Como turista te basta すみません.' },
  { id: 'r1-p8', n: 8, kana: 'はい / いいえ', romaji: 'hai / iie', es: 'Sí / No', note: 'いいえ suena seco; muchas veces es mejor だいじょうぶです.', production: false },
  { id: 'r1-p8a', kana: 'はい', romaji: 'hai', es: 'Sí', hidden: true },
  { id: 'r1-p8b', kana: 'いいえ', romaji: 'iie', es: 'No', hidden: true },
  { id: 'r1-p9', n: 9, kana: 'だいじょうぶです', romaji: 'daijōbu desu', es: 'Estoy bien / no hace falta, gracias', note: 'Para rechazar con educación.', kanji: '大丈夫です' },
  { id: 'r1-p10', n: 10, kana: 'おねがいします', romaji: 'onegai shimasu', es: 'Por favor (te lo pido)', note: 'Va detrás de lo que quieres.' },
  { id: 'r1-p11', n: 11, kana: 'どうぞ', romaji: 'dōzo', es: 'Adelante / tome / usted primero' },
  { id: 'r1-p12', n: 12, kana: 'はじめまして', romaji: 'hajimemashite', es: 'Encantado/a', note: 'Solo la primera vez que conoces a alguien.' },
  { id: 'r1-p13', n: 13, kana: 'わたしは ＿＿ です', romaji: 'watashi wa ＿＿ desu', es: 'Soy ＿＿ / me llamo ＿＿', note: 'El hueco se rellena con tu nombre.' },
  { id: 'r1-p14', n: 14, kana: 'スペインから きました', romaji: 'Supein kara kimashita', es: 'Vengo de España' },
  { id: 'r1-p15', n: 15, kana: 'わかりません', romaji: 'wakarimasen', es: 'No entiendo' },
  { id: 'r1-p16', n: 16, kana: 'にほんごは すこしだけです', romaji: 'nihongo wa sukoshi dake desu', es: 'Solo hablo un poco de japonés', note: 'Hace que te hablen más despacio.' },
  { id: 'r1-p17', n: 17, kana: 'しつれいします', romaji: 'shitsurei shimasu', es: 'Con permiso', note: 'Al entrar o salir de un sitio o pasar por delante de alguien.' },
  // Combination used by the guardian scenarios (spec §10.2, escenario 3). Hidden from the Grimoire list.
  { id: 'r1-p18', kana: 'すみません、わかりません', romaji: 'sumimasen, wakarimasen', es: 'Perdone, no entiendo', hidden: true },
]);

export const R1_HEAR = definePhrases('r1', 'basics', 'hear', [
  { id: 'r1-h1', kana: 'いらっしゃいませ', romaji: 'irasshaimase', es: '¡Bienvenido!', note: 'No hay que contestar: basta un gesto con la cabeza.', suggestedReplies: [] },
  { id: 'r1-h2', kana: 'ありがとうございました', romaji: 'arigatō gozaimashita', es: 'Gracias (por haber venido)', note: 'Al salir de la tienda.', suggestedReplies: ['r1-p5'] },
  { id: 'r1-h3', kana: 'どういたしまして', romaji: 'dō itashimashite', es: 'De nada', note: 'Suelen responder con いえいえ (iie iie).', suggestedReplies: [] },
  { id: 'r1-h4', kana: 'おきを つけて', romaji: 'o-ki o tsukete', es: '¡Cuídate! / ¡Buen viaje!', note: 'Se lo dicen a quien se marcha.', suggestedReplies: ['r1-p4'] },
]);

export const R1_CARDS: InfoCard[] = [
  {
    id: 'r1-g-verb-end',
    regionId: 'r1',
    type: 'grammar',
    title: 'El verbo va al final',
    body: 'Si no entiendes una frase, escucha el final: ahí está el verbo.',
    examples: [{ jp: 'わたしは すしを たべます', romaji: 'watashi wa sushi o tabemasu', es: 'Yo · sushi · como' }],
  },
  {
    id: 'r1-g-desu-masu',
    regionId: 'r1',
    type: 'grammar',
    title: 'です y ます',
    body: 'El modo educado. Habla siempre así. Se pronuncian «des» y «mas».',
    examples: [
      { jp: 'がくせいです', romaji: 'gakusei desu', es: 'soy estudiante' },
      { jp: 'いきます', romaji: 'ikimasu', es: 'voy' },
    ],
  },
  {
    id: 'r1-g-wa',
    regionId: 'r1',
    type: 'grammar',
    title: 'は (wa)',
    body: '«En cuanto a…». Como partícula se escribe は (ha) pero se lee «wa».',
    examples: [{ jp: 'わたしは マリアです', romaji: 'watashi wa Maria desu', es: 'Yo soy María' }],
  },
  {
    id: 'r1-g-ka',
    regionId: 'r1',
    type: 'grammar',
    title: 'か',
    body: 'Se añade al final para preguntar.',
    examples: [
      { jp: 'すしです', romaji: 'sushi desu', es: 'es sushi' },
      { jp: 'すしですか', romaji: 'sushi desu ka', es: '¿es sushi?' },
    ],
  },
  {
    id: 'r1-culture',
    regionId: 'r1',
    type: 'culture',
    title: 'Saber del bosque',
    body: '- すみません es la palabra mágica.\n- Basta una pequeña inclinación de cabeza.\n- En las tiendas no se dice さようなら (suena a despedida larga): basta ありがとう o どうも.\n- En el tren se habla bajito.',
  },
];

const word = (id: string, kana: string, romaji: string, es: string): PracticeWord => ({ id, regionId: 'r1', kana, romaji, es, requiredKana: kanaIdsFor(kana) });

export const R1_WORDS: PracticeWord[] = [
  word('r1-w-sushi', 'すし', 'sushi', 'sushi'),
  word('r1-w-eki', 'えき', 'eki', 'estación'),
  word('r1-w-chikatetsu', 'ちかてつ', 'chikatetsu', 'metro'),
  word('r1-w-neko', 'ねこ', 'neko', 'gato'),
  word('r1-w-okane', 'おかね', 'okane', 'dinero'),
  word('r1-w-aki', 'あき', 'aki', 'otoño'),
  word('r1-w-sake', 'さけ', 'sake', 'sake'),
  word('r1-w-sekai', 'せかい', 'sekai', 'mundo'),
];

export const R1_NODES: LessonNode[] = [
  { id: 'r1-1', regionId: 'r1', title: 'Saludos', summary: 'Buenos días, hola y buenas noches. Kana か.', kind: 'phrases', phraseIds: ['r1-p1', 'r1-p2', 'r1-p3'], kanaIds: kanaInRows('hiragana', ['k']), infoCardIds: [], recommendedDate: '2026-10-05', dayLabel: 'Lun 5 oct' },
  { id: 'r1-2', regionId: 'r1', title: 'Gracias y perdón', summary: 'Las cuatro formas de dar las gracias y disculparte. Kana さ.', kind: 'phrases', phraseIds: ['r1-p4', 'r1-p5', 'r1-p6', 'r1-p7'], kanaIds: kanaInRows('hiragana', ['s']), infoCardIds: [], recommendedDate: '2026-10-06', dayLabel: 'Mar 6 oct' },
  { id: 'r1-3', regionId: 'r1', title: 'Sí, no y por favor', summary: 'Aceptar, rechazar con educación y pedir. Gramática: el verbo va al final.', kind: 'phrases', phraseIds: ['r1-p8', 'r1-p9', 'r1-p10', 'r1-p11'], kanaIds: [], infoCardIds: ['r1-g-verb-end'], recommendedDate: '2026-10-07', dayLabel: 'Mié 7 oct' },
  { id: 'r1-4', regionId: 'r1', title: 'Kana た y な', summary: 'Dos filas nuevas y tus primeras palabras leídas en hiragana.', kind: 'kana', phraseIds: [], kanaIds: kanaInRows('hiragana', ['t', 'n']), infoCardIds: [], practiceWordIds: R1_WORDS.map((w) => w.id), recommendedDate: '2026-10-08', dayLabel: 'Mié 7 – Jue 8 oct' },
  { id: 'r1-5', regionId: 'r1', title: 'Presentarse', summary: 'Encantado, me llamo… y vengo de España. Gramática: です/ます y は.', kind: 'phrases', phraseIds: ['r1-p12', 'r1-p13', 'r1-p14'], kanaIds: [], infoCardIds: ['r1-g-desu-masu', 'r1-g-wa'], recommendedDate: '2026-10-08', dayLabel: 'Jue 8 oct' },
  { id: 'r1-6', regionId: 'r1', title: 'Cuando no entiendes', summary: 'No entiendo, hablo poco japonés y con permiso. Gramática: か.', kind: 'phrases', phraseIds: ['r1-p15', 'r1-p16', 'r1-p17'], kanaIds: [], infoCardIds: ['r1-g-ka', 'r1-culture'], recommendedDate: '2026-10-09', dayLabel: 'Vie 9 oct' },
  { id: 'r1-7', regionId: 'r1', title: 'Lo que te dirán', summary: 'Las cuatro frases que oirás en cada tienda y cómo reaccionar. Escena: primer paseo.', kind: 'heard', phraseIds: ['r1-h1', 'r1-h2', 'r1-h3', 'r1-h4'], kanaIds: [], infoCardIds: [], sceneId: 'scene-1', recommendedDate: '2026-10-10', dayLabel: 'Sáb 10 oct' },
  { id: 'r1-boss', regionId: 'r1', title: 'Guardián del pueblo', summary: 'Todo lo del pueblo inicial, sin tarjetas. Apruebas con un 80 %.', kind: 'boss', phraseIds: [], kanaIds: [], infoCardIds: [], recommendedDate: '2026-10-11', dayLabel: 'Dom 11 oct' },
];

export const R1_SCENARIOS: Scenario[] = [
  { id: 'r1-s1', regionId: 'r1', promptEs: 'Entras en una cafetería a las 9 de la mañana y te saludan.', correctPhraseIds: ['r1-p1'] },
  { id: 'r1-s2', regionId: 'r1', promptEs: 'Alguien se aparta para dejarte pasar en una escalera estrecha.', correctPhraseIds: ['r1-p6', 'r1-p4'], acceptAll: true, explanation: 'Las dos valen: すみません («gracias por la molestia») o ありがとうございます.' },
  { id: 'r1-s3', regionId: 'r1', promptEs: 'La cajera te pregunta algo y no lo entiendes.', correctPhraseIds: ['r1-p18'] },
  { id: 'r1-s4', regionId: 'r1', promptEs: 'Te ofrecen ayuda que no necesitas.', correctPhraseIds: ['r1-p9'] },
  { id: 'r1-s5', regionId: 'r1', promptEs: 'Te presentan a alguien.', correctPhraseIds: ['r1-p12'] },
  { id: 'r1-s6', regionId: 'r1', promptEs: 'Al salir de una tienda te dicen ありがとうございました.', correctPhraseIds: ['r1-p5'], gestureAnswer: 'No hace falta decir nada; basta un gesto o どうも', explanation: 'Un gesto con la cabeza o un どうも. Nada de さようなら.' },
];
