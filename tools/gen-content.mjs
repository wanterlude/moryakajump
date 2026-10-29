// Генератор контента: рамки и скины платформ.
//
//   node tools/gen-content.mjs           # дописать недостающие записи
//   node tools/gen-content.mjs --force   # пересоздать всё сверх базовых записей
//
// Скрипт детерминированный: при одинаковых входных данных получается одинаковая
// выдача. Существующие записи не меняются — новые дописываются в конец списка, а
// рамки затем сортируются по цене, как этого ждёт магазин.
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const framesFile = path.join(root, "src/game/frames.ts");
const skinsFile = path.join(root, "src/game/platform-skins.ts");

const FRAMES_TARGET = 1000;
const SKINS_PER_TYPE = 50;

// Детерминированный генератор: одна и та же выдача при каждом запуске.
function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const ORNAMENTS = [
  "stars", "snowflakes", "thorns", "runes", "gems", "leaves", "crystals", "bubbles", "rays",
  "hearts", "bolts", "flames", "neon", "rivets", "sparkles", "waves", "dots", "hexagons"
];
const ORNAMENT_NAMES = {
  stars: "Звёзды", snowflakes: "Снежинки", thorns: "Шипы", runes: "Руны", gems: "Самоцветы",
  leaves: "Листья", crystals: "Кристаллы", bubbles: "Пузыри", rays: "Лучи", hearts: "Сердца",
  bolts: "Молнии", flames: "Пламя", neon: "Неон", rivets: "Заклёпки", sparkles: "Искры",
  waves: "Волны", dots: "Точки", hexagons: "Соты"
};
const FX_KEYS = ["beam_1", "beam_2", "beam_3", "beam_4", "bolt_1", "bolt_2", "bolt_3", "bolt_4",
  "firefly_1", "firefly_2", "firefly_3", "firefly_4", "burst_1", "burst_2", "burst_3", "burst_4",
  "burst_5", "dashring_1", "fountain_1", "fountain_2", "fountain_3", "fountain_4", "hexgrid_1",
  "hexgrid_2", "hexgrid_3", "hexgrid_4", "orbit_1", "orbit_2", "orbit_3", "orbit_4", "ringpulse_1",
  "ringpulse_2", "ringpulse_3", "ringpulse_4", "ripple_1", "ripple_2", "ripple_3", "ripple_4",
  "spiral_1", "spiral_2", "spiral_3", "spiral_4", "stars_1", "stars_2", "stars_3", "stars_4",
  "wave_1", "wave_2", "wave_3", "wave_4"];
const PLAIN_EXTRAS = ["aura", "aurora", "comet", "halo", "haloring", "petals", "shards", "shock", "sparks", "twinkle"];

const PALETTES = [
  ["изумруд", 150], ["лазурь", 205], ["магма", 12], ["аметист", 275], ["кобальт", 220],
  ["нефрит", 165], ["янтарь", 40], ["роза", 335], ["сталь", 210], ["мирадж", 190],
  ["иней", 195], ["пламя", 25], ["ультрамарин", 235], ["малахит", 140], ["кармин", 350],
  ["индиго", 250], ["олива", 80], ["рубин", 0], ["сапфир", 215], ["топаз", 50],
  ["сирень", 285], ["бирюза", 175], ["медь", 20], ["пепел", 200], ["хром", 195],
  ["коралл", 10], ["лаванда", 265], ["мята", 160], ["терракота", 15], ["графит", 220],
  ["золото", 45], ["серебро", 205], ["аквамарин", 185], ["гранат", 355], ["фуксия", 315],
  ["мох", 95], ["полынь", 105], ["глазурь", 200], ["киноварь", 5], ["веста", 30],
  ["кобальт II", 225], ["титан", 190], ["гейзер", 170], ["эфир", 260]
];

function hslToHex(h, sPercent, lPercent) {
  const s = sPercent / 100;
  const l = lPercent / 100;
  const a = s * Math.min(l, 1 - l);
  const f = (n) => {
    const k = (n + h / 30) % 12;
    const c = l - a * Math.max(-1, Math.min(k - 3, Math.min(9 - k, 1)));
    return Math.round(255 * c).toString(16).padStart(2, "0");
  };
  return "#" + f(0) + f(8) + f(4);
}

function frameLine(entry) {
  const parts = [`colors: [${entry.colors.map((c) => `"${c}"`).join(", ")}]`, `glow: "${entry.glow}"`];
  parts.push(`ornament: "${entry.ornament}"`, `width: ${entry.width}`);
  if (entry.double) parts.push("double: true");
  if (entry.pulse) parts.push("pulse: true");
  if (entry.dashed) parts.push('style: "dashed"');
  const extras = entry.extras.map((e) => `"${e}"`).join(", ");
  parts.push(`extras: [${extras}]`);
  return `    { id: ${entry.id}, name: "${entry.name}", price: ${entry.price}, look: { ${parts.join(", ")} } },`;
}

// ---------- Рамки ----------
const framesText = fs.readFileSync(framesFile, "utf8");
const frameLines = framesText.split("\n");
const framesLineIdx = frameLines.findIndex((l) => l.includes("export const FRAMES = ["));
if (framesLineIdx < 0) throw new Error("не нашёл строку FRAMES");
const framesLine = frameLines[framesLineIdx];
const existingFrames = frameLines.filter((l) => /^\s*\{ id: \d+,/.test(l));
const existingIds = new Set(existingFrames.map((l) => Number(/id: (\d+)/.exec(l)[1])));
const existingCount = existingFrames.length;
const hasFourthBatch = framesLine.includes("EXTRA_FRAMES_4");

const usedFrameNames = new Set(existingFrames.map((l) => /name: "([^"]+)"/.exec(l)[1]));
const uniqueName = (base, used) => {
  if (!used.has(base)) { used.add(base); return base; }
  const romans = ["II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"];
  for (const r of romans) {
    const candidate = base + " · " + r;
    if (!used.has(candidate)) { used.add(candidate); return candidate; }
  }
  return base;
};
const rand = mulberry32(20261029);
const newFrameEntries = [];
let nextId = 0;
for (let i = existingCount; i < FRAMES_TARGET; i++) {
  while (existingIds.has(nextId)) nextId++;
  const id = nextId++;
  const ornament = ORNAMENTS[(i * 7) % ORNAMENTS.length];
  const [paletteName, hue] = PALETTES[i % PALETTES.length];
  const shift = (i % 5) * 6 - 12;
  const baseHue = (hue + shift + 360) % 360;
  const glow = hslToHex(baseHue, 100, 62);
  const colors = [
    hslToHex(baseHue, 92, 58),
    hslToHex(baseHue, 88, 27),
    hslToHex(baseHue + 4, 80, 22)
  ];
  // Цена распределяется по полосам редкости: у каждой полосы свои границы в GACHA_TIER.
  const bucket = i % 20;
  let price;
  if (bucket < 5) price = 60 + Math.floor(rand() * 39);
  else if (bucket < 9) price = 100 + Math.floor(rand() * 99);
  else if (bucket < 13) price = 200 + Math.floor(rand() * 139);
  else if (bucket < 17) price = 340 + Math.floor(rand() * 219);
  else price = 560 + Math.floor(rand() * 1440);
  const extras = [FX_KEYS[Math.floor(rand() * FX_KEYS.length)]];
  if (rand() < 0.55) extras.push(PLAIN_EXTRAS[Math.floor(rand() * PLAIN_EXTRAS.length)]);
  if (rand() < 0.35) extras.push(FX_KEYS[Math.floor(rand() * FX_KEYS.length)]);
  newFrameEntries.push({
    id,
    name: uniqueName(`${ORNAMENT_NAMES[ornament]} · ${paletteName}`, usedFrameNames),
    price,
    colors,
    glow,
    ornament,
    width: [4, 5, 6, 7][Math.floor(rand() * 4)],
    double: rand() < 0.18,
    pulse: rand() < 0.5,
    dashed: rand() < 0.3,
    extras: [...new Set(extras)]
  });
}

const batch = [
  "// Дополнительные рамки: сгенерированы tools/gen-content.mjs, правки теряются.",
  "export const EXTRA_FRAMES_4 = [",
  ...newFrameEntries.map(frameLine),
  "];",
  ""
];
const nextFramesText = [
  ...frameLines.slice(0, framesLineIdx),
  ...(newFrameEntries.length ? batch : []),
  hasFourthBatch ? framesLine : framesLine.replace("...EXTRA_FRAMES_3]", "...EXTRA_FRAMES_3, ...EXTRA_FRAMES_4]"),
  ...frameLines.slice(framesLineIdx + 1)
].join("\n");
fs.writeFileSync(framesFile, nextFramesText, "utf8");

// ---------- Скины платформ ----------
const skinsText = fs.readFileSync(skinsFile, "utf8");
const skinLines = skinsText.split("\n");
const skinsOpen = skinLines.findIndex((l) => l.includes("export const PLATFORM_SKINS"));
const skinsClose = skinLines.findIndex((l, i) => i > skinsOpen && /^\s*\];\s*$/.test(l));
if (skinsOpen < 0 || skinsClose < 0) throw new Error("не нашёл массив PLATFORM_SKINS");

const existingSkins = skinLines.slice(skinsOpen + 1, skinsClose).filter((l) => l.trim().startsWith("{ id:"));
const usedIds = new Set(existingSkins.map((l) => /id: "([^"]+)"/.exec(l)[1]));

const TYPE_NAMES = {
  static: "Снег", moving: "Лёд подвижный", ice: "Каток", broken: "Доски", vanish: "Туман", sticky: "Клей"
};
const TYPE_DETAILS = {
  static: ["snowcap", "gloss", "sparkle", "icicles", "stripes", "glowline"],
  moving: ["stripes", "rivets", "scratches", "glowline", "sparkle", "gloss"],
  ice: ["scratches", "gloss", "mirror", "sparkle", "glowline"],
  broken: ["planks", "nails", "knots", "cracks", "gloss", "rivets", "sparkle"],
  vanish: ["mist", "bubbles", "sparkle", "glowline"],
  sticky: ["drips", "gloss", "bubbles", "sparkle", "glowline"]
};
const TYPE_HUE = { static: 197, moving: 190, ice: 185, broken: 28, vanish: 265, sticky: 95 };
const EPITHETS = [
  "Пороша", "Наст", "Глетчер", "Глубина", "Аврора", "Сумерки", "Полярный свет", "Розовый иней",
  "Кристалл", "Бездна", "Иней", "Метель", "Лазурь", "Сталь", "Кобальт", "Мираж", "Полночь",
  "Рассвет", "Закат", "Туманность", "Слюда", "Кварц", "Опал", "Нефрит", "Гранат", "Топаз",
  "Сапфир", "Аметист", "Рубин", "Изумруд", "Янтарь", "Коралл", "Медь", "Хром", "Титан",
  "Графит", "Пепел", "Мята", "Сияние"
];
const TIERS = ["common", "rare", "epic", "legendary", "divine"];
const TIER_COUNTS = { common: 10, rare: 8, epic: 8, legendary: 7, divine: 6 };
const skinsRand = mulberry32(777001);

const typeIndex = { static: 0, moving: 1, ice: 2, broken: 3, vanish: 4, sticky: 5 };
const newSkins = [];
for (const type of Object.keys(TYPE_NAMES)) {
  const current = existingSkins.filter((l) => new RegExp(`type: "${type}"`).test(l)).length;
  const needed = SKINS_PER_TYPE - current;
  if (needed <= 0) continue;
  const counters = {};
  for (const line of existingSkins) {
    const m = new RegExp(`id: "${type}_(\\w+?)_(\\d+)"`).exec(line);
    if (m) counters[m[1]] = Math.max(counters[m[1]] || 0, Number(m[2]));
  }
  const queue = [];
  for (const tier of TIERS) {
    for (let k = 0; k < TIER_COUNTS[tier]; k++) queue.push(tier);
  }
  const used = queue.slice(0, needed);
  used.forEach((tier, i) => {
    counters[tier] = (counters[tier] || 0) + 1;
    let id = `${type}_${tier}_${counters[tier]}`;
    while (usedIds.has(id)) {
      counters[tier]++;
      id = `${type}_${tier}_${counters[tier]}`;
    }
    usedIds.add(id);
    const hue = (TYPE_HUE[type] + (i - 19) * 5 + 360) % 360;
    const light = 52 + (i % 5) * 4;
    const epithet = EPITHETS[(typeIndex[type] * 7 + i) % EPITHETS.length];
    const pick = [];
    const first = TYPE_DETAILS[type][Math.floor(skinsRand() * TYPE_DETAILS[type].length)];
    pick.push(first);
    if (skinsRand() < 0.4) {
      const second = TYPE_DETAILS[type][Math.floor(skinsRand() * TYPE_DETAILS[type].length)];
      if (!pick.includes(second)) pick.push(second);
    }
    newSkins.push(
      `  { id: "${id}", type: "${type}", tier: "${tier}", name: "${TYPE_NAMES[type]} · ${epithet}", ` +
      `top: "${hslToHex(hue, 55, light + 30)}", mid: "${hslToHex(hue, 60, light)}", ` +
      `bottom: "${hslToHex(hue, 65, light - 26)}", edge: "${hslToHex(hue, 70, light - 34)}", ` +
      `accent: "${hslToHex(hue, 95, light + 18)}", details: [${pick.map((d) => `"${d}"`).join(", ")}] },`
    );
  });
}

const nextSkinsText = [
  ...skinLines.slice(0, skinsClose),
  ...newSkins,
  ...skinLines.slice(skinsClose)
].join("\n");
fs.writeFileSync(skinsFile, nextSkinsText, "utf8");

console.log("рамок было " + existingCount + ", добавлено " + newFrameEntries.length + ", стало " + (existingCount + newFrameEntries.length));
console.log("скинов было " + existingSkins.length + ", добавлено " + newSkins.length + ", стало " + (existingSkins.length + newSkins.length));
