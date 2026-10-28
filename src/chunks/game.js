  var canvas = document.getElementById("game");
  var WORLD_W = 400;
  var WORLD_H = 600;
  var RENDER_SCALE = Math.max(1, Math.min(4, Math.ceil(
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
  function normalizeNick(raw) {
    return String(raw ?? "").replace(/[\u0000-\u001f\u007f]/g, " ").replace(/\s+/g, " ").trim().slice(0, NICK_MAX_LENGTH);
  }
  function saveNick(value) {
    playerNick = normalizeNick(value);
    try {
      if (playerNick) localStorage.setItem("morjakaNick", playerNick);
      else localStorage.removeItem("morjakaNick");
    } catch {
    }
    if (typeof syncSideSettings === "function") syncSideSettings();
  }
  function getUnlockedAvatars(score) {
    return AVATAR_SCORES.map((required, index) => ({ required, index })).filter((item) => score >= item.required).map((item) => item.index);
  }
  var unlockedAvatars = getUnlockedAvatars(highScore);
  var selectedAvatar = readStoredNumber("morjakaSelectedCharacter");
  if (!Number.isInteger(selectedAvatar) || selectedAvatar < 0 || selectedAvatar >= avatarImages.length || !unlockedAvatars.includes(selectedAvatar)) {
    selectedAvatar = 0;
  }
  function readStoredRecord(key) {
    try {
      const raw = JSON.parse(localStorage.getItem(key) || "{}");
      return raw && typeof raw === "object" && !Array.isArray(raw) ? raw : {};
    } catch {
      return {};
    }
  }
  var platformOwned = {};
  var platformSelected = {};
  {
    const ownedRaw = readStoredRecord("morjakaPlatformOwned");
    const selRaw = readStoredRecord("morjakaPlatformSelected");
    for (const type of PLATFORM_TYPES) {
      const base = baseSkinId(type);
      const list = Array.isArray(ownedRaw[type]) ? ownedRaw[type].filter((id) => PLATFORM_SKIN_BY_ID[id] && PLATFORM_SKIN_BY_ID[id].type === type) : [];
      platformOwned[type] = [base, ...list.filter((id) => id !== base)];
      const sel = selRaw[type];
      platformSelected[type] = typeof sel === "string" && platformOwned[type].includes(sel) ? sel : base;
    }
  }
  var selectedFrame = Number(localStorage.getItem("morjakaSelectedFrame")) || 0;
  var ownedFrames = readStoredArray("morjakaOwnedFrames", [0]);
  if (!FRAMES.some((frame) => frame.id === selectedFrame)) selectedFrame = 0;
  if (!ownedFrames.includes(0)) ownedFrames = [0, ...ownedFrames];

  // ===== 0.8: статистика, достижения и журнал боссов =====
  function defaultStats() {
    return {
      runs: 0,
      coins: 0,
      platforms: 0,
      playMs: 0,
      bossWins: [0, 0, 0, 0, 0],
      bossTries: [0, 0, 0, 0, 0],
      trainWins: [0, 0, 0, 0, 0],
      trainTries: [0, 0, 0, 0, 0],
      characterRuns: {}
    };
  }
  function loadStats() {
    try {
      const raw = JSON.parse(localStorage.getItem("morjakaStats") || "null");
      if (!raw || typeof raw !== "object") return defaultStats();
      const out = defaultStats();
      const num = (v) => Math.max(0, Math.floor(Number(v) || 0));
      out.runs = num(raw.runs);
      out.coins = num(raw.coins);
      out.platforms = num(raw.platforms);
      out.playMs = num(raw.playMs);
      for (const key of ["bossWins", "bossTries", "trainWins", "trainTries"]) {
        if (Array.isArray(raw[key])) for (let i = 0; i < 5; i++) out[key][i] = num(raw[key][i]);
      }
      if (raw.characterRuns && typeof raw.characterRuns === "object") {
        for (const key in raw.characterRuns) {
          if (Object.prototype.hasOwnProperty.call(raw.characterRuns, key)) out.characterRuns[key] = num(raw.characterRuns[key]);
        }
      }
      return out;
    } catch {
      return defaultStats();
    }
  }
  var stats = loadStats();
  var achievementsClaimed = readStoredArray("morjakaAchievements", []).filter((id) => typeof id === "string");
  function saveStats() {
    try { localStorage.setItem("morjakaStats", JSON.stringify(stats)); } catch {}
  }
  function formatPlayTime(ms) {
    const total = Math.max(0, Math.floor(ms / 1000));
    const h = Math.floor(total / 3600);
    const m = Math.floor(total % 3600 / 60);
    const s = total % 60;
    if (h > 0) return h + " ч " + m + " мин";
    if (m > 0) return m + " мин " + s + " с";
    return s + " с";
  }
  var ACHIEVEMENT_DEFS = [
    { id: "first_run", name: "ПЕРВЫЙ ШАГ", desc: "Заверши первый забег", reward: 5, check: () => stats.runs >= 1, progress: () => [Math.min(stats.runs, 1), 1] },
    { id: "score_500", name: "РАЗБЕГ", desc: "Набери 500 очков", reward: 5, check: () => highScore >= 500, progress: () => [Math.min(highScore, 500), 500] },
    { id: "score_5000", name: "ВЫСОТА", desc: "Набери 5 000 очков", reward: 10, check: () => highScore >= 5000, progress: () => [Math.min(highScore, 5000), 5000] },
    { id: "score_25000", name: "К НЕБУ", desc: "Набери 25 000 очков", reward: 20, check: () => highScore >= 25000, progress: () => [Math.min(highScore, 25000), 25000] },
    { id: "coins_100", name: "КЛАДОВАЯ", desc: "Собери 100 монет", reward: 10, check: () => stats.coins >= 100, progress: () => [Math.min(stats.coins, 100), 100] },
    { id: "coins_1000", name: "ЗОЛОТО", desc: "Собери 1 000 монет", reward: 20, check: () => stats.coins >= 1000, progress: () => [Math.min(stats.coins, 1000), 1000] },
    { id: "platforms_100", name: "ПЕРВЫЕ СТУПЕНИ", desc: "Приземлись на 100 платформ", reward: 10, check: () => stats.platforms >= 100, progress: () => [Math.min(stats.platforms, 100), 100] },
    { id: "platforms_1000", name: "ЛЕДЯНАЯ ЛЕСТНИЦА", desc: "Приземлись на 1 000 платформ", reward: 20, check: () => stats.platforms >= 1000, progress: () => [Math.min(stats.platforms, 1000), 1000] },
    { id: "first_boss", name: "ПОБЕДИТЕЛЬ", desc: "Победи первого босса", reward: 15, check: () => stats.bossWins.some((n) => n > 0), progress: () => [stats.bossWins.some((n) => n > 0) ? 1 : 0, 1] },
    { id: "all_bosses", name: "ЦАРЬ СТУЖИ", desc: "Победи всех пятерых боссов", reward: 30, check: () => stats.bossWins.every((n) => n > 0), progress: () => [stats.bossWins.filter((n) => n > 0).length, 5] },
    { id: "daily_7", name: "ПРИВЫЧКА", desc: "7 дней ежедневной серии", reward: 20, check: () => dailyState.streak >= 7, progress: () => [Math.min(dailyState.streak, 7), 7] },
    { id: "frames_10", name: "КОЛЛЕКЦИОНЕР", desc: "Открой 10 рамок", reward: 10, check: () => ownedFrames.filter((id) => id !== 0).length >= 10, progress: () => [Math.min(ownedFrames.filter((id) => id !== 0).length, 10), 10] },
    { id: "characters_10", name: "ДРУЖНАЯ КОМАНДА", desc: "Открой 10 персонажей", reward: 15, check: () => unlockedAvatars.length >= 10, progress: () => [Math.min(unlockedAvatars.length, 10), 10] },
    { id: "play_1h", name: "СТАРЫЙ МОРЯКА", desc: "Проведи в игре час", reward: 20, check: () => stats.playMs >= 3600000, progress: () => [Math.min(stats.playMs, 3600000), 3600000] },
    { id: "runs_25", name: "НЕ СДАВАЙСЯ", desc: "Заверши 25 забегов", reward: 15, check: () => stats.runs >= 25, progress: () => [Math.min(stats.runs, 25), 25] }
  ];
  function checkAchievements(announce) {
    let gained = 0;
    let count = 0;
    let lastName = "";
    for (const achievement of ACHIEVEMENT_DEFS) {
      if (achievementsClaimed.includes(achievement.id)) continue;
      let unlocked = false;
      try { unlocked = achievement.check(); } catch {}
      if (!unlocked) continue;
      achievementsClaimed.push(achievement.id);
      bankCoins += achievement.reward;
      gained += achievement.reward;
      count++;
      lastName = achievement.name;
    }
    if (!count) return 0;
    saveProgress();
    if (announce !== false) {
      const text = count === 1 ? lastName : "ДОСТИЖЕНИЙ: " + count;
      if (currentState === STATE.MENU) setMenuMessage("ДОСТИЖЕНИЕ", text + " · +" + gained + " МОНЕТ");
      else hudPop(WORLD_W / 2, 210, "ДОСТИЖЕНИЕ +" + gained, "#c28000");
    }
    return gained;
  }

  var DAILY_DEFS = [
    { id: "coins", short: "МОНЕТЫ", label: "СОБЕРИ 30 МОНЕТ", target: 30, reward: 25 },
    { id: "height", short: "ВЫСОТА", label: "ПОДНИМИСЬ НА 20000", target: 20000, reward: 25 },
    { id: "boss", short: "БОСС", label: "ПОБЕДИ БОССА", target: 1, reward: 30 },
    { id: "platforms", short: "ПЛАТФОРМЫ", label: "ПРИЗЕМЛИСЬ НА 120 ПЛАТФОРМ", target: 120, reward: 25 },
    { id: "runs", short: "ЗАБЕГИ", label: "ЗАВЕРШИ 2 ЗАБЕГА", target: 2, reward: 20 },
    { id: "events", short: "СОБЫТИЕ", label: "ПОПАДИ В СОБЫТИЕ", target: 1, reward: 25 }
  ];
  // localDateKey, yesterdayDateKey и dailyHash живут в src/game/daily-date.ts.
  function dailyPick(dateKey, avoidId) {
    let index = dailyHash(dateKey) % DAILY_DEFS.length;
    if (DAILY_DEFS.length > 1 && DAILY_DEFS[index].id === avoidId) index = (index + 1) % DAILY_DEFS.length;
    return DAILY_DEFS[index];
  }
  var dailyState = {
    date: readStoredText("morjakaDailyDate", ""),
    id: readStoredText("morjakaDailyId", ""),
    progress: readStoredNumber("morjakaDailyProgress"),
    done: readStoredNumber("morjakaDailyDone") === 1,
    streak: readStoredNumber("morjakaDailyStreak"),
    lastDone: readStoredText("morjakaDailyLastDone", "")
  };
  function dailyDef() {
    for (const def of DAILY_DEFS) if (def.id === dailyState.id) return def;
    return null;
  }
  function initDaily(force) {
    const today = localDateKey();
    if (!force && dailyState.date === today && dailyDef()) return;
    const def = dailyPick(today, dailyState.id);
    dailyState.date = today;
    dailyState.id = def.id;
    dailyState.progress = 0;
    dailyState.done = false;
    if (dailyState.lastDone !== today && dailyState.lastDone !== yesterdayDateKey()) dailyState.streak = 0;
    saveProgress();
  }
  function dailyComplete() {
    const def = dailyDef();
    if (!def || dailyState.done) return;
    const today = localDateKey();
    dailyState.done = true;
    dailyState.progress = def.target;
    dailyState.streak = dailyState.lastDone === yesterdayDateKey() ? dailyState.streak + 1 : 1;
    dailyState.lastDone = today;
    bankCoins += def.reward;
    checkAchievements();
    saveProgress();
    hudState.coinPulse = 1;
    hudPop(player.x + 15, player.y - 26, "ЕЖЕДНЕВНОЕ ВЫПОЛНЕНО", "#0f8a76");
    hudPop(player.x + 15, player.y - 40, "+" + def.reward + " МОНЕТ", "#c28000");
    sfx.coin();
  }
  function dailyAdd(id, amount) {
    const def = dailyDef();
    if (!def || dailyState.done || def.id !== id || amount <= 0) return;
    dailyState.progress = Math.min(def.target, dailyState.progress + amount);
    if (dailyState.progress >= def.target) dailyComplete();
    else saveProgress();
  }
  function dailyMax(id, value) {
    const def = dailyDef();
    if (!def || dailyState.done || def.id !== id) return;
    const before = dailyState.progress;
    dailyState.progress = Math.max(before, Math.min(def.target, value));
    if (dailyState.progress >= def.target) dailyComplete();
    else if (Math.floor(dailyState.progress / 250) !== Math.floor(before / 250)) saveProgress();
  }
  var savedProgress = /* @__PURE__ */ new Map();
  function saveProgress() {
    const next = {
      morjakaBankCoins: String(bankCoins),
      morjakaUnlockedCharacters: JSON.stringify(unlockedAvatars),
      morjakaSelectedCharacter: String(selectedAvatar),
      doodleHighScore: String(highScore),
      morjakaOwnedFrames: JSON.stringify(ownedFrames),
      morjakaSelectedFrame: String(selectedFrame),
      morjakaPlatformOwned: JSON.stringify(platformOwned),
      morjakaPlatformSelected: JSON.stringify(platformSelected),
      morjakaDailyDate: dailyState.date,
      morjakaDailyId: dailyState.id,
      morjakaDailyProgress: String(dailyState.progress),
      morjakaDailyDone: dailyState.done ? "1" : "0",
      morjakaDailyStreak: String(dailyState.streak),
      morjakaDailyLastDone: dailyState.lastDone,
      morjakaStats: JSON.stringify(stats),
      morjakaAchievements: JSON.stringify(achievementsClaimed)
    };
    try {
      for (const key in next) {
        const value = next[key];
        if (savedProgress.get(key) === value) continue;
        localStorage.setItem(key, value);
        savedProgress.set(key, value);
      }
    } catch (error) {
      console.warn("\u041D\u0435 \u0443\u0434\u0430\u043B\u043E\u0441\u044C \u0441\u043E\u0445\u0440\u0430\u043D\u0438\u0442\u044C \u043F\u0440\u043E\u0433\u0440\u0435\u0441\u0441:", error);
    }
  }
  var player = { x: 185, y: 500, vx: 0, dy: 0, score: 0 };
  var squash = 0;
  var fallCooldown = 0;
  var WIND_FROM_SCORE = 1e4;
  // Пик ветра — на 140 000, сила растёт до 4,8 px/кадра (было 5,8 к 100 000).
  var WIND_FULL_SCORE = 14e4;
  var WIND_STRENGTH_MIN = 0.9;
  var WIND_STRENGTH_MAX = 4.8;
  var WIND_REST_LONG_MIN = 750;
  var WIND_REST_LONG_MAX = 1050;
  var WIND_REST_FAST_MIN = 90;
  var WIND_REST_FAST_MAX = 180;
  var WIND_GUST_LONG_MIN = 210;
  var WIND_GUST_LONG_MAX = 330;
  var WIND_GUST_FAST_MIN = 75;
  var WIND_GUST_FAST_MAX = 130;
  var WIND_WARN_START = 130;
  var WIND_WARN_END = 80;
  var wind = {
    force: 0,
    dir: 0,
    phase: "rest",
    // 'rest' | 'warn' | 'gust'
    timer: 0,
    // сколько длится текущая пауза
    nextAt: 340,
    // сколько пауза должна длиться
    gustLeft: 0,
    // сколько осталось дуть
    warn: 0,
    // сколько осталось телеграфа
    active: false
  };
  function windProgress() {
    const span = Math.max(1, WIND_FULL_SCORE - WIND_FROM_SCORE);
    return Math.max(0, Math.min(1, (player.score - WIND_FROM_SCORE) / span));
  }
  function windStrength() {
    return WIND_STRENGTH_MIN + (WIND_STRENGTH_MAX - WIND_STRENGTH_MIN) * windProgress();
  }
  function windRestFrames() {
    const p = windProgress();
    const lo = WIND_REST_LONG_MIN + (WIND_REST_FAST_MIN - WIND_REST_LONG_MIN) * p;
    const hi = WIND_REST_LONG_MAX + (WIND_REST_FAST_MAX - WIND_REST_LONG_MAX) * p;
    return lo + Math.random() * (hi - lo);
  }
  function windWarnFrames() {
    return Math.round(WIND_WARN_START + (WIND_WARN_END - WIND_WARN_START) * windProgress());
  }
  function windGustFrames() {
    const p = windProgress();
    const lo = WIND_GUST_LONG_MIN + (WIND_GUST_FAST_MIN - WIND_GUST_LONG_MIN) * p;
    const hi = WIND_GUST_LONG_MAX + (WIND_GUST_FAST_MAX - WIND_GUST_LONG_MAX) * p;
    return lo + Math.random() * (hi - lo);
  }
  function resetWind() {
    wind.force = 0;
    wind.dir = 0;
    wind.phase = "rest";
    wind.timer = 0;
    wind.warn = 0;
    wind.gustLeft = 0;
    wind.nextAt = 340;
    wind.active = false;
  }
  function updateWind(dt) {
    const wasActive = wind.active;
    // Во время боя с боссом ветер выключен: он уже снят на входе и не должен
    // включаться заново, пока бой идёт.
    const windAllowed = bossState.phase === "idle";
    wind.active = windAllowed && player.score >= WIND_FROM_SCORE && !windSuppressedByPerk();
    if (!wind.active) {
      wind.force = 0;
      wind.dir = 0;
      wind.phase = "rest";
      wind.timer = 0;
      wind.warn = 0;
      wind.gustLeft = 0;
      return;
    }
    if (!wasActive) {
      wind.phase = "rest";
      wind.timer = 0;
      wind.warn = 0;
      wind.force = 0;
      wind.gustLeft = 0;
      wind.nextAt = 110 + Math.random() * 70;
    }
    if (wind.phase === "warn") {
      wind.warn = Math.max(0, wind.warn - dt);
      if (wind.warn === 0) {
        wind.phase = "gust";
        wind.gustLeft = windGustFrames();
      }
    } else if (wind.phase === "gust") {
      wind.gustLeft = Math.max(0, wind.gustLeft - dt);
      if (wind.gustLeft === 0) {
        wind.phase = "rest";
        wind.timer = 0;
        wind.nextAt = windRestFrames();
      }
    } else {
      wind.timer += dt;
      if (wind.timer >= wind.nextAt) {
        wind.dir = Math.random() < 0.5 ? -1 : 1;
        wind.warn = windWarnFrames();
        wind.phase = "warn";
      }
    }
    const target = wind.phase === "gust" ? wind.dir : 0;
    const accel = 0.06 + windProgress() * 0.07;
    wind.force += (target - wind.force) * Math.min(1, accel * dt);
  }
  function applyWind(dt) {
    const blizzard = eventActive("blizzard") ? Math.sin(performance.now() / 900) * 2.6 : 0;
    if (!wind.active && !blizzard) return;
    player.x += ((wind.active ? wind.force * windStrength() : 0) + blizzard) * dt;
  }
  var COINS_PER_LIFE = 25;
  var COIN_MAGNET_RADIUS = 38;
  var PERK_SCORE_STEP = 1e4;
  function newPerkMods() {
    const mods = {};
    for (const key of Object.keys(PERK_NEUTRAL)) {
      mods[key] = { layers: [] };
    }
    return mods;
  }
  var perkState = {
    mods: newPerkMods(),
    active: [],
    coinMultiplier: 0,
    // 0 — ×1, 1 — ×2, 2 — ×3, 4 — ×5
    coinUntil: 0,
    // до каких очков действует множитель монет       // сколько спасений от падения в запасе
    lastOfferScore: 0,
    offering: false,
    offerCards: [],
    offerReadyAt: 0,
    pickedAt: 0,
    pickedIndex: -1,
    rerolls: 0
    // сколько раз перекрутили текущую раздачу
  };
  function resetPerks() {
    perkState.mods = newPerkMods();
    perkState.active.length = 0;
    perkState.coinMultiplier = 0;
    perkState.coinUntil = 0;
    perkState.lastOfferScore = 0;
    perkState.offering = false;
    perkState.offerCards = [];
    perkState.offerReadyAt = 0;
    perkState.pickedAt = 0;
    perkState.pickedIndex = -1;
    perkState.rerolls = 0;
  }
  function perkValue(key) {
    const mod = perkState.mods[key];
    const neutral = PERK_NEUTRAL[key];
    if (!mod || !mod.layers.length) return neutral;
    const score = player.score;
    let result = neutral;
    for (const layer of mod.layers) {
      if (score >= layer.until) continue;
      result = neutral === 0 ? result + layer.v : result * layer.v;
    }
    return result;
  }
  var perkGravityScale = () => perkValue("gravity");
  var perkBounceScale = () => perkValue("bounce");
  var perkSpringScale = () => perkValue("spring");
  var perkWidthScale = () => perkValue("width");
  var perkGapScale = () => perkValue("gap");
  var perkAccelScale = () => perkValue("accel");
  var perkFrictionScale = () => perkValue("friction");
  var perkBirdScale = () => perkValue("bird");
  var perkMagnetScale = () => perkValue("magnet");
  var perkShakeScale = () => perkValue("shake");
  var fallGuardActive = () => perkValue("guard") > 0;
  var invulnerableActive = () => perkValue("invuln") > 0;
  var ghostActive = () => perkValue("ghost") > 0;
  var windSuppressedByPerk = () => perkValue("calm") > 0;
  function coinsPerLife() {
    const custom = perkValue("coinLife");
    return custom > 0 ? custom : COINS_PER_LIFE;
  }
  function rollPerkRarity() {
    const roll = Math.random();
    let acc = 0;
    for (const rarity of PERK_RARITY_ORDER) {
      acc += PERK_RARITY_WEIGHTS[rarity];
      if (roll < acc) return rarity;
    }
    return "common";
  }
  function rollPerkOffer() {
    const used = /* @__PURE__ */ new Set();
    for (const a of perkState.active) used.add(a.id);
    const cards = [];
    for (let slot = 0; slot < 3; slot++) {
      let picked = null;
      for (let attempt = 0; attempt < 12 && !picked; attempt++) {
        const rarity = rollPerkRarity();
        const pool = PERK_DEFS.filter((p) => p.rarity === rarity && !used.has(p.id));
        if (pool.length) picked = pool[Math.floor(Math.random() * pool.length)];
      }
      if (!picked) {
        const pool = PERK_DEFS.filter((p) => !used.has(p.id));
        if (pool.length) picked = pool[Math.floor(Math.random() * pool.length)];
      }
      if (picked) {
        used.add(picked.id);
        cards.push(picked);
      }
    }
    return cards;
  }
  function applyPerk(perk) {
    const score = Math.floor(player.score);
    for (const [key, value, span] of perk.mods || []) {
      const mod = perkState.mods[key];
      if (!mod) continue;
      mod.layers.push({ v: value, until: score + span });
    }
    if (perk.coins) {
      perkState.coinMultiplier = perk.coins.mult;
      perkState.coinUntil = score + perk.coins.span;
    }
    if (perk.lives) {
      lives += perk.lives;
      hudState.lifePulse = 1;
    }
    if (perk.coinsNow) {
      const perLife = coinsPerLife();
      const livesBefore = Math.floor(runCoins / perLife);
      runCoins += perk.coinsNow;
      bankCoins += perk.coinsNow;
      stats.coins += perk.coinsNow;
      const livesGained = Math.floor(runCoins / perLife) - livesBefore;
      if (livesGained > 0) {
        lives += livesGained;
        hudState.lifePulse = 1;
      }
      hudState.coinPulse = 1;
    }
    const spans = (perk.mods || []).map(([, , span]) => span);
    if (perk.coins) spans.push(perk.coins.span);
    if (spans.length) {
      const timedUntil = score + Math.max(...spans);
      const already = perkState.active.find((a) => a.id === perk.id);
      if (already) {
        already.until = timedUntil;
        already.from = score;
      } else {
        perkState.active.push({
          id: perk.id,
          icon: perk.icon,
          title: perk.title,
          rarity: perk.rarity,
          until: timedUntil,
          from: score
        });
      }
    }
    const info = PERK_RARITY[perk.rarity] || PERK_RARITY.common;
    hudPop(player.x + 15, player.y - 26, perk.title, info.color);
    saveProgress();
  }
  var questState = {
    active: null,
    progress: 0,
    done: false,
    failed: false,
    springUsed: false,
    birdHit: false,
    doneAt: 0
  };
  var QUEST_DONE_SHOW_MS = 5e3;
  var QUEST_DONE_FADE_MS = WORLD_H;
  function resetQuests() {
    const pick = QUEST_DEFS[Math.floor(Math.random() * QUEST_DEFS.length)];
    questState.active = pick;
    questState.progress = 0;
    questState.done = false;
    questState.failed = false;
    questState.failedAt = 0;
    questState.springUsed = false;
    questState.birdHit = false;
    questState.doneAt = 0;
  }
  function questFailedNow() {
    if (!questState.active || questState.done || questState.failed) return false;
    const id = questState.active.id;
    if (id === "noSpring" && questState.springUsed) return true;
    if (id === "noBird" && questState.birdHit) return true;
    return false;
  }
  function updateQuests(dt) {
    const quest = questState.active;
    if (!quest || questState.done) return;
    if (questFailedNow()) {
      questState.failed = true;
      questState.failedAt = performance.now();
      hudPop(player.x + 15, player.y - 24, "\u0417\u0410\u0414\u0410\u041D\u0418\u0415 \u041F\u0420\u041E\u0412\u0410\u041B\u0415\u041D\u041E", "#e63946");
      return;
    }
    questState.progress = quest.id === "coins" ? runCoins : Math.floor(player.score);
    if (questState.progress >= quest.target) {
      questState.done = true;
      questState.doneAt = performance.now();
      bankCoins += quest.reward;
      saveProgress();
      hudState.coinPulse = 1;
      hudPop(player.x + 15, player.y - 24, `+${quest.reward} \u0417\u0410 \u0417\u0410\u0414\u0410\u041D\u0418\u0415`, "#0f8a76");
    }
  }
  var sound = { ctx: null, enabled: true, master: null };
  function initSound() {
    if (sound.ctx) return sound.ctx;
    const Ctor = window.AudioContext || window.webkitAudioContext;
    if (!Ctor) return null;
    try {
      sound.ctx = new Ctor();
      sound.master = sound.ctx.createGain();
      let vol = 100;
      try { const raw = localStorage.getItem("morjakaVolume"); if (raw !== null) vol = Number(raw); } catch {}
      sound.master.gain.value = 0.05 * (Math.max(0, Math.min(100, Number.isFinite(vol) ? vol : 100)) / 100);
      sound.master.connect(sound.ctx.destination);
    } catch {
      sound.ctx = null;
    }
    return sound.ctx;
  }
  function playTone(freqFrom, freqTo, duration, type = "sine", volume = 1) {
    if (!sound.enabled) return;
    const ac = initSound();
    if (!ac) return;
    if (ac.state === "suspended") ac.resume();
    try {
      const t0 = ac.currentTime;
      const osc = ac.createOscillator();
      const gain = ac.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freqFrom, t0);
      osc.frequency.exponentialRampToValueAtTime(Math.max(30, freqTo), t0 + duration);
      gain.gain.setValueAtTime(1e-4, t0);
      gain.gain.exponentialRampToValueAtTime(volume, t0 + 0.012);
      gain.gain.exponentialRampToValueAtTime(1e-4, t0 + duration);
      osc.connect(gain);
      if (sound.master) {
        if (sound.master) gain.connect(sound.master);
      }
      osc.start(t0);
      osc.stop(t0 + duration + 0.02);
    } catch {
    }
  }
  function playNoise(duration, volume = 1) {
    if (!sound.enabled) return;
    const ac = initSound();
    if (!ac) return;
    try {
      const frames = Math.floor(ac.sampleRate * duration);
      const buffer = ac.createBuffer(1, frames, ac.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < frames; i++) {
        data[i] = (Math.random() * 2 - 1) * (1 - i / frames);
      }
      const src = ac.createBufferSource();
      const gain = ac.createGain();
      const filter = ac.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.value = 1400;
      src.buffer = buffer;
      gain.gain.value = volume;
      src.connect(filter);
      filter.connect(gain);
      if (sound.master) {
        if (sound.master) gain.connect(sound.master);
      }
      src.start();
    } catch {
    }
  }
  function vibrate(pattern) {
    if (!sound.enabled || !vibrationEnabled) return;
    if (typeof navigator !== "undefined" && navigator.vibrate) {
      try {
        navigator.vibrate(pattern);
      } catch {
      }
    }
  }
  var sfx = {
    jump() {
      playTone(300, 520, 0.09, "sine", 0.7);
    },
    coin() {
      playTone(880, 1180, 0.07, "triangle", 0.8);
      setTimeout(() => playTone(1180, 1480, 0.07, "triangle", 0.6), 55);
    },
    spring() {
      playTone(220, 780, 0.16, "sine", 0.8);
    },
    land() {
      playTone(160, 110, 0.06, "sine", 0.4);
    },
    crack() {
      playNoise(0.14, 0.5);
    },
    fall() {
      playTone(300, 70, 0.34, "sine", 0.9);
    },
    life() {
      playTone(660, 990, 0.12, "triangle", 0.7);
    },
    hit() {
      playTone(190, 90, 0.12, "square", 0.55);
      playNoise(0.08, 0.35);
    },
    click() {
      playTone(520, 460, 0.04, "sine", 0.35);
    },
    /* новые типы платформ: у каждого свой характер */
    /** Исчезающая: короткий предупреждающий «вздох» вниз. */
    vanishWarn() {
      playTone(700, 420, 0.1, "triangle", 0.5);
    },
    /** Исчезающая пропала: тихий хлопок. */
    vanishGone() {
      playNoise(0.1, 0.3);
    },
    /** Облачная: мягкий, будто ватный, отскок. */
    /** Липкая: глухой звук прилипания. */
    stickyLand() {
      playTone(120, 90, 0.09, "square", 0.3);
    }
  };
  function loadSoundSetting() {
    try {
      if (localStorage.getItem("morjakaSound") === "0") sound.enabled = false;
    } catch {
    }
  }
  function syncSoundButton() {
    if (!soundButton) return;
    soundButton.classList.toggle("muted", !sound.enabled);
    soundButton.setAttribute("aria-label", sound.enabled ? "\u0412\u044B\u043A\u043B\u044E\u0447\u0438\u0442\u044C \u0437\u0432\u0443\u043A" : "\u0412\u043A\u043B\u044E\u0447\u0438\u0442\u044C \u0437\u0432\u0443\u043A");
    soundButton.title = sound.enabled ? "\u0417\u0432\u0443\u043A \u0432\u043A\u043B\u044E\u0447\u0451\u043D" : "\u0417\u0432\u0443\u043A \u0432\u044B\u043A\u043B\u044E\u0447\u0435\u043D";
  }
  function toggleSound() {
    sound.enabled = !sound.enabled;
    try {
      localStorage.setItem("morjakaSound", sound.enabled ? "1" : "0");
    } catch {
    }
    syncSoundButton();
    if (sound.enabled) sfx.click();
  }
  loadSoundSetting();
  var platforms = [];
  var fallingPlatforms = [];
  var verticalPlatforms = [];
  var springs = [];
  var coins = [];
  var lifePickups = [];
  var jetpickups = [];
  var birds = [];
  var lives = 0;
  var jumpCharges = 0;
  var stickyStuck = null;
  var HUNTER_FROM_SCORE = 15e3;
  var HUNTER_STILL_FRAMES = 240;
  var HUNTER_CHASE_FRAMES = 180;
  var hunterBird = null;
  var hunterLeft = 0;
  var stillFrames = 0;
  var stillRefY = 0;
  var DRY_FROM_SCORE = 15e3;
  var DRY_ROWS = 4;
  var dryRowsLeft = 0;
  var dryPlatforms = /* @__PURE__ */ new WeakSet();
  var EVENT_HINTS = {
    darkness: "\u0422\u0415\u041C\u041D\u041E\u0422\u0410",
    slide: "\u0421\u041A\u041E\u041B\u042C\u0417\u041A\u0418\u0419 \u041F\u041E\u041B",
    avalanche: "\u041B\u0410\u0412\u0418\u041D\u0410",
    platformTimer: "\u041D\u0415 \u0421\u0422\u041E\u0419 \u041D\u0410 \u041C\u0415\u0421\u0422\u0415",
    walls: "\u0421\u0422\u0415\u041D\u042B",
    spikes: "\u0428\u0418\u041F\u042B",
    blizzard: "\u041C\u0415\u0422\u0415\u041B\u042C"
  };
  var PLATFORM_TIMER_ENABLED = false;
  var EVENT_FIRST_SCORE = 15e3;
  var EVENT_POOL = ["darkness", "slide", "avalanche", "walls", "spikes", "blizzard"];
  var spikyPlatforms = /* @__PURE__ */ new WeakMap();
  var SPIKY_CHANCE = 0.15;
  var SPIKY_MAX_PER_EVENT = 3;
  var spikyBudget = 0;
  var spikeSerial = 0;
  var spikySerial = /* @__PURE__ */ new WeakMap();
  var slidingPlatforms = /* @__PURE__ */ new Map();
  var avalancheRocks = /* @__PURE__ */ new WeakSet();
  var avalancheTimer = 0;
  var EVENT_STEP = 1e4;
  var EVENT_INTRO_MS = 4e3;
  var EVENT_FADE_MS = 333;
  var EVENT_COUNTDOWN_MS = 3e3;
  var eventIntroMs = 0;
  var eventCountdownMs = 0;
  var SIM_STEP_MS = 1e3 / 60;
  var MAX_FRAME_MS = 100;
  var MAX_SIM_STEPS_PER_FRAME = 6;
  var simAccumMs = 0;
  var lastRealTs = 0;
  var EVENT_INFO = {
    darkness: { title: "\u0422\u0415\u041C\u041D\u041E\u0422\u0410", text: "\u041C\u0438\u0440 \u043F\u043E\u0433\u0440\u0443\u0436\u0451\u043D \u0432\u043E \u043C\u0440\u0430\u043A. \u0412\u0438\u0434\u043D\u043E \u0442\u043E\u043B\u044C\u043A\u043E \u043E\u0431\u043B\u0430\u0441\u0442\u044C \u0432\u043E\u043A\u0440\u0443\u0433 \u0438\u0433\u0440\u043E\u043A\u0430." },
    slide: { title: "\u0421\u041A\u041E\u041B\u042C\u0417\u041A\u0418\u0419 \u041F\u041E\u041B", text: "\u041F\u043B\u0430\u0442\u0444\u043E\u0440\u043C\u044B, \u043D\u0430 \u043A\u043E\u0442\u043E\u0440\u044B\u0435 \u0442\u044B \u043F\u0440\u0438\u0437\u0435\u043C\u043B\u0438\u043B\u0441\u044F, \u043D\u0430\u0447\u0438\u043D\u0430\u044E\u0442 \u0443\u0435\u0437\u0436\u0430\u0442\u044C \u0432\u0431\u043E\u043A." },
    avalanche: { title: "\u041B\u0410\u0412\u0418\u041D\u0410", text: "\u0421\u0432\u0435\u0440\u0445\u0443 \u043F\u0430\u0434\u0430\u044E\u0442 \u043A\u0430\u043C\u043D\u0438. \u041E\u043D\u0438 \u0442\u043E\u043B\u043A\u0430\u044E\u0442 \u0438\u0433\u0440\u043E\u043A\u0430, \u043D\u043E \u0436\u0438\u0437\u043D\u044C \u043D\u0435 \u043E\u0442\u043D\u0438\u043C\u0430\u044E\u0442." },
    walls: { title: "\u0421\u0422\u0415\u041D\u042B", text: "\u041F\u043E \u043A\u0440\u0430\u044F\u043C \u0432\u044B\u0440\u0430\u0441\u0442\u0430\u044E\u0442 \u043B\u0435\u0434\u044F\u043D\u044B\u0435 \u0441\u0442\u0435\u043D\u044B. \u0414\u0435\u0440\u0436\u0438\u0441\u044C \u0431\u043B\u0438\u0436\u0435 \u043A \u0446\u0435\u043D\u0442\u0440\u0443." },
    spikes: { title: "\u0428\u0418\u041F\u042B", text: "\u0427\u0430\u0441\u0442\u044C \u043F\u043B\u0430\u0442\u0444\u043E\u0440\u043C \u043F\u043E\u043A\u0440\u044B\u0442\u0430 \u0448\u0438\u043F\u0430\u043C\u0438. \u041A\u0430\u0441\u0430\u043D\u0438\u0435 \u0448\u0438\u043F\u0430 \u0440\u0430\u0431\u043E\u0442\u0430\u0435\u0442 \u043A\u0430\u043A \u043F\u0430\u0434\u0435\u043D\u0438\u0435." },
    blizzard: { title: "\u041C\u0415\u0422\u0415\u041B\u042C", text: "\u0421\u043D\u0435\u0433 \u0437\u0430\u0441\u0442\u0438\u043B\u0430\u0435\u0442 \u044D\u043A\u0440\u0430\u043D, \u0430 \u0432\u0435\u0442\u0435\u0440 \u0441\u0431\u0438\u0432\u0430\u0435\u0442 \u0441 \u043A\u0443\u0440\u0441\u0430. \u0414\u0435\u0440\u0436\u0438\u0441\u044C \u0446\u0435\u043D\u0442\u0440\u0430." }
  };
  var EVENT_ACCENTS = {
    darkness: "#3f6fa8",
    slide: "#2f9dbd",
    avalanche: "#6b8fa8",
    walls: "#4b8fd1",
    spikes: "#e0575f",
    blizzard: "#8fc9e8"
  };
  var EVENT_DURATION_MS = 1e4;
  var EVENT_DURATION_GROWTH_MS = 5e3;
  var EVENT_DURATION_MAX_MS = 3e4;
  var EVENT_POWER_PER_SCORE = 1 / 4e4;
  var EVENT_POWER_MAX = 2.5;
  function eventDurationFor(score) {
    const steps = Math.max(0, Math.floor((score - EVENT_FIRST_SCORE) / EVENT_STEP));
    return Math.min(EVENT_DURATION_MAX_MS, EVENT_DURATION_MS + steps * EVENT_DURATION_GROWTH_MS);
  }
  function eventPowerFor(score) {
    return Math.min(EVENT_POWER_MAX, 1 + Math.max(0, score - EVENT_FIRST_SCORE) * EVENT_POWER_PER_SCORE);
  }
  var SPIKE_CYCLE_MS = 5e3;
  var SPIKE_ON_MS = 3e3;
  var WALLS_GROW_MS = 4e3;
  var WALLS_MAX_PX = 60;
  var AVALANCHE_EVERY_MS = 750;
  var SLIDE_PX_PER_MS = 4.2 * 60 / 1e3;
  var HUNTER_STILL_MS = HUNTER_STILL_FRAMES * 1e3 / 60;
  var HUNTER_CHASE_MS = HUNTER_CHASE_FRAMES * 1e3 / 60;
  var EVENT_BOUNCE_LIMIT = 4;
  var activeEvents = [];
  var nextEventScore = EVENT_FIRST_SCORE;
  var introKind = "";
  var lastLandedPlatform = null;
  var frameSinceLanding = 0;
  function resetRandomEvent() {
    eventIntroMs = 0;
    eventCountdownMs = 0;
    slidingPlatforms.clear();
    avalancheTimer = 0;
    activeEvents = [];
    nextEventScore = EVENT_FIRST_SCORE;
    introKind = "";
    spikyBudget = 0;
    lastLandedPlatform = null;
    frameSinceLanding = 0;
  }
  function isSpiky(p) {
    if (spikySerial.get(p) !== spikeSerial) {
      const on = spikyBudget > 0 && p.y < 440 && Math.random() < SPIKY_CHANCE;
      if (on) spikyBudget--;
      spikyPlatforms.set(p, on);
      spikySerial.set(p, spikeSerial);
    }
    return spikyPlatforms.get(p) === true;
  }
  function eventOf(kind) {
    return activeEvents.find((ev) => ev.kind === kind);
  }
  function eventActive(kind) {
    return activeEvents.some((ev) => ev.kind === kind);
  }
  function eventPowerOf(kind) {
    return eventOf(kind)?.power ?? 1;
  }
  function spikesActiveNow() {
    return activeEvents.some((ev) => ev.kind === "spikes" && (ev.total - ev.left) % SPIKE_CYCLE_MS < SPIKE_ON_MS);
  }
  function wallsInset() {
    const w = eventOf("walls");
    if (!w) return 0;
    const max = WALLS_MAX_PX;
    return Math.min(max, (w.total - w.left) / WALLS_GROW_MS * max);
  }
  function updateEventWorld(dt) {
    if (eventActive("slide")) {
      const power = eventPowerOf("slide");
      for (const [p, dir] of slidingPlatforms) {
        if (!platforms.includes(p)) {
          slidingPlatforms.delete(p);
          continue;
        }
        p.x += dir * SLIDE_PX_PER_MS * power * SIM_STEP_MS;
        if (p.x <= 0 || p.x + p.w >= WORLD_W) {
          p.x = Math.max(0, Math.min(WORLD_W - p.w, p.x));
          slidingPlatforms.set(p, -dir);
        }
      }
    }
    const av = eventOf("avalanche");
    if (av) {
      avalancheTimer -= SIM_STEP_MS;
      if (avalancheTimer <= 0) {
        avalancheTimer = AVALANCHE_EVERY_MS / av.power;
        const rock = {
          kind: "raven",
          color: "#8b97a6",
          accent: "#dfe6ee",
          x: 20 + Math.random() * (WORLD_W - 40),
          y: -30,
          vx: 0,
          dir: 1,
          baseY: -30,
          wave: 0,
          waveSpeed: 0,
          phase: 0,
          size: 1.1,
          flap: Math.random() * Math.PI * 2,
          flapSpeed: 0.025 + Math.random() * 0.035,
          hitCooldown: 0
        };
        birds.push(rock);
        avalancheRocks.add(rock);
      }
    }
  }
  function tickEvents(dt) {
    for (let i = activeEvents.length - 1; i >= 0; i--) {
      const ev = activeEvents[i];
      ev.left -= dt;
      if (ev.left <= 0) {
        activeEvents.splice(i, 1);
        if (ev.kind === "slide") slidingPlatforms.clear();
      }
    }
  }
  function pickEventKind() {
    if (PLATFORM_TIMER_ENABLED && Math.random() < 0.2 && !eventActive("platformTimer")) return "platformTimer";
    const free = EVENT_POOL.filter((k) => !eventActive(k));
    if (!free.length) return null;
    return free[Math.floor(Math.random() * free.length)];
  }
  function spawnEvent(kind) {
    const score = player.score;
    const total = eventDurationFor(score);
    activeEvents.push({
      kind,
      left: total,
      total,
      power: eventPowerFor(score),
      standOn: null,
      standFrames: 0
    });
    if (kind === "avalanche") avalancheTimer = 0;
    if (kind === "spikes") {
      spikeSerial++;
      spikyBudget = SPIKY_MAX_PER_EVENT;
    }
    introKind = kind;
    eventIntroMs = 0;
    eventCountdownMs = EVENT_COUNTDOWN_MS;
    dailyAdd("events", 1);
  }
  function updateRandomEvent() {
    const landed = lastLandedPlatform;
    lastLandedPlatform = null;
    if (landed && eventActive("slide") && !slidingPlatforms.has(landed)) {
      slidingPlatforms.set(landed, Math.random() < 0.5 ? -1 : 1);
    }
    const bossBlocks = bossState.phase !== "idle" || player.score >= bossState.nextScore;
    if (player.score >= nextEventScore && !bossBlocks) {
      const kind = pickEventKind();
      if (kind) spawnEvent(kind);
      nextEventScore += EVENT_STEP;
    }
    tickEvents(SIM_STEP_MS);
    const pt = eventOf("platformTimer");
    if (pt) {
      if (landed) {
        frameSinceLanding = 0;
        if (landed === pt.standOn) pt.standFrames += 1;
        else {
          pt.standOn = landed;
          pt.standFrames = 1;
        }
      } else {
        frameSinceLanding += SIM_STEP_MS;
        if (frameSinceLanding > 4e3) {
          pt.standOn = null;
          pt.standFrames = 0;
        }
      }
      const on = pt.standOn;
      if (on && !on.falling && pt.standFrames >= EVENT_BOUNCE_LIMIT) {
        on.falling = true;
        on.vy = 0;
        fallingPlatforms.push(on);
        on.removeAfterBounce = true;
        pt.standOn = null;
        pt.standFrames = 0;
        hudPop(player.x + 15, 430, "\u041E\u0411\u0420\u0423\u0428\u0418\u041B\u041E\u0421\u042C!", "#e63946");
      }
    }
  }
  var PLATFORM_HINTS = {
    broken: { text: "\u0425\u0420\u0423\u041F\u041A\u041E", color: "#c98a4b" },
    moving: { text: "\u0414\u0412\u0418\u0416\u0415\u0422\u0421\u042F", color: "#5ac8fa" },
    ice: { text: "\u0421\u041A\u041E\u041B\u042C\u0417\u041A\u041E", color: "#8fe3ff" },
    spring: { text: "\u041F\u0420\u0423\u0416\u0418\u041D\u0410", color: "#ffd23f" },
    vanish: { text: "\u0418\u0421\u0427\u0415\u0417\u0410\u0415\u0422", color: "#ff8fa3" },
    sticky: { text: "\u041B\u0418\u041F\u041D\u0415\u0422 \xB7 2 \u041F\u0420\u042B\u0416\u041A\u0410", color: "#7bc96f" }
  };
  var seenPlatformTypes = /* @__PURE__ */ new Set();
  var runCoins = 0;
  // Серия приземлений убрана полностью: не влияет на коины и больше не загружает HUD.
  function comboMultiplier() {
    return 1;
  }
  function registerComboLanding() {
    stats.platforms++;
    dailyAdd("platforms", 1);
  }
  var keys = {};
  // Геймпад: опрос идёт каждый кадр, но флаги поднимаются только если он реально
  // подключён — без пада управление ведёт себя ровно как раньше.
  var padInput = { left: false, right: false, axis: 0, connected: false };
  var padPrev = { jump: false, start: false };
  var PAD_DEADZONE = 0.35;
  function padJumpPressed() {
    if (currentState === STATE.PLAYING) {
      if (perkState.offering) return;
      doDoubleJump();
      return;
    }
    if (currentState === STATE.MENU) startGame();
    else if (currentState === STATE.GAMEOVER) startGame();
  }
  function padStartPressed() {
    if (currentState === STATE.PLAYING) pauseGame();
    else if (currentState === STATE.PAUSE) resumeGame();
    else if (currentState === STATE.MENU) startGame();
    else if (currentState === STATE.GAMEOVER) startGame();
  }
  function pollGamepad() {
    padInput.left = false;
    padInput.right = false;
    padInput.axis = 0;
    padInput.connected = false;
    if (!navigator.getGamepads) return;
    var pads = navigator.getGamepads();
    var pad = null;
    for (var i = 0; i < pads.length; i++) {
      if (pads[i] && pads[i].connected) { pad = pads[i]; break; }
    }
    if (!pad) {
      padPrev.jump = false;
      padPrev.start = false;
      return;
    }
    padInput.connected = true;
    var axis = pad.axes && pad.axes.length ? pad.axes[0] : 0;
    var magnitude = Math.abs(axis);
    // Мёртвая зона настраивается: ниже неё стик считается отпущенным.
    const deadZone = controls.padZone;
    padInput.axis = magnitude > deadZone
      ? Math.sign(axis) * (magnitude - deadZone) / (1 - deadZone)
      : 0;
    var dLeft = pad.buttons[14] && pad.buttons[14].pressed;
    var dRight = pad.buttons[15] && pad.buttons[15].pressed;
    padInput.left = axis < -PAD_DEADZONE || dLeft;
    padInput.right = axis > PAD_DEADZONE || dRight;
    // A, B и правый курок — прыжок; Start — пауза/продолжить.
    var jump = !!(pad.buttons[0] && pad.buttons[0].pressed) ||
      !!(pad.buttons[1] && pad.buttons[1].pressed) ||
      !!(pad.buttons[7] && pad.buttons[7].value > 0.5);
    var start = !!(pad.buttons[9] && pad.buttons[9].pressed);
    if (jump && !padPrev.jump) padJumpPressed();
    if (start && !padPrev.start) padStartPressed();
    padPrev.jump = jump;
    padPrev.start = start;
  }
  window.addEventListener("gamepadconnected", () => {
    setMenuMessage("Геймпад подключён", "A — прыжок, START — пауза");
  });
  function resetGame() {
    player = { x: 185, y: 500, vx: 0, dy: 0, score: 0 };
    platforms = [makePlatform({ x: 120, y: 550, w: 160, h: 15, type: "static" })];
    fallingPlatforms = [];
    verticalPlatforms = [];
    springs = [];
    coins = [];
    lifePickups = [];
    jetpickups = [];
    birds = [];
    lives = 1;
    jumpCharges = 0;
    stickyStuck = null;
    seenPlatformTypes = /* @__PURE__ */ new Set();
    resetBoss();
    resetRandomEvent();
    hunterBird = null;
    hunterLeft = 0;
    stillFrames = 0;
    stillRefY = 0;
    dryRowsLeft = 0;
    runCoins = 0;
    stats.runCounted = false;
    resetPerks();
    resetWind();
    resetQuests();
    fallCooldown = 0;
    squash = 0;
    runStartedAt = performance.now();
    clearTouchInput();
    for (let i = 0; i < 7; i++) {
      const y = 500 - i * 100;
      const step = spawnTerrainStep(y);
      for (const p of step.platforms) platforms.push(p);
      for (const v of step.verticals) verticalPlatforms.push(v);
    }
  }
  function startGame() {
    trainingState.active = false;
    bossTrainOpen = false;
  