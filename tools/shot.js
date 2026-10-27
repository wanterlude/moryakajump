// Снимает экраны игры в headless Chrome — чтобы смотреть UI, не открывая браузер.
//
//   node tools/shot.js                       # все вкладки, 2x масштаб
//   node tools/shot.js --tabs=avatars,shop   # только эти
//   node tools/shot.js --width=1400 --height=1000 --scale=2
//
// Картинки кладутся в tools/shot-out/<вкладка>.png (каталог в .gitignore).
// Работает на копии index.html во временной папке: сама игра не меняется,
// в копию добавляется только хук, который открывает нужную вкладку меню.
const fs = require("fs");
const os = require("os");
const path = require("path");
const { spawnSync } = require("child_process");

const root = path.resolve(__dirname, "..");
const outDir = path.join(__dirname, "shot-out");

function arg(name, fallback) {
  const found = process.argv.find((a) => a.startsWith("--" + name + "="));
  return found ? found.split("=").slice(1).join("=") : fallback;
}

const tabs = arg("tabs", "avatars,shop,platforms").split(",").map((t) => t.trim()).filter(Boolean);
const width = Number(arg("width", 1400));
const height = Number(arg("height", 1000));
const scale = Number(arg("scale", 2));
const source = path.resolve(root, arg("file", "index.html"));
const label = arg("label", "");

const chromeCandidates = [
  path.join(process.env.ProgramFiles || "", "Google/Chrome/Application/chrome.exe"),
  path.join(process.env["ProgramFiles(x86)"] || "", "Google/Chrome/Application/chrome.exe"),
  path.join(process.env.LOCALAPPDATA || "", "Google/Chrome/Application/chrome.exe"),
  path.join(process.env["ProgramFiles(x86)"] || "", "Microsoft/Edge/Application/msedge.exe"),
  path.join(process.env.ProgramFiles || "", "Microsoft/Edge/Application/msedge.exe"),
];
const chrome = chromeCandidates.find((p) => p && fs.existsSync(p));
if (!chrome) {
  console.error("Не нашёл Chrome или Edge.");
  process.exit(1);
}

const ANCHOR = "  setTimeout(maybeShowTutorial, 500);\n";
const HOOK = String.raw`
  // --- только в копии для снимков ---
  try { localStorage.setItem("morjakaTutorialDone", "1"); } catch (e) {}
  try {
    var shotHash = (location.hash || "").replace(/^#/, "");
    if (shotHash.indexOf("shot=") === 0) {
      var shotTab = shotHash.slice(5) || "avatars";
      bankCoins = 4321;
      var shotIdx = -1;
      for (var si = 0; si < MENU_TABS.length; si++) if (MENU_TABS[si].id === shotTab) shotIdx = si;
      if (shotIdx >= 0) {
        menuState.tab = shotTab;
        menuState.tabAnim = -shotIdx;
        menuState.swipe = -shotIdx;
      }
      menuState.fadeT = 1;
      if (shotTab === "shop") gachaState.phase = "idle";
      if (shotTab === "platforms") menuCursors.platforms = 0;
      if (shotTab === "avatars2") menuCursors.avatars = 1;
      if (shotTab === "profile") openProfile();
      if (shotTab === "settings") openSettings();
      if (shotTab === "train") bossTrainOpen = true;
      if (shotTab === "train") {
        setTimeout(function () {
          try {
            window.requestAnimationFrame = function () { return 0; };
            draw(performance.now());
          } catch (e) {}
        }, 900);
      }
    }
  } catch (e) {}
  setTimeout(function () {
    try {
      var ov = document.getElementById("tutorialOverlay");
      if (ov) { ov.classList.remove("open"); ov.setAttribute("aria-hidden", "true"); }
    } catch (e) {}
  }, 700);
`;

const work = fs.mkdtempSync(path.join(os.tmpdir(), "mj-shot-"));
const html = fs.readFileSync(source, "utf8");
if (html.split(ANCHOR).length !== 2) throw new Error("anchor not found in index.html");
fs.writeFileSync(path.join(work, "shot.html"), html.replace(ANCHOR, ANCHOR + HOOK), "utf8");

for (const file of fs.readdirSync(root)) {
  if (/\.(jpg|jpeg|png|ico)$/i.test(file)) {
    fs.copyFileSync(path.join(root, file), path.join(work, file));
  }
}

fs.mkdirSync(outDir, { recursive: true });
const url = "file:///" + path.join(work, "shot.html").replace(/\\/g, "/");

for (const tab of tabs) {
  const out = path.join(outDir, (label ? label + "-" : "") + tab + ".png");
  if (fs.existsSync(out)) fs.unlinkSync(out);
  const res = spawnSync(
    chrome,
    [
      "--headless=new",
      "--no-sandbox",
      "--disable-dev-shm-usage",
      "--disable-crash-reporter",
      "--disable-breakpad",
      "--no-first-run",
      "--no-default-browser-check",
      "--disable-gpu",
      "--hide-scrollbars",
      "--allow-file-access-from-files",
      "--force-device-scale-factor=" + scale,
      "--window-size=" + width + "," + height,
      "--virtual-time-budget=4000",
      "--user-data-dir=" + path.join(work, "profile"),
      "--screenshot=" + out,
      url + "#shot=" + tab,
    ],
    { stdio: "ignore", timeout: 60000 }
  );
  if (!fs.existsSync(out)) {
    console.error("Не удалось снять " + tab + " (код " + res.status + ")");
    continue;
  }
  const kb = Math.round(fs.statSync(out).size / 1024);
  console.log("ok " + tab + " → tools/shot-out/" + tab + ".png (" + kb + " КБ)");
}
