import { definePhrases, type InfoCard, type LessonNode, type Scenario } from './types';
import { KANJI_MENU, KANJI_ONSEN, KANJI_STREET, KANJI_TRANSPORT } from './kanji';

// Región «Tu ruta» (user request, Oct 2026): the real itinerary — Osaka → Kioto → Kanazawa → Hakone → Tokio —
// plus a ryokan/onsen unit, 35 extra kanji and fast listening. Not in the printed dossier, so every phrase
// is `generated: true` for review. Built from dossier patterns (＿＿は どこですか, ＿＿まで おねがいします…).

const G = { generated: true } as const;

export const R5_SAY = definePhrases('r5', 'transport', 'say', [
  { id: 'r5-i1', ...G, kana: 'おおさかえきは どこですか', romaji: 'Ōsaka-eki wa doko desu ka', es: '¿Dónde está la estación de Osaka?', kanji: '大阪駅は どこですか', note: 'Día 6: JR Rapid a Kioto, 15 min.' },
  { id: 'r5-i2', ...G, kana: 'この でんしゃは きょうとに いきますか', romaji: 'kono densha wa Kyōto ni ikimasu ka', es: '¿Este tren va a Kioto?', kanji: 'この 電車は 京都に 行きますか', equivalents: ['r4-p10'] },
  { id: 'r5-i3', ...G, kana: 'しんかんせんの のりばは どこですか', romaji: 'shinkansen no noriba wa doko desu ka', es: '¿Dónde se coge el shinkansen?', kanji: '新幹線の 乗り場は どこですか', note: 'Día 11: Kanazawa → Tokio.' },
  { id: 'r5-i4', ...G, kana: 'ロマンスカーは なんばんせんですか', romaji: 'Romansukā wa nanbansen desu ka', es: '¿De qué andén sale el Romancecar?', kanji: 'ロマンスカーは 何番線ですか', note: 'Día 11: Tokio → Hakone.' },
  { id: 'r5-i5', ...G, kana: 'かなざわまで おとな ふたり おねがいします', romaji: 'Kanazawa made otona futari onegai shimasu', es: 'Dos adultos hasta Kanazawa, por favor', kanji: '金沢まで 大人 二人 お願いします', note: 'Día 9: Thunderbird desde Kioto.' },
  { id: 'r5-i6', ...G, kana: 'していせきを ふたつ おねがいします', romaji: 'shiteiseki o futatsu onegai shimasu', es: 'Dos asientos reservados, por favor', kanji: '指定席を 二つ お願いします' },
  { id: 'r5-i7', ...G, kana: 'あさくさばしまで おねがいします', romaji: 'Asakusabashi made onegai shimasu', es: 'A Asakusabashi, por favor (taxi)', kanji: '浅草橋まで お願いします', note: 'Tu hotel de Tokio.', equivalents: ['r4-p11'] },
  { id: 'r5-i8', ...G, kana: 'しんさいばしの ホテルに とまって います', romaji: 'Shinsaibashi no hoteru ni tomatte imasu', es: 'Me alojo en un hotel de Shinsaibashi', kanji: '心斎橋の ホテルに 泊まって います', note: 'Tu hotel de Osaka.' },
  // Ryokan & onsen (Hakone, 11 nov)
  { id: 'r5-p1', ...G, category: 'hotel', kana: 'ゆうしょくは なんじですか', romaji: 'yūshoku wa nanji desu ka', es: '¿A qué hora es la cena?', kanji: '夕食は 何時ですか' },
  { id: 'r5-p2', ...G, category: 'hotel', kana: 'おんせんは どこですか', romaji: 'onsen wa doko desu ka', es: '¿Dónde está el onsen?', kanji: '温泉は どこですか' },
  { id: 'r5-p3', ...G, category: 'hotel', kana: 'かしきりぶろは ありますか', romaji: 'kashikiri-buro wa arimasu ka', es: '¿Hay baño privado?', kanji: '貸切風呂は ありますか', note: 'Se reserva por turnos: ideal si queréis bañaros juntos.' },
  { id: 'r5-p4', ...G, category: 'hotel', kana: 'ゆかたの きかたを おしえて ください', romaji: 'yukata no kikata o oshiete kudasai', es: '¿Me enseña a ponerme el yukata?', kanji: '浴衣の 着方を 教えて ください' },
  { id: 'r5-p5', ...G, category: 'hotel', kana: 'タオルを もう ひとつ ください', romaji: 'taoru o mō hitotsu kudasai', es: 'Otra toalla, por favor', kanji: 'タオルを もう 一つ ください' },
  { id: 'r5-p6', ...G, category: 'hotel', kana: 'タトゥーは だいじょうぶですか', romaji: 'tatū wa daijōbu desu ka', es: '¿Se permiten los tatuajes?', kanji: 'タトゥーは 大丈夫ですか', note: 'Muchos onsen públicos no los admiten; los privados sí.' },
  { id: 'r5-p7', ...G, category: 'hotel', kana: 'とても おいしかったです', romaji: 'totemo oishikatta desu', es: 'Estaba todo buenísimo', kanji: 'とても 美味しかったです', note: 'Pasado de おいしいです: tras la cena kaiseki.' },
  { id: 'r5-p8', ...G, category: 'hotel', kana: 'おせわに なりました', romaji: 'o-sewa ni narimashita', es: 'Gracias por todo (al marcharte)', kanji: 'お世話に なりました', note: 'La despedida perfecta al dejar el ryokan.' },
]);

export const R5_HEAR = definePhrases('r5', 'hotel', 'hear', [
  { id: 'r5-h1', ...G, kana: 'ゆうしょくは ろくじからです', romaji: 'yūshoku wa rokuji kara desu', es: 'La cena es a partir de las seis', kanji: '夕食は 六時からです', suggestedReplies: ['r1-p4'] },
  { id: 'r5-h2', ...G, kana: 'だいよくじょうは いっかいです', romaji: 'daiyokujō wa ikkai desu', es: 'El baño grande está en la planta baja', kanji: '大浴場は 一階です', suggestedReplies: ['r1-p4'] },
  { id: 'r5-h3', ...G, kana: 'おふとんを しきに まいります', romaji: 'o-futon o shiki ni mairimasu', es: 'Venimos a prepararles el futón', kanji: 'お布団を 敷きに 参ります', note: 'Lo dicen durante la cena: al volver, la habitación es dormitorio.', suggestedReplies: ['r1-p11'] },
  { id: 'r5-h4', ...G, kana: 'ごゆっくり どうぞ', romaji: 'go-yukkuri dōzo', es: 'Disfrútenlo, sin prisa', suggestedReplies: ['r1-p4'] },
]);

export const R5_CARDS: InfoCard[] = [
  {
    id: 'r5-c-route',
    regionId: 'r5',
    type: 'culture',
    title: 'Tu ruta',
    body: '- **Osaka** (3–6 nov): metro y JR; hotel en Shinsaibashi.\n- **Kioto** (6–9 nov): JR Rapid desde Osaka, 15 min.\n- **Kanazawa** (9–11 nov): tren Thunderbird, 2 h 15.\n- **Hakone** (11–12 nov): shinkansen a Tokio y Romancecar; noche en ryokan.\n- **Tokio** (12–16 nov): hotel en Asakusabashi.\n\nUna tarjeta IC (ICOCA o Suica) sirve en todas las ciudades.',
  },
  {
    id: 'r5-c-board',
    regionId: 'r5',
    type: 'culture',
    title: 'Leer el panel de salidas',
    body: 'Cada línea del panel dice: tipo de tren, hora, destino y andén. El tipo importa: un 特急 cobra suplemento y para poco; un 普通 para en todas. En los trenes largos, mira si tu billete es de 指定席 (asiento asignado) o de 自由席 (te sientas donde haya sitio).',
    examples: [
      { jp: '特急', romaji: 'tokkyū', es: 'expreso limitado' },
      { jp: '番線', romaji: 'bansen', es: 'andén número…' },
      { jp: '指定席', romaji: 'shiteiseki', es: 'asiento reservado' },
    ],
  },
  {
    id: 'r5-c-menu',
    regionId: 'r5',
    type: 'culture',
    title: 'Leer la carta',
    body: 'En los locales de comida rápida (gyūdon, ramen, teishoku) muchas cartas están solo en japonés. Con estos kanji sabes de qué es el plato: 牛 ternera, 豚 cerdo, 鶏 pollo, 魚 pescado, 卵 huevo. 丼 es un bol de arroz con algo encima, 定食 es el menú completo y 大盛り la ración grande.',
    examples: [
      { jp: '牛丼', romaji: 'gyūdon', es: 'bol de arroz con ternera' },
      { jp: '親子丼', romaji: 'oyakodon', es: 'bol de pollo y huevo' },
    ],
  },
  {
    id: 'r5-c-onsen',
    regionId: 'r5',
    type: 'culture',
    title: 'Reglas del onsen y del ryokan',
    body: '- Lávate entero sentado en las duchas antes de entrar al agua.\n- Al agua se entra sin ropa. La toalla pequeña no se mete en el agua: va sobre la cabeza o al borde.\n- Mira la cortina: 男湯 hombres (suele ser azul), 女湯 mujeres (suele ser roja).\n- El yukata se cruza **izquierda sobre derecha**; al revés es como se viste a los difuntos.\n- Los zapatos se quedan en la entrada; en el tatami, ni zapatillas.\n- La cena kaiseki llega en muchos platos pequeños: sin prisa.',
    examples: [
      { jp: '温泉', romaji: 'onsen', es: 'aguas termales' },
      { jp: '浴衣', romaji: 'yukata', es: 'yukata' },
      { jp: '貸切', romaji: 'kashikiri', es: 'privado' },
    ],
  },
  {
    id: 'r5-c-listen',
    regionId: 'r5',
    type: 'culture',
    title: 'Oído rápido',
    body: 'En Japón nadie te va a hablar despacio. Aquí escucharás lo que te dirán y la megafonía del tren sin texto y cada vez más rápido. Fíjate en la palabra clave: el nombre de la estación, la cifra, el verbo del final.',
  },
];

export const R5_NODES: LessonNode[] = [
  { id: 'r5-1', regionId: 'r5', extra: true, title: 'Estaciones y trenes', summary: 'Encontrar la estación, el tren a Kioto, el shinkansen y el Romancecar. Kanji del panel de salidas.', kind: 'phrases', phraseIds: ['r5-i1', 'r5-i2', 'r5-i3', 'r5-i4'], kanaIds: [], infoCardIds: ['r5-c-route', 'r5-c-board'], kanjiIds: KANJI_TRANSPORT.slice(0, 6).map((k) => k.id), recommendedDate: '', dayLabel: 'Extra · tu ruta' },
  { id: 'r5-2', regionId: 'r5', extra: true, title: 'Billetes y hoteles', summary: 'Comprar los billetes a Kanazawa, asientos reservados y el taxi a tus hoteles. Kanji de la estación.', kind: 'phrases', phraseIds: ['r5-i5', 'r5-i6', 'r5-i7', 'r5-i8'], kanaIds: [], infoCardIds: [], kanjiIds: KANJI_TRANSPORT.slice(6).map((k) => k.id), recommendedDate: '', dayLabel: 'Extra · tu ruta' },
  { id: 'r5-3', regionId: 'r5', extra: true, title: 'Kanji de la carta', summary: 'Ternera, cerdo, pollo, pescado, huevo y los kanji de los menús y precios.', kind: 'signs', phraseIds: [], kanaIds: [], infoCardIds: ['r5-c-menu'], kanjiIds: KANJI_MENU.map((k) => k.id), recommendedDate: '', dayLabel: 'Extra · tu ruta' },
  { id: 'r5-4', regionId: 'r5', extra: true, title: 'Kanji de la calle', summary: 'Norte, sur, derecha, izquierda, información, cambio de moneda y emergencias.', kind: 'signs', phraseIds: [], kanaIds: [], infoCardIds: [], kanjiIds: KANJI_STREET.map((k) => k.id), recommendedDate: '', dayLabel: 'Extra · tu ruta' },
  { id: 'r5-5', regionId: 'r5', extra: true, title: 'Llegada al ryokan', summary: 'La cena, el onsen, el baño privado y el yukata. Kanji del onsen.', kind: 'phrases', phraseIds: ['r5-p1', 'r5-p2', 'r5-p3', 'r5-p4', 'r5-h1', 'r5-h2'], kanaIds: [], infoCardIds: ['r5-c-onsen'], kanjiIds: KANJI_ONSEN.map((k) => k.id), recommendedDate: '', dayLabel: 'Extra · Hakone' },
  { id: 'r5-6', regionId: 'r5', extra: true, title: 'Onsen y despedida', summary: 'Toallas, tatuajes, agradecer la cena y despedirte del ryokan.', kind: 'phrases', phraseIds: ['r5-p5', 'r5-p6', 'r5-p7', 'r5-p8', 'r5-h3', 'r5-h4'], kanaIds: [], infoCardIds: [], recommendedDate: '', dayLabel: 'Extra · Hakone' },
  { id: 'r5-7', regionId: 'r5', extra: true, title: 'Oído rápido', summary: 'Lo que te dirán y la megafonía a velocidad real, sin texto y cada vez más rápido.', kind: 'listening', phraseIds: [], kanaIds: [], infoCardIds: ['r5-c-listen'], recommendedDate: '', dayLabel: 'Extra · escucha' },
  { id: 'r5-boss', regionId: 'r5', extra: true, title: 'Guardián de la ruta', summary: 'Tu viaje entero: trenes, hoteles, ryokan, carteles y oído rápido. Apruebas con un 80 %.', kind: 'boss', phraseIds: [], kanaIds: [], infoCardIds: [], recommendedDate: '', dayLabel: 'Extra' },
];

export const R5_SCENARIOS: Scenario[] = [
  { id: 'r5-s1', regionId: 'r5', promptEs: 'En la estación de Kanazawa buscas dónde se coge el tren bala a Tokio.', correctPhraseIds: ['r5-i3'] },
  { id: 'r5-s2', regionId: 'r5', promptEs: 'En la ventanilla de Kioto pides billetes a Kanazawa para los dos.', correctPhraseIds: ['r5-i5'] },
  { id: 'r5-s3', regionId: 'r5', promptEs: 'Llegas al ryokan y quieres saber a qué hora es la cena.', correctPhraseIds: ['r5-p1'] },
  { id: 'r5-s4', regionId: 'r5', promptEs: 'Queréis bañaros juntos en un baño privado.', correctPhraseIds: ['r5-p3'] },
  { id: 'r5-s5', regionId: 'r5', promptEs: 'Dejas el ryokan y quieres agradecerles todo.', correctPhraseIds: ['r5-p8'] },
  { id: 'r5-s6', regionId: 'r5', promptEs: 'Último taxi en Tokio hasta tu hotel.', correctPhraseIds: ['r5-i7'] },
];

export interface HotelStop {
  city: string;
  dates: string;
  es: string;
  /** Japanese name to show the taxi driver. Check the exact spelling in your booking. */
  jp: string;
}

export const ROUTE_HOTELS: HotelStop[] = [
  { city: 'Osaka', dates: '3–6 nov', es: 'Vessel Inn Shinsaibashi', jp: 'ベッセルイン心斎橋' },
  { city: 'Kioto', dates: '6–9 nov', es: 'APA Hotel Kyoto Eki Horikawadori', jp: 'アパホテル 京都駅堀川通' },
  { city: 'Kanazawa', dates: '9–11 nov', es: 'Hotel Mystays Kanazawa Castle', jp: 'ホテルマイステイズ 金沢キャッスル' },
  { city: 'Hakone', dates: '11–12 nov', es: 'Ryokan (por confirmar)', jp: 'りょかん' },
  { city: 'Tokio', dates: '12–16 nov', es: 'APA Hotel Asakusabashi-Eki Kita', jp: 'アパホテル 浅草橋駅北' },
];

/** Station names announced on your trains (fills for «まもなく ＿＿です» / «つぎは ＿＿»). */
export const ROUTE_STATIONS: { kana: string; es: string }[] = [
  { kana: 'おおさか', es: 'Osaka' },
  { kana: 'きょうと', es: 'Kioto' },
  { kana: 'かなざわ', es: 'Kanazawa' },
  { kana: 'とうきょう', es: 'Tokio' },
  { kana: 'しんじゅく', es: 'Shinjuku' },
  { kana: 'はこねゆもと', es: 'Hakone-Yumoto' },
  { kana: 'あさくさばし', es: 'Asakusabashi' },
];
