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