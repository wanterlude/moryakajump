// Публикует собранный exe в GitHub Releases (тег v<версия>).
const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

const pkg = require("./package.json");
const version = pkg.version;
const tag = "v" + version;
const exe = path.join(__dirname, "dist", `Moryaka-Jump-${version}.exe`);

if (!fs.existsSync(exe)) {
  console.error("Не найден файл сборки:", exe);
  process.exit(1);
}

function gh(args, silent) {
  const res = spawnSync("gh", args, { stdio: silent ? "ignore" : "inherit", shell: true });
  return res.status === 0;
}

const notes = [
  `Moryaka Jump ${version} — портативный Windows-сборник.`,
  "",
  "Запустите `Moryaka-Jump-" + version + ".exe`. Установка не нужна: прогресс хранится в папке пользователя.",
  "Исходная веб-версия — index.html в репозитории."
].join("\n");

if (gh(["release", "view", tag], true)) {
  console.log(`Релиз ${tag} уже есть — обновляю файл.`);
  if (!gh(["release", "upload", tag, exe, "--clobber"])) process.exit(1);
} else {
  console.log(`Создаю релиз ${tag}.`);
  if (!gh(["release", "create", tag, exe, "--title", `Moryaka Jump ${version}`, "--notes", notes])) process.exit(1);
}

console.log(`Готово: ${tag} → ${path.basename(exe)}`);
