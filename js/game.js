window.AE = window.AE || {};

(() => {
  'use strict';

  const HomeBG = {
    canvas: document.getElementById('homeBgCanvas'),
    ctx: null, items: [],
    init() {
      this.ctx = this.canvas.getContext('2d');
      this.resize();
      window.addEventListener('resize', () => this.resize());
      for (let i = 0; i < 20; i++) {
        this.items.push({
          x: Math.random() * window.innerWidth, y: Math.random() * window.innerHeight,
          len: 36 + Math.random() * 56, sp: 20 + Math.random() * 36,
          ang: Math.floor(Math.random() * 4) * (Math.PI / 2),
          col: i % 3 === 0 ? '#38bdf8' : (i % 3 === 1 ? '#fde047' : '#a855f7'),
          alpha: 0.14 + Math.random() * 0.24
        });
      }
    },
    resize() { this.canvas.width = window.innerWidth; this.canvas.height = window.innerHeight; },
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

    cam: { x: 4, y: 4, scale: 34, baseScale: 34, minScale: 10, maxScale: 140 },
    viewW: window.innerWidth, viewH: window.innerHeight,
    pointers: new Map(), dragStart: null, isDragging: false,
    lastPinchDist: 0, lastPinchMid: null,

    // Version 2.0 Cinematic Systems
    intro: { active: false, t: 0, dur: 0.85, flyers: [] },
    bullet: { active: false, arrow: null, t: 0, rings: [], ringCd: 0 },
    celebrate: { active: false, flyers: [] },

    shakeTime: 0, shakeMag: 0, particles: [], popups: [], impactRings: [],
    clock: 0, toastTimer: null, bannerTimer: null,

    async init() {
      this.profile = await AE.Vault.load();
      AE.AudioFX.volume = this.profile.volume;
      AE.AudioFX.vibration = this.profile.vibration;
      AE.resetHomeThemeUI();
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

      if (targetId === 'screenHome') {
        this.clearCinemaUI();
        AE.resetHomeThemeUI();
        this.refreshHomeUI();
      }
      if (targetId === 'screenLevels') {
        this.clearCinemaUI();
        AE.resetHomeThemeUI();
        this.renderLevelBlocks();
      }
      if (targetId === 'screenGame') {
        if (this.theme) AE.applyThemeUI(this.theme);
        requestAnimationFrame(() => { this.resizeCanvas(); if (this.lvl) this.fitCamera(); });
      }
    },

    clearCinemaUI() {
      this.bullet.active = false;
      this.celebrate.active = false;
      document.getElementById('cinemaTop').classList.remove('active');
      document.getElementById('cinemaBot').classList.remove('active');
      document.getElementById('gameHud').classList.remove('cinema-hide');
      document.getElementById('bottomDock').classList.remove('cinema-hide');
      document.getElementById('victoryBanner').classList.remove('show');
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

      const existing = this.profile.levelHistory[lvl];
      if (!existing || (existing.v !== 2 && (!existing.stars || lvl === this.profile.highestLevel))) {
        const seed = ((lvl * 2654435761) ^ Math.floor(Math.random() * 0x7fffffff)) >>> 0;
        this.profile.levelHistory[lvl] = {
          v: 2, seed,
          skillSnap: this.profile.skillInternal,
          stars: existing ? (existing.stars || 0) : 0,
          bestSec: existing ? (existing.bestSec || 0) : 0
        };
      }
      AE.Vault.save(this.profile);

      this.lvl = AE.PuzzleBuilder.build(lvl, this.profile.levelHistory[lvl]);
      this.theme = AE.getActiveTheme(this.profile, lvl);
      AE.applyThemeUI(this.theme);

      this.hearts = 3; this.mistakes = 0; this.hintsUsed = 0; this.combo = 0;
      this.lastClearTime = 0; this.startTime = performance.now(); this.elapsedSec = 0;
      this.ended = false; this.hammerMode = false;
      this.particles = []; this.popups = []; this.impactRings = [];
      this.clearCinemaUI();

      for (let i = 1; i <= 3; i++) {
        const h = document.getElementById('h' + i);
        h.classList.remove('lost', 'breaking', 'pop');
      }

      document.getElementById('resultModal').classList.remove('open');
      canvas.classList.remove('hammer-mode');
      document.getElementById('btnHammer').classList.remove('hammer-active');

      this.goScreen('screenGame');
      this.resizeCanvas();
      this.fitCamera();
      this.updateGameHUD();

      this.launchLevelIntro(lvl);
    },

    launchLevelIntro(lvl) {
      AE.AudioFX.assembleWhoosh();
      const flyers = [];
      const cols = [this.theme.main, this.theme.hi, '#38bdf8', '#fde047', '#a855f7'];
      for (let i = 0; i < 14; i++) {
        const side = i % 4;
        const ang = side * (Math.PI / 2);
        flyers.push({
          x: side === 0 ? -60 : (side === 2 ? this.viewW + 60 : Math.random() * this.viewW),
          y: side === 1 ? -60 : (side === 3 ? this.viewH + 60 : Math.random() * this.viewH),
          vx: Math.cos(ang) * (760 + Math.random() * 520),
          vy: Math.sin(ang) * (760 + Math.random() * 520),
          ang, len: 48 + Math.random() * 54, col: cols[i % cols.length]
        });
      }
      this.intro = { active: true, t: 0, dur: 0.85, flyers };
      this.flashBanner(this.lvl.isBoss ? `👑 BOSS ${lvl}` : AE.tr('levelIntro', lvl), 820);

      if (lvl === 1) setTimeout(() => this.showToast(AE.tr('firstTip'), 'info', 2500), 900);
      else if (this.lvl.W >= 14) setTimeout(() => this.showToast(AE.tr('zoomTip'), 'info', 2000), 900);
    },

    flashBanner(text, ms = 900) {
      const b = document.getElementById('victoryBanner');
      b.textContent = text;
      b.classList.add('show');
      clearTimeout(this.bannerTimer);
      this.bannerTimer = setTimeout(() => b.classList.remove('show'), ms);
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
      const topPad = 112, botPad = 116, sidePad = 16;
      const availW = Math.max(120, this.viewW - sidePad * 2);
      const availH = Math.max(120, this.viewH - topPad - botPad);
      const scale = Math.min(availW / (W + 0.6), availH / (H + 0.6));
      this.cam.scale = Math.max(11, Math.min(60, scale));
      this.cam.baseScale = this.cam.scale;
      this.cam.minScale = Math.max(8, this.cam.scale * 0.55);
      this.cam.maxScale = Math.min(150, this.cam.scale * 4.5);
      this.cam.x = W / 2;
      this.cam.y = H / 2 - (botPad - topPad) / (2 * this.cam.scale) * 0.22;
    },

    screenToWorld(sx, sy) {
      return {
        x: (sx - this.viewW / 2) / this.cam.scale + this.cam.x,
        y: (sy - this.viewH / 2) / this.cam.scale + this.cam.y
      };
    },

    showToast(msg, type = '', dur = 2400) {
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

      for (let i = 1; i <= 3; i++) {
        const h = document.getElementById('h' + i);
        if (i <= this.hearts) h.classList.remove('lost', 'breaking');
        else if (!h.classList.contains('breaking')) h.classList.add('lost');
      }

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

      const pierceLimit = AE.Powers.getPierceLimit(arrow.type);
      const phaseLimit = AE.Powers.getPhaseLimit(arrow.type);

      let cx = head.x + dx, cy = head.y + dy, step = 1;
      const sliced = [], seen = new Set();
      let phased = 0;

      while (cx >= 0 && cx < W && cy >= 0 && cy < H) {
        const k = cy * W + cx;
        if (bhMap.has(k)) return { canExit: true, mode: 'blackhole', bh: bhMap.get(k), dist: step, sliced };
        const other = occ[cy][cx];
        if (other && other.id !== arrow.id) {
          if (pierceLimit > 0) {
            if (!seen.has(other.id)) {
              if (sliced.length >= pierceLimit) {
                return { canExit: false, hitDist: Math.max(0.15, step - 0.65), hitPos: { x: cx + 0.5, y: cy + 0.5 } };
              }
              seen.add(other.id); sliced.push(other);
            }
          } else if (phaseLimit > 0) {
            if (!seen.has(other.id)) {
              seen.add(other.id); phased++;
              if (phased > phaseLimit) {
                return { canExit: false, hitDist: Math.max(0.15, step - 0.65), hitPos: { x: cx + 0.5, y: cy + 0.5 } };
              }
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
      if (this.ended || this.intro.active || this.bullet.active) return;
      AE.AudioFX.ensure();
      let best = null, bestD = 0.56;
      for (const a of this.lvl.arrows) {
        if (a.state !== 'idle') continue;
        const d = this.distPtArrow(wx, wy, a);
        if (d < bestD) { bestD = d; best = a; }
      }
      if (!best) return;

      if (this.hammerMode) { this.applyHammer(best); return; }

      if (AE.Powers.isLocked(best)) {
        AE.AudioFX.bump(); best.flash = 1; this.spawnPopup(best.pts[0], '🔒', '#f59e0b'); return;
      }
      if (AE.Powers.isFrozen(best)) {
        AE.AudioFX.bump(); best.flash = 1; this.spawnPopup(best.pts[0], `❄️ ${best.iceCount}`, '#38bdf8'); return;
      }

      const res = this.checkEscape(best);
      if (res.canExit) this.releaseArrow(best, res);
      else this.bumpArrow(best, res);
    },

    releaseArrow(arrow, res, isCascade = false) {
      arrow.state = 'exiting'; arrow.exitMode = res.mode; arrow.bhDist = res.dist;
      arrow.speed = arrow.type !== 'normal' ? 16 : 20;
      arrow.hintGlow = 0;

      const now = performance.now();
      if (!isCascade) {
        this.combo = (now - this.lastClearTime < 2200) ? this.combo + 1 : 1;
        this.lastClearTime = now;
      }

      AE.Powers.onRelease(this, arrow, res, isCascade);
      const remainingAfter = this.lvl.arrows.filter(a => a.state === 'idle' || a.state === 'bumping').length;

      if (remainingAfter === 0 && !isCascade && !this.ended) {
        this.triggerFinalBulletCam(arrow);
      } else {
        if (!isCascade) this.advanceBoardCounters(arrow.id);
        this.updateGameHUD();
        this.checkWin();
      }
    },

    // FILMY 3D SLOW-MOTION BULLET-TIME CAMERA ON THE FINAL ARROW!
    triggerFinalBulletCam(arrow) {
      this.ended = true;
      arrow.isBulletFinal = true;
      arrow.speed = 6.2;
      this.bullet = { active: true, arrow, t: 0, rings: [], ringCd: 0 };

      AE.AudioFX.bulletSlowMo();
      document.getElementById('cinemaTop').classList.add('active');
      document.getElementById('cinemaBot').classList.add('active');
      document.getElementById('gameHud').classList.add('cinema-hide');
      document.getElementById('bottomDock').classList.add('cinema-hide');
      this.updateGameHUD();
    },

    finishBulletToVictory() {
      this.bullet.active = false;
      document.getElementById('cinemaTop').classList.remove('active');
      document.getElementById('cinemaBot').classList.remove('active');
      document.getElementById('gameHud').classList.remove('cinema-hide');
      document.getElementById('bottomDock').classList.remove('cinema-hide');
      this.fitCamera();
      this.launchVictoryCelebration();
    },

    launchVictoryCelebration() {
      AE.AudioFX.win();
      this.flashBanner(this.mistakes === 0 ? AE.tr('awesome') : AE.tr('victory'), 960);

      const flyers = [];
      const cols = ['#fde047', '#38bdf8', '#22c55e', '#f472b6', '#a855f7', '#fb923c'];
      for (let i = 0; i < 20; i++) {
        const ang = (i / 20) * Math.PI * 2;
        flyers.push({
          x: this.viewW / 2, y: this.viewH / 2,
          vx: Math.cos(ang) * (360 + Math.random() * 440),
          vy: Math.sin(ang) * (360 + Math.random() * 440),
          ang, len: 42 + Math.random() * 46, col: cols[i % cols.length], life: 1.0
        });
      }
      this.celebrate = { active: true, flyers };

      const cx = this.lvl.W / 2, cy = this.lvl.H / 2;
      cols.forEach(c => this.spawnParticles(cx, cy, c, 14));

      setTimeout(() => {
        this.celebrate.active = false;
        this.endLevel(true);
      }, 920);
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
        if (AE.Powers.isFrozen(a)) {
          a.iceCount--;
          if (a.iceCount === 0) this.spawnParticles(a.pts[0].x, a.pts[0].y, '#7dd3fc', 12);
        }
      }
      if (!active.some(a => !AE.Powers.isFrozen(a))) {
        for (const a of active) if (a.type === 'frozen') a.iceCount = 0;
      }
      const activeIds = new Set(active.map(a => a.id));
      for (const a of active) if (AE.Powers.isLocked(a) && !activeIds.has(a.keyId)) a.locked = false;

      for (const a of active) {
        if (AE.Powers.isBomb(a) && a.id !== clearedId) {
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

    // DRAMATIC HEART SHATTER FX (No pulsing/dhak-dhak!)
    triggerHeartBreakFX(heartNum) {
      const el = document.getElementById('h' + heartNum);
      const pill = document.getElementById('heartsPill');
      const flash = document.getElementById('damageFlash');
      const fx = document.getElementById('fxLayer');

      flash.classList.add('hit');
      setTimeout(() => flash.classList.remove('hit'), 220);

      pill.classList.remove('shake-box');
      void pill.offsetWidth;
      pill.classList.add('shake-box');

      if (el) {
        el.classList.remove('lost', 'pop');
        el.classList.add('breaking');
        const rect = el.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const glyphs = ['💔', '❤️', '🔺', '✨', '💔', '🔺'];
        for (let i = 0; i < 6; i++) {
          const sp = document.createElement('span');
          sp.className = 'heart-shard';
          sp.textContent = glyphs[i];
          sp.style.left = cx + 'px';
          sp.style.top = cy + 'px';
          sp.style.setProperty('--tx', `${Math.round((Math.random() - 0.5) * 120)}px`);
          sp.style.setProperty('--ty', `${Math.round(75 + Math.random() * 100)}px`);
          sp.style.setProperty('--rot', `${Math.round((Math.random() - 0.5) * 420)}deg`);
          fx.appendChild(sp);
          setTimeout(() => sp.remove(), 820);
        }
      }
    },

    bumpArrow(arrow, res) {
      AE.AudioFX.heartBreak();
      arrow.state = 'bumping'; arrow.slide = 0; arrow.bumpDir = 1;
      arrow.bumpMax = Math.min(0.45, Math.max(0.18, res.hitDist));
      arrow.flash = 1; this.combo = 0; this.mistakes++;

      const lostNum = this.hearts;
      this.hearts--;
      this.triggerHeartBreakFX(lostNum);
      this.shake(0.28, 8);

      if (res.hitPos) {
        this.spawnParticles(res.hitPos.x, res.hitPos.y, '#ef4444', 14);
        this.impactRings.push({ x: res.hitPos.x, y: res.hitPos.y, r: 0.1, maxR: 1.15, life: 0.38, max: 0.38, col: '#ef4444' });
        this.spawnPopup(res.hitPos, '-1 💔', '#ef4444');
      }
      this.updateGameHUD();

      if (this.hearts <= 0) {
        this.ended = true;
        setTimeout(() => this.endLevel(false, AE.tr('failHearts')), 560);
      }
    },

    checkWin() {
      if (this.ended) return;
      if (!this.lvl.arrows.some(a => a.state === 'idle' || a.state === 'bumping')) {
        this.ended = true;
        this.launchVictoryCelebration();
      }
    },

    endLevel(won, failMsg = '') {
      const p = this.profile;
      const sec = Math.max(1, (performance.now() - this.startTime) / 1000);
      let reward = 0, unlockedThemeName = '', earnedStars = 0;

      if (won) {
        earnedStars = this.mistakes === 0 ? 3 : (this.mistakes === 1 ? 2 : 1);
        const hist = p.levelHistory[this.lvl.level];
        const isFirstWin = !hist || hist.stars === 0;
        if (hist) {
          hist.stars = Math.max(hist.stars || 0, earnedStars);
          hist.bestSec = hist.bestSec ? Math.min(hist.bestSec, Math.round(sec)) : Math.round(sec);
        }

        reward = isFirstWin ? ((this.lvl.isBoss ? 65 : 25) + earnedStars * 5) : 10;
        p.coins += reward;

        const spa = sec / Math.max(1, this.lvl.initialCount);
        let perf = Math.max(10, Math.min(100, 100 - ((spa - 0.85) / 2.8) * 70 - this.mistakes * 15 - this.hintsUsed * 10 + (this.mistakes === 0 ? 10 : 0)));
        p.recentPerf.push(Math.round(perf));
        if (p.recentPerf.length > 6) p.recentPerf.shift();
        const avg = p.recentPerf.reduce((a, b) => a + b, 0) / p.recentPerf.length;
        p.skillInternal = Math.max(12, Math.min(100, Math.round(p.skillInternal * 0.65 + avg * 0.35)));
        p.levelsCompletedCount++;

        const targetIq = Math.round(96 + (p.skillInternal * 0.56) + Math.min(16, Math.log2(p.highestLevel + 1) * 2.2));
        p.iqScore = Math.max(92, Math.min(175, Math.round(p.iqScore * 0.6 + targetIq * 0.4)));

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

      document.getElementById('resTopBadge').textContent = won ? (this.lvl.isBoss ? '👑' : '🏆') : '💥';
      document.getElementById('resTitle').textContent = won
        ? (this.lvl.isBoss ? AE.tr('bossWin', this.lvl.level) : AE.tr('lvlWin', this.lvl.level))
        : AE.tr('gameOver');
      document.getElementById('resSub').textContent = won ? this.lvl.shapeName : failMsg;
      document.getElementById('resTime').textContent = this.fmtTime(sec);
      document.getElementById('resIq').textContent = `IQ ${p.iqScore}`;

      for (let i = 1; i <= 3; i++) {
        const stEl = document.getElementById('star' + i);
        stEl.classList.remove('earned');
        if (won && i <= earnedStars) {
          setTimeout(() => {
            stEl.classList.add('earned');
            AE.AudioFX.starPop(i - 1);
          }, 180 + i * 240);
        }
      }

      const coinEl = document.getElementById('resCoins');
      if (won && reward > 0) {
        let shown = 0;
        const step = Math.max(1, Math.ceil(reward / 18));
        coinEl.textContent = '+0';
        const iv = setInterval(() => {
          shown = Math.min(reward, shown + step);
          coinEl.textContent = '+' + shown;
          if (shown % 4 === 0) AE.AudioFX.coinTick();
          if (shown >= reward) clearInterval(iv);
        }, 32);
      } else {
        coinEl.textContent = '0';
      }

      const tNotice = document.getElementById('themeUnlockNotice');
      if (unlockedThemeName) { tNotice.style.display = 'block'; tNotice.textContent = AE.tr('themeUnlocked', unlockedThemeName); }
      else tNotice.style.display = 'none';

      const btn1 = document.getElementById('resPrimaryBtn');
      const btn2 = document.getElementById('resSecondaryBtn');
      const btnHome = document.getElementById('resHomeBtn');

      btnHome.textContent = AE.tr('home');
      btnHome.onclick = () => {
        document.getElementById('resultModal').classList.remove('open');
        this.goScreen('screenHome');
      };

      if (won) {
        btn1.textContent = AE.tr('nextLvl', this.lvl.level + 1);
        btn1.className = 'btn-main shimmer-btn';
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
      if (this.ended || this.intro.active || this.bullet.active) return;
      const p = this.profile;
      if (p.hints <= 0) {
        if (p.coins < 25) return this.showToast(AE.tr('needCoins', 25), 'danger');
        p.coins -= 25;
      } else p.hints--;

      const playable = this.lvl.arrows.filter(a =>
        a.state === 'idle' && !AE.Powers.isLocked(a) && !AE.Powers.isFrozen(a) && this.checkEscape(a).canExit
      );
      if (!playable.length) return this.showToast(AE.tr('hammerPrompt'), 'gold');

      playable.sort((a, b) => {
        const sc = x => AE.Powers.isBomb(x) ? 100 - x.bombMoves : (x.type === 'key' ? 85 : (x.type !== 'normal' ? 70 : 10));
        return sc(b) - sc(a);
      });

      const pick = playable[0];
      pick.hintGlow = 5.5; this.hintsUsed++; AE.AudioFX.coin();

      const mp = pick.pts[Math.floor(pick.pts.length / 2)];
      this.cam.x = this.cam.x * 0.3 + mp.x * 0.7;
      this.cam.y = this.cam.y * 0.3 + mp.y * 0.7;
      this.cam.scale = Math.max(this.cam.scale, this.cam.baseScale * 1.45);

      const esc = this.checkEscape(pick);
      this.showToast(AE.Powers.getHintText(pick, esc), 'gold', 4200);
      AE.Vault.save(p); this.updateGameHUD();
    },

    toggleHammer() {
      if (this.ended || this.intro.active || this.bullet.active) return;
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
      for (const a of this.lvl.arrows) if (a.state === 'idle' && AE.Powers.isFrozen(a)) a.iceCount--;
      AE.Vault.save(this.profile); this.updateGameHUD(); this.checkWin();
    },

    useFreeze() {
      if (this.ended || this.intro.active || this.bullet.active) return;
      const bombs = this.lvl.arrows.filter(a => a.state === 'idle' && AE.Powers.isBomb(a));
      const ice = this.lvl.arrows.filter(a => a.state === 'idle' && AE.Powers.isFrozen(a));
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
      if (this.ended || this.intro.active || this.bullet.active) return;
      const cands = this.lvl.arrows.filter(a => a.state === 'idle');
      if (!cands.length) return;
      if (this.profile.novas <= 0) {
        if (this.profile.coins < 60) return this.showToast(AE.tr('needCoins', 60), 'danger');
        this.profile.coins -= 60;
      } else this.profile.novas--;
      AE.AudioFX.laser(); this.shake(0.32, 10);
      cands.sort((a, b) => (AE.Powers.isBomb(b) ? 1 : 0) - (AE.Powers.isBomb(a) ? 1 : 0));
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
        const ang = Math.random() * Math.PI * 2, sp = 1.4 + Math.random() * 5.2;
        this.particles.push({ x, y, vx: Math.cos(ang) * sp, vy: Math.sin(ang) * sp, life: 0.4 + Math.random() * 0.35, max: 0.75, r: 0.06 + Math.random() * 0.1, col });
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
      if (this.intro.active) {
        this.intro.t += dt;
        for (const f of this.intro.flyers) { f.x += f.vx * dt; f.y += f.vy * dt; }
        if (this.intro.t >= this.intro.dur) {
          this.intro.active = false;
          this.startTime = now;
        }
      }

      if (this.celebrate.active) {
        for (const f of this.celebrate.flyers) {
          f.x += f.vx * dt; f.y += f.vy * dt; f.life = Math.max(0, f.life - dt * 1.15);
        }
      }

      if (!this.ended && !this.intro.active) {
        const s = Math.floor((now - this.startTime) / 1000);
        if (s !== this.elapsedSec) {
          this.elapsedSec = s;
          document.getElementById('timerChip').textContent = '⏱️ ' + this.fmtTime(s);
        }
      }

      if (this.shakeTime > 0) this.shakeTime = Math.max(0, this.shakeTime - dt);

      let timeScale = 1;
      if (this.bullet.active && this.bullet.arrow) {
        this.bullet.t += dt;
        timeScale = this.bullet.t < 1.05 ? 0.24 : 1.55;

        const a = this.bullet.arrow;
        const L = a.pts.length - 1;
        const tip = this.samplePath(a, a.slide + L);
        const prev = this.samplePath(a, Math.max(0, a.slide + L - 0.15));
        const ang = Math.atan2(tip.y - prev.y, tip.x - prev.x);

        const targetZoom = Math.min(this.cam.maxScale, this.cam.baseScale * 1.88);
        this.cam.scale += (targetZoom - this.cam.scale) * Math.min(1, dt * 4.5);
        this.cam.x += (tip.x - this.cam.x) * Math.min(1, dt * 6.5);
        this.cam.y += (tip.y - this.cam.y) * Math.min(1, dt * 6.5);

        this.bullet.ringCd -= dt;
        if (this.bullet.ringCd <= 0) {
          this.bullet.ringCd = 0.085;
          this.bullet.rings.push({ x: tip.x, y: tip.y, ang, r: 0.14, life: 0.52, max: 0.52 });
          this.spawnParticles(tip.x, tip.y, '#fde047', 3);
        }

        for (let i = this.bullet.rings.length - 1; i >= 0; i--) {
          const r = this.bullet.rings[i];
          r.r += 1.65 * dt; r.life -= dt;
          if (r.life <= 0) this.bullet.rings.splice(i, 1);
        }

        if (a.state === 'dead' || this.bullet.t > 1.75) {
          this.finishBulletToVictory();
        }
      }

      const maxExit = Math.max(this.lvl.W, this.lvl.H) + 7;
      for (const a of this.lvl.arrows) {
        if (a.flash > 0) a.flash = Math.max(0, a.flash - dt * 2.8);
        if (a.hintGlow > 0) a.hintGlow = Math.max(0, a.hintGlow - dt);

        if (a.state === 'exiting') {
          const effDt = a.isBulletFinal ? dt * timeScale : dt;
          a.speed += (a.isBulletFinal ? 16 : 40) * effDt;
          a.slide += a.speed * effDt;

          if (a.type !== 'normal' && Math.random() < 0.45) {
            const p0 = this.samplePath(a, a.slide);
            const st = AE.Powers.getStyle(a, this.theme);
            this.particles.push({ x: p0.x, y: p0.y, vx: (Math.random() - 0.5) * 1.4, vy: (Math.random() - 0.5) * 1.4, life: 0.28, max: 0.28, r: 0.08, col: st.hi });
          }

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
      for (let i = this.impactRings.length - 1; i >= 0; i--) {
        const r = this.impactRings[i]; r.life -= dt;
        r.r = r.maxR * (1 - r.life / r.max);
        if (r.life <= 0) this.impactRings.splice(i, 1);
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

      if (this.bullet.active) {
        const vg = ctx.createRadialGradient(this.viewW / 2, this.viewH / 2, this.viewW * 0.18, this.viewW / 2, this.viewH / 2, this.viewW * 0.85);
        vg.addColorStop(0, 'rgba(0,0,0,0)');
        vg.addColorStop(1, 'rgba(2, 6, 23, 0.72)');
        ctx.fillStyle = vg; ctx.fillRect(0, 0, this.viewW, this.viewH);

        ctx.save(); ctx.translate(this.viewW / 2, this.viewH / 2);
        ctx.strokeStyle = 'rgba(254, 240, 138, 0.16)'; ctx.lineWidth = 2;
        for (let i = 0; i < 16; i++) {
          const a = (i / 16) * Math.PI * 2 + this.clock * 0.6;
          const r1 = 130 + ((i * 37 + this.clock * 400) % 90);
          ctx.beginPath(); ctx.moveTo(Math.cos(a) * r1, Math.sin(a) * r1);
          ctx.lineTo(Math.cos(a) * (r1 + 140), Math.sin(a) * (r1 + 140)); ctx.stroke();
        }
        ctx.restore();
      }

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
          ctx.beginPath(); ctx.arc(x + 0.5, y + 0.5, 0.055, 0, Math.PI * 2); ctx.fill();
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

      if (this.bullet.active) {
        for (const r of this.bullet.rings) {
          ctx.save();
          ctx.translate(r.x, r.y); ctx.rotate(r.ang);
          ctx.globalAlpha = Math.max(0, r.life / r.max) * 0.85;
          ctx.strokeStyle = '#fef08a'; ctx.lineWidth = 0.06;
          ctx.beginPath(); ctx.ellipse(0, 0, r.r * 0.34, r.r, 0, 0, Math.PI * 2); ctx.stroke();
          ctx.restore();
        }
      }

      for (const a of arrows) if (a.state === 'idle' || a.state === 'bumping') this.drawArrow(a, th);
      for (const a of arrows) if (a.state === 'exiting') this.drawArrow(a, th);

      for (const r of this.impactRings) {
        ctx.save();
        ctx.globalAlpha = Math.max(0, r.life / r.max);
        ctx.strokeStyle = r.col; ctx.lineWidth = 0.08;
        ctx.beginPath(); ctx.arc(r.x, r.y, r.r, 0, Math.PI * 2); ctx.stroke();
        ctx.restore();
      }

      for (const p of this.particles) {
        ctx.globalAlpha = Math.max(0, p.life / p.max); ctx.fillStyle = p.col;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
      }
      ctx.globalAlpha = 1;

      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      for (const pop of this.popups) {
        ctx.globalAlpha = Math.min(1, pop.life / (pop.max * 0.5));
        ctx.font = '800 0.42px "Segoe UI", sans-serif';
        ctx.lineWidth = 0.12; ctx.strokeStyle = 'rgba(15,23,42,0.88)';
        ctx.strokeText(pop.txt, pop.x, pop.y);
        ctx.fillStyle = pop.col; ctx.fillText(pop.txt, pop.x, pop.y);
      }
      ctx.globalAlpha = 1;
      ctx.restore();

      if (this.intro.active) this.drawScreenFlyers(this.intro.flyers, 0.72);
      if (this.celebrate.active) this.drawScreenFlyers(this.celebrate.flyers, 0.92);
    },

    drawScreenFlyers(flyers, baseAlpha) {
      for (const f of flyers) {
        ctx.save();
        ctx.translate(f.x, f.y); ctx.rotate(f.ang);
        ctx.globalAlpha = (f.life !== undefined ? f.life : 1) * baseAlpha;
        ctx.strokeStyle = f.col; ctx.fillStyle = f.col;
        ctx.lineWidth = 5; ctx.lineCap = 'round';
        ctx.beginPath(); ctx.moveTo(-f.len / 2, 0); ctx.lineTo(f.len / 2 - 10, 0); ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(f.len / 2 + 6, 0); ctx.lineTo(f.len / 2 - 14, -10);
        ctx.lineTo(f.len / 2 - 9, 0); ctx.lineTo(f.len / 2 - 14, 10);
        ctx.closePath(); ctx.fill();
        ctx.restore();
      }
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

      ctx.save();
      ctx.lineCap = 'round'; ctx.lineJoin = 'round';

      if (this.intro.active) {
        const rawP = Math.max(0, Math.min(1, (this.intro.t - a.introDelay) / 0.52));
        const ease = 1 - Math.pow(1 - rawP, 3);
        const off = (1 - ease) * a.introDist;
        ctx.translate(-a.dir.x * off, -a.dir.y * off);
        ctx.globalAlpha = Math.max(0.05, ease) * st.alpha;
      } else {
        ctx.globalAlpha = st.alpha;
      }

      const is3D = a.state === 'exiting' && (a.type !== 'normal' || a.isBulletFinal);
      const lift = is3D ? Math.min(1, 0.35 + a.slide * 0.22) : 0;

      if (is3D) {
        ctx.save();
        ctx.translate(0.14 * lift, 0.24 * lift);
        ctx.strokeStyle = 'rgba(2, 6, 23, 0.45)';
        ctx.lineWidth = lw * 1.15;
        this.strokePoly(points, 0.1);
        ctx.restore();

        ctx.translate(-0.04 * lift, -0.09 * lift);

        const depthLayers = a.isBulletFinal ? 4 : 2;
        for (let k = depthLayers; k >= 1; k--) {
          ctx.save();
          ctx.translate(0.025 * k, 0.045 * k);
          ctx.strokeStyle = a.isBulletFinal ? '#b45309' : 'rgba(15,23,42,0.55)';
          ctx.lineWidth = lw * (a.isBulletFinal ? 1.25 : 1.08);
          this.strokePoly(points, 0.1);
          ctx.restore();
        }
      }

      if (a.hintGlow > 0) {
        ctx.save(); ctx.strokeStyle = 'rgba(34,197,94,0.62)';
        ctx.lineWidth = lw + 0.24 + Math.sin(this.clock * 10) * 0.05;
        this.strokePoly(points, 0.1); ctx.restore();
      }

      if (st.glow || th.style === 'neon' || th.style === 'fire' || a.isBulletFinal) {
        ctx.save();
        ctx.strokeStyle = a.isBulletFinal ? 'rgba(253,224,71,0.68)'
          : (st.glow || (th.style === 'fire' ? 'rgba(249,115,22,0.38)' : 'rgba(56,189,248,0.34)'));
        ctx.lineWidth = lw + (a.isBulletFinal ? 0.20 : 0.11);
        this.strokePoly(points, 0.1); ctx.restore();
      }

      ctx.strokeStyle = a.isBulletFinal ? '#f59e0b' : st.col;
      ctx.lineWidth = a.isBulletFinal ? lw * 1.22 : lw;
      this.strokePoly(points, 0.1);

      if (th.style !== 'ink' || a.type !== 'normal' || a.isBulletFinal) {
        ctx.save();
        ctx.strokeStyle = a.isBulletFinal ? '#fffbeb' : st.hi;
        ctx.globalAlpha = a.isBulletFinal ? 0.9 : 0.56;
        ctx.lineWidth = lw * 0.36;
        ctx.translate(-0.02, -0.024);
        this.strokePoly(points, 0.14);
        ctx.restore();
      }

      if (headScale > 0.08) {
        ctx.save(); ctx.translate(last.x, last.y); ctx.rotate(ang);
        const hs = headScale * (a.isBulletFinal ? 1.28 : (is3D ? 1.12 : 1));
        ctx.scale(hs, hs);
        if (is3D) {
          ctx.fillStyle = 'rgba(15,23,42,0.45)';
          ctx.beginPath(); ctx.moveTo(0.18, 0.05); ctx.lineTo(-0.13, -0.17); ctx.lineTo(-0.06, 0.05); ctx.lineTo(-0.13, 0.25); ctx.closePath(); ctx.fill();
        }
        ctx.fillStyle = a.isBulletFinal ? '#fde047' : st.col;
        ctx.beginPath(); ctx.moveTo(0.14, 0); ctx.lineTo(-0.17, -0.21); ctx.lineTo(-0.10, 0); ctx.lineTo(-0.17, 0.21); ctx.closePath();
        ctx.fill(); ctx.restore();
      }

      if (AE.Powers.isBomb(a) && a.state === 'idle') {
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
      ctx.beginPath(); ctx.arc(x, y, 0.25, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
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
        if (this.lvl) { this.theme = AE.getActiveTheme(p, this.lvl.level); AE.applyThemeUI(this.theme); }
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
            if (this.currentScreen === 'screenGame') AE.applyThemeUI(th);
            AE.AudioFX.coin(); AE.Vault.save(p); this.openThemesModal();
          } else if (p.coins >= th.price) {
            p.coins -= th.price; p.boughtThemes.push(th.idx);
            p.selectedTheme = th.idx; this.theme = th;
            if (this.currentScreen === 'screenGame') AE.applyThemeUI(th);
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
              <div style="font-size:11px; color:var(--ui-muted); font-weight:600;">${it.desc} (${p[it.key]})</div>
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
      document.getElementById('vibToggleBtn').classList.toggle('on', p.vibration);
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

      canvas.addEventListener('pointerdown', e => {
        if (this.bullet.active) return;
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
        if (!this.pointers.has(e.pointerId) || this.bullet.active) return;
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
        if (this.bullet.active) return;
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
