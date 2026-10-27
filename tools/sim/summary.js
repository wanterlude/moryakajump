// Сводка по забегам симулятора: перцентили, причины смерти, события.
// Чистые функции без зависимостей — используется tools/sim/run-node.js.

function pct(sorted, p) {
  if (!sorted.length) return 0;
  const i = Math.min(sorted.length - 1, Math.max(0, Math.round((p / 100) * (sorted.length - 1))));
  return sorted[i];
}

function summarize(rows) {
  const scores = rows.map((r) => r.score).sort((a, b) => a - b);
  const total = rows.length;
  const share = (n) => (total ? (n / total) * 100 : 0);

  const byCause = new Map();
  for (const r of rows) {
    const key = r.cause || "?";
    if (!byCause.has(key)) byCause.set(key, []);
    byCause.get(key).push(r.score);
  }
  const causes = [...byCause.entries()]
    .map(([cause, list]) => {
      const s = list.slice().sort((a, b) => a - b);
      return {
        cause,
        n: list.length,
        share: share(list.length),
        avg: s.reduce((a, b) => a + b, 0) / s.length,
        median: pct(s, 50),
        p90: pct(s, 90),
      };
    })
    .sort((a, b) => b.n - a.n);

  const buckets = [
    [0, 10000], [10000, 20000], [20000, 30000], [30000, 40000], [40000, 50000],
    [50000, 60000], [60000, 70000], [70000, 80000], [80000, 90000], [90000, 100000],
    [100000, Infinity],
  ].map(([lo, hi]) => ({
    label: hi === Infinity ? lo / 1000 + "k+" : lo / 1000 + "–" + hi / 1000 + "k",
    n: rows.filter((r) => r.score >= lo && r.score < hi).length,
  }));

  const eventNames = new Set();
  for (const r of rows) for (const e of r.events || []) eventNames.add(e);
  const events = [...eventNames]
    .map((name) => {
      const seen = rows.filter((r) => (r.events || []).includes(name));
      const deaths = seen.filter((r) => r.deathEvent === name);
      return {
        name,
        seen: seen.length,
        deaths: deaths.length,
        deathShare: seen.length ? (deaths.length / seen.length) * 100 : 0,
        avgDeath: deaths.length ? deaths.reduce((a, b) => a + b.score, 0) / deaths.length : 0,
      };
    })
    .sort((a, b) => b.seen - a.seen);

  const typeCount = new Map();
  for (const r of rows) {
    const t = r.lastType || "?";
    typeCount.set(t, (typeCount.get(t) || 0) + 1);
  }
  const lastTypes = [...typeCount.entries()]
    .map(([type, n]) => ({ type, n, share: share(n) }))
    .sort((a, b) => b.n - a.n);

  const duels = rows.filter((r) => r.duelReached);
  const duelClean = duels.filter((r) => (r.duelHits || []).length === 0);

  return {
    total,
    score: {
      min: scores[0] || 0,
      p10: pct(scores, 10),
      p25: pct(scores, 25),
      median: pct(scores, 50),
      p75: pct(scores, 75),
      p90: pct(scores, 90),
      p99: pct(scores, 99),
      max: scores[scores.length - 1] || 0,
      ge30k: rows.filter((r) => r.score >= 30000).length,
      ge60k: rows.filter((r) => r.score >= 60000).length,
      ge90k: rows.filter((r) => r.score >= 90000).length,
    },
    causes,
    buckets,
    events,
    lastTypes,
    nearPlatform: {
      le20: rows.filter((r) => r.platGap >= 0 && r.platGap <= 20).length,
      le60: rows.filter((r) => r.platGap >= 0 && r.platGap <= 60).length,
    },
    wind: {
      deathDuringWind: rows.filter((r) => r.deathWind).length,
      runsWithWind: rows.filter((r) => r.wind).length,
    },
    birds: { hits: rows.reduce((a, r) => a + (r.birdHits || 0), 0) },
    duels: {
      entered: duels.length,
      clean: duelClean.length,
      avgHits: duels.length
        ? duels.reduce((a, r) => a + (r.duelHits || []).length, 0) / duels.length
        : 0,
      startedWithZero: duels.filter((r) => r.duelStartLives === 0).length,
    },
  };
}

function toMarkdown(s, meta) {
  const p1 = (n) => n.toFixed(1).replace(".", ",");
  const nf = (n) => Math.round(n).toLocaleString("ru-RU").replace(/\u00a0/g, " ");
  const lines = [];
  lines.push("# Прогон симулятора — " + meta.stamp);
  lines.push("");
  lines.push(
    "Версия игры: " + meta.version + " · забегов: " + s.total + " · максимум шагов на забег: " + meta.steps
  );
  if (meta.skill != null && meta.skill < 1) {
    lines.push("");
    lines.push(
      "**Режим с ошибками:** навык бота " +
        meta.skill.toFixed(2) +
        " (реже пересматривает решение, дрожание прицела, промахи по прыжку). " +
        "Пропущено прыжков: " +
        (meta.missedJumps || 0) +
        "."
    );
  }
  lines.push("");
  lines.push("## Высота (очки)");
  lines.push("");
  lines.push("| Метрика | Значение |");
  lines.push("|---|---|");
  lines.push("| Минимум | " + nf(s.score.min) + " |");
  lines.push("| 10-й перцентиль | " + nf(s.score.p10) + " |");
  lines.push("| 25-й | " + nf(s.score.p25) + " |");
  lines.push("| Медиана | " + nf(s.score.median) + " |");
  lines.push("| 75-й | " + nf(s.score.p75) + " |");
  lines.push("| 90-й | " + nf(s.score.p90) + " |");
  lines.push("| 99-й | " + nf(s.score.p99) + " |");
  lines.push("| Максимум | **" + nf(s.score.max) + "** |");
  lines.push("| ≥ 30 000 | " + nf(s.score.ge30k) + " (" + p1((s.score.ge30k / s.total) * 100) + "%) |");
  lines.push("| ≥ 60 000 | " + nf(s.score.ge60k) + " (" + p1((s.score.ge60k / s.total) * 100) + "%) |");
  lines.push("| ≥ 90 000 | " + nf(s.score.ge90k) + " |");
  lines.push("");
  lines.push("## Причины смерти");
  lines.push("");
  lines.push("| Причина | Доля | Средняя высота | Медиана | 90-й перцентиль |");
  lines.push("|---|---|---|---|---|");
  for (const c of s.causes) {
    lines.push(
      "| " + c.cause + " | " + p1(c.share) + "% | " + nf(c.avg) + " | " + nf(c.median) + " | " + nf(c.p90) + " |"
    );
  }
  lines.push("");
  lines.push("## Высота смертей");
  lines.push("");
  lines.push("| Высота | Смертей |");
  lines.push("|---|---|");
  for (const b of s.buckets) lines.push("| " + b.label + " | " + b.n + " |");
  lines.push("");
  if (s.events.length) {
    lines.push("## События");
    lines.push("");
    lines.push("| Событие | Встретилось | Смертей | Доля смертей | Средняя высота смерти |");
    lines.push("|---|---|---|---|---|");
    for (const e of s.events) {
      lines.push(
        "| " + e.name + " | " + e.seen + " | " + e.deaths + " | " + p1(e.deathShare) + "% | " + nf(e.avgDeath) + " |"
      );
    }
    lines.push("");
  }
  lines.push("## Прочее");
  lines.push("");
  lines.push("| Метрика | Значение |");
  lines.push("|---|---|");
  lines.push("| Смерти в пределах 20 px от платформы | " + p1((s.nearPlatform.le20 / s.total) * 100) + "% |");
  lines.push("| Смерти в пределах 60 px | " + p1((s.nearPlatform.le60 / s.total) * 100) + "% |");
  lines.push("| Смерти при активном ветре | " + p1((s.wind.deathDuringWind / s.total) * 100) + "% |");
  lines.push("| Толчков птицами | " + s.birds.hits + " |");
  lines.push("| Входов в дуэль | " + s.duels.entered + " |");
  lines.push(
    "| Дуэлей без попаданий | " +
      s.duels.clean +
      " (" +
      p1((s.duels.clean / Math.max(1, s.duels.entered)) * 100) +
      "%) |"
  );
  lines.push("| Среднее число попаданий в дуэли | " + p1(s.duels.avgHits) + " |");
  lines.push("| Дуэлей, начатых с 0 жизней | " + s.duels.startedWithZero + " |");
  lines.push("");
  lines.push("## Последняя платформа перед смертью");
  lines.push("");
  lines.push("| Тип | Доля |");
  lines.push("|---|---|");
  for (const t of s.lastTypes) lines.push("| " + t.type + " | " + p1(t.share) + "% |");
  lines.push("");
  return lines.join("\n");
}

module.exports = { summarize, toMarkdown, pct };
