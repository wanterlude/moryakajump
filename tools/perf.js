// Замер стоимости кадра в самой игре: поднимает копию index.html в headless
// Chrome, оборачивает draw() таймером и забирает статистику через CDP.
//
//   node tools/perf.js                 # обычный забег, 3 секунды
//   node tools/perf.js --event=darkness   # с включённым событием поверх
//   node tools/perf.js --seconds=5
//
// В отличие от tools/pixi-test.js --heavy, здесь работает сама игра, поэтому
// нагрузка обычная: один headless-процесс на несколько секунд.
const fs = require("fs");
const os = require("os");
const path = require("path");
const { spawn } = require("child_process");

const root = path.resolve(__dirname, "..");
const ANCHOR = "  setTimeout(maybeShowTutorial, 500);\n";

const CHROME = [
  path.join(process.env.ProgramFiles || "", "Google/Chrome/Application/chrome.exe"),
  path.join(process.env["ProgramFiles(x86)"] || "", "Google/Chrome/Application/chrome.exe"),
  path.join(process.env["ProgramFiles(x86)"] || "", "Microsoft/Edge/Application/msedge.exe"),
].find((p) => p && fs.existsSync(p));

function arg(name, fallback) {
  const found = process.argv.find((a) => a.startsWith("--" + name + "="));
  return found ? found.split("=").slice(1).join("=") : fallback;
}

const seconds = Number(arg("seconds", 3));
const event = arg("event", "");
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const HOOK = `
  // --- замер кадра: только в копии, игра не меняется ---
  try {
    var __perf = { times: [], frames: 0, event: ${JSON.stringify(event)} };
    window.__perf = __perf;
    var __origDraw = draw;
    draw = function (now) {
      var t0 = performance.now();
      __origDraw(now);
      var spent = performance.now() - t0;
      __perf.frames++;
      if (__perf.times.length < 2000) __perf.times.push(spent);
    };
    setTimeout(function () {
      try {
        var ov = document.getElementById("tutorialOverlay");
        if (ov) { ov.classList.remove("open"); ov.setAttribute("aria-hidden", "true"); }
        startGame();
        if (__perf.event) {
          activeEvents = [{ kind: __perf.event, power: 1, total: 60000, left: 59000 }];
          __perf.frames = 0;
          __perf.times.length = 0;
        }
      } catch (e) {}
    }, 400);
  } catch (e) {}
`;

async function main() {
  if (!CHROME) throw new Error("не нашёл Chrome/Edge");

  const work = fs.mkdtempSync(path.join(os.tmpdir(), "mj-perf-"));
  const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
  if (html.split(ANCHOR).length !== 2) throw new Error("якорь не найден в index.html");
  fs.writeFileSync(path.join(work, "perf.html"), html.replace(ANCHOR, ANCHOR + HOOK), "utf8");
  for (const file of fs.readdirSync(root)) {
    if (/\.(jpg|jpeg|png|ico)$/i.test(file)) {
      fs.copyFileSync(path.join(root, file), path.join(work, file));
    }
  }

  const port = 9350;
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
      "file:///" + path.join(work, "perf.html").replace(/\\/g, "/"),
    ],
    { stdio: "ignore" }
  );

  let target = null;
  for (let i = 0; i < 60 && !target; i++) {
    await sleep(250);
    try {
      const res = await fetch(`http://127.0.0.1:${port}/json/list`);
      target = (await res.json()).find((t) => t.type === "page" && t.webSocketDebuggerUrl);
    } catch {
      /* порт ещё не поднялся */
    }
  }
  if (!target) {
    chrome.kill("SIGKILL");
    throw new Error("Chrome не поднял отладочный порт");
  }

  const ws = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => {
    ws.onopen = resolve;
    ws.onerror = () => reject(new Error("не подключиться к CDP"));
  });

  let nextId = 1;
  const evaluate = (expression, awaitPromise = false) =>
    new Promise((resolve, reject) => {
      const id = nextId++;
      const onMessage = (event) => {
        const msg = JSON.parse(event.data);
        if (msg.id !== id) return;
        ws.removeEventListener("message", onMessage);
        if (msg.error) reject(new Error(msg.error.message));
        else resolve(msg.result?.result?.value);
      };
      ws.addEventListener("message", onMessage);
      ws.send(
        JSON.stringify({
          id,
          method: "Runtime.evaluate",
          params: { expression, returnByValue: true, awaitPromise },
        })
      );
    });

  // Ждём, пока игра стартует и наберёт кадры.
  await sleep(600 + seconds * 1000);

  const stats = await evaluate(`(() => {
    const p = window.__perf;
    const t = p.times.slice().sort((a, b) => a - b);
    const sum = t.reduce((a, b) => a + b, 0);
    const pick = (q) => t.length ? t[Math.min(t.length - 1, Math.floor(t.length * q))] : 0;
    return JSON.stringify({
      frames: t.length,
      avg: sum / Math.max(1, t.length),
      p50: pick(0.5),
      p95: pick(0.95),
      max: t.length ? t[t.length - 1] : 0,
      canvas: (() => { const c = document.getElementById("game"); return c ? c.width + "x" + c.height : "?"; })(),
      dpr: window.devicePixelRatio,
      state: typeof currentState !== "undefined" ? currentState : "?",
    });
  })()`);

  ws.close();
  chrome.kill("SIGKILL");
  await sleep(500);
  try {
    fs.rmSync(work, { recursive: true, force: true });
  } catch {
    /* подчистит система */
  }

  if (!stats) throw new Error("страница не отдала статистику");
  const s = JSON.parse(stats);
  if (!s.frames) throw new Error("не набралось ни одного кадра");

  console.log((event ? "событие: " + event : "обычный забег") + " | кадров: " + s.frames);
  console.log("канвас: " + s.canvas + ", dpr: " + s.dpr + ", состояние: " + s.state);
  console.log("draw(): среднее " + s.avg.toFixed(3) + " мс, медиана " + s.p50.toFixed(3));
  console.log("p95 " + s.p95.toFixed(3) + " мс, максимум " + s.max.toFixed(3) + " мс");
  console.log("ok");
}

main().catch((error) => {
  console.error("FAIL: " + error.message);
  process.exit(1);
});
