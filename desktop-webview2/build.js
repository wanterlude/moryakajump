// Собирает ОДИН exe: игра, сборки WebView2 и нативный загрузчик внутри.
//
//   node desktop-webview2/build.js
//
// Требует .NET SDK 8+ (сама сборка — net48, игроку .NET ставить не нужно).
// Всё, что раньше лежало рядом с exe, теперь вшито в него как ресурсы.
const fs = require("fs");
const zlib = require("zlib");
const path = require("path");
const { execFileSync } = require("child_process");

const root = path.resolve(__dirname, "..");
const here = __dirname;
const outDir = path.join(here, "build-out");
const stage = path.join(here, "staging");
const publishDir = path.join(outDir, "publish");

const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
const version = (html.match(/var GAME_VERSION = "([^"]+)"/) || [])[1] || "0.0.0";

const cacheRoot = path.join(process.env.USERPROFILE || "", ".nuget", "packages", "microsoft.web.webview2");
const packageDir = fs.existsSync(cacheRoot)
  ? path.join(cacheRoot, fs.readdirSync(cacheRoot).sort().pop())
  : null;
if (!packageDir) {
  console.error("Не найден пакет Microsoft.Web.WebView2 в кэше NuGet — выполните dotnet restore.");
  process.exit(1);
}

fs.rmSync(outDir, { recursive: true, force: true });
fs.rmSync(stage, { recursive: true, force: true });
fs.mkdirSync(path.join(stage, "lib"), { recursive: true });
fs.mkdirSync(path.join(stage, "native"), { recursive: true });
fs.mkdirSync(path.join(stage, "assets"), { recursive: true });

// 1. Сборки WebView2 (managed) — грузятся из памяти через AssemblyResolve.
for (const name of ["Microsoft.Web.WebView2.Core.dll", "Microsoft.Web.WebView2.WinForms.dll"]) {
  fs.copyFileSync(path.join(packageDir, "lib", "net462", name), path.join(stage, "lib", name));
}
// 2. Нативный загрузчик — Windows грузит его с диска, поэтому он распаковывается
//    в %LOCALAPPDATA% при первом запуске.
fs.copyFileSync(
  path.join(packageDir, "runtimes", "win-x64", "native", "WebView2Loader.dll"),
  path.join(stage, "native", "WebView2Loader.dll")
);

// 3. Контент игры. HTML жмём gzip (экономит ~0,6 МБ), картинки уже сжаты.
const manifest = [];
const assets = ["index.html", ...fs.readdirSync(root).filter((f) => /\.(jpg|jpeg|png)$/i.test(f))];
for (const name of assets) {
  const raw = fs.readFileSync(path.join(root, name));
  if (/\.(html?|css|js)$/i.test(name)) {
    fs.writeFileSync(path.join(stage, "assets", name), zlib.gzipSync(raw, { level: 9 }));
    manifest.push(name + "|gz");
  } else {
    fs.writeFileSync(path.join(stage, "assets", name), raw);
    manifest.push(name + "|raw");
  }
}
fs.writeFileSync(path.join(stage, "assets", "manifest.txt"), manifest.join("\n") + "\n", "utf8");

// 4. Сборка.
execFileSync(
  "dotnet",
  ["publish", here, "-c", "Release", "-o", publishDir, "-p:Version=" + version, "-p:DebugType=none"],
  { stdio: "inherit" }
);

// 5. Из папки публикации оставляем только exe: всё прочее теперь внутри него.
const exe = path.join(publishDir, "Moryaka-Jump.exe");
for (const entry of fs.readdirSync(publishDir)) {
  if (entry.toLowerCase() === "moryaka-jump.exe") continue;
  fs.rmSync(path.join(publishDir, entry), { recursive: true, force: true });
}

const finalExe = path.join(outDir, "Moryaka-Jump.exe");
fs.renameSync(exe, finalExe);
fs.rmSync(publishDir, { recursive: true, force: true });
fs.rmSync(stage, { recursive: true, force: true });

const kb = Math.round(fs.statSync(finalExe).size / 1024);
console.log("готово: " + path.relative(root, finalExe));
console.log("  версия: " + version);
console.log("  размер: " + kb + " КБ (" + (kb / 1024).toFixed(2) + " МБ) — один файл, рядом ничего не нужно");
