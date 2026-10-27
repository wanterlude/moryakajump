// Golden-тесты кадра: снимаем детерминированный кадр игры и сравниваем хеш.
//
//   node tools/golden.js            # проверить против сохранённых хешей
//   node tools/golden.js --update   # перезаписать эталоны
//   node tools/golden.js --only=run # один кадр
//
// Детерминизм: в копии игры замораживаются performance.now() и Math.random,
// поэтому анимации и случайные элементы замирают в одном состоянии. Кадр
// снимается через CDP (Page.captureScreenshot): canvas.toDataURL здесь не
// годится — аватары из файлов помечают канвас как «испорченный».
const fs = require("fs");
const os = require("os");
const path = require("path");
const http = require("http");
const crypto = require("crypto");
const { spawn } = require("child_process");

const root = path.resolve(__dirname, "..");
const goldenDir = path.join(__dirname, "golden");
const goldenFile = path.join(goldenDir, "frames.json");
const ANCHOR = "  setTimeout(maybeShowTutorial, 500);\n";

const CHROME = [
  path.join(process.env.ProgramFiles || "", "Google/Chrome/Application/chrome.exe"),
  path.join(process.env["ProgramFiles(x86)"] || "", "Google/Chrome/Application/chrome.exe"),
  path.join(process.env["ProgramFiles(x86)"] || "", "Microsoft/Edge/Application/msedge.exe"),
].find((p) => p && fs.existsSync(p));

const update = process.argv.includes("--update");
const only = (process.argv.find((a) => a.startsWith("--only=")) || "").split("=")[1] || "";

const SHOTS = [
  { name: "run", hook: "startGame();" },
  { name: "menu-avatars", hook: "menuState.tab = 'avatars';" },
  { name: "menu-shop", hook: "menuState.tab = 'shop';" },
  { name: "menu-platforms", hook: "menuState.tab = 'platforms';" },
  { name: "settings", hook: "openSettings();" },
];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function hookFor(shot) {
  return `
  // --- golden-кадр: время и случайность заморожены ---
  (function () {
    var seed = 1337;
    Math.random = function () {
      seed = (seed * 1664525 + 1013904223) % 4294967296;
      return seed / 4294967296;
    };
    performance.now = function () { return 5000; };
    try {
      localStorage.setItem("morjakaTutorialDone", "1");
      var ov = document.getElementById("tutorialOverlay");
      if (ov) { ov.classList.remove("open"); ov.setAttribute("aria-hidden", "true"); }
    } catch (e) {}
    setTimeout(function () {
      try {
        ${shot.hook}
        window.requestAnimationFrame = function () { return 0; };
        draw(performance.now());
      } catch (e) {}
    }, 700);
  })();
`;
}

function serve(directory) {
  const server = http.createServer((req, res) => {
    const rel = decodeURIComponent((req.url || "/").split("?")[0]);
    const file = path.join(directory, rel);
    if (!file.startsWith(directory) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
      res.writeHead(404);
      res.end();
      return;
    }
    const ext = path.extname(file).toLowerCase();
    const type =
      ext === ".html" ? "text/html; charset=utf-8" :
      ext === ".jpg" || ext === ".jpeg" ? "image/jpeg" :
      ext === ".png" ? "image/png" :
      ext === ".ico" ? "image/x-icon" : "application/octet-stream";
    res.writeHead(200, { "Content-Type": type });
    fs.createReadStream(file).pipe(res);
  });
  return new Promise((resolve) => {
    server.listen(0, "127.0.0.1", () => resolve({ server, port: server.address().port }));
  });
}

async function capture(shot, port) {
  const work = fs.mkdtempSync(path.join(os.tmpdir(), "mj-golden-"));
  const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
  if (html.split(ANCHOR).length !== 2) throw new Error("якорь не найден в index.html");
  fs.writeFileSync(path.join(work, "golden.html"), html.replace(ANCHOR, ANCHOR + hookFor(shot)), "utf8");
  for (const file of fs.readdirSync(root)) {
    if (/\.(jpg|jpeg|png|ico)$/i.test(file)) {
      fs.copyFileSync(path.join(root, file), path.join(work, file));
    }
  }

  const { server, port: httpPort } = await serve(work);
  const profile = path.join(work, "profile");
  const chrome = spawn(
    CHROME,
    [
      "--headless=new",
      "--no-sandbox",
      "--disable-dev-shm-usage",
      "--hide-scrollbars",
      "--window-size=900,1000",
      "--remote-debugging-port=" + port,
      "--user-data-dir=" + profile,
      "http://127.0.0.1:" + httpPort + "/golden.html",
    ],
    { stdio: "ignore" }
  );

  const cleanup = () => {
    chrome.kill("SIGKILL");
    server.close();
  };

  let target = null;
  for (let i = 0; i < 60 && !target; i++) {
    await sleep(200);
    try {
      const res = await fetch(`http://127.0.0.1:${port}/json/list`);
      target = (await res.json()).find((t) => t.type === "page" && t.webSocketDebuggerUrl);
    } catch {
      /* порт ещё не поднялся */
    }
  }
  if (!target) {
    cleanup();
    throw new Error("Chrome не поднял отладочный порт");
  }

  const ws = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => {
    ws.onopen = resolve;
    ws.onerror = () => reject(new Error("не подключиться к CDP"));
  });

  let nextId = 1;
  const send = (method, params = {}) =>
    new Promise((resolve, reject) => {
      const id = nextId++;
      const onMessage = (event) => {
        const msg = JSON.parse(event.data);
        if (msg.id !== id) return;
        ws.removeEventListener("message", onMessage);
        if (msg.error) reject(new Error(msg.error.message));
        else resolve(msg.result);
      };
      ws.addEventListener("message", onMessage);
      ws.send(JSON.stringify({ id, method, params }));
    });

  const evaluate = async (expression) => {
    const result = await send("Runtime.evaluate", { expression, returnByValue: true });
    return result?.result?.value;
  };

  await sleep(1800);

  const rectJson = await evaluate(
    "JSON.stringify((function(){var r=document.getElementById('game').getBoundingClientRect();" +
      "return {x:r.x,y:r.y,width:r.width,height:r.height};})())"
  );
  if (!rectJson) {
    ws.close();
    cleanup();
    throw new Error("не нашёл canvas#game");
  }
  const rect = JSON.parse(rectJson);

  const shotResult = await send("Page.captureScreenshot", {
    format: "png",
    clip: { x: rect.x, y: rect.y, width: rect.width, height: rect.height, scale: 1 },
    captureBeyondViewport: false,
  });

  ws.close();
  cleanup();
  await sleep(400);
  try {
    fs.rmSync(work, { recursive: true, force: true });
  } catch {
    /* подчистит система */
  }

  if (!shotResult || !shotResult.data) throw new Error("кадр не снят");
  return shotResult.data;
}

async function main() {
  if (!CHROME) throw new Error("не нашёл Chrome/Edge");

  const selected = SHOTS.filter((s) => !only || s.name === only);
  if (!selected.length) throw new Error("нет такого кадра: " + only);

  fs.mkdirSync(goldenDir, { recursive: true });
  const known = fs.existsSync(goldenFile) ? JSON.parse(fs.readFileSync(goldenFile, "utf8")) : {};
  const next = { ...known };
  let failed = 0;

  for (let i = 0; i < selected.length; i++) {
    const shot = selected[i];
    const base64 = await capture(shot, 9360 + i);
    const hash = crypto.createHash("sha256").update(base64).digest("hex").slice(0, 16);
    const expected = known[shot.name];

    if (update) {
      next[shot.name] = hash;
      console.log("эталон " + shot.name.padEnd(16) + " " + hash);
      continue;
    }
    if (!expected) {
      failed++;
      console.log("НЕТ   " + shot.name.padEnd(16) + " (запустите --update)");
    } else if (expected !== hash) {
      failed++;
      console.log("FAIL  " + shot.name.padEnd(16) + " было " + expected + ", стало " + hash);
    } else {
      console.log("ok    " + shot.name.padEnd(16) + " " + hash);
    }
  }

  if (update) {
    fs.writeFileSync(goldenFile, JSON.stringify(next, null, 2) + "\n", "utf8");
    console.log("\nэталоны обновлены: tools/golden/frames.json");
    return;
  }
  if (failed) {
    console.error("\nкадры разошлись: " + failed);
    process.exit(1);
  }
  console.log("\nвсе кадры совпали с эталонами");
}

main().catch((error) => {
  console.error("FAIL: " + error.message);
  process.exit(1);
});
