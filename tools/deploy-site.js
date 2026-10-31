// Выкладывает игру на сайт wanterlude.ru по FTP и сверяет залитое побайтово.
//
//   node tools/deploy-site.js             # залить index.html и картинки
//   node tools/deploy-site.js --dry       # показать список файлов, ничего не заливать
//   node tools/deploy-site.js --only=index.html,fon.jpg
//
// Доступ берётся из файла %USERPROFILE%\.moryaka-ftp.json (лежит вне репозитория,
// чтобы пароль не попал в git):
//
//   { "host": "185.189.15.7", "user": "…", "pass": "…",
//     "dir": "/www/wanterlude.ru/moryaka-jump/" }
//
// Переменные окружения FTP_HOST / FTP_USER / FTP_PASS / FTP_DIR важнее файла.
// Ходим через curl.exe: он есть в Windows и умеет FTP без зависимостей.
const fs = require("fs");
const os = require("os");
const path = require("path");
const crypto = require("crypto");
const { execFileSync } = require("child_process");

const root = path.resolve(__dirname, "..");

function arg(name, fallback = "") {
  const hit = process.argv.find((a) => a.startsWith("--" + name + "="));
  return hit ? hit.slice(name.length + 3) : fallback;
}

const configPath = process.env.FTP_CONFIG || path.join(os.homedir(), ".moryaka-ftp.json");
const config = fs.existsSync(configPath) ? JSON.parse(fs.readFileSync(configPath, "utf8")) : {};

const host = arg("host", process.env.FTP_HOST || config.host || "");
const user = arg("user", process.env.FTP_USER || config.user || "");
const pass = arg("pass", process.env.FTP_PASS || config.pass || "");
let dir = arg("dir", process.env.FTP_DIR || config.dir || "/www/wanterlude.ru/moryaka-jump/");

if (!host || !user || !pass) {
  console.error("Нет доступа к FTP. Ожидаю " + configPath + " с полями host, user, pass, dir.");
  process.exit(1);
}
if (!dir.startsWith("/")) dir = "/" + dir;
if (!dir.endsWith("/")) dir += "/";

const dry = process.argv.includes("--dry");
const only = arg("only")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

// index.html — единственная сборка игры; картинки лежат рядом с ним и грузятся
// по относительным путям (1.jpg…27.jpg — аватары, fon.jpg — фон).
const media = fs
  .readdirSync(root)
  .filter((f) => f.toLowerCase().endsWith(".jpg") && fs.statSync(path.join(root, f)).isFile())
  .sort();
const files = only.length ? only : ["index.html", ...media];

for (const file of files) {
  if (!fs.existsSync(path.join(root, file))) {
    console.error("Нет файла: " + file);
    process.exit(1);
  }
}

function curl(args) {
  return execFileSync("curl.exe", args, { stdio: ["ignore", "pipe", "pipe"] });
}

function sha256(file) {
  return crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex");
}

const base = "ftp://" + host + dir;
const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "moryaka-deploy-"));

console.log("Куда: " + base);
console.log("Файлов: " + files.length);

let failed = 0;
for (const file of files) {
  const local = path.join(root, file);
  const size = fs.statSync(local).size;
  if (dry) {
    console.log("  " + file + " (" + Math.round(size / 1024) + " КБ)");
    continue;
  }
  try {
    curl(["-sS", "--connect-timeout", "30", "--max-time", "300", "-u", user + ":" + pass, "-T", local, base + file]);
  } catch (error) {
    failed++;
    console.error("  " + file + " — ошибка загрузки: " + String(error.stderr || error.message).trim());
    continue;
  }
  // Сверяем не «curl сказал ok», а байты: скачиваем обратно и сравниваем хеш.
  const back = path.join(tmpDir, file.replace(/[\\/]/g, "_"));
  try {
    curl(["-sS", "--connect-timeout", "30", "--max-time", "300", "-u", user + ":" + pass, "-o", back, base + file]);
  } catch (error) {
    failed++;
    console.error("  " + file + " — ошибка проверки: " + String(error.stderr || error.message).trim());
    continue;
  }
  if (sha256(back) !== sha256(local)) {
    failed++;
    console.error("  " + file + " — на сервере другой файл");
  } else {
    console.log("  " + file + " — ок (" + Math.round(size / 1024) + " КБ)");
  }
}

fs.rmSync(tmpDir, { recursive: true, force: true });

if (failed) {
  console.error("Не выложено файлов: " + failed);
  process.exit(1);
}
console.log(dry ? "Пробный прогон: ничего не залито." : "Готово: сайт совпадает с рабочей копией.");
