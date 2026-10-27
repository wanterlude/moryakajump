// Собирает производные сборки из index.html — единственного источника правды.
//
//   node tools/build-variants.js          перезаписать варианты
//   node tools/build-variants.js --check  только проверить, что файлы в дереве
//                                         совпадают с тем, что даёт сборка
//
// Варианты:
//   test-boss.html   index.html + панель выбора босса и числа жизней
//   test-frames.html index.html + галерея всех 211 рамок
//   ui-preview.html  index.html с версией «<версия>-ui» (превью для UI-аудита)
//
// Блоки вставки лежат в tools/variants/*.js.txt и вставляются после строки
// setTimeout(maybeShowTutorial, 500); — там же, где раньше правили руками.
// Переводы строк нормализуются в LF: в репозитории файлы всё равно хранятся в LF.
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const blocksDir = path.join(__dirname, "variants");
const ANCHOR = "  setTimeout(maybeShowTutorial, 500);\n";
const END_MARK = "  soundButton.addEventListener";

function read(file) {
  return fs.readFileSync(file, "utf8").replace(/\r\n/g, "\n");
}

function blockOf(name) {
  const block = read(path.join(blocksDir, name));
  if (!block.trim()) throw new Error("empty block: " + name);
  if (!block.endsWith("\n")) throw new Error("block must end with newline: " + name);
  return block;
}

const base = read(path.join(root, "index.html"));
if (base.split(ANCHOR).length !== 2) {
  throw new Error("anchor must occur exactly once in index.html: " + JSON.stringify(ANCHOR));
}
if (base.split(END_MARK).length !== 2) {
  throw new Error("end marker must occur exactly once in index.html: " + JSON.stringify(END_MARK));
}

const versionMatch = base.match(/var GAME_VERSION = "([^"]+)";/);
if (!versionMatch) throw new Error("GAME_VERSION not found in index.html");
const version = versionMatch[1];
if (/-/.test(version)) throw new Error("unexpected suffix in GAME_VERSION: " + version);

function withBlock(blockFile) {
  return base.replace(ANCHOR, ANCHOR + blockOf(blockFile));
}

const outputs = [
  { file: "test-boss.html", text: withBlock("boss-panel.js.txt") },
  { file: "test-frames.html", text: withBlock("frames-gallery.js.txt") },
  {
    file: "ui-preview.html",
    text: base.replace(versionMatch[0], 'var GAME_VERSION = "' + version + '-ui";'),
  },
];

const check = process.argv.includes("--check");
let drift = 0;

for (const out of outputs) {
  const target = path.join(root, out.file);
  const current = fs.existsSync(target) ? read(target) : null;
  const same = current === out.text;

  if (check) {
    if (same) {
      console.log("ok    " + out.file);
    } else {
      drift++;
      console.log("DRIFT " + out.file + (current === null ? " (missing)" : ""));
    }
    continue;
  }

  if (same) {
    console.log("same  " + out.file);
    continue;
  }
  fs.writeFileSync(target, out.text, "utf8");
  console.log("write " + out.file + " (" + out.text.split("\n").length + " lines)");
}

if (check) {
  if (drift) {
    console.error(
      "\n" + drift + " file(s) out of date. Run: node tools/build-variants.js"
    );
    process.exit(1);
  }
  console.log("\nAll variants up to date (version " + version + ").");
}
