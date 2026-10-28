  function duelBuildBackdrop() {
    const cv = document.createElement("canvas");
    cv.width = DUEL_W;
    cv.height = DUEL_H;
    const c = cv.getContext("2d");

    // ---------- НЕБО: синий час ----------
    const sky = c.createLinearGradient(0, 0, 0, 380);
    sky.addColorStop(0, "#0e2c40");
    sky.addColorStop(0.16, "#153d57");
    sky.addColorStop(0.34, "#1d5472");
    sky.addColorStop(0.5, "#2c6c8b");
    sky.addColorStop(0.66, "#5190ab");
    sky.addColorStop(0.8, "#8db9c9");
    sky.addColorStop(0.92, "#d3e0da");
    sky.addColorStop(1, "#f5e5d6");
    c.fillStyle = sky;
    c.fillRect(0, 0, DUEL_W, 380);

    // Звёзды
    for (let i = 0; i < 60; i++) {
      const sx = (i * 79.3 + 9) % DUEL_W;
      const sy = 4 + Math.pow((i * 41.7) % 170, 0.82);
      const a = 0.08 + ((i * 29) % 17) / 110;
      c.fillStyle = `rgba(230,248,255,${a})`;
      c.beginPath();
      c.arc(sx, sy, 0.45 + (i % 4) * 0.22, 0, Math.PI * 2);
      c.fill();
    }

    // Тонкие перистые полосы у горизонта
    c.save();
    for (let i = 0; i < 4; i++) {
      const y = 240 + i * 20;
      const g = c.createLinearGradient(0, y, 0, y + 7);
      g.addColorStop(0, "rgba(255,240,226,0)");
      g.addColorStop(0.5, `rgba(255,236,220,${0.14 - i * 0.024})`);
      g.addColorStop(1, "rgba(255,240,226,0)");
      c.fillStyle = g;
      c.fillRect(0, y, DUEL_W, 7);
    }
    c.restore();

    // Закатное свечение за хребтом
    const glow = c.createRadialGradient(286, 340, 6, 286, 340, 180);
    glow.addColorStop(0, "rgba(255,243,219,0.7)");
    glow.addColorStop(0.34, "rgba(255,224,203,0.3)");
    glow.addColorStop(0.7, "rgba(255,208,196,0.09)");
    glow.addColorStop(1, "rgba(255,208,196,0)");
    c.fillStyle = glow;
    c.fillRect(96, 150, 340, 210);

    // ---------- ГОРЫ ----------
    const far = [
      [-24, 356], [6, 330], [26, 338], [48, 312], [70, 328], [88, 306],
      [108, 326], [126, 316], [146, 334], [160, 300], [172, 288], [188, 318],
      [206, 312], [228, 330], [250, 318], [268, 336], [288, 304], [306, 322],
      [324, 316], [344, 334], [362, 320], [382, 334], [402, 326], [424, 344]
    ];
    duelRidgeFill(c, far, 360, "#a3c6d5", "#7aa6bb");
    duelRidgeRim(c, far, 210, 424, "#ffe9d4", 0.55, 1.6);
    duelRidgeRim(c, far, -24, 210, "#d9eef7", 0.35, 1.2);
    duelHazeBand(c, 320, 42, 0.22);

    const mid = [
      [-24, 358], [10, 340], [32, 346], [58, 324], [82, 340], [104, 330],
      [126, 348], [148, 328], [172, 342], [194, 322], [218, 340], [240, 334],
      [262, 350], [284, 330], [306, 344], [330, 332], [352, 348], [376, 336],
      [398, 350], [424, 342]
    ];
    duelRidgeFill(c, mid, 362, "#5c90a8", "#3c6b84");
    duelRidgeRim(c, mid, 180, 424, "#ffdec7", 0.5, 1.4);
    duelRidgeRim(c, mid, -24, 180, "#cfe9f5", 0.28, 1.1);
    duelHazeBand(c, 338, 34, 0.18);

    const nearL = [
      [-24, 366], [-24, 330], [0, 336], [16, 316], [34, 330], [52, 318],
      [70, 338], [92, 332], [110, 348], [132, 342], [150, 358], [168, 366]
    ];
    const nearR = [
      [424, 366], [424, 326], [400, 332], [382, 312], [362, 328], [344, 316],
      [324, 334], [302, 328], [284, 342], [262, 336], [242, 352], [226, 366]
    ];
    duelRidgeFill(c, nearL, 368, "#2b5a75", "#132f42");
    duelRidgeFill(c, nearR, 368, "#2f5f79", "#152f44");
    duelRidgeRim(c, nearL, -24, 168, "#ffe2d0", 0.3, 1.2);
    duelRidgeRim(c, nearR, 226, 424, "#ffe2d0", 0.28, 1.2);
    duelHazeBand(c, 350, 26, 0.14);

    // ---------- МОРЕ ----------
    const sea = c.createLinearGradient(0, DUEL_HORIZON, 0, DUEL_SHELF_TOP - 6);
    sea.addColorStop(0, "#3c86a4");
    sea.addColorStop(0.1, "#256c8b");
    sea.addColorStop(0.42, "#14506c");
    sea.addColorStop(0.76, "#0e3d54");
    sea.addColorStop(1, "#0c3a4f");
    c.fillStyle = sea;
    c.fillRect(0, DUEL_HORIZON, DUEL_W, DUEL_SHELF_TOP - 6 - DUEL_HORIZON);

    // Тонкая линия горизонта
    c.save();
    c.globalAlpha = 0.5;
    c.strokeStyle = "rgba(236,252,255,0.8)";
    c.lineWidth = 1;
    c.beginPath();
    c.moveTo(0, DUEL_HORIZON + 0.5);
    c.lineTo(DUEL_W, DUEL_HORIZON + 0.5);
    c.stroke();
    c.restore();
    duelHazeBand(c, 352, 44, 0.1);

    // Отражение хребта в воде
    c.save();
    c.beginPath();
    c.rect(0, DUEL_HORIZON, DUEL_W, 150);
    c.clip();
    c.translate(0, DUEL_HORIZON * 2);
    c.scale(1, -1);
    duelRidgeFill(c, mid, 362, "rgba(9,40,58,0.08)");
    c.restore();
    const reflectFade = c.createLinearGradient(0, DUEL_HORIZON, 0, DUEL_HORIZON + 130);
    reflectFade.addColorStop(0, "rgba(24,88,116,0)");
    reflectFade.addColorStop(0.35, "rgba(24,88,116,0.12)");
    reflectFade.addColorStop(1, "rgba(18,70,94,0.5)");
    c.fillStyle = reflectFade;
    c.fillRect(0, DUEL_HORIZON, DUEL_W, 130);

    // Отражение заката на воде (мягкое)
    c.save();
    c.globalCompositeOperation = "lighter";
    c.translate(290, DUEL_HORIZON);
    c.scale(1, 1.5);
    const refl = c.createRadialGradient(0, 0, 4, 0, 0, 74);
    refl.addColorStop(0, "rgba(255,226,200,0.26)");
    refl.addColorStop(0.4, "rgba(255,214,196,0.1)");
    refl.addColorStop(1, "rgba(255,214,196,0)");
    c.fillStyle = refl;
    c.beginPath();
    c.arc(0, 0, 74, 0, Math.PI * 2);
    c.fill();
    c.restore();

    // Рябь: ряды с перспективой
    c.save();
    c.lineCap = "round";
    for (let row = 0; row < 16; row++) {
      const k0 = row / 15;
      const y = DUEL_HORIZON + 4 + Math.pow(k0, 1.75) * (DUEL_SHELF_TOP - DUEL_HORIZON - 16);
      const count = 2 + Math.floor(k0 * 4);
      for (let k = 0; k < count; k++) {
        const w = 16 + k0 * 54 + ((row * 7 + k * 13) % 22);
        const x = ((row * 53 + k * 97 + 11) % (DUEL_W + 40)) - 30;
        const a = (0.3 - k0 * 0.16) * (k % 2 === 0 ? 1 : 0.6);
        c.globalAlpha = Math.max(0.03, a);
        c.strokeStyle = k % 3 === 0 ? "rgba(238,253,255,0.9)" : "rgba(200,240,255,0.6)";
        c.lineWidth = 0.7 + k0 * 0.9;
        c.beginPath();
        c.moveTo(x, y);
        c.quadraticCurveTo(x + w / 2, y - 0.8 - k0 * 1.4, x + w, y);
        c.stroke();
      }
    }
    c.restore();

    // Солнечные дорожки на воде
    c.save();
    c.globalCompositeOperation = "lighter";
    for (let i = 0; i < 9; i++) {
      const y = DUEL_HORIZON + 7 + i * 9 + (i % 3) * 4;
      const x = 214 + Math.sin(i * 1.7) * 58 - i * 5;
      const w = 28 + i * 9;
      c.globalAlpha = 0.07 - i * 0.004;
      const g = c.createLinearGradient(x, 0, x + w, 0);
      g.addColorStop(0, "rgba(255,244,226,0)");
      g.addColorStop(0.5, "rgba(255,246,230,0.7)");
      g.addColorStop(1, "rgba(255,244,226,0)");
      c.fillStyle = g;
      c.fillRect(x, y, w, 1.5);
    }
    c.restore();

    // Кромка ледяного поля у горизонта
    c.save();
    c.globalAlpha = 0.34;
    const field = c.createLinearGradient(0, 362, 0, 382);
    field.addColorStop(0, "rgba(232,252,255,0.9)");
    field.addColorStop(1, "rgba(160,214,232,0)");
    c.fillStyle = field;
    c.beginPath();
    c.moveTo(0, 372);
    for (let x = 0; x <= DUEL_W; x += 16) {
      c.lineTo(x, 369 + Math.sin(x / 37) * 2 + Math.sin(x / 13) * 1.1);
    }
    c.lineTo(DUEL_W, 382);
    c.lineTo(0, 382);
    c.closePath();
    c.fill();
    c.restore();

    // Длинные линии ледяных полей
    c.save();
    c.globalAlpha = 0.08;
    c.strokeStyle = "rgba(212,244,255,0.9)";
    c.lineWidth = 1;
    for (let i = 0; i < 6; i++) {
      const y = 384 + i * 24;
      c.beginPath();
      c.moveTo(-10 + (i % 3) * 30, y);
      c.lineTo(120 + (i % 4) * 60, y - 2 + (i % 2));
      c.moveTo(230 + (i % 3) * 26, y + 6);
      c.lineTo(DUEL_W + 10, y + 4);
      c.stroke();
    }
    c.restore();

    // Дальние льдины (перспектива: чем ниже, тем крупнее)
    duelFloe(c, 12, 366, 30, 5, 0.5, true);
    duelFloe(c, 120, 364, 26, 4, 0.42, true);
    duelFloe(c, 268, 366, 34, 6, 0.46, true);
    duelFloe(c, 344, 371, 36, 7, 0.4, true);
    duelFloe(c, 62, 375, 40, 7, 0.3, false);
    duelFloe(c, 190, 379, 44, 8, 0.27, false);
    duelFloe(c, 262, 391, 56, 10, 0.21, false);
    duelFloe(c, 34, 405, 66, 12, 0.17, false);
    duelFloe(c, 316, 419, 78, 14, 0.14, false);
    duelFloe(c, 158, 436, 92, 16, 0.11, false);

    // Объём волн: широкие мягкие полосы
    c.save();
    for (let i = 0; i < 5; i++) {
      const y = 430 + i * 20;
      const g = c.createLinearGradient(0, y, 0, y + 14);
      g.addColorStop(0, "rgba(6,32,46,0)");
      g.addColorStop(0.5, "rgba(6,32,46,0.07)");
      g.addColorStop(1, "rgba(6,32,46,0)");
      c.fillStyle = g;
      c.fillRect(0, y, DUEL_W, 14);
    }
    c.restore();

    // Световые полосы в толще воды
    c.save();
    c.globalCompositeOperation = "lighter";
    for (let i = 0; i < 6; i++) {
      const y = 444 + i * 13;
      const x = i % 2 === 0 ? -20 : 190;
      const w = 150 + (i % 4) * 58;
      c.globalAlpha = 0.018 + (i % 3) * 0.006;
      const g = c.createLinearGradient(x, 0, x + w, 0);
      g.addColorStop(0, "rgba(190,238,255,0)");
      g.addColorStop(0.5, "rgba(200,242,255,0.6)");
      g.addColorStop(1, "rgba(190,238,255,0)");
      c.fillStyle = g;
      c.fillRect(x, y, w, 2 + (i % 2));
    }
    c.restore();

    // Трещины
    duelFloe(c, 190, 444, 66, 14, 0.13, false);
    c.save();
    c.globalAlpha = 0.22;
    c.strokeStyle = "rgba(170,232,250,0.7)";
    c.lineWidth = 1.3;
    c.lineCap = "round";
    c.beginPath();
    c.moveTo(-8, 424);
    c.lineTo(30, 430);
    c.lineTo(58, 422);
    c.lineTo(92, 431);
    c.lineTo(124, 424);
    c.moveTo(274, 440);
    c.lineTo(306, 447);
    c.lineTo(336, 438);
    c.lineTo(370, 448);
    c.stroke();
    c.restore();

    // Ледяные образования (низкие, широкие)
    const berg = (x, baseY, w, h, alpha) => {
      c.save();
      c.globalAlpha = alpha;
      // Подводная часть
      c.beginPath();
      c.moveTo(x + w * 0.04, baseY);
      c.lineTo(x + w * 0.22, baseY + h * 0.5);
      c.lineTo(x + w * 0.52, baseY + h * 0.62);
      c.lineTo(x + w * 0.82, baseY + h * 0.42);
      c.lineTo(x + w * 0.96, baseY);
      c.closePath();
      c.fillStyle = "rgba(10,48,68,0.26)";
      c.fill();
      // Надводная часть
      c.beginPath();
      c.moveTo(x, baseY);
      c.lineTo(x + w * 0.07, baseY - h * 0.44);
      c.lineTo(x + w * 0.2, baseY - h * 0.68);
      c.lineTo(x + w * 0.34, baseY - h * 0.52);
      c.lineTo(x + w * 0.5, baseY - h * 0.92);
      c.lineTo(x + w * 0.63, baseY - h * 0.56);
      c.lineTo(x + w * 0.79, baseY - h * 0.7);
      c.lineTo(x + w * 0.9, baseY - h * 0.3);
      c.lineTo(x + w, baseY);
      c.closePath();
      const g = c.createLinearGradient(0, baseY - h, 0, baseY);
      g.addColorStop(0, "#eaf9ff");
      g.addColorStop(0.35, "#bfe2ef");
      g.addColorStop(0.75, "#7cb3ca");
      g.addColorStop(1, "#4d86a2");
      c.fillStyle = g;
      c.fill();
      // Светлая кромка
      c.strokeStyle = "rgba(255,255,255,0.55)";
      c.lineWidth = 1;
      c.lineCap = "round";
      c.beginPath();
      c.moveTo(x + w * 0.2, baseY - h * 0.68);
      c.lineTo(x + w * 0.34, baseY - h * 0.52);
      c.lineTo(x + w * 0.5, baseY - h * 0.92);
      c.lineTo(x + w * 0.63, baseY - h * 0.56);
      c.lineTo(x + w * 0.79, baseY - h * 0.7);
      c.stroke();
      // Тень на правой грани
      c.beginPath();
      c.moveTo(x + w * 0.5, baseY - h * 0.92);
      c.lineTo(x + w * 0.63, baseY - h * 0.56);
      c.lineTo(x + w * 0.9, baseY - h * 0.3);
      c.lineTo(x + w, baseY);
      c.lineTo(x + w * 0.62, baseY);
      c.lineTo(x + w * 0.54, baseY - h * 0.2);
      c.closePath();
      c.fillStyle = "rgba(18,72,98,0.14)";
      c.fill();
      c.restore();
    };
    berg(-26, 486, 150, 34, 0.7);
    berg(298, 496, 142, 30, 0.7);
    berg(150, 461, 54, 13, 0.32);

    // ---------- ЛЕДЯНАЯ ПОЛКА ----------
    c.beginPath();
    c.moveTo(-12, duelShelfTop(-12));
    for (let x = 0; x <= DUEL_W + 12; x += 8) c.lineTo(x, duelShelfTop(x));
    c.lineTo(DUEL_W + 12, DUEL_H);
    c.lineTo(-12, DUEL_H);
    c.closePath();
    const shelf = c.createLinearGradient(0, DUEL_SHELF_TOP - 4, 0, DUEL_H);
    shelf.addColorStop(0, "#e8f8fd");
    shelf.addColorStop(0.07, "#c9e9f5");
    shelf.addColorStop(0.2, "#93c9df");
    shelf.addColorStop(0.44, "#5c9eba");
    shelf.addColorStop(0.72, "#33748f");
    shelf.addColorStop(1, "#20506a");
    c.fillStyle = shelf;
    c.fill();

    // Тень на стыке снега и льда
    c.save();
    c.beginPath();
    c.moveTo(-12, duelShelfTop(-12));
    for (let x = 0; x <= DUEL_W + 12; x += 8) c.lineTo(x, duelShelfTop(x));
    c.lineTo(DUEL_W + 12, DUEL_SHELF_TOP + 6);
    for (let x = DUEL_W + 12; x >= -12; x -= 8) c.lineTo(x, duelShelfTop(x) + 6);
    c.closePath();
    c.fillStyle = "rgba(20,74,100,0.14)";
    c.fill();
    c.restore();

    // Грани льда в толще полки (мягкие)
    const facets = [
      [[-10, 552], [36, 542], [64, 566], [18, 584]],
      [[58, 546], [104, 540], [128, 574], [82, 592]],
      [[118, 550], [160, 544], [186, 578], [142, 596]],
      [[176, 544], [222, 540], [250, 570], [206, 594]],
      [[240, 546], [286, 542], [312, 576], [268, 598]],
      [[304, 548], [350, 542], [386, 574], [340, 598]],
      [[360, 546], [412, 542], [424, 590], [392, 600]]
    ];
    let fi = 0;
    for (const f of facets) {
      c.beginPath();
      c.moveTo(f[0][0], f[0][1]);
      for (let k = 1; k < f.length; k++) c.lineTo(f[k][0], f[k][1]);
      c.closePath();
      c.fillStyle = fi % 2 === 0 ? "rgba(255,255,255,0.035)" : "rgba(16,74,102,0.045)";
      c.fill();
      fi++;
    }

    // Снежная шапка полки: неровная кромка
    const drifts = [
      [-16, 26, 8], [34, 34, 5], [80, 26, 4], [126, 38, 6],
      [172, 28, 4], [214, 34, 6], [256, 24, 4], [298, 34, 5],
      [342, 26, 4], [388, 34, 7]
    ];
    c.save();
    c.beginPath();
    c.moveTo(-12, duelShelfTop(-12) + 30);
    c.lineTo(-12, duelShelfTop(-12));
    for (const d of drifts) {
      const [dx, dw, dh] = d;
      c.quadraticCurveTo(dx - dw * 0.2, duelShelfTop(dx) - dh, dx + dw * 0.5, duelShelfTop(dx + dw * 0.5));
    }
    c.lineTo(DUEL_W + 12, duelShelfTop(DUEL_W + 12) + 30);
    c.closePath();
    const snowCap = c.createLinearGradient(0, DUEL_SHELF_TOP - 10, 0, DUEL_SHELF_TOP + 14);
    snowCap.addColorStop(0, "rgba(255,255,255,0.96)");
    snowCap.addColorStop(0.45, "rgba(240,252,255,0.8)");
    snowCap.addColorStop(1, "rgba(218,242,252,0)");
    c.fillStyle = snowCap;
    c.fill();
    c.restore();

    // Контровой свет по кромке (тёплый, от заката)
    c.save();
    c.globalCompositeOperation = "lighter";
    c.lineCap = "round";
    const rim = c.createLinearGradient(0, 0, DUEL_W, 0);
    rim.addColorStop(0, "rgba(255,236,214,0.1)");
    rim.addColorStop(0.55, "rgba(255,246,228,0.34)");
    rim.addColorStop(1, "rgba(255,236,214,0.14)");
    c.strokeStyle = rim;
    c.lineWidth = 1.8;
    c.beginPath();
    for (let x = 0; x <= DUEL_W; x += 8) {
      const y = duelShelfTop(x) - 1;
      if (x === 0) c.moveTo(x, y);
      else c.lineTo(x, y);
    }
    c.stroke();
    c.restore();

    // Вертикальные прожилки в толще
    c.save();
    c.globalAlpha = 0.1;
    for (let i = 0; i < 12; i++) {
      const x = 20 + i * 32;
      c.strokeStyle = i % 2 === 0 ? "rgba(255,255,255,0.85)" : "rgba(16,64,88,0.8)";
      c.lineWidth = i % 2 === 0 ? 1.2 : 0.9;
      c.beginPath();
      c.moveTo(x, DUEL_SHELF_TOP + 14 + (i % 3) * 5);
      c.lineTo(x - 6 + (i % 5) * 3, DUEL_H);
      c.stroke();
    }
    c.restore();

    // Осколки льда на полке
    duelFloe(c, 34, 550, 46, 11, 0.32, false);
    duelFloe(c, 318, 556, 52, 12, 0.28, false);

    // Дымка над кромкой: смягчает переход воды и льда
    const lipMist = c.createLinearGradient(0, 505, 0, 545);
    lipMist.addColorStop(0, "rgba(214,242,255,0)");
    lipMist.addColorStop(0.72, "rgba(214,242,255,0.14)");
    lipMist.addColorStop(1, "rgba(214,242,255,0)");
    c.fillStyle = lipMist;
    c.fillRect(0, 505, DUEL_W, 40);

    // Световое пятно на снегу под игроком
    c.save();
    c.globalCompositeOperation = "lighter";
    c.globalAlpha = 0.1;
    const pool = c.createRadialGradient(DUEL_W / 2, 556, 8, DUEL_W / 2, 556, 120);
    pool.addColorStop(0, "rgba(255,252,240,0.8)");
    pool.addColorStop(1, "rgba(255,252,240,0)");
    c.fillStyle = pool;
    c.beginPath();
    c.ellipse(DUEL_W / 2, 556, 130, 30, 0, 0, Math.PI * 2);
    c.fill();
    c.restore();

    // ---------- ПЕРЕДНИЙ ПЛАН: ледяные глыбы ----------
    const chunk = (cx, baseY, w, h) => {
      c.save();
      c.beginPath();
      c.moveTo(cx - w * 0.5, baseY);
      c.lineTo(cx - w * 0.46, baseY - h * 0.42);
      c.lineTo(cx - w * 0.24, baseY - h * 0.72);
      c.lineTo(cx - w * 0.02, baseY - h * 0.6);
      c.lineTo(cx + w * 0.16, baseY - h * 0.86);
      c.lineTo(cx + w * 0.38, baseY - h * 0.5);
      c.lineTo(cx + w * 0.5, baseY - h * 0.18);
      c.lineTo(cx + w * 0.34, baseY);
      c.closePath();
      const g = c.createLinearGradient(cx - w * 0.3, baseY - h, cx + w * 0.3, baseY);
      g.addColorStop(0, "#dbedf7");
      g.addColorStop(0.3, "#b6d9e9");
      g.addColorStop(0.64, "#6ba1b9");
      g.addColorStop(1, "#3f7691");
      c.fillStyle = g;
      c.fill();
      c.beginPath();
      c.moveTo(cx - w * 0.02, baseY - h * 0.6);
      c.lineTo(cx + w * 0.16, baseY - h * 0.86);
      c.lineTo(cx + w * 0.38, baseY - h * 0.5);
      c.lineTo(cx + w * 0.1, baseY - h * 0.38);
      c.closePath();
      c.fillStyle = "rgba(255,255,255,0.24)";
      c.fill();
      c.beginPath();
      c.moveTo(cx + w * 0.38, baseY - h * 0.5);
      c.lineTo(cx + w * 0.5, baseY - h * 0.18);
      c.lineTo(cx + w * 0.34, baseY);
      c.lineTo(cx + w * 0.12, baseY - h * 0.3);
      c.closePath();
      c.fillStyle = "rgba(14,60,86,0.2)";
      c.fill();
      c.strokeStyle = "rgba(255,238,220,0.32)";
      c.lineWidth = 1.1;
      c.beginPath();
      c.moveTo(cx - w * 0.46, baseY - h * 0.42);
      c.lineTo(cx - w * 0.24, baseY - h * 0.72);
      c.lineTo(cx - w * 0.02, baseY - h * 0.6);
      c.lineTo(cx + w * 0.16, baseY - h * 0.86);
      c.stroke();
      c.restore();
    };
    chunk(6, 606, 150, 70);
    chunk(398, 610, 158, 74);
    chunk(96, 618, 96, 44);

    // Затемнение у нижней кромки, чтобы передний план не «светился»
    const foot = c.createLinearGradient(0, 556, 0, DUEL_H);
    foot.addColorStop(0, "rgba(10,40,58,0)");
    foot.addColorStop(1, "rgba(8,32,48,0.28)");
    c.fillStyle = foot;
    c.fillRect(0, 556, DUEL_W, DUEL_H - 556);

    // Зерно
    c.save();
    for (let i = 0; i < 1800; i++) {
      const gx = (i * 79.13 + 13) % DUEL_W;
      const gy = (i * 131.71 + 7) % DUEL_H;
      c.fillStyle = i % 2 === 0 ? "rgba(255,255,255,0.045)" : "rgba(8,34,50,0.05)";
      c.fillRect(gx, gy, 1, 1);
    }
    c.restore();
    return cv;
  }
  // --- Арены боссов 2 и 4: многослойная живопись вместо плоских заливок ---
  function duelArenaRand(seed) {
    let s = seed >>> 0;
    return function () {
      s = (s * 1664525 + 1013904223) >>> 0;
      return s / 4294967296;
    };
  }
  function duelArenaMountain(c, cx, apexY, halfW, baseY, body, snow, shade) {
    const h = baseY - apexY;
    c.beginPath();
    c.moveTo(cx - halfW, baseY);
    c.lineTo(cx - halfW * 0.62, baseY - h * 0.38);
    c.lineTo(cx - halfW * 0.34, baseY - h * 0.52);
    c.lineTo(cx - halfW * 0.12, apexY + h * 0.22);
    c.lineTo(cx, apexY);
    c.lineTo(cx + halfW * 0.18, apexY + h * 0.3);
    c.lineTo(cx + halfW * 0.42, apexY + h * 0.44);
    c.lineTo(cx + halfW * 0.7, baseY - h * 0.2);
    c.lineTo(cx + halfW, baseY);
    c.closePath();
    c.fillStyle = body;
    c.fill();
    c.beginPath();
    c.moveTo(cx, apexY);
    c.lineTo(cx + halfW * 0.18, apexY + h * 0.3);
    c.lineTo(cx + halfW * 0.42, apexY + h * 0.44);
    c.lineTo(cx + halfW * 0.7, baseY - h * 0.2);
    c.lineTo(cx + halfW, baseY);
    c.lineTo(cx + halfW * 0.1, baseY);
    c.closePath();
    c.fillStyle = shade;
    c.fill();
    c.beginPath();
    c.moveTo(cx, apexY);
    c.lineTo(cx - halfW * 0.12, apexY + h * 0.22);
    c.lineTo(cx - halfW * 0.2, apexY + h * 0.3);
    c.lineTo(cx - halfW * 0.14, apexY + h * 0.28);
    c.lineTo(cx - halfW * 0.08, apexY + h * 0.36);
    c.lineTo(cx - halfW * 0.02, apexY + h * 0.3);
    c.lineTo(cx + halfW * 0.06, apexY + h * 0.38);
    c.lineTo(cx + halfW * 0.12, apexY + h * 0.3);
    c.lineTo(cx + halfW * 0.18, apexY + h * 0.3);
    c.closePath();
    c.fillStyle = snow;
    c.fill();
    c.strokeStyle = "rgba(255,255,255,.32)";
    c.lineWidth = 1;
    c.beginPath();
    c.moveTo(cx - halfW * 0.62, baseY - h * 0.38);
    c.lineTo(cx - halfW * 0.12, apexY + h * 0.22);
    c.lineTo(cx, apexY);
    c.stroke();
  }