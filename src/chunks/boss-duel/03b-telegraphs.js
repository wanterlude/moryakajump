  var duelBackdropCache = {};
  function duelBackdropFor(arena) {
    const key = arena || "shore";
    if (duelBackdropCache[key]) return duelBackdropCache[key];
    if (!duelBackdropCanvas) duelBackdropCanvas = duelBuildBackdrop();
    const cv = document.createElement("canvas");
    cv.width = DUEL_W;
    cv.height = DUEL_H;
    const c = cv.getContext("2d");
    c.drawImage(duelBackdropCanvas, 0, 0);
    if (key === "canyon") {
      duelArenaCanyon(c);
    } else if (key === "storm") {
      c.save();
      c.fillStyle = "rgba(8,22,48,0.46)";
      c.fillRect(0, 0, DUEL_W, DUEL_H);
      const stormSky = c.createLinearGradient(0, 0, 0, 340);
      stormSky.addColorStop(0, "rgba(6,16,38,0.92)");
      stormSky.addColorStop(0.55, "rgba(12,34,64,0.55)");
      stormSky.addColorStop(1, "rgba(12,34,64,0)");
      c.fillStyle = stormSky;
      c.fillRect(0, 0, DUEL_W, 340);
      // Клубящиеся тучи
      for (let i = 0; i < 5; i++) {
        const cx2 = 30 + i * 92;
        const cy2 = 52 + (i % 2) * 26;
        const cg = c.createRadialGradient(cx2, cy2, 4, cx2, cy2, 74);
        cg.addColorStop(0, "rgba(40,70,110,0.55)");
        cg.addColorStop(1, "rgba(16,36,64,0)");
        c.fillStyle = cg;
        c.beginPath();
        c.ellipse(cx2, cy2, 88, 42, 0, 0, Math.PI * 2);
        c.fill();
      }
      // Молнии
      const bolt = (x0, y0, len, seed) => {
        c.save();
        c.strokeStyle = "rgba(198,240,255,0.85)";
        c.lineWidth = 1.6;
        c.shadowColor = "rgba(150,220,255,0.9)";
        c.shadowBlur = 10;
        c.beginPath();
        let x = x0;
        let y = y0;
        c.moveTo(x, y);
        for (let i = 1; i <= 7; i++) {
          x += Math.sin(seed + i * 2.1) * 9;
          y += len / 7;
          c.lineTo(x, y);
        }
        c.stroke();
        c.restore();
      };
      bolt(46, 40, 190, 1.3);
      bolt(352, 24, 140, 4.7);
      // Наклонные полосы снега
      c.save();
      c.strokeStyle = "rgba(220,244,255,0.16)";
      c.lineWidth = 1;
      for (let i = 0; i < 60; i++) {
        const sx = (i * 67.3 + 11) % DUEL_W;
        const sy = (i * 113.7) % DUEL_H;
        c.beginPath();
        c.moveTo(sx, sy);
        c.lineTo(sx - 7, sy + 18);
        c.stroke();
      }
      c.restore();
      c.restore();
    } else if (key === "avalanche") {
      duelArenaAvalanche(c);
    } else if (key === "abyss") {
      c.save();
      // Глубина: от светлой воды вверху к чёрной бездне внизу.
      const depth = c.createLinearGradient(0, 0, 0, DUEL_H);
      depth.addColorStop(0, "rgba(10,54,78,0.9)");
      depth.addColorStop(0.25, "rgba(8,40,64,0.92)");
      depth.addColorStop(0.6, "rgba(5,24,44,0.96)");
      depth.addColorStop(1, "rgba(2,10,22,0.98)");
      c.fillStyle = depth;
      c.fillRect(0, 0, DUEL_W, DUEL_H);
      // Лучи света сверху.
      c.save();
      c.globalCompositeOperation = "lighter";
      for (let i = 0; i < 5; i++) {
        const x = 40 + i * 78;
        const g = c.createLinearGradient(x, 0, x + 30, 400);
        g.addColorStop(0, "rgba(150,230,255,0.16)");
        g.addColorStop(1, "rgba(150,230,255,0)");
        c.fillStyle = g;
        c.beginPath();
        c.moveTo(x - 16, 0);
        c.lineTo(x + 16, 0);
        c.lineTo(x + 52, 400);
        c.lineTo(x + 12, 400);
        c.closePath();
        c.fill();
      }
      c.restore();
      // Дальнее свечение глубин.
      const glow = c.createRadialGradient(200, 420, 20, 200, 420, 220);
      glow.addColorStop(0, "rgba(60,220,230,0.12)");
      glow.addColorStop(1, "rgba(60,220,230,0)");
      c.fillStyle = glow;
      c.beginPath();
      c.ellipse(200, 420, 220, 150, 0, 0, Math.PI * 2);
      c.fill();
      // Силуэты скал и водорослей.
      c.fillStyle = "rgba(3,16,30,0.8)";
      for (const p of [[0, 520, 60, 120], [400, 540, 70, 140], [60, 300, 14, 120], [340, 260, 12, 140]]) {
        c.beginPath();
        c.ellipse(p[0], p[1], p[2], p[3], 0, 0, Math.PI * 2);
        c.fill();
      }
      // Пузыри.
      c.fillStyle = "rgba(200,245,255,0.35)";
      for (let i = 0; i < 40; i++) {
        const x = (i * 71.3 + 9) % DUEL_W;
        const y = (i * 127.9) % DUEL_H;
        c.beginPath();
        c.arc(x, y, 1 + (i % 4) * 0.7, 0, Math.PI * 2);
        c.fill();
      }
      c.restore();
    }
    duelBackdropCache[key] = cv;
    return cv;
  }
  function duelDrawBackdrop(c) {
    c.drawImage(duelBackdropFor(duelState.arena), 0, 0);
    const t = duelState.frame;

    // Каньон и лавина — дневные арены: аврора им не идёт.
    if (duelState.arena !== "canyon" && duelState.arena !== "avalanche") {
      duelAuroraCloud(c, t, 0, "#6ff0c4", "#9de8ff", 1.25);
      duelAuroraCloud(c, t, 42, "#9d9bff", "#b6eaff", 0.85);
    }

    const tint = DUEL_PHASE_TINTS[duelState.level] || DUEL_PHASE_TINTS[0];
    if (tint !== DUEL_PHASE_TINTS[0]) {
      c.fillStyle = tint;
      c.fillRect(0, 0, DUEL_W, DUEL_H);
    }

    // Мягкий свет за боссом (на светлых аренах он только «съедает» силуэт).
    if (duelState.arena !== "canyon" && duelState.arena !== "avalanche") {
      c.save();
      c.globalCompositeOperation = "lighter";
      c.globalAlpha = 0.07 + 0.025 * Math.sin(t / 80);
      const spot = c.createRadialGradient(DUEL_W / 2, 200, 30, DUEL_W / 2, 200, 170);
      spot.addColorStop(0, "rgba(198,240,255,0.55)");
      spot.addColorStop(1, "rgba(198,240,255,0)");
      c.fillStyle = spot;
      c.fillRect(0, 30, DUEL_W, 360);
      c.restore();
    }

    // Живая атмосфера арен: свет в каньоне и позёмка у лавины.
    if (duelState.arena === "canyon") {
      c.save();
      c.globalCompositeOperation = "lighter";
      const pulse = 0.035 + 0.02 * Math.sin(t / 120) + 0.01 * Math.sin(t / 31);
      const shaft = c.createLinearGradient(300, 70, 170, 560);
      shaft.addColorStop(0, `rgba(255,246,214,${pulse * 2.2})`);
      shaft.addColorStop(0.55, `rgba(255,242,210,${pulse})`);
      shaft.addColorStop(1, "rgba(240,252,255,0)");
      c.fillStyle = shaft;
      c.beginPath();
      c.moveTo(278, 58);
      c.lineTo(318, 58);
      c.lineTo(258, 560);
      c.lineTo(104, 560);
      c.closePath();
      c.fill();
      for (let i = 0; i < 12; i++) {
        const p = (i * 0.081 + t * 0.00003) % 1;
        const px = 292 - p * 150 + Math.sin(i * 2.3 + t / 140) * 18;
        const py = 70 + p * 460;
        c.globalAlpha = 0.08 + 0.08 * Math.sin(t / 55 + i * 1.7);
        c.fillStyle = "#fff6dc";
        c.beginPath();
        c.arc(px, py, 0.7 + (i % 3) * 0.5, 0, Math.PI * 2);
        c.fill();
      }
      c.restore();
    } else if (duelState.arena === "avalanche") {
      c.save();
      for (let i = 0; i < 6; i++) {
        const px = 288 + Math.sin(t / 150 + i * 1.7) * 16 + (i % 2) * 20;
        const py = 140 + i * 72 + Math.cos(t / 180 + i) * 12;
        const pr = 26 + (i % 3) * 12;
        const pg = c.createRadialGradient(px, py, 2, px, py, pr);
        pg.addColorStop(0, "rgba(235,250,255,.12)");
        pg.addColorStop(1, "rgba(235,250,255,0)");
        c.fillStyle = pg;
        c.beginPath();
        c.arc(px, py, pr, 0, Math.PI * 2);
        c.fill();
      }
      c.strokeStyle = "rgba(214,240,252,.16)";
      c.lineWidth = 1;
      for (let i = 0; i < 26; i++) {
        const sx = (i * 43.7 + t * (3.2 + (i % 3))) % (DUEL_W + 60) - 30;
        const sy = (i * 71.3) % DUEL_H;
        c.beginPath();
        c.moveTo(sx, sy);
        c.lineTo(sx - 16, sy + 30);
        c.stroke();
      }
      c.restore();
    }

    // Снегопад
    c.save();
    for (const f of DUEL_SNOWFLAKES) {
      const y = (f.y + t * f.speed) % (DUEL_H + 30) - 15;
      const x = (f.x + Math.sin(t / 90 + f.phase) * (5 + f.depth * 7) + t * f.drift * 0.4) % (DUEL_W + 24) - 12;
      if (f.depth === 2) {
        c.globalAlpha = 0.1 + 0.07 * Math.sin(f.phase + t / 50);
        duelDrawGlow(c, x, y, f.r * 4.4, "#ffffff");
      } else {
        c.globalAlpha = (f.depth === 0 ? 0.22 : 0.34) + 0.14 * Math.sin(f.phase + t / 60);
        c.fillStyle = "#ffffff";
        c.beginPath();
        c.arc(x, y, f.r, 0, Math.PI * 2);
        c.fill();
      }
    }
    c.restore();

    // Позёмка у полки
    c.save();
    c.globalCompositeOperation = "lighter";
    for (let i = 0; i < 2; i++) {
      const my = DUEL_SHELF_TOP - 4 + i * 16;
      const mx = DUEL_W / 2 + Math.sin(t / 150 + i * 2) * 46;
      const mg = c.createRadialGradient(mx, my, 6, mx, my, 156);
      mg.addColorStop(0, `rgba(226,250,255,${0.05 - i * 0.015})`);
      mg.addColorStop(1, "rgba(226,250,255,0)");
      c.fillStyle = mg;
      c.beginPath();
      c.ellipse(mx, my, 176, 12 + i * 3, 0, 0, Math.PI * 2);
      c.fill();
    }
    c.restore();

    // Блики на льду
    c.save();
    for (const s of DUEL_ARENA_SPARKLES) {
      const k = Math.abs(Math.sin(s.phase + t / (54 / s.speed)));
      if (k < 0.62) continue;
      const a = (k - 0.62) / 0.38;
      c.globalCompositeOperation = "lighter";
      c.globalAlpha = a * 0.6;
      duelDrawGlow(c, s.x, s.y, s.r * 4.6, "#ffffff");
      c.globalAlpha = a * 0.85;
      c.fillStyle = "#ffffff";
      c.beginPath();
      c.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      c.fill();
    }
    c.restore();
  }
  function duelDraw(c) {
    if (!duelState.active) return;
    duelDrawBackdrop(c);
    duelDrawBossBody(c);
    // Телеграфы атак рисуются ПОВЕРХ тела босса: кольца, спирали и подписи
    // атак не должны прятаться за корпусом (их центр рождается в боссе).
    duelDrawTelegraph(c);
    duelDrawBullets(c);
    duelDrawPlayer(c);
    duelDrawParticles(c);
    duelDrawHud(c);
    duelDrawBanner(c);
  }
  var DUEL_ATTACK_LABELS = {
    aim: "ПРИЦЕЛ", ring: "КРУГ", sweep: "ВОЛНА", shards: "ОСКОЛКИ",
    lob: "СНЕЖКИ", spiral: "СПИРАЛЬ", cross: "КРЕСТ", hail: "ГРАД",
    geyser: "ГЕЙЗЕР", seeker: "ПОГОНЯ",
    tentacle: "ТЕНТАКЛИ", icewall: "ЛЕДЯНАЯ СТЕНА", bolt: "МОЛНИЯ",
    rockslide: "КАМНЕПАД", tide: "ПРИЛИВ"
  };
  function duelDashLine(c, x1, y1, x2, y2, color, width, dash, offset) {
    c.save();
    c.strokeStyle = color;
    c.lineWidth = width;
    c.setLineDash(dash || [5, 7]);
    c.lineDashOffset = offset || 0;
    c.beginPath();
    c.moveTo(x1, y1);
    c.lineTo(x2, y2);
    c.stroke();
    c.restore();
  }
  function duelWarnRing(c, x, y, r, color, alpha) {
    c.save();
    c.globalAlpha = alpha;
    c.strokeStyle = color;
    c.lineWidth = 2;
    c.beginPath();
    c.arc(x, y, r, 0, Math.PI * 2);
    c.stroke();
    c.fillStyle = duelHexToRgba(color, 0.12);
    c.fill();
    c.restore();
  }