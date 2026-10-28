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