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

  // Level 1-45: +2 arrows/level | Level 46-100: +1 arrow/level | 100+: 140-200 + IQ tuning
  computeTargetArrows(level, skill, isBoss) {
    let base;
    if (level <= 45) base = 6 + level * 2;
    else if (level <= 100) base = 96 + (level - 45);
    else base = 150 + ((level * 7) % 35);

    const iqDelta = Math.round(((skill - 48) / 52) * Math.min(14, level * 0.6));
    let target = base + iqDelta + (isBoss ? 12 : 0);
    return Math.max(6, Math.min(200, target));
  },

  build(level, snapshot) {
    const rng = this.mulberry32(snapshot.seed);
    const skill = snapshot.skillSnap;
    const isBoss = level > 1 && level % 10 === 0;
    const skillFactor = (skill - 45) / 55;
    const targetArrows = this.computeTargetArrows(level, skill, isBoss);

    const neededCells = targetArrows * 4.3;
    let W = Math.max(8, Math.min(25, Math.round(Math.sqrt(neededCells / 0.58))));
    let H = Math.min(27, W + 2);

    let shapeObj = AE.Shapes.getForLevel(level, W, H, rng);
    let mask = shapeObj.mask;
    const countActive = m => m.reduce((s, row) => s + row.reduce((a, v) => a + v, 0), 0);

    if (countActive(mask) < targetArrows * 3.4 && W < 25) {
      W = Math.min(25, W + 4);
      H = Math.min(27, H + 4);
      shapeObj = AE.Shapes.getForLevel(level, W, H, rng);
      mask = shapeObj.mask;
    }

    const shapeName = shapeObj.name;
    const activeCells = [];
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (mask[y][x]) activeCells.push({ x, y });

    // Black Holes
    const blackHoles = [], bhSet = new Set();
    const effLvl = level + Math.max(0, Math.round(skillFactor * 4));
    if (effLvl >= 4 && (isBoss || level % 3 === 1 || targetArrows >= 45)) {
      const bhCount = targetArrows >= 60 ? 2 : 1;
      const inner = activeCells.filter(c => c.x >= 2 && c.x <= W - 3 && c.y >= 2 && c.y <= H - 3 &&
        Math.hypot(c.x - (W - 1) / 2, c.y - (H - 1) / 2) < W * 0.36);
      for (let i = 0; i < bhCount && inner.length > 0; i++) {
        const pick = inner.splice(Math.floor(rng() * inner.length), 1)[0];
        if (blackHoles.some(b => Math.hypot(b.x - pick.x, b.y - pick.y) < 3.5)) continue;
        blackHoles.push(pick); bhSet.add(pick.y * W + pick.x); mask[pick.y][pick.x] = 0;
      }
    }

    // Varied Arrow Lengths (Short 2-3, Medium 4-6, Long Snakes 7-13)
    const bendChance = Math.max(0.35, Math.min(0.88, 0.44 + Math.min(0.32, level * 0.008) + skillFactor * 0.12));
    const pickDesiredLen = () => {
      const r = rng();
      if (r < 0.44) return 2 + Math.floor(rng() * 2);
      if (r < 0.80) return 4 + Math.floor(rng() * 3);
      return 7 + Math.floor(rng() * Math.min(7, 3 + Math.floor(level / 8)));
    };

    const occ = Array.from({ length: H }, () => Array(W).fill(0));
    const rayHits = Array.from({ length: H }, () => Array(W).fill(0));
    const markExitRay = (arrow) => {
      const n = arrow.cells.length, h = arrow.cells[n - 1], k = arrow.cells[n - 2];
      const dx = h.x - k.x, dy = h.y - k.y;
      let cx = h.x + dx, cy = h.y + dy;
      while (cx >= 0 && cx < W && cy >= 0 && cy < H) {
        if (bhSet.has(cy * W + cx)) break;
        rayHits[cy][cx]++;
        cx += dx; cy += dy;
      }
    };

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
          const trapBonus = (skill >= 58 && rayHits[ny][nx] > 0) ? 0.45 : 0;
          opts.push({ x: nx, y: ny, d, w: (same ? 1 - bendChance : bendChance) + 0.08 + trapBonus });
        }
        if (!opts.length) break;
        let tot = opts.reduce((s, o) => s + o.w, 0), r = rng() * tot, pick = opts[0];
        for (const o of opts) { r -= o.w; if (r <= 0) { pick = o; break; } }
        path.push({ x: pick.x, y: pick.y }); vis.add(pick.y * W + pick.x); lastD = pick.d;
      }
      return path;
    };

    const cxMid = (W - 1) / 2, cyMid = (H - 1) / 2;
    const allOrdered = activeCells
      .filter(c => mask[c.y][c.x] === 1)
      .sort((a, b) => (Math.hypot(a.x - cxMid, a.y - cyMid) + (rng() - 0.5) * 3) -
                      (Math.hypot(b.x - cxMid, b.y - cyMid) + (rng() - 0.5) * 3));

    const maxFastPass = Math.max(W * H * 4, targetArrows * 14);
    let ptr = 0;

    for (let att = 0; att < maxFastPass && arrows.length < targetArrows; att++) {
      let start = null;
      if (att < allOrdered.length * 2) {
        for (let tries = 0; tries < 8; tries++) {
          const c = allOrdered[ptr % allOrdered.length]; ptr++;
          if (!occ[c.y][c.x]) { start = c; break; }
        }
      }
      if (!start) {
        const free = [];
        for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (mask[y][x] && !occ[y][x]) free.push({ x, y });
        if (free.length < 2) break;
        start = free[Math.floor(rng() * free.length)];
      }

      const raw = growSnake(start, pickDesiredLen());
      if (raw.length < 2) continue;

      const orients = [raw, [...raw].reverse()];
      if (rng() < 0.5) orients.reverse();

      let bestCand = null, bestScore = -999;
      for (const cells of orients) {
        if (!this.isSelfClean(cells, bhSet, W, H)) continue;
        const cand = { id: nextId, cells, type: 'normal' };
        const esc = this.canEscapeBasic(cand, occ, bhSet, W, H);
        if (esc.ok) {
          let blocks = 0;
          for (const c of cells) if (rayHits[c.y][c.x] > 0) blocks++;
          const score = (esc.viaBH ? 3 : 0) + (skill >= 55 ? blocks * 1.4 : -blocks * 0.2) + rng();
          if (score > bestScore) { bestScore = score; bestCand = cand; }
        }
      }

      if (bestCand) {
        for (const c of bestCand.cells) occ[c.y][c.x] = bestCand.id;
        markExitRay(bestCand);
        arrows.push(bestCand);
        nextId++;
      }
    }

    let solverChecks = 0;
    while (arrows.length < targetArrows && solverChecks < 38) {
      const free = [];
      for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (mask[y][x] && !occ[y][x]) free.push({ x, y });
      if (free.length < 2) break;
      const start = free[Math.floor(rng() * free.length)];
      const raw = growSnake(start, 2 + Math.floor(rng() * 3));
      if (raw.length < 2) { solverChecks++; continue; }

      let added = false;
      for (const cells of [raw, [...raw].reverse()]) {
        if (!this.isSelfClean(cells, bhSet, W, H)) continue;
        const cand = { id: nextId, cells, type: 'normal' };
        solverChecks++;
        if (this.canEscapeBasic(cand, occ, bhSet, W, H).ok || this.solve([...arrows, cand], bhSet, W, H)) {
          for (const c of cand.cells) occ[c.y][c.x] = cand.id;
          arrows.push(cand); nextId++; added = true; break;
        }
      }
      if (!added) solverChecks++;
    }

    const sol = this.solve(arrows, bhSet, W, H);
    AE.Powers.assignToBoard({
      arrows,
      order: sol ? sol.order : arrows.map(a => a.id),
      depthMap: sol ? sol.depthMap : new Map(),
      occ, bhSet, W, H, level, effLvl, skill, isBoss, rng
    });

    for (let idx = 0; idx < arrows.length; idx++) {
      const a = arrows[idx];
      a.state = 'idle'; a.slide = 0; a.speed = 0;
      a.bumpDir = 1; a.bumpMax = 0.35; a.flash = 0; a.hintGlow = 0;
      a.exitMode = 'edge'; a.bhDist = 0; a.isBulletFinal = false;
      a.introDelay = (idx / Math.max(1, arrows.length)) * 0.28;
      a.introDist = 5.5 + (idx % 5) * 1.1;
      a.pts = a.cells.map(c => ({ x: c.x + 0.5, y: c.y + 0.5 }));
      const n = a.cells.length;
      a.dir = { x: a.cells[n - 1].x - a.cells[n - 2].x, y: a.cells[n - 1].y - a.cells[n - 2].y };
    }

    return { level, W, H, shapeName, isBoss, mask, arrows, blackHoles, initialCount: arrows.length };
  }
};
