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
