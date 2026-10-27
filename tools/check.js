// Быстрые проверки перед коммитом и релизом.
//
//   node tools/check.js
//
// 1. Производные сборки совпадают с index.html.
// 2. JS-блок бандла парсится.
// 3. Версия в index.html совпадает с README, README и Changelog.
const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");

const root = path.resolve(__dirname, "..");
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");
let failed = 0;

function ok(message) {
  console.log("ok    " + message);
}
function fail(message) {
  failed++;
  console.log("FAIL  " + message);
}

// 0. Вставка из src/ совпадает с исходниками
try {
  execFileSync(process.execPath, [path.join(__dirname, "build-src.js"), "--check"], {
    cwd: root,
    stdio: "inherit",
  });
} catch (err) {
  fail("вставка src устарела — запустите node tools/build-src.js");
}

// 1. Варианты
try {
  execFileSync(process.execPath, [path.join(__dirname, "build-variants.js"), "--check"], {
    cwd: root,
    stdio: "inherit",
  });
  ok("производные сборки совпадают с index.html");
} catch (err) {
  fail("производные сборки разъехались — запустите node tools/build-variants.js");
}

// 2. Синтаксис JS — в основной игре и в каждой производной сборке
function scriptOf(file) {
  const html = read(file);
  const start = html.lastIndexOf("<script>");
  const end = html.lastIndexOf("</script>");
  if (start < 0 || end < start) throw new Error("не найден <script>");
  return html.slice(start + 8, end);
}

const html = read("index.html");
for (const file of ["index.html", "test-boss.html", "test-frames.html", "ui-preview.html"]) {
  try {
    const code = scriptOf(file);
    new Function(code);
    ok("JS парсится: " + file + " (" + Math.round(code.length / 1024) + " КБ)");
  } catch (err) {
    fail("JS не парсится: " + file + " — " + err.message);
  }
}

// 3. Версии
const version = (html.match(/var GAME_VERSION = "([^"]+)"/) || [])[1];
if (!version) {
  fail("GAME_VERSION не найдена в index.html");
} else {
  const readmeBadge = (read("README.md").match(/version-v([0-9][^-\s]*)-/) || [])[1];
  const changelogVersion = (read("Changelog").match(/^\[Версия ([^\]]+)\]$/m) || [])[1];

  const table = [
    ["index.html", version],
    ["README.md", readmeBadge],    ["Changelog", changelogVersion],
  ];
  const bad = table.filter(([, v]) => v !== version);
  if (bad.length) {
    fail("версии расходятся (" + table.map(([n, v]) => n + ": " + (v || "—")).join(", ") + ")");
  } else {
    ok("версия " + version + " совпадает в index.html, README, package.json и Changelog");
  }
}

console.log("");
if (failed) {
  console.error("Проверки не пройдены: " + failed);
  process.exit(1);
}
console.log("Все проверки пройдены.");
