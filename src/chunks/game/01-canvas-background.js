  var canvas = document.getElementById("game");
  var WORLD_W = 400;
  var WORLD_H = 700;
  // Насколько вырос экран: оверлеи, рассчитанные на 600, центрируем на 700.
  var UI_CENTER_DY = (WORLD_H - 600) / 2;
  var RENDER_SCALE = Math.max(1, Math.min(8, Math.ceil(
    canvas.getBoundingClientRect().width / WORLD_W * (window.devicePixelRatio || 1)
  )));
  canvas.width = WORLD_W * RENDER_SCALE;
  canvas.height = WORLD_H * RENDER_SCALE;
  var ctx = canvas.getContext("2d");
  var JETPACK_THRUST = 2.625;
  var JETPACK_MAX_RISE = 22.5;
  var JETPACK_PICKUP_SPAN = 3e3;
  function drawPerkIcon(kind, cx, cy, color) {
    drawPerkIconShape(kind, cx, cy, color, {
      ctx,
      coinBadge: (x, y, r) => drawCoinBadge(x, y, r, 0),
      heart: (x, y, s, c) => drawHeart(x, y, s, c)
    });
  }
  var gradientCacheCtx = null;
  var gradientCache = /* @__PURE__ */ new Map();
  function gradientKey(parts) {
    return parts.join("|");
  }
  function cachedLinear(key, x0, y0, x1, y1, stops) {
    if (gradientCacheCtx !== ctx) {
      gradientCache.clear();
      gradientCacheCtx = ctx;
    }
    let grad = gradientCache.get(key);
    if (grad) return grad;
    grad = ctx.createLinearGradient(x0, y0, x1, y1);
    for (const [at, color] of stops) grad.addColorStop(at, color);
    gradientCache.set(key, grad);
    return grad;
  }
  function cachedRadial(key, x0, y0, r0, x1, y1, r1, stops) {
    if (gradientCacheCtx !== ctx) {
      gradientCache.clear();
      gradientCacheCtx = ctx;
    }
    let grad = gradientCache.get(key);
    if (grad) return grad;
    grad = ctx.createRadialGradient(x0, y0, r0, x1, y1, r1);
    for (const [at, color] of stops) grad.addColorStop(at, color);
    gradientCache.set(key, grad);
    return grad;
  }
  ctx.scale(RENDER_SCALE, RENDER_SCALE);
  var winterScene = { canvas: null };
  var biomeScenes = [null, null, null, null];
  function winterSurface(w, h) {
    const c2 = document.createElement("canvas");
    c2.width = w * RENDER_SCALE;
    c2.height = h * RENDER_SCALE;
    const c = c2.getContext("2d");
    if (!c) return { canvas: null, c: null };
    c.scale(RENDER_SCALE, RENDER_SCALE);
    return { canvas: c2, c };
  }
  function drawMountain(c, apexX, apexY, halfW, baseY, body, cap) {
    c.beginPath();
    c.moveTo(apexX - halfW, baseY);
    c.lineTo(apexX, apexY);
    c.lineTo(apexX + halfW, baseY);
    c.closePath();
    c.fillStyle = body;
    c.fill();
    const capY = apexY + (baseY - apexY) * 0.36;
    const capHalf = halfW * 0.32;
    c.beginPath();
    c.moveTo(apexX - capHalf, capY);
    c.lineTo(apexX, apexY);
    c.lineTo(apexX + capHalf, capY);
    c.quadraticCurveTo(apexX + capHalf * 0.4, capY + 5, apexX, capY + 3);
    c.quadraticCurveTo(apexX - capHalf * 0.4, capY + 6, apexX - capHalf, capY);
    c.closePath();
    c.fillStyle = cap;
    c.fill();
  }
  function buildWinterBackground() {
    if (winterScene.canvas) return winterScene.canvas;
    const surface = winterSurface(WORLD_W, WORLD_H);
    if (!surface.c) return null;
    const { canvas: cv, c } = surface;
    const sky = c.createLinearGradient(0, 0, 0, WORLD_H);
    sky.addColorStop(0, WINTER.skyTop);
    sky.addColorStop(0.34, WINTER.skyHigh);
    sky.addColorStop(0.6, WINTER.skyMid);
    sky.addColorStop(0.84, WINTER.skyLow);
    sky.addColorStop(1, WINTER.skyBottom);
    c.fillStyle = sky;
    c.fillRect(0, 0, WORLD_W, WORLD_H);
    const sun = c.createRadialGradient(310, 86, 4, 310, 86, 160);
    sun.addColorStop(0, "rgba(255,253,238,.95)");
    sun.addColorStop(0.22, "rgba(255,250,224,.42)");
    sun.addColorStop(1, "rgba(255,250,224,0)");
    c.fillStyle = sun;
    c.fillRect(0, 0, WORLD_W, 320);
    const far = [
      [-16, 196, 128, 352],
      [64, 150, 112, 352],
      [146, 210, 104, 352],
      [236, 132, 126, 352],
      [316, 186, 110, 352],
      [398, 156, 118, 352]
    ];
    for (const p of far) drawMountain(c, p[0], p[1], p[2], p[3], WINTER.peakFar, WINTER.peakCap);
    const mid = [
      [8, 268, 116, WORLD_W],
      [104, 214, 108, WORLD_W],
      [204, 262, 118, WORLD_W],
      [300, 202, 118, WORLD_W],
      [396, 258, 110, WORLD_W]
    ];
    for (const p of mid) drawMountain(c, p[0], p[1], p[2], p[3], WINTER.peakMid, WINTER.peakCap);
    const haze = c.createLinearGradient(0, 250, 0, 430);
    haze.addColorStop(0, "rgba(255,255,255,0)");
    haze.addColorStop(0.55, "rgba(255,255,255,.72)");
    haze.addColorStop(1, "rgba(255,255,255,.95)");
    c.fillStyle = haze;
    c.fillRect(0, 250, WORLD_W, 180);
    for (let i = 0; i < 5; i++) {
      const baseY = 430 + i * 34;
      const hill = c.createLinearGradient(0, baseY - 26, 0, baseY + 22);
      hill.addColorStop(0, "#ffffff");
      hill.addColorStop(1, "#e6f3fb");
      c.fillStyle = hill;
      c.beginPath();
      c.ellipse(200 + (i % 2 ? 40 : -40), baseY, 260, 26, 0, 0, Math.PI * 2);
      c.fill();
    }
    c.fillStyle = "rgba(250,253,255,.34)";
    c.fillRect(0, 0, WORLD_W, WORLD_H);
    const edge = c.createRadialGradient(200, 300, 150, 200, 300, 380);
    edge.addColorStop(0, "rgba(40,90,125,0)");
    edge.addColorStop(1, "rgba(40,90,125,.14)");
    c.fillStyle = edge;
    c.fillRect(0, 0, WORLD_W, WORLD_H);
    winterScene.canvas = cv;
    return cv;
  }
  var BIOME_STEP = 2e4;
  var BIOME_BLEND = 2500;
  function biomeIndexForScore(score) {
    return Math.min(BIOME_PALETTES.length - 1, Math.floor(score / BIOME_STEP));
  }
  function biomeBlend(score) {
    const index = biomeIndexForScore(score);
    if (index >= BIOME_PALETTES.length - 1) return 0;
    const start = (index + 1) * BIOME_STEP - BIOME_BLEND;
    if (score <= start) return 0;
    return Math.min(1, (score - start) / BIOME_BLEND);
  }
  function drawStars(c, count, alpha) {
    c.fillStyle = `rgba(255,255,255,${alpha})`;
    for (let i = 0; i < count; i++) {
      const x = i * 73 % WORLD_W + i * 31 % 7;
      const y = i * 137 % 330 + i * 19 % 5;
      const r = 0.5 + i * 13 % 10 / 12;
      c.beginPath();
      c.arc(x, y, r, 0, Math.PI * 2);
      c.fill();
    }
  }
  function drawAurora(c, time) {
    c.save();
    c.globalCompositeOperation = "lighter";
    for (let band = 0; band < 3; band++) {
      const baseY = 90 + band * 46;
      const grad = c.createLinearGradient(0, baseY - 60, 0, baseY + 90);
      const hue = band === 0 ? "120,255,200" : band === 1 ? "90,180,255" : "180,130,255";
      grad.addColorStop(0, `rgba(${hue},0)`);
      grad.addColorStop(0.45, `rgba(${hue},.30)`);
      grad.addColorStop(1, `rgba(${hue},0)`);
      c.fillStyle = grad;
      c.beginPath();
      c.moveTo(0, baseY + 90);
      for (let x = 0; x <= WORLD_W; x += 20) {
        const wave = Math.sin(x / WORLD_W * Math.PI * 2 + band * 1.7 + time * 6e-4) * 26;
        c.lineTo(x, baseY + wave);
      }
      c.lineTo(WORLD_W, baseY + 90);
      c.closePath();
      c.fill();
    }
    c.restore();
  }
  function buildBiomeScene(index) {
    if (biomeScenes[index]) return biomeScenes[index];
    if (index === 0 && winterScene.canvas) {
      biomeScenes[0] = winterScene.canvas;
      return biomeScenes[0];
    }
    if (index === 0) {
      const original = buildWinterBackground();
      if (original) {
        biomeScenes[0] = original;
        return original;
      }
    }
    const surface = winterSurface(WORLD_W, WORLD_H);
    if (!surface.c) return null;
    const { canvas: cv, c } = surface;
    const pal = BIOME_PALETTES[index];
    const sky = c.createLinearGradient(0, 0, 0, WORLD_H);
    sky.addColorStop(0, pal.sky[0]);
    sky.addColorStop(0.34, pal.sky[1]);
    sky.addColorStop(0.6, pal.sky[2]);
    sky.addColorStop(0.84, pal.sky[3]);
    sky.addColorStop(1, pal.sky[4]);
    c.fillStyle = sky;
    c.fillRect(0, 0, WORLD_W, WORLD_H);
    if (index === 2) drawAurora(c, 0);
    if (index === 3) drawStars(c, 90, 0.85);
    if (index === 1) {
      const sun = c.createRadialGradient(120, 300, 6, 120, 300, 150);
      sun.addColorStop(0, "rgba(255,236,190,.95)");
      sun.addColorStop(0.3, "rgba(255,190,140,.45)");
      sun.addColorStop(1, "rgba(255,170,120,0)");
      c.fillStyle = sun;
      c.fillRect(0, 150, WORLD_W, 320);
    }
    const far = [
      [-16, 196, 128, 352],
      [64, 150, 112, 352],
      [146, 210, 104, 352],
      [236, 132, 126, 352],
      [316, 186, 110, 352],
      [398, 156, 118, 352]
    ];
    for (const p of far) drawMountain(c, p[0], p[1], p[2], p[3], pal.far, pal.cap);
    const mid = [
      [8, 268, 116, WORLD_W],
      [104, 214, 108, WORLD_W],
      [204, 262, 118, WORLD_W],
      [300, 202, 118, WORLD_W],
      [396, 258, 110, WORLD_W]
    ];
    for (const p of mid) drawMountain(c, p[0], p[1], p[2], p[3], pal.mid, pal.cap);
    const haze = c.createLinearGradient(0, 250, 0, 430);
    haze.addColorStop(0, "rgba(255,255,255,0)");
    haze.addColorStop(0.55, pal.veil);
    haze.addColorStop(1, pal.veil);
    c.fillStyle = haze;
    c.fillRect(0, 250, WORLD_W, 180);
    for (let i = 0; i < 5; i++) {
      const baseY = 430 + i * 34;
      const hill = c.createLinearGradient(0, baseY - 26, 0, baseY + 22);
      hill.addColorStop(0, pal.cap);
      hill.addColorStop(1, pal.mid);
      c.fillStyle = hill;
      c.beginPath();
      c.ellipse(200 + (i % 2 ? 40 : -40), baseY, 260, 26, 0, 0, Math.PI * 2);
      c.fill();
    }
    c.fillStyle = pal.veil;
    c.fillRect(0, 0, WORLD_W, WORLD_H);
    if (pal.tint) {
      c.fillStyle = pal.tint;
      c.fillRect(0, 0, WORLD_W, WORLD_H);
    }
    const edge = c.createRadialGradient(200, 300, 150, 200, 300, 380);
    edge.addColorStop(0, "rgba(10,30,60,0)");
    edge.addColorStop(1, "rgba(10,30,60,.18)");
    c.fillStyle = edge;
    c.fillRect(0, 0, WORLD_W, WORLD_H);
    biomeScenes[index] = cv;
    return cv;
  }
  var inlinedImages = window.__INLINED_IMAGES ?? {};
  function imageSource(name) {
    return inlinedImages[name] ?? name;
  }
  var shareAvatarImage = new Image();
  shareAvatarImage.src = imageSource("share_avatar.jpg");
  var backgroundImage = new Image();
  backgroundImage.src = imageSource("fon.jpg");
  var windStreaks = Array.from({ length: 26 }, () => ({
    x: Math.random() * WORLD_W,
    y: Math.random() * WORLD_H,
    len: 8 + Math.random() * 22,
    speed: 0.6 + Math.random() * 1.1,
    alpha: 0.16 + Math.random() * 0.26
  }));
  var windStreakClock = 0;
  var windStreakSprites = {};
  function getWindStreakSprite(direction) {
    const key = direction > 0 ? "forward" : "reverse";
    if (windStreakSprites[key]) return windStreakSprites[key];
    const sprite = document.createElement("canvas");
    sprite.width = 64;
    sprite.height = 4;
    const spriteCtx = sprite.getContext("2d");
    if (!spriteCtx) return null;
    const startX = direction > 0 ? 0 : 64;
    const endX = direction > 0 ? 64 : 0;
    const gradient = spriteCtx.createLinearGradient(startX, 0, endX, 0);
    gradient.addColorStop(0, "rgba(140,206,238,0)");
    gradient.addColorStop(0.45, "rgba(96,178,224,0.75)");
    gradient.addColorStop(1, "rgba(34,116,176,1)");
    spriteCtx.fillStyle = gradient;
    spriteCtx.fillRect(0, 0, 64, 4);
    windStreakSprites[key] = sprite;
    return sprite;
  }
  function frameNow() {
    return performance.now() / 1e3;
  }
  function drawWindStreaks() {
    if (!wind.active) return;
    const strength = Math.abs(wind.force);
    if (strength < 0.08) return;
    const now = frameNow();
    const dt = windStreakClock ? Math.min(3, Math.max(0, (now - windStreakClock) * 60)) : 0;
    windStreakClock = now;
    const dir = Math.sign(wind.force) || 1;
    const streakSprite = getWindStreakSprite(dir);
    ctx.save();
    ctx.lineCap = "round";
    for (const streak of windStreaks) {
      streak.x += dir * streak.speed * (1 + strength * 3.2) * dt;
      if (streak.x < -40) {
        streak.x = 440;
        streak.y = Math.random() * WORLD_H;
      } else if (streak.x > 440) {
        streak.x = -40;
        streak.y = Math.random() * WORLD_H;
      }
      const alpha = Math.min(0.85, streak.alpha * (0.5 + strength * 1.5));
      const headX = streak.x;
      const tailX = streak.x - dir * streak.len * (0.5 + strength * 0.7);
      const width = 1.1 + strength * 1;
      ctx.strokeStyle = `rgba(214,240,252,${alpha * 0.45})`;
      ctx.lineWidth = width + 1.8;
      ctx.beginPath();
      ctx.moveTo(headX, streak.y);
      ctx.lineTo(tailX, streak.y + 0.6);
      ctx.stroke();
      if (streakSprite) {
        ctx.globalAlpha = alpha;
        ctx.drawImage(
          streakSprite,
          Math.min(headX, tailX),
          streak.y - 1.4,
          Math.abs(headX - tailX),
          2.8
        );
        ctx.globalAlpha = 1;
      } else {
        ctx.strokeStyle = `rgba(96,178,224,${alpha})`;
        ctx.lineWidth = width;
        ctx.beginPath();
        ctx.moveTo(headX, streak.y);
        ctx.lineTo(tailX, streak.y + 0.6);
        ctx.stroke();
      }
    }
    ctx.restore();
  }
  var backgroundHighlight = null;
  var BACKGROUND_VEIL_COLOR = "rgba(220,245,255,.85)";
  function drawBackgroundVeil(c) {
    c.save();
    c.globalCompositeOperation = "source-over";
    c.globalAlpha = 1;
    c.fillStyle = BACKGROUND_VEIL_COLOR;
    c.fillRect(0, 0, WORLD_W, WORLD_H);
    c.restore();
  }
  function paintFonBackground(c) {
    if (!(backgroundImage.complete && backgroundImage.naturalWidth > 0)) return false;
    c.drawImage(backgroundImage, 0, 0, WORLD_W, WORLD_H);
    drawBackgroundVeil(c);
    if (c === ctx) {
      if (!backgroundHighlight) {
        backgroundHighlight = ctx.createLinearGradient(0, 0, 0, 260);
        backgroundHighlight.addColorStop(0, "rgba(255,255,255,.36)");
        backgroundHighlight.addColorStop(1, "rgba(255,255,255,0)");
      }
      c.fillStyle = backgroundHighlight;
    } else {
      const highlight = c.createLinearGradient(0, 0, 0, 260);
      highlight.addColorStop(0, "rgba(255,255,255,.36)");
      highlight.addColorStop(1, "rgba(255,255,255,0)");
      c.fillStyle = highlight;
    }
    c.fillRect(0, 0, WORLD_W, 260);
    return true;
  }
  function drawBackground() {
    if (paintFonBackground(ctx)) return;
    drawProceduralBackground();
    drawBackgroundVeil(ctx);
    drawBossTint(ctx);
  }
  function drawProceduralBackground() {
    const index = biomeIndexForScore(player.score);
    const blend = biomeBlend(player.score);
    const scene = buildBiomeScene(index);
    if (scene) {
      ctx.drawImage(scene, 0, 0, WORLD_W, WORLD_H);
    } else {
      ctx.fillStyle = WINTER.skyLow;
      ctx.fillRect(0, 0, WORLD_W, WORLD_H);
    }
    if (blend > 0) {
      const nextScene = buildBiomeScene(index + 1);
      if (nextScene) {
        ctx.save();
        ctx.globalAlpha = blend;
        ctx.drawImage(nextScene, 0, 0, WORLD_W, WORLD_H);
        ctx.restore();
      }
    }
  }
  var snowLayers = [
    {
      alpha: 0.5,
      flakes: Array.from({ length: 46 }, () => ({
        x: Math.random() * WORLD_W,
        y: Math.random() * WORLD_H,
        r: 0.7 + Math.random() * 0.8,
        speed: 0.45 + Math.random() * 0.35,
        sway: 4 + Math.random() * 6,
        swaySpeed: 0.6 + Math.random() * 0.8,
        phase: Math.random() * Math.PI * 2
      }))
    },
    {
      alpha: 0.92,
      flakes: Array.from({ length: 26 }, () => ({
        x: Math.random() * WORLD_W,
        y: Math.random() * WORLD_H,
        r: 1.6 + Math.random() * 1.4,
        speed: 0.95 + Math.random() * 0.7,
        sway: 7 + Math.random() * 9,
        swaySpeed: 0.9 + Math.random() * 1.1,
        phase: Math.random() * Math.PI * 2
      }))
    }
  ];
  function drawSnow(dt = 1) {
    const t = frameNow();
    ctx.save();
    for (const layer of snowLayers) {
      ctx.fillStyle = `rgba(255,255,255,${layer.alpha})`;
      for (const flake of layer.flakes) {
        flake.y += flake.speed * dt;
        if (flake.y > 610) {
          flake.y = -10;
          flake.x = Math.random() * WORLD_W;
        }
        const sway = Math.sin(t * flake.swaySpeed + flake.phase) * flake.sway;
        ctx.beginPath();
        ctx.arc(flake.x + sway, flake.y, flake.r, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.restore();
  }
  function drawBlizzard() {
    const t = frameNow();
    ctx.save();
    ctx.fillStyle = "rgba(236,248,255,.14)";
    ctx.fillRect(0, 0, WORLD_W, WORLD_H);
    ctx.strokeStyle = "rgba(255,255,255,.55)";
    ctx.lineWidth = 1;
    ctx.lineCap = "round";
    for (let i = 0; i < 34; i++) {
      const y = (i * 53 + t * 260) % (WORLD_H + 40) - 20;
      const x = (i * 137 + Math.sin(t * 1.7 + i) * 40) % (WORLD_W + 80) - 40;
      ctx.globalAlpha = 0.35 + 0.35 * Math.sin(t * 3 + i);
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x - 22, y + 9);
      ctx.stroke();
    }
    ctx.restore();
  }
  var gameStage = document.getElementById("gameStage");
  var fullscreenButton = document.getElementById("fullscreenButton");
  var soundButton = document.getElementById("soundButton");
  var STATE = { MENU: 0, PLAYING: 1, PAUSE: 2, GAMEOVER: 3 };
  var currentState = STATE.MENU;
  var lastFrameTime = 0;
  var screenShake = { time: 0, duration: 0, intensity: 0, x: 0, y: 0 };
  function startScreenShake(intensity = 2.5, duration = 12) {
    const scale = typeof perkShakeScale === "function" ? perkShakeScale() : 1;
    screenShake.time = Math.max(screenShake.time, duration);
    screenShake.duration = Math.max(screenShake.duration, duration);
    screenShake.intensity = Math.max(screenShake.intensity, intensity * scale);
  }
  function updateScreenShake(dt) {
    if (screenShake.time <= 0) {
      screenShake.time = 0;
      screenShake.x = 0;
      screenShake.y = 0;
      return;
    }
    screenShake.time = Math.max(0, screenShake.time - dt);
    const fade = screenShake.duration > 0 ? screenShake.time / screenShake.duration : 0;
    const amount = screenShake.intensity * fade;
    const phase = (screenShake.duration - screenShake.time) * 2.4;
    screenShake.x = Math.sin(phase * 1.7) * amount;
    screenShake.y = Math.cos(phase * 2.3) * amount * 0.7;
  }
  var AVATAR_NAMES = [
    "Моряка", "Хмурый", "Крик", "Боевой", "Старина", "Дразнилка",
    "Паника", "Упрямый", "Надутый", "Щёки", "Шок", "Язык",
    "Довольный", "Удивлённый", "Слёзы", "Психо", "Безумный", "Пузыри",
    "Вопль", "Хитрый", "Экранный", "Аврора", "Ухмылка", "Ор",
    "Красноокий", "Сонный"
  ];
  function avatarName(index) {
    return AVATAR_NAMES[index] || "Моряка";
  }
  var AVATAR_SCORES = Array.from({ length: 26 }, (_, index) => index * 3000);
  function avatarUnlockLabel(index) {
    const need = AVATAR_SCORES[index] || 0;
    if (need >= 1e4) {
      const k = need / 1e3;
      return (Number.isInteger(k) ? String(k) : k.toFixed(1)) + "\u041A";
    }
    return fmt(need);
  }
  var avatarImages = Array.from({ length: 26 }, (_, i) => {
    const image = new Image();
    image.src = imageSource(`${i + 1}.jpg`);
    return image;
  });
  function readStoredNumber(key, fallback = 0) {
    try {
      const value = Number(localStorage.getItem(key));
      return Number.isFinite(value) && value >= 0 ? value : fallback;
    } catch {
      return fallback;
    }
  }
  function readStoredArray(key, fallback) {
    try {
      const value = JSON.parse(localStorage.getItem(key) ?? "null");
      return Array.isArray(value) ? value : fallback;
    } catch {
      return fallback;
    }
  }
  function readStoredText(key, fallback = "") {
    try {
      const value = localStorage.getItem(key);
      return typeof value === "string" ? value : fallback;
    } catch {
      return fallback;
    }
  }
  var bankCoins = readStoredNumber("morjakaBankCoins");
  var highScore = readStoredNumber("doodleHighScore");
  var playerNick = readStoredText("morjakaNick", "");
  var NICK_MAX_LENGTH = 20;