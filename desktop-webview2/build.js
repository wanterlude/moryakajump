// Собирает самостоятельную (не браузерную) версию на WebView2.
//
//   node desktop-webview2/build.js
//
// Требует .NET SDK 8+ (собирает net48). Игроку .NET не нужен: 4.8 уже в Windows,
// а WebView2 Runtime программа проверит и поставит сама при первом запуске.
const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");

const root = path.resolve(__dirname, "..");
const here = __dirname;
const outDir = path.join(here, "build-out");
const appDir = path.join(outDir, "Moryaka Jump");

const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
const version = (html.match(/var GAME_VERSION = "([^"]+)"/) || [])[1] || "0.0.0";

const icon = path.join(root, "desktop", "icon.ico");

fs.rmSync(outDir, { recursive: true, force: true });

execFileSync(
  "dotnet",
  ["publish", here, "-c", "Release", "-o", appDir, "-p:Version=" + version, "-p:DebugType=none"],
  { stdio: "inherit" }
);

// WPF-обёртка не используется, а нативные загрузчики нужны только под x64.
const drop = [
  path.join(appDir, "Microsoft.Web.WebView2.Wpf.dll"),
  path.join(appDir, "runtimes", "win-arm64"),
  path.join(appDir, "runtimes", "win-x86"),
];
for (const target of drop) fs.rmSync(target, { recursive: true, force: true });

fs.copyFileSync(path.join(root, "index.html"), path.join(appDir, "index.html"));
for (const file of fs.readdirSync(root)) {
  if (/\.(jpg|jpeg|png)$/i.test(file)) fs.copyFileSync(path.join(root, file), path.join(appDir, file));
}
// icon.ico вшит в exe при сборке — отдельным файлом он не нужен.

const files = fs.readdirSync(appDir);
const total = files.reduce((sum, f) => {
  const p = path.join(appDir, f);
  const stat = fs.statSync(p);
  return sum + (stat.isFile() ? stat.size : 0);
}, fs.readdirSync(path.join(appDir, "runtimes"), { recursive: true }).reduce((sum, f) => {
  const p = path.join(appDir, "runtimes", f);
  try { const s = fs.statSync(p); return sum + (s.isFile() ? s.size : 0); } catch { return sum; }
}, 0));

const zip = path.join(outDir, "Moryaka-Jump-" + version + "-webview2.zip");
execFileSync("powershell.exe", [
  "-NoProfile", "-Command",
  "Compress-Archive -Path '" + appDir + "\\*' -DestinationPath '" + zip + "' -Force",
]);

const exeKb = Math.round(fs.statSync(path.join(appDir, "Moryaka-Jump.exe")).size / 1024);
console.log("готово: " + path.relative(root, zip));
console.log("  версия:   " + version);
console.log("  exe:      " + exeKb + " КБ");
console.log("  папка:    " + (total / 1024 / 1024).toFixed(2) + " МБ");
console.log("  архив:    " + (fs.statSync(zip).size / 1024 / 1024).toFixed(2) + " МБ");
