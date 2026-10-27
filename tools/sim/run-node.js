// Прогоняет бота в sim.html прямо в Node — без браузера и без зависимостей.
//
//   node tools/sim/run-node.js --runs=500
//   node tools/sim/run-node.js --runs=5000 --steps=600000
//
// Пишет tools/sim/last-run.json (сырые забеги) и last-run.md (сводка).
// Перед запуском соберите sim.html: node tools/sim/make_sim.js
const fs = require("fs");
const path = require("path");
const { loadSim } = require("./dom-shim");
const { summarize, toMarkdown } = require("./summary");

function flag(name, fallback) {
  const found = process.argv.find((a) => a.startsWith(name + "="));
  return found ? Number(found.split("=")[1]) : fallback;
}

const runs = Math.max(1, flag("--runs", 500));
const steps = Math.max(1000, flag("--steps", 600000));
const chunkMs = Math.max(200, flag("--chunk", 2000));

const simPath = path.join(__dirname, "..", "..", "sim.html");
if (!fs.existsSync(simPath)) {
  console.error("Нет sim.html. Сначала: node tools/sim/make_sim.js");
  process.exit(1);
}

const started = Date.now();
const game = loadSim(simPath);
// GAME_VERSION объявлена внутри IIFE, снаружи её не видно — читаем из файла.
const version = (fs.readFileSync(simPath, "utf8").match(/var GAME_VERSION = "([^"]+)"/) || [])[1] || "?";
console.log("sim.html загружен, версия " + version + ", забегов " + runs);

game.__simInit(runs, steps);

const progressFile = path.join(__dirname, "last-run.log");
const logProgress = (text) => {
  try {
    fs.writeFileSync(progressFile, text + "\n");
  } catch {}
};

let done = false;
let shown = -1;
let lastBucket = -1;
let chunks = 0;
while (!done) {
  game.__simChunk(chunkMs);
  chunks++;
  const machine = game.__simMachine;
  if (machine.runs.length !== shown) {
    shown = machine.runs.length;
    const pct = Math.floor((shown / runs) * 100);
    // В неинтерактивном режиме (фоновый прогон) не пишем в stdout на каждый
    // забег: заполненный буфер пайпа блокирует процесс и роняет скорость в разы.
    if (process.stdout.isTTY) {
      process.stdout.write("\r  " + shown + "/" + runs + " (" + pct + "%)");
    } else {
      const bucket = Math.floor(shown / 25);
      if (bucket !== lastBucket) {
        lastBucket = bucket;
        logProgress(shown + "/" + runs + " (" + pct + "%)");
      }
    }
  }
  done = machine.done;
  if (chunks > 100000) throw new Error("симулятор не завершился за 100000 порций");
}
if (process.stdout.isTTY) process.stdout.write("\n");

const raw = game.__simMachine.runs;
const rows = raw.map((r) => ({
  score: r.score,
  cause: r.cause,
  deathY: r.deathY,
  lastType: r.lastType,
  platGap: r.platGap,
  events: Array.from(r.events || []),
  wind: r.wind,
  deathWind: r.deathWind,
  deathEvent: r.deathEvent,
  birdHits: r.birdHits,
  duelReached: r.duelReached,
  duelHits: r.duelHits,
  duelStartLives: r.duelStartLives,
  boss: r.boss,
  livesLost: r.livesLost,
}));

const summary = summarize(rows);
const meta = { version, steps, runs, stamp: new Date().toISOString() };
const seconds = ((Date.now() - started) / 1000).toFixed(1);

fs.writeFileSync(
  path.join(__dirname, "last-run.json"),
  JSON.stringify({ meta, summary, runs: rows }),
  "utf8"
);
fs.writeFileSync(path.join(__dirname, "last-run.md"), toMarkdown(summary, meta), "utf8");

console.log("готово за " + seconds + " с");
console.log(
  "высота: медиана " +
    Math.round(summary.score.median) +
    ", 90-й " +
    Math.round(summary.score.p90) +
    ", максимум " +
    Math.round(summary.score.max)
);
console.log("сводка: tools/sim/last-run.md");
