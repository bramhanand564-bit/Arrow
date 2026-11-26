window.AE = window.AE || {};

AE.AudioFX = {
  ctx: null,
  volume: 0.8,
  vibration: true,

  vibrate(pattern) {
    if (this.vibration && navigator.vibrate) {
      try { navigator.vibrate(pattern); } catch {}
    }
  },

  ensure() {
    if (this.volume <= 0.01) return null;
    if (!this.ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (AC) this.ctx = new AC();
    }
    if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume();
    return this.ctx;
  },

  tone(type, f1, f2, dur, vol = 0.2, delay = 0) {
    const ctx = this.ensure(); if (!ctx) return;
    const t = ctx.currentTime + delay;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(f1, t);
    osc.frequency.exponentialRampToValueAtTime(Math.max(20, f2), t + dur);
    const v = Math.max(0.001, vol * this.volume);
    g.gain.setValueAtTime(v, t);
    g.gain.exponentialRampToValueAtTime(0.0008, t + dur + 0.02);
    osc.connect(g); g.connect(ctx.destination);
    osc.start(t); osc.stop(t + dur + 0.03);
  },

  slide(combo = 1, style = 'ink') {
    const boost = Math.min(combo * 30, 300);
    if (style === 'chrome' || style === 'frost') this.tone('sine', 480 + boost, 880 + boost, 0.11, 0.16);
    else if (style === 'fire' || style === 'neon') this.tone('triangle', 220 + boost * 0.6, 540 + boost, 0.13, 0.18);
    else this.tone('sine', 330 + boost, 650 + boost, 0.1, 0.17);
    this.vibrate(12);
  },

  assembleWhoosh() {
    this.tone('sine', 160, 620, 0.36, 0.14, 0);
    this.tone('triangle', 320, 880, 0.28, 0.10, 0.08);
  },

  // Crisp Heart Shatter / Impact Crack
  heartBreak() {
    this.tone('sawtooth', 180, 46, 0.22, 0.22, 0);
    this.tone('square', 920, 260, 0.09, 0.11, 0.02);
    this.tone('triangle', 680, 180, 0.12, 0.10, 0.07);
    this.vibrate([30, 25, 45]);
  },

  bump() { this.tone('sawtooth', 140, 52, 0.16, 0.18); this.vibrate(25); },
  blackHole() { this.tone('sine', 540, 68, 0.34, 0.24); this.vibrate(25); },
  laser() { this.tone('sawtooth', 980, 170, 0.24, 0.19); this.vibrate([18, 15, 25]); },
  hammer() { this.tone('square', 310, 68, 0.15, 0.22); this.vibrate(40); },

  // Filmy Bullet-Time Slow Motion Bass Drop!
  bulletSlowMo() {
    this.tone('sine', 150, 36, 0.95, 0.36, 0);
    this.tone('triangle', 420, 95, 0.80, 0.16, 0.04);
    this.tone('sine', 880, 220, 0.55, 0.09, 0.06);
    this.vibrate([20, 40, 25]);
  },

  starPop(idx = 0) {
    const notes = [659.25, 830.61, 1046.5];
    const f = notes[idx % notes.length];
    this.tone('triangle', f, f * 1.06, 0.24, 0.22, 0);
    this.tone('sine', f * 1.5, f * 1.52, 0.16, 0.10, 0.03);
    this.vibrate(15);
  },

  coinTick() { this.tone('sine', 1120, 1340, 0.05, 0.09, 0); },

  coin() {
    this.tone('sine', 660, 660, 0.09, 0.15, 0);
    this.tone('sine', 990, 1180, 0.14, 0.16, 0.06);
  },

  win() {
    [523, 659, 784, 1046, 1318].forEach((f, i) => this.tone('triangle', f, f * 1.02, 0.28, 0.2, i * 0.075));
    this.vibrate([30, 40, 70]);
  },

  explode() {
    const ctx = this.ensure(); if (!ctx) return;
    const now = ctx.currentTime;
    const sz = ctx.sampleRate * 0.5;
    const buf = ctx.createBuffer(1, sz, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < sz; i++) d[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.15));
    const src = ctx.createBufferSource(); src.buffer = buf;
    const flt = ctx.createBiquadFilter(); flt.type = 'lowpass';
    flt.frequency.setValueAtTime(520, now); flt.frequency.exponentialRampToValueAtTime(65, now + 0.45);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.4 * this.volume, now); g.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
    src.connect(flt); flt.connect(g); g.connect(ctx.destination);
    src.start(now);
    this.vibrate([80, 40, 120]);
  }
};
