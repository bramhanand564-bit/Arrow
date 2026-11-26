window.AE = window.AE || {};

function hexToRgb(hex) {
  const h = hex.replace('#', '');
  return {
    r: parseInt(h.slice(0, 2), 16),
    g: parseInt(h.slice(2, 4), 16),
    b: parseInt(h.slice(4, 6), 16)
  };
}

function isDarkHex(hex) {
  const { r, g, b } = hexToRgb(hex);
  return (r * 0.299 + g * 0.587 + b * 0.114) < 140;
}

AE.THEMES_50 = [
  // [Name, Background, AccentBg, ArrowMain, ArrowHi, DotColor, Style, CoinPrice]
  ['Classic Ink',      '#f8fafc', '#eef2f7', '#0f172a', '#475569', 'rgba(100,116,139,0.28)', 'ink',    0],
  ['Frost Glacier',    '#ecfeff', '#cffafe', '#0369a1', '#7dd3fc', 'rgba(14,165,233,0.26)',  'frost',  120],
  ['Solar Flare',      '#160a08', '#2a120a', '#f97316', '#fef08a', 'rgba(251,146,60,0.25)',  'fire',   150],
  ['Cyber Neon',       '#090d1f', '#131a3a', '#06b6d4', '#a5f3fc', 'rgba(56,189,248,0.24)',  'neon',   180],
  ['Royal Gold',       '#131814', '#1d2720', '#eab308', '#fef9c3', 'rgba(250,204,21,0.24)',  'gold',   200],
  ['Emerald Jade',     '#ecfdf5', '#d1fae5', '#047857', '#6ee7b7', 'rgba(16,185,129,0.25)',  'gloss',  220],
  ['Titanium Chrome',  '#111827', '#1f2937', '#cbd5e1', '#ffffff', 'rgba(148,163,184,0.25)', 'chrome', 240],
  ['Midnight Galaxy',  '#0c061c', '#1a0f38', '#a855f7', '#f0abfc', 'rgba(192,132,252,0.25)', 'neon',   260],
  ['Sakura Blossom',   '#fff1f2', '#ffe4e6', '#be123c', '#fda4af', 'rgba(244,63,94,0.24)',   'gloss',  280],
  ['Blood Moon',       '#18070a', '#2b0b11', '#ef4444', '#fca5a5', 'rgba(239,68,68,0.25)',   'fire',   300],
  ['Arctic Aurora',    '#071b1e', '#0d2e33', '#2dd4bf', '#ccfbf1', 'rgba(45,212,191,0.24)',  'frost',  320],
  ['Amber Sunset',     '#fffbeb', '#fef3c7', '#b45309', '#fde68a', 'rgba(217,119,6,0.24)',   'gold',   340],
  ['Obsidian Stealth', '#09090b', '#18181b', '#a1a1aa', '#f4f4f5', 'rgba(161,161,170,0.24)', 'chrome', 360],
  ['Cobalt Pulse',     '#eff6ff', '#dbeafe', '#1d4ed8', '#93c5fd', 'rgba(37,99,235,0.24)',   'gloss',  380],
  ['Venom Acid',       '#09170a', '#122b14', '#84cc16', '#ecfccb', 'rgba(132,204,22,0.25)',  'neon',   400],
  ['Copper Forge',     '#1a110d', '#2d1c15', '#ea580c', '#fed7aa', 'rgba(234,88,12,0.24)',   'chrome', 420],
  ['Lavender Mist',    '#faf5ff', '#f3e8ff', '#7e22ce', '#d8b4fe', 'rgba(147,51,234,0.24)',  'gloss',  440],
  ['Deep Ocean',       '#061529', '#0c2747', '#38bdf8', '#e0f2fe', 'rgba(56,189,248,0.24)',  'frost',  460],
  ['Dragon Scale',     '#170a0d', '#2c1118', '#f43f5e', '#fde047', 'rgba(244,63,94,0.25)',   'fire',   480],
  ['Ivory Marble',     '#faf8f2', '#f1ece0', '#78350f', '#fbbf24', 'rgba(180,83,9,0.22)',    'gold',   500],
  ['Plasma Violet',    '#120624', '#220b42', '#c026d3', '#f5d0fe', 'rgba(217,70,239,0.25)',  'neon',   520],
  ['Forest Moss',      '#0c1a12', '#152e20', '#22c55e', '#bbf7d0', 'rgba(34,197,94,0.24)',   'gloss',  540],
  ['Ruby Velvet',      '#1f0710', '#380d1d', '#e11d48', '#fecdd3', 'rgba(225,29,72,0.24)',   'gloss',  560],
  ['Diamond Dust',     '#f1f5f9', '#e2e8f0', '#334155', '#38bdf8', 'rgba(71,85,105,0.25)',   'chrome', 580],
  ['Desert Mirage',    '#fdf4e7', '#f7e4c8', '#9a3412', '#fdba74', 'rgba(194,65,12,0.24)',   'ink',    600],
  ['Electric Lime',    '#0d1908', '#172e0e', '#a3e635', '#ffffff', 'rgba(163,230,53,0.24)',  'neon',   620],
  ['Rose Quartz',      '#fdf2f8', '#fce7f3', '#db2777', '#fbcfe8', 'rgba(219,39,119,0.24)',  'gloss',  640],
  ['Volcanic Ash',     '#141212', '#262121', '#fb923c', '#ffedd5', 'rgba(251,146,60,0.23)',  'fire',   660],
  ['Sapphire Crown',   '#071029', '#0e1f4d', '#60a5fa', '#eff6ff', 'rgba(96,165,250,0.24)',  'chrome', 680],
  ['Mint Breeze',      '#f0fdfa', '#ccfbf1', '#0f766e', '#5eead4', 'rgba(20,184,166,0.24)',  'frost',  700],
  ['Golden Pharaoh',   '#1a1406', '#2e230a', '#facc15', '#ffffff', 'rgba(250,204,21,0.25)',  'gold',   720],
  ['Shadow Ninja',     '#070a0f', '#111824', '#64748b', '#e2e8f0', 'rgba(148,163,184,0.22)', 'chrome', 740],
  ['Coral Reef',       '#fff7ed', '#ffedd5', '#ea580c', '#fed7aa', 'rgba(249,115,22,0.24)',  'gloss',  760],
  ['Laser Synth',      '#14061f', '#260b3b', '#ec4899', '#38bdf8', 'rgba(236,72,153,0.25)',  'neon',   780],
  ['Iceberg Crystal',  '#f0f9ff', '#e0f2fe', '#0284c7', '#bae6fd', 'rgba(2,132,199,0.25)',   'frost',  800],
  ['Magma Core',       '#1c0705', '#330d09', '#f59e0b', '#fef08a', 'rgba(239,68,68,0.26)',   'fire',   820],
  ['Steel Matrix',     '#081412', '#102622', '#10b981', '#a7f3d0', 'rgba(16,185,129,0.25)',  'chrome', 840],
  ['Velvet Plum',      '#190a1e', '#2d1236', '#d946ef', '#fae8ff', 'rgba(217,70,239,0.24)',  'gloss',  860],
  ['Silver Lining',    '#f8fafc', '#e2e8f0', '#475569', '#94a3b8', 'rgba(100,116,139,0.26)', 'chrome', 880],
  ['Storm Thunder',    '#0b1120', '#16223d', '#facc15', '#fef9c3', 'rgba(250,204,21,0.24)',  'neon',   900],
  ['Matcha Zen',       '#f7fee7', '#ecfccb', '#3f6212', '#bef264', 'rgba(101,163,13,0.24)',  'ink',    920],
  ['Inferno Spark',    '#170907', '#2b100c', '#ef4444', '#fde047', 'rgba(249,115,22,0.26)',  'fire',   940],
  ['Pearl Satin',      '#fdfcfb', '#f3f1ed', '#1e293b', '#cbd5e1', 'rgba(100,116,139,0.24)', 'gold',   960],
  ['Cosmic Nebula',    '#09051a', '#160d38', '#818cf8', '#f0abfc', 'rgba(129,140,248,0.25)', 'neon',   980],
  ['Bronze Empire',    '#1c130b', '#302114', '#d97706', '#fde68a', 'rgba(217,119,6,0.24)',   'gold',  1000],
  ['Glacier Mint',     '#061c1c', '#0b3030', '#5eead4', '#ffffff', 'rgba(94,234,212,0.24)',  'frost', 1050],
  ['Crimson Blade',    '#fff1f2', '#ffe4e6', '#9f1239', '#fb7185', 'rgba(190,18,60,0.24)',   'chrome',1100],
  ['Solar Eclipse',    '#05050a', '#121224', '#fbbf24', '#ffffff', 'rgba(251,191,36,0.24)',  'fire',  1200],
  ['Prism Infinity',   '#0b1021', '#172042', '#38bdf8', '#f472b6', 'rgba(56,189,248,0.25)',  'neon',  1300],
  ['Apex Legend',      '#141008', '#261e0e', '#fde047', '#ffffff', 'rgba(253,224,71,0.28)',  'gold',  1500]
].map((t, idx) => ({
  idx, name: t[0], bg: t[1], bg2: t[2], main: t[3], hi: t[4], dot: t[5], style: t[6], price: t[7],
  isDark: isDarkHex(t[1]),
  unlockLevel: idx === 0 ? 1 : idx * 10 + 1
}));

AE.isThemeUnlocked = function(profile, idx) {
  return profile.highestLevel >= AE.THEMES_50[idx].unlockLevel || profile.boughtThemes.includes(idx);
};

AE.getActiveTheme = function(profile, level) {
  if (profile.selectedTheme !== 'auto') {
    const i = Number(profile.selectedTheme);
    if (AE.THEMES_50[i] && AE.isThemeUnlocked(profile, i)) return AE.THEMES_50[i];
  }
  const autoIdx = Math.floor((level - 1) / 10) % AE.THEMES_50.length;
  return AE.THEMES_50[autoIdx];
};

// Dynamically themes the ENTIRE Power Dock, Top HUD, Win Screen & Settings!
AE.applyThemeUI = function(th) {
  const r = document.documentElement.style;
  const ac = hexToRgb(th.main);
  const bg = hexToRgb(th.bg2);

  if (th.isDark) {
    r.setProperty('--ui-panel', `rgba(${Math.min(255, bg.r + 14)}, ${Math.min(255, bg.g + 16)}, ${Math.min(255, bg.b + 24)}, 0.84)`);
    r.setProperty('--ui-dock', `rgba(${Math.min(255, bg.r + 10)}, ${Math.min(255, bg.g + 12)}, ${Math.min(255, bg.b + 20)}, 0.88)`);
    r.setProperty('--ui-btn', `rgba(${Math.min(255, bg.r + 24)}, ${Math.min(255, bg.g + 28)}, ${Math.min(255, bg.b + 38)}, 0.94)`);
    r.setProperty('--ui-modal', `rgba(${Math.min(255, bg.r + 12)}, ${Math.min(255, bg.g + 15)}, ${Math.min(255, bg.b + 24)}, 0.96)`);
    r.setProperty('--ui-card-sub', `rgba(255, 255, 255, 0.08)`);
    r.setProperty('--ui-text', '#f8fafc');
    r.setProperty('--ui-muted', 'rgba(203, 213, 225, 0.72)');
    r.setProperty('--ui-border', `rgba(${ac.r}, ${ac.g}, ${ac.b}, 0.36)`);
    r.setProperty('--ui-accent', th.main);
    r.setProperty('--ui-accent2', th.bg2);
    r.setProperty('--ui-glow', `rgba(${ac.r}, ${ac.g}, ${ac.b}, 0.32)`);
  } else {
    r.setProperty('--ui-panel', `rgba(${Math.min(255, bg.r + 16)}, ${Math.min(255, bg.g + 16)}, ${Math.min(255, bg.b + 16)}, 0.92)`);
    r.setProperty('--ui-dock', `rgba(${Math.min(255, bg.r + 18)}, ${Math.min(255, bg.g + 18)}, ${Math.min(255, bg.b + 18)}, 0.94)`);
    r.setProperty('--ui-btn', '#ffffff');
    r.setProperty('--ui-modal', `rgba(${Math.min(255, bg.r + 20)}, ${Math.min(255, bg.g + 20)}, ${Math.min(255, bg.b + 20)}, 0.97)`);
    r.setProperty('--ui-card-sub', `rgba(${ac.r}, ${ac.g}, ${ac.b}, 0.08)`);
    r.setProperty('--ui-text', '#0f172a');
    r.setProperty('--ui-muted', '#64748b');
    r.setProperty('--ui-border', `rgba(${ac.r}, ${ac.g}, ${ac.b}, 0.22)`);
    r.setProperty('--ui-accent', th.idx === 0 ? '#2563eb' : th.main);
    r.setProperty('--ui-accent2', th.idx === 0 ? '#1d4ed8' : th.main);
    r.setProperty('--ui-glow', `rgba(${ac.r}, ${ac.g}, ${ac.b}, 0.22)`);
  }
};

// Sleek Dark Royal Glass UI when on Home / Levels Screen
AE.resetHomeThemeUI = function() {
  AE.applyThemeUI(AE.THEMES_50[3]); // Cyber Navy Glass matches Home Screen
};
