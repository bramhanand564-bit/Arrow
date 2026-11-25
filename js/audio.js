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
    const boost = Math.min(combo * 32, 300);
    if (style === 'chrome' || style === 'frost') this.tone('sine', 480 + boost, 880 + boost, 0.11, 0.16);
    else if (style === 'fire' || style === 'neon') this.tone('triangle', 220 + boost * 0.6, 540 + boost, 0.13, 0.18);
    else this.tone('sine', 330 + boost, 650 + boost, 0.1, 0.17);
    this.vibrate(12);
  },

  bump() { this.tone('sawtooth', 135, 52, 0.18, 0.2); this.vibrate([25, 25, 35]); },
  blackHole() { this.tone('sine', 540, 68, 0.34, 0.24); this.vibrate(25); },
  laser() { this.tone('sawtooth', 980, 170, 0.24, 0.19); this.vibrate([18, 15, 25]); },
  hammer() { this.tone('square', 310, 68, 0.15, 0.22); this.vibrate(40); },
  coin() {
    this.tone('sine', 660, 660, 0.09, 0.15, 0);
    this.tone('sine', 990, 1180, 0.14, 0.16, 0.06);
  },
  win() {
    [523, 659, 784, 1046].forEach((f, i) => this.tone('triangle', f, f * 1.02, 0.26, 0.2, i * 0.08));
    this.vibrate([30, 40, 60]);
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
