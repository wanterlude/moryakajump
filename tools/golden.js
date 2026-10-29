// Golden-тесты отрисовки без браузера: грузим бандл в Node через заглушку DOM,
// подменяем контекст канваса записывающим и сравниваем хеш списка вызовов.
//
//   node tools/golden.js            # проверить против эталонов
//   node tools/golden.js --update   # перезаписать эталоны
//
// Почему так, а не через headless Chrome: пиксели в headless зависят от шрифтов
// и масштаба канваса, а передача большого списка вызовов через CDP оказалась
// нестабильной. Здесь всё детерминировано (время и random заморожены), работает
// за доли секунды и не грузит процессор.
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const vm = require("vm");
const { createSandbox, extractScripts } = require("./sim/dom-shim");

const root = path.resolve(__dirname, "..");
const goldenFile = path.join(__dirname, "golden", "calls.json");
const ANCHOR = "  setTimeout(maybeShowTutorial, 500);\n";
const FIXED_DATE_MS = new Date(2026, 0, 15, 12, 0, 0).getTime();
const FRAME_MS = 5000;

const update = process.argv.includes("--update");

const SHOTS = [
  { name: "run", min: 700, setup: (api) => { api.setState("MENU"); api.startGame(); } },
  { name: "menu-avatars", min: 900, setup: (api) => { api.setState("MENU"); api.menuState.tab = "avatars"; api.menuState.swipe = 0; } },
  { name: "menu-shop", min: 500, setup: (api) => { api.setState("MENU"); api.menuState.tab = "shop"; api.menuState.swipe = -1; } },
  { name: "menu-shop-owned", min: 800, setup: (api) => { api.setState("MENU"); api.menuState.tab = "shop"; api.menuState.swipe = -1; api.grantFrames([1, 2, 3, 21, 61, 141, 500]); } },
  { name: "menu-shop-rarity", min: 800, setup: (api) => { api.setState("MENU"); api.menuState.tab = "shop"; api.menuState.swipe = -1; api.grantFrames([1, 2, 3, 21, 61, 141, 500]); api.setSort("rarity"); } },
  { name: "menu-platforms", min: 450, setup: (api) => { api.setState("MENU"); api.menuState.tab = "platforms"; api.menuState.swipe = -2; } },
  { name: "menu-cards", min: 400, setup: (api) => { api.setState("MENU"); api.menuState.tab = "cards"; api.menuState.swipe = -3; } },
  { name: "settings", min: 400, setup: (api) => { api.setState("MENU"); api.openSettings(); } },
  { name: "pause", min: 900, setup: (api) => { api.setState("MENU"); api.startGame(); api.setState("PAUSE"); } },
  { name: "game-over", min: 450, setup: (api) => { api.setState("MENU"); api.startGame(); api.setState("GAMEOVER"); } },
  { name: "duel", min: 1500, setup: (api) => { api.setState("MENU"); api.startGame(); api.duelStart(0, 1, 200); } },
  { name: "train", min: 500, setup: (api) => { api.setState("MENU"); api.startGame(); api.openTrain(); } },
  { name: "frames", min: 1200, setup: (api) => { api.setState("MENU"); api.menuState.tab = "shop"; api.menuState.swipe = -1; api.grantFrames([21]); api.selectFrame(21); } },
  { name: "profile", min: 1200, setup: (api) => { api.setState("MENU"); api.openProfile(); } },
];

function formatArg(value) {
  if (typeof value === "number") return Math.round(value * 100) / 100;
  if (value === null || value === undefined) return String(value);
  if (typeof value === "object") return "[obj]";
  return String(value).slice(0, 60);
}

function loadGame() {
  const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
  if (html.split(ANCHOR).length !== 2) throw new Error("якорь не найден в index.html");
  const patched = html.replace(
    ANCHOR,
    ANCHOR + "  globalThis.__api = { draw, startGame, menuState, openSettings, duelStart, setState: function (kind) { currentState = STATE[kind]; }, openTrain: function () { bossTrainOpen = true; }, openProfile: function () { openProfile(); }, grantFrames: function (ids) { for (const id of ids) if (!ownedFrames.includes(id)) ownedFrames.push(id); }, setSort: function (mode) { setFrameSort(mode); }, selectFrame: function (id) { selectedFrame = id; } };\n"
  );

  const sandbox = createSandbox();
  // Время и случайность заморожены: кадр воспроизводится один в один.
  // Присваивать прямо в sandbox бесполезно — у контекста свои глобальные объекты,
  // поэтому настройку делаем кодом внутри контекста.
  vm.runInContext(
    "var __seed = 1337;" +
      "Math.random = function () { __seed = (__seed * 1664525 + 1013904223) % 4294967296; return __seed / 4294967296; };" +
      "performance.now = function () { return " + FRAME_MS + "; };" +
  // Дата тоже замораживается: ежедневные задания зависят от неё, и без этого
  // эталоны разъезжались сами собой на смене суток.
  "var __FIXED_DATE = " + FIXED_DATE_MS + ";" +
  "var __RealDate = Date;" +
  "Date = function (a, b, c, d, e, f, g) {" +
  "  if (this instanceof Date) { return arguments.length === 0 ? new __RealDate(__FIXED_DATE) : new __RealDate(a, b, c, d, e, f, g); }" +
  "  return new __RealDate(__FIXED_DATE).toString();" +
  "};" +
  "Date.now = function () { return __FIXED_DATE; };" +
  "Date.parse = __RealDate.parse; Date.UTC = __RealDate.UTC; Date.prototype = __RealDate.prototype;" +
      "requestAnimationFrame = function () { return 0; };",
    sandbox,
    { filename: "golden-bootstrap" }
  );

  for (const code of extractScripts(patched)) {
    vm.runInContext(code, sandbox, { filename: "index.html#script", timeout: 60000 });
  }
  if (!sandbox.__api) throw new Error("не удалось выставить __api (якорь не сработал)");
  return sandbox;
}

/** Записывающий контекст: тот же объект, но методы складывают вызовы в массив. */
function instrument(sandbox) {
  const canvas = sandbox.document.getElementById("game");
  const ctx = canvas.getContext("2d");
  const calls = [];
  for (const key of Object.keys(ctx)) {
    const original = ctx[key];
    if (typeof original !== "function") continue;
    ctx[key] = function (...args) {
      if (calls.length < 300000) calls.push(key + "(" + args.map(formatArg).join(",") + ")");
      return original.apply(ctx, args);
    };
  }
  return calls;
}

function hashCalls(calls) {
  return crypto.createHash("sha256").update(calls.join("\n")).digest("hex").slice(0, 16);
}

function main() {
  const sandbox = loadGame();
  const calls = instrument(sandbox);
  const api = sandbox.__api;

  const known = fs.existsSync(goldenFile) ? JSON.parse(fs.readFileSync(goldenFile, "utf8")) : {};
  const next = { ...known };
  let failed = 0;

  for (const shot of SHOTS) {
    calls.length = 0;
    const errors = [];
    try {
      shot.setup(api);
    } catch (error) {
      errors.push(String(error.message || error));
    }
    try {
      api.draw(FRAME_MS);
    } catch (error) {
      errors.push("draw: " + String(error.message || error));
    }
    if (errors.length) {
      console.log("ОШИБКА " + shot.name.padEnd(16) + " " + errors.join("; "));
      failed++;
      continue;
    }

    const hash = hashCalls(calls);
    // Кадр, который почти ничего не нарисовал, — тоже регрессия: например, панель
    // перестала вызываться, а хеш при этом «стабильный».
    if (shot.min && calls.length < shot.min) {
      console.log("ПУСТО " + shot.name.padEnd(18) + " " + calls.length + " вызовов, минимум " + shot.min);
      failed++;
      continue;
    }
    const expected = known[shot.name];
    const info = " (" + calls.length + " вызовов)";

    if (update) {
      next[shot.name] = hash;
      console.log("эталон " + shot.name.padEnd(16) + " " + hash + info);
    } else if (!expected) {
      failed++;
      console.log("НЕТ   " + shot.name.padEnd(16) + " (запустите --update)");
    } else if (expected !== hash) {
      failed++;
      console.log("FAIL  " + shot.name.padEnd(16) + " было " + expected + ", стало " + hash + info);
    } else {
      console.log("ok    " + shot.name.padEnd(16) + " " + hash + info);
    }
  }

  if (update) {
    fs.mkdirSync(path.dirname(goldenFile), { recursive: true });
    fs.writeFileSync(goldenFile, JSON.stringify(next, null, 2) + "\n", "utf8");
    console.log("\nэталоны обновлены: tools/golden/calls.json");
    return;
  }
  if (failed) {
    console.error("\nотрисовка разошлась: " + failed);
    process.exit(1);
  }
  console.log("\nвсе кадры совпали с эталонами");
}

try {
  main();
} catch (error) {
  console.error("FAIL: " + (error.message || error));
  process.exit(1);
}
