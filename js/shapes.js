window.AE = window.AE || {};

AE.Shapes = {
  raster(W, H, drawFn) {
    const S = 160;
    const off = document.createElement('canvas');
    off.width = S; off.height = S;
    const g = off.getContext('2d');
    g.fillStyle = '#000'; g.strokeStyle = '#000';
    drawFn(g, S);

    const data = g.getImageData(0, 0, S, S).data;
    const mask = Array.from({ length: H }, () => Array(W).fill(0));
    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) {
        let hits = 0;
        for (let sy = 0.25; sy <= 0.75; sy += 0.25) {
          for (let sx = 0.25; sx <= 0.75; sx += 0.25) {
            const px = Math.min(S - 1, Math.floor(((x + sx) / W) * S));
            const py = Math.min(S - 1, Math.floor(((y + sy) / H) * S));
            if (data[(py * S + px) * 4 + 3] > 65) hits++;
          }
        }
        if (hits >= 3) mask[y][x] = 1;
      }
    }

    // Remove isolated 0-neighbor dots
    let active = 0;
    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) {
        if (!mask[y][x]) continue;
        const n = (y > 0 && mask[y - 1][x]) || (y < H - 1 && mask[y + 1][x]) ||
                  (x > 0 && mask[y][x - 1]) || (x < W - 1 && mask[y][x + 1]);
        if (!n) mask[y][x] = 0; else active++;
      }
    }
    if (active < Math.max(16, W * 3)) {
      for (let y = 1; y < H - 1; y++) for (let x = 1; x < W - 1; x++) mask[y][x] = 1;
    }
    return mask;
  },

  list: null,
  build() {
    const arr = [
      { name: '❤️ Heart', fn: (g, S) => {
          g.beginPath(); g.moveTo(S*0.5, S*0.94);
          g.bezierCurveTo(S*0.02, S*0.62, S*0.01, S*0.12, S*0.28, S*0.10);
          g.bezierCurveTo(S*0.42, S*0.09, S*0.49, S*0.23, S*0.5, S*0.29);
          g.bezierCurveTo(S*0.51, S*0.23, S*0.58, S*0.09, S*0.72, S*0.10);
          g.bezierCurveTo(S*0.99, S*0.12, S*0.98, S*0.62, S*0.5, S*0.94); g.fill();
      }},
      { name: '⭐ Star', fn: (g, S) => {
          g.beginPath();
          for (let i = 0; i < 10; i++) {
            const r = i % 2 === 0 ? S*0.48 : S*0.25, a = -Math.PI/2 + i*Math.PI/5;
            i === 0 ? g.moveTo(S/2 + Math.cos(a)*r, S*0.52 + Math.sin(a)*r)
                    : g.lineTo(S/2 + Math.cos(a)*r, S*0.52 + Math.sin(a)*r);
          }
          g.closePath(); g.fill();
      }},
      { name: '📱 Phone', fn: (g, S) => {
          g.beginPath(); g.roundRect(S*0.16, S*0.05, S*0.68, S*0.90, S*0.11); g.fill();
      }},
      { name: '💻 Laptop', fn: (g, S) => {
          g.beginPath(); g.roundRect(S*0.12, S*0.12, S*0.76, S*0.54, S*0.07); g.fill();
          g.beginPath(); g.moveTo(S*0.03, S*0.86); g.lineTo(S*0.12, S*0.64); g.lineTo(S*0.88, S*0.64); g.lineTo(S*0.97, S*0.86); g.closePath(); g.fill();
      }},
      { name: '🖥️ Monitor', fn: (g, S) => {
          g.beginPath(); g.roundRect(S*0.06, S*0.10, S*0.88, S*0.58, S*0.08); g.fill();
          g.fillRect(S*0.38, S*0.66, S*0.24, S*0.14);
          g.fillRect(S*0.20, S*0.78, S*0.60, S*0.13);
      }},
      { name: '🎮 Gamepad', fn: (g, S) => {
          g.beginPath(); g.roundRect(S*0.14, S*0.22, S*0.72, S*0.46, S*0.20); g.fill();
          g.beginPath(); g.ellipse(S*0.21, S*0.60, S*0.18, S*0.28, 0.22, 0, Math.PI*2); g.fill();
          g.beginPath(); g.ellipse(S*0.79, S*0.60, S*0.18, S*0.28, -0.22, 0, Math.PI*2); g.fill();
      }},
      { name: '🌲 Pine Tree', fn: (g, S) => {
          g.beginPath(); g.moveTo(S*0.5, S*0.04); g.lineTo(S*0.88, S*0.44); g.lineTo(S*0.68, S*0.44);
          g.lineTo(S*0.94, S*0.76); g.lineTo(S*0.06, S*0.76); g.lineTo(S*0.32, S*0.44);
          g.lineTo(S*0.12, S*0.44); g.closePath(); g.fill();
          g.fillRect(S*0.37, S*0.74, S*0.26, S*0.22);
      }},
      { name: '🌹 Rose', fn: (g, S) => {
          g.beginPath(); g.arc(S*0.5, S*0.34, S*0.30, 0, Math.PI*2); g.fill();
          g.beginPath(); g.arc(S*0.30, S*0.28, S*0.18, 0, Math.PI*2); g.fill();
          g.beginPath(); g.arc(S*0.70, S*0.28, S*0.18, 0, Math.PI*2); g.fill();
          g.fillRect(S*0.39, S*0.56, S*0.22, S*0.39);
          g.beginPath(); g.ellipse(S*0.24, S*0.74, S*0.20, S*0.12, 0.35, 0, Math.PI*2); g.fill();
          g.beginPath(); g.ellipse(S*0.76, S*0.74, S*0.20, S*0.12, -0.35, 0, Math.PI*2); g.fill();
      }},
      { name: '🏢 Tower', fn: (g, S) => {
          g.fillRect(S*0.42, S*0.04, S*0.16, S*0.18);
          g.fillRect(S*0.26, S*0.18, S*0.48, S*0.78);
          g.fillRect(S*0.06, S*0.40, S*0.26, S*0.56);
          g.fillRect(S*0.68, S*0.34, S*0.26, S*0.62);
      }},
      { name: '🎒 Backpack', fn: (g, S) => {
          g.lineWidth = S*0.16; g.beginPath(); g.arc(S*0.5, S*0.25, S*0.18, Math.PI, 0); g.stroke();
          g.beginPath(); g.roundRect(S*0.12, S*0.24, S*0.76, S*0.70, S*0.16); g.fill();
      }},
      { name: '👑 Crown', fn: (g, S) => {
          g.beginPath(); g.moveTo(S*0.06, S*0.86); g.lineTo(S*0.06, S*0.24);
          g.lineTo(S*0.30, S*0.48); g.lineTo(S*0.50, S*0.12); g.lineTo(S*0.70, S*0.48);
          g.lineTo(S*0.94, S*0.24); g.lineTo(S*0.94, S*0.86); g.closePath(); g.fill();
      }},
      { name: '🚀 Rocket', fn: (g, S) => {
          g.beginPath(); g.moveTo(S*0.5, S*0.04);
          g.quadraticCurveTo(S*0.79, S*0.28, S*0.74, S*0.72);
          g.lineTo(S*0.94, S*0.92); g.lineTo(S*0.68, S*0.86); g.lineTo(S*0.5, S*0.95);
          g.lineTo(S*0.32, S*0.86); g.lineTo(S*0.06, S*0.92); g.lineTo(S*0.26, S*0.72);
          g.quadraticCurveTo(S*0.21, S*0.28, S*0.5, S*0.04); g.fill();
      }},
      { name: '🦋 Butterfly', fn: (g, S) => {
          g.beginPath(); g.ellipse(S*0.27, S*0.35, S*0.25, S*0.24, -0.3, 0, Math.PI*2); g.fill();
          g.beginPath(); g.ellipse(S*0.73, S*0.35, S*0.25, S*0.24, 0.3, 0, Math.PI*2); g.fill();
          g.beginPath(); g.ellipse(S*0.30, S*0.68, S*0.22, S*0.20, 0.3, 0, Math.PI*2); g.fill();
          g.beginPath(); g.ellipse(S*0.70, S*0.68, S*0.22, S*0.20, -0.3, 0, Math.PI*2); g.fill();
          g.fillRect(S*0.40, S*0.14, S*0.20, S*0.72);
      }},
      { name: '🎧 Headphones', fn: (g, S) => {
          g.lineWidth = S*0.18; g.beginPath(); g.arc(S*0.5, S*0.50, S*0.34, Math.PI, 0); g.stroke();
          g.beginPath(); g.roundRect(S*0.06, S*0.44, S*0.28, S*0.44, S*0.10); g.fill();
          g.beginPath(); g.roundRect(S*0.66, S*0.44, S*0.28, S*0.44, S*0.10); g.fill();
      }},
      { name: '✈️ Jet', fn: (g, S) => {
          g.fillRect(S*0.38, S*0.06, S*0.24, S*0.88);
          g.beginPath(); g.moveTo(S*0.5, S*0.22); g.lineTo(S*0.95, S*0.54); g.lineTo(S*0.95, S*0.69);
          g.lineTo(S*0.5, S*0.56); g.lineTo(S*0.05, S*0.69); g.lineTo(S*0.05, S*0.54); g.closePath(); g.fill();
          g.fillRect(S*0.22, S*0.76, S*0.56, S*0.16);
      }},
      { name: '🏆 Trophy', fn: (g, S) => {
          g.beginPath(); g.roundRect(S*0.18, S*0.08, S*0.64, S*0.48, [0,0,S*0.26,S*0.26]); g.fill();
          g.lineWidth = S*0.13;
          g.beginPath(); g.arc(S*0.20, S*0.28, S*0.15, Math.PI*0.5, Math.PI*1.5); g.stroke();
          g.beginPath(); g.arc(S*0.80, S*0.28, S*0.15, -Math.PI*0.5, Math.PI*0.5); g.stroke();
          g.fillRect(S*0.39, S*0.52, S*0.22, S*0.26);
          g.fillRect(S*0.20, S*0.74, S*0.60, S*0.18);
      }},
      { name: '⏳ Hourglass', fn: (g, S) => {
          g.beginPath(); g.moveTo(S*0.08, S*0.06); g.lineTo(S*0.92, S*0.06);
          g.lineTo(S*0.62, S*0.50); g.lineTo(S*0.92, S*0.94);
          g.lineTo(S*0.08, S*0.94); g.lineTo(S*0.38, S*0.50); g.closePath(); g.fill();
      }},
      { name: '💎 Diamond', fn: (g, S) => {
          g.beginPath(); g.moveTo(S*0.24, S*0.12); g.lineTo(S*0.76, S*0.12);
          g.lineTo(S*0.95, S*0.40); g.lineTo(S*0.50, S*0.94); g.lineTo(S*0.05, S*0.40); g.closePath(); g.fill();
      }},
      { name: '🛡️ Shield', fn: (g, S) => {
          g.beginPath(); g.moveTo(S*0.10, S*0.10); g.lineTo(S*0.90, S*0.10); g.lineTo(S*0.90, S*0.50);
          g.quadraticCurveTo(S*0.88, S*0.80, S*0.5, S*0.95);
          g.quadraticCurveTo(S*0.12, S*0.80, S*0.10, S*0.50); g.closePath(); g.fill();
      }},
      { name: '🐱 Cat', fn: (g, S) => {
          g.beginPath(); g.arc(S*0.5, S*0.58, S*0.38, 0, Math.PI*2); g.fill();
          g.beginPath(); g.moveTo(S*0.14, S*0.50); g.lineTo(S*0.14, S*0.08); g.lineTo(S*0.45, S*0.30); g.fill();
          g.beginPath(); g.moveTo(S*0.86, S*0.50); g.lineTo(S*0.86, S*0.08); g.lineTo(S*0.55, S*0.30); g.fill();
      }},
      { name: '🏠 House', fn: (g, S) => {
          g.beginPath(); g.moveTo(S*0.5, S*0.05); g.lineTo(S*0.96, S*0.48); g.lineTo(S*0.84, S*0.48);
          g.lineTo(S*0.84, S*0.95); g.lineTo(S*0.16, S*0.95); g.lineTo(S*0.16, S*0.48);
          g.lineTo(S*0.04, S*0.48); g.closePath(); g.fill();
      }},
      { name: '🏰 Castle', fn: (g, S) => {
          g.fillRect(S*0.08, S*0.32, S*0.84, S*0.62);
          g.fillRect(S*0.08, S*0.12, S*0.22, S*0.26);
          g.fillRect(S*0.39, S*0.08, S*0.22, S*0.30);
          g.fillRect(S*0.70, S*0.12, S*0.22, S*0.26);
      }},
      { name: '💀 Skull', fn: (g, S) => {
          g.beginPath(); g.arc(S*0.5, S*0.44, S*0.40, 0, Math.PI*2); g.fill();
          g.beginPath(); g.roundRect(S*0.26, S*0.64, S*0.48, S*0.28, S*0.08); g.fill();
          g.globalCompositeOperation = 'destination-out';
          g.beginPath(); g.arc(S*0.34, S*0.44, S*0.09, 0, Math.PI*2); g.fill();
          g.beginPath(); g.arc(S*0.66, S*0.44, S*0.09, 0, Math.PI*2); g.fill();
          g.globalCompositeOperation = 'source-over';
      }},
      { name: '🚗 Car', fn: (g, S) => {
          g.beginPath(); g.roundRect(S*0.20, S*0.22, S*0.60, S*0.34, S*0.12); g.fill();
          g.beginPath(); g.roundRect(S*0.06, S*0.44, S*0.88, S*0.34, S*0.12); g.fill();
          g.beginPath(); g.arc(S*0.26, S*0.78, S*0.12, 0, Math.PI*2); g.fill();
          g.beginPath(); g.arc(S*0.74, S*0.78, S*0.12, 0, Math.PI*2); g.fill();
      }},
      { name: '🍩 Ring', fn: (g, S) => {
          g.beginPath(); g.arc(S*0.5, S*0.5, S*0.47, 0, Math.PI*2); g.fill();
          g.globalCompositeOperation = 'destination-out';
          g.beginPath(); g.arc(S*0.5, S*0.5, S*0.16, 0, Math.PI*2); g.fill();
          g.globalCompositeOperation = 'source-over';
      }},
      { name: '⬡ Hexagon', fn: (g, S) => {
          g.beginPath();
          for (let i = 0; i < 6; i++) {
            const a = Math.PI/6 + i * Math.PI/3;
            const x = S/2 + Math.cos(a)*S*0.46, y = S/2 + Math.sin(a)*S*0.46;
            i === 0 ? g.moveTo(x, y) : g.lineTo(x, y);
          }
          g.closePath(); g.fill();
      }},
      { name: '⚡ Bolt', fn: (g, S) => {
          g.beginPath(); g.moveTo(S*0.62, S*0.05); g.lineTo(S*0.12, S*0.55);
          g.lineTo(S*0.48, S*0.55); g.lineTo(S*0.36, S*0.95);
          g.lineTo(S*0.88, S*0.43); g.lineTo(S*0.52, S*0.43); g.closePath(); g.fill();
      }}
    ];

    // Bold Padded A-Z Letters (Thick strokes so 50+ arrows pack densely inside G, A, B, U!)
    for (let c = 65; c <= 90; c++) {
      const ch = String.fromCharCode(c);
      arr.push({
        name: `🔤 ${ch}`,
        fn: (g, S) => {
          g.font = `900 ${Math.round(S * 0.88)}px "Arial Black", Impact, sans-serif`;
          g.textAlign = 'center'; g.textBaseline = 'middle';
          g.lineWidth = S * 0.13; g.lineJoin = 'round';
          g.strokeText(ch, S * 0.5, S * 0.54);
          g.fillText(ch, S * 0.5, S * 0.54);
        }
      });
    }

    // Bold Padded 0-9 Digits
    for (let d = 0; d <= 9; d++) {
      const ch = String(d);
      arr.push({
        name: `🔢 ${ch}`,
        fn: (g, S) => {
          g.font = `900 ${Math.round(S * 0.88)}px "Arial Black", Impact, sans-serif`;
          g.textAlign = 'center'; g.textBaseline = 'middle';
          g.lineWidth = S * 0.13; g.lineJoin = 'round';
          g.strokeText(ch, S * 0.5, S * 0.54);
          g.fillText(ch, S * 0.5, S * 0.54);
        }
      });
    }
    return arr;
  },

  getForLevel(level, W, H, rng) {
    if (!this.list) this.list = this.build();
    const early = [0, 1, 27, 2, 6, 47, 7, 3, 28, 10];
    const entry = level <= early.length
      ? this.list[early[level - 1]]
      : this.list[Math.floor(rng() * this.list.length)];
    return { name: entry.name, mask: this.raster(W, H, entry.fn) };
  }
};
