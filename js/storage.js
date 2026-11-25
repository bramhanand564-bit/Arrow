window.AE = window.AE || {};

AE.Vault = {
  DB_NAME: 'ArrowEscapePlayVault_v2',
  STORE: 'state',
  LS_KEY: 'arrow_escape_play_v2',
  db: null,

  openDB() {
    return new Promise(res => {
      if (!window.indexedDB) return res(null);
      try {
        const r = indexedDB.open(this.DB_NAME, 1);
        r.onupgradeneeded = e => {
          if (!e.target.result.objectStoreNames.contains(this.STORE))
            e.target.result.createObjectStore(this.STORE);
        };
        r.onsuccess = e => { this.db = e.target.result; res(this.db); };
        r.onerror = () => res(null);
      } catch { res(null); }
    });
  },

  idbGet(k) {
    return new Promise(res => {
      if (!this.db) return res(null);
      try {
        const tx = this.db.transaction(this.STORE, 'readonly');
        const r = tx.objectStore(this.STORE).get(k);
        r.onsuccess = () => res(r.result || null);
        r.onerror = () => res(null);
      } catch { res(null); }
    });
  },

  idbSet(k, v) {
    return new Promise(res => {
      if (!this.db) return res(false);
      try {
        const tx = this.db.transaction(this.STORE, 'readwrite');
        tx.objectStore(this.STORE).put(v, k);
        tx.oncomplete = () => res(true);
        tx.onerror = () => res(false);
      } catch { res(false); }
    });
  },

  createDefault() {
    return {
      currentLevel: 1,
      highestLevel: 1,
      coins: 120,
      hints: 3,
      hammers: 2,
      freezes: 2,
      novas: 1,
      lang: 'en',
      volume: 0.8,
      vibration: true,
      guideMode: 1,
      selectedTheme: 'auto',
      boughtThemes: [0],
      lastDailyDate: '',
      iqScore: 100,
      skillInternal: 45,
      levelsCompletedCount: 0,
      recentPerf: [],
      levelHistory: {},
      updatedAt: Date.now()
    };
  },

  async load() {
    await this.openDB();
    let ls = null, idb = null;
    try { const raw = localStorage.getItem(this.LS_KEY); if (raw) ls = JSON.parse(raw); } catch {}
    idb = await this.idbGet('profile');
    let data = (ls && idb) ? ((ls.updatedAt || 0) >= (idb.updatedAt || 0) ? ls : idb) : (ls || idb);
    const def = this.createDefault();
    data = data ? { ...def, ...data, levelHistory: { ...(data.levelHistory || {}) } } : def;
    await this.save(data);
    return data;
  },

  async save(data) {
    data.updatedAt = Date.now();
    try { localStorage.setItem(this.LS_KEY, JSON.stringify(data)); } catch {}
    await this.idbSet('profile', data);
  },

  async resetAll() {
    const fresh = this.createDefault();
    await this.save(fresh);
    return fresh;
  }
};
