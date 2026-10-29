  function normalizeNick(raw) {
    return String(raw ?? "").replace(/[\u0000-\u001f\u007f]/g, " ").replace(/\s+/g, " ").trim().slice(0, NICK_MAX_LENGTH);
  }
  function saveNick(value) {
    playerNick = normalizeNick(value);
    try {
      if (playerNick) localStorage.setItem("morjakaNick", playerNick);
      else localStorage.removeItem("morjakaNick");
    } catch {
    }
    if (typeof syncSideSettings === "function") syncSideSettings();
  }
  function getUnlockedAvatars(score) {
    return AVATAR_SCORES.map((required, index) => ({ required, index })).filter((item) => score >= item.required).map((item) => item.index);
  }
  var unlockedAvatars = getUnlockedAvatars(highScore);
  var selectedAvatar = readStoredNumber("morjakaSelectedCharacter");
  if (!Number.isInteger(selectedAvatar) || selectedAvatar < 0 || selectedAvatar >= avatarImages.length || !unlockedAvatars.includes(selectedAvatar)) {
    selectedAvatar = 0;
  }
  function readStoredRecord(key) {
    try {
      const raw = JSON.parse(localStorage.getItem(key) || "{}");
      return raw && typeof raw === "object" && !Array.isArray(raw) ? raw : {};
    } catch {
      return {};
    }
  }
  var platformOwned = {};
  var platformSelected = {};
  {
    const ownedRaw = readStoredRecord("morjakaPlatformOwned");
    const selRaw = readStoredRecord("morjakaPlatformSelected");
    for (const type of PLATFORM_TYPES) {
      const base = baseSkinId(type);
      const list = Array.isArray(ownedRaw[type]) ? ownedRaw[type].filter((id) => PLATFORM_SKIN_BY_ID[id] && PLATFORM_SKIN_BY_ID[id].type === type) : [];
      platformOwned[type] = [base, ...list.filter((id) => id !== base)];
      const sel = selRaw[type];
      platformSelected[type] = typeof sel === "string" && platformOwned[type].includes(sel) ? sel : base;
    }
  }
  var selectedFrame = Number(localStorage.getItem("morjakaSelectedFrame")) || 0;
  var ownedFrames = readStoredArray("morjakaOwnedFrames", [0]);
  if (!FRAMES.some((frame) => frame.id === selectedFrame)) selectedFrame = 0;
  if (!ownedFrames.includes(0)) ownedFrames = [0, ...ownedFrames];

  // ===== 0.8: статистика, достижения и журнал боссов =====
  function defaultStats() {
    return {
      runs: 0,
      coins: 0,
      platforms: 0,
      playMs: 0,
      bossWins: [0, 0, 0, 0, 0],
      bossTries: [0, 0, 0, 0, 0],
      trainWins: [0, 0, 0, 0, 0],
      trainTries: [0, 0, 0, 0, 0],
      characterRuns: {}
    };
  }
  function loadStats() {
    try {
      const raw = JSON.parse(localStorage.getItem("morjakaStats") || "null");
      if (!raw || typeof raw !== "object") return defaultStats();
      const out = defaultStats();
      const num = (v) => Math.max(0, Math.floor(Number(v) || 0));
      out.runs = num(raw.runs);
      out.coins = num(raw.coins);
      out.platforms = num(raw.platforms);
      out.playMs = num(raw.playMs);
      for (const key of ["bossWins", "bossTries", "trainWins", "trainTries"]) {
        if (Array.isArray(raw[key])) for (let i = 0; i < 5; i++) out[key][i] = num(raw[key][i]);
      }
      if (raw.characterRuns && typeof raw.characterRuns === "object") {
        for (const key in raw.characterRuns) {
          if (Object.prototype.hasOwnProperty.call(raw.characterRuns, key)) out.characterRuns[key] = num(raw.characterRuns[key]);
        }
      }
      return out;
    } catch {
      return defaultStats();
    }
  }
  var stats = loadStats();
  var achievementsClaimed = readStoredArray("morjakaAchievements", []).filter((id) => typeof id === "string");
  function saveStats() {
    try { localStorage.setItem("morjakaStats", JSON.stringify(stats)); } catch {}
  }
  function formatPlayTime(ms) {
    const total = Math.max(0, Math.floor(ms / 1000));
    const h = Math.floor(total / 3600);
    const m = Math.floor(total % 3600 / 60);
    const s = total % 60;
    if (h > 0) return h + " ч " + m + " мин";
    if (m > 0) return m + " мин " + s + " с";
    return s + " с";
  }
  var ACHIEVEMENT_DEFS = [
    { id: "first_run", name: "ПЕРВЫЙ ШАГ", desc: "Заверши первый забег", reward: 5, check: () => stats.runs >= 1, progress: () => [Math.min(stats.runs, 1), 1] },
    { id: "score_500", name: "РАЗБЕГ", desc: "Набери 500 очков", reward: 5, check: () => highScore >= 500, progress: () => [Math.min(highScore, 500), 500] },
    { id: "score_5000", name: "ВЫСОТА", desc: "Набери 5 000 очков", reward: 10, check: () => highScore >= 5000, progress: () => [Math.min(highScore, 5000), 5000] },
    { id: "score_25000", name: "К НЕБУ", desc: "Набери 25 000 очков", reward: 20, check: () => highScore >= 25000, progress: () => [Math.min(highScore, 25000), 25000] },
    { id: "coins_100", name: "КЛАДОВАЯ", desc: "Собери 100 монет", reward: 10, check: () => stats.coins >= 100, progress: () => [Math.min(stats.coins, 100), 100] },
    { id: "coins_1000", name: "ЗОЛОТО", desc: "Собери 1 000 монет", reward: 20, check: () => stats.coins >= 1000, progress: () => [Math.min(stats.coins, 1000), 1000] },
    { id: "platforms_100", name: "ПЕРВЫЕ СТУПЕНИ", desc: "Приземлись на 100 платформ", reward: 10, check: () => stats.platforms >= 100, progress: () => [Math.min(stats.platforms, 100), 100] },
    { id: "platforms_1000", name: "ЛЕДЯНАЯ ЛЕСТНИЦА", desc: "Приземлись на 1 000 платформ", reward: 20, check: () => stats.platforms >= 1000, progress: () => [Math.min(stats.platforms, 1000), 1000] },
    { id: "first_boss", name: "ПОБЕДИТЕЛЬ", desc: "Победи первого босса", reward: 15, check: () => stats.bossWins.some((n) => n > 0), progress: () => [stats.bossWins.some((n) => n > 0) ? 1 : 0, 1] },
    { id: "all_bosses", name: "ЦАРЬ СТУЖИ", desc: "Победи всех пятерых боссов", reward: 30, check: () => stats.bossWins.every((n) => n > 0), progress: () => [stats.bossWins.filter((n) => n > 0).length, 5] },
    { id: "daily_7", name: "ПРИВЫЧКА", desc: "7 дней ежедневной серии", reward: 20, check: () => dailyState.streak >= 7, progress: () => [Math.min(dailyState.streak, 7), 7] },
    { id: "frames_10", name: "КОЛЛЕКЦИОНЕР", desc: "Открой 10 рамок", reward: 10, check: () => ownedFrames.filter((id) => id !== 0).length >= 10, progress: () => [Math.min(ownedFrames.filter((id) => id !== 0).length, 10), 10] },
    { id: "characters_10", name: "ДРУЖНАЯ КОМАНДА", desc: "Открой 10 персонажей", reward: 15, check: () => unlockedAvatars.length >= 10, progress: () => [Math.min(unlockedAvatars.length, 10), 10] },
    { id: "play_1h", name: "СТАРЫЙ МОРЯКА", desc: "Проведи в игре час", reward: 20, check: () => stats.playMs >= 3600000, progress: () => [Math.min(stats.playMs, 3600000), 3600000] },
    { id: "runs_25", name: "НЕ СДАВАЙСЯ", desc: "Заверши 25 забегов", reward: 15, check: () => stats.runs >= 25, progress: () => [Math.min(stats.runs, 25), 25] }
  ];
  function checkAchievements(announce) {
    let gained = 0;
    let count = 0;
    let lastName = "";
    for (const achievement of ACHIEVEMENT_DEFS) {
      if (achievementsClaimed.includes(achievement.id)) continue;
      let unlocked = false;
      try { unlocked = achievement.check(); } catch {}
      if (!unlocked) continue;
      achievementsClaimed.push(achievement.id);
      bankCoins += achievement.reward;
      gained += achievement.reward;
      count++;
      lastName = achievement.name;
    }
    if (!count) return 0;
    saveProgress();
    if (announce !== false) {
      const text = count === 1 ? lastName : "ДОСТИЖЕНИЙ: " + count;
      if (currentState === STATE.MENU) setMenuMessage("ДОСТИЖЕНИЕ", text + " · +" + gained + " МОНЕТ");
      else hudPop(WORLD_W / 2, 210, "ДОСТИЖЕНИЕ +" + gained, "#c28000");
    }
    return gained;
  }

  var DAILY_DEFS = [
    { id: "coins", short: "МОНЕТЫ", label: "СОБЕРИ 30 МОНЕТ", target: 30, reward: 25 },
    { id: "height", short: "ВЫСОТА", label: "ПОДНИМИСЬ НА 20000", target: 20000, reward: 25 },
    { id: "boss", short: "БОСС", label: "ПОБЕДИ БОССА", target: 1, reward: 30 },
    { id: "platforms", short: "ПЛАТФОРМЫ", label: "ПРИЗЕМЛИСЬ НА 120 ПЛАТФОРМ", target: 120, reward: 25 },
    { id: "runs", short: "ЗАБЕГИ", label: "ЗАВЕРШИ 2 ЗАБЕГА", target: 2, reward: 20 },
    { id: "events", short: "СОБЫТИЕ", label: "ПОПАДИ В СОБЫТИЕ", target: 1, reward: 25 }
  ];
  // localDateKey, yesterdayDateKey и dailyHash живут в src/game/daily-date.ts.
  function dailyPick(dateKey, avoidId) {
    let index = dailyHash(dateKey) % DAILY_DEFS.length;
    if (DAILY_DEFS.length > 1 && DAILY_DEFS[index].id === avoidId) index = (index + 1) % DAILY_DEFS.length;
    return DAILY_DEFS[index];
  }
  var dailyState = {
    date: readStoredText("morjakaDailyDate", ""),
    id: readStoredText("morjakaDailyId", ""),
    progress: readStoredNumber("morjakaDailyProgress"),
    done: readStoredNumber("morjakaDailyDone") === 1,
    streak: readStoredNumber("morjakaDailyStreak"),
    lastDone: readStoredText("morjakaDailyLastDone", "")
  };
  function dailyDef() {
    for (const def of DAILY_DEFS) if (def.id === dailyState.id) return def;
    return null;
  }
  function initDaily(force) {
    const today = localDateKey();
    if (!force && dailyState.date === today && dailyDef()) return;
    const def = dailyPick(today, dailyState.id);
    dailyState.date = today;
    dailyState.id = def.id;
    dailyState.progress = 0;
    dailyState.done = false;
    if (dailyState.lastDone !== today && dailyState.lastDone !== yesterdayDateKey()) dailyState.streak = 0;
    saveProgress();
  }
  function dailyComplete() {
    const def = dailyDef();
    if (!def || dailyState.done) return;
    const today = localDateKey();
    dailyState.done = true;
    dailyState.progress = def.target;
    dailyState.streak = dailyState.lastDone === yesterdayDateKey() ? dailyState.streak + 1 : 1;
    dailyState.lastDone = today;
    bankCoins += def.reward;
    checkAchievements();
    saveProgress();
    hudState.coinPulse = 1;
    hudPop(player.x + 15, player.y - 26, "ЕЖЕДНЕВНОЕ ВЫПОЛНЕНО", "#0f8a76");
    hudPop(player.x + 15, player.y - 40, "+" + def.reward + " МОНЕТ", "#c28000");
    sfx.coin();
  }
  function dailyAdd(id, amount) {
    const def = dailyDef();
    if (!def || dailyState.done || def.id !== id || amount <= 0) return;
    dailyState.progress = Math.min(def.target, dailyState.progress + amount);
    if (dailyState.progress >= def.target) dailyComplete();
    else saveProgress();
  }
  function dailyMax(id, value) {
    const def = dailyDef();
    if (!def || dailyState.done || def.id !== id) return;
    const before = dailyState.progress;
    dailyState.progress = Math.max(before, Math.min(def.target, value));
    if (dailyState.progress >= def.target) dailyComplete();
    else if (Math.floor(dailyState.progress / 250) !== Math.floor(before / 250)) saveProgress();
  }
  var savedProgress = /* @__PURE__ */ new Map();
  function saveProgress() {
    const next = {
      morjakaBankCoins: String(bankCoins),
      morjakaUnlockedCharacters: JSON.stringify(unlockedAvatars),
      morjakaSelectedCharacter: String(selectedAvatar),
      doodleHighScore: String(highScore),
      morjakaOwnedFrames: JSON.stringify(ownedFrames),
      morjakaSelectedFrame: String(selectedFrame),
      morjakaPlatformOwned: JSON.stringify(platformOwned),
      morjakaPlatformSelected: JSON.stringify(platformSelected),
      morjakaDailyDate: dailyState.date,
      morjakaDailyId: dailyState.id,
      morjakaDailyProgress: String(dailyState.progress),
      morjakaDailyDone: dailyState.done ? "1" : "0",
      morjakaDailyStreak: String(dailyState.streak),
      morjakaDailyLastDone: dailyState.lastDone,
      morjakaStats: JSON.stringify(stats),
      morjakaAchievements: JSON.stringify(achievementsClaimed)
    };
    try {
      for (const key in next) {
        const value = next[key];
        if (savedProgress.get(key) === value) continue;
        localStorage.setItem(key, value);
        savedProgress.set(key, value);
      }
    } catch (error) {
      console.warn("\u041D\u0435 \u0443\u0434\u0430\u043B\u043E\u0441\u044C \u0441\u043E\u0445\u0440\u0430\u043D\u0438\u0442\u044C \u043F\u0440\u043E\u0433\u0440\u0435\u0441\u0441:", error);
    }
  }
  var player = { x: 185, y: 500, vx: 0, dy: 0, score: 0 };
  var squash = 0;
  var fallCooldown = 0;
  var WIND_FROM_SCORE = 1e4;
  // Пик ветра — на 140 000, сила растёт до 4,8 px/кадра (было 5,8 к 100 000).
  var WIND_FULL_SCORE = 14e4;
  var WIND_STRENGTH_MIN = 0.9;
  var WIND_STRENGTH_MAX = 4.8;
  var WIND_REST_LONG_MIN = 750;
  var WIND_REST_LONG_MAX = 1050;
  var WIND_REST_FAST_MIN = 90;
  var WIND_REST_FAST_MAX = 180;
  var WIND_GUST_LONG_MIN = 210;
  var WIND_GUST_LONG_MAX = 330;
  var WIND_GUST_FAST_MIN = 75;
  var WIND_GUST_FAST_MAX = 130;
  var WIND_WARN_START = 130;