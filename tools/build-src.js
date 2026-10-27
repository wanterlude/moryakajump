// Собирает модули из src/ в блок кода внутри index.html.
//
//   node tools/build-src.js          # пересобрать блок
//   node tools/build-src.js --check  # проверить, что блок в index.html свежий
//
// Зачем так, а не «index.html собирается целиком»: бандл остаётся единственным
// артефактом игры, exe и варианты ничего не знают про сборку. Растёт только
// вставка между маркерами — её и проверяем.
const fs = require("fs");
const path = require("path");
const esbuild = require("esbuild");

const root = path.resolve(__dirname, "..");
const indexFile = path.join(root, "index.html");

const START = "  // <<< src: начало вставки — править в src/, не здесь >>>\n";
const END = "  // <<< src: конец вставки >>>\n";

// Каждый модуль становится набором функций внутри IIFE игры.
const MODULES = [
  {
    entry: path.join(root, "src/game/field-layout.ts"),
    global: "__srcFieldLayout",
    exports: ["fieldLayout", "ringPhase", "polePulse"],
  },
  {
    entry: path.join(root, "src/game/spikes-layout.ts"),
    global: "__srcSpikes",
    exports: ["spikeLayout"],
  },
  {
    entry: path.join(root, "src/game/color.ts"),
    global: "__srcColor",
    exports: ["hexToRgba"],
  },
  {
    entry: path.join(root, "src/game/format.ts"),
    global: "__srcFormat",
    exports: ["fmt"],
  },
  {
    entry: path.join(root, "src/game/daily-date.ts"),
    global: "__srcDaily",
    exports: ["localDateKey", "yesterdayDateKey", "dailyHash"],
  },
  {
    entry: path.join(root, "src/game/perk-icons.ts"),
    global: "__srcPerkIcons",
    exports: ["drawPerkIconShape", "shieldGlyph"],
  },
];

function buildBlock() {
  const parts = [];
  for (const module of MODULES) {
    const result = esbuild.buildSync({
      entryPoints: [module.entry],
      bundle: true,
      format: "iife",
      globalName: module.global,
      target: "es2020",
      write: false,
      legalComments: "none",
    });
    const code = result.outputFiles[0].text.trimEnd();
    const aliases = module.exports
      .map((name) => `  var ${name} = ${module.global}.${name};`)
      .join("\n");
    parts.push(code + "\n" + aliases);
  }
  return START + parts.join("\n\n") + "\n" + END;
}

function main() {
  const check = process.argv.includes("--check");
  const html = fs.readFileSync(indexFile, "utf8");
  const block = buildBlock();

  const hasStart = html.includes(START);
  const hasEnd = html.includes(END);
  if (hasStart !== hasEnd) throw new Error("маркеры вставки src повреждены");

  if (check) {
    if (!hasStart) {
      console.error("FAIL: в index.html нет вставки src — запустите node tools/build-src.js");
      process.exit(1);
    }
    const from = html.indexOf(START);
    const to = html.indexOf(END) + END.length;
    const current = html.slice(from, to);
    if (current !== block) {
      console.error("FAIL: вставка src устарела — запустите node tools/build-src.js");
      process.exit(1);
    }
    console.log("ok    вставка src совпадает с src/");
    return;
  }

  let next;
  if (hasStart) {
    const from = html.indexOf(START);
    const to = html.indexOf(END) + END.length;
    next = html.slice(0, from) + block + html.slice(to);
  } else {
    // Первый раз вставляем перед функцией, которой эти модули служат.
    const anchor = "  function drawPlatformMagnet(p) {";
    if (!html.includes(anchor)) throw new Error("не нашёл точку вставки src");
    next = html.replace(anchor, block + "\n" + anchor);
  }

  if (next === html) {
    console.log("вставка уже свежая");
    return;
  }
  fs.writeFileSync(indexFile, next, "utf8");
  const lines = block.split("\n").length;
  console.log("вставка обновлена: " + lines + " строк");
}

main();
