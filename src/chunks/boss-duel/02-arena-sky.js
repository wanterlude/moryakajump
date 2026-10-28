  function duelBossDef(index) {
    return DUEL_BOSS_DEFS[Math.min(Math.max(index | 0, 0), DUEL_BOSS_DEFS.length - 1)];
  }
  function duelBossKind() {
    return duelState.bossKind || "kraken";
  }
  function duelPatterns() {
    const kind = duelBossKind();
    if (kind === "yeti") return DUEL_PATTERNS_YETI;
    if (kind === "storm") return DUEL_PATTERNS_STORM;
    if (kind === "avalanche") return DUEL_PATTERNS_AVALANCHE;
    if (kind === "leviathan") return DUEL_PATTERNS_LEVIATHAN;
    return DUEL_PATTERNS_KRAKEN;
  }
  var DUEL_PHASE_TINTS = [
    "rgba(79,195,247,0.00)",
    "rgba(255,194,71,0.055)",
    "rgba(255,92,122,0.075)"
  ];
  var duelBackdropCanvas = null;
  var duelGlowSprites = /* @__PURE__ */ new Map();
  var DUEL_SNOWFLAKES = [];
  for (let i = 0; i < 34; i++) {
    DUEL_SNOWFLAKES.push({
      x: (i * 73.7) % DUEL_W,
      y: (i * 131.3) % DUEL_H,
      r: 0.9 + (i % 4) * 0.55,
      speed: 0.55 + (i % 5) * 0.18,
      drift: 0.25 + (i % 3) * 0.16,
      phase: i * 0.7
    });
  }
  function duelRoundRect(c, x, y, w, h, r) {
    c.beginPath();
    c.roundRect(x, y, w, h, Math.max(0, Math.min(r, Math.min(w, h) / 2)));
  }
  function duelText(c, text, x, y, size, color, align = "left", tracking = 0, weight = "bold") {
    const chars = [...text];
    c.save();
    c.font = `${weight} ${size}px ${FONT_STACK}`;
    c.fillStyle = color;
    c.textBaseline = "middle";
    if (tracking <= 0) {
      c.textAlign = align;
      c.fillText(text, x, y);
      c.restore();
      return c.measureText(text).width;
    }
    const widths = chars.map((ch) => c.measureText(ch).width);
    const total = widths.reduce((sum, w) => sum + w, 0) + tracking * Math.max(0, chars.length - 1);
    let cursor = align === "center" ? x - total / 2 : align === "right" ? x - total : x;
    c.textAlign = "left";
    for (let i = 0; i < chars.length; i++) {
      c.fillText(chars[i], cursor, y);
      cursor += widths[i] + tracking;
    }
    c.restore();
    return total;
  }
  function duelHexToRgba(hex, alpha) {
    const h = String(hex).replace("#", "");
    const n = h.length === 3 ? [...h].map((ch) => ch + ch).join("") : h;
    const r = parseInt(n.slice(0, 2), 16) || 0;
    const g = parseInt(n.slice(2, 4), 16) || 0;
    const b = parseInt(n.slice(4, 6), 16) || 0;
    return `rgba(${r},${g},${b},${alpha})`;
  }
  function duelGlowSprite(color) {
    let sprite = duelGlowSprites.get(color);
    if (sprite) return sprite;
    const size = 64;
    const cv = document.createElement("canvas");
    cv.width = size;
    cv.height = size;
    const g = cv.getContext("2d");
    const grad = g.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    grad.addColorStop(0, "rgba(255,255,255,0.95)");
    grad.addColorStop(0.18, duelHexToRgba(color, 0.85));
    grad.addColorStop(0.5, duelHexToRgba(color, 0.28));
    grad.addColorStop(1, duelHexToRgba(color, 0));
    g.fillStyle = grad;
    g.fillRect(0, 0, size, size);
    duelGlowSprites.set(color, cv);
    return cv;
  }
  function duelDrawGlow(c, x, y, radius, color) {
    const sprite = duelGlowSprite(color);
    c.drawImage(sprite, x - radius, y - radius, radius * 2, radius * 2);
  }
  var DUEL_HORIZON = 356;
  var DUEL_SHELF_TOP = 535;
  var DUEL_ARENA_SPARKLES = [];
  for (let i = 0; i < 18; i++) {
    DUEL_ARENA_SPARKLES.push({
      x: 20 + (i * 101.3) % (DUEL_W - 40),
      y: 552 + (i * 43.7) % 36,
      r: 0.6 + (i % 3) * 0.45,
      phase: i * 1.37,
      speed: 0.5 + (i % 4) * 0.2
    });
  }
  DUEL_SNOWFLAKES.length = 0;
  for (let i = 0; i < 66; i++) {
    const depth = i % 3;
    DUEL_SNOWFLAKES.push({
      x: (i * 61.7) % DUEL_W,
      y: (i * 149.3) % DUEL_H,
      r: depth === 0 ? 0.5 + (i % 3) * 0.25 : depth === 1 ? 1.0 + (i % 3) * 0.3 : 2.2 + (i % 4) * 0.45,
      speed: depth === 0 ? 0.3 + (i % 4) * 0.07 : depth === 1 ? 0.62 + (i % 4) * 0.1 : 1.05 + (i % 3) * 0.18,
      drift: depth === 0 ? 0.12 : depth === 1 ? 0.3 : 0.5,
      phase: i * 0.63,
      depth
    });
  }
  function duelShelfTop(x) {
    return DUEL_SHELF_TOP + Math.sin(x / 74) * 1.5 + Math.sin(x / 23) * 0.6;
  }
  function duelRidgeFill(c, pts, baseY, fill, fill2) {
    c.beginPath();
    c.moveTo(pts[0][0], baseY);
    for (const p of pts) c.lineTo(p[0], p[1]);
    c.lineTo(pts[pts.length - 1][0], baseY);
    c.closePath();
    if (fill2) {
      let minY = baseY;
      for (const p of pts) if (p[1] < minY) minY = p[1];
      const g = c.createLinearGradient(0, minY, 0, baseY);
      g.addColorStop(0, fill);
      g.addColorStop(1, fill2);
      c.fillStyle = g;
    } else {
      c.fillStyle = fill;
    }
    c.fill();
  }
  function duelRidgeRim(c, pts, fromX, toX, color, alpha, width) {
    c.save();
    c.lineCap = "round";
    c.lineJoin = "round";
    c.strokeStyle = color;
    c.globalAlpha = alpha;
    c.lineWidth = width;
    c.beginPath();
    let started = false;
    for (let i = 0; i < pts.length; i++) {
      const p = pts[i];
      if (p[0] < fromX || p[0] > toX) continue;
      if (!started) {
        c.moveTo(p[0], p[1]);
        started = true;
      } else {
        c.lineTo(p[0], p[1]);
      }
    }
    c.stroke();
    c.restore();
  }
  function duelHazeBand(c, y, h, alpha) {
    const g = c.createLinearGradient(0, y, 0, y + h);
    g.addColorStop(0, "rgba(226,248,255,0)");
    g.addColorStop(0.5, `rgba(226,248,255,${alpha})`);
    g.addColorStop(1, "rgba(226,248,255,0)");
    c.fillStyle = g;
    c.fillRect(0, y, DUEL_W, h);
  }
  function duelFloe(c, x, y, w, h, alpha, light) {
    c.save();
    c.globalAlpha = alpha;
    // Мягкая тень-отражение под льдиной
    const sh = c.createRadialGradient(x + w * 0.5, y + h * 0.8, 1, x + w * 0.5, y + h * 0.8, w * 0.55);
    sh.addColorStop(0, "rgba(6,34,50,0.16)");
    sh.addColorStop(1, "rgba(6,34,50,0)");
    c.fillStyle = sh;
    c.beginPath();
    c.ellipse(x + w * 0.5, y + h * 0.8, w * 0.55, h * 0.5, 0, 0, Math.PI * 2);
    c.fill();
    // Плоская льдина
    c.beginPath();
    c.moveTo(x + w * 0.02, y + h * 0.46);
    c.lineTo(x + w * 0.17, y + h * 0.14);
    c.lineTo(x + w * 0.45, y + h * 0.02);
    c.lineTo(x + w * 0.78, y + h * 0.08);
    c.lineTo(x + w * 0.98, y + h * 0.46);
    c.lineTo(x + w * 0.8, y + h * 0.9);
    c.lineTo(x + w * 0.42, y + h);
    c.lineTo(x + w * 0.12, y + h * 0.84);
    c.closePath();
    const g = c.createLinearGradient(0, y, 0, y + h);
    g.addColorStop(0, light ? "#f2fdff" : "#dcf3fc");
    g.addColorStop(0.5, "#aad7e8");
    g.addColorStop(1, "#6ba5bf");
    c.fillStyle = g;
    c.fill();
    // Светлая кромка сверху
    c.strokeStyle = "rgba(255,255,255,0.7)";
    c.lineWidth = 0.9;
    c.beginPath();
    c.moveTo(x + w * 0.17, y + h * 0.14);
    c.lineTo(x + w * 0.45, y + h * 0.02);
    c.lineTo(x + w * 0.78, y + h * 0.08);
    c.stroke();
    c.restore();
  }
  function duelAuroraCloud(c, t, seed, colorA, colorB, strength) {
    c.save();
    c.globalCompositeOperation = "lighter";
    for (let pass = 0; pass < 2; pass++) {
      const color = pass === 0 ? colorA : colorB;
      const baseY = 74 + seed * 0.5 + pass * 54;
      for (let i = 0; i < 13; i++) {
        const x = -26 + i * 36 + Math.sin(t / 190 + i * 0.85 + seed) * 18;
        const y = baseY + Math.sin(i * 0.72 + t / 150 + seed) * 21 + Math.sin(i * 1.9 + seed) * 7;
        const rr = 46 + Math.sin(i * 1.3 + seed) * 12;
        c.globalAlpha = (pass === 0 ? 0.09 : 0.06) * strength;
        duelDrawGlow(c, x, y, rr, color);
      }
    }
    // Вертикальные «столбы» сияния
    c.save();
    c.translate(0, 96 + seed * 0.4);
    c.scale(0.42, 1.5);
    for (let i = 0; i < 5; i++) {
      const x = (24 + i * 96) / 0.42 + Math.sin(t / 210 + i + seed) * 22;
      c.globalAlpha = 0.045 * strength;
      duelDrawGlow(c, x, 0, 82, colorB);
    }
    c.restore();
    // Яркая дуга-гребень
    c.lineCap = "round";
    c.lineJoin = "round";
    for (let k = 0; k < 3; k++) {
      c.globalAlpha = (0.05 - k * 0.012) * strength;
      c.strokeStyle = colorA;
      c.lineWidth = 26 - k * 7;
      c.beginPath();
      for (let x = -20; x <= DUEL_W + 20; x += 14) {
        const y = 128 + seed * 0.5 + Math.sin(x / 96 + t / 150 + seed) * 20 + Math.sin(x / 34 - t / 190) * 6;
        if (x === -20) c.moveTo(x, y);
        else c.lineTo(x, y);
      }
      c.stroke();
    }
    c.restore();
  }
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
  function duelArenaCanyon(c) {
    const W = DUEL_W, H = DUEL_H;
    const rand = duelArenaRand(0x51ca11);
    c.save();

    // Закатный каньон: тёплый свет на снегу, синие тени.
    const sky = c.createLinearGradient(0, 0, 0, H);
    sky.addColorStop(0, "#5f9fcf");
    sky.addColorStop(0.3, "#8fc0dd");
    sky.addColorStop(0.52, "#cfdfe9");
    sky.addColorStop(0.72, "#f6dcc2");
    sky.addColorStop(0.9, "#ffe8cf");
    sky.addColorStop(1, "#fff4e4");
    c.fillStyle = sky;
    c.fillRect(0, 0, W, H);
    // Прохладная полоса за боссом: белая шерсть не сливается с небом.
    const coolBand = c.createLinearGradient(0, 76, 0, 300);
    coolBand.addColorStop(0, "rgba(38,110,150,0)");
    coolBand.addColorStop(0.45, "rgba(38,110,150,.18)");
    coolBand.addColorStop(1, "rgba(38,110,150,0)");
    c.fillStyle = coolBand;
    c.fillRect(0, 76, W, 224);

    const sun = c.createRadialGradient(270, 200, 4, 270, 200, 168);
    sun.addColorStop(0, "rgba(255,252,236,1)");
    sun.addColorStop(0.12, "rgba(255,238,198,.9)");
    sun.addColorStop(0.38, "rgba(255,202,142,.3)");
    sun.addColorStop(1, "rgba(255,186,120,0)");
    c.fillStyle = sun;
    c.fillRect(40, 20, 360, 380);
    c.fillStyle = "rgba(255,250,236,.95)";
    c.beginPath();
    c.arc(270, 200, 20, 0, Math.PI * 2);
    c.fill();

    // Дальние и средние горы — как в основном фоне.
    const far = [
      [-24, 210, 96, 358],
      [44, 168, 88, 358],
      [112, 216, 84, 358],
      [180, 152, 98, 358],
      [250, 198, 90, 358],
      [320, 164, 94, 358],
      [392, 212, 92, 358]
    ];
    for (const p of far) duelArenaMountain(c, p[0], p[1], p[2], p[3], "#789ab4", "#e2f4fc", "#6b8ca6");
    const mid = [
      [-10, 292, 104, 432],
      [66, 240, 96, 432],
      [146, 288, 98, 432],
      [228, 232, 102, 432],
      [310, 276, 96, 432],
      [390, 244, 98, 432]
    ];
    for (const p of mid) duelArenaMountain(c, p[0], p[1], p[2], p[3], "#92b3c9", "#f4fcff", "#7ea0b8");
    // Ближний хребет за водопадом: средний тон, чтобы босс не терялся.
    const nearFar = [
      [120, 296, 72, 400],
      [204, 258, 82, 400],
      [290, 292, 70, 400]
    ];
    for (const p of nearFar) duelArenaMountain(c, p[0], p[1], p[2], p[3], "#6487a4", "#dceef8", "#557a97");
    const haze = c.createLinearGradient(0, 300, 0, 440);
    haze.addColorStop(0, "rgba(240,250,255,0)");
    haze.addColorStop(0.55, "rgba(240,250,255,.28)");
    haze.addColorStop(1, "rgba(245,252,255,.6)");
    c.fillStyle = haze;
    c.fillRect(0, 300, W, 140);
    const warm = c.createLinearGradient(0, 300, 0, 450);
    warm.addColorStop(0, "rgba(255,206,150,0)");
    warm.addColorStop(0.5, "rgba(255,206,150,.04)");
    warm.addColorStop(1, "rgba(255,224,184,.08)");
    c.fillStyle = warm;
    c.fillRect(0, 300, W, 150);
    for (let i = 0; i < 5; i++) {
      const baseY = 430 + i * 34;
      const hill = c.createLinearGradient(0, baseY - 26, 0, baseY + 22);
      hill.addColorStop(0, "#f7fdff");
      hill.addColorStop(1, "#cfe6f2");
      c.fillStyle = hill;
      c.beginPath();
      c.ellipse(200 + (i % 2 ? 40 : -40), baseY, 260, 26, 0, 0, Math.PI * 2);
      c.fill();
    }
    for (let i = 0; i < 6; i++) {
      const y = 372 + i * 26;
      c.strokeStyle = `rgba(84,152,180,${0.12 + (i % 3) * 0.05})`;
      c.lineWidth = 1.2 + (i % 2) * 0.7;
      c.beginPath();
      c.moveTo(160, y);
      c.bezierCurveTo(200, y + 7, 248, y - 5, 292, y + 3);
      c.stroke();
    }

    // Замёрзший водопад в глубине — цветовой акцент арены.
    const wfPath = () => {
      c.beginPath();
      c.moveTo(236, 252);
      c.bezierCurveTo(262, 286, 244, 330, 264, 366);
      c.bezierCurveTo(280, 396, 260, 442, 272, 486);
      c.lineTo(248, 492);
      c.bezierCurveTo(240, 448, 258, 404, 242, 372);
      c.bezierCurveTo(226, 336, 246, 292, 222, 260);
      c.closePath();
    };
    c.save();
    const wfGlow = c.createRadialGradient(252, 370, 6, 252, 380, 140);
    wfGlow.addColorStop(0, "rgba(150,226,246,.28)");
    wfGlow.addColorStop(1, "rgba(150,226,246,0)");
    c.fillStyle = wfGlow;
    c.fillRect(120, 240, 280, 300);
    wfPath();
    const wfGrad = c.createLinearGradient(222, 250, 274, 492);
    wfGrad.addColorStop(0, "#eefdff");
    wfGrad.addColorStop(0.3, "#c3ecf8");
    wfGrad.addColorStop(0.68, "#8ed0e6");
    wfGrad.addColorStop(1, "#5fb0ce");
    c.fillStyle = wfGrad;
    c.fill();
    c.save();
    wfPath();
    c.clip();
    for (let i = 0; i < 8; i++) {
      const x = 228 + i * 5.4;
      c.strokeStyle = i % 2 ? "rgba(255,255,255,.5)" : "rgba(66,150,180,.26)";
      c.lineWidth = 0.8 + rand() * 1.6;
      c.beginPath();
      c.moveTo(x, 258);
      c.bezierCurveTo(x + 12, 310, x - 6, 370, x + 12, 430);
      c.bezierCurveTo(x + 18, 460, x + 4, 478, x + 2, 492);
      c.stroke();
    }
    c.restore();
    // Снежный карниз и сосульки на гребне водопада.
    c.beginPath();
    c.moveTo(212, 262);
    c.lineTo(222, 250);
    c.lineTo(231, 256);
    c.lineTo(240, 248);
    c.lineTo(250, 257);
    c.lineTo(244, 263);
    c.lineTo(232, 260);
    c.lineTo(220, 264);
    c.closePath();
    c.fillStyle = "#ffffff";
    c.fill();
    c.strokeStyle = "rgba(178,228,242,.6)";
    c.lineWidth = 1;
    c.stroke();
    for (let i = 0; i < 6; i++) {
      const x = 222 + i * 4.6;
      const len = 7 + ((i * 9) % 15);
      c.fillStyle = "rgba(226,250,255,.9)";
      c.beginPath();
      c.moveTo(x - 2, 256);
      c.lineTo(x + 2, 256);
      c.lineTo(x + 0.3, 256 + len);
      c.closePath();
      c.fill();
    }
    // Мист и бирюзовая полынья у подножия.
    c.beginPath();
    c.ellipse(260, 536, 66, 16, 0, 0, Math.PI * 2);
    const pool = c.createLinearGradient(196, 526, 324, 552);
    pool.addColorStop(0, "#bfeef8");
    pool.addColorStop(0.45, "#7fd0e5");
    pool.addColorStop(1, "#4ca6c9");
    c.fillStyle = pool;
    c.fill();
    c.strokeStyle = "rgba(255,255,255,.8)";
    c.lineWidth = 1.6;
    c.stroke();
    for (let i = 0; i < 3; i++) {
      c.strokeStyle = "rgba(255,255,255,.45)";
      c.lineWidth = 1;
      c.beginPath();
      c.ellipse(258, 536, 22 + i * 15, 4 + i * 3.4, 0, 0, Math.PI * 2);
      c.stroke();
    }
    const wfMist = c.createRadialGradient(262, 516, 4, 262, 516, 84);
    wfMist.addColorStop(0, "rgba(238,253,255,.4)");
    wfMist.addColorStop(1, "rgba(238,253,255,0)");
    c.fillStyle = wfMist;
    c.beginPath();
    c.ellipse(262, 516, 84, 24, 0, 0, Math.PI * 2);
    c.fill();
    c.restore();

    // Минимальная рамка: только мягкая тень и сосульки по краям.
    c.save();
    const edgeL = c.createLinearGradient(0, 0, 54, 0);
    edgeL.addColorStop(0, "rgba(32,96,130,.28)");
    edgeL.addColorStop(1, "rgba(32,96,130,0)");
    c.fillStyle = edgeL;
    c.fillRect(0, 0, 54, H);
    const edgeR = c.createLinearGradient(W, 0, W - 54, 0);
    edgeR.addColorStop(0, "rgba(32,96,130,.28)");
    edgeR.addColorStop(1, "rgba(32,96,130,0)");
    c.fillStyle = edgeR;
    c.fillRect(W - 54, 0, 54, H);
    c.fillStyle = "rgba(232,250,255,.38)";
    c.beginPath();
    c.moveTo(0, 0);
    c.lineTo(7, 0);
    c.lineTo(3, H);
    c.lineTo(0, H);
    c.closePath();
    c.fill();
    c.beginPath();
    c.moveTo(W, 0);
    c.lineTo(W - 7, 0);
    c.lineTo(W - 3, H);
    c.lineTo(W, H);
    c.closePath();
    c.fill();
    const topIcicle = (x, len, w, a) => {
      c.fillStyle = `rgba(214,246,255,${a})`;
      c.beginPath();
      c.moveTo(x - w, 0);
      c.lineTo(x + w, 0);
      c.lineTo(x + 0.4, len);
      c.closePath();
      c.fill();
      c.strokeStyle = "rgba(255,255,255,.5)";
      c.lineWidth = 0.7;
      c.stroke();
    };
    topIcicle(16, 26, 3, 0.7);
    topIcicle(32, 15, 2.4, 0.55);
    topIcicle(54, 9, 2, 0.4);
    topIcicle(346, 10, 2, 0.4);
    topIcicle(366, 19, 2.6, 0.55);
    topIcicle(386, 28, 3, 0.7);
    c.restore();

    // Тёмные ели у подножия — ценностный якорь и родная палитра игры.
    const canyonPine = (x, baseY, h, lean) => {
      c.save();
      c.translate(x, baseY);
      c.rotate(lean);
      c.fillStyle = "#173f53";
      c.fillRect(-1.4, -h * 0.92, 2.8, h * 0.92);
      for (let i = 0; i < 4; i++) {
        const y = -h * (0.18 + i * 0.19);
        const half = h * (0.32 - i * 0.055);
        c.beginPath();
        c.moveTo(0, y - h * 0.17);
        c.lineTo(-half, y + h * 0.05);
        c.lineTo(-half * 0.45, y + h * 0.02);
        c.lineTo(0, y + h * 0.07);
        c.lineTo(half * 0.45, y + h * 0.02);
        c.lineTo(half, y + h * 0.05);
        c.closePath();
        c.fill();
        c.strokeStyle = "rgba(220,244,252,.6)";
        c.lineWidth = 1.1;
        c.beginPath();
        c.moveTo(-half, y + h * 0.04);
        c.lineTo(-half * 0.35, y + h * 0.015);
        c.stroke();
        c.beginPath();
        c.moveTo(half, y + h * 0.04);
        c.lineTo(half * 0.35, y + h * 0.015);
        c.stroke();
      }
      c.strokeStyle = "rgba(120,180,200,.26)";
      c.lineWidth = 1;
      c.beginPath();
      c.moveTo(-1.4, -h * 0.9);
      c.lineTo(-1.4, -h * 0.1);
      c.stroke();
      c.restore();
    };
    const treeRow = [
      [20, 112, 0.02], [54, 84, -0.03], [88, 126, 0.01], [122, 72, 0.04],
      [156, 102, -0.02], [308, 96, 0.03], [342, 118, -0.02], [376, 86, 0.01]
    ];
    for (const t of treeRow) canyonPine(t[0], 542, t[1], t[2]);

    // Снежная полка, на которой стоит Моряка.
    const floorTop = (x) => 535 + Math.sin(x * 0.047) * 2.4 + Math.sin(x * 0.15 + 1.2) * 1.2;
    c.beginPath();
    c.moveTo(0, H);
    c.lineTo(0, floorTop(0));
    for (let x = 4; x <= W; x += 4) c.lineTo(x, floorTop(x));
    c.lineTo(W, H);
    c.closePath();
    const fg = c.createLinearGradient(0, 526, 0, H);
    fg.addColorStop(0, "#fffaf0");
    fg.addColorStop(0.2, "#f2e3cf");
    fg.addColorStop(0.58, "#a8c5d6");
    fg.addColorStop(1, "#5f8ca6");
    c.fillStyle = fg;
    c.fill();

    c.save();
    c.lineCap = "round";
    c.strokeStyle = "rgba(255,248,232,.98)";
    c.lineWidth = 3.6;
    c.beginPath();
    c.moveTo(0, floorTop(0));
    for (let x = 4; x <= W; x += 4) c.lineTo(x, floorTop(x));
    c.stroke();
    c.strokeStyle = "rgba(102,186,210,.34)";
    c.lineWidth = 1.8;
    c.beginPath();
    c.moveTo(0, floorTop(0) + 4);
    for (let x = 4; x <= W; x += 4) c.lineTo(x, floorTop(x) + 4);
    c.stroke();
    c.strokeStyle = "rgba(55,120,146,.22)";
    c.lineWidth = 2;
    c.beginPath();
    c.moveTo(0, floorTop(0) + 9);
    for (let x = 4; x <= W; x += 4) c.lineTo(x, floorTop(x) + 9);
    c.stroke();
    c.restore();

    for (let i = 0; i < 10; i++) {
      const x0 = 20 + rand() * 360;
      const y0 = 552 + rand() * 16;
      c.strokeStyle = "rgba(64,126,150,.22)";
      c.lineWidth = 1 + rand() * 1.2;
      c.beginPath();
      c.moveTo(x0, y0);
      let x = x0, y = y0;
      for (let k = 0; k < 3; k++) {
        x += (rand() - 0.5) * 20;
        y += 9 + rand() * 13;
        c.lineTo(x, y);
      }
      c.stroke();
    }
    for (let i = 0; i < 26; i++) {
      const x = 10 + rand() * 380;
      const y = floorTop(x) - 1 + rand() * 4;
      c.fillStyle = `rgba(255,255,255,${0.3 + rand() * 0.5})`;
      c.beginPath();
      c.ellipse(x, y, 2 + rand() * 8, 1 + rand() * 2.4, 0, 0, Math.PI * 2);
      c.fill();
    }

    // Снежные валуны в переднем плане.
    const snowRock = (x, y, rx, ry, flip) => {
      c.save();
      c.beginPath();
      c.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
      const rg = c.createLinearGradient(x - rx, y - ry, x + rx, y + ry);
      rg.addColorStop(0, "#f4fdff");
      rg.addColorStop(0.5, "#cbe8f3");
      rg.addColorStop(1, "#77aec6");
      c.fillStyle = rg;
      c.fill();
      c.strokeStyle = "rgba(255,255,255,.7)";
      c.lineWidth = 1.2;
      c.stroke();
      c.beginPath();
      c.ellipse(x - flip * rx * 0.2, y - ry * 0.45, rx * 0.72, ry * 0.5, 0, Math.PI, Math.PI * 2);
      c.fillStyle = "rgba(255,255,255,.9)";
      c.fill();
      c.restore();
    };
    snowRock(22, 564, 30, 20, 1);
    snowRock(374, 570, 34, 22, -1);
    snowRock(62, 588, 20, 13, 1);

    // Холодная дымка и мягкая виньетка.
    for (let i = 0; i < 6; i++) {
      const mx = 30 + rand() * 340;
      const my = 340 + rand() * 190;
      const mr = 60 + rand() * 90;
      const mg = c.createRadialGradient(mx, my, 4, mx, my, mr);
      mg.addColorStop(0, "rgba(240,253,255,.22)");
      mg.addColorStop(1, "rgba(240,253,255,0)");
      c.fillStyle = mg;
      c.fillRect(mx - mr, my - mr, mr * 2, mr * 2);
    }

    c.save();
    const edge = c.createRadialGradient(200, 300, 150, 200, 300, 400);
    edge.addColorStop(0, "rgba(28,86,120,0)");
    edge.addColorStop(0.7, "rgba(28,86,120,.05)");
    edge.addColorStop(1, "rgba(28,86,120,.2)");
    c.fillStyle = edge;
    c.fillRect(0, 0, W, H);
    const bottom = c.createLinearGradient(0, 500, 0, H);
    bottom.addColorStop(0, "rgba(30,90,120,0)");
    bottom.addColorStop(1, "rgba(30,90,120,.14)");
    c.fillStyle = bottom;
    c.fillRect(0, 500, W, H - 500);
    c.restore();

    for (let i = 0; i < 1000; i++) {
      c.fillStyle = "rgba(255,255,255,.05)";
      c.fillRect((i * 97.13 + 11) % W, (i * 57.71 + 5) % H, 1, 1);
      c.fillStyle = "rgba(40,96,124,.035)";
      c.fillRect((i * 61.7 + 23) % W, (i * 89.3 + 17) % H, 1, 1);
    }

    c.restore();
  }