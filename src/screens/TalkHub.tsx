import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CATEGORY_LABEL, PHRASES, REGION_BY_ID, type Category } from '@/content';
import { CONVERSATIONS, LEVEL_LABEL, LEVEL_PASS, type TalkLevel } from '@/content/conversations';
import { learnedPhraseIds } from '@/domain/lessonGenerator';
import { useProgressStore } from '@/store/progressStore';
import { isSttAvailable } from '@/audio/stt';
import { ensureVoicesLoaded } from '@/audio/tts';
import { MicIcon } from '@/components/speak/SpeakCheck';
import { Fuku } from '@/components/mascot/Fuku';

export const PRONOUNCE_TOPICS: (Category | 'hear' | 'kana')[] = ['basics', 'restaurant', 'shopping', 'hotel', 'transport', 'help', 'hear', 'kana'];

/** «Hablar» tab: pronunciation by topic and full conversations in three levels. */
export function TalkHubScreen() {
  const navigate = useNavigate();
  const completedNodes = useProgressStore((s) => s.completedNodes);
  const talk = useProgressStore((s) => s.talk);
  const pronounce = useProgressStore((s) => s.pronounce);
  const [stt, setStt] = useState(true);
  useEffect(() => {
    void ensureVoicesLoaded().then(() => setStt(isSttAvailable()));
  }, []);

  const learned = useMemo(() => learnedPhraseIds(completedNodes), [completedNodes]);
  // Learned phrases first; before any lesson of a topic, the whole topic is open for practice.
  const poolFor = (topic: string) => PHRASES.filter((p) => !p.hidden && (topic === 'hear' ? p.kind === 'hear' : p.kind === 'say' && p.category === topic));
  const countFor = (topic: string) => {
    const pool = poolFor(topic);
    const l = pool.filter((p) => learned.has(p.id)).length;
    return { n: l >= 5 ? l : pool.length, learnedAll: l >= 5 };
  };

  return (
    <main className="screen pb-8">
      <header className="flex items-center gap-3 py-3">
        <div>
          <h1 className="font-display text-2xl">Hablar</h1>
          <p className="text-sm text-ink-2">Pronunciación con el micro y conversaciones completas.</p>
        </div>
      </header>

      {!stt && (
        <p className="mb-4 rounded-stone bg-rune-gold/15 px-4 py-3 text-sm">
          Este navegador no reconoce voz. Puedes practicar igual: escuchas, repites y te evalúas tú. En Android, Chrome reconoce japonés con conexión.
        </p>
      )}

      <section>
        <h2 className="mb-2 text-sm font-bold text-ink-2">Pronunciación por tema</h2>
        <ul className="grid grid-cols-2 gap-2">
          {PRONOUNCE_TOPICS.map((t) => {
            const c = t === 'kana' ? { n: 10, learnedAll: true } : countFor(t);
            const n = c.n;
            const best = pronounce[t];
            return (
              <li key={t}>
                <button
                  type="button"
                  disabled={n === 0}
                  onClick={() => navigate(`/talk/pronounce/${t}`)}
                  className="flex min-h-20 w-full flex-col justify-between rounded-stone border-2 border-line bg-surface p-3 text-left disabled:opacity-50"
                >
                  <span className="flex items-center justify-between">
                    <span className="font-bold">{t === 'kana' ? 'Sonidos y kana' : CATEGORY_LABEL[t]}</span>
                    <span className="text-mana-500">
                      <MicIcon size={18} />
                    </span>
                  </span>
                  <span className="text-xs text-ink-2">{`${n} frases${c.learnedAll ? '' : ' (todo el tema)'} · ${best !== undefined ? `mejor ${Math.round(best * 100)} %` : 'sin intentar'}`}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="mt-6">
        <h2 className="mb-2 text-sm font-bold text-ink-2">Conversaciones</h2>
        <p className="mb-3 text-xs text-ink-2">Tres niveles: elegir, hablar y escribir. Cada nivel se abre al superar el anterior con un 80 %.</p>
        <ul className="flex flex-col gap-3">
          {CONVERSATIONS.map((c) => {
            const best = talk[c.id]?.best ?? {};
            const unlocked = (lvl: TalkLevel) => lvl === 1 || (best[String(lvl - 1)] ?? 0) >= LEVEL_PASS;
            return (
              <li key={c.id} className="rounded-stone border-2 border-line bg-surface p-3">
                <div className="flex items-baseline justify-between gap-2">
                  <h3 className="font-display text-lg">{c.title}</h3>
                  <span className="shrink-0 rounded-full px-2 py-0.5 text-xs font-bold text-white" style={{ background: `rgb(var(--c-region-${c.regionId}))` }}>
                    {REGION_BY_ID[c.regionId].name}
                  </span>
                </div>
                <p className="mt-1 text-sm text-ink-2">{c.setting}</p>
                <div className="mt-3 grid grid-cols-3 gap-2">
                  {([1, 2, 3] as TalkLevel[]).map((lvl) => {
                    const b = best[String(lvl)];
                    const ok = unlocked(lvl);
                    return (
                      <button
                        key={lvl}
                        type="button"
                        disabled={!ok}
                        onClick={() => navigate(`/talk/conversation/${c.id}/${lvl}`)}
                        className={`min-h-14 rounded-xl border-2 px-2 text-left text-sm ${ok ? (b !== undefined && b >= LEVEL_PASS ? 'border-moss-500 bg-moss-500/10' : 'border-primary/40 bg-primary/5') : 'border-line opacity-50'}`}
                        aria-label={`${c.title}, nivel ${lvl}: ${LEVEL_LABEL[lvl].title}${ok ? '' : ' (bloqueado)'}`}
                      >
                        <span className="block font-bold">
                          {lvl} · {LEVEL_LABEL[lvl].title}
                        </span>
                        <span className="block text-xs text-ink-2">{!ok ? 'Bloqueado' : b !== undefined ? `${Math.round(b * 100)} %` : 'Sin intentar'}</span>
                      </button>
                    );
                  })}
                </div>
              </li>
            );
          })}
        </ul>
      </section>

      <div className="mt-6 flex items-center gap-3 text-sm text-ink-2">
        <Fuku state="thinking" size={56} />
        <p>Habla en voz alta aunque te dé vergüenza: en Japón nadie te va a corregir, pero sí te van a entender.</p>
      </div>
    </main>
  );
}
