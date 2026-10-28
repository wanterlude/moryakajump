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