import { useEffect, useState } from 'react';
import { PHRASE_BY_ID } from '@/content';
import type { Exercise } from '@/domain/exercises';
import { JpText } from '@/components/ui/JpText';
import { SpeakerButton } from '@/components/ui/SpeakerButton';
import { useSpeak } from '@/audio/useSpeak';
import { Npc, type NpcRole } from './Npc';
import { OptionList, type Option } from './OptionList';
import type { ExerciseProps } from './types';

type E = Extract<Exercise, { type: 'E8' }>;

function roleFor(regionId: string): NpcRole {
  return regionId === 'r2' ? 'waiter' : regionId === 'r4' || regionId === 'r5' ? 'receptionist' : 'clerk';
}

/** E8 «¿Qué contestas?»: an NPC says a «Lo que te dirán» line; pick the right reply from 3. */
export function ReplyExercise({ exercise, revealed, onReady, showRomaji }: ExerciseProps<E>) {
  const hear = PHRASE_BY_ID[exercise.hearId]!;
  const [selected, setSelected] = useState<string | null>(null);
  const speak = useSpeak();

  useEffect(() => {
    setSelected(null);
    const t = window.setTimeout(() => void speak(hear.speech ?? hear.kana, { fill: hear.hasBlank ? 'さんびゃくえん' : undefined }), 300);
    return () => window.clearTimeout(t);
  }, [exercise.uid]); // eslint-disable-line react-hooks/exhaustive-deps

  const correctSet = new Set(exercise.correctIds);
  const options: Option[] = exercise.optionIds.map((id) => {
    const p = PHRASE_BY_ID[id]!;
    return {
      id,
      correct: correctSet.has(id),
      content: (
        <span className="block">
          <JpText className="text-lg leading-snug">{p.kana}</JpText>
          <span className="block text-sm text-ink-2">{showRomaji ? `${p.romaji} · ` : ''}{p.es}</span>
        </span>
      ),
    };
  });

  const select = (id: string) => {
    setSelected(id);
    const best = PHRASE_BY_ID[exercise.correctIds[0]!]!;
    onReady({ correct: correctSet.has(id), expected: { jp: best.kana, romaji: best.romaji, es: best.es, note: hear.note, speech: best.speech } });
  };

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm font-semibold text-ink-2">¿Qué contestas?</p>
      <div className="flex items-start gap-3">
        <Npc role={roleFor(hear.regionId)} />
        <div className="relative flex-1 rounded-stone rounded-tl-none border-2 border-line bg-surface p-3">
          <div className="flex items-center gap-2">
            <SpeakerButton text={hear.speech ?? hear.kana} size="sm" fill={hear.hasBlank ? 'さんびゃくえん' : undefined} />
            <JpText as="p" className="text-xl leading-snug">
              {hear.kana}
            </JpText>
          </div>
          {(revealed || showRomaji) && <p className="mt-1 text-sm text-ink-2">{revealed ? `${hear.romaji} · ${hear.es}` : hear.romaji}</p>}
        </div>
      </div>
      <OptionList options={options} selected={selected} revealed={revealed} onSelect={select} trailing={(o) => <SpeakerButton text={PHRASE_BY_ID[o.id]!.speech ?? PHRASE_BY_ID[o.id]!.kana} className="self-center" />} />
    </div>
  );
}
