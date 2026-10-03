import { KANJI } from './kanji';
import type { KanjiSign } from './types';
import { PHRASES, WORDS, type Phrase } from './index';

// Kanji readings (furigana) and glosses for every kanji run that appears in the content.
// Readings are the ones used in these phrases (not exhaustive dictionary readings).
// A "run" is a maximal sequence of kanji inside a text: 大丈夫 in 大丈夫です, 願 in お願いします.

export interface KanjiEntry {
  run: string;
  reading: string; // hiragana, as read in the phrases
  es: string; // short gloss
}

const K: [string, string, string][] = [
  ['一度', 'いちど', 'una vez (もう一度: otra vez)'],
  ['不苦労', 'ふくろう', '«sin penurias»; juego de palabras con búho'],
  ['乗', 'の', 'subir(se) a (乗り換え: transbordo)'],
  ['乾杯', 'かんぱい', 'brindis, ¡salud!'],
  ['予約', 'よやく', 'reserva'],
  ['二', 'ふた', 'dos (二つ: dos cosas)'],
  ['二人', 'ふたり', 'dos personas'],
  ['付', 'つ', 'añadir, poner (お付けします: le pongo)'],
  ['以上', 'いじょう', 'eso es todo; lo anterior'],
  ['会計', 'かいけい', 'cuenta (お会計: la cuenta)'],
  ['何', 'なん', 'qué'],
  ['何名様', 'なんめいさま', '¿cuántas personas? (cortés)'],
  ['何時', 'なんじ', 'qué hora'],
  ['使', 'つか', 'usar (使えますか: ¿se puede usar?)'],
  ['免税', 'めんぜい', 'libre de impuestos, tax-free'],
  ['入口', 'いりぐち', 'entrada'],
  ['円', 'えん', 'yen'],
  ['写真', 'しゃしん', 'foto'],
  ['出口', 'でぐち', 'salida'],
  ['分', 'わか', 'entender (分かりません: no entiendo)'],
  ['切符', 'きっぷ', 'billete'],
  ['利用', 'りよう', 'uso (ご利用ですか: ¿quiere…?)'],
  ['割引', 'わりびき', 'descuento'],
  ['助', 'たす', 'ayudar (助けて: ¡ayuda!)'],
  ['半額', 'はんがく', 'mitad de precio'],
  ['営業中', 'えいぎょうちゅう', 'abierto'],
  ['大丈夫', 'だいじょうぶ', 'bien, no hace falta'],
  ['失礼', 'しつれい', 'descortesía (失礼します: con permiso)'],
  ['女', 'おんな', 'mujer'],
  ['少', 'すこ', 'poco (少し: un poco)'],
  ['少々', 'しょうしょう', 'un momento'],
  ['引', 'ひ', 'tirar (en puertas)'],
  ['待', 'ま', 'esperar (お待ちください: espere)'],
  ['悪', 'わる', 'malo (気分が悪い: encontrarse mal)'],
  ['抜', 'ぬ', 'quitar (わさび抜き: sin wasabi)'],
  ['押', 'お', 'empujar (en puertas)'],
  ['持', 'も', 'tener, llevar (お持ちですか: ¿tiene…?)'],
  ['換', 'か', 'cambiar (乗り換え: transbordo)'],
  ['撮', 'と', 'hacer fotos (撮ります)'],
  ['支払', 'しはら', 'pago (お支払い: el pago)'],
  ['日本語', 'にほんご', 'japonés (idioma)'],
  ['朝', 'あさ', 'mañana (朝ごはん: desayuno)'],
  ['来', 'き', 'venir (来ました: vine)'],
  ['次', 'つぎ', 'siguiente'],
  ['気', 'き', 'ánimo, aire (お気をつけて: cuídate)'],
  ['気分', 'きぶん', 'estado de ánimo, cómo te encuentras'],
  ['水', 'みず', 'agua'],
  ['決', 'き', 'decidir (お決まりですか: ¿ya han decidido?)'],
  ['注文', 'ちゅうもん', 'pedido (ご注文: su pedido)'],
  ['温', 'あたた', 'calentar (温めて: caliéntelo)'],
  ['準備中', 'じゅんびちゅう', 'en preparación, cerrado'],
  ['物', 'もの', 'cosa (飲み物: bebida; 荷物: equipaje)'],
  ['現金', 'げんきん', 'efectivo'],
  ['生', 'なま', 'de barril, crudo (生ビール)'],
  ['男', 'おとこ', 'hombre'],
  ['禁止', 'きんし', 'prohibido'],
  ['私', 'わたし', 'yo'],
  ['箸', 'はし', 'palillos (お箸)'],
  ['美味', 'おい', 'rico (美味しい: está buenísimo)'],
  ['英語', 'えいご', 'inglés (idioma)'],
  ['荷物', 'にもつ', 'equipaje'],
  ['行', 'い', 'ir (行きます / 行きたい)'],
  ['袋', 'ふくろ', 'bolsa'],
  ['見', 'み', 'ver, mirar (見ているだけ: solo mirando)'],
  ['言霊', 'ことだま', 'el poder que vive en las palabras'],
  ['記入', 'きにゅう', 'rellenar un formulario'],
  ['試着', 'しちゃく', 'probarse ropa'],
  ['話', 'はな', 'hablar (話せますか: ¿habla…?)'],
  ['買', 'か', 'comprar (買えますか: ¿se puede comprar?)'],
  ['迷', 'まよ', 'perderse (道に迷いました)'],
  ['道', 'みち', 'camino, calle'],
  ['部屋', 'へや', 'habitación (お部屋)'],
  ['醤油', 'しょうゆ', 'salsa de soja'],
  ['閉', 'し', 'cerrar(se) (ドアが閉まります)'],
  ['階', 'かい', 'planta, piso'],
  ['電車', 'でんしゃ', 'tren'],
  ['預', 'あず', 'dejar en custodia (預かって: guárdenlo)'],
  ['願', 'ねが', 'desear (お願いします: por favor)'],
  ['食券', 'しょっけん', 'ticket de comida (máquina)'],
  ['飲', 'の', 'beber (お飲み物: bebida)'],
  ['駅', 'えき', 'estación'],
  ['大阪駅', 'おおさかえき', 'estación de Osaka'],
  ['京都', 'きょうと', 'Kioto'],
  ['新幹線', 'しんかんせん', 'tren bala'],
  ['場', 'ば', 'lugar (乗り場: punto de embarque)'],
  ['何番線', 'なんばんせん', '¿qué andén?'],
  ['金沢', 'かなざわ', 'Kanazawa'],
  ['大人', 'おとな', 'adulto'],
  ['指定席', 'していせき', 'asiento reservado'],
  ['浅草橋', 'あさくさばし', 'Asakusabashi (Tokio)'],
  ['心斎橋', 'しんさいばし', 'Shinsaibashi (Osaka)'],
  ['泊', 'と', 'alojarse (泊まって います)'],
  ['夕食', 'ゆうしょく', 'cena'],
  ['温泉', 'おんせん', 'aguas termales, onsen'],
  ['貸切風呂', 'かしきりぶろ', 'baño privado reservable'],
  ['浴衣', 'ゆかた', 'yukata'],
  ['着方', 'きかた', 'forma de ponerse (ropa)'],
  ['教', 'おし', 'enseñar (教えて: enséñeme)'],
  ['一', 'ひと', 'uno (一つ: una cosa)'],
  ['世話', 'せわ', 'cuidado, atención (お世話に なりました)'],
  ['六時', 'ろくじ', 'las seis'],
  ['大浴場', 'だいよくじょう', 'baño grande común'],
  ['一階', 'いっかい', 'planta baja (primer piso)'],
  ['布団', 'ふとん', 'futón'],
  ['敷', 'し', 'extender (el futón)'],
  ['参', 'まい', 'venir / ir (humilde: 参ります)'],
  ['特急', 'とっきゅう', 'expreso limitado'],
  ['普通', 'ふつう', 'tren local; normal'],
  ['自由席', 'じゆうせき', 'asiento no reservado'],
  ['番線', 'ばんせん', 'andén número…'],
  ['牛', 'ぎゅう', 'ternera'],
  ['豚', 'ぶた', 'cerdo'],
  ['鶏', 'とり', 'pollo'],
  ['魚', 'さかな', 'pescado'],
  ['卵', 'たまご', 'huevo'],
  ['大盛', 'おおもり', 'ración grande (大盛り)'],
  ['税込', 'ぜいこみ', 'impuestos incluidos'],
  ['無料', 'むりょう', 'gratis'],
  ['定食', 'ていしょく', 'menú completo'],
  ['丼', 'どんぶり', 'bol de arroz con algo encima'],
  ['改札', 'かいさつ', 'torniquetes de acceso'],
  ['快速', 'かいそく', 'tren rápido'],
  ['東口', 'ひがしぐち', 'salida este'],
  ['西口', 'にしぐち', 'salida oeste'],
  ['地下鉄', 'ちかてつ', 'metro'],
  ['北', 'きた', 'norte'],
  ['南', 'みなみ', 'sur'],
  ['右', 'みぎ', 'derecha'],
  ['左', 'ひだり', 'izquierda'],
  ['案内所', 'あんないじょ', 'oficina de información'],
  ['両替', 'りょうがえ', 'cambio de moneda'],
  ['券売機', 'けんばいき', 'máquina de billetes'],
  ['非常口', 'ひじょうぐち', 'salida de emergencia'],
  ['男湯', 'おとこゆ', 'baño de hombres'],
  ['女湯', 'おんなゆ', 'baño de mujeres'],
  ['貸切', 'かしきり', 'privado, reservado'],
  ['牛丼', 'ぎゅうどん', 'bol de arroz con ternera'],
  ['親子丼', 'おやこどん', 'bol de pollo y huevo'],
  ['京都駅堀川通', 'きょうとえきほりかわどおり', 'Kyoto Eki Horikawadori (hotel)'],
  ['浅草橋駅北', 'あさくさばしえききた', 'Asakusabashi-Eki Kita (hotel)'],
  ['種別', 'しゅべつ', 'tipo de tren'],
  ['時刻', 'じこく', 'hora'],
  ['行先', 'いきさき', 'destino'],
  ['東京', 'とうきょう', 'Tokio'],
];

export const KANJI_ENTRIES: KanjiEntry[] = K.map(([run, reading, es]) => ({ run, reading, es }));
export const KANJI_BY_RUN: Record<string, KanjiEntry> = Object.fromEntries(KANJI_ENTRIES.map((e) => [e.run, e]));

const KANJI_RE = /[一-鿿々]+/g;

/** Maximal kanji runs in a text, in order (duplicates kept). */
export function kanjiRuns(text: string): string[] {
  return [...text.matchAll(KANJI_RE)].map((m) => m[0]);
}

export interface FuriganaSegment {
  text: string;
  reading?: string;
}

/** Splits a text into plain segments and kanji runs with their hiragana reading (when known). */
export function furiganaSegments(text: string): FuriganaSegment[] {
  const out: FuriganaSegment[] = [];
  let last = 0;
  for (const m of text.matchAll(KANJI_RE)) {
    if (m.index! > last) out.push({ text: text.slice(last, m.index) });
    out.push({ text: m[0], reading: KANJI_BY_RUN[m[0]]?.reading });
    last = m.index! + m[0].length;
  }
  if (last < text.length) out.push({ text: text.slice(last) });
  return out;
}

// ─── dictionary entries ─────────────────────────────────────────────────────
// Entry ids: 'w:<wordId>' for practice words, 'k:<run>' for kanji runs.

export type DictKind = 'word' | 'kanji';

export interface DictEntry {
  id: string;
  kind: DictKind;
  jp: string; // word kana or kanji run
  reading: string; // romaji for words, hiragana for kanji
  es: string;
  /** First phrase that contains this item, for the example line. */
  examplePhraseId?: string;
  sign?: KanjiSign;
}

function exampleFor(run: string): Phrase | undefined {
  return PHRASES.find((p) => (p.kanji ?? '').includes(run)) ?? PHRASES.find((p) => (p.note ?? '').includes(run));
}

export const DICT_ENTRIES: DictEntry[] = [
  ...WORDS.map<DictEntry>((w) => ({ id: `w:${w.id}`, kind: 'word', jp: w.kana, reading: w.romaji, es: w.es })),
  ...KANJI_ENTRIES.map<DictEntry>((k) => ({ id: `k:${k.run}`, kind: 'kanji', jp: k.run, reading: k.reading, es: k.es, examplePhraseId: exampleFor(k.run)?.id, sign: KANJI.find((s) => s.kanji === k.run) })),
];
export const DICT_BY_ID: Record<string, DictEntry> = Object.fromEntries(DICT_ENTRIES.map((e) => [e.id, e]));

/** Dictionary entry ids touched when an SRS item (phrase / word / kanji sign) is seen in an exercise. */
export function dictionaryIdsForItem(itemId: string): string[] {
  const phrase = PHRASES.find((p) => p.id === itemId);
  if (phrase) return [...new Set([...kanjiRuns(phrase.kanji ?? ''), ...kanjiRuns(phrase.note ?? '')])].filter((r) => KANJI_BY_RUN[r]).map((r) => `k:${r}`);
  if (WORDS.some((w) => w.id === itemId)) return [`w:${itemId}`];
  const sign = KANJI.find((k) => k.id === itemId);
  if (sign) return kanjiRuns(sign.kanji).filter((r) => KANJI_BY_RUN[r]).map((r) => `k:${r}`);
  return [];
}
