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
const FRAME_MS = 5000;

const update = process.argv.includes("--update");

const SHOTS = [
  { name: "run", setup: (api) => api.startGame() },
  { name: "menu-avatars", setup: (api) => { api.menuState.tab = "avatars"; } },
  { name: "menu-shop", setup: (api) => { api.menuState.tab = "shop"; } },
  { name: "menu-platforms", setup: (api) => { api.menuState.tab = "platforms"; } },
  { name: "settings", setup: (api) => api.openSettings() },
  { name: "pause", setup: (api) => { api.startGame(); api.setState("PAUSE"); } },
  { name: "game-over", setup: (api) => { api.startGame(); api.setState("GAMEOVER"); } },
  { name: "duel", setup: (api) => { api.startGame(); api.duelStart(0, 1, 200); } },
  { name: "train", setup: (api) => { api.startGame(); api.openTrain(); } },
  { name: "frames", setup: (api) => { api.menuState.tab = "shop"; api.selectFrame(21); } },
  { name: "profile", setup: (api) => { api.openProfile(); } },
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
    ANCHOR + "  globalThis.__api = { draw, startGame, menuState, openSettings, duelStart, setState: function (kind) { currentState = STATE[kind]; }, openTrain: function () { bossTrainOpen = true; }, openProfile: function () { openProfile(); }, selectFrame: function (id) { selectedFrame = id; } };\n"
  );

  const sandbox = createSandbox();
  // Время и случайность заморожены: кадр воспроизводится один в один.
  // Присваивать прямо в sandbox бесполезно — у контекста свои глобальные объекты,
  // поэтому настройку делаем кодом внутри контекста.
  vm.runInContext(
    "var __seed = 1337;" +
      "Math.random = function () { __seed = (__seed * 1664525 + 1013904223) % 4294967296; return __seed / 4294967296; };" +
      "performance.now = function () { return " + FRAME_MS + "; };" +
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
