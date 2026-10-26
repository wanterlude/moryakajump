// Публикует собранный exe в GitHub Releases (тег v<версия>).
const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

const pkg = require("./package.json");
const version = pkg.version;
const tag = "v" + version;
const exe = path.join(__dirname, "build-out", `Moryaka-Jump-${version}.exe`);

if (!fs.existsSync(exe)) {
  console.error("Не найден файл сборки:", exe);
  process.exit(1);
}

function gh(args, silent) {
  const res = spawnSync("gh", args, { stdio: silent ? "ignore" : "inherit" });
  if (res.error) console.error(res.error.message);
  return res.status === 0;
}

function changelogNotes() {
  try {
    const lines = fs.readFileSync(path.join(__dirname, "..", "Changelog"), "utf8").split(/\r?\n/);
    const start = lines.findIndex((line) => line.trim() === "[" + "Версия " + version + "]");
    if (start >= 0) {
      const out = [];
      for (let i = start + 1; i < lines.length; i++) {
        if (/^\[Версия /.test(lines[i])) break;
        out.push(lines[i].replace(/^> ?/, ""));
      }
      const body = out.join("\n").trim();
      if (body) return body;
    }
  } catch (e) {}
  return `Moryaka Jump ${version}.`;
}
const notes = changelogNotes();

if (gh(["release", "view", tag], true)) {
  console.log(`Релиз ${tag} уже есть — обновляю описание и файл.`);
  if (!gh(["release", "edit", tag, "--notes", notes])) process.exit(1);
  if (!gh(["release", "upload", tag, exe, "--clobber"])) process.exit(1);
} else {
  console.log(`Создаю релиз ${tag}.`);
  if (!gh(["release", "create", tag, exe, "--title", `Moryaka Jump ${version}`, "--notes", notes])) process.exit(1);
}

console.log(`Готово: ${tag} → ${path.basename(exe)}`);
