import { KANJI_BY_RUN, DICT_BY_ID } from '@/content/dictionary';
import { PHRASE_BY_ID } from '@/content';
import { useProgressStore } from '@/store/progressStore';
import { BottomSheet } from './BottomSheet';
import { JpText } from './JpText';
import { SpeakerButton } from './SpeakerButton';
import { Furigana } from './Furigana';

/** Bottom sheet for a kanji run: reading, meaning, example and «Guardar en el diccionario». */
export function KanjiSheet({ run, onClose }: { run: string | null; onClose: () => void }) {
  const entry = run ? KANJI_BY_RUN[run] : undefined;
  const dict = useProgressStore((s) => s.dictionary);
  const add = useProgressStore((s) => s.addToDictionary);
  const id = run ? `k:${run}` : '';
  const saved = Boolean(dict[id]);
  const example = DICT_BY_ID[id]?.examplePhraseId ? PHRASE_BY_ID[DICT_BY_ID[id]!.examplePhraseId!] : undefined;

  return (
    <BottomSheet open={run !== null} onClose={onClose}>
      {entry && (
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-4">
            <JpText variant="ui" className="text-[3.5rem] font-bold leading-none">
              {entry.run}
            </JpText>
            <div className="min-w-0 flex-1">
              <JpText as="p" className="text-2xl">
                {entry.reading}
              </JpText>
              <p className="text-base">{entry.es}</p>
            </div>
            <SpeakerButton text={entry.reading} size="sm" />
          </div>
          {example && (
            <div className="rounded-stone bg-ink/5 px-3 py-2">
              <Furigana text={example.kanji ?? example.kana} className="text-lg" />
              <p className="text-sm text-ink-2">{example.es}</p>
            </div>
          )}
          <button type="button" className={saved ? 'btn-secondary' : 'btn-primary'} disabled={saved} onClick={() => add([id])}>
            {saved ? 'Ya está en tu diccionario' : 'Guardar en el diccionario'}
          </button>
        </div>
      )}
    </BottomSheet>
  );
}
