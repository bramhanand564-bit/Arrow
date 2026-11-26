window.AE = window.AE || {};

AE.Powers = {
  // Coin Shop Boosters
  SHOP_ITEMS: [
    { key: 'hints',   ico: '💡', name: 'Hint Pack (x3)',      desc: 'Highlights best move & power tips',  price: 60,  qty: 3 },
    { key: 'hammers', ico: '🔨', name: 'Hammer Smash (x2)',   desc: 'Shatter any blocking arrow',         price: 80,  qty: 2 },
    { key: 'freezes', ico: '⏳', name: '+3 Bomb Moves (x2)',  desc: 'Adds +3 moves to bombs & thaws ice', price: 65,  qty: 2 },
    { key: 'novas',   ico: '💥', name: 'Nova Blast (x2)',     desc: 'Clears 3 tough arrows instantly',    price: 110, qty: 2 }
  ],

  // 52 Distinct Playable Special Arrows!
  // [id, ico, col, hi, glow, bg, minLvl, role, enHint, hiHint]
  RAW_CATALOG: [
    // --- 1-6: BOMBS & DEFUSERS ---
    ['bomb',       '💣', '#dc2626', '#fb923c', 'rgba(239,68,68,0.52)',   '#18181b', 2,  'bomb',   '💣 COUNTDOWN BOMB: Release before 0 or it explodes! (+10 coins)', '💣 बम ऐरो: गिनती 0 होने से पहले निकालें वरना धमाका होगा! (+10 कॉइन)'],
    ['megaBomb',   '☢️', '#b91c1c', '#fde047', 'rgba(220,38,38,0.58)',   '#450a0a', 8,  'bomb',   '☢️ NUCLEAR BOMB: High-value bomb! Defuse before 0 for +35 coins!', '☢️ न्यूक्लियर बम: 0 से पहले डिफ्यूज़ करने पर +35 कॉइन्स मिलेंगे!'],
    ['defuser',    '🧯', '#0d9488', '#99f6e4', 'rgba(20,184,166,0.48)',  '#134e4a', 5,  'action', '🧯 DEFUSER: Adds +3 moves to all active bombs on board!', '🧯 डिफ्यूज़र: बोर्ड के सभी बमों में +3 मूव्स जोड़ देता है!'],
    ['timeWarp',   '⏱️', '#0284c7', '#bae6fd', 'rgba(14,165,233,0.48)',  '#0c4a6e', 7,  'action', '⏱️ CHRONO ARROW: +2 moves to bombs & thaws ice!', '⏱️ क्रोनो तीर: बमों को +2 मूव्स देता है और बर्फ पिघलाता है!'],
    ['fuseCut',    '✂️', '#16a34a', '#bbf7d0', 'rgba(34,197,94,0.48)',   '#14532d', 10, 'action', '✂️ WIRE CUTTER: Instantly defuses 1 active bomb safely!', '✂️ वायर कटर: 1 सक्रिय बम को तुरंत सुरक्षित शांत कर देता है!'],
    ['c4Blast',    '🧨', '#ea580c', '#fed7aa', 'rgba(249,115,22,0.55)',  '#7c2d12', 9,  'action', '🧨 C4 DETONATOR: Shatters 2 closest neighbor arrows on exit!', '🧨 C4 ब्लास्ट: निकलते ही पास के 2 तीरों को उड़ा देता है!'],

    // --- 7-13: PIERCERS & SLICERS ---
    ['killer',     '⚡', '#7c3aed', '#38bdf8', 'rgba(139,92,246,0.55)',  '#4c1d95', 3,  'pierceAll', '⚡ LASER STRIKER: Slices straight through ALL blockers ahead!', '⚡ लेज़र स्ट्राइकर: सामने आने वाले सारे ब्लॉकर काटकर निकल जाता है!'],
    ['sniper',     '🎯', '#e11d48', '#fecdd3', 'rgba(225,29,72,0.50)',   '#881337', 5,  'pierce1',   '🎯 SNIPER SHOT: Pierces & destroys 1 blocker right ahead!', '🎯 स्नाइपर शॉट: आगे खड़े 1 ब्लॉकर को भेदकर सीधा निकल जाता है!'],
    ['sawblade',   '🪚', '#64748b', '#f8fafc', 'rgba(148,163,184,0.50)', '#1e293b', 7,  'pierce2',   '🪚 SAWBLADE: Cuts cleanly through up to 2 blockers ahead!', '🪚 आरी तीर: रास्ते के 2 ब्लॉकर तीरों को काटते हुए निकलता है!'],
    ['railgun',    '🔫', '#06b6d4', '#cffafe', 'rgba(6,182,212,0.55)',   '#164e63', 14, 'pierceAll', '🔫 RAILGUN: Hyper-pierces all blockers ahead +20 bonus coins!', '🔫 रेलगन: सामने के सभी ब्लॉकर उड़ाता है +20 कॉइन बोनस!'],
    ['drill',      '🔩', '#d97706', '#fef3c7', 'rgba(217,119,6,0.50)',   '#78350f', 11, 'pierce1',   '🔩 DRILL CORE: Drills through 1 blocker & breaks 1 neighbor!', '🔩 ड्रिल कोर: 1 ब्लॉकर को चीरकर पास का 1 और तीर तोड़ता है!'],
    ['katana',     '⚔️', '#be123c', '#fda4af', 'rgba(190,18,60,0.52)',   '#4c0519', 12, 'pierce1',   '⚔️ KATANA SLASH: Cuts 1 blocker cleanly +15 coins!', '⚔️ कटाना स्लैश: 1 ब्लॉकर को काटकर +15 कॉइन्स देता है!'],
    ['plasmaBeam', '🛸', '#9333ea', '#f0abfc', 'rgba(168,85,247,0.58)',  '#3b0764', 18, 'pierceAll', '🛸 PLASMA RAY: Vaporizes every blocker in front with 3D beam!', '🛸 प्लाज़्मा रे: सामने आने वाले हर ब्लॉकर को भाप बना देता है!'],

    // --- 14-18: PHASERS & TELEPORTERS ---
    ['ghost',      '👻', '#6366f1', '#e0e7ff', 'rgba(129,140,248,0.48)', '#312e81', 4,  'phase1', '👻 GHOST PHASE: Passes smoothly right through 1 blocking arrow!', '👻 घोस्ट तीर: सामने खड़े 1 ब्लॉकिंग तीर के आर-पार निकल जाता है!'],
    ['phantom',    '🫥', '#8b5cf6', '#ede9fe', 'rgba(139,92,246,0.48)',  '#4c1d95', 10, 'phase2', '🫥 PHANTOM X2: Phases effortlessly through up to 2 blockers!', '🫥 फैंटम X2: बिना टकराए 2 ब्लॉकिंग तीरों के आर-पार निकल जाता है!'],
    ['voidStep',   '🌌', '#4338ca', '#c7d2fe', 'rgba(99,102,241,0.52)',  '#1e1b4b', 16, 'phase3', '🌌 VOID JUMPER: Warps straight past up to 3 blockers!', '🌌 वॉइड जम्पर: रास्ते के 3 ब्लॉकर को पार करके सीधा निकल जाता है!'],
    ['shadowDash', '🥷', '#334155', '#cbd5e1', 'rgba(100,116,139,0.50)', '#0f172a', 13, 'phase1', '🥷 SHADOW DASH: Phases 1 blocker & silently removes 1 arrow!', '🥷 शैडो डैश: 1 ब्लॉकर के पार जाता है और 1 एक्स्ट्रा तीर हटाता है!'],
    ['warpArrow',  '🌀', '#a855f7', '#f3e8ff', 'rgba(168,85,247,0.56)',  '#581c87', 15, 'phase1', '🌀 WORMHOLE WARP: Phases 1 blocker & pulls 1 nearby arrow out!', '🌀 वॉर्महोल: 1 ब्लॉकर पार करता है और पास का 1 तीर खींच लेता है!'],

    // --- 19-28: CANDY-CRUSH MULTI-CLEARS ---
    ['nova',       '🌟', '#0284c7', '#fde047', 'rgba(56,189,248,0.55)',  '#075985', 4,  'action', '🌟 NOVA BURST: Clears ALL free arrows facing the same way!', '🌟 नोवा बर्स्ट: उसी दिशा के बाकी सभी खाली तीर एक साथ उड़ा देता है!'],
    ['superNova',  '💫', '#2563eb', '#fef08a', 'rgba(59,130,246,0.58)',  '#1e3a8a', 14, 'action', '💫 SUPERNOVA: Launches all free arrows facing same OR opposite!', '💫 सुपरनोवा: एक जैसी व उल्टी दिशा वाले सारे खाली तीर उड़ा देता है!'],
    ['colorBomb',  '🌈', '#ec4899', '#fef08a', 'rgba(236,72,153,0.58)',  '#831843', 8,  'action', '🌈 RAINBOW BOMB: Candy-style blast! Clears 3 random arrows!', '🌈 रेनबो बम: कैंडी क्रश जैसा धमाका! 3 रैंडम तीर एक साथ साफ!'],
    ['rowBlast',   '🚀', '#ef4444', '#fed7aa', 'rgba(239,68,68,0.55)',   '#7f1d1d', 6,  'action', '🚀 ROW ROCKET: Blasts up to 3 arrows along the same horizontal row!', '🚀 रो रॉकेट: उसी क्षैतिज लाइन के 3 तीर उड़ा देता है!'],
    ['colBlast',   '☄️', '#f97316', '#fef08a', 'rgba(249,115,22,0.55)',  '#7c2d12', 6,  'action', '☄️ COLUMN METEOR: Blasts up to 3 arrows in the same vertical line!', '☄️ कॉलम मीटियोर: उसी खड़ी लाइन के 3 तीर साफ कर देता है!'],
    ['crossBlast', '✚',  '#e11d48', '#fde047', 'rgba(244,63,94,0.55)',   '#881337', 11, 'action', '✚ CROSS STRIKER: Blasts arrows in both horizontal & vertical cross!', '✚ क्रॉस स्ट्राइकर: आड़ी और खड़ी दोनों लाइनों के तीर उड़ा देता है!'],
    ['domino',     '🁢', '#10b981', '#d1fae5', 'rgba(16,185,129,0.50)',  '#064e3b', 5,  'action', '🁢 DOMINO CHAIN: Auto-launches 2 free arrows right after it!', '🁢 डोमिनो चेन: अपने साथ 2 और खाली तीरों को ऑटो रिलीज़ करता है!'],
    ['tornado',    '🌪️', '#0ea5e9', '#e0f2fe', 'rgba(14,165,233,0.52)',  '#0c4a6e', 9,  'action', '🌪️ TORNADO SPIN: Sweeps 2 closest arrows off the board!', '🌪️ टॉरनेडो: अपने आस-पास के 2 सबसे नजदीकी तीर उड़ा ले जाता है!'],
    ['shockwave',  '〰️', '#3b82f6', '#dbeafe', 'rgba(59,130,246,0.55)',  '#1e3a8a', 12, 'action', '〰️ SHOCKWAVE: Blast ring shatters up to 3 nearby arrows!', '〰️ शॉकवेव: धमाके की लहर पास के 3 तीरों को तोड़ देती है!'],
    ['vortexPull', '🧲', '#dc2626', '#cbd5e1', 'rgba(239,68,68,0.52)',   '#7f1d1d', 7,  'action', '🧲 GRAVITY MAGNET: Pulls & clears the 2 shortest arrows anywhere!', '🧲 मैग्नेट तीर: पूरे बोर्ड से 2 सबसे छोटे तीरों को खींचकर हटा देता है!'],

    // --- 29-38: ELEMENTAL POWERS ---
    ['fire',       '🔥', '#ea580c', '#fef08a', 'rgba(249,115,22,0.55)',  '#9a3412', 4,  'action', '🔥 FIREBALL: Melts 1 nearest blocking arrow on exit!', '🔥 फायरबॉल: निकलते ही सबसे नजदीकी 1 तीर को जलाकर राख कर देता है!'],
    ['inferno',    '🌋', '#dc2626', '#fde047', 'rgba(220,38,38,0.58)',   '#7f1d1d', 13, 'action', '🌋 INFERNO WAVE: Burns away 2 closest arrows + thaws all ice!', '🌋 इन्फर्नो: पास के 2 तीर जलाता है और सारी बर्फ पिघलाता है!'],
    ['electric',   '⚡', '#0891b2', '#67e8f9', 'rgba(34,211,238,0.52)',  '#164e63', 4,  'action', '⚡ CHAIN LIGHTNING: Zaps 1 random arrow off the board!', '⚡ चेन लाइटनिंग: बिजली गिराकर 1 रैंडम तीर गायब कर देता है!'],
    ['thunderBolt','🌩️', '#eab308', '#fef9c3', 'rgba(250,204,21,0.55)',  '#713f12', 11, 'action', '🌩️ STORM SURGE: Strikes 2 random arrows with lightning!', '🌩️ स्टॉर्म सर्ज: दो तीरों पर एक साथ बिजली गिराकर उन्हें साफ करता है!'],
    ['frozen',     '❄️', '#0284c7', '#e0f2fe', 'rgba(56,189,248,0.48)',  '#0369a1', 5,  'frozen', '❄️ FROST ICE: Frozen solid! Clear other arrows to melt the ice.', '❄️ बर्फ ऐरो: जमा हुआ है! दूसरे तीर हटाने पर इसकी बर्फ पिघलेगी।'],
    ['cryoBlast',  '🧊', '#06b6d4', '#ffffff', 'rgba(103,232,249,0.55)', '#155e75', 8,  'action', '🧊 BLIZZARD THAW: Instantly melts ALL frozen arrows on board!', '🧊 ब्लिज़र्ड: बोर्ड पर जमे हुए सारे बर्फ वाले तीरों को तुरंत पिघला देता है!'],
    ['acid',       '🧪', '#65a30d', '#ecfccb', 'rgba(132,204,22,0.52)',  '#365314', 9,  'action', '🧪 ACID MELT: Dissolves 1 arrow nearest to its tail!', '🧪 एसिड मेल्ट: अपनी पूँछ के पास वाले 1 तीर को गलाकर खत्म कर देता है!'],
    ['venom',      '🐍', '#16a34a', '#bbf7d0', 'rgba(34,197,94,0.52)',   '#14532d', 15, 'action', '🐍 VENOM FANG: Dissolves the LONGEST arrow on the board!', '🐍 वेनम फैंग: पूरे बोर्ड के सबसे लंबे तीर को गायब कर देता है!'],
    ['solarFlare', '☀️', '#f59e0b', '#fffbeb', 'rgba(245,158,11,0.58)',  '#92400e', 16, 'action', '☀️ SOLAR FLARE: Melts all ice & vaporizes 2 nearby arrows!', '☀️ सोलर फ्लेयर: सारी बर्फ पिघलाता है और 2 पास के तीर उड़ाता है!'],
    ['tsunami',    '🌊', '#0284c7', '#bae6fd', 'rgba(56,189,248,0.55)',  '#0c4a6e', 12, 'action', '🌊 TIDAL WAVE: Sweeps 3 currently free arrows off the board!', '🌊 सुनामी: 3 खाली तीरों को लहर के साथ एक झटके में बाहर कर देता है!'],

    // --- 39-42: KEYS, LOCKS & CRYSTALS ---
    ['key',        '🔑', '#ca8a04', '#fef08a', 'rgba(250,204,21,0.50)',  '#854d0e', 5,  'key',    '🔑 GOLDEN KEY: Release first to unlock the chained Lock arrow!', '🔑 गोल्डन चाबी: पहले इसे निकालें ताकि ताले वाला तीर खुल सके!'],
    ['lock',       '🔒', '#64748b', '#cbd5e1', null,                     '#334155', 5,  'lock',   '🔒 CHAIN LOCK: Unlock by releasing the Golden Key arrow first!', '🔒 ताला ऐरो: इसे खोलने के लिए पहले चाबी वाला तीर निकालें!'],
    ['masterKey',  '🗝️', '#eab308', '#ffffff', 'rgba(253,224,71,0.58)',  '#713f12', 14, 'action', '🗝️ MASTER KEY: Unlocks ALL locks & melts ALL ice instantly!', '🗝️ मास्टर चाबी: सारे ताले खोलती है और सारी बर्फ तुरंत पिघलाती है!'],
    ['crystal',    '💎', '#38bdf8', '#ffffff', 'rgba(56,189,248,0.56)',  '#0369a1', 7,  'action', '💎 CRYSTAL PRISM: Grants +20 coins & shatters 1 random arrow!', '💎 क्रिस्टल प्रिज्म: +20 कॉइन्स देता है और 1 तीर तोड़ता है!'],

    // --- 43-52: REWARDS, HEALERS & BOOSTER DROPS ---
    ['bonus',      '★',  '#d97706', '#fef08a', 'rgba(250,204,21,0.55)',  '#b45309', 1,  'action', '★ GOLDEN JACKPOT: +25 Gold Coins or restores +1 Heart!', '★ गोल्डन जैकपॉट: +25 गोल्ड कॉइन्स या कटा हुआ +1 दिल वापस देता है!'],
    ['treasure',   '💰', '#eab308', '#fffbeb', 'rgba(250,204,21,0.58)',  '#854d0e', 6,  'action', '💰 TREASURE CHEST: Big +45 Gold Coins jackpot on release!', '💰 खज़ाना तीर: बाहर निकालने पर पूरे +45 गोल्ड कॉइन्स मिलते हैं!'],
    ['heartHeal',  '💖', '#ec4899', '#fce7f3', 'rgba(236,72,153,0.55)',  '#9d174d', 4,  'action', '💖 MEDKIT HEART: Heals +1 lost Heart (or +30 coins if full)!', '💖 हार्ट हीलर: 1 खोया दिल वापस देता है (दिल पूरे हों तो +30 कॉइन्स)!'],
    ['hintDrop',   '💡', '#eab308', '#fef08a', 'rgba(250,204,21,0.50)',  '#713f12', 5,  'action', '💡 WISDOM ORB: Adds +1 FREE Hint directly to your dock!', '💡 विज़डम ऑर्ब: आपको 1 फ्री हिंट बूस्टर गिफ्ट करता है!'],
    ['hammerDrop', '🔨', '#f97316', '#ffedd5', 'rgba(249,115,22,0.50)',  '#9a3412', 8,  'action', '🔨 FORGE TOKEN: Adds +1 FREE Hammer Smash to your dock!', '🔨 फोर्ज टोकन: आपको 1 फ्री हथौड़ा बूस्टर गिफ्ट करता है!'],
    ['freezeDrop', '⏳', '#0ea5e9', '#e0f2fe', 'rgba(14,165,233,0.50)',  '#075985', 9,  'action', '⏳ HOURGLASS GIFT: Adds +1 FREE +3 Moves booster!', '⏳ आवरग्लास गिफ्ट: आपको 1 फ्री +3 मूव्स बूस्टर मिलता है!'],
    ['novaDrop',   '💥', '#a855f7', '#f3e8ff', 'rgba(168,85,247,0.52)',  '#581c87', 12, 'action', '💥 STAR CORE: Adds +1 FREE Nova Blast booster!', '💥 स्टार कोर: आपको 1 फ्री नोवा ब्लास्ट बूस्टर गिफ्ट करता है!'],
    ['iqBoost',    '🧠', '#06b6d4', '#cffafe', 'rgba(6,182,212,0.54)',   '#164e63', 7,  'action', '🧠 BRAIN SPARK: Boosts your IQ (+2) & grants +20 coins!', '🧠 ब्रेन स्पार्क: आपका IQ (+2) बढ़ाता है और +20 कॉइन्स देता है!'],
    ['luckyStar',  '🍀', '#16a34a', '#dcfce7', 'rgba(34,197,94,0.52)',   '#14532d', 10, 'action', '🍀 LUCKY CLOVER: Surprise reward (+50 coins, free booster or clear)!', '🍀 लकी क्लोवर: सरप्राइज़ इनाम (+50 कॉइन्स, फ्री बूस्टर या 2 तीर साफ)!'],
    ['crownApex',  '👑', '#f59e0b', '#ffffff', 'rgba(253,224,71,0.65)',  '#78350f', 10, 'action', '👑 APEX CROWN: +60 Coins, clears 2 arrows & heals +1 Heart!', '👑 एपेक्स क्राउन: +60 कॉइन्स, 2 तीर साफ और +1 दिल वापस!']
  ],

  MAP: null,
  initMap() {
    if (this.MAP) return;
    this.MAP = {};
    for (const r of this.RAW_CATALOG) {
      this.MAP[r[0]] = {
        id: r[0], ico: r[1], col: r[2], hi: r[3], glow: r[4], bg: r[5],
        minLvl: r[6], role: r[7], enHint: r[8], hiHint: r[9]
      };
    }
  },

  getDef(type) {
    this.initMap();
    return this.MAP[type] || null;
  },

  isBomb(a)   { return a.type === 'bomb' || a.type === 'megaBomb'; },
  isFrozen(a) { return a.type === 'frozen' && a.iceCount > 0; },
  isLocked(a) { return a.type === 'lock' && a.locked; },

  getPierceLimit(type) {
    const d = this.getDef(type);
    if (!d) return 0;
    if (d.role === 'pierceAll') return 99;
    if (d.role === 'pierce2') return 2;
    if (d.role === 'pierce1') return 1;
    return 0;
  },

  getPhaseLimit(type) {
    const d = this.getDef(type);
    if (!d) return 0;
    if (d.role === 'phase3') return 3;
    if (d.role === 'phase2') return 2;
    if (d.role === 'phase1') return 1;
    return 0;
  },

  // Ratio Rule: <=20 arrows -> 2-3 specials (Lvl 1 = 1); >20 arrows -> 1 special per 10 arrows!
  assignToBoard({ arrows, order, depthMap, occ, bhSet, W, H, level, effLvl, skill, isBoss, rng }) {
    this.initMap();
    const total = arrows.length;
    if (total < 4) return;

    let budget;
    if (level === 1) budget = 1;
    else if (total <= 20) budget = rng() < 0.5 ? 2 : 3;
    else budget = Math.max(2, Math.floor(total / 10));
    if (isBoss) budget = Math.max(budget, 3);

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

    const eligible = this.RAW_CATALOG
      .map(r => this.MAP[r[0]])
      .filter(d => d.id !== 'lock' && d.minLvl <= Math.max(effLvl, level + 2));

    for (let i = eligible.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [eligible[i], eligible[j]] = [eligible[j], eligible[i]];
    }

    const margin = skill > 74 ? 2 : (skill > 50 ? 3 : 5);
    const maxBombs = Math.min(3, Math.max(1, Math.floor(budget / 3)));
    let bombsPlaced = 0, placed = 0, locksPlaced = 0;

    for (const def of eligible) {
      if (placed >= budget) break;

      if (def.role === 'bomb') {
        if (bombsPlaced >= maxBombs) continue;
        const cands = order.slice(1, Math.min(order.length, 16)).filter(id => !used.has(id));
        if (!cands.length) continue;
        const bId = cands[Math.floor(rng() * Math.min(6, cands.length))];
        const a = idMap.get(bId);
        const pos = order.indexOf(bId), d = depthMap.get(bId) || 1;
        a.type = def.id;
        a.bombMoves = Math.max(3, Math.max(d, Math.min(pos, d + 2)) + margin + (def.id === 'megaBomb' ? 2 : 0));
        used.add(bId); bombsPlaced++; placed++;
      } else if (def.role === 'key') {
        if (locksPlaced >= 1 || order.length < 8) continue;
        const kIdx = Math.floor(rng() * Math.max(1, Math.floor(order.length * 0.35)));
        const lIdx = Math.floor(order.length * 0.62) + Math.floor(rng() * Math.max(1, Math.floor(order.length * 0.32)));
        const kA = idMap.get(order[kIdx]), lA = idMap.get(order[Math.min(order.length - 1, lIdx)]);
        if (kA && lA && kA.id !== lA.id && !used.has(kA.id) && !used.has(lA.id)) {
          kA.type = 'key'; lA.type = 'lock'; lA.locked = true; lA.keyId = kA.id;
          used.add(kA.id); used.add(lA.id); locksPlaced++; placed++;
        }
      } else if (def.role === 'frozen') {
        const cands = order.slice(Math.floor(order.length * 0.38)).filter(id => !used.has(id));
        if (!cands.length) continue;
        const a = idMap.get(cands[Math.floor(rng() * cands.length)]);
        a.type = 'frozen';
        a.iceCount = Math.min(4, Math.max(2, Math.floor(order.length * 0.14)));
        used.add(a.id); placed++;
      } else if (def.role.startsWith('pierce') || def.role.startsWith('phase')) {
        const cands = arrows.filter(a => !used.has(a.id) && blockersCount(a) >= 1)
          .sort((x, y) => blockersCount(y) - blockersCount(x));
        if (!cands.length) continue;
        const pick = cands[Math.floor(rng() * Math.min(4, cands.length))];
        pick.type = def.id; used.add(pick.id); placed++;
      } else {
        if ((def.id === 'defuser' || def.id === 'fuseCut') && bombsPlaced === 0) continue;
        if (def.id === 'cryoBlast' && !arrows.some(x => x.type === 'frozen')) continue;
        const cands = arrows.filter(a => !used.has(a.id));
        if (!cands.length) continue;
        const pick = cands[Math.floor(rng() * cands.length)];
        pick.type = def.id; used.add(pick.id); placed++;
      }
    }
  },

  onRelease(game, arrow, res, isCascade) {
    const mp = arrow.pts[Math.floor(arrow.pts.length / 2)];
    const type = arrow.type;
    const idleOthers = () => game.lvl.arrows.filter(a => a.state === 'idle' && a.id !== arrow.id);
    const nearestOthers = (pt) => idleOthers().sort((a, b) =>
      Math.hypot(a.pts[0].x - pt.x, a.pts[0].y - pt.y) - Math.hypot(b.pts[0].x - pt.x, b.pts[0].y - pt.y)
    );
    const shatterList = (list, col, msg) => {
      list.forEach(t => game.shatterArrow(t, col));
      if (list.length && msg) game.spawnPopup(mp, msg, col);
    };
    const healOrCoins = (coinAlt = 25) => {
      if (game.hearts < 3) {
        game.hearts++;
        const h = document.getElementById('h' + game.hearts);
        h.classList.remove('lost', 'breaking'); h.classList.add('pop');
        setTimeout(() => h.classList.remove('pop'), 450);
        game.spawnPopup(mp, '❤️ +1', '#ec4899');
      } else {
        game.profile.coins += coinAlt;
        game.spawnPopup(mp, `+${coinAlt} 🪙`, '#fde047');
      }
    };

    if (res.sliced && res.sliced.length > 0) {
      AE.AudioFX.laser(); game.shake(0.24, 7);
      shatterList(res.sliced, '#c084fc', `⚡ SLICED x${res.sliced.length}!`);
    } else if (res.mode === 'blackhole') {
      AE.AudioFX.blackHole();
      game.spawnPopup({ x: res.bh.x + 0.5, y: res.bh.y + 0.5 }, '🌀', '#c084fc');
      game.spawnParticles(res.bh.x + 0.5, res.bh.y + 0.5, '#a855f7', 16);
    } else if (!arrow.isBulletFinal) {
      AE.AudioFX.slide(game.combo, game.theme.style);
    }

    switch (type) {
      case 'bomb':
        AE.AudioFX.coin(); game.profile.coins += 10;
        game.spawnPopup(mp, '💣 +10', '#22c55e');
        game.spawnParticles(mp.x, mp.y, '#22c55e', 16);
        break;
      case 'megaBomb':
        AE.AudioFX.win(); game.profile.coins += 35;
        game.spawnPopup(mp, '☢️ +35!', '#fde047');
        game.spawnParticles(mp.x, mp.y, '#fde047', 22);
        break;
      case 'defuser':
        AE.AudioFX.coin();
        idleOthers().filter(a => this.isBomb(a)).forEach(b => { b.bombMoves += 3; game.spawnPopup(b.pts[0], '+3 🧯', '#2dd4bf'); });
        break;
      case 'timeWarp':
        AE.AudioFX.coin();
        idleOthers().forEach(a => {
          if (this.isBomb(a)) { a.bombMoves += 2; game.spawnPopup(a.pts[0], '+2 ⏱️', '#38bdf8'); }
          if (this.isFrozen(a)) a.iceCount = Math.max(0, a.iceCount - 1);
        });
        break;
      case 'fuseCut': {
        const b = idleOthers().find(a => this.isBomb(a));
        if (b) { b.type = 'normal'; AE.AudioFX.coin(); game.spawnPopup(b.pts[0], '✂️ SAFE!', '#22c55e'); }
        break;
      }
      case 'c4Blast':
        AE.AudioFX.explode(); game.shake(0.28, 9);
        shatterList(nearestOthers(mp).slice(0, 2), '#fb923c', '🧨 C4 BLAST!');
        break;
      case 'railgun':
        AE.AudioFX.coin(); game.profile.coins += 20;
        game.spawnPopup(mp, '🔫 +20', '#67e8f9');
        break;
      case 'drill':
        shatterList(nearestOthers(mp).slice(0, 1), '#fbbf24', '🔩 DRILLED!');
        break;
      case 'katana':
        AE.AudioFX.coin(); game.profile.coins += 15;
        game.spawnPopup(mp, '⚔️ +15', '#fda4af');
        break;
      case 'shadowDash':
      case 'warpArrow': {
        const list = nearestOthers(mp).slice(0, 1);
        shatterList(list, '#a855f7', type === 'shadowDash' ? '🥷 DASH!' : '🌀 WARP!');
        break;
      }
      case 'nova':
      case 'superNova': {
        AE.AudioFX.laser(); game.shake(0.22, 6);
        let extra = 0;
        for (const o of idleOthers()) {
          const same = o.dir.x === arrow.dir.x && o.dir.y === arrow.dir.y;
          const opp = o.dir.x === -arrow.dir.x && o.dir.y === -arrow.dir.y;
          if ((same || (type === 'superNova' && opp)) && !this.isLocked(o) && !this.isFrozen(o)) {
            const r2 = game.checkEscape(o);
            if (r2.canExit) { game.releaseArrow(o, r2, true); extra++; }
          }
        }
        game.spawnPopup(mp, extra > 0 ? `🌟 x${extra + 1}!` : '🌟 NOVA!', '#38bdf8');
        break;
      }
      case 'colorBomb': {
        AE.AudioFX.laser(); game.shake(0.3, 9);
        const shuf = idleOthers().sort(() => Math.random() - 0.5).slice(0, 3);
        shatterList(shuf, '#f472b6', '🌈 COLOR BOMB!');
        break;
      }
      case 'rowBlast': {
        const hy = arrow.cells[arrow.cells.length - 1].y;
        const hits = idleOthers().filter(a => a.cells.some(c => c.y === hy)).slice(0, 3);
        AE.AudioFX.laser(); shatterList(hits, '#ef4444', '🚀 ROW BLAST!');
        break;
      }
      case 'colBlast': {
        const hx = arrow.cells[arrow.cells.length - 1].x;
        const hits = idleOthers().filter(a => a.cells.some(c => c.x === hx)).slice(0, 3);
        AE.AudioFX.laser(); shatterList(hits, '#f97316', '☄️ COL BLAST!');
        break;
      }
      case 'crossBlast': {
        const hc = arrow.cells[arrow.cells.length - 1];
        const hits = idleOthers().filter(a => a.cells.some(c => c.x === hc.x || c.y === hc.y)).slice(0, 3);
        AE.AudioFX.laser(); shatterList(hits, '#f43f5e', '✚ CROSS!');
        break;
      }
      case 'domino':
      case 'tsunami': {
        const limit = type === 'tsunami' ? 3 : 2;
        let launched = 0;
        for (const o of idleOthers()) {
          if (launched >= limit) break;
          if (!this.isLocked(o) && !this.isFrozen(o)) {
            const r2 = game.checkEscape(o);
            if (r2.canExit) { game.releaseArrow(o, r2, true); launched++; }
          }
        }
        if (launched) game.spawnPopup(mp, type === 'tsunami' ? `🌊 x${launched}!` : `🁢 CHAIN x${launched}!`, '#38bdf8');
        break;
      }
      case 'tornado':
        AE.AudioFX.laser(); shatterList(nearestOthers(mp).slice(0, 2), '#38bdf8', '🌪️ SWEPT!');
        break;
      case 'shockwave': {
        AE.AudioFX.laser(); game.shake(0.28, 8);
        const near = idleOthers().filter(a => Math.hypot(a.pts[0].x - mp.x, a.pts[0].y - mp.y) <= 3.2).slice(0, 3);
        shatterList(near.length ? near : nearestOthers(mp).slice(0, 2), '#60a5fa', '〰️ SHOCKWAVE!');
        break;
      }
      case 'vortexPull': {
        const short = idleOthers().sort((a, b) => a.cells.length - b.cells.length).slice(0, 2);
        AE.AudioFX.blackHole(); shatterList(short, '#ef4444', '🧲 MAGNET!');
        break;
      }
      case 'fire':
        shatterList(nearestOthers(mp).slice(0, 1), '#f97316', '🔥 MELTED!');
        break;
      case 'inferno':
      case 'solarFlare':
        idleOthers().forEach(a => { if (a.type === 'frozen') a.iceCount = 0; });
        AE.AudioFX.laser(); shatterList(nearestOthers(mp).slice(0, 2), '#f97316', type === 'inferno' ? '🌋 INFERNO!' : '☀️ SOLAR!');
        break;
      case 'electric':
      case 'thunderBolt': {
        const cnt = type === 'thunderBolt' ? 2 : 1;
        const z = idleOthers().sort(() => Math.random() - 0.5).slice(0, cnt);
        AE.AudioFX.laser(); shatterList(z, '#38bdf8', cnt > 1 ? '🌩️ STORM x2!' : '⚡ ZAPPED!');
        break;
      }
      case 'cryoBlast':
        AE.AudioFX.coin();
        idleOthers().forEach(a => { if (a.type === 'frozen') { a.iceCount = 0; game.spawnParticles(a.pts[0].x, a.pts[0].y, '#7dd3fc', 12); } });
        game.spawnPopup(mp, '🧊 THAWED ALL!', '#38bdf8');
        break;
      case 'acid':
        shatterList(nearestOthers(arrow.pts[0]).slice(0, 1), '#84cc16', '🧪 MELTED!');
        break;
      case 'venom': {
        const longest = idleOthers().sort((a, b) => b.cells.length - a.cells.length).slice(0, 1);
        shatterList(longest, '#22c55e', '🐍 VENOM!');
        break;
      }
      case 'key':
        AE.AudioFX.coin(); game.unlockByKey(arrow.id);
        break;
      case 'masterKey':
        AE.AudioFX.win();
        idleOthers().forEach(a => {
          if (a.type === 'lock') a.locked = false;
          if (a.type === 'frozen') a.iceCount = 0;
        });
        game.spawnPopup(mp, '🗝️ ALL UNLOCKED!', '#fde047');
        break;
      case 'crystal': {
        AE.AudioFX.coin(); game.profile.coins += 20;
        const one = idleOthers().sort(() => Math.random() - 0.5).slice(0, 1);
        shatterList(one, '#38bdf8', '💎 +20!');
        break;
      }
      case 'bonus':
        AE.AudioFX.coin(); healOrCoins(25);
        game.spawnParticles(mp.x, mp.y, '#fbbf24', 18);
        break;
      case 'treasure':
        AE.AudioFX.win(); game.profile.coins += 45;
        game.spawnPopup(mp, '💰 +45!', '#fde047');
        game.spawnParticles(mp.x, mp.y, '#fde047', 22);
        break;
      case 'heartHeal':
        AE.AudioFX.coin(); healOrCoins(30);
        break;
      case 'hintDrop':
        AE.AudioFX.coin(); game.profile.hints++;
        game.spawnPopup(mp, '💡 +1 HINT!', '#fde047');
        break;
      case 'hammerDrop':
        AE.AudioFX.coin(); game.profile.hammers++;
        game.spawnPopup(mp, '🔨 +1 HAMMER!', '#fb923c');
        break;
      case 'freezeDrop':
        AE.AudioFX.coin(); game.profile.freezes++;
        game.spawnPopup(mp, '⏳ +1 FREEZE!', '#38bdf8');
        break;
      case 'novaDrop':
        AE.AudioFX.coin(); game.profile.novas++;
        game.spawnPopup(mp, '💥 +1 BLAST!', '#c084fc');
        break;
      case 'iqBoost':
        AE.AudioFX.win();
        game.profile.iqScore = Math.min(175, game.profile.iqScore + 2);
        game.profile.coins += 20;
        game.spawnPopup(mp, '🧠 +2 IQ!', '#38bdf8');
        break;
      case 'luckyStar': {
        AE.AudioFX.win();
        const r = Math.random();
        if (r < 0.4) { game.profile.coins += 50; game.spawnPopup(mp, '🍀 +50!', '#4ade80'); }
        else if (r < 0.7) { game.profile.hints++; game.spawnPopup(mp, '🍀 +1 💡!', '#4ade80'); }
        else { shatterList(idleOthers().slice(0, 2), '#4ade80', '🍀 LUCKY x2!'); }
        break;
      }
      case 'crownApex':
        AE.AudioFX.win(); game.profile.coins += 60; healOrCoins(20);
        shatterList(nearestOthers(mp).slice(0, 2), '#fde047', '👑 APEX +60!');
        break;
      default:
        if (game.combo >= 4 && !isCascade && !arrow.isBulletFinal) {
          game.spawnPopup(mp, `🔥 x${game.combo}`, '#f97316');
        }
    }
  },

  getStyle(a, th) {
    let col = th.main, hi = th.hi, glow = null, alpha = 1;
    const def = this.getDef(a.type);
    if (def) {
      if (a.type === 'frozen' && a.iceCount <= 0) { /* normal */ }
      else if (a.type === 'lock' && !a.locked) { col = '#eab308'; hi = '#fef9c3'; }
      else {
        col = def.col; hi = def.hi; glow = def.glow;
        if (def.role.startsWith('phase') && a.state === 'idle') alpha = 0.80;
      }
    }
    if (a.flash > 0) { col = '#ef4444'; hi = '#fecaca'; }
    return { col, hi, glow, alpha };
  },

  getBadge(a) {
    const def = this.getDef(a.type);
    if (!def) return null;
    if (this.isBomb(a)) {
      return { txt: String(a.bombMoves), bg: a.bombMoves <= 2 ? '#dc2626' : def.bg, fg: '#fef08a', ring: '#ef4444' };
    }
    if (a.type === 'frozen') {
      return a.iceCount > 0 ? { txt: `❄${a.iceCount}`, bg: def.bg, fg: '#fff', ring: '#7dd3fc' } : null;
    }
    if (a.type === 'lock') {
      return a.locked ? { txt: '🔒', bg: def.bg, fg: '#fff', ring: '#94a3b8' } : null;
    }
    return { txt: def.ico, bg: def.bg, fg: '#fff', ring: def.hi };
  },

  getHintText(pick, esc) {
    const def = this.getDef(pick.type);
    const lang = (AE.Game && AE.Game.profile) ? AE.Game.profile.lang : 'en';
    if (def) return lang === 'hi' ? def.hiHint : def.enHint;
    if (esc.mode === 'blackhole') return AE.tr('hintBH');
    return AE.tr('hintNormal');
  }
};
