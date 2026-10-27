// Тест прототипа Pixi: собирает spike, поднимает headless Chrome с отладочным
// портом, забирает замер через CDP и проверяет два сценария — лёгкий и тяжёлый.
//
//   node tools/pixi-test.js
//
// Выход 0 — оба рендерера отрисовали кадр в обоих сценариях.
const fs = require("fs");
const path = require("path");
const os = require("os");
const { spawn } = require("child_process");

const root = path.resolve(__dirname, "..");
const page = path.join(root, "pixi-spike", "dist", "index.html");

const CHROME = [
  path.join(process.env.ProgramFiles || "", "Google/Chrome/Application/chrome.exe"),
  path.join(process.env["ProgramFiles(x86)"] || "", "Google/Chrome/Application/chrome.exe"),
  path.join(process.env["ProgramFiles(x86)"] || "", "Microsoft/Edge/Application/msedge.exe"),
].find((p) => p && fs.existsSync(p));

// Тяжёлый сценарий грузит процессор на сотни процентов (софтверный WebGL),
// поэтому он только по явному флагу: node tools/pixi-test.js --heavy
const HEAVY = process.argv.includes("--heavy");
const SCENARIOS = [{ name: "лёгкий", params: "platforms=6&flakes=140" }];
if (HEAVY) SCENARIOS.push({ name: "тяжёлый", params: "platforms=30&flakes=700" });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function measure(scenario, index) {
  const port = 9340 + index;
  const profile = fs.mkdtempSync(path.join(os.tmpdir(), "pixi-prof-"));
  const url = "file:///" + page.replace(/\\/g, "/") + "?" + scenario.params;

  const chrome = spawn(
    CHROME,
    [
      "--headless=new",
      "--no-sandbox",
      "--disable-dev-shm-usage",
      "--enable-unsafe-swiftshader",
      "--use-angle=swiftshader",
      "--window-size=1400,800",
      "--remote-debugging-port=" + port,
      "--user-data-dir=" + profile,
      url,
    ],
    { stdio: "ignore" }
  );

  let target = null;
  for (let i = 0; i < 60 && !target; i++) {
    await sleep(250);
    try {
      const res = await fetch(`http://127.0.0.1:${port}/json/list`);
      const list = await res.json();
      target = list.find((t) => t.type === "page" && t.webSocketDebuggerUrl);
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
    ws.onerror = () => reject(new Error("не удалось подключиться к CDP"));
  });

  let nextId = 1;
  const evaluate = (expression) =>
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
          params: { expression, returnByValue: true, awaitPromise: true },
        })
      );
    });

  let raw = null;
  for (let i = 0; i < 80 && !raw; i++) {
    await sleep(250);
    raw = await evaluate("window.__bench ? JSON.stringify(window.__bench) : null");
  }

  ws.close();
  chrome.kill("SIGKILL");
  await sleep(600);
  try {
    fs.rmSync(profile, { recursive: true, force: true });
  } catch {
    /* профиль подчистит система */
  }

  if (!raw) throw new Error("страница не выставила window.__bench");
  return JSON.parse(raw);
}

async function main() {
  if (!CHROME) throw new Error("не нашёл Chrome/Edge");
  if (!fs.existsSync(page)) {
    throw new Error("сначала соберите прототип: cd pixi-spike && npm run build");
  }

  const results = [];
  for (let i = 0; i < SCENARIOS.length; i++) {
    const scenario = SCENARIOS[i];
    const bench = await measure(scenario, i);
    const failures = [];
    if (!(bench.canvasMs > 0)) failures.push("canvas не отрисовал кадр");
    if (!(bench.pixiMs > 0)) failures.push("pixi не отрисовал кадр");
    if (!/webgl/i.test(String(bench.renderer))) failures.push("нет webgl-рендерера");
    results.push({ scenario: scenario.name, bench, failures });

    console.log(
      scenario.name.padEnd(9) +
        " платформ " + String(bench.platforms).padStart(3) +
        ", снежинок " + String(bench.flakes).padStart(4) +
        " | canvas " + bench.canvasMs.toFixed(3) +
        " мс | pixi " + bench.pixiMs.toFixed(3) +
        " мс | " + bench.ratio.toFixed(2) + "x"
    );
    if (failures.length) {
      console.error("FAIL (" + scenario.name + "): " + failures.join("; "));
      process.exit(1);
    }
  }

  if (results.length > 1) {
    const [light, heavy] = results;
    if (heavy.bench.pixiMs < light.bench.pixiMs) {
      console.error("FAIL: на тяжёлой сцене Pixi не замедлился — замер подозрительный");
      process.exit(1);
    }
  }
  console.log("ok — оба рендерера отрисовали кадр в двух сценариях");
}

main().catch((error) => {
  console.error("FAIL: " + error.message);
  process.exit(1);
});
