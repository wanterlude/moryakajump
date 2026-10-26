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
  const res = spawnSync("gh", args, { stdio: silent ? "ignore" : "inherit", shell: true });
  return res.status === 0;
}

function changelogNotes() {
  try {
    const text = fs.readFileSync(path.join(__dirname, "..", "Changelog"), "utf8");
    const escaped = version.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const match = text.match(new RegExp("^\\[Версия " + escaped + "\\]\\n([\\s\\S]*?)(?=^\\[Версия |\\s*$)", "m"));
    if (match && match[1].trim()) {
      return match[1].trim().replace(/^> ?/gm, "");
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
