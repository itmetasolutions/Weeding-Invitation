"use client";

/**
 * Procedural background music built with the Web Audio API.
 * No audio files to license or host; it is created only after the guest
 * taps "Open", which satisfies browser autoplay rules.
 */

type Voice = "royal" | "pearl";

function impulse(ctx: AudioContext, seconds: number, decay: number) {
  const rate = ctx.sampleRate;
  const len = Math.floor(rate * seconds);
  const buf = ctx.createBuffer(2, len, rate);
  for (let c = 0; c < 2; c++) {
    const d = buf.getChannelData(c);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, decay);
  }
  return buf;
}

const hz = (midi: number) => 440 * Math.pow(2, (midi - 69) / 12);

export class AmbientMusic {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private wet: ConvolverNode | null = null;
  private timer: number | null = null;
  private step = 0;
  private droneNodes: AudioNode[] = [];
  playing = false;

  constructor(private voice: Voice) {}

  async start() {
    if (this.playing) return;
    const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!Ctx) return;
    if (!this.ctx) {
      this.ctx = new Ctx();
      this.master = this.ctx.createGain();
      this.master.gain.value = 0;
      this.wet = this.ctx.createConvolver();
      this.wet.buffer = impulse(this.ctx, this.voice === "royal" ? 4.5 : 3.5, 2.6);
      const wetGain = this.ctx.createGain();
      wetGain.gain.value = this.voice === "royal" ? 0.55 : 0.6;
      this.wet.connect(wetGain).connect(this.master);
      this.master.connect(this.ctx.destination);
    }
    await this.ctx.resume();
    this.playing = true;
    const now = this.ctx.currentTime;
    this.master!.gain.cancelScheduledValues(now);
    this.master!.gain.setValueAtTime(this.master!.gain.value, now);
    this.master!.gain.linearRampToValueAtTime(this.voice === "royal" ? 0.32 : 0.36, now + 2.5);
    if (this.voice === "royal") this.startDrone();
    else this.startPad();
    const interval = this.voice === "royal" ? 620 : 420;
    this.timer = window.setInterval(() => this.tick(), interval);
  }

  stop() {
    if (!this.ctx || !this.master) return;
    this.playing = false;
    const now = this.ctx.currentTime;
    this.master.gain.cancelScheduledValues(now);
    this.master.gain.setValueAtTime(this.master.gain.value, now);
    this.master.gain.linearRampToValueAtTime(0, now + 0.8);
    if (this.timer) window.clearInterval(this.timer);
    this.timer = null;
    const nodes = this.droneNodes;
    this.droneNodes = [];
    window.setTimeout(() => nodes.forEach((n) => (n as OscillatorNode).stop?.()), 900);
  }

  dispose() {
    this.stop();
    window.setTimeout(() => this.ctx?.close(), 1000);
  }

  private send(node: AudioNode, dry = 0.5) {
    const g = this.ctx!.createGain();
    g.gain.value = dry;
    node.connect(g).connect(this.master!);
    node.connect(this.wet!);
  }

  /** Tanpura-like drone on Sa and Pa (C3 / G3) with slow filter breathing. */
  private startDrone() {
    const ctx = this.ctx!;
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 700;
    filter.Q.value = 3;
    const lfo = ctx.createOscillator();
    lfo.frequency.value = 0.08;
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 260;
    lfo.connect(lfoGain).connect(filter.frequency);
    lfo.start();
    const g = ctx.createGain();
    g.gain.value = 0.05;
    [48, 55, 60, 48.04].forEach((m) => {
      const o = ctx.createOscillator();
      o.type = "sawtooth";
      o.frequency.value = hz(m);
      o.connect(filter);
      o.start();
      this.droneNodes.push(o);
    });
    filter.connect(g);
    this.send(g, 0.6);
    this.droneNodes.push(lfo);
  }

  /** Soft sustained chord pad under the music box. */
  private startPad() {
    const ctx = this.ctx!;
    const g = ctx.createGain();
    g.gain.value = 0.018;
    const f = ctx.createBiquadFilter();
    f.type = "lowpass";
    f.frequency.value = 1200;
    [53, 60, 64, 69].forEach((m, i) => {
      const o = ctx.createOscillator();
      o.type = "triangle";
      o.frequency.value = hz(m);
      o.detune.value = i % 2 ? 6 : -6;
      o.connect(f);
      o.start();
      this.droneNodes.push(o);
    });
    f.connect(g);
    this.send(g, 0.4);
  }

  private tick() {
    if (!this.ctx || !this.playing) return;
    this.step++;
    if (this.voice === "royal") this.royalStep();
    else this.pearlStep();
  }

  /** Raag Yaman flavoured phrase: S R G M# P D N S' */
  private royalPhrase = [72, 74, 76, 78, 79, 78, 76, 74, 76, 79, 81, 79, 78, 76, 74, 72];
  private royalStep() {
    const ctx = this.ctx!;
    const t = ctx.currentTime + 0.02;
    // pluck on beats (tanpura cycle Pa Sa' Sa' Sa)
    const cycle = [55, 60, 60, 48];
    this.pluck(hz(cycle[this.step % 4] + 12), t, 0.09);
    if (this.step % 2 === 0) {
      const note = this.royalPhrase[(this.step / 2) % this.royalPhrase.length];
      if (Math.random() > 0.22) this.reed(hz(note), t, 1.2);
    }
  }

  private pluck(freq: number, t: number, vol: number) {
    const ctx = this.ctx!;
    const o = ctx.createOscillator();
    o.type = "triangle";
    o.frequency.value = freq;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(vol, t + 0.005);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 1.6);
    o.connect(g);
    this.send(g, 0.5);
    o.start(t);
    o.stop(t + 1.7);
  }

  private reed(freq: number, t: number, dur: number) {
    const ctx = this.ctx!;
    const o = ctx.createOscillator();
    o.type = "sawtooth";
    o.frequency.value = freq;
    const vib = ctx.createOscillator();
    vib.frequency.value = 5.2;
    const vg = ctx.createGain();
    vg.gain.value = freq * 0.006;
    vib.connect(vg).connect(o.frequency);
    const f = ctx.createBiquadFilter();
    f.type = "bandpass";
    f.frequency.value = freq * 2;
    f.Q.value = 1.4;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(0.06, t + 0.18);
    g.gain.linearRampToValueAtTime(0.045, t + dur * 0.7);
    g.gain.linearRampToValueAtTime(0, t + dur);
    o.connect(f).connect(g);
    this.send(g, 0.4);
    o.start(t);
    vib.start(t);
    o.stop(t + dur + 0.05);
    vib.stop(t + dur + 0.05);
  }

  /** Music-box arpeggio over Fmaj9 – Am7 – Dm9 – Bbmaj7(#11) */
  private pearlChords = [
    [65, 69, 72, 76, 79],
    [69, 72, 76, 79, 84],
    [62, 65, 69, 72, 76],
    [58, 62, 65, 69, 76],
  ];
  private pearlStep() {
    const ctx = this.ctx!;
    const t = ctx.currentTime + 0.02;
    const chord = this.pearlChords[Math.floor(this.step / 8) % this.pearlChords.length];
    const pattern = [0, 2, 4, 3, 1, 3, 2, 4];
    const n = chord[pattern[this.step % 8]] + 12;
    if (this.step % 8 === 7 && Math.random() > 0.5) return;
    this.bell(hz(n), t, this.step % 8 === 0 ? 0.07 : 0.045);
  }

  private bell(freq: number, t: number, vol: number) {
    const ctx = this.ctx!;
    [1, 2.0, 3.01, 4.2].forEach((p, i) => {
      const o = ctx.createOscillator();
      o.type = "sine";
      o.frequency.value = freq * p;
      const g = ctx.createGain();
      const v = vol / (i * 1.8 + 1);
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(v, t + 0.004);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 2.2 / (i + 1));
      o.connect(g);
      this.send(g, 0.55);
      o.start(t);
      o.stop(t + 2.4);
    });
  }
}
