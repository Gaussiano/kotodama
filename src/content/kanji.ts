import type { KanjiSign } from './types';

// Survival kanji for E14 «Carteles». The first 12 come from the dossier (spec §10.5);
// the rest (transport, street, menu, onsen) were added at the user's request for the «Tu ruta» region.
export const KANJI_BASE: KanjiSign[] = [
  { id: 'kj-iriguchi', kanji: '入口', romaji: 'iriguchi', es: 'entrada', sign: 'door', group: 'base' },
  { id: 'kj-deguchi', kanji: '出口', romaji: 'deguchi', es: 'salida', sign: 'door', group: 'base' },
  { id: 'kj-otoko', kanji: '男', romaji: 'otoko', es: 'hombres', sign: 'toilet', group: 'base' },
  { id: 'kj-onna', kanji: '女', romaji: 'onna', es: 'mujeres', sign: 'toilet', group: 'base' },
  { id: 'kj-eki', kanji: '駅', romaji: 'eki', es: 'estación', sign: 'station', group: 'base' },
  { id: 'kj-en', kanji: '円', romaji: 'en', es: 'yen', sign: 'price', group: 'base' },
  { id: 'kj-osu', kanji: '押', romaji: 'osu', es: 'empujar', sign: 'door', group: 'base' },
  { id: 'kj-hiku', kanji: '引', romaji: 'hiku', es: 'tirar', sign: 'door', group: 'base' },
  { id: 'kj-eigyochu', kanji: '営業中', romaji: 'eigyōchū', es: 'abierto', sign: 'shop', group: 'base' },
  { id: 'kj-junbichu', kanji: '準備中', romaji: 'junbichū', es: 'cerrado (en preparación)', sign: 'shop', group: 'base' },
  { id: 'kj-kinshi', kanji: '禁止', romaji: 'kinshi', es: 'prohibido', sign: 'notice', group: 'base' },
  { id: 'kj-hangaku', kanji: '半額', romaji: 'hangaku', es: 'mitad de precio', sign: 'price', group: 'base' },
];

export const KANJI_TRANSPORT: KanjiSign[] = [
  { id: 'kj-kaisatsu', kanji: '改札', romaji: 'kaisatsu', es: 'torniquetes de acceso (andenes)', sign: 'direction', group: 'transport' },
  { id: 'kj-bansen', kanji: '番線', romaji: 'bansen', es: 'andén número…', sign: 'board', group: 'transport' },
  { id: 'kj-tokkyu', kanji: '特急', romaji: 'tokkyū', es: 'expreso limitado (con suplemento)', sign: 'board', group: 'transport' },
  { id: 'kj-kaisoku', kanji: '快速', romaji: 'kaisoku', es: 'rápido (para en menos estaciones)', sign: 'board', group: 'transport' },
  { id: 'kj-futsu', kanji: '普通', romaji: 'futsū', es: 'tren local (para en todas)', sign: 'board', group: 'transport' },
  { id: 'kj-shiteiseki', kanji: '指定席', romaji: 'shiteiseki', es: 'asientos reservados', sign: 'board', group: 'transport' },
  { id: 'kj-jiyuseki', kanji: '自由席', romaji: 'jiyūseki', es: 'asientos no reservados', sign: 'board', group: 'transport' },
  { id: 'kj-shinkansen', kanji: '新幹線', romaji: 'shinkansen', es: 'tren bala', sign: 'direction', group: 'transport' },
  { id: 'kj-noriba', kanji: '乗り場', romaji: 'noriba', es: 'punto de embarque (taxis, buses)', sign: 'direction', group: 'transport' },
  { id: 'kj-higashiguchi', kanji: '東口', romaji: 'higashiguchi', es: 'salida este', sign: 'direction', group: 'transport' },
  { id: 'kj-nishiguchi', kanji: '西口', romaji: 'nishiguchi', es: 'salida oeste', sign: 'direction', group: 'transport' },
  { id: 'kj-chikatetsu', kanji: '地下鉄', romaji: 'chikatetsu', es: 'metro', sign: 'direction', group: 'transport' },
];

export const KANJI_STREET: KanjiSign[] = [
  { id: 'kj-kita', kanji: '北', romaji: 'kita', es: 'norte', sign: 'direction', group: 'street' },
  { id: 'kj-minami', kanji: '南', romaji: 'minami', es: 'sur', sign: 'direction', group: 'street' },
  { id: 'kj-migi', kanji: '右', romaji: 'migi', es: 'derecha', sign: 'direction', group: 'street' },
  { id: 'kj-hidari', kanji: '左', romaji: 'hidari', es: 'izquierda', sign: 'direction', group: 'street' },
  { id: 'kj-annaijo', kanji: '案内所', romaji: 'annaijo', es: 'oficina de información', sign: 'notice', group: 'street' },
  { id: 'kj-ryogae', kanji: '両替', romaji: 'ryōgae', es: 'cambio de moneda', sign: 'shop', group: 'street' },
  { id: 'kj-kenbaiki', kanji: '券売機', romaji: 'kenbaiki', es: 'máquina de billetes / tickets', sign: 'notice', group: 'street' },
  { id: 'kj-hijoguchi', kanji: '非常口', romaji: 'hijōguchi', es: 'salida de emergencia', sign: 'door', group: 'street' },
];

export const KANJI_MENU: KanjiSign[] = [
  { id: 'kj-teishoku', kanji: '定食', romaji: 'teishoku', es: 'menú (plato + arroz + sopa)', sign: 'menu', group: 'menu' },
  { id: 'kj-donburi', kanji: '丼', romaji: 'donburi', es: 'bol de arroz con algo encima', sign: 'menu', group: 'menu' },
  { id: 'kj-gyu', kanji: '牛', romaji: 'gyū', es: 'ternera', sign: 'menu', group: 'menu' },
  { id: 'kj-buta', kanji: '豚', romaji: 'buta', es: 'cerdo', sign: 'menu', group: 'menu' },
  { id: 'kj-tori', kanji: '鶏', romaji: 'tori', es: 'pollo', sign: 'menu', group: 'menu' },
  { id: 'kj-sakana', kanji: '魚', romaji: 'sakana', es: 'pescado', sign: 'menu', group: 'menu' },
  { id: 'kj-tamago', kanji: '卵', romaji: 'tamago', es: 'huevo', sign: 'menu', group: 'menu' },
  { id: 'kj-omori', kanji: '大盛り', romaji: 'ōmori', es: 'ración grande', sign: 'menu', group: 'menu' },
  { id: 'kj-zeikomi', kanji: '税込', romaji: 'zeikomi', es: 'impuestos incluidos', sign: 'price', group: 'menu' },
  { id: 'kj-muryo', kanji: '無料', romaji: 'muryō', es: 'gratis', sign: 'price', group: 'menu' },
];

export const KANJI_ONSEN: KanjiSign[] = [
  { id: 'kj-onsen', kanji: '温泉', romaji: 'onsen', es: 'aguas termales', sign: 'onsen', group: 'onsen' },
  { id: 'kj-otokoyu', kanji: '男湯', romaji: 'otoko-yu', es: 'baño de hombres', sign: 'onsen', group: 'onsen' },
  { id: 'kj-onnayu', kanji: '女湯', romaji: 'onna-yu', es: 'baño de mujeres', sign: 'onsen', group: 'onsen' },
  { id: 'kj-kashikiri', kanji: '貸切', romaji: 'kashikiri', es: 'privado / reservado', sign: 'onsen', group: 'onsen' },
  { id: 'kj-yukata', kanji: '浴衣', romaji: 'yukata', es: 'yukata (kimono ligero)', sign: 'onsen', group: 'onsen' },
];

export const KANJI: KanjiSign[] = [...KANJI_BASE, ...KANJI_TRANSPORT, ...KANJI_STREET, ...KANJI_MENU, ...KANJI_ONSEN];

export const KANJI_BY_ID: Record<string, KanjiSign> = Object.fromEntries(KANJI.map((k) => [k.id, k]));
