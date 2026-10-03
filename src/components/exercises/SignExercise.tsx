import { useEffect, useState } from 'react';
import { KANJI_BY_ID, type KanjiSign } from '@/content';
import type { Exercise } from '@/domain/exercises';
import { JpText } from '@/components/ui/JpText';
import { SpeakerButton } from '@/components/ui/SpeakerButton';
import { KANJI_BY_RUN } from '@/content/dictionary';
import { OptionList, type Option } from './OptionList';
import type { ExerciseProps } from './types';

type E = Extract<Exercise, { type: 'E14' }>;

/** Hiragana reading of a sign (kanji runs + kana, e.g. 乗り場 → のりば). */
export function readingOf(text: string): string {
  return text.replace(/[\u4e00-\u9fff\u3005]+/g, (run) => KANJI_BY_RUN[run]?.reading ?? run);
}

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
    case 'board':
      return (
        <div className="w-64 rounded-md bg-[#111] p-2 font-mono text-[13px] text-[#F5A623] shadow-card" aria-label={`Panel de salidas: ${k.kanji}`}>
          <div className="flex justify-between border-b border-[#333] pb-1 text-[10px] text-[#9AA59C]">
            <span>種別</span><span>時刻</span><span>行先</span><span>番線</span>
          </div>
          <div className="mt-1 flex items-center justify-between">
            <JpText variant="ui" className="rounded bg-[#C2493B] px-1 text-lg font-bold text-white">{k.kanji}</JpText>
            <span>10:42</span>
            <JpText variant="ui">東京</JpText>
            <span>14</span>
          </div>
          <div className="mt-1 flex items-center justify-between opacity-60">
            <span>—</span><span>11:05</span><span>—</span><span>12</span>
          </div>
        </div>
      );
    case 'direction':
      return (
        <div className="flex h-24 w-60 items-center gap-3 rounded-md bg-[#1E3F6E] px-4 text-white shadow-card">
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14m-6-6 6 6-6 6" /></svg>
          <JpText variant="ui" className="text-4xl font-bold">{k.kanji}</JpText>
        </div>
      );
    case 'menu':
      return (
        <div className="flex h-44 w-28 flex-col items-center justify-center gap-2 rounded-md border-4 border-[#6B4F35] bg-[#F3E2BF] text-[#2B1D10] shadow-card">
          <JpText variant="ui" className="text-3xl font-bold [writing-mode:vertical-rl]">{k.kanji}</JpText>
          <span className="rounded bg-[#C2493B] px-1 text-[11px] font-bold text-white">780円</span>
        </div>
      );
    case 'onsen':
      return (
        <div className={`flex h-36 w-52 items-start justify-center rounded-t-md pt-6 text-white shadow-card ${k.kanji === '女湯' ? 'bg-[#B0413E]' : k.kanji === '男湯' ? 'bg-[#1E3F6E]' : 'bg-[#4F3F86]'}`} style={{ backgroundImage: 'repeating-linear-gradient(90deg, transparent 0 50px, rgba(0,0,0,0.25) 50px 53px)' }}>
          <JpText variant="ui" className="text-4xl font-bold">{k.kanji}</JpText>
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
        {revealed && (
          <p className="flex items-center gap-2 text-sm text-ink-2">
            <SpeakerButton text={readingOf(k.kanji)} size="sm" /> <JpText className="text-lg text-ink">{readingOf(k.kanji)}</JpText> {showRomaji || revealed ? `· ${k.romaji}` : ''}
          </p>
        )}
      </div>
      <p className="text-sm text-ink-2">¿Qué significa este cartel?</p>
      <OptionList options={options} selected={selected} revealed={revealed} onSelect={select} columns={2} />
    </div>
  );
}
