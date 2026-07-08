import type { VoiceId } from '../types/game';
import { loadJSON, saveJSON } from './storage';

/**
 * AudioManager — every sound in the game is generated with the Web Audio API.
 * No audio files are loaded, ever. Audio starts only after the first user
 * gesture (browsers block autoplay), and nothing in the game REQUIRES sound:
 * all information is also shown as text.
 */

export interface AudioSettings {
  music: number;   // 0..1
  sfx: number;     // 0..1
  voice: number;   // 0..1
  muteAll: boolean;
  captions: boolean;
}

const DEFAULT_SETTINGS: AudioSettings = {
  music: 0.6,
  sfx: 0.8,
  voice: 0.8,
  muteAll: false,
  captions: true,
};

const STORAGE_KEY = 'akef3d-audio-v1';

export type ZoneId = 'trees' | 'water' | 'crowd' | 'hum' | 'fire';

interface VoiceStyle {
  wave: OscillatorType;
  base: number;
  span: number;
  blipDur: number;
  gap: number;
  contour: 'up' | 'down' | 'flat' | 'wobble' | 'pair';
  gain: number;
  lowpass?: number;
  captionVerb: string;
}

const VOICES: Record<VoiceId, VoiceStyle> = {
  flynn:  { wave: 'triangle', base: 700, span: 240, blipDur: 0.07, gap: 0.085, contour: 'down', gain: 0.45, captionVerb: 'chirps brightly' },
  penny:  { wave: 'sine', base: 330, span: 70, blipDur: 0.13, gap: 0.16, contour: 'flat', gain: 0.5, captionVerb: 'hums warmly' },
  olive:  { wave: 'sine', base: 385, span: 45, blipDur: 0.17, gap: 0.24, contour: 'pair', gain: 0.45, captionVerb: 'hoots gently' },
  leo:    { wave: 'sawtooth', base: 120, span: 45, blipDur: 0.14, gap: 0.17, contour: 'down', gain: 0.5, lowpass: 420, captionVerb: 'rumbles kindly' },
  dolly:  { wave: 'sine', base: 850, span: 450, blipDur: 0.06, gap: 0.09, contour: 'up', gain: 0.38, captionVerb: 'whistles bubbly notes' },
  bella:  { wave: 'square', base: 240, span: 60, blipDur: 0.05, gap: 0.11, contour: 'flat', gain: 0.3, lowpass: 900, captionVerb: 'tap-taps like little hammers' },
  tata:   { wave: 'sine', base: 210, span: 40, blipDur: 0.2, gap: 0.3, contour: 'down', gain: 0.5, captionVerb: 'murmurs slowly' },
  ruby:   { wave: 'triangle', base: 880, span: 260, blipDur: 0.05, gap: 0.07, contour: 'up', gain: 0.4, captionVerb: 'squeaks in quick hops' },
  ella:   { wave: 'sine', base: 170, span: 90, blipDur: 0.22, gap: 0.26, contour: 'up', gain: 0.5, captionVerb: 'trumpets softly' },
  rocky:  { wave: 'square', base: 470, span: 180, blipDur: 0.05, gap: 0.075, contour: 'wobble', gain: 0.28, lowpass: 1600, captionVerb: 'chitters cleverly' },
  parrot: { wave: 'square', base: 950, span: 380, blipDur: 0.06, gap: 0.08, contour: 'wobble', gain: 0.22, lowpass: 2600, captionVerb: 'squawks the news' },
  villager: { wave: 'triangle', base: 480, span: 130, blipDur: 0.09, gap: 0.12, contour: 'flat', gain: 0.4, captionVerb: 'chats happily' },
};

/* Cozy original loop: C major pentatonic melody over a I–vi–IV–V pad. */
const BPM = 74;
const BEAT = 60 / BPM;
const BAR = BEAT * 4;
const N = {
  C4: 261.63, D4: 293.66, E4: 329.63, G4: 392.0, A4: 440.0,
  C5: 523.25, D5: 587.33, E5: 659.25, G5: 783.99, A5: 880.0, C6: 1046.5,
};
const BASS_ROOTS = [130.81, 110.0, 87.31, 98.0]; // C3, A2, F2, G2
const CHORD_TONES: number[][] = [
  [N.C4, N.E4, N.G4],
  [N.A4 / 2 * 2, N.C5 / 2, N.E4], // A minor colors
  [N.C4 * 1.335, N.A4, N.C5],     // F major colors
  [N.G4, N.D4 * 2, N.D5],         // G colors
];
/** [barIndex, beatInBar, freq, beats] — a gentle original 8-bar melody. */
const MELODY: [number, number, number, number][] = [
  [0, 0, N.E5, 1], [0, 1, N.G5, 1], [0, 2, N.A5, 1.5], [0, 3.5, N.G5, 0.5],
  [1, 0, N.E5, 1], [1, 1, N.D5, 1], [1, 2, N.C5, 2],
  [2, 0, N.C5, 1], [2, 1, N.D5, 1], [2, 2, N.E5, 1], [2, 3, N.G5, 1],
  [3, 0, N.D5, 1.5], [3, 1.5, N.E5, 0.5], [3, 2, N.D5, 1.5],
  [4, 0, N.G5, 1], [4, 1, N.A5, 1], [4, 2, N.C6, 1.5], [4, 3.5, N.A5, 0.5],
  [5, 0, N.G5, 1], [5, 1, N.E5, 1], [5, 2, N.D5, 1], [5, 3, N.E5, 1],
  [6, 0, N.A5, 1], [6, 1, N.G5, 1], [6, 2, N.E5, 1], [6, 3, N.D5, 1],
  [7, 0, N.C5, 1.5], [7, 1.5, N.D5, 0.5], [7, 2, N.C5, 2],
];
const LOOP_BARS = 8;

type CaptionFn = (text: string) => void;

class AudioManager {
  settings: AudioSettings = loadJSON(STORAGE_KEY, DEFAULT_SETTINGS);

  private ctx: AudioContext | null = null;
  private master!: GainNode;
  private musicBus!: GainNode;
  private musicDuckNode!: GainNode;
  private sfxBus!: GainNode;
  private voiceBus!: GainNode;
  private ambBus!: GainNode;
  private noiseBuf: AudioBuffer | null = null;
  private barIndex = 0;
  private nextBarTime = 0;
  private musicTimer: number | null = null;
  private birdTimer: number | null = null;
  private popTimer: number | null = null;
  private zoneGains = new Map<ZoneId, GainNode>();
  private zoneTargets = new Map<ZoneId, number>();
  private captionFn: CaptionFn | null = null;
  started = false;

  /* ---------------- lifecycle ---------------- */

  unlock(): void {
    if (this.started) return;
    const Ctor: typeof AudioContext | undefined =
      window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return;
    this.started = true;
    this.ctx = new Ctor();
    void this.ctx.resume();

    this.master = this.ctx.createGain();
    this.master.connect(this.ctx.destination);

    this.musicDuckNode = this.ctx.createGain();
    this.musicBus = this.ctx.createGain();
    this.musicBus.connect(this.musicDuckNode);
    this.musicDuckNode.connect(this.master);

    this.sfxBus = this.ctx.createGain();
    this.sfxBus.connect(this.master);
    this.voiceBus = this.ctx.createGain();
    this.voiceBus.connect(this.master);
    this.ambBus = this.ctx.createGain();
    this.ambBus.connect(this.master);

    this.applySettings(true);

    // Fade music in from silence after the unlocking gesture.
    this.musicBus.gain.setValueAtTime(0, this.now());
    this.musicBus.gain.linearRampToValueAtTime(this.settings.music * 0.5, this.now() + 2.5);

    this.startMusic();
    this.startAmbience();
    this.startZones();
  }

  onCaption(fn: CaptionFn): void {
    this.captionFn = fn;
  }

  private caption(text: string): void {
    if (this.settings.captions && this.captionFn) this.captionFn(text);
  }

  setSetting<K extends keyof AudioSettings>(key: K, value: AudioSettings[K]): void {
    this.settings = { ...this.settings, [key]: value };
    saveJSON(STORAGE_KEY, this.settings);
    this.applySettings();
  }

  private applySettings(instant = false): void {
    if (!this.ctx) return;
    const t = this.now() + (instant ? 0.01 : 0.15);
    const mute = this.settings.muteAll ? 0 : 1;
    this.master.gain.linearRampToValueAtTime(mute, t);
    this.musicBus.gain.linearRampToValueAtTime(this.settings.music * 0.5, t);
    this.sfxBus.gain.linearRampToValueAtTime(this.settings.sfx, t);
    this.voiceBus.gain.linearRampToValueAtTime(this.settings.voice, t);
    this.ambBus.gain.linearRampToValueAtTime(this.settings.sfx * 0.9, t);
  }

  /** Smoothly lower music while results play (1 = normal, 0.3 = ducked). */
  duckMusic(level: number): void {
    if (!this.ctx) return;
    this.musicDuckNode.gain.cancelScheduledValues(this.now());
    this.musicDuckNode.gain.setTargetAtTime(level, this.now(), 0.6);
  }

  private now(): number {
    return this.ctx ? this.ctx.currentTime : 0;
  }

  /* ---------------- tiny synth helpers ---------------- */

  private tone(opts: {
    freq: number; freqEnd?: number; t?: number; dur: number; gain: number;
    wave?: OscillatorType; bus?: GainNode; attack?: number; lowpass?: number; vibrato?: number;
  }): void {
    if (!this.ctx) return;
    const { freq, freqEnd, dur, gain } = opts;
    const t0 = opts.t ?? this.now();
    const osc = this.ctx.createOscillator();
    osc.type = opts.wave ?? 'sine';
    osc.frequency.setValueAtTime(Math.max(20, freq), t0);
    if (freqEnd) osc.frequency.exponentialRampToValueAtTime(Math.max(20, freqEnd), t0 + dur);
    const g = this.ctx.createGain();
    const attack = opts.attack ?? 0.008;
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(gain, t0 + attack);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    let head: AudioNode = osc;
    if (opts.lowpass) {
      const f = this.ctx.createBiquadFilter();
      f.type = 'lowpass';
      f.frequency.value = opts.lowpass;
      head.connect(f);
      head = f;
    }
    if (opts.vibrato) {
      const lfo = this.ctx.createOscillator();
      lfo.frequency.value = opts.vibrato;
      const lg = this.ctx.createGain();
      lg.gain.value = freq * 0.02;
      lfo.connect(lg);
      lg.connect(osc.frequency);
      lfo.start(t0);
      lfo.stop(t0 + dur + 0.05);
    }
    head.connect(g);
    g.connect(opts.bus ?? this.sfxBus);
    osc.start(t0);
    osc.stop(t0 + dur + 0.05);
  }

  private getNoise(): AudioBuffer {
    if (!this.ctx) throw new Error('no ctx');
    if (!this.noiseBuf) {
      const len = this.ctx.sampleRate * 1.5;
      this.noiseBuf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
      const d = this.noiseBuf.getChannelData(0);
      for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    }
    return this.noiseBuf;
  }

  private noiseHit(opts: {
    t?: number; dur: number; gain: number; type?: BiquadFilterType; freq: number;
    freqEnd?: number; q?: number; bus?: GainNode;
  }): void {
    if (!this.ctx) return;
    const t0 = opts.t ?? this.now();
    const src = this.ctx.createBufferSource();
    src.buffer = this.getNoise();
    src.loop = true;
    const f = this.ctx.createBiquadFilter();
    f.type = opts.type ?? 'bandpass';
    f.frequency.setValueAtTime(opts.freq, t0);
    if (opts.freqEnd) f.frequency.exponentialRampToValueAtTime(opts.freqEnd, t0 + opts.dur);
    f.Q.value = opts.q ?? 1;
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(opts.gain, t0 + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + opts.dur);
    src.connect(f);
    f.connect(g);
    g.connect(opts.bus ?? this.sfxBus);
    src.start(t0);
    src.stop(t0 + opts.dur + 0.05);
  }

  /* ---------------- music ---------------- */

  private marimba(freq: number, t: number, gain: number, dur = 0.5): void {
    this.tone({ freq, t, dur, gain, wave: 'sine', bus: this.musicBus });
    this.tone({ freq: freq * 3.98, t, dur: dur * 0.35, gain: gain * 0.22, wave: 'sine', bus: this.musicBus });
  }

  private scheduleBar(bar: number, t: number): void {
    const idx = bar % 4;
    // soft bass root
    this.tone({ freq: BASS_ROOTS[idx], t, dur: BAR * 0.95, gain: 0.05, wave: 'triangle', bus: this.musicBus, attack: 0.4 });
    // airy pad tone
    const pad = CHORD_TONES[idx][bar % 3];
    this.tone({ freq: pad, t: t + BEAT * 0.5, dur: BAR * 0.8, gain: 0.02, wave: 'sine', bus: this.musicBus, attack: 0.8 });
    // melody
    const melBar = bar % LOOP_BARS;
    for (const [b, beat, freq, beats] of MELODY) {
      if (b !== melBar) continue;
      this.marimba(freq, t + beat * BEAT + (Math.random() - 0.5) * 0.012, 0.075, Math.min(0.9, beats * BEAT));
    }
    // occasional bell sparkle on bar starts
    if (bar % 2 === 0 && Math.random() < 0.65) {
      this.tone({ freq: bar % 4 === 0 ? N.C6 : N.G5 * 2, t: t + BEAT * (Math.random() < 0.5 ? 2 : 3), dur: 1.1, gain: 0.02, wave: 'sine', bus: this.musicBus, attack: 0.002 });
    }
  }

  private startMusic(): void {
    if (!this.ctx || this.musicTimer !== null) return;
    this.nextBarTime = this.now() + 0.2;
    this.barIndex = 0;
    const tick = () => {
      if (!this.ctx) return;
      while (this.nextBarTime < this.now() + 0.6) {
        this.scheduleBar(this.barIndex, this.nextBarTime);
        this.barIndex += 1;
        this.nextBarTime += BAR;
      }
    };
    tick();
    this.musicTimer = window.setInterval(tick, 250);
  }

  /* ---------------- ambience & zones ---------------- */

  private startAmbience(): void {
    if (!this.ctx) return;
    // gentle wind bed
    const src = this.ctx.createBufferSource();
    src.buffer = this.getNoise();
    src.loop = true;
    const f = this.ctx.createBiquadFilter();
    f.type = 'lowpass';
    f.frequency.value = 320;
    const g = this.ctx.createGain();
    g.gain.value = 0.02;
    const lfo = this.ctx.createOscillator();
    lfo.frequency.value = 0.07;
    const lg = this.ctx.createGain();
    lg.gain.value = 0.008;
    lfo.connect(lg);
    lg.connect(g.gain);
    src.connect(f);
    f.connect(g);
    g.connect(this.ambBus);
    src.start();
    lfo.start();

    // distant birds, randomly
    const bird = () => {
      if (!this.ctx) return;
      const base = 2100 + Math.random() * 900;
      const t = this.now() + 0.05;
      for (let i = 0; i < 2 + Math.floor(Math.random() * 2); i++) {
        this.tone({ freq: base, freqEnd: base * 1.25, t: t + i * 0.14, dur: 0.1, gain: 0.012, wave: 'sine', bus: this.ambBus });
      }
      this.birdTimer = window.setTimeout(bird, 5000 + Math.random() * 9000);
    };
    this.birdTimer = window.setTimeout(bird, 3000);
  }

  private makeZone(id: ZoneId, build: (out: GainNode) => void): void {
    if (!this.ctx) return;
    const g = this.ctx.createGain();
    g.gain.value = 0;
    g.connect(this.ambBus);
    this.zoneGains.set(id, g);
    this.zoneTargets.set(id, 0);
    build(g);
  }

  private startZones(): void {
    if (!this.ctx) return;
    const ctx = this.ctx;

    // trees: leaf rustle (high hiss) — birds already global, this adds closeness
    this.makeZone('trees', (out) => {
      const src = ctx.createBufferSource();
      src.buffer = this.getNoise();
      src.loop = true;
      const f = ctx.createBiquadFilter();
      f.type = 'highpass';
      f.frequency.value = 2600;
      const g = ctx.createGain();
      g.gain.value = 0.05;
      const lfo = ctx.createOscillator();
      lfo.frequency.value = 0.19;
      const lg = ctx.createGain();
      lg.gain.value = 0.025;
      lfo.connect(lg);
      lg.connect(g.gain);
      src.connect(f); f.connect(g); g.connect(out);
      src.start(); lfo.start();
    });

    // water: a smooth, quiet sea-like swell near Dolly's pool
    this.makeZone('water', (out) => {
      const src = ctx.createBufferSource();
      src.buffer = this.getNoise();
      src.loop = true;
      const f = ctx.createBiquadFilter();
      f.type = 'lowpass';
      f.frequency.value = 380;
      f.Q.value = 0.4;
      const g = ctx.createGain();
      g.gain.value = 0.045;
      const lfo = ctx.createOscillator();
      lfo.frequency.value = 0.12; // slow wave swell
      const lg = ctx.createGain();
      lg.gain.value = 0.03;
      lfo.connect(lg);
      lg.connect(g.gain);
      src.connect(f); f.connect(g); g.connect(out);
      src.start(); lfo.start();
    });

    // crowd murmur near the rally stage
    this.makeZone('crowd', (out) => {
      const src = ctx.createBufferSource();
      src.buffer = this.getNoise();
      src.loop = true;
      const f = ctx.createBiquadFilter();
      f.type = 'bandpass';
      f.frequency.value = 260;
      f.Q.value = 0.7;
      const g = ctx.createGain();
      g.gain.value = 0.11;
      src.connect(f); f.connect(g); g.connect(out);
      src.start();
    });

    // machine hum near the arcade
    this.makeZone('hum', (out) => {
      const o1 = ctx.createOscillator();
      o1.type = 'sine';
      o1.frequency.value = 56;
      const o2 = ctx.createOscillator();
      o2.type = 'triangle';
      o2.frequency.value = 112.3;
      const g1 = ctx.createGain();
      g1.gain.value = 0.09;
      const g2 = ctx.createGain();
      g2.gain.value = 0.025;
      o1.connect(g1); g1.connect(out);
      o2.connect(g2); g2.connect(out);
      o1.start(); o2.start();
    });

    // campfire crackle bed
    this.makeZone('fire', (out) => {
      const src = ctx.createBufferSource();
      src.buffer = this.getNoise();
      src.loop = true;
      const f = ctx.createBiquadFilter();
      f.type = 'lowpass';
      f.frequency.value = 480;
      const g = ctx.createGain();
      g.gain.value = 0.08;
      src.connect(f); f.connect(g); g.connect(out);
      src.start();
    });

    // random fire pops + bubbly bloops, gated by zone level
    const pops = () => {
      if (!this.ctx) return;
      const fire = this.zoneTargets.get('fire') ?? 0;
      if (fire > 0.03) {
        this.noiseHit({ dur: 0.045, gain: 0.16 * fire, type: 'highpass', freq: 1500, bus: this.zoneGains.get('fire') });
      }
      const water = this.zoneTargets.get('water') ?? 0;
      if (water > 0.03 && Math.random() < 0.12) {
        const f0 = 180 + Math.random() * 140;
        this.tone({ freq: f0, freqEnd: f0 * 1.4, dur: 0.3, gain: 0.04 * water, wave: 'sine', bus: this.zoneGains.get('water'), attack: 0.08 });
      }
      const crowd = this.zoneTargets.get('crowd') ?? 0;
      if (crowd > 0.03 && Math.random() < 0.5) {
        const f0 = 140 + Math.random() * 220;
        this.tone({ freq: f0, freqEnd: f0 * (0.9 + Math.random() * 0.25), dur: 0.14, gain: 0.06 * crowd, wave: 'triangle', bus: this.zoneGains.get('crowd') });
      }
      this.popTimer = window.setTimeout(pops, 90 + Math.random() * 240);
    };
    pops();
  }

  /** Called every frame-ish with 0..1 loudness per zone based on player distance. */
  setZoneLevels(levels: Partial<Record<ZoneId, number>>): void {
    if (!this.ctx) return;
    for (const [id, v] of Object.entries(levels) as [ZoneId, number][]) {
      const g = this.zoneGains.get(id);
      if (!g) continue;
      this.zoneTargets.set(id, v);
      g.gain.setTargetAtTime(Math.max(0, Math.min(1, v)), this.now(), 0.35);
    }
  }

  /* ---------------- character voices ---------------- */

  speak(voice: VoiceId, text: string, speakerName?: string): void {
    const style = VOICES[voice];
    if (speakerName) this.caption(`🔊 ${speakerName} ${style.captionVerb}.`);
    if (!this.ctx) return;
    const blips = Math.max(4, Math.min(12, Math.ceil(text.length / 9)));
    let t = this.now() + 0.03;
    for (let i = 0; i < blips; i++) {
      const prog = i / Math.max(1, blips - 1);
      let f = style.base + Math.random() * style.span;
      if (style.contour === 'up') f += prog * style.span * 0.9;
      if (style.contour === 'down') f -= prog * style.span * 0.6;
      if (style.contour === 'wobble') f += Math.sin(i * 2.1) * style.span * 0.5;
      if (style.contour === 'pair' && i % 2 === 1) f = style.base * 0.88; // hoo-HOO
      const endF = style.contour === 'pair' ? f * 0.94 : f * (0.92 + Math.random() * 0.2);
      this.tone({
        freq: f, freqEnd: endF, t, dur: style.blipDur, gain: style.gain,
        wave: style.wave, bus: this.voiceBus, lowpass: style.lowpass,
        vibrato: style.contour === 'pair' ? 5.5 : undefined,
      });
      t += style.gap * (0.85 + Math.random() * 0.35);
      if (Math.random() < 0.14) t += style.gap * 0.9; // little breath
    }
  }

  /* ---------------- one-shot SFX ---------------- */

  click(): void {
    this.tone({ freq: 620, freqEnd: 480, dur: 0.07, gain: 0.25, wave: 'triangle' });
  }

  hoverTick(): void {
    this.tone({ freq: 900, dur: 0.035, gain: 0.08, wave: 'sine' });
  }

  openPanel(): void {
    this.noiseHit({ dur: 0.22, gain: 0.1, type: 'bandpass', freq: 700, freqEnd: 1900, q: 0.8 });
    this.tone({ freq: 420, freqEnd: 640, dur: 0.16, gain: 0.12, wave: 'sine' });
    this.caption('🔊 A paper panel unfolds.');
  }

  closePanel(): void {
    this.noiseHit({ dur: 0.18, gain: 0.08, type: 'bandpass', freq: 1600, freqEnd: 600, q: 0.8 });
    this.tone({ freq: 560, freqEnd: 380, dur: 0.14, gain: 0.1, wave: 'sine' });
  }

  collectSticker(): void {
    const t = this.now();
    this.tone({ freq: 660, t, dur: 0.09, gain: 0.2, wave: 'triangle' });
    this.tone({ freq: 880, t: t + 0.09, dur: 0.1, gain: 0.2, wave: 'triangle' });
    this.tone({ freq: 1320, t: t + 0.18, dur: 0.22, gain: 0.16, wave: 'sine' });
    this.caption('🔊 A new passport sticker pops on!');
  }

  leafFlip(): void {
    this.noiseHit({ dur: 0.16, gain: 0.14, type: 'bandpass', freq: 1200, freqEnd: 2600, q: 1.2 });
    this.tone({ freq: 500, freqEnd: 720, dur: 0.12, gain: 0.08, wave: 'sine' });
    this.caption('🔊 A leaf flips with a soft swish.');
  }

  acornDrop(): void {
    const t = this.now();
    this.tone({ freq: 240, freqEnd: 130, t, dur: 0.09, gain: 0.3, wave: 'square', lowpass: 500 });
    this.tone({ freq: 190, freqEnd: 120, t: t + 0.11, dur: 0.06, gain: 0.16, wave: 'square', lowpass: 450 });
    this.caption('🔊 An acorn drops with a woody knock.');
  }

  stickerPop(): void {
    this.tone({ freq: 520, freqEnd: 1050, dur: 0.09, gain: 0.22, wave: 'sine' });
  }

  starSparkle(): void {
    const t = this.now();
    this.tone({ freq: 1568, t, dur: 0.12, gain: 0.12, wave: 'sine' });
    this.tone({ freq: 2093, t: t + 0.06, dur: 0.18, gain: 0.1, wave: 'sine' });
  }

  badgePlace(): void {
    this.tone({ freq: 330, freqEnd: 300, dur: 0.08, gain: 0.22, wave: 'triangle', lowpass: 900 });
  }

  machineStart(): void {
    this.tone({ freq: 90, freqEnd: 320, dur: 0.7, gain: 0.16, wave: 'sawtooth', lowpass: 700 });
    this.noiseHit({ dur: 0.5, gain: 0.05, type: 'lowpass', freq: 400 });
    this.caption('🔊 A counting machine whirs to life.');
  }

  machineFinish(): void {
    const t = this.now();
    this.tone({ freq: 784, t, dur: 0.12, gain: 0.18, wave: 'triangle' });
    this.tone({ freq: 1046, t: t + 0.13, dur: 0.25, gain: 0.18, wave: 'triangle' });
    this.caption('🔊 Ding! The counting machine finishes.');
  }

  owlStamp(): void {
    const t = this.now();
    this.noiseHit({ t, dur: 0.05, gain: 0.2, type: 'lowpass', freq: 300 });
    this.tone({ freq: 120, freqEnd: 70, t, dur: 0.09, gain: 0.3, wave: 'sine' });
    this.noiseHit({ t: t + 0.12, dur: 0.1, gain: 0.06, type: 'bandpass', freq: 2000, freqEnd: 3000 });
    this.caption('🔊 Thump! A fact-check stamp lands.');
  }

  parrotJingle(): void {
    const t = this.now();
    [N.C5, N.E5, N.G5, N.C6].forEach((f, i) => {
      this.tone({ freq: f, t: t + i * 0.11, dur: 0.14, gain: 0.16, wave: 'square', lowpass: 2500 });
    });
    this.tone({ freq: 1400, freqEnd: 1900, t: t + 0.5, dur: 0.12, gain: 0.1, wave: 'square', lowpass: 3000 });
    this.caption('🔊 The Parrot News jingle plays.');
  }

  curtain(): void {
    this.noiseHit({ dur: 0.4, gain: 0.12, type: 'bandpass', freq: 900, freqEnd: 500, q: 0.6 });
    this.caption('🔊 The ballot booth curtain swishes.');
  }

  hop(): void {
    this.tone({ freq: 300, freqEnd: 520, dur: 0.12, gain: 0.16, wave: 'triangle' });
  }

  splash(): void {
    const t = this.now();
    this.noiseHit({ t, dur: 0.3, gain: 0.28, type: 'lowpass', freq: 900, freqEnd: 300 });
    this.noiseHit({ t: t + 0.05, dur: 0.35, gain: 0.1, type: 'bandpass', freq: 1600, freqEnd: 500, q: 0.7 });
    this.tone({ freq: 700, freqEnd: 420, t: t + 0.16, dur: 0.12, gain: 0.1, wave: 'sine' });
    this.tone({ freq: 900, freqEnd: 560, t: t + 0.3, dur: 0.1, gain: 0.07, wave: 'sine' });
    this.caption('🔊 SPLASH! Right into the pool!');
  }

  sealBallot(): void {
    const t = this.now();
    this.noiseHit({ t, dur: 0.06, gain: 0.18, type: 'lowpass', freq: 350 });
    this.tone({ freq: 150, freqEnd: 90, t, dur: 0.1, gain: 0.25, wave: 'sine' });
    this.noiseHit({ t: t + 0.1, dur: 0.22, gain: 0.08, type: 'bandpass', freq: 900, freqEnd: 1600, q: 0.8 });
    this.tone({ freq: 880, t: t + 0.3, dur: 0.12, gain: 0.1, wave: 'triangle' });
    this.caption('🔊 A classroom ballot is sealed — thump, swish!');
  }

  passAcorn(): void {
    const t = this.now();
    this.tone({ freq: 260, freqEnd: 140, t, dur: 0.08, gain: 0.26, wave: 'square', lowpass: 520 });
    this.tone({ freq: 220, freqEnd: 130, t: t + 0.1, dur: 0.07, gain: 0.18, wave: 'square', lowpass: 500 });
    this.tone({ freq: 1568, t: t + 0.2, dur: 0.12, gain: 0.1, wave: 'sine' });
    this.tone({ freq: 2093, t: t + 0.27, dur: 0.16, gain: 0.09, wave: 'sine' });
    this.caption('🔊 The acorn hops to a new question!');
  }

  resultRibbon(): void {
    const t = this.now();
    [N.G4, N.C5, N.E5, N.G5, N.C6].forEach((f, i) => {
      this.tone({ freq: f, t: t + i * 0.09, dur: 0.3, gain: 0.14, wave: 'triangle' });
    });
    this.starSparkle();
    this.caption('🔊 A winner ribbon unfurls — ta-da!');
  }

  scrollOpen(): void {
    this.noiseHit({ dur: 0.35, gain: 0.09, type: 'bandpass', freq: 500, freqEnd: 1400, q: 0.7 });
    this.tone({ freq: 260, freqEnd: 300, dur: 0.3, gain: 0.06, wave: 'sine' });
    this.caption('🔊 The old charter scroll unrolls.');
  }
}

/** Singleton — import `audio` anywhere. */
export const audio = new AudioManager();
