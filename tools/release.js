// Публикует релиз с аккуратно оформленными заметками.
//
//   node tools/release.js            # создать релиз v<версия> с exe
//   node tools/release.js --edit     # обновить заметки уже существующего релиза
//   node tools/release.js --draft    # черновик
//
// Заметки собираются из записи Changelog для текущей версии: строки «> пункт»
// становятся списком, к ним добавляются разделы «Как запустить» и «Управление».
const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");

const root = path.resolve(__dirname, "..");
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");

const html = read("index.html");
const versionArg = process.argv.find((a) => a.startsWith("--version="));
const version = versionArg ? versionArg.slice("--version=".length) : (html.match(/var GAME_VERSION = "([^"]+)"/) || [])[1];
if (!version) {
  console.error("Не нашёл GAME_VERSION в index.html");
  process.exit(1);
}

const tag = "v" + version;
const exe = path.join(root, "desktop-webview2", "build-out", `Moryaka-Jump-${version}.exe`);
const edit = process.argv.includes("--edit");
const draft = process.argv.includes("--draft");

// 1. Запись Changelog: от «[Версия X]» до следующей «[Версия …]».
const changelog = read("Changelog");
const block = changelog.split(new RegExp("(?=\\[Версия )")).find((part) => part.startsWith("[Версия " + version + "]"));
if (!block) {
  console.error("В Changelog нет записи для версии " + version);
  process.exit(1);
}
const items = block
  .split("\n")
  .slice(1)
  .map((line) => line.trim())
  .filter((line) => line.startsWith(">"))
  .map((line) => line.replace(/^>\s*/, "").trim())
  .filter(Boolean);

if (items.length === 0) {
  console.error("В записи Changelog нет строк «> пункт»");
  process.exit(1);
}

// 2. Собираем заметки.
const notes = [
  `## Что нового в ${version}`,
  "",
  ...items.map((item) => "- " + item),
  "",
  "## Как запустить",
  "",
  `1. Скачайте **\`Moryaka-Jump-${version}.exe\`** из блока Assets ниже — файл один, распаковывать не нужно.`,
  "2. Запустите его. Если компонент WebView2 Runtime не установлен, приложение само предложит поставить его (~2 МБ).",
  "",
  "**Требования:** Windows 10/11. Отдельный .NET ставить не нужно — 4.8 уже входит в систему.",
  "",
  "## Управление",
  "",
  "| Действие | Клавиатура | Геймпад |",
  "| --- | --- | --- |",
  "| Движение | ← → или A/D, мышь | левый стик, крестовина |",
  "| Прыжок | ↑, W, пробел | A, B, правый курок |",
  "| Пауза и продолжение | Esc | START |",
  "",
  "Чувствительность клавиш, мыши и геймпада настраивается в панели справа.",
  "",
  "---",
  "",
  `Полный список изменений — [Changelog](https://github.com/wanterlude/moryakajump/blob/main/Changelog).`,
  "",
].join("\n");

const notesFile = path.join(root, "desktop-webview2", "build-out", "release-notes.md");
fs.mkdirSync(path.dirname(notesFile), { recursive: true });
fs.writeFileSync(notesFile, notes, "utf8");

// 3. Публикация.
const repo = "wanterlude/moryakajump";
const args = edit
  ? ["release", "edit", tag, "--repo", repo, "--notes-file", notesFile]
  : ["release", "create", tag, "--repo", repo, "--title", "Moryaka Jump " + version, "--notes-file", notesFile];
if (draft && !edit) args.push("--draft");

if (!edit) {
  if (!fs.existsSync(exe)) {
    console.error("Нет собранного файла: " + path.relative(root, exe) + "\nСначала node desktop-webview2/build.js");
    process.exit(1);
  }
  args.splice(3, 0, exe);
}

execFileSync("gh", args, { stdio: "inherit" });
fs.rmSync(notesFile, { force: true });
console.log((edit ? "Заметки обновлены: " : "Релиз опубликован: ") + tag);
