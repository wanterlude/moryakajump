// Собирает крупные блоки index.html из файлов src/chunks/.
//
//   node tools/build-chunks.js          # пересобрать все куски
//   node tools/build-chunks.js --check  # проверить, что куски свежие
//
// Зачем: index.html остаётся единственным артефактом игры, но его 16 тысяч строк
// ядра и дуэлей теперь лежат отдельными файлами. Код вставляется дословно, без
// смены области видимости — поэтому поведение гарантированно не меняется, а
// golden-тесты это подтверждают.
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const indexFile = path.join(root, "index.html");
const chunksDir = path.join(root, "src", "chunks");
const manifestFile = path.join(chunksDir, "manifest.json");

const startMarker = (name) => `  // <<< chunk ${name}: начало — генерируется из src/chunks/ >>>\n`;
const endMarker = (name) => `  // <<< chunk ${name}: конец >>>\n`;

/** Вложенность скобок в конце текста, с учётом строк и комментариев. */
function depthAtEnd(text) {
  let depth = 0;
  let quote = null;
  let lineComment = false;
  let blockComment = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    const next = text[i + 1];
    if (lineComment) {
      if (ch === "\n") lineComment = false;
      continue;
    }
    if (blockComment) {
      if (ch === "*" && next === "/") { blockComment = false; i++; }
      continue;
    }
    if (quote) {
      if (ch === "\\") { i++; continue; }
      if (ch === quote) quote = null;
      continue;
    }
    if (ch === "/" && next === "/") { lineComment = true; i++; continue; }
    if (ch === "/" && next === "*") { blockComment = true; i++; continue; }
    if (ch === '"' || ch === "'" || ch === "`") { quote = ch; continue; }
    if (ch === "{" || ch === "(" || ch === "[") depth++;
    else if (ch === "}" || ch === ")" || ch === "]") depth--;
  }
  return depth;
}

function main() {
  const check = process.argv.includes("--check");
  const manifest = JSON.parse(fs.readFileSync(manifestFile, "utf8"));
  let html = fs.readFileSync(indexFile, "utf8");
  let changed = 0;
  const problems = [];

  for (const chunk of manifest.chunks) {
    // Кусок может быть одним файлом или склейкой нескольких частей по порядку.
    const files = chunk.parts ? chunk.parts.map((p) => path.join(chunksDir, p)) : [path.join(chunksDir, chunk.file)];
    const missing = files.filter((f) => !fs.existsSync(f));
    if (missing.length) {
      problems.push("нет файлов: " + missing.map((f) => path.relative(root, f)).join(", "));
      continue;
    }
    // Граница части должна быть на нулевой вложенности: иначе разрез прошёл
    // посреди функции. Исключение — последняя часть куска, после которой в
    // index.html остаётся закрытие внешней IIFE; сколько именно скобок там
    // открыто, сказано в манифесте (openBraces).
    const expectedTail = chunk.openBraces || 0;
    files.forEach((file, index) => {
      const depth = depthAtEnd(fs.readFileSync(file, "utf8"));
      const expected = index === files.length - 1 ? expectedTail : 0;
      if (depth !== expected) {
        problems.push(
          "разрез посреди конструкции: " + path.relative(root, file) +
          " (глубина " + depth + ", ожидалось " + expected + ")"
        );
      }
    });

    const content = files.map((f) => fs.readFileSync(f, "utf8")).join("");
    const start = startMarker(chunk.name);
    const end = endMarker(chunk.name);

    const from = html.indexOf(start);
    const to = html.indexOf(end);
    if (from < 0 || to < 0 || to < from) {
      problems.push("нет маркеров для " + chunk.name);
      continue;
    }

    const current = html.slice(from + start.length, to);
    if (current === content) continue;

    if (check) {
      problems.push("кусок устарел: " + chunk.name);
      continue;
    }
    html = html.slice(0, from + start.length) + content + html.slice(to);
    changed++;
  }

  if (check) {
    if (problems.length) {
      for (const problem of problems) console.error("FAIL  " + problem);
      console.error("Запустите node tools/build-chunks.js");
      process.exit(1);
    }
    console.log("ok    куски в index.html совпадают с src/chunks/");
    return;
  }

  if (problems.length) {
    for (const problem of problems) console.error("FAIL  " + problem);
    process.exit(1);
  }

  if (!changed) {
    console.log("куски уже свежие");
    return;
  }
  fs.writeFileSync(indexFile, html, "utf8");
  console.log("пересобрано кусков: " + changed);
}

main();
