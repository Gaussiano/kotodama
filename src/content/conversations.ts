import type { Scene } from './types';
import { SCENES } from './scenes';

// Conversation mode (user request, Oct 2026): full dialogues by topic in three levels —
// 1 choose · 2 speak (speech recognition) · 3 type. The five dossier scenes are conversations too;
// three more cover a café, asking for directions and the last morning (check-out + taxi).
// NPC lines not in the dossier are inline `generated: true` for review.

const EXTRA: Scene[] = [
  {
    id: 'conv-cafe',
    regionId: 'r2',
    title: 'En la cafetería',
    setting: 'Una cafetería de Kioto a media mañana. Pides en la barra.',
    npcRole: 'clerk',
    turns: [
      { npc: { phraseId: 'r1-h1' }, options: [{ gesture: 'Un gesto con la cabeza' }, { phraseId: 'r1-p12' }, { phraseId: 'r2-p21' }], correct: ['gesture'] },
      { narration: 'Saludas: es media mañana.', options: [{ phraseId: 'r1-p1' }, { phraseId: 'r1-p3' }, { phraseId: 'r1-p17' }], correct: ['r1-p1'] },
      { narration: 'Señalas la foto del café que quieres.', options: [{ phraseId: 'r2-p8' }, { phraseId: 'r2-p6' }, { phraseId: 'r2-p13' }], correct: ['r2-p8'] },
      { npc: { phraseId: 'r2-h6' }, options: [{ phraseId: 'r1-p8a' }, { phraseId: 'r2-p22' }, { phraseId: 'r1-p8b' }], correct: ['r1-p8a'] },
      { npc: { phraseId: 'r3-h6' }, narration: 'Te dice el precio.', fill: 'price' },
      { npc: { phraseId: 'r3-h5' }, narration: 'Pagas con tarjeta.', options: [{ phraseId: 'r3-p16' }, { phraseId: 'r3-p7' }, { phraseId: 'r3-p6' }], correct: ['r3-p16'] },
      { narration: 'Te dan el café.', options: [{ phraseId: 'r1-p4' }, { phraseId: 'r2-p17' }, { phraseId: 'r1-p6' }], correct: ['r1-p4', 'r1-p5'] },
      { npc: { phraseId: 'r1-h2' }, options: [{ phraseId: 'r1-p5' }, { phraseId: 'r1-p7' }, { phraseId: 'r1-p12' }], correct: ['r1-p5'] },
    ],
  },
  {
    id: 'conv-directions',
    regionId: 'r4',
    title: 'Preguntar por la estación',
    setting: 'Kanazawa, de noche. No encuentras la estación y paras a alguien.',
    npcRole: 'passerby',
    turns: [
      { narration: 'Llamas la atención de alguien con educación.', options: [{ phraseId: 'r1-p6' }, { phraseId: 'r1-p3' }, { phraseId: 'r4-p20' }], correct: ['r1-p6'] },
      { narration: 'Preguntas dónde está la estación.', options: [{ phraseId: 'r4-p7' }, { phraseId: 'r4-p9' }, { phraseId: 'r4-p12' }], correct: ['r4-p7'], fill: 'えき' },
      {
        npc: { kana: 'えきは まっすぐ いって、みぎです', romaji: 'eki wa massugu itte, migi desu', es: 'La estación: todo recto y a la derecha', generated: true },
        narration: 'Ha ido demasiado rápido.',
        options: [{ phraseId: 'r4-p14' }, { phraseId: 'r4-p13' }, { phraseId: 'r4-p18' }],
        correct: ['r4-p14', 'r4-p15'],
      },
      {
        npc: { kana: 'まっすぐ、みぎ、です', romaji: 'massugu, migi, desu', es: 'Recto… derecha… ya', generated: true },
        narration: 'Ahora sí. Das las gracias.',
        options: [{ phraseId: 'r1-p4' }, { phraseId: 'r1-p9' }, { phraseId: 'r1-p12' }],
        correct: ['r1-p4'],
      },
      { npc: { phraseId: 'r1-h4' }, options: [{ phraseId: 'r1-p4' }, { phraseId: 'r2-p19' }, { phraseId: 'r1-p7' }], correct: ['r1-p4', 'r1-p5'] },
    ],
  },
  {
    id: 'conv-checkout',
    regionId: 'r4',
    title: 'Último día: equipaje y taxi',
    setting: 'Tokio, la mañana del vuelo. Dejas la maleta en el hotel y vas a la estación en taxi.',
    npcRole: 'receptionist',
    turns: [
      { narration: 'Saludas en recepción por la mañana.', options: [{ phraseId: 'r1-p1' }, { phraseId: 'r1-p3' }, { phraseId: 'r1-p12' }], correct: ['r1-p1'] },
      { narration: 'Pides que te guarden el equipaje.', options: [{ phraseId: 'r4-p6' }, { phraseId: 'r4-p1' }, { phraseId: 'r4-p3' }], correct: ['r4-p6'] },
      { npc: { kana: 'はい、かしこまりました', romaji: 'hai, kashikomarimashita', es: 'Sí, por supuesto', generated: true }, options: [{ phraseId: 'r1-p4' }, { phraseId: 'r1-p15' }, { phraseId: 'r2-p21' }], correct: ['r1-p4'] },
      { narration: 'Subes a un taxi: hasta la estación.', options: [{ phraseId: 'r4-p11' }, { phraseId: 'r4-p10' }, { phraseId: 'r4-p8' }], correct: ['r4-p11'], fill: 'えき' },
      { npc: { kana: 'はい、えきですね', romaji: 'hai, eki desu ne', es: 'Sí, a la estación, ¿verdad?', generated: true }, options: [{ phraseId: 'r1-p8a' }, { phraseId: 'r1-p8b' }, { phraseId: 'r4-p14' }], correct: ['r1-p8a'] },
      { npc: { phraseId: 'r3-h6' }, narration: 'Al llegar te dice el importe.', fill: 'price' },
      { narration: 'Pagas.', options: [{ phraseId: 'r3-p16' }, { phraseId: 'r3-p7' }, { phraseId: 'r3-p12' }], correct: ['r3-p16', 'r3-p7'] },
      { npc: { phraseId: 'r1-h2' }, options: [{ phraseId: 'r1-p5' }, { phraseId: 'r1-p17' }, { phraseId: 'r1-p7' }], correct: ['r1-p5', 'r1-p4'] },
    ],
  },
];

export const CONVERSATIONS: Scene[] = [...SCENES, ...EXTRA];
export const CONVERSATION_BY_ID: Record<string, Scene> = Object.fromEntries(CONVERSATIONS.map((c) => [c.id, c]));

export type TalkLevel = 1 | 2 | 3;
export const LEVEL_LABEL: Record<TalkLevel, { title: string; hint: string }> = {
  1: { title: 'Elegir', hint: 'Escoge la réplica que encaja.' },
  2: { title: 'Hablar', hint: 'Di tu réplica en voz alta; el micro la comprueba.' },
  3: { title: 'Escribir', hint: 'Escribe tu réplica en romaji o kana.' },
};
export const LEVEL_PASS = 0.8;
