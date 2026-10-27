// Собирает «лёгкую» версию игры: крошечный exe-лаунчер + файлы игры в zip.
//
//   node desktop-lite/build.js          # собрать
//   node desktop-lite/build.js --keep   # оставить распакованную папку
//
// В отличие от Electron-сборки (desktop/), здесь не везётся Chromium:
// exe весит десятки килобайт и открывает игру в отдельном окне Edge.
const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");

const root = path.resolve(__dirname, "..");
const here = __dirname;
const outDir = path.join(here, "build-out");
const stage = path.join(outDir, "Moryaka Jump");
const keep = process.argv.includes("--keep");

const known = [
  path.join(process.env.WINDIR || "C:\\Windows", "Microsoft.NET\\Framework64\\v4.0.30319\\csc.exe"),
  path.join(process.env.WINDIR || "C:\\Windows", "Microsoft.NET\\Framework\\v4.0.30319\\csc.exe"),
];
const csc = known.find((p) => fs.existsSync(p));
if (!csc) {
  console.error("Не найден csc.exe из .NET Framework 4 — собрать лаунчер нечем.");
  process.exit(1);
}

const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
const version = (html.match(/var GAME_VERSION = "([^"]+)"/) || [])[1] || "0.0.0";

fs.rmSync(outDir, { recursive: true, force: true });
fs.mkdirSync(stage, { recursive: true });

const icon = path.join(root, "desktop", "icon.ico");
const exePath = path.join(stage, "Moryaka-Jump.exe");
const args = ["/nologo", "/target:winexe", "/optimize+", "/out:" + exePath];
if (fs.existsSync(icon)) args.push("/win32icon:" + icon);
args.push(path.join(here, "Launcher.cs"));
execFileSync(csc, args, { stdio: "inherit" });

fs.copyFileSync(path.join(root, "index.html"), path.join(stage, "index.html"));
for (const file of fs.readdirSync(root)) {
  if (/\.(jpg|jpeg|png)$/i.test(file)) fs.copyFileSync(path.join(root, file), path.join(stage, file));
}
if (fs.existsSync(icon)) fs.copyFileSync(icon, path.join(stage, "icon.ico"));

const exeKb = Math.round(fs.statSync(exePath).size / 1024);
const totalMb = fs.readdirSync(stage).reduce((sum, f) => sum + fs.statSync(path.join(stage, f)).size, 0) / 1024 / 1024;

const zip = path.join(outDir, "Moryaka-Jump-" + version + "-lite.zip");
execFileSync("powershell.exe", [
  "-NoProfile", "-Command",
  "Compress-Archive -Path '" + stage + "\\*' -DestinationPath '" + zip + "' -Force",
]);
const zipMb = fs.statSync(zip).size / 1024 / 1024;

console.log("готово: " + path.relative(root, zip));
console.log("  версия:     " + version);
console.log("  лаунчер:    " + exeKb + " КБ");
console.log("  папка игры: " + totalMb.toFixed(2) + " МБ");
console.log("  архив:      " + zipMb.toFixed(2) + " МБ");

if (!keep) fs.rmSync(stage, { recursive: true, force: true });
