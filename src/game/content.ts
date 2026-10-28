/**
 * Контент: биомы, птицы, задания и перки.
 *
 * Чистые данные без поведения. Каталог рамок сюда не входит: FRAMES собирается из
 * EXTRA_FRAMES, объявленных позже в бандле, поэтому рамки пока остаются на месте.
 */

export const BIOME_PALETTES = [
    // 0: день, снежные вершины — исходная сцена
    { sky: ["#5aa2d2", "#7fbde0", "#b8dcee", "#e2f2fa", "#f7fcff"], far: "#a8c6db", mid: "#c3dcec", cap: "#ffffff", veil: "rgba(250,253,255,.34)", tint: null },
    // 1: синее небо на закате
    { sky: ["#2b5b96", "#5a86c4", "#c08bb8", "#f3b391", "#ffd9a8"], far: "#7b8fb8", mid: "#a3a8cc", cap: "#ffe9d6", veil: "rgba(255,214,180,.20)", tint: "rgba(255,150,90,.10)" },
    // 2: полярное сияние
    { sky: ["#071b3a", "#0d2a55", "#12496e", "#0f6d7a", "#0b4a55"], far: "#1c3f63", mid: "#22567c", cap: "#b8f5e0", veil: "rgba(120,255,220,.10)", tint: "rgba(60,255,200,.10)" },
    // 3: ночь со звёздами
    { sky: ["#050d1e", "#0a1730", "#101f42", "#16264d", "#1b2c55"], far: "#22304f", mid: "#2b3d61", cap: "#dfe8ff", veil: "rgba(180,205,255,.08)", tint: "rgba(80,120,220,.12)" }
  ];

export const BIRD_KINDS = {
    gull: { scale: 1, speed: 2.2, color: "#4b5563", accent: "#e8eef4", wave: 0.9, waveSpeed: 0.035, push: 14 },
    swift: { scale: 0.78, speed: 3.5, color: "#7c4dbe", accent: "#e8dcff", wave: 2.6, waveSpeed: 0.085, push: 8 },
    raven: { scale: 1.28, speed: 1.55, color: "#2f3a48", accent: "#8a97a8", wave: 1.5, waveSpeed: 0.03, push: 26 }
  };

export const QUEST_DEFS = [
    { id: "coins", label: "\u0421\u041E\u0411\u0415\u0420\u0418 24 \u041C\u041E\u041D\u0415\u0422\u042B", target: 24, reward: 12 },
    { id: "height", label: "\u041F\u041E\u0414\u041D\u0418\u041C\u0418\u0421\u042C \u041D\u0410 30000", target: 3e4, reward: 15 },
    { id: "noSpring", label: "12000 \u0411\u0415\u0417 \u041F\u0420\u0423\u0416\u0418\u041D", target: 12e3, reward: 20 },
    { id: "noBird", label: "8000 \u0411\u0415\u0417 \u0421\u0422\u041E\u041B\u041A\u041D\u041E\u0412\u0415\u041D\u0418\u0419", target: 8e3, reward: 20 }
  ];

export const PERK_NEUTRAL = {
    gravity: 1,
    // множитель гравитации
    bounce: 1,
    // множитель отскока от платформы
    spring: 1,
    // множитель силы пружин
    width: 1,
    // множитель ширины платформ
    gap: 1,
    // множитель расстояния между платформами
    accel: 1,
    // множитель ускорения вбок
    friction: 1,
    // множитель трения (меньше — скользче)
    bird: 1,
    // множитель частоты птиц
    magnet: 1,
    // множитель радиуса магнита
    arc: 0,
    // добавка монет в связке
    coinLife: 0,
    // если > 0 — монет на жизнь
    shake: 1,
    // множитель тряски экрана
    lifeDrop: 0,
    // добавка к шансу выпадения жизни
    djump: 0,
    // 1 — двойной прыжок не кончается
    guard: 0,
    // 1 — падение ничего не стоит
    ghost: 0,
    // 1 — птицы не отбрасывают
    calm: 0,
    // 1 — ветер отключён
    jetpack: 0,
    // 1 — реактивный ранец поднимает игрока
    invuln: 0
    // 1 — урон не отнимает жизни
  };

export const PERK_RARITY_WEIGHTS = {
    common: 0.5,
    rare: 0.3,
    epic: 0.17,
    legendary: 0.03
  };

export const PERK_RARITY_ORDER = ["common", "rare", "epic", "legendary"];

export const PERK_RARITY = {
    common: { label: "\u041E\u0411\u042B\u0427\u041D\u042B\u0419", color: "#5f7d94", glow: "rgba(95,125,148,.45)", ring: 1.4 },
    rare: { label: "\u0420\u0415\u0414\u041A\u0418\u0419", color: "#287db4", glow: "rgba(40,125,180,.55)", ring: 1.8 },
    epic: { label: "\u042D\u041F\u0418\u0427\u0415\u0421\u041A\u0418\u0419", color: "#a855f7", glow: "rgba(168,85,247,.62)", ring: 2.2 },
    legendary: { label: "\u041B\u0415\u0413\u0415\u041D\u0414\u0410\u0420\u041D\u042B\u0419", color: "#e8a317", glow: "rgba(232,163,23,.75)", ring: 2.6 }
  };

export const LEGENDARY_SPAN = {
    /** МОЩНЫЙ РАНЕЦ: реактивный подъём. */
    jetpack: 1e4,
    /** РЕАКТИВ: пониженная гравитация и усиленный отскок. */
    reactive: 2e4,
    /** ТРЕТИЙ ПРЫЖОК: второй прыжок в воздухе, затем пауза до опоры. */
    doubleJump: 2e4,
    /** ПРИЗРАК: птицы не мешают. */
    ghost: 2e4,
    /** ЗОЛОТАЯ ЛИХОРАДКА: монеты и магнит. */
    goldrush: 2e4,
    /** ИДЕАЛЬНЫЙ БЕГ: магнит ×3 вдобавок к жизням. */
    perfect: 2e4,
    /** БЕССМЕРТИЕ: полная неуязвимость ко всему урону. */
    immortal: 1e4,
    /** ×5 МОНЕТЫ: усиленный множитель монет. */
    coins5x: 1e4
  };

export const PERK_DEFS = [
    // ================= ОБЫЧНЫЕ (14) =================
    {
      id: "coins2",
      rarity: "common",
      icon: "coin",
      title: "\xD72 \u041C\u041E\u041D\u0415\u0422\u042B",
      hint: "\u043A\u0430\u0436\u0434\u0430\u044F \u043C\u043E\u043D\u0435\u0442\u0430 \u0432\u0434\u0432\u043E\u0435",
      hint2: "\u0441\u0447\u0451\u0442 +12 000",
      coins: { mult: 1, span: 12e3 }
    },
    {
      id: "magnet1",
      rarity: "common",
      icon: "magnet",
      title: "\u041C\u0410\u0413\u041D\u0418\u0422 +50%",
      hint: "\u043C\u043E\u043D\u0435\u0442\u044B \u043B\u0438\u043F\u043D\u0443\u0442 \u0438\u0437\u0434\u0430\u043B\u0435\u043A\u0430",
      hint2: "\u0441\u0447\u0451\u0442 +15 000",
      mods: [["magnet", 1.5, 15e3]]
    },
    {
      id: "life1",
      rarity: "common",
      icon: "heartPlus",
      title: "\u0421\u0415\u0420\u0414\u0415\u0427\u041A\u0418 \u0427\u0410\u0429\u0415",
      hint: "\u0441\u0435\u0440\u0434\u0435\u0447\u043A\u0438 \u043F\u0430\u0434\u0430\u044E\u0442 \u0432\u0434\u0432\u043E\u0435 \u0447\u0430\u0449\u0435",
      hint2: "\u0441\u0447\u0451\u0442 +10 000",
      mods: [["lifeDrop", 0.5, 1e4]]
    },
    {
      id: "gravity1",
      rarity: "common",
      icon: "feather",
      title: "\u041C\u042F\u0413\u041A\u041E\u0415 \u041F\u0410\u0414\u0415\u041D\u0418\u0415",
      hint: "\u043F\u0430\u0434\u0430\u0435\u0448\u044C \u043C\u0435\u0434\u043B\u0435\u043D\u043D\u0435\u0435 \u043D\u0430 25%",
      hint2: "\u0441\u0447\u0451\u0442 +15 000",
      mods: [["gravity", 0.75, 15e3]]
    },
    {
      id: "coins5",
      rarity: "common",
      icon: "coinStack",
      title: "+5 \u041C\u041E\u041D\u0415\u0422",
      hint: "\u043F\u044F\u0442\u044C \u043C\u043E\u043D\u0435\u0442 \u0432 \u043A\u0430\u0440\u043C\u0430\u043D",
      hint2: "\u0441\u0440\u0430\u0437\u0443 \u043D\u0430 \u0441\u0447\u0451\u0442",
      coinsNow: 5
    },
    {
      id: "width1",
      rarity: "common",
      icon: "ladder",
      title: "\u041F\u041B\u0410\u0422\u0424\u041E\u0420\u041C\u042B +12%",
      hint: "\u043D\u0430 \u043D\u0438\u0445 \u043B\u0435\u0433\u0447\u0435 \u0432\u0441\u0442\u0430\u0442\u044C",
      hint2: "\u0441\u0447\u0451\u0442 +15 000",
      mods: [["width", 1.12, 15e3]]
    },
    {
      id: "spring1",
      rarity: "common",
      icon: "spring",
      title: "\u041F\u0420\u0423\u0416\u0418\u041D\u042B +15%",
      hint: "\u043F\u043E\u0434\u0431\u0440\u0430\u0441\u044B\u0432\u0430\u044E\u0442 \u0441\u0438\u043B\u044C\u043D\u0435\u0435",
      hint2: "\u0441\u0447\u0451\u0442 +15 000",
      mods: [["spring", 1.15, 15e3]]
    },
    {
      id: "bounce1",
      rarity: "common",
      icon: "bounce",
      title: "\u041E\u0422\u0421\u041A\u041E\u041A +8%",
      hint: "\u0432\u044B\u0448\u0435 \u043F\u0440\u044B\u0436\u043E\u043A \u0441 \u043F\u043B\u0430\u0442\u0444\u043E\u0440\u043C\u044B",
      hint2: "\u0441\u0447\u0451\u0442 +15 000",
      mods: [["bounce", 1.08, 15e3]]
    },
    {
      id: "accel1",
      rarity: "common",
      icon: "bolt",
      title: "\u0420\u0410\u0417\u0413\u041E\u041D +15%",
      hint: "\u0431\u044B\u0441\u0442\u0440\u0435\u0435 \u043D\u0430\u0431\u0438\u0440\u0430\u0435\u0448\u044C \u0445\u043E\u0434",
      hint2: "\u0441\u0447\u0451\u0442 +15 000",
      mods: [["accel", 1.15, 15e3]]
    },
    {
      id: "bird1",
      rarity: "common",
      icon: "birdOff",
      title: "\u041C\u0415\u041D\u042C\u0428\u0415 \u041F\u0422\u0418\u0426",
      hint: "\u043F\u0442\u0438\u0446 \u043D\u0430 30% \u043C\u0435\u043D\u044C\u0448\u0435",
      hint2: "\u0441\u0447\u0451\u0442 +12 000",
      mods: [["bird", 0.7, 12e3]]
    },
    {
      id: "lifeOne",
      rarity: "common",
      icon: "heartPlus",
      title: "\u0421\u0422\u041E\u0419\u041A\u041E\u0421\u0422\u042C",
      hint: "\u043F\u0430\u0434\u0435\u043D\u0438\u0435 \u0447\u0443\u0442\u044C \u043C\u044F\u0433\u0447\u0435",
      hint2: "\u0441\u0447\u0451\u0442 +8 000",
      mods: [["shake", 0.6, 8e3]]
    },
    {
      id: "calm1",
      rarity: "common",
      icon: "windOff",
      title: "\u0411\u0415\u0417 \u0412\u0415\u0422\u0420\u0410",
      hint: "\u0432\u0435\u0442\u0435\u0440 \u0441\u0442\u0438\u0445\u0430\u0435\u0442 \u0441\u043E\u0432\u0441\u0435\u043C",
      hint2: "\u0441\u0447\u0451\u0442 +8 000",
      mods: [["calm", 1, 8e3]]
    },
    {
      id: "arc1",
      rarity: "common",
      icon: "coinsArc",
      title: "\u0413\u0418\u0420\u041B\u042F\u041D\u0414\u042B +1",
      hint: "\u043D\u0430 \u043E\u0434\u043D\u0443 \u043C\u043E\u043D\u0435\u0442\u0443 \u0431\u043E\u043B\u044C\u0448\u0435",
      hint2: "\u0432 \u0441\u0432\u044F\u0437\u043A\u0435, \u0441\u0447\u0451\u0442 +20 000",
      mods: [["arc", 1, 2e4]]
    },
    {
      id: "soft1",
      rarity: "common",
      icon: "snow",
      title: "\u041C\u042F\u0413\u041A\u0410\u042F \u0422\u0420\u042F\u0421\u041A\u0410",
      hint: "\u044D\u043A\u0440\u0430\u043D \u0442\u0440\u044F\u0441\u0451\u0442\u0441\u044F \u0432\u0434\u0432\u043E\u0435 \u043C\u0435\u043D\u044C\u0448\u0435",
      hint2: "\u0441\u0447\u0451\u0442 +20 000",
      mods: [["shake", 0.5, 2e4]]
    },
    // ================= РЕДКИЕ (12) =================
    {
      id: "coins3",
      rarity: "rare",
      icon: "coin",
      title: "\xD73 \u041C\u041E\u041D\u0415\u0422\u042B",
      hint: "\u043A\u0430\u0436\u0434\u0430\u044F \u043C\u043E\u043D\u0435\u0442\u0430 \u0432\u0442\u0440\u043E\u0435",
      hint2: "\u0441\u0447\u0451\u0442 +10 000",
      coins: { mult: 2, span: 1e4 }
    },
    {
      id: "shield2",
      rarity: "rare",
      icon: "heartPlus",
      title: "+1 \u0416\u0418\u0417\u041D\u042C",
      hint: "\u043E\u0434\u043D\u0430 \u0436\u0438\u0437\u043D\u044C \u0432 \u0437\u0430\u043F\u0430\u0441",
      hint2: "\u0441\u0440\u0430\u0437\u0443 \u0432 \u0437\u0430\u043F\u0430\u0441",
      lives: 1
    },
    {
      id: "magnet2",
      rarity: "rare",
      icon: "magnet",
      title: "\u041C\u0410\u0413\u041D\u0418\u0422 \xD72",
      hint: "\u043C\u043E\u043D\u0435\u0442\u044B \u043B\u0438\u043F\u043D\u0443\u0442 \u0441 \u0434\u0432\u0443\u0445 \u0448\u0430\u0433\u043E\u0432",
      hint2: "\u0441\u0447\u0451\u0442 +20 000",
      mods: [["magnet", 2, 2e4]]
    },
    {
      id: "width2",
      rarity: "rare",
      icon: "ladder",
      title: "\u041F\u041B\u0410\u0422\u0424\u041E\u0420\u041C\u042B +25%",
      hint: "\u0447\u0435\u0442\u0432\u0435\u0440\u0442\u044C \u0448\u0438\u0440\u0438\u043D\u044B \u0441\u0432\u0435\u0440\u0445\u0443",
      hint2: "\u0441\u0447\u0451\u0442 +20 000",
      mods: [["width", 1.25, 2e4]]
    },
    {
      id: "gap1",
      rarity: "rare",
      icon: "clock",
      title: "\u0411\u041B\u0418\u0416\u0415 \u0414\u0420\u0423\u0413 \u041A \u0414\u0420\u0423\u0413\u0423",
      hint: "\u043F\u0440\u043E\u043C\u0435\u0436\u0443\u0442\u043A\u0438 \u043A\u043E\u0440\u043E\u0447\u0435 \u043D\u0430 12%",
      hint2: "\u0441\u0447\u0451\u0442 +20 000",
      mods: [["gap", 0.88, 2e4]]
    },
    {
      id: "spring2",
      rarity: "rare",
      icon: "spring",
      title: "\u041F\u0420\u0423\u0416\u0418\u041D\u042B +50%",
      hint: "\u043F\u043E\u0434\u0431\u0440\u0430\u0441\u044B\u0432\u0430\u044E\u0442 \u0432 \u043F\u043E\u043B\u0442\u043E\u0440\u0430 \u0440\u0430\u0437\u0430",
      hint2: "\u0441\u0447\u0451\u0442 +20 000",
      mods: [["spring", 1.5, 2e4]]
    },
    {
      id: "bounce2",
      rarity: "rare",
      icon: "bounce",
      title: "\u041E\u0422\u0421\u041A\u041E\u041A +20%",
      hint: "\u0437\u0430\u043C\u0435\u0442\u043D\u043E \u0432\u044B\u0448\u0435 \u043F\u0440\u044B\u0436\u043E\u043A",
      hint2: "\u0441\u0447\u0451\u0442 +20 000",
      mods: [["bounce", 1.2, 2e4]]
    },
    {
      id: "bird2",
      rarity: "rare",
      icon: "birdOff",
      title: "\u0420\u0415\u0414\u041A\u0418\u0415 \u041F\u0422\u0418\u0426\u042B",
      hint: "\u043F\u0442\u0438\u0446 \u043D\u0430 60% \u043C\u0435\u043D\u044C\u0448\u0435",
      hint2: "\u0441\u0447\u0451\u0442 +15 000",
      mods: [["bird", 0.4, 15e3]]
    },
    {
      id: "lifeRate1",
      rarity: "rare",
      icon: "heartClock",
      title: "\u0421\u0415\u0420\u0414\u0415\u0427\u041A\u0418 \xD72",
      hint: "\u0441\u0435\u0440\u0434\u0435\u0447\u043A\u0438 \u043F\u0430\u0434\u0430\u044E\u0442 \u0432\u0434\u0432\u043E\u0435 \u0447\u0430\u0449\u0435",
      hint2: "\u0441\u0447\u0451\u0442 +25 000",
      mods: [["lifeDrop", 1, 25e3]]
    },
    {
      id: "coins6",
      rarity: "rare",
      icon: "coinStack",
      title: "+15 \u041C\u041E\u041D\u0415\u0422",
      hint: "\u043F\u044F\u0442\u043D\u0430\u0434\u0446\u0430\u0442\u044C \u043C\u043E\u043D\u0435\u0442 \u0432 \u043A\u0430\u0440\u043C\u0430\u043D",
      hint2: "\u0441\u0440\u0430\u0437\u0443 \u043D\u0430 \u0441\u0447\u0451\u0442",
      coinsNow: 15
    },
    {
      id: "magnetArc",
      rarity: "rare",
      icon: "coinsArc",
      title: "\u0421\u0412\u042F\u0417\u041A\u0418 +2",
      hint: "\u043F\u043E \u0434\u0432\u0435 \u043C\u043E\u043D\u0435\u0442\u044B \u0441\u0432\u0435\u0440\u0445\u0443",
      hint2: "\u0432 \u0441\u0432\u044F\u0437\u043A\u0435, \u0441\u0447\u0451\u0442 +25 000",
      mods: [["arc", 2, 25e3]]
    },
    {
      id: "guard1",
      rarity: "common",
      icon: "halo",
      title: "\u0421\u0422\u0420\u0410\u0425\u041E\u0412\u041A\u0410",
      hint: "\u043F\u0430\u0434\u0435\u043D\u0438\u0435 \u043F\u0440\u043E\u0449\u0430\u0435\u0442\u0441\u044F",
      hint2: "\u043D\u0430 10 000 \u043E\u0447\u043A\u043E\u0432",
      mods: [["guard", 1, 1e4]]
    },
    // ================= ЭПИЧЕСКИЕ (10) =================
    {
      id: "ghost1",
      rarity: "epic",
      icon: "birdOff",
      title: "\u0421\u041A\u0412\u041E\u0417\u042C \u041F\u0422\u0418\u0426",
      hint: "\u043F\u0442\u0438\u0446\u044B \u043F\u0440\u043E\u043B\u0435\u0442\u0430\u044E\u0442 \u043D\u0430\u0441\u043A\u0432\u043E\u0437\u044C",
      hint2: "\u0441\u0447\u0451\u0442 +18 000",
      mods: [["ghost", 1, 18e3]]
    },
    {
      id: "life3",
      rarity: "epic",
      icon: "heartPlus",
      title: "+2 \u0416\u0418\u0417\u041D\u0418",
      hint: "\u0434\u0432\u0430 \u043F\u0430\u0434\u0435\u043D\u0438\u044F \u0431\u0435\u0441\u043F\u043B\u0430\u0442\u043D\u043E",
      hint2: "\u0441\u0440\u0430\u0437\u0443 \u0432 \u0437\u0430\u043F\u0430\u0441",
      lives: 2
    },
    {
      id: "shield3",
      rarity: "epic",
      icon: "heartPlus",
      title: "+2 \u0416\u0418\u0417\u041D\u0418",
      hint: "\u0434\u0432\u0435 \u0436\u0438\u0437\u043D\u0438 \u0441\u0440\u0430\u0437\u0443",
      hint2: "\u0441\u0440\u0430\u0437\u0443 \u0432 \u0437\u0430\u043F\u0430\u0441",
      lives: 2
    },
    {
      id: "gravity2",
      rarity: "epic",
      icon: "feather",
      title: "\u041F\u0423\u0425 \u221245%",
      hint: "\u043F\u0430\u0434\u0430\u0435\u0448\u044C \u043F\u043E\u0447\u0442\u0438 \u0432\u0434\u0432\u043E\u0435 \u043C\u0435\u0434\u043B\u0435\u043D\u043D\u0435\u0435",
      hint2: "\u0441\u0447\u0451\u0442 +15 000",
      mods: [["gravity", 0.55, 15e3]]
    },
    {
      id: "width3",
      rarity: "epic",
      icon: "ladder",
      title: "\u0428\u0418\u0420\u041E\u041A\u0418\u0419 \u041F\u0423\u0422\u042C",
      hint: "\u043F\u043B\u0430\u0442\u0444\u043E\u0440\u043C\u044B \u0432 1,4 \u0440\u0430\u0437\u0430 \u0448\u0438\u0440\u0435",
      hint2: "\u0441\u0447\u0451\u0442 +25 000",
      mods: [["width", 1.4, 25e3]]
    },
    {
      id: "coinLife1",
      rarity: "epic",
      icon: "heartCoin",
      title: "\u0416\u0418\u0417\u041D\u042C \u0417\u0410 18 \u041C\u041E\u041D\u0415\u0422",
      hint: "\u0436\u0438\u0437\u043D\u044C \u043A\u0430\u0436\u0434\u044B\u0435 18 \u043C\u043E\u043D\u0435\u0442 \u0432\u043C\u0435\u0441\u0442\u043E 25",
      hint2: "\u0441\u0440\u0430\u0437\u0443 +1 \u0436\u0438\u0437\u043D\u044C",
      lives: 1,
      mods: [["coinLife", 18, 3e4]]
    },
    {
      id: "combo1",
      rarity: "epic",
      icon: "crown",
      title: "\u0412\u0422\u041E\u0420\u041E\u0415 \u0414\u042B\u0425\u0410\u041D\u0418\u0415",
      hint: "\xD72 \u043C\u043E\u043D\u0435\u0442\u044B \u0438 \u043C\u0430\u0433\u043D\u0438\u0442 \u0432\u0434\u0432\u043E\u0435",
      hint2: "30 \u043F\u043B\u0430\u0442\u0444\u043E\u0440\u043C, 30 000",
      coins: { mult: 1, span: 18e3 },
      mods: [["magnet", 2, 3e4]]
    },
    {
      id: "bounce3",
      rarity: "epic",
      icon: "rocket",
      title: "\u0420\u0410\u041A\u0415\u0422\u041D\u042B\u0419 \u041E\u0422\u0421\u041A\u041E\u041A",
      hint: "\u043E\u0442\u0441\u043A\u043E\u043A \u043C\u043E\u0449\u043D\u0435\u0435 \u043D\u0430 30%",
      hint2: "\u0441\u0447\u0451\u0442 +20 000",
      mods: [["bounce", 1.3, 2e4]]
    },
    {
      id: "lifeDrop1",
      rarity: "epic",
      icon: "heartCoin",
      title: "\u0427\u0410\u0429\u0415 \u0416\u0418\u0417\u041D\u0418",
      hint: "\u0441\u0435\u0440\u0434\u0435\u0447\u043A\u0438 \u043F\u0430\u0434\u0430\u044E\u0442 \u0432\u0442\u0440\u043E\u0435 \u0447\u0430\u0449\u0435",
      hint2: "\u0441\u0447\u0451\u0442 +30 000",
      mods: [["lifeDrop", 2, 3e4]]
    },
    {
      id: "djump1",
      rarity: "epic",
      icon: "jump",
      title: "\u0412\u0415\u0427\u041D\u042B\u0419 \u041F\u0420\u042B\u0416\u041E\u041A",
      hint: "\u0432\u0442\u043E\u0440\u043E\u0439 \u043F\u0440\u044B\u0436\u043E\u043A \u043D\u0435 \u043A\u043E\u043D\u0447\u0430\u0435\u0442\u0441\u044F",
      hint2: "\u0441\u0447\u0451\u0442 +25 000",
      mods: [["djump", 1, 25e3]]
    },
    {
      id: "brake1",
      rarity: "epic",
      icon: "brake",
      title: "\u0422\u041E\u0427\u041D\u041E\u0415 \u0422\u041E\u0420\u041C\u041E\u0416\u0415\u041D\u0418\u0415",
      hint: "\u043E\u0441\u0442\u0430\u043D\u0430\u0432\u043B\u0438\u0432\u0430\u0435\u0448\u044C\u0441\u044F \u0440\u0435\u0437\u0447\u0435",
      hint2: "\u0441\u0447\u0451\u0442 +25 000",
      mods: [["friction", 1.6, 25e3]]
    },
    {
      id: "jet1",
      rarity: "epic",
      icon: "rocket",
      title: "\u0420\u0410\u041D\u0415\u0426",
      hint: "\u0440\u0430\u043D\u0435\u0446 \u043F\u043E\u0434\u043D\u0438\u043C\u0430\u0435\u0442 \u0432\u0432\u0435\u0440\u0445",
      hint2: "\u0441\u0447\u0451\u0442 +6 000",
      mods: [["jetpack", 1, 6e3]]
    },
    // ================= ЛЕГЕНДАРНЫЕ (8) =================
    {
      id: "phoenix",
      rarity: "legendary",
      icon: "phoenix",
      title: "\u0424\u0415\u041D\u0418\u041A\u0421",
      hint: "\u0434\u0432\u0435 \u0436\u0438\u0437\u043D\u0438 \u0441\u0440\u0430\u0437\u0443",
      hint2: "\u0432 \u0437\u0430\u043F\u0430\u0441",
      lives: 2
    },
    {
      id: "goldrush",
      rarity: "legendary",
      icon: "crown",
      title: "\u0417\u041E\u041B\u041E\u0422\u0410\u042F \u041B\u0418\u0425\u041E\u0420\u0410\u0414\u041A\u0410",
      hint: "\xD73 \u043C\u043E\u043D\u0435\u0442\u044B \u0438 \u043C\u0430\u0433\u043D\u0438\u0442 \xD72,5",
      hint2: "\u0441\u0447\u0451\u0442 +25 000",
      coins: { mult: 2, span: LEGENDARY_SPAN.goldrush },
      mods: [["magnet", 2.5, LEGENDARY_SPAN.goldrush]]
    },
    {
      id: "ghost2",
      rarity: "legendary",
      icon: "birdOff",
      title: "\u041F\u0420\u0418\u0417\u0420\u0410\u041A",
      hint: "\u043F\u0442\u0438\u0446\u044B \u0431\u043E\u043B\u044C\u0448\u0435 \u043D\u0435 \u043C\u0435\u0448\u0430\u044E\u0442",
      hint2: "\u0441\u0447\u0451\u0442 +25 000",
      mods: [["ghost", 1, LEGENDARY_SPAN.ghost]]
    },
    {
      id: "immortal",
      rarity: "legendary",
      icon: "shield",
      title: "\u0411\u0415\u0421\u0421\u041C\u0415\u0420\u0422\u0418\u0415",
      hint: "\u043F\u0442\u0438\u0446\u044B \u0438 \u043F\u0430\u0434\u0435\u043D\u0438\u044F \u043D\u0435 \u043E\u0442\u043D\u0438\u043C\u0430\u044E\u0442 \u0436\u0438\u0437\u043D\u0438",
      hint2: "\u043D\u0430 10 000 \u043E\u0447\u043A\u043E\u0432",
      mods: [["invuln", 1, LEGENDARY_SPAN.immortal]]
    },
    {
      id: "djump2",
      rarity: "legendary",
      icon: "jump",
      title: "\u0422\u0420\u0415\u0422\u0418\u0419 \u041F\u0420\u042B\u0416\u041E\u041A",
      hint: "\u0434\u0432\u0430 \u043F\u0440\u044B\u0436\u043A\u0430 \u0432 \u0432\u043E\u0437\u0434\u0443\u0445\u0435, \u0437\u0430\u0442\u0435\u043C \u043F\u0430\u0443\u0437\u0430",
      hint2: "\u0441\u0447\u0451\u0442 +25 000",
      mods: [["djump", 1, LEGENDARY_SPAN.doubleJump]]
    },
    {
      id: "coins5x",
      rarity: "legendary",
      icon: "coin",
      title: "\xD75 \u041C\u041E\u041D\u0415\u0422\u042B",
      hint: "\u043A\u0430\u0436\u0434\u0430\u044F \u043C\u043E\u043D\u0435\u0442\u0430 \u0432\u043F\u044F\u0442\u0435\u0440\u043E",
      hint2: "\u0441\u0447\u0451\u0442 +12 000",
      coins: { mult: 4, span: LEGENDARY_SPAN.coins5x }
    },
    {
      id: "jet",
      rarity: "legendary",
      icon: "rocket",
      title: "\u0420\u0415\u0410\u041A\u0422\u0418\u0412",
      hint: "\u043B\u0435\u0433\u0447\u0435 \u0438 \u043E\u0442\u0441\u043A\u043E\u043A \u043C\u043E\u0449\u043D\u0435\u0435",
      hint2: "\u0441\u0447\u0451\u0442 +25 000",
      mods: [["gravity", 0.5, LEGENDARY_SPAN.reactive], ["bounce", 1.4, LEGENDARY_SPAN.reactive]]
    },
    {
      id: "jet2",
      rarity: "legendary",
      icon: "rocket",
      title: "\u041C\u041E\u0429\u041D\u042B\u0419 \u0420\u0410\u041D\u0415\u0426",
      hint: "\u0440\u0435\u0430\u043A\u0442\u0438\u0432\u043D\u044B\u0439 \u0440\u0430\u043D\u0435\u0446 \u043F\u043E\u0434\u043D\u0438\u043C\u0430\u0435\u0442 \u0432\u0432\u0435\u0440\u0445",
      hint2: "\u0441\u0447\u0451\u0442 +10 000",
      mods: [["jetpack", 1, LEGENDARY_SPAN.jetpack]]
    },
    {
      id: "perfect",
      rarity: "legendary",
      icon: "gem",
      title: "\u0418\u0414\u0415\u0410\u041B\u042C\u041D\u042B\u0419 \u0411\u0415\u0413",
      hint: "\u0434\u0432\u0435 \u0436\u0438\u0437\u043D\u0438 \u0438 \u043C\u0430\u0433\u043D\u0438\u0442 \xD73",
      hint2: "\u0441\u0447\u0451\u0442 +25 000",
      lives: 2,
      mods: [["magnet", 3, LEGENDARY_SPAN.perfect]]
    },
    {
      id: "life2",
      rarity: "rare",
      icon: "heartPlus",
      title: "+2 \u0416\u0418\u0417\u041D\u0418",
      hint: "\u0441\u0440\u0430\u0437\u0443 \u0434\u0432\u0435 \u0436\u0438\u0437\u043D\u0438",
      hint2: "\u0431\u0435\u0437 \u043E\u0436\u0438\u0434\u0430\u043D\u0438\u044F",
      lives: 2
    },  ];
