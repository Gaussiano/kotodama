// Synthesized sound effects (spec §12): no third-party audio files. Moderate volume.

let ctx: AudioContext | null = null;
let reverb: ConvolverNode | null = null;

function audio(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AC) return null;
  if (!ctx) {
    ctx = new AC();
    reverb = ctx.createConvolver();
    reverb.buffer = impulse(ctx, 0.6, 2.5);
    const wet = ctx.createGain();
    wet.gain.value = 0.25;
    reverb.connect(wet).connect(ctx.destination);
  }
  if (ctx.state === 'suspended') void ctx.resume();
  return ctx;
}

/** Short synthetic reverb tail. */
function impulse(c: AudioContext, seconds: number, decay: number): AudioBuffer {
  const rate = c.sampleRate;
  const len = Math.floor(rate * seconds);
  const buf = c.createBuffer(2, len, rate);
  for (let ch = 0; ch < 2; ch++) {
    const d = buf.getChannelData(ch);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, decay);
  }
  return buf;
}

interface ToneOpts {
  type?: OscillatorType;
  gain?: number;
  attack?: number;
  wet?: boolean;
}

function tone(freq: number, start: number, dur: number, { type = 'sine', gain = 0.1, attack = 0.012, wet = false }: ToneOpts = {}) {
  const c = audio();
  if (!c) return;
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = type;
  o.frequency.value = freq;
  o.connect(g);
  g.connect(c.destination);
  if (wet && reverb) g.connect(reverb);
  const t0 = c.currentTime + start;
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(gain, t0 + attack);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  o.start(t0);
  o.stop(t0 + dur + 0.05);
}

export const sfx = {
  /** Two ascending bell notes with a short reverb tail. */
  correct() {
    tone(880, 0, 0.18, { gain: 0.08, wet: true });
    tone(1318.5, 0.09, 0.32, { gain: 0.07, wet: true });
    tone(2637, 0.09, 0.12, { gain: 0.02, type: 'triangle', wet: true });
  },
  /** One soft low note, nothing strident. */
  wrong() {
    tone(196, 0, 0.28, { type: 'triangle', gain: 0.07, attack: 0.02 });
  },
  /** Four-note arpeggio. */
  lessonEnd() {
    [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => tone(f, i * 0.11, 0.45, { gain: 0.07, wet: true }));
  },
  /** Crystalline shimmer for the flower field. */
  flowers() {
    [1568, 1975.5, 2349, 2637, 3136].forEach((f, i) => tone(f, i * 0.07 + Math.random() * 0.02, 0.5, { gain: 0.035, type: 'sine', wet: true }));
    tone(784, 0, 0.9, { gain: 0.04, type: 'triangle', wet: true });
  },
  /** Tiny tick for UI taps (kana dojo, match). */
  tick() {
    tone(1046.5, 0, 0.05, { gain: 0.03 });
  },
};
