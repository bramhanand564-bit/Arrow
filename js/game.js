window.AE = window.AE || {};

(() => {
  'use strict';

  const HomeBG = {
    canvas: document.getElementById('homeBgCanvas'),
    ctx: null,
    items: [],
    init() {
      this.ctx = this.canvas.getContext('2d');
      this.resize();
      window.addEventListener('resize', () => this.resize());
      for (let i = 0; i < 18; i++) {
        this.items.push({
          x: Math.random() * window.innerWidth,
          y: Math.random() * window.innerHeight,
          len: 36 + Math.random() * 54,
          sp: 18 + Math.random() * 34,
          ang: Math.floor(Math.random() * 4) * (Math.PI / 2),
          col: i % 3 === 0 ? '#38bdf8' : (i % 3 === 1 ? '#fde047' : '#a855f7'),
          alpha: 0.14 + Math.random() * 0.24
        });
      }
    },
    resize() {
      this.canvas.width = window.innerWidth;
      this.canvas.height = window.innerHeight;
    },
    tick(dt) {
      if (!document.getElementById('screenHome').classList.contains('active')) return;
      const c = this.ctx, w = this.canvas.width, h = this.canvas.height;
      c.clearRect(0, 0, w, h);
      for (const it of this.items) {
        it.x += Math.cos(it.ang) * it.sp * dt;
        it.y += Math.sin(it.ang) * it.sp * dt;
        if (it.x < -80) it.x = w + 70; if (it.x > w + 80) it.x = -70;
        if (it.y < -80) it.y = h + 70; if (it.y > h + 80) it.y = -70;

        c.save(); c.translate(it.x, it.y); c.rotate(it.ang); c.globalAlpha = it.alpha;
        c.strokeStyle = it.col; c.fillStyle = it.col; c.lineWidth = 4; c.lineCap = 'round';
        c.beginPath(); c.moveTo(-it.len / 2, 0); c.lineTo(it.len / 2 - 8, 0); c.stroke();
        c.beginPath();
        c.moveTo(it.len / 2 + 4, 0); c.lineTo(it.len / 2 - 12, -9);
        c.lineTo(it.len / 2 - 8, 0); c.lineTo(it.len / 2 - 12, 9);
        c.closePath(); c.fill(); c.restore();
      }
    }
  };

  const canvas = document.getElementById('gameCanvas');
  const ctx = canvas.getContext('2d');

  AE.Game = {
    profile: null,
    currentScreen: 'screenHome',
    lvl: null,
    theme: AE.THEMES_50[0],

    hearts: 3, mistakes: 0, hintsUsed: 0, combo: 0,
    lastClearTime: 0, startTime: 0, elapsedSec: 0,
    ended: false, hammerMode: false,

    cam: { x: 4, y: 4, scale: 34, minScale: 13, maxScale: 120 },
    viewW: window.innerWidth, viewH: window.innerHeight,
    pointers: new Map(), dragStart: null, isDragging: false,
    lastPinchDist: 0, lastPinchMid: null,

    shakeTime: 0, shakeMag: 0, particles: [], popups: [], clock: 0, toastTimer: null,

    async init() {
      this.profile = await AE.Vault.load();
      AE.AudioFX.volume = this.profile.volume;
      AE.AudioFX.vibration = this.profile.vibration;
      HomeBG.init();
      this.bindUI();
      this.applyLanguage();
      this.refreshHomeUI();
      this.resizeCanvas();
      this.lastFrame = performance.now();
      requestAnimationFrame(t => this.loop(t));
    },

    goScreen(targetId) {
      if (this.currentScreen === targetId) return;
      const fromEl = document.getElementById(this.currentScreen);
      const toEl = document.getElementById(targetId);

      fromEl.classList.remove('active');
      fromEl.classList.add('exit-left');
      setTimeout(() => fromEl.classList.remove('exit-left'), 420);

      toEl.classList.remove('exit-left');
      toEl.classList.add('active');
      this.currentScreen = targetId;

      if (targetId === 'screenHome') this.refreshHomeUI();
      if (targetId === 'screenLevels') this.renderLevelBlocks();
      if (targetId === 'screenGame') {
        requestAnimationFrame(() => { this.resizeCanvas(); if (this.lvl) this.fitCamera(); });
      }
    },

    applyLanguage() {
      document.querySelectorAll('[data-i18n]').forEach(el => {
        el.textContent = AE.tr(el.getAttribute('data-i18n'));
      });
      document.getElementById('langEnBtn').classList.toggle('active', this.profile.lang === 'en');
      document.getElementById('langHiBtn').classList.toggle('active', this.profile.lang === 'hi');
      this.refreshHomeUI();
      if (this.lvl) this.updateGameHUD();
    },

    refreshHomeUI() {
      const p = this.profile;
      document.getElementById('homeCoinsVal').textContent = p.coins;
      document.getElementById('levelsCoinsVal').textContent = p.coins;
      document.getElementById('homeIqVal').textContent = `IQ ${p.iqScore}`;
      document.getElementById('homePlayBtn').textContent = AE.tr('playLevel', p.highestLevel);

      const today = new Date().toISOString().slice(0, 10);
      const dBtn = document.getElementById('dailyRewardBtn');
      const dTxt = document.getElementById('dailyRewardTxt');
      if (p.lastDailyDate === today) {
        dBtn.classList.add('claimed'); dTxt.textContent = AE.tr('dailyDone');
      } else {
        dBtn.classList.remove('claimed'); dTxt.textContent = AE.tr('dailyReady');
      }
    },

    renderLevelBlocks() {
      const p = this.profile;
      const grid = document.getElementById('levelsGrid');
      document.getElementById('levelsCoinsVal').textContent = p.coins;
      const totalVisible = Math.max(40, Math.ceil((p.highestLevel + 16) / 8) * 8);
      grid.innerHTML = '';

      for (let i = 1; i <= totalVisible; i++) {
        const btn = document.createElement('button');
        const hist = p.levelHistory[i];
        const isDone = hist && hist.stars > 0;
        const isCur = i === p.highestLevel;
        const isLocked = i > p.highestLevel;
        const isBoss = i % 10 === 0;

        btn.className = 'lvl-block' +
          (isDone ? ' done' : (isCur ? ' current' : (isLocked ? ' locked' : ' done'))) +
          (isBoss && !isLocked ? ' boss-node' : '');

        if (isLocked) {
          btn.innerHTML = `<span class="lvl-num">${i}</span><span class="lvl-stars">🔒</span>`;
        } else {
          const stars = hist && hist.stars ? '★'.repeat(hist.stars) + '☆'.repeat(3 - hist.stars) : (isCur ? '▶' : '☆☆☆');
          btn.innerHTML = `${isBoss ? '<span class="lvl-tag">👑</span>' : ''}<span class="lvl-num">${i}</span><span class="lvl-stars">${stars}</span>`;
          btn.onclick = () => { AE.AudioFX.ensure(); this.startLevel(i); };
        }
        grid.appendChild(btn);
      }

      const curNode = grid.querySelector('.current');
      if (curNode) setTimeout(() => curNode.scrollIntoView({ behavior: 'smooth', block: 'center' }), 120);
    },

    startLevel(levelNum) {
      const lvl = Math.max(1, Math.min(this.profile.highestLevel, Math.floor(levelNum)));
      this.profile.currentLevel = lvl;

      if (!this.profile.levelHistory[lvl]) {
        const seed = ((lvl * 2654435761) ^ Math.floor(Math.random() * 0x7fffffff)) >>> 0;
        this.profile.levelHistory[lvl] = { seed, skillSnap: this.profile.skillInternal, stars: 0, bestSec: 0 };
      }
      AE.Vault.save(this.profile);

      this.lvl = AE.PuzzleBuilder.build(lvl, this.profile.levelHistory[lvl]);
      this.theme = AE.getActiveTheme(this.profile, lvl);

      this.hearts = 3; this.mistakes = 0; this.hintsUsed = 0; this.combo = 0;
      this.lastClearTime = 0; this.startTime = performance.now(); this.elapsedSec = 0;
      this.ended = false; this.hammerMode = false;
      this.particles = []; this.popups = [];

      document.getElementById('resultModal').classList.remove('open');
      canvas.classList.remove('hammer-mode');
      document.getElementById('btnHammer').classList.remove('hammer-active');

      this.goScreen('screenGame');
      this.resizeCanvas();
      this.fitCamera();
      this.updateGameHUD();

      if (lvl === 1) this.showToast(AE.tr('firstTip'), 'info', 2500);
      else if (this.lvl.W >= 13) this.showToast(AE.tr('zoomTip'), 'info', 2000);
    },

    resizeCanvas() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2.5);
      this.viewW = window.innerWidth; this.viewH = window.innerHeight;
      canvas.width = Math.round(this.viewW * dpr);
      canvas.height = Math.round(this.viewH * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    },

    fitCamera() {
      if (!this.lvl) return;
      const { W, H } = this.lvl;
      const topPad = 108, botPad = 112, sidePad = 20;
      const availW = Math.max(120, this.viewW - sidePad * 2);
      const availH = Math.max(120, this.viewH - topPad - botPad);
      const scale = Math.min(availW / (W + 0.8), availH / (H + 0.8));
      this.cam.scale = Math.max(15, Math.min(62, scale));
      this.cam.minScale = Math.max(10, this.cam.scale * 0.55);
      this.cam.maxScale = Math.min(140, this.cam.scale * 3.8);
      this.cam.x = W / 2;
      this.cam.y = H / 2 - (botPad - topPad) / (2 * this.cam.scale) * 0.25;
    },

    screenToWorld(sx, sy) {
      return {
        x: (sx - this.viewW / 2) / this.cam.scale + this.cam.x,
        y: (sy - this.viewH / 2) / this.cam.scale + this.cam.y
      };
    },

    showToast(msg, type = '', dur = 2200) {
      const el = document.getElementById('toastBanner');
      el.textContent = msg;
      el.className = 'show' + (type ? ' ' + type : '');
      clearTimeout(this.toastTimer);
      this.toastTimer = setTimeout(() => { el.className = ''; }, dur);
    },

    updateGameHUD() {
      if (!this.lvl) return;
      const p = this.profile;
      const remain = this.lvl.arrows.filter(a => a.state === 'idle' || a.state === 'bumping').length;
      document.getElementById('remainCount').textContent = remain;
      const lp = document.getElementById('gameLevelPill');
      lp.textContent = (this.lvl.isBoss ? '👑 ' : '') + 'LVL ' + this.lvl.level;
      lp.className = 'hud-pill' + (this.lvl.isBoss ? ' boss' : '');
      document.getElementById('gameIqVal').textContent = p.iqScore;
      document.getElementById('shapeChip').textContent = `${this.lvl.shapeName}`;
      document.getElementById('gameCoinsVal').textContent = p.coins;

      for (let i = 1; i <= 3; i++) document.getElementById('h' + i).classList.toggle('lost', i > this.hearts);

      const setB = (id, cnt, cost) => {
        const b = document.getElementById(id);
        if (cnt > 0) { b.textContent = cnt; b.classList.remove('cost'); }
        else { b.textContent = cost; b.classList.add('cost'); }
      };
      setB('badgeHint', p.hints, 25);
      setB('badgeHammer', p.hammers, 45);
      setB('badgeFreeze', p.freezes, 35);
      setB('badgeNova', p.novas, 60);
      document.getElementById('btnGrid').classList.toggle('active', p.guideMode === 2);
    },

    buildLiveOcc() {
      const { W, H, arrows } = this.lvl;
      const occ = Array.from({ length: H }, () => Array(W).fill(null));
      for (const a of arrows) {
        if (a.state === 'exiting' || a.state === 'dead') continue;
        for (const c of a.cells) occ[c.y][c.x] = a;
      }
      return occ;
    },

    checkEscape(arrow) {
      const { W, H, blackHoles } = this.lvl;
      const occ = this.buildLiveOcc();
      const bhMap = new Map(blackHoles.map(b => [b.y * W + b.x, b]));
      const head = arrow.cells[arrow.cells.length - 1];
      const { x: dx, y: dy } = arrow.dir;

      let cx = head.x + dx, cy = head.y + dy, step = 1;
      const sliced = [], seen = new Set();
      let ghostSkipped = 0;

      while (cx >= 0 && cx < W && cy >= 0 && cy < H) {
        const k = cy * W + cx;
        if (bhMap.has(k)) return { canExit: true, mode: 'blackhole', bh: bhMap.get(k), dist: step, sliced };
        const other = occ[cy][cx];
        if (other && other.id !== arrow.id) {
          if (arrow.type === 'killer') {
            if (!seen.has(other.id)) { seen.add(other.id); sliced.push(other); }
          } else if (arrow.type === 'ghost') {
            if (!seen.has(other.id)) {
              seen.add(other.id); ghostSkipped++;
              if (ghostSkipped > 1) return { canExit: false, hitDist: Math.max(0.15, step - 0.65), hitPos: { x: cx + 0.5, y: cy + 0.5 } };
            }
          } else {
            return { canExit: false, hitDist: Math.max(0.15, step - 0.65), hitPos: { x: cx + 0.5, y: cy + 0.5 } };
          }
        }
        cx += dx; cy += dy; step++;
      }
      return { canExit: true, mode: 'edge', dist: step + 4, sliced };
    },

    tapWorld(wx, wy) {
      if (this.ended) return;
      AE.AudioFX.ensure();
      let best = null, bestD = 0.54;
      for (const a of this.lvl.arrows) {
        if (a.state !== 'idle') continue;
        const d = this.distPtArrow(wx, wy, a);
        if (d < bestD) { bestD = d; best = a; }
      }
      if (!best) return;

      if (this.hammerMode) { this.applyHammer(best); return; }

      if (best.type === 'lock' && best.locked) {
        AE.AudioFX.bump(); best.flash = 1; this.spawnPopup(best.pts[0], '🔒', '#f59e0b'); return;
      }
      if (best.type === 'frozen' && best.iceCount > 0) {
        AE.AudioFX.bump(); best.flash = 1; this.spawnPopup(best.pts[0], `❄️ ${best.iceCount}`, '#38bdf8'); return;
      }

      const res = this.checkEscape(best);
      if (res.canExit) this.releaseArrow(best, res);
      else this.bumpArrow(best, res);
    },

    releaseArrow(arrow, res, isCascade = false) {
      arrow.state = 'exiting'; arrow.exitMode = res.mode; arrow.bhDist = res.dist;
      arrow.speed = 19; arrow.hintGlow = 0;

      const now = performance.now();
      if (!isCascade) {
        this.combo = (now - this.lastClearTime < 2200) ? this.combo + 1 : 1;
        this.lastClearTime = now;
      }

      AE.Powers.onRelease(this, arrow, res, isCascade);
      if (!isCascade) this.advanceBoardCounters(arrow.id);
      this.updateGameHUD();
      this.checkWin();
    },

    shatterArrow(arrow, col) {
      if (arrow.state === 'dead' || arrow.state === 'exiting') return;
      arrow.state = 'dead';
      for (const p of arrow.pts) this.spawnParticles(p.x, p.y, col, 5);
      if (arrow.type === 'key') this.unlockByKey(arrow.id);
    },

    unlockByKey(keyId) {
      for (const a of this.lvl.arrows) {
        if (a.type === 'lock' && a.locked && a.keyId === keyId) {
          a.locked = false;
          const mp = a.pts[Math.floor(a.pts.length / 2)];
          this.spawnPopup(mp, '🔓', '#fde047');
          this.spawnParticles(mp.x, mp.y, '#fde047', 16);
        }
      }
    },

    advanceBoardCounters(clearedId) {
      const active = this.lvl.arrows.filter(a => a.state === 'idle' || a.state === 'bumping');
      for (const a of active) {
        if (a.type === 'frozen' && a.iceCount > 0) {
          a.iceCount--;
          if (a.iceCount === 0) this.spawnParticles(a.pts[0].x, a.pts[0].y, '#7dd3fc', 12);
        }
      }
      if (!active.some(a => !(a.type === 'frozen' && a.iceCount > 0))) {
        for (const a of active) if (a.type === 'frozen') a.iceCount = 0;
      }
      const activeIds = new Set(active.map(a => a.id));
      for (const a of active) if (a.type === 'lock' && a.locked && !activeIds.has(a.keyId)) a.locked = false;

      for (const a of active) {
        if (a.type === 'bomb' && a.id !== clearedId) {
          a.bombMoves--;
          if (a.bombMoves <= 0) { this.triggerExplosion(a); return; }
        }
      }
    },

    triggerExplosion(bomb) {
      this.ended = true; AE.AudioFX.explode(); this.shake(0.65, 16);
      for (const p of bomb.pts) {
        this.spawnParticles(p.x, p.y, '#ef4444', 18);
        this.spawnParticles(p.x, p.y, '#fb923c', 14);
      }
      bomb.state = 'dead';
      this.spawnPopup(bomb.pts[0], '💥 BOOM!', '#ef4444');
      setTimeout(() => this.endLevel(false, AE.tr('failBomb')), 720);
    },

    bumpArrow(arrow, res) {
      AE.AudioFX.bump();
      arrow.state = 'bumping'; arrow.slide = 0; arrow.bumpDir = 1;
      arrow.bumpMax = Math.min(0.45, Math.max(0.18, res.hitDist));
      arrow.flash = 1; this.combo = 0; this.mistakes++; this.hearts--;
      this.shake(0.22, 6);
      if (res.hitPos) this.spawnParticles(res.hitPos.x, res.hitPos.y, '#ef4444', 10);
      this.updateGameHUD();
      if (this.hearts <= 0) {
        this.ended = true;
        setTimeout(() => this.endLevel(false, AE.tr('failHearts')), 460);
      }
    },

    checkWin() {
      if (this.ended) return;
      if (!this.lvl.arrows.some(a => a.state === 'idle' || a.state === 'bumping')) {
        this.ended = true; AE.AudioFX.win();
        const cx = this.lvl.W / 2, cy = this.lvl.H / 2;
        ['#22c55e', '#3b82f6', '#f59e0b', '#ec4899', '#a855f7'].forEach(c => this.spawnParticles(cx, cy, c, 14));
        setTimeout(() => this.endLevel(true), 580);
      }
    },

    endLevel(won, failMsg = '') {
      const p = this.profile;
      const sec = Math.max(1, (performance.now() - this.startTime) / 1000);
      let reward = 0, unlockedThemeName = '';

      if (won) {
        const stars = this.mistakes === 0 ? 3 : (this.mistakes === 1 ? 2 : 1);
        const hist = p.levelHistory[this.lvl.level];
        const isFirstWin = !hist || hist.stars === 0;
        if (hist) {
          hist.stars = Math.max(hist.stars || 0, stars);
          hist.bestSec = hist.bestSec ? Math.min(hist.bestSec, Math.round(sec)) : Math.round(sec);
        }

        reward = isFirstWin ? ((this.lvl.isBoss ? 60 : 25) + stars * 5) : 10;
        p.coins += reward;

        const spa = sec / Math.max(1, this.lvl.initialCount);
        let perf = Math.max(10, Math.min(100, 100 - ((spa - 0.85) / 2.8) * 70 - this.mistakes * 15 - this.hintsUsed * 10 + (this.mistakes === 0 ? 10 : 0)));
        p.recentPerf.push(Math.round(perf));
        if (p.recentPerf.length > 6) p.recentPerf.shift();
        const avg = p.recentPerf.reduce((a, b) => a + b, 0) / p.recentPerf.length;
        p.skillInternal = Math.max(12, Math.min(100, Math.round(p.skillInternal * 0.65 + avg * 0.35)));
        p.levelsCompletedCount++;

        const targetIq = Math.round(96 + (p.skillInternal * 0.56) + Math.min(16, Math.log2(p.highestLevel + 1) * 2.2));
        p.iqScore = Math.max(92, Math.min(168, Math.round(p.iqScore * 0.6 + targetIq * 0.4)));

        const prevHighest = p.highestLevel;
        if (this.lvl.level >= p.highestLevel) {
          p.highestLevel = this.lvl.level + 1;
          for (const th of AE.THEMES_50) {
            if (th.unlockLevel > prevHighest && th.unlockLevel <= p.highestLevel) unlockedThemeName = th.name;
          }
        }
        if (this.lvl.isBoss && isFirstWin) { p.hints++; p.hammers++; }
      } else {
        p.skillInternal = Math.max(12, p.skillInternal - 5);
        p.iqScore = Math.max(90, p.iqScore - 1);
      }

      AE.Vault.save(p);
      this.updateGameHUD();

      document.getElementById('resTitle').textContent = won
        ? (this.lvl.isBoss ? AE.tr('bossWin', this.lvl.level) : AE.tr('lvlWin', this.lvl.level))
        : AE.tr('gameOver');
      document.getElementById('resSub').textContent = won ? this.lvl.shapeName : failMsg;
      document.getElementById('resStars').textContent = won ? (this.mistakes === 0 ? '⭐⭐⭐' : (this.mistakes === 1 ? '⭐⭐☆' : '⭐☆☆')) : '☆☆☆';
      document.getElementById('resTime').textContent = this.fmtTime(sec);
      document.getElementById('resCoins').textContent = won ? `+${reward}` : '0';
      document.getElementById('resIq').textContent = `IQ ${p.iqScore}`;

      const tNotice = document.getElementById('themeUnlockNotice');
      if (unlockedThemeName) { tNotice.style.display = 'block'; tNotice.textContent = AE.tr('themeUnlocked', unlockedThemeName); }
      else tNotice.style.display = 'none';

      const btn1 = document.getElementById('resPrimaryBtn');
      const btn2 = document.getElementById('resSecondaryBtn');
      if (won) {
        btn1.textContent = AE.tr('nextLvl', this.lvl.level + 1);
        btn1.className = 'btn-main';
        btn1.onclick = () => this.startLevel(this.lvl.level + 1);
        btn2.style.display = 'block';
        btn2.textContent = AE.tr('replay');
        btn2.onclick = () => this.startLevel(this.lvl.level);
      } else {
        btn1.textContent = AE.tr('retry');
        btn1.className = 'btn-main danger';
        btn1.onclick = () => this.startLevel(this.lvl.level);
        btn2.style.display = 'none';
      }
      document.getElementById('resultModal').classList.add('open');
    },

    useHint() {
      if (this.ended) return;
      const p = this.profile;
      if (p.hints <= 0) {
        if (p.coins < 25) return this.showToast(AE.tr('needCoins', 25), 'danger');
        p.coins -= 25;
      } else p.hints--;

      const playable = this.lvl.arrows.filter(a =>
        a.state === 'idle' && !(a.type === 'lock' && a.locked) &&
        !(a.type === 'frozen' && a.iceCount > 0) && this.checkEscape(a).canExit
      );
      if (!playable.length) return this.showToast(AE.tr('hammerPrompt'), 'gold');

      playable.sort((a, b) => {
        const sc = x => x.type === 'bomb' ? 100 - x.bombMoves : (x.type === 'key' ? 85 : (x.type !== 'normal' ? 70 : 10));
        return sc(b) - sc(a);
      });

      const pick = playable[0];
      pick.hintGlow = 5; this.hintsUsed++; AE.AudioFX.coin();

      const mp = pick.pts[Math.floor(pick.pts.length / 2)];
      this.cam.x = this.cam.x * 0.35 + mp.x * 0.65;
      this.cam.y = this.cam.y * 0.35 + mp.y * 0.65;

      const esc = this.checkEscape(pick);
      this.showToast(AE.Powers.getHintText(pick, esc), 'gold', 3800);
      AE.Vault.save(p); this.updateGameHUD();
    },

    toggleHammer() {
      if (this.ended) return;
      if (this.hammerMode) {
        this.hammerMode = false; canvas.classList.remove('hammer-mode');
        document.getElementById('btnHammer').classList.remove('hammer-active'); return;
      }
      if (this.profile.hammers <= 0 && this.profile.coins < 45) return this.showToast(AE.tr('needCoins', 45), 'danger');
      this.hammerMode = true; canvas.classList.add('hammer-mode');
      document.getElementById('btnHammer').classList.add('hammer-active');
      this.showToast(AE.tr('hammerPrompt'), 'danger', 2600);
    },

    applyHammer(arrow) {
      if (this.profile.hammers > 0) this.profile.hammers--; else this.profile.coins -= 45;
      this.hammerMode = false; canvas.classList.remove('hammer-mode');
      document.getElementById('btnHammer').classList.remove('hammer-active');
      AE.AudioFX.hammer(); this.shake(0.28, 9);
      this.shatterArrow(arrow, '#f97316'); this.spawnPopup(arrow.pts[0], '🔨', '#f97316');
      for (const a of this.lvl.arrows) if (a.state === 'idle' && a.type === 'frozen' && a.iceCount > 0) a.iceCount--;
      AE.Vault.save(this.profile); this.updateGameHUD(); this.checkWin();
    },

    useFreeze() {
      if (this.ended) return;
      const bombs = this.lvl.arrows.filter(a => a.state === 'idle' && a.type === 'bomb');
      const ice = this.lvl.arrows.filter(a => a.state === 'idle' && a.type === 'frozen' && a.iceCount > 0);
      if (!bombs.length && !ice.length) return this.showToast('⏳', 'info', 1200);
      if (this.profile.freezes <= 0) {
        if (this.profile.coins < 35) return this.showToast(AE.tr('needCoins', 35), 'danger');
        this.profile.coins -= 35;
      } else this.profile.freezes--;
      AE.AudioFX.coin();
      bombs.forEach(b => { b.bombMoves += 3; this.spawnPopup(b.pts[0], '+3 ⏳', '#38bdf8'); });
      ice.forEach(f => { f.iceCount = Math.max(0, f.iceCount - 2); this.spawnPopup(f.pts[0], '❄️', '#38bdf8'); });
      AE.Vault.save(this.profile); this.updateGameHUD();
    },

    useNovaBlast() {
      if (this.ended) return;
      const cands = this.lvl.arrows.filter(a => a.state === 'idle');
      if (!cands.length) return;
      if (this.profile.novas <= 0) {
        if (this.profile.coins < 60) return this.showToast(AE.tr('needCoins', 60), 'danger');
        this.profile.coins -= 60;
      } else this.profile.novas--;
      AE.AudioFX.laser(); this.shake(0.32, 10);
      cands.sort((a, b) => (b.type === 'bomb' ? 1 : 0) - (a.type === 'bomb' ? 1 : 0));
      cands.slice(0, 3).forEach(a => this.shatterArrow(a, '#fde047'));
      AE.Vault.save(this.profile); this.updateGameHUD(); this.checkWin();
    },

    distPtArrow(px, py, a) {
      let min = Infinity;
      for (let i = 0; i < a.pts.length - 1; i++) {
        const ax = a.pts[i].x, ay = a.pts[i].y, bx = a.pts[i + 1].x, by = a.pts[i + 1].y;
        const vx = bx - ax, vy = by - ay, l2 = vx * vx + vy * vy;
        const t = l2 > 0 ? Math.max(0, Math.min(1, ((px - ax) * vx + (py - ay) * vy) / l2)) : 0;
        const d = Math.hypot(px - (ax + vx * t), py - (ay + vy * t));
        if (d < min) min = d;
      }
      return min;
    },

    samplePath(a, s) {
      const pts = a.pts, L = pts.length - 1;
      if (s <= 0) return pts[0];
      if (s <= L) {
        const i = Math.min(L - 1, Math.floor(s)), f = s - i;
        return { x: pts[i].x + (pts[i + 1].x - pts[i].x) * f, y: pts[i].y + (pts[i + 1].y - pts[i].y) * f };
      }
      return { x: pts[L].x + a.dir.x * (s - L), y: pts[L].y + a.dir.y * (s - L) };
    },

    buildPoly(a) {
      const L = a.pts.length - 1;
      let s0 = a.slide, s1 = a.slide + L, headScale = 1;
      if (a.state === 'exiting' && a.exitMode === 'blackhole') {
        const maxS = L + a.bhDist;
        if (s1 > maxS) { s1 = maxS; headScale = Math.max(0, Math.min(1, (s1 - s0) * 1.4)); }
      }
      if (s1 - s0 <= 0.04) return null;
      const out = [this.samplePath(a, s0)];
      for (let m = Math.floor(s0) + 1; m <= Math.min(L, Math.ceil(s1) - 1); m++) {
        if (m > s0 && m < s1) out.push(a.pts[m]);
      }
      out.push(this.samplePath(a, s1));
      return { points: out, headScale };
    },

    shake(d, m) { this.shakeTime = Math.max(this.shakeTime, d); this.shakeMag = Math.max(this.shakeMag, m); },
    spawnParticles(x, y, col, n = 10) {
      for (let i = 0; i < n; i++) {
        const ang = Math.random() * Math.PI * 2, sp = 1.4 + Math.random() * 5;
        this.particles.push({ x, y, vx: Math.cos(ang) * sp, vy: Math.sin(ang) * sp, life: 0.4 + Math.random() * 0.35, max: 0.75, r: 0.06 + Math.random() * 0.09, col });
      }
    },
    spawnPopup(pt, txt, col) { this.popups.push({ x: pt.x, y: pt.y - 0.25, txt, col, life: 1.05, max: 1.05 }); },
    fmtTime(s) { const n = Math.floor(s); return String(Math.floor(n / 60)).padStart(2, '0') + ':' + String(n % 60).padStart(2, '0'); },

    loop(now) {
      const dt = Math.min(0.05, (now - this.lastFrame) / 1000);
      this.lastFrame = now; this.clock += dt;
      HomeBG.tick(dt);
      if (this.currentScreen === 'screenGame' && this.lvl) {
        this.updateGame(dt, now);
        this.renderGame();
      }
      requestAnimationFrame(t => this.loop(t));
    },

    updateGame(dt, now) {
      if (!this.ended) {
        const s = Math.floor((now - this.startTime) / 1000);
        if (s !== this.elapsedSec) {
          this.elapsedSec = s;
          document.getElementById('timerChip').textContent = '⏱️ ' + this.fmtTime(s);
        }
      }
      if (this.shakeTime > 0) this.shakeTime = Math.max(0, this.shakeTime - dt);

      const maxExit = Math.max(this.lvl.W, this.lvl.H) + 8;
      for (const a of this.lvl.arrows) {
        if (a.flash > 0) a.flash = Math.max(0, a.flash - dt * 2.8);
        if (a.hintGlow > 0) a.hintGlow = Math.max(0, a.hintGlow - dt);
        if (a.state === 'exiting') {
          a.speed += 38 * dt; a.slide += a.speed * dt;
          const L = a.pts.length - 1;
          if (a.exitMode === 'blackhole' ? a.slide >= L + a.bhDist : a.slide > L + maxExit) a.state = 'dead';
        } else if (a.state === 'bumping') {
          if (a.bumpDir > 0) { a.slide += 8.8 * dt; if (a.slide >= a.bumpMax) { a.slide = a.bumpMax; a.bumpDir = -1; } }
          else { a.slide -= 6.8 * dt; if (a.slide <= 0) { a.slide = 0; a.state = 'idle'; } }
        }
      }
      for (let i = this.particles.length - 1; i >= 0; i--) {
        const p = this.particles[i]; p.x += p.vx * dt; p.y += p.vy * dt; p.vx *= 0.94; p.vy *= 0.94; p.life -= dt;
        if (p.life <= 0) this.particles.splice(i, 1);
      }
      for (let i = this.popups.length - 1; i >= 0; i--) {
        const p = this.popups[i]; p.y -= 0.8 * dt; p.life -= dt;
        if (p.life <= 0) this.popups.splice(i, 1);
      }
    },

    renderGame() {
      const th = this.theme;
      const { W, H, mask, arrows, blackHoles } = this.lvl;

      const bgGrad = ctx.createRadialGradient(this.viewW / 2, this.viewH / 2, 20, this.viewW / 2, this.viewH / 2, Math.max(this.viewW, this.viewH) * 0.72);
      bgGrad.addColorStop(0, th.bg); bgGrad.addColorStop(1, th.bg2);
      ctx.fillStyle = bgGrad; ctx.fillRect(0, 0, this.viewW, this.viewH);

      ctx.save();
      if (this.shakeTime > 0) {
        ctx.translate((Math.random() - 0.5) * 2 * this.shakeMag * this.shakeTime * 2,
                      (Math.random() - 0.5) * 2 * this.shakeMag * this.shakeTime * 2);
      }
      ctx.translate(this.viewW / 2, this.viewH / 2);
      ctx.scale(this.cam.scale, this.cam.scale);
      ctx.translate(-this.cam.x, -this.cam.y);

      if (this.profile.guideMode >= 1) {
        ctx.fillStyle = th.dot;
        for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
          if (!mask[y][x]) continue;
          ctx.beginPath(); ctx.arc(x + 0.5, y + 0.5, 0.06, 0, Math.PI * 2); ctx.fill();
        }
      }

      if (this.profile.guideMode === 2) {
        ctx.save(); ctx.setLineDash([0.13, 0.16]); ctx.lineWidth = 0.04; ctx.strokeStyle = th.dot;
        for (const a of arrows) {
          if (a.state !== 'idle') continue;
          const h = a.pts[a.pts.length - 1];
          ctx.beginPath(); ctx.moveTo(h.x, h.y); ctx.lineTo(h.x + a.dir.x * 2, h.y + a.dir.y * 2); ctx.stroke();
        }
        ctx.restore();
      }

      for (const bh of blackHoles) this.drawBlackHole(bh.x + 0.5, bh.y + 0.5);
      for (const a of arrows) if (a.state === 'idle' || a.state === 'bumping') this.drawArrow(a, th);
      for (const a of arrows) if (a.state === 'exiting') this.drawArrow(a, th);

      for (const p of this.particles) {
        ctx.globalAlpha = Math.max(0, p.life / p.max); ctx.fillStyle = p.col;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
      }
      ctx.globalAlpha = 1;

      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      for (const pop of this.popups) {
        ctx.globalAlpha = Math.min(1, pop.life / (pop.max * 0.5));
        ctx.font = '800 0.42px "Segoe UI", sans-serif';
        ctx.lineWidth = 0.12; ctx.strokeStyle = 'rgba(15,23,42,0.85)';
        ctx.strokeText(pop.txt, pop.x, pop.y);
        ctx.fillStyle = pop.col; ctx.fillText(pop.txt, pop.x, pop.y);
      }
      ctx.globalAlpha = 1;
      ctx.restore();
    },

    drawBlackHole(cx, cy) {
      ctx.save(); ctx.translate(cx, cy);
      const t = this.clock;
      const g = ctx.createRadialGradient(0, 0, 0.1, 0, 0, 0.54);
      g.addColorStop(0, '#000'); g.addColorStop(0.45, '#4c1d95'); g.addColorStop(0.78, 'rgba(168,85,247,0.6)'); g.addColorStop(1, 'transparent');
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, 0.54, 0, Math.PI * 2); ctx.fill();
      ctx.rotate(t * 2.8); ctx.strokeStyle = '#e9d5ff'; ctx.lineWidth = 0.05;
      for (let i = 0; i < 3; i++) { ctx.rotate((Math.PI * 2) / 3); ctx.beginPath(); ctx.arc(0.11, 0, 0.22, 0, Math.PI * 0.9); ctx.stroke(); }
      ctx.fillStyle = '#020617'; ctx.beginPath(); ctx.arc(0, 0, 0.20, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
    },

    drawArrow(a, th) {
      const poly = this.buildPoly(a); if (!poly) return;
      const { points, headScale } = poly;
      const last = points[points.length - 1], prev = points[points.length - 2];
      const ang = Math.atan2(last.y - prev.y, last.x - prev.x);
      const st = AE.Powers.getStyle(a, th);
      const lw = th.style === 'ink' ? 0.135 : 0.165;

      ctx.save(); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      ctx.globalAlpha = st.alpha;

      if (a.hintGlow > 0) {
        ctx.save(); ctx.strokeStyle = 'rgba(34,197,94,0.58)';
        ctx.lineWidth = lw + 0.22 + Math.sin(this.clock * 10) * 0.05;
        this.strokePoly(points, 0.1); ctx.restore();
      }
      if (st.glow || th.style === 'neon' || th.style === 'fire') {
        ctx.save();
        ctx.strokeStyle = st.glow || (th.style === 'fire' ? 'rgba(249,115,22,0.38)' : 'rgba(56,189,248,0.34)');
        ctx.lineWidth = lw + 0.11; this.strokePoly(points, 0.1); ctx.restore();
      }

      ctx.strokeStyle = st.col; ctx.lineWidth = lw;
      this.strokePoly(points, 0.1);

      if (th.style !== 'ink' || a.type !== 'normal') {
        ctx.save(); ctx.strokeStyle = st.hi; ctx.globalAlpha = 0.52; ctx.lineWidth = lw * 0.34;
        ctx.translate(-0.018, -0.02); this.strokePoly(points, 0.14); ctx.restore();
      }

      if (headScale > 0.08) {
        ctx.save(); ctx.translate(last.x, last.y); ctx.rotate(ang); ctx.scale(headScale, headScale);
        ctx.fillStyle = st.col;
        ctx.beginPath(); ctx.moveTo(0.14, 0); ctx.lineTo(-0.17, -0.21); ctx.lineTo(-0.10, 0); ctx.lineTo(-0.17, 0.21); ctx.closePath();
        ctx.fill(); ctx.restore();
      }

      if (a.type === 'bomb' && a.state === 'idle') {
        const tail = points[0], f = 0.07 + Math.sin(this.clock * 24) * 0.035;
        ctx.fillStyle = '#fde047'; ctx.beginPath(); ctx.arc(tail.x, tail.y, f + 0.035, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#f97316'; ctx.beginPath(); ctx.arc(tail.x, tail.y, f, 0, Math.PI * 2); ctx.fill();
      }

      if (a.state === 'idle' || a.state === 'bumping') {
        const b = AE.Powers.getBadge(a);
        if (b) {
          const mp = points[Math.floor(points.length / 2)];
          this.badge(mp.x, mp.y, b.txt, b.bg, b.fg, b.ring);
        }
      }
      ctx.restore();
    },

    strokePoly(pts, trim = 0) {
      if (pts.length < 2) return;
      ctx.beginPath(); ctx.moveTo(pts[0].x, pts[0].y);
      for (let i = 1; i < pts.length - 1; i++) ctx.lineTo(pts[i].x, pts[i].y);
      const l = pts[pts.length - 1], p = pts[pts.length - 2];
      const dx = l.x - p.x, dy = l.y - p.y, len = Math.hypot(dx, dy);
      if (len > trim) ctx.lineTo(p.x + dx * (len - trim) / len, p.y + dy * (len - trim) / len);
      else ctx.lineTo(l.x, l.y);
      ctx.stroke();
    },

    badge(x, y, txt, bg, fg, ring) {
      ctx.save(); ctx.fillStyle = bg; ctx.strokeStyle = ring; ctx.lineWidth = 0.055;
      ctx.beginPath(); ctx.arc(x, y, 0.24, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      ctx.fillStyle = fg; ctx.font = '800 0.25px "Segoe UI", sans-serif';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(txt, x, y + 0.01); ctx.restore();
    },

    openThemesModal() {
      const p = this.profile;
      document.getElementById('themesCoinsVal').textContent = p.coins;
      const grid = document.getElementById('themeListGrid');
      grid.innerHTML = '';

      const autoBtn = document.createElement('button');
      autoBtn.className = 'theme-card' + (p.selectedTheme === 'auto' ? ' selected' : '');
      autoBtn.innerHTML = `
        <div class="swatch" style="background:linear-gradient(135deg,#0f172a,#06b6d4,#f59e0b); color:#fff;">✨</div>
        <div><div class="t-name">${AE.tr('unlockedAuto')}</div><div class="t-sub">${p.selectedTheme === 'auto' ? AE.tr('equipped') : AE.tr('owned')}</div></div>`;
      autoBtn.onclick = () => {
        p.selectedTheme = 'auto';
        if (this.lvl) this.theme = AE.getActiveTheme(p, this.lvl.level);
        AE.Vault.save(p); this.openThemesModal();
      };
      grid.appendChild(autoBtn);

      AE.THEMES_50.forEach(th => {
        const unlocked = AE.isThemeUnlocked(p, th.idx);
        const selected = p.selectedTheme === th.idx;
        const card = document.createElement('button');
        card.className = 'theme-card' + (selected ? ' selected' : '') + (!unlocked ? ' locked' : '');
        const subHtml = selected ? AE.tr('equipped')
          : (unlocked ? AE.tr('owned') : `<svg class="coin-svg" style="width:13px;height:13px"><use href="#icon-coin"/></svg> ${th.price} • ${AE.tr('lvlUnlockTag', th.unlockLevel)}`);
        card.innerHTML = `
          <div class="swatch" style="background:linear-gradient(135deg,${th.bg},${th.main}); color:${th.hi};">${unlocked ? '➤' : '🔒'}</div>
          <div><div class="t-name">${th.idx + 1}. ${th.name}</div><div class="t-sub">${subHtml}</div></div>`;
        card.onclick = () => {
          if (unlocked) {
            p.selectedTheme = th.idx; this.theme = th;
            AE.AudioFX.coin(); AE.Vault.save(p); this.openThemesModal();
          } else if (p.coins >= th.price) {
            p.coins -= th.price; p.boughtThemes.push(th.idx);
            p.selectedTheme = th.idx; this.theme = th;
            AE.AudioFX.win(); AE.Vault.save(p);
            this.refreshHomeUI(); if (this.lvl) this.updateGameHUD();
            this.openThemesModal();
          } else {
            AE.AudioFX.bump(); this.showToast(AE.tr('needCoins', th.price), 'danger');
          }
        };
        grid.appendChild(card);
      });
      document.getElementById('themesModal').classList.add('open');
    },

    openShopModal() {
      const p = this.profile;
      document.getElementById('shopCoinsVal').textContent = p.coins;
      const box = document.getElementById('shopItemsList');
      box.innerHTML = '';
      AE.Powers.SHOP_ITEMS.forEach(it => {
        const row = document.createElement('div');
        row.className = 'shop-item';
        row.innerHTML = `
          <div style="display:flex; align-items:center; gap:10px;">
            <div class="shop-ico">${it.ico}</div>
            <div>
              <div style="font-size:13.5px; font-weight:800;">${it.name}</div>
              <div style="font-size:11px; color:#64748b; font-weight:600;">${it.desc} (${p[it.key]})</div>
            </div>
          </div>
          <button class="shop-buy">
            <svg class="coin-svg" style="width:15px;height:15px"><use href="#icon-coin"/></svg> ${it.price}
          </button>`;
        row.querySelector('.shop-buy').onclick = () => {
          if (p.coins < it.price) { AE.AudioFX.bump(); return this.showToast(AE.tr('needCoins', it.price), 'danger'); }
          p.coins -= it.price; p[it.key] += it.qty;
          AE.AudioFX.coin(); AE.Vault.save(p);
          this.refreshHomeUI(); if (this.lvl) this.updateGameHUD();
          this.openShopModal();
        };
        box.appendChild(row);
      });
      document.getElementById('shopModal').classList.add('open');
    },

    openSettingsModal() {
      const p = this.profile;
      const pct = Math.round(p.volume * 100);
      document.getElementById('volSlider').value = pct;
      document.getElementById('volPct').textContent = pct + '%';
      const vb = document.getElementById('vibToggleBtn');
      vb.textContent = p.vibration ? 'ON' : 'OFF';
      vb.classList.toggle('on', p.vibration);
      document.getElementById('settingsModal').classList.add('open');
    },

    bindUI() {
      window.addEventListener('resize', () => this.resizeCanvas());

      document.getElementById('homePlayBtn').onclick = () => { AE.AudioFX.ensure(); this.startLevel(this.profile.highestLevel); };
      document.getElementById('navLevelsBtn').onclick = () => this.goScreen('screenLevels');
      document.getElementById('navThemesBtn').onclick = () => this.openThemesModal();
      document.getElementById('navShopBtn').onclick = () => this.openShopModal();
      document.getElementById('homeCoinPill').onclick = () => this.openShopModal();
      document.getElementById('homeSettingsBtn').onclick = () => this.openSettingsModal();

      document.getElementById('dailyRewardBtn').onclick = () => {
        const today = new Date().toISOString().slice(0, 10);
        if (this.profile.lastDailyDate === today) return;
        this.profile.lastDailyDate = today; this.profile.coins += 60;
        AE.AudioFX.win(); AE.Vault.save(this.profile); this.refreshHomeUI();
      };

      document.getElementById('levelsBackBtn').onclick = () => this.goScreen('screenHome');
      document.getElementById('gameHomeBtn').onclick = () => this.goScreen('screenHome');
      document.getElementById('gameLevelPill').onclick = () => this.goScreen('screenLevels');
      document.getElementById('gameCoinChip').onclick = () => this.openShopModal();
      document.getElementById('gameSettingsBtn').onclick = () => this.openSettingsModal();

      document.getElementById('btnHint').onclick = () => this.useHint();
      document.getElementById('btnHammer').onclick = () => this.toggleHammer();
      document.getElementById('btnFreeze').onclick = () => this.useFreeze();
      document.getElementById('btnNova').onclick = () => this.useNovaBlast();
      document.getElementById('btnFit').onclick = () => this.fitCamera();
      document.getElementById('btnGrid').onclick = () => {
        this.profile.guideMode = (this.profile.guideMode + 1) % 3;
        AE.Vault.save(this.profile); this.updateGameHUD();
      };

      document.getElementById('langEnBtn').onclick = () => { this.profile.lang = 'en'; AE.Vault.save(this.profile); this.applyLanguage(); };
      document.getElementById('langHiBtn').onclick = () => { this.profile.lang = 'hi'; AE.Vault.save(this.profile); this.applyLanguage(); };
      document.getElementById('volSlider').oninput = e => {
        const v = Number(e.target.value);
        this.profile.volume = v / 100; AE.AudioFX.volume = this.profile.volume;
        document.getElementById('volPct').textContent = v + '%';
        AE.Vault.save(this.profile);
      };
      document.getElementById('vibToggleBtn').onclick = () => {
        this.profile.vibration = !this.profile.vibration; AE.AudioFX.vibration = this.profile.vibration;
        AE.Vault.save(this.profile); this.openSettingsModal();
      };
      document.getElementById('openThemesFromSet').onclick = () => {
        document.getElementById('settingsModal').classList.remove('open'); this.openThemesModal();
      };
      document.getElementById('openHowToBtn').onclick = () => {
        document.getElementById('infoModalTitle').textContent = AE.tr('howToPlay');
        document.getElementById('infoModalBody').innerHTML = AE.tr('howToHtml');
        document.getElementById('infoModal').classList.add('open');
      };
      document.getElementById('openPrivacyBtn').onclick = () => {
        document.getElementById('infoModalTitle').textContent = AE.tr('privacyPolicy');
        document.getElementById('infoModalBody').innerHTML = AE.tr('privacyHtml');
        document.getElementById('infoModal').classList.add('open');
      };
      document.getElementById('resetDataBtn').onclick = async () => {
        if (!confirm(AE.tr('confirmReset'))) return;
        this.profile = await AE.Vault.resetAll();
        AE.AudioFX.volume = this.profile.volume; AE.AudioFX.vibration = this.profile.vibration;
        document.getElementById('settingsModal').classList.remove('open');
        this.applyLanguage(); this.goScreen('screenHome');
      };

      document.querySelectorAll('[data-close]').forEach(btn => {
        btn.onclick = () => document.getElementById(btn.getAttribute('data-close')).classList.remove('open');
      });

      // Touch / Pinch / Mouse Pan & Zoom
      canvas.addEventListener('pointerdown', e => {
        canvas.setPointerCapture(e.pointerId);
        this.pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
        if (this.pointers.size === 1) {
          this.dragStart = { x: e.clientX, y: e.clientY, cx: this.cam.x, cy: this.cam.y };
          this.isDragging = false;
        } else if (this.pointers.size === 2) {
          this.isDragging = true;
          const [a, b] = Array.from(this.pointers.values());
          this.lastPinchDist = Math.hypot(b.x - a.x, b.y - a.y);
          this.lastPinchMid = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
        }
      });

      canvas.addEventListener('pointermove', e => {
        if (!this.pointers.has(e.pointerId)) return;
        this.pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
        if (this.pointers.size === 1 && this.dragStart) {
          const dx = e.clientX - this.dragStart.x, dy = e.clientY - this.dragStart.y;
          if (Math.hypot(dx, dy) > 8) this.isDragging = true;
          if (this.isDragging) {
            this.cam.x = this.dragStart.cx - dx / this.cam.scale;
            this.cam.y = this.dragStart.cy - dy / this.cam.scale;
          }
        } else if (this.pointers.size === 2) {
          const [a, b] = Array.from(this.pointers.values());
          const d = Math.hypot(b.x - a.x, b.y - a.y);
          const mid = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
          if (this.lastPinchDist > 10) {
            const w0 = this.screenToWorld(mid.x, mid.y);
            this.cam.scale = Math.max(this.cam.minScale, Math.min(this.cam.maxScale, this.cam.scale * (d / this.lastPinchDist)));
            const w1 = this.screenToWorld(mid.x, mid.y);
            this.cam.x += w0.x - w1.x; this.cam.y += w0.y - w1.y;
          }
          if (this.lastPinchMid) {
            this.cam.x -= (mid.x - this.lastPinchMid.x) / this.cam.scale;
            this.cam.y -= (mid.y - this.lastPinchMid.y) / this.cam.scale;
          }
          this.lastPinchDist = d; this.lastPinchMid = mid;
        }
      });

      const endPtr = e => {
        const wasOne = this.pointers.size === 1;
        this.pointers.delete(e.pointerId);
        if (wasOne && !this.isDragging && this.dragStart) {
          const w = this.screenToWorld(e.clientX, e.clientY);
          this.tapWorld(w.x, w.y);
        }
        if (this.pointers.size < 2) { this.lastPinchDist = 0; this.lastPinchMid = null; }
        if (this.pointers.size === 0) { this.dragStart = null; this.isDragging = false; }
      };
      canvas.addEventListener('pointerup', endPtr);
      canvas.addEventListener('pointercancel', endPtr);

      canvas.addEventListener('wheel', e => {
        e.preventDefault();
        const w0 = this.screenToWorld(e.clientX, e.clientY);
        this.cam.scale = Math.max(this.cam.minScale, Math.min(this.cam.maxScale, this.cam.scale * (e.deltaY < 0 ? 1.12 : 0.89)));
        const w1 = this.screenToWorld(e.clientX, e.clientY);
        this.cam.x += w0.x - w1.x; this.cam.y += w0.y - w1.y;
      }, { passive: false });
    }
  };

  AE.Game.init();
})();
