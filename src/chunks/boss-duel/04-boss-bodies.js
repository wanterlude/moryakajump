  function duelBossCrown(c, t, tension, accent) {
    const shards = [
      { x: -30, h: 24, w: 13, lean: -5 },
      { x: -16, h: 34, w: 16, lean: -2 },
      { x: 0, h: 44, w: 19, lean: 0 },
      { x: 16, h: 30, w: 15, lean: 3 },
      { x: 29, h: 22, w: 12, lean: 6 }
    ];
    const topY = -40;
    c.save();
    c.lineJoin = "round";
    for (let i = 0; i < shards.length; i++) {
      const s = shards[i];
      const tipX = s.x + s.lean;
      const tipY = topY - s.h;
      const grad = c.createLinearGradient(s.x, tipY, s.x + s.w * 0.4, topY + 8);
      grad.addColorStop(0, "#ffffff");
      grad.addColorStop(0.34, "#c9f2ff");
      grad.addColorStop(0.72, "#71c9e6");
      grad.addColorStop(1, "#3a97bb");
      c.beginPath();
      c.moveTo(s.x - s.w / 2, topY + 9);
      c.lineTo(tipX, tipY);
      c.lineTo(s.x + s.w / 2, topY + 9);
      c.quadraticCurveTo(s.x, topY + 3, s.x - s.w / 2, topY + 9);
      c.closePath();
      c.fillStyle = grad;
      c.fill();
      c.beginPath();
      c.moveTo(tipX, tipY);
      c.lineTo(s.x + s.w / 2, topY + 9);
      c.lineTo(s.x + s.w * 0.12, topY + 4);
      c.closePath();
      c.fillStyle = "rgba(255,255,255,0.3)";
      c.fill();
      c.strokeStyle = "rgba(18,74,102,0.3)";
      c.lineWidth = 1.1;
      c.beginPath();
      c.moveTo(s.x + s.w / 2, topY + 9);
      c.lineTo(tipX, tipY);
      c.stroke();
      c.strokeStyle = "rgba(255,255,255,0.75)";
      c.lineWidth = 0.9;
      c.beginPath();
      c.moveTo(s.x - s.w / 2, topY + 9);
      c.lineTo(tipX, tipY);
      c.stroke();
    }
    c.save();
    c.globalCompositeOperation = "lighter";
    c.globalAlpha = 0.16 + tension * 0.34;
    duelDrawGlow(c, 0, topY - 16, 32 + tension * 10, "#bfefff");
    c.restore();
    c.save();
    c.translate(0, topY - 12);
    const gemGrad = c.createLinearGradient(0, -9, 0, 9);
    gemGrad.addColorStop(0, "#ffffff");
    gemGrad.addColorStop(0.5, duelHexToRgba(accent, 0.95));
    gemGrad.addColorStop(1, "rgba(255,255,255,0.9)");
    c.fillStyle = gemGrad;
    c.beginPath();
    c.moveTo(0, -10);
    c.lineTo(7.5, 0);
    c.lineTo(0, 10);
    c.lineTo(-7.5, 0);
    c.closePath();
    c.fill();
    c.strokeStyle = "rgba(255,255,255,0.85)";
    c.lineWidth = 1;
    c.stroke();
    c.fillStyle = "rgba(255,255,255,0.9)";
    c.beginPath();
    c.moveTo(-1.5, -7);
    c.lineTo(2.5, -2);
    c.lineTo(-1.5, 2);
    c.closePath();
    c.fill();
    c.restore();
    for (let i = 0; i < 3; i++) {
      const a = t / 70 + i * 2.1;
      const sx = Math.cos(a) * (48 + i * 9);
      const sy = -58 + Math.sin(a * 1.3) * 12 - i * 8;
      const alpha = 0.35 + 0.35 * Math.abs(Math.sin(t / 40 + i));
      c.save();
      c.translate(sx, sy);
      c.rotate(a);
      c.fillStyle = `rgba(255,255,255,${alpha})`;
      c.beginPath();
      c.moveTo(0, -5);
      c.lineTo(1.6, 0);
      c.lineTo(0, 5);
      c.lineTo(-1.6, 0);
      c.closePath();
      c.fill();
      c.restore();
    }
    c.restore();
  }
  function duelBossBody(c) {
    const t = duelState.frame;
    const tension = duelTelegraphTension();
    const accent = DUEL_PHASE_COLORS[duelState.level] || DUEL_PHASE_COLORS[0];
    const breathe = 1 + Math.sin(t / 52) * 0.018;
    const defeated = duelState.over && duelState.won;
    c.save();
    c.translate(duelState.bx, duelState.by + (defeated ? 10 : 0));
    if (defeated) c.rotate(0.08);
    c.scale(breathe, breathe);

    // Аура и морозный ореол
    const shade = c.createRadialGradient(0, 34, 12, 0, 44, 122);
    shade.addColorStop(0, "rgba(12,58,86,0.13)");
    shade.addColorStop(0.65, "rgba(12,58,86,0.05)");
    shade.addColorStop(1, "rgba(12,58,86,0)");
    c.fillStyle = shade;
    c.beginPath();
    c.ellipse(0, 48, 118, 96, 0, 0, Math.PI * 2);
    c.fill();
    c.save();
    c.globalCompositeOperation = "lighter";
    c.globalAlpha = 0.18 + tension * 0.14;
    duelDrawGlow(c, 0, 8, 100, "#9fe3ff");
    c.globalAlpha = 0.12;
    duelDrawGlow(c, 0, 74, 66, accent);
    c.restore();
    c.save();
    c.strokeStyle = "rgba(214,246,255,0.28)";
    c.lineWidth = 1.2;
    c.setLineDash([10, 14]);
    c.lineDashOffset = -t * 0.5;
    c.beginPath();
    c.ellipse(0, 16, 74, 62, 0, 0, Math.PI * 2);
    c.stroke();
    c.restore();

    // Задний слой щупалец
    for (let i = 0; i < 3; i++) {
      const spread = (i - 1) * 1.15;
      const sway = Math.sin(t / 42 + i * 1.7) * 7;
      duelTentacle(c, spread * 18, 20, spread, 88 + i * 8, 14 - i * 2, sway, "#2f7f9f", "#14587a", false);
    }

    // Крона (позади купола, как ледяная корона)
    duelBossCrown(c, t, tension, accent);

    // Тело
    c.save();
    const bodyGrad = c.createRadialGradient(-16, -22, 8, 2, 6, 78);
    bodyGrad.addColorStop(0, "#ffffff");
    bodyGrad.addColorStop(0.2, "#e8fbff");
    bodyGrad.addColorStop(0.46, "#b3e6f7");
    bodyGrad.addColorStop(0.7, "#74c6e2");
    bodyGrad.addColorStop(0.88, "#3a92b7");
    bodyGrad.addColorStop(1, "#256f8e");
    c.fillStyle = bodyGrad;
    duelBossBodyPath(c);
    c.fill();
    c.strokeStyle = "rgba(20,76,102,0.22)";
    c.lineWidth = 1.2;
    duelBossBodyPath(c);
    c.stroke();

    c.save();
    duelBossBodyPath(c);
    c.clip();

    const bottomShade = c.createLinearGradient(0, -8, 0, 42);
    bottomShade.addColorStop(0, "rgba(14,72,102,0)");
    bottomShade.addColorStop(1, "rgba(12,64,92,0.34)");
    c.fillStyle = bottomShade;
    c.fillRect(-50, -8, 100, 52);

    // Фасетные ледяные пластины
    c.fillStyle = "rgba(255,255,255,0.2)";
    c.beginPath();
    c.moveTo(-46, 4);
    c.lineTo(-24, -34);
    c.lineTo(-2, -16);
    c.lineTo(-14, 22);
    c.closePath();
    c.fill();
    c.fillStyle = "rgba(255,255,255,0.13)";
    c.beginPath();
    c.moveTo(4, -18);
    c.lineTo(28, -36);
    c.lineTo(44, -6);
    c.lineTo(26, 20);
    c.closePath();
    c.fill();
    c.strokeStyle = "rgba(255,255,255,0.34)";
    c.lineWidth = 1;
    c.beginPath();
    c.moveTo(-24, -34);
    c.lineTo(-2, -16);
    c.lineTo(-14, 22);
    c.moveTo(-2, -16);
    c.lineTo(26, 20);
    c.moveTo(28, -36);
    c.lineTo(4, -18);
    c.stroke();

    // Тёплое свечение из-под мантии
    const corePulse = 0.55 + 0.45 * Math.sin(t / 24) + tension * 0.25;
    c.save();
    c.globalCompositeOperation = "lighter";
    c.globalAlpha = Math.min(1, 0.12 + corePulse * 0.12);
    duelDrawGlow(c, 0, 34, 44, accent);
    c.restore();

    // Бликовая полоса
    const sheen = c.createRadialGradient(-22, -28, 3, -22, -28, 30);
    sheen.addColorStop(0, "rgba(255,255,255,0.72)");
    sheen.addColorStop(0.55, "rgba(255,255,255,0.16)");
    sheen.addColorStop(1, "rgba(255,255,255,0)");
    c.fillStyle = sheen;
    c.beginPath();
    c.ellipse(-22, -28, 26, 18, -0.4, 0, Math.PI * 2);
    c.fill();

    duelBossCracks(c, duelState.level, t);
    c.restore();

    const rim = c.createLinearGradient(-44, -44, 22, 34);
    rim.addColorStop(0, "rgba(255,255,255,0.95)");
    rim.addColorStop(0.42, "rgba(255,255,255,0.3)");
    rim.addColorStop(1, "rgba(140,225,255,0)");
    c.strokeStyle = rim;
    c.lineWidth = 2.4;
    duelBossBodyPath(c);
    c.stroke();
    c.restore();

    // Мягкая тень под куполом, где выходят щупальца
    c.save();
    const rootShade = c.createRadialGradient(0, 38, 4, 0, 38, 62);
    rootShade.addColorStop(0, "rgba(10,60,88,0.2)");
    rootShade.addColorStop(0.6, "rgba(10,60,88,0.08)");
    rootShade.addColorStop(1, "rgba(10,60,88,0)");
    c.fillStyle = rootShade;
    c.beginPath();
    c.ellipse(0, 39, 58, 19, 0, 0, Math.PI * 2);
    c.fill();
    c.restore();

    // Лицо
    const look = duelClamp((duelState.px + DUEL_PLAYER_HALF - duelState.bx) / 150, -1, 1) * 4;
    const blink = !defeated && t % 230 < 8;
    if (defeated) {
      c.strokeStyle = "#0d3c56";
      c.lineWidth = 2.6;
      c.lineCap = "round";
      for (const ex of [-18, 18]) {
        c.beginPath();
        c.moveTo(ex - 7, -12);
        c.lineTo(ex + 7, 0);
        c.moveTo(ex + 7, -12);
        c.lineTo(ex - 7, 0);
        c.stroke();
      }
    } else {
      duelBossEye(c, -18, -8, look, blink, 1, accent);
      duelBossEye(c, 18, -8, look, blink, 1, accent);
    }

    // Пасть
    const my = 20.5;
    if (defeated) {
      c.fillStyle = "#0b344c";
      c.beginPath();
      c.ellipse(0, my + 2, 7, 8, 0, 0, Math.PI * 2);
      c.fill();
    } else {
      const open = 2.2 + tension * 10;
      if (tension <= 0.02) {
        c.strokeStyle = "rgba(14,60,82,0.8)";
        c.lineWidth = 2.6;
        c.lineCap = "round";
        c.beginPath();
        c.moveTo(-7.5, my);
        c.quadraticCurveTo(0, my + 5.5, 7.5, my);
        c.stroke();
      } else {
        const maw = c.createLinearGradient(0, my - open, 0, my + open);
        maw.addColorStop(0, "#123f58");
        maw.addColorStop(0.55, "#0a2b3e");
        maw.addColorStop(1, "#17536f");
        c.fillStyle = maw;
        c.beginPath();
        c.ellipse(0, my, 13, open, 0, 0, Math.PI * 2);
        c.fill();
        c.save();
        c.globalCompositeOperation = "lighter";
        c.globalAlpha = 0.25 + tension * 0.5;
        duelDrawGlow(c, 0, my + 2, 22 + tension * 10, accent);
        c.restore();
        c.fillStyle = "#f4feff";
        for (const fx of [-8, 0, 8]) {
          c.beginPath();
          c.moveTo(fx - 3, my - open + 0.5);
          c.lineTo(fx, my - open + 6.5);
          c.lineTo(fx + 3, my - open + 0.5);
          c.closePath();
          c.fill();
        }
        for (const fx of [-4, 5]) {
          c.beginPath();
          c.moveTo(fx - 3, my + open - 0.5);
          c.lineTo(fx, my + open - 6);
          c.lineTo(fx + 3, my + open - 0.5);
          c.closePath();
          c.fill();
        }
        c.strokeStyle = "rgba(255,255,255,0.35)";
        c.lineWidth = 1.1;
        c.beginPath();
        c.ellipse(0, my, 13, open, 0, 0, Math.PI * 2);
        c.stroke();
      }
    }

    // Передний слой щупалец
    for (let i = 0; i < 5; i++) {
      const spread = (i - 2) / 2;
      const sway = Math.sin(t / 36 + i * 1.3) * 9 + spread * 3;
      duelTentacle(
        c,
        spread * 26,
        39,
        spread * 0.95,
        96 + (i % 3) * 12,
        17 - Math.abs(spread) * 4,
        sway,
        "#8fdcf2",
        "#2f7fa4",
        i === 1 || i === 3
      );
    }

    // Морозный туман под щупальцами
    c.save();
    c.globalCompositeOperation = "lighter";
    c.globalAlpha = 0.1 + 0.04 * Math.sin(t / 30);
    const mist = c.createRadialGradient(0, 140, 4, 0, 140, 92);
    mist.addColorStop(0, "rgba(255,255,255,0.9)");
    mist.addColorStop(1, "rgba(255,255,255,0)");
    c.fillStyle = mist;
    c.beginPath();
    c.ellipse(0, 140, 92, 24, 0, 0, Math.PI * 2);
    c.fill();
    c.restore();

    // Снежинки-осколки на орбите
    c.save();
    for (let i = 0; i < 6; i++) {
      const a = t / 180 + i * 1.05;
      const r = 78 + Math.sin(t / 46 + i) * 5;
      const sx = Math.cos(a) * r;
      const sy = Math.sin(a) * r * 0.62 + 6;
      const alpha = 0.22 + 0.28 * Math.abs(Math.sin(t / 44 + i * 1.7));
      c.save();
      c.translate(sx, sy);
      c.rotate(a * 1.6);
      c.fillStyle = `rgba(236,252,255,${alpha})`;
      c.beginPath();
      c.moveTo(0, -3.6);
      c.lineTo(1.3, 0);
      c.lineTo(0, 3.6);
      c.lineTo(-1.3, 0);
      c.closePath();
      c.fill();
      c.restore();
    }
    c.restore();

    if (duelState.flash > 0) {
      const flash = duelState.flash / 18;
      c.save();
      c.globalAlpha = Math.min(0.5, flash * 0.42);
      c.fillStyle = "#ffffff";
      duelBossBodyPath(c);
      c.fill();
      c.restore();
      if (duelState.flash > 8) {
        c.save();
        c.globalAlpha = Math.min(0.55, (duelState.flash - 8) / 12);
        c.strokeStyle = accent;
        c.lineWidth = 2.6;
        c.beginPath();
        c.arc(0, 0, 58 + (18 - duelState.flash) * 4.5, 0, Math.PI * 2);
        c.stroke();
        c.restore();
      }
    }
    c.restore();
  }
  function duelYetiFur(c, x, y, scale, seed, color) {
    c.save();
    c.fillStyle = color;
    for (let i = 0; i < 7; i++) {
      const a = seed + i / 7 * Math.PI;
      const len = (5 + (i % 3) * 3) * scale;
      const bx2 = x + Math.cos(a) * 17 * scale;
      const by2 = y + Math.sin(a) * 15 * scale;
      c.beginPath();
      c.moveTo(bx2 - 3 * scale, by2);
      c.lineTo(bx2 + Math.cos(a) * len, by2 + Math.sin(a) * len);
      c.lineTo(bx2 + 3 * scale, by2);
      c.closePath();
      c.fill();
    }
    c.restore();
  }
  function duelAvalancheArmor(c, t, tension, defeated) {
    const pulse = 0.5 + 0.5 * Math.sin(t / 22) + tension * 0.5;
    const level = duelState.level;
    c.save();
    // Снежная мантия за плечами.
    c.save();
    const cape = c.createLinearGradient(0, -34, 0, 26);
    cape.addColorStop(0, "rgba(250,254,255,.92)");
    cape.addColorStop(0.55, "rgba(214,241,250,.75)");
    cape.addColorStop(1, "rgba(150,200,220,.25)");
    c.fillStyle = cape;
    c.beginPath();
    c.moveTo(-48, -8);
    c.quadraticCurveTo(0, -40, 48, -8);
    c.lineTo(38, 22);
    c.quadraticCurveTo(0, 8, -38, 22);
    c.closePath();
    c.fill();
    c.strokeStyle = "rgba(255,255,255,.7)";
    c.lineWidth = 1;
    c.stroke();
    c.restore();
    if (level >= 2 && !defeated) {
      c.save();
      c.globalCompositeOperation = "lighter";
      c.globalAlpha = 0.08 + level * 0.035;
      duelDrawGlow(c, 0, 8, 96, "#ffc247");
      c.restore();
    }
    // Каменные наплечники со снежными шапками.
    for (const dir of [-1, 1]) {
      c.save();
      c.translate(dir * 40, -18);
      c.rotate(dir * 0.16);
      const rock = c.createLinearGradient(0, -12, 0, 18);
      rock.addColorStop(0, "#7b8d99");
      rock.addColorStop(0.55, "#556873");
      rock.addColorStop(1, "#33434e");
      c.fillStyle = rock;
      c.beginPath();
      c.moveTo(-16, -8);
      c.lineTo(-6, -16);
      c.lineTo(12, -12);
      c.lineTo(17, 2);
      c.lineTo(8, 16);
      c.lineTo(-10, 13);
      c.closePath();
      c.fill();
      c.strokeStyle = "rgba(18,38,52,0.55)";
      c.lineWidth = 1.4;
      c.stroke();
      c.fillStyle = "rgba(245,253,255,.9)";
      c.beginPath();
      c.moveTo(-15, -8);
      c.quadraticCurveTo(-2, -17, 14, -10);
      c.quadraticCurveTo(2, -7, -15, -8);
      c.closePath();
      c.fill();
      c.strokeStyle = "rgba(255,194,71,.85)";
      c.lineWidth = 1.3;
      c.beginPath();
      c.moveTo(-6, -2);
      c.lineTo(2, 5);
      c.lineTo(-3, 11);
      c.stroke();
      c.restore();
    }
    // Нагрудная пластина с руной.
    c.save();
    const plate = c.createLinearGradient(0, -6, 0, 36);
    plate.addColorStop(0, "#7b8d99");
    plate.addColorStop(0.5, "#536672");
    plate.addColorStop(1, "#33434e");
    c.fillStyle = plate;
    c.beginPath();
    c.moveTo(-22, -6);
    c.lineTo(-14, 26);
    c.lineTo(0, 36);
    c.lineTo(14, 26);
    c.lineTo(22, -6);
    c.quadraticCurveTo(0, 2, -22, -6);
    c.closePath();
    c.fill();
    c.strokeStyle = "rgba(18,38,52,0.55)";
    c.lineWidth = 1.5;
    c.stroke();
    c.save();
    c.globalCompositeOperation = "lighter";
    c.globalAlpha = 0.22 + pulse * 0.24;
    duelDrawGlow(c, 0, 16, 26, "#ffc247");
    c.restore();
    c.strokeStyle = `rgba(255,194,71,${0.65 + pulse * 0.3})`;
    c.lineWidth = 1.7 + level * 0.3;
    c.beginPath();
    c.moveTo(0, 5);
    c.lineTo(0, 27);
    c.moveTo(-11, 15);
    c.lineTo(11, 15);
    c.moveTo(-6, 10);
    c.lineTo(6, 20);
    c.stroke();
    if (level >= 1) {
      c.strokeStyle = "rgba(10,28,42,.55)";
      c.lineWidth = 1.8;
      c.beginPath();
      c.moveTo(-18, 4);
      c.lineTo(-10, 12);
      c.lineTo(-15, 20);
      c.lineTo(-7, 28);
      c.stroke();
      c.save();
      c.globalCompositeOperation = "lighter";
      c.globalAlpha = 0.4;
      c.strokeStyle = "#ffc247";
      c.lineWidth = 1;
      c.stroke();
      c.restore();
    }
    if (level >= 2) {
      c.strokeStyle = "rgba(10,28,42,.55)";
      c.lineWidth = 1.8;
      c.beginPath();
      c.moveTo(18, 2);
      c.lineTo(12, 10);
      c.lineTo(18, 18);
      c.lineTo(10, 26);
      c.stroke();
      c.save();
      c.globalCompositeOperation = "lighter";
      c.globalAlpha = 0.4;
      c.strokeStyle = "#ffc247";
      c.lineWidth = 1;
      c.stroke();
      c.restore();
    }
    c.restore();
    // Каменная корона поверх головы.
    for (let i = 0; i < 5; i++) {
      const x = -26 + i * 13;
      const h = 18 + (i % 3) * 7;
      c.save();
      c.translate(x, -72);
      c.rotate((i - 2) * 0.12);
      const g = c.createLinearGradient(0, -h, 0, 8);
      g.addColorStop(0, "#f2fbff");
      g.addColorStop(0.45, "#a7d8e8");
      g.addColorStop(1, "#4f6270");
      c.fillStyle = g;
      c.beginPath();
      c.moveTo(-6, 8);
      c.lineTo(-2, -h);
      c.lineTo(2, -h * 0.55);
      c.lineTo(4, -h);
      c.lineTo(7, 8);
      c.closePath();
      c.fill();
      c.strokeStyle = "rgba(24,64,86,.36)";
      c.lineWidth = 1;
      c.stroke();
      c.restore();
    }
    // Тяжёлые каменные брови.
    c.strokeStyle = "rgba(34,54,68,.6)";
    c.lineWidth = 2.2;
    c.lineCap = "round";
    c.beginPath();
    c.moveTo(-23, -60);
    c.lineTo(-8, -56);
    c.moveTo(23, -60);
    c.lineTo(8, -56);
    c.stroke();
    // Парящие каменные осколки.
    for (let i = 0; i < 5; i++) {
      const a = t / 120 + i * 1.4;
      const r = 58 + Math.sin(t / 40 + i) * 7;
      const sx = Math.cos(a) * r;
      const sy = 4 + Math.sin(a * 1.3) * 42;
      c.save();
      c.translate(sx, sy);
      c.rotate(a * 1.7);
      c.fillStyle = "rgba(63,79,92,.72)";
      c.beginPath();
      c.moveTo(0, -5);
      c.lineTo(4, -1);
      c.lineTo(2, 5);
      c.lineTo(-4, 3);
      c.closePath();
      c.fill();
      c.strokeStyle = "rgba(255,194,71,.4)";
      c.lineWidth = 0.8;
      c.stroke();
      c.restore();
    }
    c.restore();
  }
  function duelYetiBody(c) {
    const t = duelState.frame;
    const tension = duelTelegraphTension();
    const accent = DUEL_PHASE_COLORS[duelState.level] || DUEL_PHASE_COLORS[0];
    const avalanche = duelBossKind() === "avalanche";
    const eyeAccent = avalanche ? "#ffc247" : accent;
    const defeated = duelState.over && duelState.won;
    const breathe = 1 + Math.sin(t / 46) * 0.02;
    const look = duelClamp((duelState.px + DUEL_PLAYER_HALF - duelState.bx) / 150, -1, 1);
    c.save();
    c.translate(duelState.bx, duelState.by + (defeated ? 14 : 0));
    if (defeated) c.rotate(-0.1);
    c.scale(breathe, breathe);

    // Холодная подложка: отделяет белую шерсть от светлой арены.
    const silhouette = c.createRadialGradient(0, 0, 18, 0, 2, 108);
    silhouette.addColorStop(0, "rgba(8,32,50,0.36)");
    silhouette.addColorStop(0.62, "rgba(8,32,50,0.18)");
    silhouette.addColorStop(1, "rgba(8,32,50,0)");
    c.fillStyle = silhouette;
    c.beginPath();
    c.arc(0, 2, 108, 0, Math.PI * 2);
    c.fill();

    // Тень и морозная аура
    const shade = c.createRadialGradient(0, 54, 8, 0, 58, 92);
    shade.addColorStop(0, "rgba(8,34,54,0.3)");
    shade.addColorStop(0.7, "rgba(8,34,54,0.1)");
    shade.addColorStop(1, "rgba(8,34,54,0)");
    c.fillStyle = shade;
    c.beginPath();
    c.ellipse(0, 58, 82, 22, 0, 0, Math.PI * 2);
    c.fill();
    c.save();
    c.globalCompositeOperation = "lighter";
    c.globalAlpha = 0.08 + tension * 0.08;
    duelDrawGlow(c, 0, 0, 82, "#9fe3ff");
    c.globalAlpha = 0.06;
    duelDrawGlow(c, 0, 40, 54, accent);
    c.restore();

    // Задние руки
    const armSway = Math.sin(t / 38) * 4;
    for (const dir of [-1, 1]) {
      c.save();
      c.translate(dir * 40, -6);
      c.rotate(dir * (0.5 + armSway * 0.01 + tension * 0.16));
      const armG = c.createLinearGradient(0, 0, dir * 16, 58);
      armG.addColorStop(0, "#dff6ff");
      armG.addColorStop(0.55, "#a8d9ea");
      armG.addColorStop(1, "#6ba7c1");
      c.fillStyle = armG;
      c.beginPath();
      c.ellipse(dir * 6, 26, 15, 30, dir * 0.18, 0, Math.PI * 2);
      c.fill();
      c.strokeStyle = "rgba(18,62,86,0.32)";
      c.lineWidth = 1.6;
      c.stroke();
      c.fillStyle = "#eafaff";
      c.beginPath();
      c.arc(dir * 9, 52, 11, 0, Math.PI * 2);
      c.fill();
      c.strokeStyle = "rgba(18,62,86,0.26)";
      c.lineWidth = 1.3;
      c.stroke();
      c.fillStyle = "#f4feff";
      for (let k = 0; k < 3; k++) {
        c.beginPath();
        c.moveTo(dir * (3 + k * 5), 58);
        c.lineTo(dir * (5 + k * 5), 68);
        c.lineTo(dir * (8 + k * 5), 58);
        c.closePath();
        c.fill();
      }
      c.restore();
    }

    // Ноги
    for (const dir of [-1, 1]) {
      c.save();
      const legG = c.createLinearGradient(dir * 18, 30, dir * 24, 62);
      legG.addColorStop(0, "#c7e9f5");
      legG.addColorStop(1, "#5d95b0");
      c.fillStyle = legG;
      c.beginPath();
      c.ellipse(dir * 22, 44, 16, 18, dir * 0.1, 0, Math.PI * 2);
      c.fill();
      c.strokeStyle = "rgba(18,62,86,0.3)";
      c.lineWidth = 1.5;
      c.stroke();
      c.restore();
    }

    // Торс: белая шерсть
    const torso = c.createRadialGradient(-16, -30, 6, 0, 0, 66);
    torso.addColorStop(0, "#ffffff");
    torso.addColorStop(0.42, "#eefaff");
    torso.addColorStop(0.68, "#b8dfee");
    torso.addColorStop(1, "#6fa6be");
    c.fillStyle = torso;
    c.beginPath();
    c.ellipse(0, 2, 45, 50, 0, 0, Math.PI * 2);
    c.fill();
    c.strokeStyle = "rgba(18,64,88,0.52)";
    c.lineWidth = 2.2;
    c.stroke();

    // Клочья шерсти по силуэту
    for (let i = 0; i < 14; i++) {
      const a = -Math.PI * 0.92 + (i / 13) * Math.PI * 1.84;
      const rx = 44;
      const ry = 49;
      const x = Math.cos(a) * rx;
      const y = 2 + Math.sin(a) * ry;
      const len = 6 + (i % 3) * 3 + Math.sin(t / 22 + i) * 1.4;
      c.fillStyle = i % 2 ? "rgba(240,252,255,0.95)" : "rgba(205,236,246,0.95)";
      c.beginPath();
      c.moveTo(x - 3, y);
      c.lineTo(x + Math.cos(a) * len, y + Math.sin(a) * len);
      c.lineTo(x + 3, y);
      c.closePath();
      c.fill();
    }

    // Светлый живот
    const belly = c.createRadialGradient(-6, 14, 4, 0, 18, 34);
    belly.addColorStop(0, "rgba(255,255,255,0.95)");
    belly.addColorStop(1, "rgba(255,255,255,0)");
    c.fillStyle = belly;
    c.beginPath();
    c.ellipse(0, 16, 26, 30, 0, 0, Math.PI * 2);
    c.fill();

    // Голова
    const headY = -46;
    const head = c.createRadialGradient(-12, headY - 8, 4, 0, headY, 40);
    head.addColorStop(0, "#ffffff");
    head.addColorStop(0.55, "#e6f8ff");
    head.addColorStop(1, "#8fc3d6");
    c.fillStyle = head;
    c.beginPath();
    c.ellipse(0, headY, 34, 30, 0, 0, Math.PI * 2);
    c.fill();
    c.strokeStyle = "rgba(18,64,88,0.5)";
    c.lineWidth = 1.9;
    c.stroke();

    // Ледяные рога
    for (const dir of [-1, 1]) {
      c.save();
      c.translate(dir * 24, headY - 18);
      c.rotate(dir * 0.5);
      const horn = c.createLinearGradient(0, 0, dir * 10, -34);
      horn.addColorStop(0, "#c9f2ff");
      horn.addColorStop(0.5, "#8fd8ee");
      horn.addColorStop(1, "#eafaff");
      c.fillStyle = horn;
      c.beginPath();
      c.moveTo(-6, 6);
      c.quadraticCurveTo(dir * 16, -16, dir * 22, -30);
      c.quadraticCurveTo(dir * 4, -18, 6, 4);
      c.closePath();
      c.fill();
      c.strokeStyle = "rgba(255,255,255,0.75)";
      c.lineWidth = 1;
      c.stroke();
      c.strokeStyle = "rgba(96,168,196,0.5)";
      c.lineWidth = 0.8;
      for (let i = 1; i <= 3; i++) {
        c.beginPath();
        c.moveTo(dir * i * 5, -i * 7);
        c.lineTo(dir * (i * 5 + 5), -i * 7 + 2);
        c.stroke();
      }
      c.restore();
    }

    // Брови и глаза
    c.fillStyle = "rgba(120,190,212,0.55)";
    c.beginPath();
    c.ellipse(0, headY - 12, 22, 8, 0, 0, Math.PI * 2);
    c.fill();
    const blink = !defeated && t % 210 < 8;
    for (const dir of [-1, 1]) {
      const ex = dir * 13;
      const ey = headY - 4;
      if (defeated) {
        c.strokeStyle = "#2a6e8c";
        c.lineWidth = 2.4;
        c.lineCap = "round";
        c.beginPath();
        c.moveTo(ex - 5, ey - 3);
        c.lineTo(ex + 5, ey + 3);
        c.moveTo(ex + 5, ey - 3);
        c.lineTo(ex - 5, ey + 3);
        c.stroke();
        continue;
      }
      c.save();
      c.globalCompositeOperation = "lighter";
      c.globalAlpha = 0.6 + tension * 0.2;
      duelDrawGlow(c, ex, ey, 17, eyeAccent);
      c.restore();
      c.fillStyle = blink ? "#7fb8cc" : "#eaffff";
      c.beginPath();
      c.ellipse(ex, ey, 8.4, blink ? 2 : 6.4, 0, 0, Math.PI * 2);
      c.fill();
      if (!blink) {
        c.fillStyle = eyeAccent;
        c.beginPath();
        c.arc(ex + look * 2.6, ey + 0.6, 3.6, 0, Math.PI * 2);
        c.fill();
        c.fillStyle = "#0b2a3c";
        c.beginPath();
        c.arc(ex + look * 3.4, ey + 0.6, 2.1, 0, Math.PI * 2);
        c.fill();
        c.fillStyle = "rgba(255,255,255,0.9)";
        c.beginPath();
        c.arc(ex + look * 2.4 - 1.2, ey - 1.6, 1.1, 0, Math.PI * 2);
        c.fill();
      }
    }

    // Нос
    c.fillStyle = "rgba(96,150,172,0.55)";
    c.beginPath();
    c.ellipse(0, headY + 9, 5.5, 4, 0, 0, Math.PI * 2);
    c.fill();

    // Пасть с клыками
    const open = 4 + tension * 5 + (defeated ? -2 : 0);
    c.fillStyle = "#123c54";
    c.beginPath();
    c.ellipse(0, headY + 20, 13, Math.max(2, open), 0, 0, Math.PI * 2);
    c.fill();
    c.fillStyle = "#f2feff";
    for (const fx of [-8, 0, 8]) {
      c.beginPath();
      c.moveTo(fx - 2.6, headY + 20 - open);
      c.lineTo(fx, headY + 20 - open + 6);
      c.lineTo(fx + 2.6, headY + 20 - open);
      c.closePath();
      c.fill();
    }
    for (const fx of [-4, 5]) {
      c.beginPath();
      c.moveTo(fx - 2.2, headY + 20 + open);
      c.lineTo(fx, headY + 20 + open - 5.4);
      c.lineTo(fx + 2.2, headY + 20 + open);
      c.closePath();
      c.fill();
    }

    // Пар из пасти
    if (!defeated) {
      c.save();
      c.globalCompositeOperation = "lighter";
      for (let i = 0; i < 3; i++) {
        const q = (t / 80 + i / 3) % 1;
        c.globalAlpha = (1 - q) * 0.16;
        duelDrawGlow(c, 10 + q * 18, headY + 22 + q * 12, 7 + q * 9, "#dff7ff");
      }
      c.restore();
    }

    // Ледяные пластины на плечах
    for (const dir of [-1, 1]) {
      c.save();
      c.translate(dir * 32, -26);
      c.rotate(dir * 0.4);
      c.fillStyle = "rgba(198,240,255,0.8)";
      c.beginPath();
      c.moveTo(0, -12);
      c.lineTo(7, -2);
      c.lineTo(3, 10);
      c.lineTo(-5, 4);
      c.closePath();
      c.fill();
      c.strokeStyle = "rgba(255,255,255,0.8)";
      c.lineWidth = 0.9;
      c.stroke();
      c.restore();
    }

    // Передний слой шерсти на груди
    for (let i = 0; i < 9; i++) {
      const x = -30 + i * 7.5;
      const y = 30 + Math.sin(i * 1.7) * 4;
      const len = 7 + Math.sin(t / 26 + i) * 1.6 + (i % 3) * 2;
      c.fillStyle = i % 2 ? "rgba(255,255,255,0.9)" : "rgba(222,244,250,0.9)";
      c.beginPath();
      c.moveTo(x - 2.6, y - 6);
      c.lineTo(x, y + len);
      c.lineTo(x + 2.6, y - 6);
      c.closePath();
      c.fill();
    }

    if (avalanche) duelAvalancheArmor(c, t, tension, defeated);

    // Вспышка при попадании
    if (duelState.flash > 0) {
      c.save();
      c.globalAlpha = Math.min(0.6, duelState.flash / 18 * 0.5);
      c.fillStyle = "#ffffff";
      c.beginPath();
      c.ellipse(0, 10, 50, 56, 0, 0, Math.PI * 2);
      c.fill();
      c.restore();
      if (duelState.flash > 8) {
        c.save();
        c.globalAlpha = Math.min(0.55, (duelState.flash - 8) / 12);
        c.strokeStyle = accent;
        c.lineWidth = 2.6;
        c.beginPath();
        c.arc(0, 0, 58 + (18 - duelState.flash) * 4.5, 0, Math.PI * 2);
        c.stroke();
        c.restore();
      }
    }
    c.restore();
  }
  function duelStormCrown(c, t, tension, accent) {
    const topY = -44;
    const spikes = [
      { x: -30, h: 32, w: 13, lean: -6 },
      { x: -16, h: 46, w: 16, lean: -3 },
      { x: 0, h: 58, w: 18, lean: 0 },
      { x: 16, h: 42, w: 15, lean: 3 },
      { x: 29, h: 30, w: 12, lean: 7 }
    ];
    c.save();
    c.globalCompositeOperation = "lighter";
    c.globalAlpha = 0.16 + tension * 0.18;
    duelDrawGlow(c, 0, topY - 18, 48 + tension * 12, "#8fb8ff");
    c.restore();
    for (const s of spikes) {
      const tipX = s.x + s.lean;
      const tipY = topY - s.h;
      const g = c.createLinearGradient(s.x, tipY, s.x, topY + 8);
      g.addColorStop(0, "#f4fbff");
      g.addColorStop(0.35, "#9fd8ff");
      g.addColorStop(0.7, "#6f8fff");
      g.addColorStop(1, "#3a4f9c");
      c.beginPath();
      c.moveTo(s.x - s.w / 2, topY + 8);
      c.lineTo(s.x + s.lean * 0.35, topY - s.h * 0.55);
      c.lineTo(tipX, tipY);
      c.lineTo(s.x + s.lean * 0.15, topY - s.h * 0.45);
      c.lineTo(s.x + s.w / 2, topY + 8);
      c.closePath();
      c.fillStyle = g;
      c.fill();
      c.strokeStyle = "rgba(170,235,255,.65)";
      c.lineWidth = 1;
      c.stroke();
    }
    const pulse = 0.6 + 0.4 * Math.sin(t / 18) + tension * 0.3;
    c.save();
    c.globalCompositeOperation = "lighter";
    c.globalAlpha = 0.32 + pulse * 0.24;
    duelDrawGlow(c, 0, topY - 12, 20 + pulse * 4, "#b6a8ff");
    c.restore();
    const gem = c.createRadialGradient(-2, topY - 14, 1, 0, topY - 12, 8);
    gem.addColorStop(0, "#ffffff");
    gem.addColorStop(0.45, "#c9b8ff");
    gem.addColorStop(1, duelHexToRgba(accent, 0.9));
    c.fillStyle = gem;
    c.beginPath();
    c.arc(0, topY - 12, 6.5, 0, Math.PI * 2);
    c.fill();
    c.strokeStyle = "rgba(255,255,255,.85)";
    c.lineWidth = 1;
    c.stroke();
    c.save();
    c.strokeStyle = "rgba(190,230,255,.6)";
    c.lineWidth = 1.1;
    for (let i = 0; i < 2; i++) {
      const a = t / 90 + i * 2.6;
      c.beginPath();
      c.moveTo(Math.cos(a) * 12, topY - 12 + Math.sin(a) * 6);
      c.lineTo(Math.cos(a) * 12 + Math.cos(a + 1.2) * 8, topY - 12 + Math.sin(a) * 6 + Math.sin(a + 1.2) * 8);
      c.stroke();
    }
    c.restore();
  }

  function duelStormBody(c) {
    const t = duelState.frame;
    const tension = duelTelegraphTension();
    const accent = DUEL_PHASE_COLORS[duelState.level] || DUEL_PHASE_COLORS[0];
    const defeated = duelState.over && duelState.won;
    const breathe = 1 + Math.sin(t / 50) * 0.02;
    const look = duelClamp((duelState.px + DUEL_PLAYER_HALF - duelState.bx) / 150, -1, 1) * 4;
    const blink = !defeated && t % 220 < 8;
    c.save();
    c.translate(duelState.bx, duelState.by + (defeated ? 12 : 0));
    if (defeated) c.rotate(0.06);
    c.scale(breathe, breathe);

    const shade = c.createRadialGradient(0, 34, 12, 0, 44, 124);
    shade.addColorStop(0, "rgba(18,44,86,0.18)");
    shade.addColorStop(0.65, "rgba(18,44,86,0.07)");
    shade.addColorStop(1, "rgba(18,44,86,0)");
    c.fillStyle = shade;
    c.beginPath();
    c.ellipse(0, 48, 120, 98, 0, 0, Math.PI * 2);
    c.fill();
    c.save();
    c.globalCompositeOperation = "lighter";
    c.globalAlpha = 0.16 + tension * 0.14;
    duelDrawGlow(c, 0, 6, 104, "#7f8fff");
    c.globalAlpha = 0.1;
    duelDrawGlow(c, 0, 72, 68, "#5ce8ff");
    c.restore();

    // Дождь и косые струи.
    c.save();
    c.strokeStyle = "rgba(170,225,255,.16)";
    c.lineWidth = 1;
    for (let i = 0; i < 18; i++) {
      const x = -92 + ((i * 37 + t * 1.4) % 184);
      const y = -26 + ((i * 53 + t * 2.6) % 166);
      c.beginPath();
      c.moveTo(x, y);
      c.lineTo(x - 6, y + 18);
      c.stroke();
    }
    c.restore();

    // Задний слой щупалец.
    for (let i = 0; i < 4; i++) {
      const spread = (i - 1.5) * 0.9;
      const sway = Math.sin(t / 40 + i * 1.6) * 8;
      duelTentacle(c, spread * 18, 20, spread, 82 + (i % 3) * 9, 13, sway, "#2f6f92", "#123a58", false);
    }

    duelStormCrown(c, t, tension, accent);

    // Тёмная грозовая мантия: держит силуэт на светлом фоне.
    c.save();
    for (let i = 0; i < 5; i++) {
      const a = i / 5 * Math.PI * 2 + t / 320;
      const cx = Math.cos(a) * 42;
      const cy = -18 + Math.sin(a) * 18;
      const rr = 38 + (i % 3) * 9;
      const g = c.createRadialGradient(cx, cy, 2, cx, cy, rr);
      g.addColorStop(0, "rgba(18,34,66,.36)");
      g.addColorStop(0.62, "rgba(18,34,66,.18)");
      g.addColorStop(1, "rgba(18,34,66,0)");
      c.fillStyle = g;
      c.beginPath();
      c.ellipse(cx, cy, rr, rr * 0.72, 0, 0, Math.PI * 2);
      c.fill();
    }
    c.restore();
    c.save();
    c.globalCompositeOperation = "lighter";
    c.strokeStyle = "rgba(170,225,255,.45)";
    c.lineWidth = 1.1;
    for (let i = 0; i < 4; i++) {
      const a = i / 4 * Math.PI * 2 + t / 320;
      const x1 = Math.cos(a) * 34;
      const y1 = -18 + Math.sin(a) * 16;
      const x2 = Math.cos(a + 0.6) * 48;
      const y2 = -18 + Math.sin(a + 0.6) * 22;
      c.beginPath();
      c.moveTo(x1, y1);
      c.lineTo((x1 + x2) / 2 + Math.cos(a + 1.4) * 7, (y1 + y2) / 2 + Math.sin(a + 1.4) * 7);
      c.lineTo(x2, y2);
      c.stroke();
    }
    c.globalCompositeOperation = "lighter";
    for (let i = 0; i < 5; i++) {
      const a = i / 5 * Math.PI * 2 + t / 320;
      const cx = Math.cos(a) * 40;
      const cy = -18 + Math.sin(a) * 18;
      const rr = 34 + (i % 3) * 8;
      const g = c.createRadialGradient(cx, cy, 2, cx, cy, rr);
      g.addColorStop(0, "rgba(92,120,190,.24)");
      g.addColorStop(0.6, "rgba(40,70,120,.13)");
      g.addColorStop(1, "rgba(20,40,80,0)");
      c.fillStyle = g;
      c.beginPath();
      c.ellipse(cx, cy, rr, rr * 0.72, 0, 0, Math.PI * 2);
      c.fill();
    }
    c.restore();

    // Купол.
    c.save();
    const bodyGrad = c.createRadialGradient(-16, -24, 8, 2, 6, 78);
    bodyGrad.addColorStop(0, "#cdeeff");
    bodyGrad.addColorStop(0.24, "#8fd2ea");
    bodyGrad.addColorStop(0.5, "#4f9fbd");
    bodyGrad.addColorStop(0.78, "#2b6f92");
    bodyGrad.addColorStop(1, "#123a58");
    c.fillStyle = bodyGrad;
    duelBossBodyPath(c);
    c.fill();
    c.strokeStyle = "rgba(10,44,68,0.35)";
    c.lineWidth = 1.3;
    duelBossBodyPath(c);
    c.stroke();
    c.save();
    duelBossBodyPath(c);
    c.clip();
    const bottomShade = c.createLinearGradient(0, -8, 0, 42);
    bottomShade.addColorStop(0, "rgba(10,50,80,0)");
    bottomShade.addColorStop(1, "rgba(8,38,60,0.4)");
    c.fillStyle = bottomShade;
    c.fillRect(-50, -8, 100, 52);
    const sheen = c.createRadialGradient(-22, -28, 3, -22, -28, 30);
    sheen.addColorStop(0, "rgba(255,255,255,0.55)");
    sheen.addColorStop(1, "rgba(255,255,255,0)");
    c.fillStyle = sheen;
    c.beginPath();
    c.ellipse(-22, -28, 26, 18, -0.4, 0, Math.PI * 2);
    c.fill();
    // Спираль на лбу.
    c.strokeStyle = "rgba(198,242,255,.42)";
    c.lineWidth = 1.5;
    for (let k = 0; k < 2; k++) {
      c.beginPath();
      c.arc(0, -17, 7 + k * 7, 0.4, 3.3);
      c.stroke();
    }
    // Электрические прожилки по фазам.
    const veins = [
      [[-40, -10], [-28, -2], [-34, 8], [-22, 16]],
      [[34, -20], [24, -8], [30, 3], [20, 14]],
      [[0, -44], [-6, -34], [2, -26], [-2, -18]]
    ];
    const count = [0, 1, 2][duelState.level] || 0;
    c.lineCap = "round";
    for (let i = 0; i < count; i++) {
      const path = veins[i];
      c.strokeStyle = "rgba(10,40,70,.42)";
      c.lineWidth = 2;
      c.beginPath();
      c.moveTo(path[0][0], path[0][1]);
      for (let k = 1; k < path.length; k++) c.lineTo(path[k][0], path[k][1]);
      c.stroke();
      c.save();
      c.globalCompositeOperation = "lighter";
      c.globalAlpha = 0.5 + tension * 0.3;
      c.strokeStyle = "#8fe8ff";
      c.lineWidth = 1;
      c.stroke();
      c.restore();
    }
    c.restore();
    const rim = c.createLinearGradient(-44, -44, 22, 34);
    rim.addColorStop(0, "rgba(220,250,255,.9)");
    rim.addColorStop(0.42, "rgba(150,220,255,.3)");
    rim.addColorStop(1, "rgba(120,160,255,0)");
    c.strokeStyle = rim;
    c.lineWidth = 2.2;
    duelBossBodyPath(c);
    c.stroke();
    c.restore();

    // Лицо.
    if (defeated) {
      c.strokeStyle = "#0d3450";
      c.lineWidth = 2.6;
      c.lineCap = "round";
      for (const ex of [-18, 18]) {
        c.beginPath();
        c.moveTo(ex - 7, -12);
        c.lineTo(ex + 7, 0);
        c.moveTo(ex + 7, -12);
        c.lineTo(ex - 7, 0);
        c.stroke();
      }
    } else {
      duelBossEye(c, -18, -8, look, blink, 1, accent);
      duelBossEye(c, 18, -8, look, blink, 1, accent);
      c.save();
      c.globalCompositeOperation = "lighter";
      c.globalAlpha = 0.24 + tension * 0.24;
      c.strokeStyle = "#b6eaff";
      c.lineWidth = 1;
      for (const ex of [-18, 18]) {
        c.beginPath();
        c.moveTo(ex + 11, -20);
        c.lineTo(ex + 16, -15);
        c.lineTo(ex + 12, -9);
        c.stroke();
      }
      c.restore();
    }

    // Пасть.
    const my = 20.5;
    if (defeated) {
      c.fillStyle = "#0b344c";
      c.beginPath();
      c.ellipse(0, my + 2, 7, 8, 0, 0, Math.PI * 2);
      c.fill();
    } else {
      const open = 2.2 + tension * 10;
      if (tension <= 0.02) {
        c.strokeStyle = "rgba(10,48,76,0.85)";
        c.lineWidth = 2.6;
        c.lineCap = "round";
        c.beginPath();
        c.moveTo(-7.5, my);
        c.quadraticCurveTo(0, my + 5.5, 7.5, my);
        c.stroke();
      } else {
        const maw = c.createLinearGradient(0, my - open, 0, my + open);
        maw.addColorStop(0, "#102a4a");
        maw.addColorStop(0.55, "#081a30");
        maw.addColorStop(1, "#174b70");
        c.fillStyle = maw;
        c.beginPath();
        c.ellipse(0, my, 13, open, 0, 0, Math.PI * 2);
        c.fill();
        c.save();
        c.globalCompositeOperation = "lighter";
        c.globalAlpha = 0.28 + tension * 0.5;
        duelDrawGlow(c, 0, my + 2, 22 + tension * 10, "#8fe8ff");
        c.restore();
        c.fillStyle = "#eafaff";
        for (const fx of [-8, 0, 8]) {
          c.beginPath();
          c.moveTo(fx - 3, my - open + 0.5);
          c.lineTo(fx, my - open + 6.5);
          c.lineTo(fx + 3, my - open + 0.5);
          c.closePath();
          c.fill();
        }
        c.strokeStyle = "rgba(190,240,255,0.45)";
        c.lineWidth = 1.1;
        c.beginPath();
        c.ellipse(0, my, 13, open, 0, 0, Math.PI * 2);
        c.stroke();
      }
    }

    // Передний слой щупалец.
    for (let i = 0; i < 4; i++) {
      const spread = (i - 1.5) / 1.6;
      const sway = Math.sin(t / 34 + i * 1.4) * 9;
      duelTentacle(
        c,
        spread * 24,
        38,
        spread * 0.95,
        94 + (i % 2) * 12,
        16 - Math.abs(spread) * 4,
        sway,
        "#4f9fbd",
        "#1b4f70",
        i === 1 || i === 2
      );
    }

    // Электрические дуги между щупальцами.
    c.save();
    c.globalCompositeOperation = "lighter";
    c.globalAlpha = 0.22 + 0.22 * Math.abs(Math.sin(t / 26));
    c.strokeStyle = "#b6eaff";
    c.lineWidth = 1.2;
    for (let i = 0; i < 3; i++) {
      const x1 = -24 + i * 16;
      const y1 = 112 + (i % 2) * 10;
      const x2 = x1 + 16;
      const y2 = y1 + 8;
      c.beginPath();
      c.moveTo(x1, y1);
      c.lineTo((x1 + x2) / 2 + 3, (y1 + y2) / 2 - 4);
      c.lineTo(x2, y2);
      c.stroke();
    }
    c.restore();

    // Туман и орбитальные осколки.
    c.save();
    c.globalCompositeOperation = "lighter";
    c.globalAlpha = 0.1 + 0.04 * Math.sin(t / 30);
    duelDrawGlow(c, 0, 132, 84, "#9fdcff");
    c.restore();
    for (let i = 0; i < 6; i++) {
      const a = t / 170 + i * 1.05;
      const r = 80 + Math.sin(t / 46 + i) * 6;
      c.save();
      c.translate(Math.cos(a) * r, Math.sin(a) * r * 0.6 + 8);
      c.rotate(a * 1.7);
      c.fillStyle = "rgba(198,240,255,.45)";
      c.beginPath();
      c.moveTo(0, -4);
      c.lineTo(1.4, 0);
      c.lineTo(0, 4);
      c.lineTo(-1.4, 0);
      c.closePath();
      c.fill();
      c.restore();
    }

    if (duelState.flash > 0) {
      const flash = duelState.flash / 18;
      c.save();
      c.globalAlpha = Math.min(0.5, flash * 0.42);
      c.fillStyle = "#ffffff";
      duelBossBodyPath(c);
      c.fill();
      c.restore();
      if (duelState.flash > 8) {
        c.save();
        c.globalAlpha = Math.min(0.55, (duelState.flash - 8) / 12);
        c.strokeStyle = accent;
        c.lineWidth = 2.6;
        c.beginPath();
        c.arc(0, 0, 58 + (18 - duelState.flash) * 4.5, 0, Math.PI * 2);
        c.stroke();
        c.restore();
      }
    }
    c.restore();
  }

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
  function duelDrawBossBody(c) {
    const kind = duelBossKind();
    if (kind === "yeti" || kind === "avalanche") duelYetiBody(c);
    else if (kind === "storm") duelStormBody(c);
    else if (kind === "leviathan") duelLeviathanBody(c);
    else duelBossBody(c);
  }
  function duelShardShape(c, len, wid, fill, edge) {
    c.beginPath();
    c.moveTo(len, 0);
    c.lineTo(wid * 0.35, -wid);
    c.lineTo(-len * 0.65, -wid * 0.72);
    c.lineTo(-len * 0.95, 0);
    c.lineTo(-len * 0.65, wid * 0.72);
    c.lineTo(wid * 0.35, wid);
    c.closePath();
    c.fillStyle = fill;
    c.fill();
    if (edge) {
      c.strokeStyle = edge;
      c.lineWidth = 0.8;
      c.stroke();
    }
  }
  function duelDrawBullets(c) {
    c.save();
    c.shadowColor = "rgba(6,30,48,.45)";
    c.shadowBlur = 3;
    c.shadowOffsetY = 1;
    for (const b of duelState.bullets) {
      if (b.delay > 0) continue;
      const kind = b.kind || "shard";
      const ang = Math.atan2(b.vy, b.vx);
      c.save();
      c.translate(b.x, b.y);
      if (b.own) {
        c.rotate(ang + Math.PI / 2);
        c.globalCompositeOperation = "lighter";
        c.globalAlpha = 0.45;
        const trail = c.createLinearGradient(0, 0, 0, 26);
        trail.addColorStop(0, "rgba(168,244,255,0.85)");
        trail.addColorStop(1, "rgba(168,244,255,0)");
        c.fillStyle = trail;
        c.beginPath();
        c.moveTo(-2.6, 2);
        c.lineTo(0, 26);
        c.lineTo(2.6, 2);
        c.closePath();
        c.fill();
        duelDrawGlow(c, 0, 0, 13, "#8ef0ff");
        c.globalAlpha = 1;
        c.globalCompositeOperation = "source-over";
        const grad = c.createLinearGradient(0, -10, 0, 6);
        grad.addColorStop(0, "#ffffff");
        grad.addColorStop(0.45, "#c9f8ff");
        grad.addColorStop(1, "#5fc8e8");
        c.beginPath();
        c.moveTo(0, -10);
        c.lineTo(3.4, -1);
        c.lineTo(0, 6.5);
        c.lineTo(-3.4, -1);
        c.closePath();
        c.fillStyle = grad;
        c.fill();
        c.strokeStyle = "rgba(255,255,255,0.85)";
        c.lineWidth = 0.8;
        c.stroke();
        c.fillStyle = "rgba(255,255,255,0.95)";
        c.beginPath();
        c.moveTo(0, -8);
        c.lineTo(1.2, -1);
        c.lineTo(0, 2);
        c.lineTo(-1.2, -1);
        c.closePath();
        c.fill();
        c.restore();
        continue;
      }
      if (kind === "snowball") {
        const squash = 1 + Math.sin((b.age || 0) / 5) * 0.06;
        for (let k = 3; k >= 1; k--) {
          c.globalAlpha = 0.1 * (4 - k);
          c.fillStyle = "#eafaff";
          c.beginPath();
          c.arc(-b.vx * k * 0.9, -b.vy * k * 0.9, b.r * (0.9 - k * 0.14), 0, Math.PI * 2);
          c.fill();
        }
        c.globalAlpha = 1;
        const g = c.createRadialGradient(-b.r * 0.35, -b.r * 0.4, b.r * 0.15, 0, 0, b.r * 1.15);
        g.addColorStop(0, "#ffffff");
        g.addColorStop(0.55, "#e2f6ff");
        g.addColorStop(0.85, "#a7d9ee");
        g.addColorStop(1, "#79b7d4");
        c.fillStyle = g;
        c.beginPath();
        c.ellipse(0, 0, b.r * squash, b.r / squash, 0, 0, Math.PI * 2);
        c.fill();
        c.strokeStyle = "rgba(255,255,255,0.7)";
        c.lineWidth = 1;
        c.stroke();
        c.fillStyle = "rgba(255,255,255,0.55)";
        c.beginPath();
        c.arc(-b.r * 0.3, -b.r * 0.35, b.r * 0.24, 0, Math.PI * 2);
        c.fill();
        c.restore();
        continue;
      }
      if (kind === "snowflake") {
        c.rotate(b.spin || 0);
        c.globalCompositeOperation = "lighter";
        c.globalAlpha = 0.8;
        duelDrawGlow(c, 0, 0, b.r * 3.4, "#c9b8ff");
        c.globalAlpha = 1;
        c.strokeStyle = "#e6faff";
        c.lineWidth = 1.6;
        c.lineCap = "round";
        for (let k = 0; k < 6; k++) {
          const a = k / 6 * Math.PI * 2;
          const ex = Math.cos(a) * b.r * 1.9;
          const ey = Math.sin(a) * b.r * 1.9;
          c.beginPath();
          c.moveTo(0, 0);
          c.lineTo(ex, ey);
          c.stroke();
          c.beginPath();
          c.moveTo(ex * 0.55, ey * 0.55);
          c.lineTo(ex * 0.8 + Math.cos(a + 1.1) * 3, ey * 0.8 + Math.sin(a + 1.1) * 3);
          c.moveTo(ex * 0.55, ey * 0.55);
          c.lineTo(ex * 0.8 + Math.cos(a - 1.1) * 3, ey * 0.8 + Math.sin(a - 1.1) * 3);
          c.stroke();
        }
        c.fillStyle = "#ffffff";
        c.beginPath();
        c.arc(0, 0, 2.2, 0, Math.PI * 2);
        c.fill();
        c.strokeStyle = "rgba(180,160,255,0.55)";
        c.lineWidth = 1;
        c.beginPath();
        c.arc(0, 0, b.r * 2.2, 0, Math.PI * 2);
        c.stroke();
        c.restore();
        continue;
      }
      if (kind === "spike") {
        const fade = b.life != null ? Math.min(1, b.life / 24) : 1;
        c.globalAlpha = fade * 0.5;
        c.globalCompositeOperation = "lighter";
        duelDrawGlow(c, 0, -10, 26, "#9fe8ff");
        c.globalAlpha = fade;
        c.globalCompositeOperation = "source-over";
        const g = c.createLinearGradient(0, -34, 0, 4);
        g.addColorStop(0, "#ffffff");
        g.addColorStop(0.4, "#c8f4ff");
        g.addColorStop(1, "#4b9cc0");
        c.beginPath();
        c.moveTo(0, -34);
        c.lineTo(b.r * 0.95, -6);
        c.lineTo(b.r * 0.6, 3);
        c.lineTo(-b.r * 0.6, 3);
        c.lineTo(-b.r * 0.95, -6);
        c.closePath();
        c.fillStyle = g;
        c.fill();
        c.strokeStyle = "rgba(255,255,255,0.8)";
        c.lineWidth = 0.9;
        c.stroke();
        c.fillStyle = "rgba(255,255,255,0.45)";
        c.beginPath();
        c.moveTo(0, -32);
        c.lineTo(2.2, -6);
        c.lineTo(-1, 1);
        c.closePath();
        c.fill();
        c.restore();
        continue;
      }
      if (kind === "seeker") {
        const pulse = 0.85 + 0.15 * Math.sin((b.age || 0) / 6);
        c.globalCompositeOperation = "lighter";
        c.globalAlpha = 0.75;
        duelDrawGlow(c, 0, 0, b.r * 4.2 * pulse, "#c9b0ff");
        c.globalAlpha = 1;
        c.globalCompositeOperation = "source-over";
        const g = c.createRadialGradient(-2, -2, 1, 0, 0, b.r * pulse);
        g.addColorStop(0, "#ffffff");
        g.addColorStop(0.42, "#e4d8ff");
        g.addColorStop(0.8, "#9d7ff0");
        g.addColorStop(1, "#5b3fb0");
        c.fillStyle = g;
        c.beginPath();
        c.arc(0, 0, b.r * pulse, 0, Math.PI * 2);
        c.fill();
        c.strokeStyle = "rgba(255,255,255,0.75)";
        c.lineWidth = 1;
        c.stroke();
        c.strokeStyle = "rgba(214,196,255,0.75)";
        c.lineWidth = 1.4;
        c.beginPath();
        c.arc(0, 0, b.r + 3.4, (b.age || 0) / 18, (b.age || 0) / 18 + Math.PI * 1.25);
        c.stroke();
        for (let k = 0; k < 2; k++) {
          const a = (b.age || 0) / 14 + k * Math.PI;
          const ox = Math.cos(a) * (b.r + 4.5);
          const oy = Math.sin(a) * (b.r + 4.5);
          c.fillStyle = "#d9c9ff";
          c.beginPath();
          c.moveTo(ox, oy - 2.4);
          c.lineTo(ox + 1.7, oy);
          c.lineTo(ox, oy + 2.4);
          c.lineTo(ox - 1.7, oy);
          c.closePath();
          c.fill();
        }
        c.restore();
        continue;
      }
      c.rotate(ang);
      const len = kind === "hail" ? b.r * 1.7 : b.r * 1.95;
      const wid = kind === "hail" ? b.r * 0.66 : b.r * 0.8;
      c.globalCompositeOperation = "lighter";
      c.globalAlpha = 0.5;
      const trail = c.createLinearGradient(-len * 2.6, 0, len, 0);
      trail.addColorStop(0, "rgba(150,225,255,0)");
      trail.addColorStop(1, "rgba(190,240,255,0.75)");
      c.fillStyle = trail;
      c.beginPath();
      c.moveTo(-len * 2.6, 0);
      c.lineTo(-len * 0.6, -wid * 1.1);
      c.lineTo(-len * 0.6, wid * 1.1);
      c.closePath();
      c.fill();
      c.globalAlpha = 0.7;
      duelDrawGlow(c, 0, 0, b.r * 2.6, "#9fe8ff");
      c.globalAlpha = 1;
      c.globalCompositeOperation = "source-over";
      const g = c.createLinearGradient(-len, 0, len, 0);
      g.addColorStop(0, "#6fb6d6");
      g.addColorStop(0.45, "#d9f7ff");
      g.addColorStop(0.78, "#ffffff");
      g.addColorStop(1, "#bfeeff");
      duelShardShape(c, len, wid, g, "rgba(255,255,255,0.85)");
      c.strokeStyle = "rgba(78,150,188,0.55)";
      c.lineWidth = 0.8;
      c.beginPath();
      c.moveTo(-len * 0.6, 0);
      c.lineTo(len * 0.9, 0);
      c.stroke();
      c.restore();
    }
    c.restore();
  }
  function duelDrawPlayer(c) {
    if (duelState.invuln > 0 && Math.floor(duelState.frame / 4) % 2 === 0) return;
    const t = duelState.frame;
    const x = duelState.px + DUEL_PLAYER_HALF;
    const cy = DUEL_PLAYER_Y + 4;
    const bob = Math.sin(t / 24) * 1.1;
    const ay = cy + bob * 0.4;
    const feetY = DUEL_PLAYER_Y + 26 + bob;
    const r = 14;
    const sway = Math.sin(t / 38) * 1.6;
    c.save();

    // Тень на снегу
    c.save();
    c.globalAlpha = 0.32;
    c.fillStyle = "#08202f";
    c.beginPath();
    c.ellipse(x, feetY + 1.5, 13, 3.6, 0, 0, Math.PI * 2);
    c.fill();
    c.restore();

    // Шарф: развевающийся хвост за спиной
    c.save();
    c.strokeStyle = "#6ff0c4";
    c.lineWidth = 3.2;
    c.lineCap = "round";
    c.beginPath();
    c.moveTo(x - 6, ay + 2);
    c.quadraticCurveTo(x - 14 - sway, ay + 6, x - 16 - sway * 1.4, ay + 14 + Math.sin(t / 18) * 2.5);
    c.stroke();
    c.strokeStyle = "rgba(255,255,255,0.55)";
    c.lineWidth = 0.9;
    c.stroke();
    c.restore();

    // Выбранный персонаж — тот же аватар, что и в забеге.
    const img = avatarImages[selectedAvatar];
    c.save();
    c.beginPath();
    c.arc(x, ay, r, 0, Math.PI * 2);
    c.fillStyle = "rgba(14,38,60,.92)";
    c.fill();
    c.save();
    c.beginPath();
    c.arc(x, ay, r - 2.5, 0, Math.PI * 2);
    c.clip();
    if (img && img.complete && img.naturalWidth > 0) {
      c.drawImage(img, x - r + 2.5, ay - r + 2.5, (r - 2.5) * 2, (r - 2.5) * 2);
    } else {
      const fallback = c.createLinearGradient(x - r, ay - r, x + r, ay + r);
      fallback.addColorStop(0, "#ffd98a");
      fallback.addColorStop(1, "#e0575f");
      c.fillStyle = fallback;
      c.fillRect(x - r + 2.5, ay - r + 2.5, (r - 2.5) * 2, (r - 2.5) * 2);
    }
    const shine = c.createLinearGradient(0, ay - r + 2, 0, ay + r * 0.6);
    shine.addColorStop(0, "rgba(255,255,255,.34)");
    shine.addColorStop(1, "rgba(255,255,255,0)");
    c.fillStyle = shine;
    c.fillRect(x - r + 2.5, ay - r + 2.5, (r - 2.5) * 2, r * 1.6);
    c.restore();
    c.beginPath();
    c.arc(x, ay, r - 1.4, Math.PI * 1.12, Math.PI * 1.88);
    c.strokeStyle = "rgba(255,255,255,.72)";
    c.lineWidth = 1.6;
    c.lineCap = "round";
    c.stroke();
    c.beginPath();
    c.arc(x, ay, r - 0.75, 0, Math.PI * 2);
    c.strokeStyle = "rgba(6,22,40,.9)";
    c.lineWidth = 1.6;
    c.stroke();
    // drawFrame рисует через общий ctx: на игровом полотне это тот же контекст.
    drawFrame(x, ay, r - 1, selectedFrame);
    c.restore();

    // Рука с ледяным бластером
    c.save();
    c.translate(x + 12, cy + 1.5);
    c.rotate(-0.14);
    const gun = c.createLinearGradient(0, -3, 0, 3);
    gun.addColorStop(0, "#dff7ff");
    gun.addColorStop(0.45, "#8fd2e8");
    gun.addColorStop(1, "#2f7694");
    c.fillStyle = gun;
    c.beginPath();
    c.roundRect(-1.6, -8, 5.2, 9.4, 1.6);
    c.fill();
    c.strokeStyle = "rgba(255,255,255,0.8)";
    c.lineWidth = 0.8;
    c.stroke();
    c.fillStyle = "#6ff0c4";
    c.beginPath();
    c.arc(1, -6.4, 1.5, 0, Math.PI * 2);
    c.fill();
    c.fillStyle = "#bfefff";
    c.beginPath();
    c.roundRect(0.2, -11.4, 1.6, 4.4, 0.8);
    c.fill();
    if (duelState.fireCd > DUEL_FIRE_FRAMES - 4) {
      const k = (duelState.fireCd - (DUEL_FIRE_FRAMES - 4)) / 4;
      c.save();
      c.globalCompositeOperation = "lighter";
      c.globalAlpha = 0.6 * k;
      duelDrawGlow(c, 1, -13, 14 + k * 6, "#8ef0ff");
      c.restore();
      c.fillStyle = "#ffffff";
      c.beginPath();
      c.moveTo(1, -20 - k * 4);
      c.lineTo(3.4, -12);
      c.lineTo(1, -9.6);
      c.lineTo(-1.4, -12);
      c.closePath();
      c.fill();
    }
    c.restore();

    // Аура невосприимчивости
    if (duelState.invuln > 0) {
      c.save();
      c.globalAlpha = 0.16 + 0.1 * Math.sin(t / 5);
      c.strokeStyle = "#8ef7ff";
      c.lineWidth = 1.6;
      c.setLineDash([4, 6]);
      c.lineDashOffset = -t * 0.8;
      c.beginPath();
      c.arc(x, ay, r + 5, 0, Math.PI * 2);
      c.stroke();
      c.restore();
    }
    c.restore();
  }
  function duelDrawParticles(c) {
    for (const p of duelState.particles) {
      c.globalAlpha = Math.max(0, p.life / p.max);
      c.fillStyle = p.color;
      c.beginPath();
      c.arc(p.x, p.y, 2.5, 0, Math.PI * 2);
      c.fill();
    }
    c.globalAlpha = 1;
  }
  function duelDrawHud(c) {
    const x = 14;
    const y = 12;
    const w = DUEL_W - 28;
    const h = 44;
    c.save();
    // Мягкая тень и светлое стекло в стиле остального HUD.
    c.save();
    c.shadowColor = "rgba(10,40,62,.18)";
    c.shadowBlur = 18;
    c.shadowOffsetY = 6;
    duelRoundRect(c, x, y, w, h, 12);
    c.fillStyle = "rgba(255,255,255,.92)";
    c.fill();
    c.restore();
    duelRoundRect(c, x, y, w, h, 12);
    const panel = c.createLinearGradient(0, y, 0, y + h);
    panel.addColorStop(0, "rgba(255,255,255,.97)");
    panel.addColorStop(1, "rgba(236,248,255,.88)");
    c.fillStyle = panel;
    c.fill();
    c.save();
    duelRoundRect(c, x + 1, y + 1, w - 2, h * 0.52, 11);
    c.clip();
    const shine = c.createLinearGradient(0, y, 0, y + h * 0.5);
    shine.addColorStop(0, "rgba(255,255,255,.82)");
    shine.addColorStop(1, "rgba(255,255,255,0)");
    c.fillStyle = shine;
    c.fillRect(x, y, w, h * 0.5);
    c.restore();
    duelRoundRect(c, x + 0.75, y + 0.75, w - 1.5, h - 1.5, 11.5);
    c.strokeStyle = "rgba(255,255,255,.98)";
    c.lineWidth = 1.4;
    c.stroke();
    const name = DUEL_BOSS_NAMES[Math.min(duelState.index, DUEL_BOSS_NAMES.length - 1)];
    duelText(c, name, x + 14, y + 13, 8.5, "#0f3d5c", "left", 1.2);
    duelText(c, "БОСС " + (duelState.index + 1), x + w - 42, y + 13, 7, "rgba(18,58,92,.52)", "right", 1);
    const pipY = y + 38;
    for (let i = 0; i < 3; i++) {
      const px = x + 15 + i * 13;
      c.beginPath();
      c.moveTo(px, pipY - 3.4);
      c.lineTo(px + 3.4, pipY);
      c.lineTo(px, pipY + 3.4);
      c.lineTo(px - 3.4, pipY);
      c.closePath();
      c.fillStyle = i <= duelState.level ? DUEL_PHASE_COLORS[i] : "rgba(18,58,92,.15)";
      c.fill();
    }
    const barX = x + 60;
    const barY = y + 31;
    const barW = w - 104;
    const barH = 7;
    const frac = duelClamp(duelState.bhp / duelState.bmax, 0, 1);
    duelRoundRect(c, barX, barY, barW, barH, 4.5);
    c.fillStyle = "rgba(21,85,118,.12)";
    c.fill();
    if (frac > 0) {
      c.save();
      duelRoundRect(c, barX, barY, Math.max(6, barW * frac), barH, 4.5);
      c.clip();
      const fill = c.createLinearGradient(barX, barY, barX, barY + barH);
      const accent = DUEL_PHASE_COLORS[duelState.level] || DUEL_PHASE_COLORS[0];
      fill.addColorStop(0, duelHexToRgba(accent, 0.95));
      fill.addColorStop(1, duelHexToRgba(accent, 0.62));
      c.fillStyle = fill;
      c.fillRect(barX, barY, barW * frac, barH);
      c.fillStyle = "rgba(255,255,255,.42)";
      c.fillRect(barX, barY, barW * frac, barH * 0.42);
      c.restore();
    }
    c.save();
    const segments = 20;
    c.strokeStyle = "rgba(18,58,92,.18)";
    c.lineWidth = 1;
    for (let i = 1; i < segments; i++) {
      const sx = barX + barW * (i / segments);
      c.beginPath();
      c.moveTo(sx, barY + 1);
      c.lineTo(sx, barY + barH - 1);
      c.stroke();
    }
    c.restore();
    duelRoundRect(c, barX, barY, barW, barH, 4.5);
    c.strokeStyle = "rgba(18,58,92,.18)";
    c.lineWidth = 1;
    c.stroke();
    const bottom = DUEL_H - 26;
    const shownHearts = Math.min(duelState.lives, 5);
    for (let i = 0; i < shownHearts; i++) {
      const hx = 26 + i * 19;
      c.save();
      c.translate(hx, bottom - 4);
      c.beginPath();
      c.moveTo(0, 7);
      c.bezierCurveTo(-10, -2, -5, -10, 0, -4.4);
      c.bezierCurveTo(5, -10, 10, -2, 0, 7);
      c.closePath();
      c.fillStyle = "#ff6b81";
      c.fill();
      c.strokeStyle = "rgba(90,16,38,0.55)";
      c.lineWidth = 1.1;
      c.stroke();
      c.restore();
    }
    if (duelState.lives > 5) {
      duelText(c, "+" + (duelState.lives - 5), 26 + 5 * 19 + 2, bottom - 1, 9, "#b3202a", "left");
    }
    if (duelState.shield > 0) {
      const sx = DUEL_W - 30;
      c.save();
      c.translate(sx, bottom - 4);
      c.beginPath();
      c.moveTo(0, -8);
      c.lineTo(8, -4);
      c.lineTo(8, 4);
      c.lineTo(0, 8);
      c.lineTo(-8, 4);
      c.lineTo(-8, -4);
      c.closePath();
      c.fillStyle = "#7ef7ff";
      c.fill();
      c.strokeStyle = "rgba(8,44,64,0.7)";
      c.lineWidth = 1.2;
      c.stroke();
      duelText(c, String(duelState.shield), 0, 0.5, 8.5, "#053247", "center");
      c.restore();
      duelText(c, "ЩИТ", sx - 16, bottom - 1, 7.5, "rgba(18,58,92,.62)", "right", 0.8);
    }
    if (duelState.frame < 320) {
      c.globalAlpha = Math.min(1, (320 - duelState.frame) / 80) * 0.75;
      const hint = isCoarsePointer()
        ? "ТАП СЛЕВА/СПРАВА · ОГОНЬ САМ"
        : "A/D ИЛИ МЫШЬ · ОГОНЬ САМ";
      duelRoundRect(c, DUEL_W / 2 - 116, DUEL_H - 54, 232, 16, 8);
      c.fillStyle = "rgba(255,255,255,.68)";
      c.fill();
      duelText(c, hint, DUEL_W / 2, DUEL_H - 46, 7.4, "rgba(18,58,92,.68)", "center", 0.9, "normal");
      c.globalAlpha = 1;
    }
    // Пауза доступна и в дуэли: HUD забега здесь скрыт, поэтому кнопка своя.
    const pz = DUEL_PAUSE_ZONE;
    duelRoundRect(c, pz.x, pz.y, pz.w, pz.h, 7);
    c.fillStyle = "rgba(21,85,118,.08)";
    c.fill();
    c.strokeStyle = "rgba(18,58,92,.18)";
    c.lineWidth = 1;
    c.stroke();
    c.fillStyle = "rgba(18,58,92,.78)";
    c.fillRect(pz.x + pz.w / 2 - 3.2, pz.y + 8, 2.2, 8);
    c.fillRect(pz.x + pz.w / 2 + 1, pz.y + 8, 2.2, 8);
    c.restore();
  }
  function duelDrawBanner(c) {
    if (!duelState.over) return;
    const k = 1 - Math.max(0, duelState.overLeft) / DUEL_END_FRAMES;
    const alpha = Math.min(1, k * 3);
    const accent = duelState.won ? "#c28000" : "#b3202a";
    const w = 292;
    const h = 106;
    const x = (DUEL_W - w) / 2;
    const y = DUEL_H / 2 - h / 2;
    c.save();
    c.globalAlpha = alpha;
    c.save();
    c.shadowColor = "rgba(10,40,62,.22)";
    c.shadowBlur = 24;
    c.shadowOffsetY = 9;
    duelRoundRect(c, x, y, w, h, 16);
    c.fillStyle = "rgba(255,255,255,.96)";
    c.fill();
    c.restore();
    duelRoundRect(c, x, y, w, h, 16);
    const panel = c.createLinearGradient(0, y, 0, y + h);
    panel.addColorStop(0, "rgba(255,255,255,.98)");
    panel.addColorStop(1, "rgba(236,248,255,.9)");
    c.fillStyle = panel;
    c.fill();
    duelRoundRect(c, x + 0.75, y + 0.75, w - 1.5, h - 1.5, 15.5);
    c.strokeStyle = duelHexToRgba(accent, 0.38);
    c.lineWidth = 1.4;
    c.stroke();
    c.globalAlpha = alpha * 0.9;
    c.fillStyle = accent;
    c.fillRect(x + 30, y + 1.5, w - 60, 2);
    c.globalAlpha = alpha;
    duelText(c, duelState.won ? "ПОБЕДА" : "ПОРАЖЕНИЕ", DUEL_W / 2, y + 42, 26, accent, "center", 4);
    let subtitle = duelState.won ? "БОСС ПОВЕРЖЕН" : "ЗАБЕГ ОКОНЧЕН";
    if (duelState.won && typeof bossState !== "undefined" && bossState.reward) subtitle = "+" + bossState.reward + " МОНЕТ";
    duelText(c, subtitle, DUEL_W / 2, y + 74, 10, "rgba(18,58,92,.62)", "center", 1.6, "normal");
    c.restore();
  }

