window.AE = window.AE || {};

AE.PuzzleBuilder = {
  DIRS: [{ x: 1, y: 0 }, { x: -1, y: 0 }, { x: 0, y: 1 }, { x: 0, y: -1 }],

  mulberry32(seed) {
    let a = seed >>> 0;
    return () => {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  },

  canEscapeBasic(arrow, occ, bhSet, W, H) {
    const n = arrow.cells.length;
    const head = arrow.cells[n - 1], neck = arrow.cells[n - 2];
    const dx = head.x - neck.x, dy = head.y - neck.y;
    let cx = head.x + dx, cy = head.y + dy;
    while (cx >= 0 && cx < W && cy >= 0 && cy < H) {
      if (bhSet.has(cy * W + cx)) return { ok: true, viaBH: true };
      if (occ[cy][cx] !== 0) return { ok: false };
      cx += dx; cy += dy;
    }
    return { ok: true, viaBH: false };
  },

  solve(arrows, bhSet, W, H) {
    const occ = Array.from({ length: H }, () => Array(W).fill(0));
    const rem = new Map();
    for (const a of arrows) { rem.set(a.id, a); for (const c of a.cells) occ[c.y][c.x] = a.id; }
    const order = [], depthMap = new Map();
    let wave = 0;
    while (rem.size > 0) {
      const free = [];
      for (const a of rem.values()) if (this.canEscapeBasic(a, occ, bhSet, W, H).ok) free.push(a);
      if (free.length === 0) return null;
      for (const a of free) {
        order.push(a.id); depthMap.set(a.id, wave);
        for (const c of a.cells) occ[c.y][c.x] = 0;
        rem.delete(a.id);
      }
      wave++;
    }
    return { order, depthMap };
  },

  isSelfClean(cells, bhSet, W, H) {
    const n = cells.length, head = cells[n - 1], neck = cells[n - 2];
    const dx = head.x - neck.x, dy = head.y - neck.y;
    const self = new Set(cells.map(c => c.y * W + c.x));
    let cx = head.x + dx, cy = head.y + dy;
    while (cx >= 0 && cx < W && cy >= 0 && cy < H) {
      const k = cy * W + cx;
      if (bhSet.has(k)) return true;
      if (self.has(k)) return false;
      cx += dx; cy += dy;
    }
    return true;
  },

  build(level, snapshot) {
    const rng = this.mulberry32(snapshot.seed);
    const skill = snapshot.skillSnap;
    const isBoss = level > 1 && level % 10 === 0;
    const skillFactor = (skill - 45) / 55;
    const prog = Math.min(1, Math.log2(level + 1) / 5.8);

    let W = Math.round(7 + prog * 10 + skillFactor * 2.4 + (isBoss ? 2 : 0));
    if (level === 1) W = 8;
    if (level === 2) W = 9;
    W = Math.max(7, Math.min(19, W));
    const H = Math.min(21, W + (W >= 11 ? 2 : 1));

    const maxLen = Math.max(3, Math.min(11, Math.round(4 + prog * 5 + skillFactor * 1.8)));
    const bendChance = Math.max(0.32, Math.min(0.86, 0.40 + prog * 0.34 + skillFactor * 0.12));

    const { name: shapeName, mask } = AE.Shapes.getForLevel(level, W, H, rng);

    const activeCells = [];
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (mask[y][x]) activeCells.push({ x, y });

    // Black Holes
    const blackHoles = [], bhSet = new Set();
    const effLvl = level + Math.max(0, Math.round(skillFactor * 4));
    if (effLvl >= 4 && (isBoss || level % 3 === 1)) {
      const bhCount = (isBoss && W >= 13) ? 2 : 1;
      const inner = activeCells.filter(c => c.x >= 2 && c.x <= W - 3 && c.y >= 2 && c.y <= H - 3 &&
        Math.hypot(c.x - (W - 1) / 2, c.y - (H - 1) / 2) < W * 0.34);
      for (let i = 0; i < bhCount && inner.length > 0; i++) {
        const pick = inner.splice(Math.floor(rng() * inner.length), 1)[0];
        if (blackHoles.some(b => Math.hypot(b.x - pick.x, b.y - pick.y) < 3)) continue;
        blackHoles.push(pick); bhSet.add(pick.y * W + pick.x); mask[pick.y][pick.x] = 0;
      }
    }

    // Fill shape densely with acyclic snake arrows
    const occ = Array.from({ length: H }, () => Array(W).fill(0));
    const arrows = [];
    let nextId = 1;

    const growSnake = (start, targetLen) => {
      const path = [start], vis = new Set([start.y * W + start.x]);
      let lastD = null;
      while (path.length < targetLen) {
        const cur = path[path.length - 1], opts = [];
        for (const d of this.DIRS) {
          const nx = cur.x + d.x, ny = cur.y + d.y;
          if (nx < 0 || nx >= W || ny < 0 || ny >= H || !mask[ny][nx] || occ[ny][nx] || vis.has(ny * W + nx)) continue;
          const same = lastD && lastD.x === d.x && lastD.y === d.y;
          opts.push({ x: nx, y: ny, d, w: (same ? 1 - bendChance : bendChance) + 0.08 });
        }
        if (!opts.length) break;
        let tot = opts.reduce((s, o) => s + o.w, 0), r = rng() * tot, pick = opts[0];
        for (const o of opts) { r -= o.w; if (r <= 0) { pick = o; break; } }
        path.push({ x: pick.x, y: pick.y }); vis.add(pick.y * W + pick.x); lastD = pick.d;
      }
      return path;
    };

    const maxAttempts = W * H * 6;
    for (let att = 0; att < maxAttempts; att++) {
      const free = [];
      for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (mask[y][x] && !occ[y][x]) free.push({ x, y });
      if (free.length < 2) break;
      const start = free[Math.floor(rng() * free.length)];
      const raw = growSnake(start, 2 + Math.floor(rng() * (maxLen - 1)));
      if (raw.length < 2) continue;
      const orients = rng() < 0.5 ? [raw, [...raw].reverse()] : [[...raw].reverse(), raw];
      let accepted = null;
      for (const cells of orients) {
        if (!this.isSelfClean(cells, bhSet, W, H)) continue;
        const cand = { id: nextId, cells, type: 'normal' };
        if (this.canEscapeBasic(cand, occ, bhSet, W, H).ok || this.solve([...arrows, cand], bhSet, W, H)) {
          accepted = cand; break;
        }
      }
      if (accepted) {
        for (const c of accepted.cells) occ[c.y][c.x] = accepted.id;
        arrows.push(accepted); nextId++;
      }
    }

    // Assign Super Powers via js/powers.js
    const sol = this.solve(arrows, bhSet, W, H);
    AE.Powers.assignToBoard({
      arrows,
      order: sol ? sol.order : arrows.map(a => a.id),
      depthMap: sol ? sol.depthMap : new Map(),
      occ, bhSet, W, H, level, effLvl, skill, isBoss, rng
    });

    for (const a of arrows) {
      a.state = 'idle'; a.slide = 0; a.speed = 0;
      a.bumpDir = 1; a.bumpMax = 0.35; a.flash = 0; a.hintGlow = 0;
      a.exitMode = 'edge'; a.bhDist = 0;
      a.pts = a.cells.map(c => ({ x: c.x + 0.5, y: c.y + 0.5 }));
      const n = a.cells.length;
      a.dir = { x: a.cells[n - 1].x - a.cells[n - 2].x, y: a.cells[n - 1].y - a.cells[n - 2].y };
    }

    return { level, W, H, shapeName, isBoss, mask, arrows, blackHoles, initialCount: arrows.length };
  }
};
