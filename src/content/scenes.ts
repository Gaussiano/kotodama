import type { Scene } from './types';

// Scenes for E15 (spec §10.8). NPC lines that are not in the dossier are inline `generated: true`
// so they can be reviewed (see CLAUDE.md «Generated Japanese»).

export const SCENES: Scene[] = [
  {
    id: 'scene-1',
    regionId: 'r1',
    title: 'Primer paseo',
    setting: 'Entras en una tienda pequeña en tu primer día.',
    npcRole: 'clerk',
    turns: [
      { npc: { phraseId: 'r1-h1' }, options: [{ gesture: 'Un gesto con la cabeza' }, { phraseId: 'r1-p7' }, { phraseId: 'r1-p12' }], correct: ['gesture'] },
      { narration: 'Saludas al dependiente. Es media tarde.', options: [{ phraseId: 'r1-p2' }, { phraseId: 'r1-p1' }, { phraseId: 'r1-p17' }], correct: ['r1-p2'] },
      {
        npc: { kana: 'なにか おさがしですか', romaji: 'nanika o-sagashi desu ka', es: '¿Busca algo?', generated: true },
        narration: 'Te ofrece ayuda, pero solo quieres mirar.',
        options: [{ phraseId: 'r1-p9' }, { phraseId: 'r1-p10' }, { phraseId: 'r1-p11' }],
        correct: ['r1-p9'],
      },
      { npc: { phraseId: 'r3-h4' }, narration: 'Te pregunta algo que no entiendes.', options: [{ phraseId: 'r1-p15' }, { phraseId: 'r1-p3' }, { phraseId: 'r1-p14' }], correct: ['r1-p15'] },
      { npc: { phraseId: 'r1-h2' }, narration: 'Sales de la tienda.', options: [{ phraseId: 'r1-p5' }, { phraseId: 'r1-p12' }, { phraseId: 'r1-p7' }], correct: ['r1-p5'] },
    ],
  },
  {
    id: 'scene-2',
    regionId: 'r2',
    title: 'Cena en el izakaya',
    setting: 'Un izakaya ruidoso de Osaka. Entráis los dos.',
    npcRole: 'waiter',
    turns: [
      { npc: { phraseId: 'r2-h1' }, options: [{ phraseId: 'r2-p1' }, { phraseId: 'r2-p3' }, { phraseId: 'r2-p17' }], correct: ['r2-p1'] },
      { npc: { phraseId: 'r2-h3' }, narration: 'Os lleva a la mesa. Un gesto basta.', options: [{ gesture: 'Seguirle con un gesto' }, { phraseId: 'r2-p21' }, { phraseId: 'r2-p19' }], correct: ['gesture'] },
      { npc: { phraseId: 'r2-h5' }, options: [{ phraseId: 'r2-p12' }, { phraseId: 'r2-p13' }, { phraseId: 'r2-p20' }], correct: ['r2-p12'] },
      { narration: 'Señalas una foto de la carta.', options: [{ phraseId: 'r2-p8' }, { phraseId: 'r2-p10' }, { phraseId: 'r2-p18' }], correct: ['r2-p8'] },
      { narration: 'Los palillos se te resisten.', options: [{ phraseId: 'r2-p14' }, { phraseId: 'r2-p11' }, { phraseId: 'r2-p6' }], correct: ['r2-p14'] },
      { npc: { phraseId: 'r2-h4' }, narration: 'Vuelve a preguntar si habéis decidido el resto.', options: [{ phraseId: 'r2-p22' }, { phraseId: 'r2-p21' }, { phraseId: 'r2-p1' }], correct: ['r2-p22'] },
      { narration: 'Llega la comida.', options: [{ phraseId: 'r2-p17' }, { phraseId: 'r2-p19' }, { phraseId: 'r2-p20' }], correct: ['r2-p17'] },
      { narration: 'Toca pagar.', options: [{ phraseId: 'r2-p20' }, { phraseId: 'r2-p6' }, { phraseId: 'r2-p9' }], correct: ['r2-p20'] },
      { narration: 'Al salir.', options: [{ phraseId: 'r2-p19' }, { phraseId: 'r2-p17' }, { phraseId: 'r2-p18' }], correct: ['r2-p19'] },
    ],
  },
  {
    id: 'scene-3',
    regionId: 'r3',
    title: 'En la caja del konbini',
    setting: 'Un konbini a medianoche. Llevas un bentō y una bebida.',
    npcRole: 'clerk',
    turns: [
      { npc: { phraseId: 'r1-h1' }, options: [{ gesture: 'Un gesto con la cabeza' }, { phraseId: 'r1-p12' }, { phraseId: 'r3-p12' }], correct: ['gesture'] },
      { npc: { phraseId: 'r3-h2' }, options: [{ phraseId: 'r3-p15' }, { phraseId: 'r3-p7' }, { phraseId: 'r3-p3' }], correct: ['r3-p15'] },
      { npc: { phraseId: 'r3-h3' }, options: [{ phraseId: 'r3-p15' }, { phraseId: 'r3-p16' }, { phraseId: 'r3-p12' }], correct: ['r3-p15'] },
      { npc: { phraseId: 'r3-h1' }, narration: 'No quieres bolsa.', options: [{ phraseId: 'r1-p9' }, { phraseId: 'r3-p8' }, { phraseId: 'r3-p15' }], correct: ['r1-p9', 'r3-p9'] },
      { npc: { phraseId: 'r3-h4' }, options: [{ phraseId: 'r1-p8b' }, { phraseId: 'r3-p15' }, { phraseId: 'r3-p16' }], correct: ['r1-p8b'] },
      { npc: { phraseId: 'r3-h6' }, narration: 'Te dice el total: tienes que reconocer la cifra.', fill: 'price' },
      { npc: { phraseId: 'r3-h5' }, narration: 'Pagas con tarjeta.', options: [{ phraseId: 'r3-p16' }, { phraseId: 'r3-p7' }, { phraseId: 'r3-p6' }], correct: ['r3-p16'] },
      { npc: { phraseId: 'r1-h2' }, options: [{ phraseId: 'r1-p5' }, { phraseId: 'r1-p1' }, { phraseId: 'r2-p19' }], correct: ['r1-p5'] },
    ],
  },
  {
    id: 'scene-4',
    regionId: 'r4',
    title: 'Llegada al hotel',
    setting: 'Recepción de un hotel de negocios en Tokio, con la maleta a cuestas.',
    npcRole: 'receptionist',
    turns: [
      { narration: 'Es de noche cuando llegas. Saludas.', options: [{ phraseId: 'r1-p3' }, { phraseId: 'r1-p1' }, { phraseId: 'r1-p12' }], correct: ['r1-p3'] },
      { narration: 'Quieres hacer el check-in.', options: [{ phraseId: 'r4-p1' }, { phraseId: 'r4-p3' }, { phraseId: 'r4-p6' }], correct: ['r4-p1'] },
      { narration: 'Dices que tienes reserva a tu nombre.', options: [{ phraseId: 'r4-p2' }, { phraseId: 'r2-p3' }, { phraseId: 'r4-p5' }], correct: ['r4-p2'], fill: 'userName' },
      { npc: { phraseId: 'r4-h1' }, options: [{ phraseId: 'r1-p11' }, { phraseId: 'r1-p15' }, { phraseId: 'r4-p13' }], correct: ['r1-p11'] },
      { npc: { phraseId: 'r4-h2' }, options: [{ phraseId: 'r1-p8a' }, { phraseId: 'r1-p8b' }, { phraseId: 'r4-p14' }], correct: ['r1-p8a'] },
      { narration: 'Preguntas por el desayuno.', options: [{ phraseId: 'r4-p4' }, { phraseId: 'r4-p3' }, { phraseId: 'r4-p12' }], correct: ['r4-p4'] },
      { narration: 'Y por el wifi.', options: [{ phraseId: 'r4-p5' }, { phraseId: 'r4-p7' }, { phraseId: 'r4-p9' }], correct: ['r4-p5'] },
      { npc: { phraseId: 'r4-h3' }, narration: 'Te da la llave y te dice la planta.', options: [{ phraseId: 'r1-p4' }, { phraseId: 'r1-p7' }, { phraseId: 'r4-p20' }], correct: ['r1-p4'], fill: '7' },
    ],
  },
  {
    id: 'scene-5',
    regionId: 'r4',
    title: 'Un día en Japón',
    setting: 'Desde el hotel hasta el templo y vuelta: todo lo aprendido, en un solo día.',
    npcRole: 'passerby',
    turns: [
      { narration: 'Sales del hotel y preguntas en recepción por la estación.', options: [{ phraseId: 'r4-p7' }, { phraseId: 'r4-p9' }, { phraseId: 'r4-p12' }], correct: ['r4-p7'], fill: 'えき' },
      {
        npc: { kana: 'まっすぐ いって、ひだりです', romaji: 'massugu itte, hidari desu', es: 'Todo recto y a la izquierda', generated: true },
        narration: 'Le das las gracias.',
        options: [{ phraseId: 'r1-p4' }, { phraseId: 'r1-p12' }, { phraseId: 'r2-p19' }],
        correct: ['r1-p4'],
      },
      { narration: 'En el andén, dudas si este tren va a Shibuya.', options: [{ phraseId: 'r4-p10' }, { phraseId: 'r4-p11' }, { phraseId: 'r4-p8' }], correct: ['r4-p10'], fill: 'しぶや' },
      {
        npc: { kana: 'はい、いきますよ。つぎの でんしゃも いきます', romaji: 'hai, ikimasu yo. tsugi no densha mo ikimasu', es: 'Sí, va. El siguiente también.', generated: true },
        narration: 'Te ha hablado demasiado rápido.',
        options: [{ phraseId: 'r4-p15' }, { phraseId: 'r4-p13' }, { phraseId: 'r4-p19' }],
        correct: ['r4-p15', 'r4-p14'],
      },
      { narration: 'En el templo, quieres hacer una foto.', options: [{ phraseId: 'r4-p16' }, { phraseId: 'r4-p17' }, { phraseId: 'r3-p13' }], correct: ['r4-p16'] },
      { npc: { phraseId: 'r1-p11' }, narration: 'Te dicen que adelante.', options: [{ phraseId: 'r1-p4' }, { phraseId: 'r1-p6' }, { phraseId: 'r1-p9' }], correct: ['r1-p4'] },
      { narration: 'De noche, un taxi de vuelta al hotel.', options: [{ phraseId: 'r4-p11' }, { phraseId: 'r4-p9' }, { phraseId: 'r4-p10' }], correct: ['r4-p11'], fill: 'ホテル' },
      { narration: 'Último día: pides que te guarden el equipaje.', options: [{ phraseId: 'r4-p6' }, { phraseId: 'r4-p1' }, { phraseId: 'r4-p3' }], correct: ['r4-p6'] },
      {
        npc: { kana: 'はい、かしこまりました', romaji: 'hai, kashikomarimashita', es: 'Sí, por supuesto', generated: true },
        narration: 'Te despides del hotel.',
        options: [{ phraseId: 'r1-p4' }, { phraseId: 'r1-p3' }, { phraseId: 'r2-p21' }],
        correct: ['r1-p4'],
      },
    ],
  },
];

export const SCENE_BY_ID: Record<string, Scene> = Object.fromEntries(SCENES.map((s) => [s.id, s]));
