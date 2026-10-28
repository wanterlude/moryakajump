  var WIND_WARN_END = 80;
  var wind = {
    force: 0,
    dir: 0,
    phase: "rest",
    // 'rest' | 'warn' | 'gust'
    timer: 0,
    // сколько длится текущая пауза
    nextAt: 340,
    // сколько пауза должна длиться
    gustLeft: 0,
    // сколько осталось дуть
    warn: 0,
    // сколько осталось телеграфа
    active: false
  };
  function windProgress() {
    const span = Math.max(1, WIND_FULL_SCORE - WIND_FROM_SCORE);
    return Math.max(0, Math.min(1, (player.score - WIND_FROM_SCORE) / span));
  }
  function windStrength() {
    return WIND_STRENGTH_MIN + (WIND_STRENGTH_MAX - WIND_STRENGTH_MIN) * windProgress();
  }
  function windRestFrames() {
    const p = windProgress();
    const lo = WIND_REST_LONG_MIN + (WIND_REST_FAST_MIN - WIND_REST_LONG_MIN) * p;
    const hi = WIND_REST_LONG_MAX + (WIND_REST_FAST_MAX - WIND_REST_LONG_MAX) * p;
    return lo + Math.random() * (hi - lo);
  }
  function windWarnFrames() {
    return Math.round(WIND_WARN_START + (WIND_WARN_END - WIND_WARN_START) * windProgress());
  }
  function windGustFrames() {
    const p = windProgress();
    const lo = WIND_GUST_LONG_MIN + (WIND_GUST_FAST_MIN - WIND_GUST_LONG_MIN) * p;
    const hi = WIND_GUST_LONG_MAX + (WIND_GUST_FAST_MAX - WIND_GUST_LONG_MAX) * p;
    return lo + Math.random() * (hi - lo);
  }
  function resetWind() {
    wind.force = 0;
    wind.dir = 0;
    wind.phase = "rest";
    wind.timer = 0;
    wind.warn = 0;
    wind.gustLeft = 0;
    wind.nextAt = 340;
    wind.active = false;
  }
  function updateWind(dt) {
    const wasActive = wind.active;
    // Во время боя с боссом ветер выключен: он уже снят на входе и не должен
    // включаться заново, пока бой идёт.
    const windAllowed = bossState.phase === "idle";
    wind.active = windAllowed && player.score >= WIND_FROM_SCORE && !windSuppressedByPerk();
    if (!wind.active) {
      wind.force = 0;
      wind.dir = 0;
      wind.phase = "rest";
      wind.timer = 0;
      wind.warn = 0;
      wind.gustLeft = 0;
      return;
    }
    if (!wasActive) {
      wind.phase = "rest";
      wind.timer = 0;
      wind.warn = 0;
      wind.force = 0;
      wind.gustLeft = 0;
      wind.nextAt = 110 + Math.random() * 70;
    }
    if (wind.phase === "warn") {
      wind.warn = Math.max(0, wind.warn - dt);
      if (wind.warn === 0) {
        wind.phase = "gust";
        wind.gustLeft = windGustFrames();
      }
    } else if (wind.phase === "gust") {
      wind.gustLeft = Math.max(0, wind.gustLeft - dt);
      if (wind.gustLeft === 0) {
        wind.phase = "rest";
        wind.timer = 0;
        wind.nextAt = windRestFrames();
      }
    } else {
      wind.timer += dt;
      if (wind.timer >= wind.nextAt) {
        wind.dir = Math.random() < 0.5 ? -1 : 1;
        wind.warn = windWarnFrames();
        wind.phase = "warn";
      }
    }
    const target = wind.phase === "gust" ? wind.dir : 0;
    const accel = 0.06 + windProgress() * 0.07;
    wind.force += (target - wind.force) * Math.min(1, accel * dt);
  }
  function applyWind(dt) {
    const blizzard = eventActive("blizzard") ? Math.sin(performance.now() / 900) * 2.6 : 0;
    if (!wind.active && !blizzard) return;
    player.x += ((wind.active ? wind.force * windStrength() : 0) + blizzard) * dt;
  }
  var COINS_PER_LIFE = 25;
  var COIN_MAGNET_RADIUS = 38;
  var PERK_SCORE_STEP = 1e4;
  function newPerkMods() {
    const mods = {};
    for (const key of Object.keys(PERK_NEUTRAL)) {
      mods[key] = { layers: [] };
    }
    return mods;
  }
  var perkState = {
    mods: newPerkMods(),
    active: [],
    coinMultiplier: 0,
    // 0 — ×1, 1 — ×2, 2 — ×3, 4 — ×5
    coinUntil: 0,
    // до каких очков действует множитель монет       // сколько спасений от падения в запасе
    lastOfferScore: 0,
    offering: false,
    offerCards: [],
    offerReadyAt: 0,
    pickedAt: 0,
    pickedIndex: -1,
    rerolls: 0
    // сколько раз перекрутили текущую раздачу
  };
  function resetPerks() {
    perkState.mods = newPerkMods();
    perkState.active.length = 0;
    perkState.coinMultiplier = 0;
    perkState.coinUntil = 0;
    perkState.lastOfferScore = 0;
    perkState.offering = false;
    perkState.offerCards = [];
    perkState.offerReadyAt = 0;
    perkState.pickedAt = 0;
    perkState.pickedIndex = -1;
    perkState.rerolls = 0;
  }
  function perkValue(key) {
    const mod = perkState.mods[key];
    const neutral = PERK_NEUTRAL[key];
    if (!mod || !mod.layers.length) return neutral;
    const score = player.score;
    let result = neutral;
    for (const layer of mod.layers) {
      if (score >= layer.until) continue;
      result = neutral === 0 ? result + layer.v : result * layer.v;
    }
    return result;
  }
  var perkGravityScale = () => perkValue("gravity");
  var perkBounceScale = () => perkValue("bounce");
  var perkSpringScale = () => perkValue("spring");
  var perkWidthScale = () => perkValue("width");
  var perkGapScale = () => perkValue("gap");
  var perkAccelScale = () => perkValue("accel");
  var perkFrictionScale = () => perkValue("friction");
  var perkBirdScale = () => perkValue("bird");
  var perkMagnetScale = () => perkValue("magnet");
  var perkShakeScale = () => perkValue("shake");
  var fallGuardActive = () => perkValue("guard") > 0;
  var invulnerableActive = () => perkValue("invuln") > 0;
  var ghostActive = () => perkValue("ghost") > 0;
  var windSuppressedByPerk = () => perkValue("calm") > 0;
  function coinsPerLife() {
    const custom = perkValue("coinLife");
    return custom > 0 ? custom : COINS_PER_LIFE;
  }
  function rollPerkRarity() {
    const roll = Math.random();
    let acc = 0;
    for (const rarity of PERK_RARITY_ORDER) {
      acc += PERK_RARITY_WEIGHTS[rarity];
      if (roll < acc) return rarity;
    }
    return "common";
  }
  function rollPerkOffer() {
    const used = /* @__PURE__ */ new Set();
    for (const a of perkState.active) used.add(a.id);
    const cards = [];
    for (let slot = 0; slot < 3; slot++) {
      let picked = null;
      for (let attempt = 0; attempt < 12 && !picked; attempt++) {
        const rarity = rollPerkRarity();
        const pool = PERK_DEFS.filter((p) => p.rarity === rarity && !used.has(p.id));
        if (pool.length) picked = pool[Math.floor(Math.random() * pool.length)];
      }
      if (!picked) {
        const pool = PERK_DEFS.filter((p) => !used.has(p.id));
        if (pool.length) picked = pool[Math.floor(Math.random() * pool.length)];
      }
      if (picked) {
        used.add(picked.id);
        cards.push(picked);
      }
    }
    return cards;
  }
  function applyPerk(perk) {
    const score = Math.floor(player.score);
    for (const [key, value, span] of perk.mods || []) {
      const mod = perkState.mods[key];
      if (!mod) continue;
      mod.layers.push({ v: value, until: score + span });
    }
    if (perk.coins) {
      perkState.coinMultiplier = perk.coins.mult;
      perkState.coinUntil = score + perk.coins.span;
    }
    if (perk.lives) {
      lives += perk.lives;
      hudState.lifePulse = 1;
    }
    if (perk.coinsNow) {
      const perLife = coinsPerLife();
      const livesBefore = Math.floor(runCoins / perLife);
      runCoins += perk.coinsNow;
      bankCoins += perk.coinsNow;
      stats.coins += perk.coinsNow;
      const livesGained = Math.floor(runCoins / perLife) - livesBefore;
      if (livesGained > 0) {
        lives += livesGained;
        hudState.lifePulse = 1;
      }
      hudState.coinPulse = 1;
    }
    const spans = (perk.mods || []).map(([, , span]) => span);
    if (perk.coins) spans.push(perk.coins.span);
    if (spans.length) {
      const timedUntil = score + Math.max(...spans);
      const already = perkState.active.find((a) => a.id === perk.id);
      if (already) {
        already.until = timedUntil;
        already.from = score;
      } else {
        perkState.active.push({
          id: perk.id,
          icon: perk.icon,
          title: perk.title,
          rarity: perk.rarity,
          until: timedUntil,
          from: score
        });
      }
    }
    const info = PERK_RARITY[perk.rarity] || PERK_RARITY.common;
    hudPop(player.x + 15, player.y - 26, perk.title, info.color);
    saveProgress();
  }
  var questState = {
    active: null,
    progress: 0,
    done: false,
    failed: false,
    springUsed: false,
    birdHit: false,
    doneAt: 0
  };
  var QUEST_DONE_SHOW_MS = 5e3;
  var QUEST_DONE_FADE_MS = WORLD_H;
  function resetQuests() {
    const pick = QUEST_DEFS[Math.floor(Math.random() * QUEST_DEFS.length)];
    questState.active = pick;
    questState.progress = 0;
    questState.done = false;
    questState.failed = false;
    questState.failedAt = 0;
    questState.springUsed = false;
    questState.birdHit = false;
    questState.doneAt = 0;
  }
  function questFailedNow() {
    if (!questState.active || questState.done || questState.failed) return false;
    const id = questState.active.id;
    if (id === "noSpring" && questState.springUsed) return true;
    if (id === "noBird" && questState.birdHit) return true;
    return false;
  }
  function updateQuests(dt) {
    const quest = questState.active;
    if (!quest || questState.done) return;
    if (questFailedNow()) {
      questState.failed = true;
      questState.failedAt = performance.now();
      hudPop(player.x + 15, player.y - 24, "\u0417\u0410\u0414\u0410\u041D\u0418\u0415 \u041F\u0420\u041E\u0412\u0410\u041B\u0415\u041D\u041E", "#e63946");
      return;
    }
    questState.progress = quest.id === "coins" ? runCoins : Math.floor(player.score);
    if (questState.progress >= quest.target) {
      questState.done = true;
      questState.doneAt = performance.now();
      bankCoins += quest.reward;
      saveProgress();
      hudState.coinPulse = 1;
      hudPop(player.x + 15, player.y - 24, `+${quest.reward} \u0417\u0410 \u0417\u0410\u0414\u0410\u041D\u0418\u0415`, "#0f8a76");
    }
  }
  var sound = { ctx: null, enabled: true, master: null };
  function initSound() {
    if (sound.ctx) return sound.ctx;
    const Ctor = window.AudioContext || window.webkitAudioContext;
    if (!Ctor) return null;
    try {
      sound.ctx = new Ctor();
      sound.master = sound.ctx.createGain();
      let vol = 100;
      try { const raw = localStorage.getItem("morjakaVolume"); if (raw !== null) vol = Number(raw); } catch {}
      sound.master.gain.value = 0.05 * (Math.max(0, Math.min(100, Number.isFinite(vol) ? vol : 100)) / 100);
      sound.master.connect(sound.ctx.destination);
    } catch {
      sound.ctx = null;
    }
    return sound.ctx;
  }
  function playTone(freqFrom, freqTo, duration, type = "sine", volume = 1) {
    if (!sound.enabled) return;
    const ac = initSound();
    if (!ac) return;
    if (ac.state === "suspended") ac.resume();
    try {
      const t0 = ac.currentTime;
      const osc = ac.createOscillator();
      const gain = ac.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freqFrom, t0);
      osc.frequency.exponentialRampToValueAtTime(Math.max(30, freqTo), t0 + duration);
      gain.gain.setValueAtTime(1e-4, t0);
      gain.gain.exponentialRampToValueAtTime(volume, t0 + 0.012);
      gain.gain.exponentialRampToValueAtTime(1e-4, t0 + duration);
      osc.connect(gain);
      if (sound.master) {
        if (sound.master) gain.connect(sound.master);
      }
      osc.start(t0);
      osc.stop(t0 + duration + 0.02);
    } catch {
    }
  }