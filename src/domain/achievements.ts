import { HIRAGANA, KATAKANA, NODES, PLAN } from '@/content';
import type { Progress } from '@/store/progressStore';
import { localDayKey } from './dates';

// Achievements (spec §5): original wax-seal badges. Evaluated after every lesson/review.

export interface AchievementDef {
  id: string;
  title: string;
  description: string;
  /** Seal colour token name. */
  tone: 'gold' | 'mana' | 'moss' | 'ember' | 'bark';
}

export const ACHIEVEMENTS: AchievementDef[] = [
  { id: 'first-spell', title: 'Primer hechizo', description: 'Tu primera lección completada.', tone: 'moss' },
  { id: 'camp', title: 'Campamento montado', description: 'Región 0 completada.', tone: 'bark' },
  { id: 'village', title: 'Vecino del pueblo', description: 'Guardián del pueblo superado.', tone: 'moss' },
  { id: 'tavern', title: 'Cliente de la taberna', description: 'Guardián de la taberna superado.', tone: 'ember' },
  { id: 'konbini', title: 'Maestro del konbini', description: 'Guardián del mercado superado.', tone: 'mana' },
  { id: 'traveler', title: 'Viajero', description: 'Guardián del gran viaje superado.', tone: 'mana' },
  { id: 'hiragana', title: 'Hiragana completo', description: 'Todos los hiragana presentados.', tone: 'gold' },
  { id: 'katakana', title: 'Katakana completo', description: 'Todos los katakana presentados.', tone: 'gold' },
  { id: 'streak-7', title: '7 días de hoguera', description: 'Una semana seguida.', tone: 'ember' },
  { id: 'streak-21', title: '21 días de hoguera', description: 'Tres semanas seguidas.', tone: 'ember' },
  { id: 'reviewed-100', title: '100 frases repasadas', description: 'Cien repasos acertados.', tone: 'mana' },
  { id: 'perfect', title: 'Lección perfecta', description: 'Una lección sin un solo fallo.', tone: 'gold' },
  { id: 'night-owl', title: 'Políglota nocturno', description: 'Una lección después de las 23:00.', tone: 'mana' },
  { id: 'early-bird', title: 'Madrugador', description: 'Una lección antes de las 8:00.', tone: 'gold' },
  { id: 'ready', title: 'Preparado para Japón', description: 'Todo completado antes del 2 de noviembre.', tone: 'gold' },
];

export const ACHIEVEMENT_BY_ID: Record<string, AchievementDef> = Object.fromEntries(ACHIEVEMENTS.map((a) => [a.id, a]));

export interface AchievementContext {
  now: Date;
  /** The session that just finished, if any. */
  lesson?: { kind: 'lesson' | 'boss' | 'finalBoss' | 'review' | 'quick'; perfect: boolean; passed: boolean };
}

const hiraganaIds = HIRAGANA.filter((k) => k.group !== 'extended').map((k) => k.id);
const katakanaIds = KATAKANA.filter((k) => k.group !== 'extended').map((k) => k.id);

/** Returns the ids newly earned given the (already updated) progress. */
export function evaluateAchievements(p: Progress, ctx: AchievementContext): string[] {
  const has = (id: string) => Boolean(p.achievements[id]);
  const out: string[] = [];
  const earn = (id: string, cond: boolean) => {
    if (cond && !has(id)) out.push(id);
  };
  const completed = new Set(p.completedNodes);
  const isLesson = ctx.lesson && (ctx.lesson.kind === 'lesson' || ctx.lesson.kind === 'boss' || ctx.lesson.kind === 'finalBoss');

  earn('first-spell', p.lessonsCompleted >= 1);
  earn('camp', NODES.filter((n) => n.regionId === 'r0').every((n) => completed.has(n.id)));
  earn('village', p.passedBosses.includes('r1'));
  earn('tavern', p.passedBosses.includes('r2'));
  earn('konbini', p.passedBosses.includes('r3'));
  earn('traveler', p.passedBosses.includes('r4'));
  earn('hiragana', hiraganaIds.every((id) => p.srs[id]));
  earn('katakana', katakanaIds.every((id) => p.srs[id]));
  earn('streak-7', p.streak.current >= 7 || p.streak.best >= 7);
  earn('streak-21', p.streak.current >= 21 || p.streak.best >= 21);
  earn('reviewed-100', p.reviewedCount >= 100);
  earn('perfect', Boolean(isLesson && ctx.lesson?.perfect && ctx.lesson.passed));
  const hour = ctx.now.getHours();
  earn('night-owl', Boolean(isLesson && hour >= 23));
  earn('early-bird', Boolean(isLesson && hour < 8));
  earn('ready', NODES.every((n) => completed.has(n.id)) && localDayKey(ctx.now) < PLAN.tripStart);
  return out;
}
