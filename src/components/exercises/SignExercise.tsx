import { useEffect, useState } from 'react';
import { KANJI_BY_ID, type KanjiSign } from '@/content';
import type { Exercise } from '@/domain/exercises';
import { JpText } from '@/components/ui/JpText';
import { SpeakerButton } from '@/components/ui/SpeakerButton';
import { OptionList, type Option } from './OptionList';
import type { ExerciseProps } from './types';

type E = Extract<Exercise, { type: 'E14' }>;

/** A sign drawn in CSS/SVG: door plate, toilet sign, station board, price tag, shop curtain, notice. */
export function Sign({ k }: { k: KanjiSign }) {
  const base = 'flex items-center justify-center font-bold';
  switch (k.sign) {
    case 'door':
      return (
        <div className="flex h-40 w-28 flex-col items-center justify-center rounded-t-[3rem] border-4 border-bark-600 bg-parchment-100">
          <div className={`${base} rounded-md border-2 border-bark-600 bg-surface px-3 py-1`}>
            <JpText variant="ui" className="text-2xl text-forest-900">{k.kanji}</JpText>
          </div>
          <span className="mt-6 h-3 w-3 rounded-full bg-rune-gold" />
        </div>
      );
    case 'toilet':
      return (
        <div className={`${base} h-32 w-32 rounded-md ${k.kanji === '女' ? 'bg-[#C2493B]' : 'bg-[#2B4F72]'} text-white`}>
          <JpText variant="ui" className="text-5xl">{k.kanji}</JpText>
        </div>
      );
    case 'station':
      return (
        <div className={`${base} h-24 w-56 rounded-md border-4 border-[#2B4F72] bg-white text-[#0E2419]`}>
          <JpText variant="ui" className="text-4xl">{k.kanji}</JpText>
        </div>
      );
    case 'price':
      return (
        <div className={`${base} h-28 w-40 rotate-[-4deg] rounded-md bg-[#F3CF6B] text-[#0E2419] shadow-card`}>
          <JpText variant="ui" className="text-4xl">{k.kanji === '円' ? '980円' : k.kanji}</JpText>
        </div>
      );
    case 'shop':
      return (
        <div className={`${base} h-28 w-52 rounded-b-xl bg-[#1D5C48] text-[#F3EAD3]`} style={{ backgroundImage: 'repeating-linear-gradient(90deg, transparent 0 60px, rgba(0,0,0,0.15) 60px 62px)' }}>
          <JpText variant="ui" className="text-4xl">{k.kanji}</JpText>
        </div>
      );
    default:
      return (
        <div className={`${base} h-28 w-44 rounded-md border-4 border-[#C2493B] bg-white text-[#C2493B]`}>
          <JpText variant="ui" className="text-4xl">{k.kanji}</JpText>
        </div>
      );
  }
}

/** E14 «Carteles»: a drawn sign with a survival kanji → pick its meaning. */
export function SignExercise({ exercise, revealed, onReady, showRomaji }: ExerciseProps<E>) {
  const k = KANJI_BY_ID[exercise.kanjiId]!;
  const [selected, setSelected] = useState<string | null>(null);
  useEffect(() => setSelected(null), [exercise.uid]);

  const options: Option[] = exercise.optionIds.map((id) => ({ id, correct: id === k.id, content: <span>{KANJI_BY_ID[id]!.es}</span> }));
  const select = (id: string) => {
    setSelected(id);
    onReady({ correct: id === k.id, expected: { jp: k.kanji, romaji: k.romaji, es: k.es } });
  };

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm font-semibold text-ink-2">Carteles</p>
      <div className="flex flex-col items-center gap-2 py-2">
        <Sign k={k} />
        {(revealed || showRomaji) && revealed && (
          <p className="flex items-center gap-2 text-sm text-ink-2">
            <SpeakerButton text={k.kanji} size="sm" /> {k.romaji}
          </p>
        )}
      </div>
      <p className="text-sm text-ink-2">¿Qué significa este cartel?</p>
      <OptionList options={options} selected={selected} revealed={revealed} onSelect={select} columns={2} />
    </div>
  );
}
