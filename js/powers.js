window.AE = window.AE || {};

AE.Powers = {
  // Coin Shop Boosters (नए बूस्टर्स यहाँ आसानी से जोड़ सकते हैं)
  SHOP_ITEMS: [
    { key: 'hints',   ico: '💡', name: 'Hint Pack (x3)',      desc: 'Highlights best move & power tips',  price: 60,  qty: 3 },
    { key: 'hammers', ico: '🔨', name: 'Hammer Smash (x2)',   desc: 'Shatter any blocking arrow',         price: 80,  qty: 2 },
    { key: 'freezes', ico: '⏳', name: '+3 Bomb Moves (x2)',  desc: 'Adds +3 moves to bombs & thaws ice', price: 65,  qty: 2 },
    { key: 'novas',   ico: '💥', name: 'Nova Blast (x2)',     desc: 'Clears 3 tough arrows instantly',    price: 110, qty: 2 }
  ],

  // Assign 1 to 3 clean Super Powers onto a guaranteed-solvable board
  assignToBoard({ arrows, order, depthMap, occ, bhSet, W, H, level, effLvl, skill, isBoss, rng }) {
    const idMap = new Map(arrows.map(a => [a.id, a]));
    const used = new Set();

    const blockersCount = (a) => {
      const n = a.cells.length, h = a.cells[n - 1], k = a.cells[n - 2];
      const dx = h.x - k.x, dy = h.y - k.y;
      const set = new Set();
      let cx = h.x + dx, cy = h.y + dy;
      while (cx >= 0 && cx < W && cy >= 0 && cy < H) {
        if (bhSet.has(cy * W + cx)) break;
        if (occ[cy][cx] && occ[cy][cx] !== a.id) set.add(occ[cy][cx]);
        cx += dx; cy += dy;
      }
      return set.size;
    };

    const budget = level === 1 ? 0 : (isBoss ? 3 : (level <= 4 ? 1 : (rng() < 0.55 ? 2 : 1)));
    let placed = 0;

    const pool = [];
    if (effLvl >= 3) pool.push('bomb');
    if (effLvl >= 4) pool.push('killer', 'bonus');
    if (effLvl >= 5) pool.push('nova', 'ghost');
    if (effLvl >= 6) pool.push('keylock', 'frozen');
    if (effLvl >= 8) pool.push('electric', 'fire');

    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }

    const margin = skill > 72 ? 2 : (skill > 50 ? 3 : 5);

    for (const kind of pool) {
      if (placed >= budget || order.length < 5) break;

      if (kind === 'bomb') {
        const cands = order.slice(1, Math.min(order.length, 12)).filter(id => !used.has(id));
        if (!cands.length) continue;
        const bId = cands[Math.floor(rng() * Math.min(5, cands.length))];
        const a = idMap.get(bId);
        const pos = order.indexOf(bId), d = depthMap.get(bId) || 1;
        a.type = 'bomb';
        a.bombMoves = Math.max(3, Math.max(d, Math.min(pos, d + 2)) + margin);
        used.add(bId); placed++;
      } else if (kind === 'killer') {
        const cands = arrows.filter(a => !used.has(a.id) && blockersCount(a) >= 1)
          .sort((x, y) => blockersCount(y) - blockersCount(x));
        if (!cands.length) continue;
        const a = cands[0]; a.type = 'killer'; used.add(a.id); placed++;
      } else if (kind === 'ghost') {
        const cands = arrows.filter(a => !used.has(a.id) && blockersCount(a) === 1);
        if (!cands.length) continue;
        const a = cands[Math.floor(rng() * cands.length)]; a.type = 'ghost'; used.add(a.id); placed++;
      } else if (kind === 'keylock' && order.length >= 7) {
        const kIdx = Math.floor(rng() * Math.max(1, Math.floor(order.length * 0.35)));
        const lIdx = Math.floor(order.length * 0.62) + Math.floor(rng() * Math.max(1, Math.floor(order.length * 0.32)));
        const kA = idMap.get(order[kIdx]), lA = idMap.get(order[Math.min(order.length - 1, lIdx)]);
        if (kA && lA && kA.id !== lA.id && !used.has(kA.id) && !used.has(lA.id)) {
          kA.type = 'key'; lA.type = 'lock'; lA.locked = true; lA.keyId = kA.id;
          used.add(kA.id); used.add(lA.id); placed++;
        }
      } else if (kind === 'frozen') {
        const cands = order.slice(Math.floor(order.length * 0.4)).filter(id => !used.has(id));
        if (!cands.length) continue;
        const a = idMap.get(cands[Math.floor(rng() * cands.length)]);
        a.type = 'frozen'; a.iceCount = Math.min(3, Math.max(2, Math.floor(order.length * 0.18)));
        used.add(a.id); placed++;
      } else {
        const cands = arrows.filter(a => !used.has(a.id));
        if (!cands.length) continue;
        const a = cands[Math.floor(rng() * cands.length)];
        a.type = kind; used.add(a.id); placed++;
      }
    }
  },

  // Execute Special Power Effect when an Arrow is Released
  onRelease(game, arrow, res, isCascade) {
    const mp = arrow.pts[Math.floor(arrow.pts.length / 2)];

    if (arrow.type === 'killer' && res.sliced.length > 0) {
      AE.AudioFX.laser(); game.shake(0.24, 7);
      game.spawnPopup(mp, `⚡ SLICED x${res.sliced.length}!`, '#c084fc');
      for (const t of res.sliced) game.shatterArrow(t, '#c084fc');
    } else if (res.mode === 'blackhole') {
      AE.AudioFX.blackHole();
      game.spawnPopup({ x: res.bh.x + 0.5, y: res.bh.y + 0.5 }, '🌀', '#c084fc');
      game.spawnParticles(res.bh.x + 0.5, res.bh.y + 0.5, '#a855f7', 16);
    } else {
      AE.AudioFX.slide(game.combo, game.theme.style);
    }

    if (arrow.type === 'bomb') {
      AE.AudioFX.coin(); game.profile.coins += 10;
      game.spawnPopup(mp, '💣 +10', '#22c55e');
      game.spawnParticles(mp.x, mp.y, '#22c55e', 14);
    } else if (arrow.type === 'bonus') {
      AE.AudioFX.coin();
      if (game.hearts < 3) {
        game.hearts++;
        const h = document.getElementById('h' + game.hearts);
        h.classList.remove('lost'); h.classList.add('pop');
        setTimeout(() => h.classList.remove('pop'), 450);
        game.spawnPopup(mp, '❤️ +1', '#f59e0b');
      } else {
        game.profile.coins += 25;
        game.spawnPopup(mp, '+25', '#fde047');
      }
      game.spawnParticles(mp.x, mp.y, '#fbbf24', 18);
    } else if (arrow.type === 'key') {
      AE.AudioFX.coin(); game.unlockByKey(arrow.id);
    } else if (arrow.type === 'nova') {
      AE.AudioFX.laser(); game.shake(0.22, 6);
      let extra = 0;
      for (const other of game.lvl.arrows) {
        if (other.state === 'idle' && other.dir.x === arrow.dir.x && other.dir.y === arrow.dir.y &&
            !(other.type === 'lock' && other.locked) && !(other.type === 'frozen' && other.iceCount > 0)) {
          const r2 = game.checkEscape(other);
          if (r2.canExit) { game.releaseArrow(other, r2, true); extra++; }
        }
      }
      game.spawnPopup(mp, extra > 0 ? `🌟 NOVA x${extra + 1}!` : '🌟 NOVA!', '#38bdf8');
    } else if (arrow.type === 'electric') {
      const cands = game.lvl.arrows.filter(a => a.state === 'idle' && a.id !== arrow.id);
      if (cands.length) {
        const z = cands[Math.floor(Math.random() * cands.length)];
        AE.AudioFX.laser();
        game.shatterArrow(z, '#38bdf8');
        game.spawnPopup(z.pts[0], '⚡ ZAPPED!', '#38bdf8');
      }
    } else if (arrow.type === 'fire') {
      const cands = game.lvl.arrows.filter(a => a.state === 'idle' && a.id !== arrow.id)
        .sort((a, b) => Math.hypot(a.pts[0].x - mp.x, a.pts[0].y - mp.y) - Math.hypot(b.pts[0].x - mp.x, b.pts[0].y - mp.y));
      if (cands.length) {
        game.shatterArrow(cands[0], '#f97316');
        game.spawnPopup(cands[0].pts[0], '🔥 MELTED!', '#fb923c');
      }
    } else if (game.combo >= 4 && !isCascade) {
      game.spawnPopup(mp, `🔥 x${game.combo}`, '#f97316');
    }
  },

  // Visual Styling per Super Power Arrow
  getStyle(a, th) {
    let col = th.main, hi = th.hi, glow = null, alpha = 1;
    if (a.type === 'bomb')           { col = '#dc2626'; hi = '#fb923c'; glow = 'rgba(239,68,68,0.5)'; }
    else if (a.type === 'killer')    { col = '#7c3aed'; hi = '#38bdf8'; glow = 'rgba(139,92,246,0.5)'; }
    else if (a.type === 'nova')      { col = '#0284c7'; hi = '#fde047'; glow = 'rgba(56,189,248,0.55)'; }
    else if (a.type === 'ghost')     { col = '#6366f1'; hi = '#e0e7ff'; glow = 'rgba(129,140,248,0.45)'; alpha = a.state === 'idle' ? 0.78 : 1; }
    else if (a.type === 'electric')  { col = '#0891b2'; hi = '#67e8f9'; glow = 'rgba(34,211,238,0.5)'; }
    else if (a.type === 'fire')      { col = '#ea580c'; hi = '#fef08a'; glow = 'rgba(249,115,22,0.55)'; }
    else if (a.type === 'bonus')     { col = '#d97706'; hi = '#fef08a'; glow = 'rgba(250,204,21,0.5)'; }
    else if (a.type === 'frozen' && a.iceCount > 0) { col = '#0284c7'; hi = '#e0f2fe'; glow = 'rgba(56,189,248,0.42)'; }
    else if (a.type === 'key')       { col = '#ca8a04'; hi = '#fef08a'; }
    else if (a.type === 'lock' && a.locked) { col = '#64748b'; hi = '#cbd5e1'; }
    if (a.flash > 0)                 { col = '#ef4444'; hi = '#fecaca'; }
    return { col, hi, glow, alpha };
  },

  // Floating Badge on Special Arrow Midpoint
  getBadge(a) {
    if (a.type === 'bomb') return { txt: String(a.bombMoves), bg: a.bombMoves <= 2 ? '#dc2626' : '#0f172a', fg: '#fef08a', ring: '#ef4444' };
    if (a.type === 'frozen' && a.iceCount > 0) return { txt: `❄${a.iceCount}`, bg: '#0369a1', fg: '#fff', ring: '#7dd3fc' };
    if (a.type === 'key') return { txt: '🔑', bg: '#854d0e', fg: '#fff', ring: '#fde047' };
    if (a.type === 'lock' && a.locked) return { txt: '🔒', bg: '#334155', fg: '#fff', ring: '#94a3b8' };
    if (a.type === 'killer') return { txt: '⚡', bg: '#5b21b6', fg: '#38bdf8', ring: '#c084fc' };
    if (a.type === 'nova') return { txt: '🌟', bg: '#0369a1', fg: '#fde047', ring: '#38bdf8' };
    if (a.type === 'ghost') return { txt: '👻', bg: '#3730a3', fg: '#fff', ring: '#a5b4fc' };
    if (a.type === 'electric') return { txt: '⚡', bg: '#155e75', fg: '#fef08a', ring: '#22d3ee' };
    if (a.type === 'fire') return { txt: '🔥', bg: '#9a3412', fg: '#fef08a', ring: '#fb923c' };
    if (a.type === 'bonus') return { txt: '★', bg: '#b45309', fg: '#fef08a', ring: '#fde047' };
    return null;
  },

  // Contextual Hint Message (Only shown when Hint button is tapped!)
  getHintText(pick, esc) {
    if (pick.type === 'bomb') return AE.tr('hintBomb');
    if (pick.type === 'killer') return AE.tr('hintKiller');
    if (pick.type === 'nova') return AE.tr('hintNova');
    if (pick.type === 'ghost') return AE.tr('hintGhost');
    if (pick.type === 'electric') return AE.tr('hintElectric');
    if (pick.type === 'fire') return AE.tr('hintFire');
    if (pick.type === 'key') return AE.tr('hintKey');
    if (pick.type === 'bonus') return AE.tr('hintBonus');
    if (esc.mode === 'blackhole') return AE.tr('hintBH');
    return AE.tr('hintNormal');
  }
};
