  function duelLerpWidth(widths, u) {
    const m = widths.length - 1;
    const pos = Math.max(0, Math.min(m, u * m));
    const i = Math.floor(pos);
    const f = pos - i;
    const a = widths[i];
    const b = widths[Math.min(m, i + 1)];
    return a + (b - a) * f;
  }
  function duelSmoothPath(pts, per) {
    const out = [];
    const n = pts.length;
    for (let i = 0; i < n - 1; i++) {
      const p0 = pts[Math.max(0, i - 1)];
      const p1 = pts[i];
      const p2 = pts[i + 1];
      const p3 = pts[Math.min(n - 1, i + 2)];
      for (let k = 0; k < per; k++) {
        const u = k / per;
        const u2 = u * u;
        const u3 = u2 * u;
        out.push([
          0.5 * (2 * p1[0] + (-p0[0] + p2[0]) * u + (2 * p0[0] - 5 * p1[0] + 4 * p2[0] - p3[0]) * u2 + (-p0[0] + 3 * p1[0] - 3 * p2[0] + p3[0]) * u3),
          0.5 * (2 * p1[1] + (-p0[1] + p2[1]) * u + (2 * p0[1] - 5 * p1[1] + 4 * p2[1] - p3[1]) * u2 + (-p0[1] + 3 * p1[1] - 3 * p2[1] + p3[1]) * u3)
        ]);
      }
    }
    if (n > 1) out.push([pts[n - 1][0], pts[n - 1][1]]);
    return out;
  }
  function duelFinWeb(c, x, y, ang, span, len, color, alpha, rays, sway) {
    c.save();
    c.translate(x, y);
    c.rotate(ang + sway);
    const g = c.createLinearGradient(0, 0, 0, len);
    g.addColorStop(0, duelHexToRgba(color, alpha));
    g.addColorStop(0.62, duelHexToRgba(color, alpha * 0.45));
    g.addColorStop(1, duelHexToRgba(color, 0.04));
    c.fillStyle = g;
    c.beginPath();
    c.moveTo(0, 0);
    c.quadraticCurveTo(span * 0.9, len * 0.45, span * 0.8, len);
    c.quadraticCurveTo(0, len * 0.78, -span * 0.8, len);
    c.quadraticCurveTo(-span * 0.9, len * 0.45, 0, 0);
    c.closePath();
    c.fill();
    c.strokeStyle = "rgba(255,255,255,0.5)";
    c.lineWidth = 1;
    c.stroke();
    c.strokeStyle = "rgba(255,255,255,0.38)";
    c.lineWidth = 0.8;
    const n = Math.max(2, rays);
    for (let r = 0; r < n; r++) {
      const f = r / (n - 1);
      const fr = -0.85 + f * 1.7;
      c.beginPath();
      c.moveTo(0, 0);
      c.quadraticCurveTo(fr * span, len * 0.42, fr * span * 0.8, len);
      c.stroke();
    }
    c.restore();
  }
  function duelLeviathanCrystal(c, x, y, h, w, lean, tint) {
    c.save();
    c.translate(x, y);
    c.rotate(lean);
    const tipY = -h;
    const grad = c.createLinearGradient(0, tipY, w * 0.5, 0);
    grad.addColorStop(0, "#ffffff");
    grad.addColorStop(0.4, "#d6f6ff");
    grad.addColorStop(0.78, "#8ecfe8");
    grad.addColorStop(1, "#4d93b4");
    c.fillStyle = grad;
    c.beginPath();
    c.moveTo(-w / 2, 0);
    c.lineTo(0, tipY);
    c.lineTo(w / 2, 0);
    c.quadraticCurveTo(0, -3, -w / 2, 0);
    c.closePath();
    c.fill();
    c.strokeStyle = "rgba(255,255,255,0.85)";
    c.lineWidth = 1;
    c.beginPath();
    c.moveTo(-w * 0.42, 0);
    c.lineTo(0, tipY);
    c.stroke();
    c.strokeStyle = "rgba(22,72,100,0.4)";
    c.lineWidth = 0.9;
    c.beginPath();
    c.moveTo(w * 0.42, 0);
    c.lineTo(0, tipY);
    c.stroke();
    if (tint) {
      c.save();
      c.globalCompositeOperation = "lighter";
      c.globalAlpha = 0.5;
      duelDrawGlow(c, 0, tipY, 3.4, tint);
      c.restore();
    }
    c.restore();
  }
  function duelLeviathanBackdrop(c, t, tension, accent) {
    c.save();
    const pulse = 1 + Math.sin(t / 52) * 0.02;
    const core = c.createRadialGradient(0, -8, 8, 0, -8, 112 * pulse);
    core.addColorStop(0, "rgba(4,15,29,0.34)");
    core.addColorStop(0.42, "rgba(6,24,43,0.2)");
    core.addColorStop(0.78, "rgba(8,30,52,0.06)");
    core.addColorStop(1, "rgba(8,30,52,0)");
    c.fillStyle = core;
    c.beginPath();
    c.ellipse(0, -12, 112 * pulse, 90 * pulse, 0, 0, Math.PI * 2);
    c.fill();
    // Лёгкое свечение вокруг силуэта.
    c.save();
    c.globalCompositeOperation = "lighter";
    c.globalAlpha = 0.08 + 0.03 * Math.sin(t / 46);
    const rim = c.createRadialGradient(0, 16, 26, 0, 16, 96 * pulse);
    rim.addColorStop(0, "rgba(120,222,255,0)");
    rim.addColorStop(0.72, "rgba(120,222,255,0)");
    rim.addColorStop(0.9, "rgba(140,228,255,0.16)");
    rim.addColorStop(1, "rgba(120,222,255,0)");
    c.fillStyle = rim;
    c.beginPath();
    c.ellipse(0, 12, 98 * pulse, 78 * pulse, 0, 0, Math.PI * 2);
    c.fill();
    c.restore();
    c.restore();
    // Холодные лучи за короной.
    c.save();
    c.globalCompositeOperation = "lighter";
    for (let i = 0; i < 3; i++) {
      const a = -2.4 + i * 0.22 + Math.sin(t / 90 + i) * 0.03;
      const len = 120 + i * 26 + tension * 18;
      const grad = c.createLinearGradient(0, -46, Math.cos(a) * len, -46 + Math.sin(a) * len);
      grad.addColorStop(0, "rgba(190,240,255,0.22)");
      grad.addColorStop(1, "rgba(190,240,255,0)");
      c.strokeStyle = grad;
      c.lineWidth = 16 - i * 4;
      c.lineCap = "round";
      c.beginPath();
      c.moveTo(0, -46);
      c.lineTo(Math.cos(a) * len, -46 + Math.sin(a) * len);
      c.stroke();
    }
    c.restore();
  }
  function duelLeviathanSplash(c, t, x, wl, accent) {
    c.save();
    c.globalAlpha = 0.85;
    // Тёмное мокрое пятно на воде.
    const wet = c.createRadialGradient(x, wl + 4, 4, x, wl + 4, 26);
    wet.addColorStop(0, "rgba(8,32,54,0.32)");
    wet.addColorStop(1, "rgba(8,32,54,0)");
    c.fillStyle = wet;
    c.beginPath();
    c.ellipse(x, wl + 4, 26, 8, 0, 0, Math.PI * 2);
    c.fill();
    // Отражённый холодный свет.
    c.save();
    c.globalCompositeOperation = "lighter";
    c.globalAlpha = 0.5;
    duelDrawGlow(c, x, wl, 38, "#bfeeff");
    c.restore();
    // Пенные дуги-волны вокруг змея.
    for (let i = 0; i < 3; i++) {
      const rr = 13 + i * 11;
      const a0 = t / 34 + i * 1.4;
      c.strokeStyle = "rgba(240,252,255,0.72)";
      c.lineWidth = 3.2 - i * 0.7;
      c.lineCap = "round";
      c.beginPath();
      c.ellipse(x, wl - 2 + Math.sin(a0) * 1.6, rr, rr * 0.42, 0, Math.PI * 0.12, Math.PI * 0.88);
      c.stroke();
      c.beginPath();
      c.ellipse(x, wl - 2 - Math.sin(a0) * 1.6, rr, rr * 0.42, 0, Math.PI * 1.12, Math.PI * 1.88);
      c.stroke();
    }
    // Брызги.
    c.fillStyle = "rgba(255,255,255,0.9)";
    for (let i = 0; i < 7; i++) {
      const ph = t / 16 + i * 1.9;
      const dx = x + Math.cos(ph) * (16 + (i % 3) * 8);
      const dy = wl - Math.abs(Math.sin(ph)) * 13 - 3;
      c.beginPath();
      c.arc(dx, dy, 1.5 + (i % 2), 0, Math.PI * 2);
      c.fill();
    }
    c.restore();
  }
  function duelLeviathanHead(c, t, tension, accent, look, blink, defeated) {
    const level = duelState.level || 0;
    const open = defeated ? 1 : duelClamp(tension * 1.45, 0, 1);
    const breath = 1 + Math.sin(t / 54) * 0.015;
    const tint = level >= 1 ? accent : null;
    const jawDrop = open * 15;
    c.save();
    c.scale(breath, breath);

    // ---- Жабры-перепонки за головой ----
    const flap = Math.sin(t / 26) * 0.1;
    for (const dir of [-1, 1]) {
      for (let i = 0; i < 3; i++) {
        const gy = -8 + i * 10;
        duelFinWeb(c, dir * (26 + i * 2), gy, dir * (0.55 + i * 0.16) + flap, 11, 22 - i * 3, "#8fd6ee", 0.5, 3, 0);
      }
    }

    // ---- Большие загнутые рога ----
    for (const dir of [-1, 1]) {
      c.save();
      c.beginPath();
      c.moveTo(dir * 16, -26);
      c.quadraticCurveTo(dir * 30, -40, dir * 43, -45);
      c.quadraticCurveTo(dir * 39, -56, dir * 29, -60);
      c.quadraticCurveTo(dir * 23, -45, dir * 12, -29);
      c.closePath();
      const hg = c.createLinearGradient(dir * 14, -28, dir * 40, -58);
      hg.addColorStop(0, "#eafaff");
      hg.addColorStop(0.5, "#9fd8ec");
      hg.addColorStop(1, "#4d93b4");
      c.fillStyle = hg;
      c.fill();
      c.strokeStyle = "rgba(12,48,72,0.5)";
      c.lineWidth = 1.2;
      c.stroke();
      c.strokeStyle = "rgba(255,255,255,0.75)";
      c.lineWidth = 0.9;
      c.beginPath();
      c.moveTo(dir * 18, -28);
      c.quadraticCurveTo(dir * 30, -42, dir * 40, -46);
      c.stroke();
      c.restore();
      if (tint) {
        c.save();
        c.globalCompositeOperation = "lighter";
        c.globalAlpha = 0.4;
        duelDrawGlow(c, dir * 38, -50, 4, tint);
        c.restore();
      }
      // Малый рог ближе к центру.
      duelLeviathanCrystal(c, dir * 9, -37, 20, 8, dir * 0.2, tint);
    }
    // Кристалл на лбу.
    duelLeviathanCrystal(c, 0, -40, 16, 9, 0, tint);

    // ---- Череп и длинное рыло (верхняя челюсть) ----
    const skull = c.createLinearGradient(0, -44, 0, 42);
    skull.addColorStop(0, "#ffffff");
    skull.addColorStop(0.34, "#e8f9fd");
    skull.addColorStop(0.68, "#9ad3e6");
    skull.addColorStop(1, "#4f95b5");
    c.fillStyle = skull;
    c.beginPath();
    c.moveTo(-22, -34);
    c.bezierCurveTo(-29, -20, -30, -8, -26, 0);
    c.lineTo(-19, 5);
    c.bezierCurveTo(-13, 20, -4, 34, 0, 42);
    c.bezierCurveTo(4, 34, 13, 20, 19, 5);
    c.lineTo(26, 0);
    c.bezierCurveTo(30, -8, 29, -20, 22, -34);
    c.quadraticCurveTo(0, -46, -22, -34);
    c.closePath();
    c.fill();
    c.strokeStyle = "rgba(10,44,68,0.62)";
    c.lineWidth = 2;
    c.stroke();

    // Ледяные пластины-надбровья вдоль рыла.
    c.fillStyle = "rgba(255,255,255,0.42)";
    c.beginPath();
    c.moveTo(-8, -6);
    c.lineTo(0, -20);
    c.lineTo(8, -6);
    c.lineTo(4, 8);
    c.lineTo(-4, 8);
    c.closePath();
    c.fill();
    c.beginPath();
    c.moveTo(-13, 16);
    c.lineTo(-6, 8);
    c.lineTo(-8, 25);
    c.closePath();
    c.fill();
    c.beginPath();
    c.moveTo(13, 16);
    c.lineTo(6, 8);
    c.lineTo(8, 25);
    c.closePath();
    c.fill();
    // Тёмный гребень по центру рыла.
    c.strokeStyle = "rgba(10,44,68,0.32)";
    c.lineWidth = 1.1;
    c.beginPath();
    c.moveTo(0, -22);
    c.lineTo(0, 33);
    c.stroke();

    // ---- Тяжёлые брови-навесы ----
    for (const dir of [-1, 1]) {
      c.save();
      c.beginPath();
      c.moveTo(dir * 6, -22);
      c.lineTo(dir * 30, -35);
      c.lineTo(dir * 28, -14);
      c.quadraticCurveTo(dir * 16, -10, dir * 6, -13);
      c.closePath();
      const bg = c.createLinearGradient(0, -35, 0, -12);
      bg.addColorStop(0, "#ffffff");
      bg.addColorStop(0.5, "#c4ecf9");
      bg.addColorStop(1, "#5fa8c6");
      c.fillStyle = bg;
      c.fill();
      c.strokeStyle = "rgba(10,44,68,0.5)";
      c.lineWidth = 1.2;
      c.stroke();
      c.restore();
    }

    // ---- Зев: тёмная полоса между челюстями ----
    if (open > 0.04 || defeated) {
      c.fillStyle = "#05202e";
      c.beginPath();
      c.moveTo(-19, 5);
      c.bezierCurveTo(-13, 20, -4, 34, 0, 42);
      c.bezierCurveTo(4, 34, 13, 20, 19, 5);
      c.lineTo(19, 5 + jawDrop);
      c.bezierCurveTo(13, 20 + jawDrop, 4, 34 + jawDrop, 0, 42 + jawDrop);
      c.bezierCurveTo(-4, 34 + jawDrop, -13, 20 + jawDrop, -19, 5 + jawDrop);
      c.closePath();
      c.fill();
      c.save();
      c.globalCompositeOperation = "lighter";
      c.globalAlpha = 0.2 + tension * 0.5;
      duelDrawGlow(c, 0, 22 + jawDrop * 0.6, 15 + tension * 14, accent);
      c.restore();
    }

    // ---- Нижняя челюсть ----
    c.save();
    c.translate(0, jawDrop);
    const jaw = c.createLinearGradient(0, 8, 0, 48);
    jaw.addColorStop(0, "#dff7ff");
    jaw.addColorStop(1, "#2f7fa4");
    c.fillStyle = jaw;
    c.beginPath();
    c.moveTo(-19, 5);
    c.bezierCurveTo(-13, 20, -4, 34, 0, 42);
    c.bezierCurveTo(4, 34, 13, 20, 19, 5);
    c.lineTo(19, 11);
    c.bezierCurveTo(13, 26, 4, 40, 0, 48);
    c.bezierCurveTo(-4, 40, -13, 26, -19, 11);
    c.closePath();
    c.fill();
    c.strokeStyle = "rgba(14,54,78,0.55)";
    c.lineWidth = 1.3;
    c.stroke();
    // Зубы нижней челюсти (смотрят вверх).
    c.fillStyle = "#ffffff";
    const lowerTeeth = [
      [-15, 12, 2.6], [-10, 20, 2.6], [-6, 27, 2.5], [-2, 34, 2.3],
      [3, 32, 2.4], [8, 25, 2.6], [12, 18, 2.6], [17, 11, 2.6]
    ];
    for (const [tx, ty, tw] of lowerTeeth) {
      c.beginPath();
      c.moveTo(tx - tw, ty);
      c.lineTo(tx, ty - 6.5);
      c.lineTo(tx + tw, ty);
      c.closePath();
      c.fill();
    }
    c.restore();

    // ---- Зубы верхней челюсти (смотрят вниз) ----
    c.fillStyle = "#ffffff";
    const upperTeeth = [
      [-16, 10, 2.6], [-12, 17, 2.6], [-8, 24, 2.5], [-4, 31, 2.3],
      [1, 30, 2.4], [5, 23, 2.5], [9, 16, 2.6], [13, 9, 2.6]
    ];
    for (const [tx, ty, tw] of upperTeeth) {
      c.beginPath();
      c.moveTo(tx - tw, ty);
      c.lineTo(tx, ty + 6.5);
      c.lineTo(tx + tw, ty);
      c.closePath();
      c.fill();
    }

    // ---- Ноздри у кончика рыла ----
    c.fillStyle = "rgba(16,58,82,0.55)";
    for (const dir of [-1, 1]) {
      c.beginPath();
      c.ellipse(dir * 4, 36, 1.8, 2.6, dir * 0.3, 0, Math.PI * 2);
      c.fill();
    }

    // ---- Щёчные шипы ----
    for (const dir of [-1, 1]) {
      for (let i = 0; i < 2; i++) {
        duelLeviathanCrystal(c, dir * (25 - i * 3), -4 + i * 8, 10 + i, 5, dir * (0.8 + i * 0.15), tint);
      }
    }

    // ---- Глаза ----
    if (defeated) {
      c.strokeStyle = "#0d3450";
      c.lineWidth = 2.6;
      c.lineCap = "round";
      for (const ex of [-15, 15]) {
        c.beginPath();
        c.moveTo(ex - 5.5, -22);
        c.lineTo(ex + 5.5, -12);
        c.moveTo(ex + 5.5, -22);
        c.lineTo(ex - 5.5, -12);
        c.stroke();
      }
    } else {
      c.save();
      c.globalCompositeOperation = "lighter";
      c.globalAlpha = 0.16 + tension * 0.26;
      duelDrawGlow(c, -15, -17, 18, accent);
      duelDrawGlow(c, 15, -17, 18, accent);
      c.restore();
      duelBossEye(c, -15, -17, look, blink, 1, accent);
      duelBossEye(c, 15, -17, look, blink, 1, accent);
    }

    // ---- Усы-щупальца из углов пасти ----
    for (const dir of [-1, 1]) {
      const wl2 = Math.sin(t / 22 + (dir > 0 ? 1 : 0)) * 3;
      c.save();
      c.translate(dir * 17, 8);
      c.rotate(dir * 0.5 + wl2 * 0.02);
      const bar = c.createLinearGradient(0, 0, dir * 10, 34);
      bar.addColorStop(0, "rgba(235,250,255,0.95)");
      bar.addColorStop(0.5, "rgba(150,220,240,0.6)");
      bar.addColorStop(1, "rgba(150,220,240,0.05)");
      c.fillStyle = bar;
      c.beginPath();
      c.moveTo(0, 0);
      c.quadraticCurveTo(dir * 10, 14, dir * 12, 32 - wl2);
      c.quadraticCurveTo(0, 24, -dir * 2, 9);
      c.closePath();
      c.fill();
      c.strokeStyle = "rgba(255,255,255,0.5)";
      c.lineWidth = 0.9;
      c.stroke();
      c.restore();
    }

    // ---- Кристаллы фазы 2 у висков ----
    if (level >= 2) {
      for (const dir of [-1, 1]) {
        duelLeviathanCrystal(c, dir * 27, -22, 16, 7, dir * 0.55, accent);
      }
    }

    // ---- Свечение трещин по фазам ----
    const crackCount = [1, 2, 3][level] || 1;
    for (let i = 0; i < crackCount; i++) {
      const a = t / 46 + i * 2.1;
      c.save();
      c.globalCompositeOperation = "lighter";
      c.globalAlpha = 0.3 + 0.2 * Math.sin(a * 2);
      c.fillStyle = accent;
      const cxp = -5 + i * 6;
      const cyp = -6 + Math.sin(a) * 2;
      c.beginPath();
      c.moveTo(cxp, cyp);
      c.lineTo(cxp + 4, cyp + 8);
      c.lineTo(cxp + 2, cyp + 15);
      c.lineTo(cxp - 3, cyp + 10);
      c.closePath();
      c.fill();
      c.restore();
    }
    c.restore();
  }
  function duelLeviathanBody(c) {
    const t = duelState.frame;
    const tension = duelTelegraphTension();
    const accent = DUEL_PHASE_COLORS[duelState.level] || DUEL_PHASE_COLORS[0];
    const level = duelState.level || 0;
    const defeated = duelState.over && duelState.won;
    const breathe = 1 + Math.sin(t / 38) * 0.032;
    const look = duelClamp((duelState.px + DUEL_PLAYER_HALF - duelState.bx) / 150, -1, 1) * 4;
    const blink = !defeated && t % 240 < 8;
    c.save();
    c.translate(duelState.bx, duelState.by + (defeated ? 16 : 0) + Math.sin(t / 34) * 2.5);
    if (defeated) c.rotate(-0.07 + Math.sin(t / 40) * 0.01);
    c.scale(breathe, breathe);

    const wl = DUEL_HORIZON - duelState.by;

    // Контрастная подложка: тёмная полынья и холодные лучи за короной.
    duelLeviathanBackdrop(c, t, tension, accent);

    // ---- Сегментированное тело-змей, восходящее из моря ----
    const sway = Math.sin(t / 55) * 3 + (defeated ? 5 : 0);
    const ptsC = [
      [-3, 8],
      [-20, 24],
      [-38, 42],
      [-52, 66],
      [-54, 92],
      [-40, 116],
      [-16, 134],
      [10, 150],
      [36, 168],
      [58, 190],
      [72, 212],
      [84, 234]
    ];
    const widths = [22, 24, 27, 30, 31, 30, 28, 26, 23, 19, 16, 13];
    // Живая змеиная волна: фаза бежит по телу, амплитуда растёт к хвосту.
    for (let i = 0; i < ptsC.length; i++) {
      const k = i / (ptsC.length - 1);
      const ph = t / 24 - i * 0.62;
      ptsC[i][0] += Math.sin(ph) * (2.2 + k * 6.5);
      ptsC[i][1] += Math.cos(ph) * (1.2 + k * 2.6) + sway * k;
    }
    const path = duelSmoothPath(ptsC, 4);
    const segs = [];
    for (let i = 0; i < path.length - 1; i++) {
      const a = path[i];
      const b = path[i + 1];
      const ang = Math.atan2(b[1] - a[1], b[0] - a[0]);
      const u = i / Math.max(1, path.length - 2);
      segs.push({ x: a[0], y: a[1], ang, w: duelLerpWidth(widths, u) });
    }
    // Хвост (глубоко под водой) → шея (ближе к зрителю).
    for (let s = segs.length - 1; s >= 0; s--) {
      const q = segs[s];
      const under = Math.max(0, (q.y - wl) / 56);
      const fade = under <= 0 ? 1 : Math.max(0.22, 0.85 - under * 0.55);
      c.save();
      c.translate(q.x, q.y);
      c.rotate(q.ang + Math.PI / 2);
      c.globalAlpha = fade;
      const len = q.w * 1.5;
      const bgrad = c.createLinearGradient(-q.w / 2, 0, q.w / 2, 0);
      bgrad.addColorStop(0, "#e6fbff");
      bgrad.addColorStop(0.26, "#a5daec");
      bgrad.addColorStop(0.62, "#66b1cf");
      bgrad.addColorStop(1, "#2e789e");
      c.fillStyle = bgrad;
      c.beginPath();
      c.ellipse(0, 0, q.w / 2, len / 2, 0, 0, Math.PI * 2);
      c.fill();
      c.strokeStyle = "rgba(10,44,68,0.5)";
      c.lineWidth = 1.2;
      c.stroke();
      // Верхняя световая кромка сегмента.
      c.strokeStyle = "rgba(255,255,255,0.72)";
      c.lineWidth = 1.2;
      c.beginPath();
      c.ellipse(0, -len * 0.1, q.w * 0.26, len * 0.36, 0, Math.PI * 0.1, Math.PI * 0.9);
      c.stroke();
      // Шипы-пластины по спине.
      if (s % 3 === 1 && q.y < wl) {
        const sp = q.w * 0.52;
        c.fillStyle = "rgba(226,250,255,0.85)";
        c.beginPath();
        c.moveTo(-q.w / 2 - sp * 0.3, -sp * 0.2);
        c.lineTo(-q.w / 2 - sp * 0.7, -sp * 0.9);
        c.lineTo(-q.w / 2 - sp * 0.15, -sp * 0.7);
        c.lineTo(-q.w / 2 + sp * 0.2, 0);
        c.closePath();
        c.fill();
        c.strokeStyle = "rgba(255,255,255,0.55)";
        c.lineWidth = 0.8;
        c.stroke();
      }
      c.restore();
    }
    // Светящийся брюшной шов вдоль всего тела.
    c.save();
    c.globalCompositeOperation = "lighter";
    c.strokeStyle = accent;
    c.globalAlpha = (defeated ? 0.12 : 0.3 + tension * 0.42);
    c.lineWidth = 2.4;
    c.lineCap = "round";
    c.beginPath();
    for (let i = 0; i < segs.length; i++) {
      const q = segs[i];
      const nx = -Math.sin(q.ang) * q.w * 0.22;
      const ny = Math.cos(q.ang) * q.w * 0.22;
      if (i === 0) c.moveTo(q.x + nx, q.y + ny - 8);
      else c.lineTo(q.x + nx, q.y + ny);
    }
    c.stroke();
    c.restore();
    // Тонкий тёмный подшёрсток снизу для объёма.
    c.save();
    c.strokeStyle = "rgba(8,34,54,0.35)";
    c.lineWidth = 2.6;
    c.beginPath();
    for (let i = 0; i < segs.length; i++) {
      const q = segs[i];
      const nx = Math.sin(q.ang) * q.w * 0.3;
      const ny = -Math.cos(q.ang) * q.w * 0.3;
      if (i === 0) c.moveTo(q.x + nx, q.y + ny + 9);
      else c.lineTo(q.x + nx, q.y + ny);
    }
    c.stroke();
    c.restore();

    // ---- Всплеск на линии воды ----
    let entry = null;
    for (let i = 0; i < segs.length; i++) {
      if (segs[i].y >= wl - 6) { entry = segs[i]; break; }
    }
    if (entry) duelLeviathanSplash(c, t, entry.x, wl, accent);

    // ---- Гирька ледяной фазы: кристаллы на теле ----
    for (let i = 0; i < level; i++) {
      const q = segs[Math.min(segs.length - 1, 6 + i * 5)];
      if (!q) continue;
      duelLeviathanCrystal(c, q.x + Math.sin(q.ang) * q.w * 0.4, q.y + Math.cos(q.ang) * q.w * 0.4, 13 + i * 4, 6, Math.sin(q.ang) * 0.3, accent);
    }

    // ---- Голова (покачивается независимо от тела) ----
    c.save();
    c.translate(Math.sin(t / 39) * 2.6, Math.sin(t / 31) * 3.2);
    c.rotate(Math.sin(t / 47) * 0.035);
    duelLeviathanHead(c, t, tension, accent, look, blink, defeated);
    c.restore();

    // ---- Орбитальные осколки и пузырьки ----
    for (let i = 0; i < 7; i++) {
      const a = t / 130 + i * 0.9;
      const r = 88 + Math.sin(t / 46 + i) * 9;
      c.save();
      c.translate(Math.cos(a) * r, Math.sin(a) * r * 0.5 + 10);
      c.rotate(a * 1.5);
      c.fillStyle = "rgba(226,250,255,0.34)";
      c.beginPath();
      c.moveTo(0, -4.8);
      c.lineTo(1.6, 0);
      c.lineTo(0, 4.8);
      c.lineTo(-1.6, 0);
      c.closePath();
      c.fill();
      c.restore();
    }
    for (let i = 0; i < 5; i++) {
      const a = t / 24 + i * 1.3;
      const r = 60 + (i % 3) * 14;
      const bx = Math.cos(a * 0.7) * r;
      const by = -70 + Math.abs(Math.sin(a)) * 22 + i * 6;
      c.save();
      c.globalCompositeOperation = "lighter";
      c.globalAlpha = 0.5;
      duelDrawGlow(c, bx, by, 3, "#dffcff");
      c.globalAlpha = 0.9;
      c.fillStyle = "#ffffff";
      c.beginPath();
      c.arc(bx, by, 1.6, 0, Math.PI * 2);
      c.fill();
      c.restore();
    }

    // ---- Вспышка при попадании ----
    if (duelState.flash > 0) {
      const flash = duelState.flash / 18;
      c.save();
      c.globalAlpha = Math.min(0.55, flash * 0.45);
      c.fillStyle = "#ffffff";
      c.beginPath();
      c.ellipse(0, -18, 46, 40, 0, 0, Math.PI * 2);
      c.fill();
      c.restore();
      if (duelState.flash > 8) {
        c.save();
        c.globalAlpha = Math.min(0.55, (duelState.flash - 8) / 12);
        c.strokeStyle = accent;
        c.lineWidth = 2.6;
        c.beginPath();
        c.arc(0, -14, 60 + (18 - duelState.flash) * 4.5, 0, Math.PI * 2);
        c.stroke();
        c.restore();
      }
    }
    c.restore();
  }