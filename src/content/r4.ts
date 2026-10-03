import { definePhrases, type InfoCard, type LessonNode, type PracticeWord, type Scenario } from './types';
import { kanaIdsFor, kanaInRows, EXTENDED_ROWS } from './kana';
import { KANJI_BASE as KANJI } from './kanji';

// Región 4 · El gran viaje (26 oct – 1 nov) — hotel, transporte y ayuda — spec §10.5

export const R4_SAY = definePhrases('r4', 'hotel', 'say', [
  { id: 'r4-p1', n: 1, kana: 'チェックイン おねがいします', romaji: 'chekku-in onegai shimasu', es: 'Quiero hacer el check-in', kanji: 'チェックイン お願いします' },
  { id: 'r4-p2', n: 2, kana: '＿＿で よやくしています', romaji: '＿＿ de yoyaku shite imasu', es: 'Tengo reserva a nombre de ＿＿', note: 'Repaso.', equivalents: ['r2-p4'], kanji: '＿＿で 予約しています' },
  { id: 'r4-p3', n: 3, kana: 'チェックアウトは なんじですか', romaji: 'chekku-auto wa nanji desu ka', es: '¿A qué hora es el check-out?', kanji: 'チェックアウトは 何時ですか' },
  { id: 'r4-p4', n: 4, kana: 'あさごはんは なんじからですか', romaji: 'asagohan wa nanji kara desu ka', es: '¿Desde qué hora es el desayuno?', kanji: '朝ごはんは 何時からですか' },
  { id: 'r4-p5', n: 5, kana: 'Wi-Fiの パスワードは なんですか', romaji: 'waifai no pasuwādo wa nan desu ka', es: '¿Cuál es la contraseña del wifi?', speech: 'ワイファイの パスワードは なんですか', kanji: 'Wi-Fiの パスワードは 何ですか' },
  { id: 'r4-p6', n: 6, kana: 'にもつを あずかって もらえますか', romaji: 'nimotsu o azukatte moraemasu ka', es: '¿Me pueden guardar el equipaje?', kanji: '荷物を 預かって もらえますか' },
  { id: 'r4-p7', n: 7, kana: '＿＿は どこですか', romaji: '＿＿ wa doko desu ka', es: '¿Dónde está ＿＿?', category: 'transport' },
  { id: 'r4-p8', n: 8, kana: 'トイレは どこですか', romaji: 'toire wa doko desu ka', es: '¿Dónde está el baño?', category: 'transport', kanji: 'トイレは どこですか' },
  { id: 'r4-p9', n: 9, kana: '＿＿に いきたいです', romaji: '＿＿ ni ikitai desu', es: 'Quiero ir a ＿＿', category: 'transport', kanji: '＿＿に 行きたいです' },
  { id: 'r4-p10', n: 10, kana: 'この でんしゃは ＿＿に いきますか', romaji: 'kono densha wa ＿＿ ni ikimasu ka', es: '¿Este tren va a ＿＿?', category: 'transport', kanji: 'この 電車は ＿＿に 行きますか' },
  { id: 'r4-p11', n: 11, kana: '＿＿まで おねがいします', romaji: '＿＿ made onegai shimasu', es: 'A ＿＿, por favor (taxi)', note: 'La puerta del taxi se abre sola.', category: 'transport', kanji: '＿＿まで お願いします' },
  { id: 'r4-p12', n: 12, kana: 'きっぷは どこで かえますか', romaji: 'kippu wa doko de kaemasu ka', es: '¿Dónde se compran los billetes?', category: 'transport', kanji: '切符は どこで 買えますか' },
  { id: 'r4-p13', n: 13, kana: 'えいごを はなせますか', romaji: 'eigo o hanasemasu ka', es: '¿Habla inglés?', category: 'help', kanji: '英語を 話せますか' },
  { id: 'r4-p14', n: 14, kana: 'もういちど おねがいします', romaji: 'mō ichido onegai shimasu', es: 'Otra vez, por favor', category: 'help', kanji: 'もう一度 お願いします' },
  { id: 'r4-p15', n: 15, kana: 'ゆっくり おねがいします', romaji: 'yukkuri onegai shimasu', es: 'Más despacio, por favor', category: 'help', kanji: 'ゆっくり お願いします' },
  { id: 'r4-p16', n: 16, kana: 'しゃしんを とっても いいですか', romaji: 'shashin o totte mo ii desu ka', es: '¿Puedo hacer fotos?', category: 'help', kanji: '写真を 撮っても いいですか' },
  { id: 'r4-p17', n: 17, kana: 'しゃしんを とって もらえますか', romaji: 'shashin o totte moraemasu ka', es: '¿Nos puede hacer una foto?', category: 'help', kanji: '写真を 撮って もらえますか' },
  { id: 'r4-p18', n: 18, kana: 'みちに まよいました', romaji: 'michi ni mayoimashita', es: 'Me he perdido', note: 'Busca un こうばん (garita de policía).', category: 'help', kanji: '道に 迷いました' },
  { id: 'r4-p19', n: 19, kana: 'きぶんが わるいです', romaji: 'kibun ga warui desu', es: 'Me encuentro mal', category: 'help', kanji: '気分が 悪いです' },
  { id: 'r4-p20', n: 20, kana: 'たすけて ください', romaji: 'tasukete kudasai', es: '¡Ayuda, por favor!', note: '110 policía · 119 ambulancia y bomberos.', category: 'help', kanji: '助けて ください' },
]);

export const R4_HEAR = definePhrases('r4', 'hotel', 'hear', [
  { id: 'r4-h1', kana: 'パスポートを おねがいします', romaji: 'pasupōto o onegai shimasu', es: 'El pasaporte, por favor', suggestedReplies: ['r1-p11'], kanji: 'パスポートを お願いします' },
  { id: 'r4-h2', kana: 'こちらに ごきにゅう ください', romaji: 'kochira ni go-kinyū kudasai', es: 'Rellene aquí, por favor', suggestedReplies: ['r1-p8a'], kanji: 'こちらに ご記入 ください' },
  { id: 'r4-h3', kana: 'おへやは ＿＿かいです', romaji: 'o-heya wa ＿＿-kai desu', es: 'Su habitación está en la planta ＿＿', suggestedReplies: ['r1-p4'], kanji: 'お部屋は ＿＿階です' },
  { id: 'r4-h4', kana: 'まもなく ＿＿です', romaji: 'mamonaku ＿＿ desu', es: 'Llegamos en breve a ＿＿', note: 'Megafonía del tren.', suggestedReplies: [], category: 'transport', kanji: 'まもなく ＿＿です' },
  { id: 'r4-h5', kana: 'つぎは ＿＿', romaji: 'tsugi wa ＿＿', es: 'Próxima parada: ＿＿', suggestedReplies: [], category: 'transport', kanji: '次は ＿＿' },
  { id: 'r4-h6', kana: 'ドアが しまります', romaji: 'doa ga shimarimasu', es: 'Se cierran las puertas', suggestedReplies: [], category: 'transport', kanji: 'ドアが 閉まります' },
  { id: 'r4-h7', kana: 'のりかえ', romaji: 'norikae', es: 'Transbordo', note: 'En carteles: 乗り換え.', kanji: '乗り換え', suggestedReplies: [], category: 'transport' },
]);

export const R4_CARDS: InfoCard[] = [
  {
    id: 'r4-g-particles',
    regionId: 'r4',
    type: 'grammar',
    title: 'Partículas de movimiento',
    body: 'に (a, destino) · で (en, dónde pasa algo) · から (desde) · まで (hasta).',
    examples: [
      { jp: 'しぶやに いきたいです', romaji: 'Shibuya ni ikitai desu', es: 'quiero ir a Shibuya' },
      { jp: 'えきまで おねがいします', romaji: 'eki made onegai shimasu', es: 'hasta la estación, por favor' },
    ],
  },
  {
    id: 'r4-g-tai',
    regionId: 'r4',
    type: 'grammar',
    title: '～たい: querer hacer',
    body: '～ます → ～たいです.',
    examples: [
      { jp: 'いきます → いきたいです', romaji: 'ikimasu → ikitai desu', es: 'voy → quiero ir' },
      { jp: 'たべます → たべたいです', romaji: 'tabemasu → tabetai desu', es: 'como → quiero comer' },
      { jp: 'かいます → かいたいです', romaji: 'kaimasu → kaitai desu', es: 'compro → quiero comprar' },
    ],
  },
  {
    id: 'r4-g-te',
    regionId: 'r4',
    type: 'grammar',
    title: 'Fórmulas con て',
    body: '～ても いいですか (¿puedo…?) y ～て もらえますか (¿podría… por mí?).',
    examples: [
      { jp: 'しゃしんを とっても いいですか', romaji: 'shashin o totte mo ii desu ka', es: '¿puedo hacer fotos?' },
      { jp: 'しゃしんを とって もらえますか', romaji: 'shashin o totte moraemasu ka', es: '¿nos puede hacer una foto?' },
    ],
  },
  {
    id: 'r4-g-hours',
    regionId: 'r4',
    type: 'grammar',
    title: 'Las horas',
    body: 'Hora + じ. Tres son irregulares: **よじ** (4), **しちじ** (7) y **くじ** (9). はん = y media. ごぜん = de la mañana; ごご = de la tarde.',
    examples: [
      { jp: 'なんじですか', romaji: 'nanji desu ka', es: '¿qué hora es?' },
      { jp: 'しちじはん', romaji: 'shichiji han', es: 'las siete y media' },
      { jp: 'ごぜん くじ', romaji: 'gozen kuji', es: 'las nueve de la mañana' },
    ],
  },
  {
    id: 'r4-c-kanji',
    regionId: 'r4',
    type: 'culture',
    title: 'Kanji de supervivencia',
    body: 'No hace falta escribirlos: basta reconocerlos en puertas, baños, estaciones y tiendas.',
    examples: KANJI.map((k) => ({ jp: k.kanji, romaji: k.romaji, es: k.es })),
  },
  {
    id: 'r4-c-katakana-ext',
    regionId: 'r4',
    type: 'culture',
    title: 'ッ pequeña, ー y combinaciones',
    body: 'La ッ pequeña dobla la consonante siguiente (una micropausa). La raya ー alarga la vocal. Las combinaciones チェ, フェ, ティ existen solo en katakana, para sonidos extranjeros.',
    examples: [
      { jp: 'スイッチ', romaji: 'suicchi', es: 'interruptor / Switch' },
      { jp: 'チェックイン', romaji: 'chekku-in', es: 'check-in' },
      { jp: 'フェルン', romaji: 'Ferun', es: 'Fern' },
    ],
  },
];

const word = (id: string, kana: string, romaji: string, es: string): PracticeWord => ({ id, regionId: 'r4', kana, romaji, es, requiredKana: kanaIdsFor(kana) });

export const R4_WORDS: PracticeWord[] = [
  word('r4-w-chekkuin', 'チェックイン', 'chekku-in', 'check-in'),
  word('r4-w-menyu', 'メニュー', 'menyū', 'carta'),
  word('r4-w-shutaruku', 'シュタルク', 'Shutaruku', 'Stark'),
  word('r4-w-ferun', 'フェルン', 'Ferun', 'Fern'),
  word('r4-w-pasupoto', 'パスポート', 'pasupōto', 'pasaporte'),
  word('r4-w-jusu', 'ジュース', 'jūsu', 'zumo'),
  word('r4-w-shoppingu', 'ショッピング', 'shoppingu', 'compras'),
  word('r4-w-suicchi', 'スイッチ', 'suicchi', 'interruptor / Switch'),
];

const K = (rows: string[]) => kanaInRows('katakana', rows);

export const R4_NODES: LessonNode[] = [
  { id: 'r4-1', regionId: 'r4', title: 'En el hotel', summary: 'Check-in, desayuno, wifi y equipaje. Las horas. Katakana combinado.', kind: 'phrases', phraseIds: ['r4-p1', 'r4-p2', 'r4-p3', 'r4-p4', 'r4-p5', 'r4-p6'], kanaIds: K(['ky', 'sh', 'ch', 'ny', 'hy', 'my', 'ry', 'gy', 'j', 'by', 'py']), infoCardIds: ['r4-g-hours'], extras: ['clock'], recommendedDate: '2026-10-26', dayLabel: 'Lun 26 oct' },
  { id: 'r4-2', regionId: 'r4', title: '¿Dónde está?', summary: 'Preguntar por sitios y decir adónde quieres ir. Partículas de movimiento. ッ y ー.', kind: 'phrases', phraseIds: ['r4-p7', 'r4-p8', 'r4-p9'], kanaIds: K(EXTENDED_ROWS), infoCardIds: ['r4-g-particles', 'r4-c-katakana-ext'], practiceWordIds: R4_WORDS.map((w) => w.id), recommendedDate: '2026-10-27', dayLabel: 'Mar 27 oct' },
  { id: 'r4-3', regionId: 'r4', title: 'En el tren y en el taxi', summary: '¿Este tren va a…?, el taxi y los billetes. Gramática: ～たい.', kind: 'phrases', phraseIds: ['r4-p10', 'r4-p11', 'r4-p12'], kanaIds: [], infoCardIds: ['r4-g-tai'], recommendedDate: '2026-10-28', dayLabel: 'Mié 28 oct' },
  { id: 'r4-4', regionId: 'r4', title: 'Pedir ayuda', summary: '¿Habla inglés?, repetir, más despacio y las fotos. Fórmulas con て.', kind: 'phrases', phraseIds: ['r4-p13', 'r4-p14', 'r4-p15', 'r4-p16', 'r4-p17'], kanaIds: [], infoCardIds: ['r4-g-te'], recommendedDate: '2026-10-29', dayLabel: 'Mié 28 – Jue 29 oct' },
  { id: 'r4-5', regionId: 'r4', title: 'Emergencias', summary: 'Perderse, encontrarse mal y pedir ayuda. Kanji de supervivencia.', kind: 'phrases', phraseIds: ['r4-p18', 'r4-p19', 'r4-p20'], kanaIds: [], infoCardIds: ['r4-c-kanji'], kanjiIds: KANJI.map((k) => k.id), recommendedDate: '2026-10-29', dayLabel: 'Jue 29 oct' },
  { id: 'r4-6', regionId: 'r4', title: 'Lo que te dirán', summary: 'Recepción y megafonía del tren. Escena: llegada al hotel.', kind: 'heard', phraseIds: ['r4-h1', 'r4-h2', 'r4-h3', 'r4-h4', 'r4-h5', 'r4-h6', 'r4-h7'], kanaIds: [], infoCardIds: [], sceneId: 'scene-4', recommendedDate: '2026-10-30', dayLabel: 'Vie 30 oct' },
  { id: 'r4-7', regionId: 'r4', title: 'Repaso general', summary: 'Todo lo que tenga repaso pendiente, de las cuatro regiones.', kind: 'review', phraseIds: [], kanaIds: [], infoCardIds: [], recommendedDate: '2026-10-31', dayLabel: 'Sáb 31 oct' },
  { id: 'r4-boss', regionId: 'r4', title: 'Guardián del gran viaje', summary: 'Hotel, transporte y ayuda, sin tarjetas. Apruebas con un 80 %.', kind: 'boss', phraseIds: [], kanaIds: [], infoCardIds: [], recommendedDate: '2026-10-31', dayLabel: 'Sáb 31 oct' },
  { id: 'final-boss', regionId: 'r4', title: 'Guardián final', summary: 'Un día entero en Japón: las cuatro regiones mezcladas y la escena final.', kind: 'finalBoss', phraseIds: [], kanaIds: [], infoCardIds: [], sceneId: 'scene-5', recommendedDate: '2026-11-01', dayLabel: 'Dom 1 nov' },
];

export const R4_SCENARIOS: Scenario[] = [
  { id: 'r4-s1', regionId: 'r4', promptEs: 'Llegas al hotel con la maleta.', correctPhraseIds: ['r4-p1'] },
  { id: 'r4-s2', regionId: 'r4', promptEs: 'Quieres saber a qué hora sirven el desayuno.', correctPhraseIds: ['r4-p4'] },
  { id: 'r4-s3', regionId: 'r4', promptEs: 'Necesitas el baño en una estación enorme.', correctPhraseIds: ['r4-p8'] },
  { id: 'r4-s4', regionId: 'r4', promptEs: 'No sabes si este tren va a tu destino.', correctPhraseIds: ['r4-p10'] },
  { id: 'r4-s5', regionId: 'r4', promptEs: 'Te hablan muy rápido y no te enteras.', correctPhraseIds: ['r4-p15', 'r4-p14'], acceptAll: true },
  { id: 'r4-s6', regionId: 'r4', promptEs: 'Queréis una foto los dos delante del templo.', correctPhraseIds: ['r4-p17'] },
  { id: 'r4-s7', regionId: 'r4', promptEs: 'Te has perdido de noche en un barrio desconocido.', correctPhraseIds: ['r4-p18'] },
  { id: 'r4-s8', regionId: 'r4', promptEs: 'Es el último día y el vuelo sale por la tarde: quieres dejar la maleta en el hotel.', correctPhraseIds: ['r4-p6'] },
];
