const STORAGE_KEY = 'dracuplot.muted';

interface ToneOptions {
  freq: number;
  type?: OscillatorType;
  /** Seconds from now. */
  delay?: number;
  attack?: number;
  decay?: number;
  gain?: number;
  detune?: number;
  /** Glide to this frequency over the life of the note. */
  sweepTo?: number;
  filter?: { type: BiquadFilterType; freq: number; sweepTo?: number; q?: number };
}

/**
 * Every sound in Dracuplot is synthesised at runtime with the Web Audio API.
 * No audio files ship with the game.
 */
class SoundEngine {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private noise: AudioBuffer | null = null;
  private muted: boolean;
  private heartbeatTimer: number | null = null;
  private heartbeatPeriod = 0;
  private heartbeatLevel = 0;

  constructor() {
    let stored = false;
    try {
      stored = localStorage.getItem(STORAGE_KEY) === 'true';
    } catch {
      /* Storage can be unavailable in private mode. */
    }
    this.muted = stored;
  }

  /** Must run inside a user gesture or the browser will keep the context suspended. */
  unlock(): void {
    if (!this.ctx) {
      const Ctor =
        window.AudioContext ??
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!Ctor) return;
      this.ctx = new Ctor();
      this.master = this.ctx.createGain();
      this.master.gain.value = this.muted ? 0 : 0.85;
      this.master.connect(this.ctx.destination);

      // One second of white noise, reused for footsteps and rumbles.
      const length = Math.floor(this.ctx.sampleRate);
      this.noise = this.ctx.createBuffer(1, length, this.ctx.sampleRate);
      const data = this.noise.getChannelData(0);
      for (let i = 0; i < length; i += 1) data[i] = Math.random() * 2 - 1;
    }
    if (this.ctx.state === 'suspended') void this.ctx.resume();
  }

  isMuted(): boolean {
    return this.muted;
  }

  setMuted(muted: boolean): void {
    this.muted = muted;
    try {
      localStorage.setItem(STORAGE_KEY, String(muted));
    } catch {
      /* Preference simply will not persist. */
    }
    if (this.master && this.ctx) {
      this.master.gain.cancelScheduledValues(this.ctx.currentTime);
      this.master.gain.setTargetAtTime(muted ? 0 : 0.85, this.ctx.currentTime, 0.04);
    }
  }

  toggleMuted(): boolean {
    this.setMuted(!this.muted);
    return this.muted;
  }

  private active(): AudioContext | null {
    if (!this.ctx || !this.master || this.muted) return null;
    return this.ctx;
  }

  private tone(options: ToneOptions): void {
    const ctx = this.active();
    if (!ctx || !this.master) return;

    const {
      freq,
      type = 'sine',
      delay = 0,
      attack = 0.01,
      decay = 0.4,
      gain = 0.2,
      detune = 0,
      sweepTo,
      filter,
    } = options;

    const t0 = ctx.currentTime + delay;
    const osc = ctx.createOscillator();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t0);
    osc.detune.value = detune;
    if (sweepTo !== undefined) {
      osc.frequency.exponentialRampToValueAtTime(Math.max(sweepTo, 1), t0 + attack + decay);
    }

    const envelope = ctx.createGain();
    envelope.gain.setValueAtTime(0.0001, t0);
    envelope.gain.exponentialRampToValueAtTime(Math.max(gain, 0.0002), t0 + attack);
    envelope.gain.exponentialRampToValueAtTime(0.0001, t0 + attack + decay);

    let tail: AudioNode = envelope;
    if (filter) {
      const biquad = ctx.createBiquadFilter();
      biquad.type = filter.type;
      biquad.frequency.setValueAtTime(filter.freq, t0);
      biquad.Q.value = filter.q ?? 1;
      if (filter.sweepTo !== undefined) {
        biquad.frequency.exponentialRampToValueAtTime(
          Math.max(filter.sweepTo, 20),
          t0 + attack + decay,
        );
      }
      envelope.connect(biquad);
      tail = biquad;
    }

    osc.connect(envelope);
    tail.connect(this.master);
    osc.start(t0);
    osc.stop(t0 + attack + decay + 0.05);
  }

  private noiseBurst(options: {
    delay?: number;
    duration?: number;
    gain?: number;
    filterFreq: number;
    filterSweepTo?: number;
    type?: BiquadFilterType;
    q?: number;
  }): void {
    const ctx = this.active();
    if (!ctx || !this.master || !this.noise) return;

    const {
      delay = 0,
      duration = 0.12,
      gain = 0.2,
      filterFreq,
      filterSweepTo,
      type = 'lowpass',
      q = 1,
    } = options;

    const t0 = ctx.currentTime + delay;
    const source = ctx.createBufferSource();
    source.buffer = this.noise;
    source.playbackRate.value = 0.8 + Math.random() * 0.4;

    const biquad = ctx.createBiquadFilter();
    biquad.type = type;
    biquad.frequency.setValueAtTime(filterFreq, t0);
    biquad.Q.value = q;
    if (filterSweepTo !== undefined) {
      biquad.frequency.exponentialRampToValueAtTime(Math.max(filterSweepTo, 20), t0 + duration);
    }

    const envelope = ctx.createGain();
    envelope.gain.setValueAtTime(0.0001, t0);
    envelope.gain.exponentialRampToValueAtTime(gain, t0 + duration * 0.18);
    envelope.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);

    source.connect(biquad);
    biquad.connect(envelope);
    envelope.connect(this.master);
    source.start(t0);
    source.stop(t0 + duration + 0.05);
  }

  /* ---------------------------------------------------------------- */

  /** Soft scuff of a boot on cold flagstone. */
  footstep(): void {
    const scuff = 300 + Math.random() * 180;
    this.noiseBurst({ duration: 0.11, gain: 0.07, filterFreq: scuff, filterSweepTo: scuff * 0.45 });
    this.tone({ freq: 74 + Math.random() * 16, type: 'sine', attack: 0.005, decay: 0.07, gain: 0.05 });
  }

  /** Mystical suspended chord when an Elder Rune is claimed. */
  rune(): void {
    const chord = [329.63, 493.88, 659.25, 987.77];
    chord.forEach((freq, index) => {
      this.tone({
        freq,
        type: 'sine',
        delay: index * 0.075,
        attack: 0.02,
        decay: 1.5 - index * 0.14,
        gain: 0.16 - index * 0.025,
      });
      this.tone({
        freq: freq * 2,
        type: 'triangle',
        delay: index * 0.075,
        attack: 0.015,
        decay: 0.7,
        gain: 0.035,
        detune: 6,
      });
    });
    this.noiseBurst({ duration: 0.9, gain: 0.03, filterFreq: 5200, filterSweepTo: 1200, type: 'bandpass', q: 2 });
  }

  /** Dissonant tritone stack plus a low rumble on a wrong answer. */
  wrong(): void {
    const dissonance = [110, 155.56, 164.81];
    dissonance.forEach((freq, index) => {
      this.tone({
        freq,
        type: 'sawtooth',
        attack: 0.012,
        decay: 0.85,
        gain: 0.09,
        detune: index * 9,
        filter: { type: 'lowpass', freq: 1400, sweepTo: 260, q: 3 },
      });
    });
    this.tone({ freq: 48, type: 'sine', attack: 0.02, decay: 1.3, gain: 0.26, sweepTo: 26 });
    this.noiseBurst({ duration: 1.1, gain: 0.12, filterFreq: 220, filterSweepTo: 60 });
  }

  /** Tactile brass keypad blip. */
  keypad(): void {
    this.tone({ freq: 880, type: 'square', attack: 0.002, decay: 0.045, gain: 0.055 });
    this.noiseBurst({ duration: 0.035, gain: 0.05, filterFreq: 2600, type: 'highpass' });
  }

  /** Dry clack for Clear / Unlock. */
  clack(): void {
    this.tone({ freq: 420, type: 'square', attack: 0.002, decay: 0.08, gain: 0.07, sweepTo: 180 });
    this.noiseBurst({ duration: 0.07, gain: 0.07, filterFreq: 1500 });
  }

  /** Whispering vapour when the cauldron hint is bought. */
  whisper(): void {
    this.noiseBurst({ duration: 1.1, gain: 0.08, filterFreq: 900, filterSweepTo: 2600, type: 'bandpass', q: 4 });
    this.tone({ freq: 196, type: 'sine', attack: 0.15, decay: 0.9, gain: 0.05, sweepTo: 262 });
  }

  victory(): void {
    this.stopHeartbeat();
    [261.63, 329.63, 392.0, 523.25, 659.25].forEach((freq, index) => {
      this.tone({ freq, type: 'triangle', delay: index * 0.11, attack: 0.02, decay: 1.4, gain: 0.15 });
      this.tone({ freq: freq / 2, type: 'sine', delay: index * 0.11, attack: 0.03, decay: 1.2, gain: 0.08 });
    });
  }

  defeat(): void {
    this.stopHeartbeat();
    [220, 207.65, 155.56, 110].forEach((freq, index) => {
      this.tone({
        freq,
        type: 'sawtooth',
        delay: index * 0.17,
        attack: 0.03,
        decay: 1.6,
        gain: 0.12,
        filter: { type: 'lowpass', freq: 900, sweepTo: 180, q: 2 },
      });
    });
    this.tone({ freq: 55, type: 'sine', attack: 0.05, decay: 2.6, gain: 0.3, sweepTo: 20 });
    this.noiseBurst({ duration: 2.4, gain: 0.14, filterFreq: 180, filterSweepTo: 45 });
  }

  /* ----------------------------- Heartbeat ----------------------------- */

  private thump(): void {
    const intensity = 0.55 + this.heartbeatLevel * 0.22;
    this.tone({ freq: 62, type: 'sine', attack: 0.012, decay: 0.2, gain: 0.3 * intensity, sweepTo: 34 });
    this.tone({
      freq: 54,
      type: 'sine',
      delay: 0.19,
      attack: 0.012,
      decay: 0.26,
      gain: 0.22 * intensity,
      sweepTo: 28,
    });
  }

  /**
   * Drives the heartbeat from the villain threat meter. It appears at 25%,
   * then noticeably accelerates past the 50% and 75% marks.
   */
  setThreat(threat: number): void {
    let period = 0;
    let level = 0;
    if (threat >= 75) {
      period = 620;
      level = 3;
    } else if (threat >= 50) {
      period = 950;
      level = 2;
    } else if (threat >= 25) {
      period = 1450;
      level = 1;
    }

    this.heartbeatLevel = level;

    if (period === 0) {
      this.stopHeartbeat();
      return;
    }
    if (period === this.heartbeatPeriod && this.heartbeatTimer !== null) return;

    this.heartbeatPeriod = period;
    if (this.heartbeatTimer !== null) window.clearInterval(this.heartbeatTimer);
    this.thump();
    this.heartbeatTimer = window.setInterval(() => this.thump(), period);
  }

  stopHeartbeat(): void {
    if (this.heartbeatTimer !== null) window.clearInterval(this.heartbeatTimer);
    this.heartbeatTimer = null;
    this.heartbeatPeriod = 0;
    this.heartbeatLevel = 0;
  }
}

export const soundEngine = new SoundEngine();
