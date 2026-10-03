import { useEffect, useRef, useState } from 'react';
import { PHRASE_BY_ID, WORD_BY_ID } from '@/content';
import type { Exercise } from '@/domain/exercises';
import { JpText } from '@/components/ui/JpText';
import { SpeakerButton } from '@/components/ui/SpeakerButton';
import { useSpeak } from '@/audio/useSpeak';
import type { ExerciseProps } from './types';

type E = Extract<Exercise, { type: 'E10' }>;

/** E10 «Dilo en voz alta»: hear it, repeat it, optionally record yourself. Self-evaluated. */
export function SayItExercise({ exercise, onAutoComplete, showRomaji }: ExerciseProps<E>) {
  const item = exercise.phraseId
    ? (({ kana, romaji, es, speech }) => ({ kana, romaji, es, speech }))(PHRASE_BY_ID[exercise.phraseId]!)
    : (({ kana, romaji, es }) => ({ kana, romaji, es, speech: undefined }))(WORD_BY_ID[exercise.wordId!]!);
  const speak = useSpeak();
  const [recording, setRecording] = useState(false);
  const [clip, setClip] = useState<string | null>(null);
  const recorder = useRef<MediaRecorder | null>(null);
  const canRecord = typeof window !== 'undefined' && 'MediaRecorder' in window && Boolean(navigator.mediaDevices?.getUserMedia);

  useEffect(() => {
    const t = window.setTimeout(() => void speak(item.speech ?? item.kana), 300);
    return () => {
      window.clearTimeout(t);
      recorder.current?.stream.getTracks().forEach((tr) => tr.stop());
    };
  }, [exercise.uid]); // eslint-disable-line react-hooks/exhaustive-deps

  const toggleRecord = async () => {
    if (recording) {
      recorder.current?.stop();
      setRecording(false);
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const rec = new MediaRecorder(stream);
      const chunks: BlobPart[] = [];
      rec.ondataavailable = (e) => chunks.push(e.data);
      rec.onstop = () => {
        setClip(URL.createObjectURL(new Blob(chunks, { type: rec.mimeType })));
        stream.getTracks().forEach((t) => t.stop());
      };
      rec.start();
      recorder.current = rec;
      setRecording(true);
      window.setTimeout(() => rec.state === 'recording' && rec.stop(), 6000);
    } catch {
      setRecording(false);
    }
  };

  const done = (ok: boolean) => onAutoComplete({ correct: ok, expected: { jp: item.kana, romaji: item.romaji, es: item.es } });

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm font-semibold text-ink-2">Dilo en voz alta</p>
      <div className="rounded-stone border-2 border-primary/30 bg-surface p-5 text-center">
        <JpText as="p" className="text-kana leading-tight">
          {item.kana}
        </JpText>
        {showRomaji && <p className="mt-2 text-base text-ink-2">{item.romaji}</p>}
        <p className="mt-1 text-sm">{item.es}</p>
        <div className="mt-4 flex items-center justify-center gap-3">
          <SpeakerButton text={item.speech ?? item.kana} size="lg" label="Escuchar el modelo" />
        </div>
        <p className="mt-2 text-xs text-ink-2">Escucha y repítelo en voz alta. Mantén pulsado para oírlo despacio.</p>
      </div>
      {canRecord && (
        <div className="flex items-center gap-3">
          <button type="button" className={`btn-secondary !w-auto px-4 ${recording ? '!border-ember-500 !text-ember-500' : ''}`} onClick={() => void toggleRecord()}>
            {recording ? 'Parar' : 'Grabarme'}
          </button>
          {clip && <audio controls src={clip} className="h-10 flex-1" aria-label="Tu grabación" />}
        </div>
      )}
      <div className="grid grid-cols-2 gap-2">
        <button type="button" className="btn-secondary" onClick={() => void speak(item.speech ?? item.kana)}>
          Repetir
        </button>
        <button type="button" className="btn-primary" onClick={() => done(true)}>
          Me ha salido bien
        </button>
      </div>
    </div>
  );
}
