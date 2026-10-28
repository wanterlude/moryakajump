  function startGame() {
    trainingState.active = false;
    bossTrainOpen = false;
  initDaily();
    resetGame();
    resetHud();
    gameOverState.openedAt = 0;
    pauseState.hover = null;
    lastFrameTime = 0;
    currentState = STATE.PLAYING;
  }
  function resumeGame() {
    currentState = STATE.PLAYING;
    pauseState.hover = null;
    lastFrameTime = 0;
  }
  function pauseGame() {
    if (currentState !== STATE.PLAYING) return;
    if (perkState.offering) return;
    currentState = STATE.PAUSE;
    lastFrameTime = 0;
    pauseState.openedAt = performance.now();
    clearTouchInput();
  }
  function makePlatform(p) {
    return { dir: 2, ...p };
  }
  function removeWhere(arr, shouldRemove) {
    let write = 0;
    for (let read = 0; read < arr.length; read++) {
      const item = arr[read];
      if (!shouldRemove(item)) {
        if (write !== read) arr[write] = item;
        write++;
      }
    }
    arr.length = write;
    return arr;
  }
  var PLATFORM_MIX = {
    broken: { base: 0.05, perLevel: 0.05, max: 0.15, from: 0 },
    moving: { base: 0.05, perLevel: 0.05, max: 0.22, from: 0 },
    ice: { base: 0.02, perLevel: 0.025, max: 0.16, from: 3 },
    /* новые типы: каждый должен быть заметен, иначе его механику не освоить */
    vanish: { base: 0.01, perLevel: 0.02, max: 0.06, from: 2 },
    sticky: { base: 0.01, perLevel: 0.02, max: 0.06, from: 2 }
  };
  function mixShare(key, level) {
    const m = PLATFORM_MIX[key];
    if (level < m.from) return 0;
    return Math.min(m.max, m.base + (level - m.from) * m.perLevel);
  }
  var SPAWN = {
    /** Сколько очков счёта даёт один уровень сложности. */
    levelStep: 4e3,
    /* ---- типы платформ: чем выше уровень, тем больше «неудобных» ---- */
    /* ---- доли типов платформ: одна таблица на весь баланс ---- */
    /**
     * Сколько очков даёт один уровень сложности для долей платформ.
     * Уровни нужны только здесь: остальная сложность считается отдельно.
     */
    mixLevelStep: 4e3,
    /* ---- предметы ---- */
    /**
     * Базовый шанс связки монет на подходящей платформе.
     * Наверху дополнительно умножается на highItemBonus (см. ниже).
     */
    coinChance: 0.09,
    /**
     * Шанс сердечка: 1 / lifeChanceDivisor на подходящую платформу.
     *
     * Сердечки с платформ — основной источник жизней: за забег на
     * 60 000 выпадает примерно 2–3 штуки (замер: 2.6). Жизни за очки
     * убраны совсем, перки лишь повышают шанс выпадения (lifeDrop).
     */
    lifeChanceDivisor: 240,
    /**
     * Шанс ранца на подходящей платформе — свой, не привязанный к жизни.
     *
     * 1/66: примерно раз на 66 подходящих платформ. Меньше исходного 1/40
     * примерно на 40%.
     * Ранец должен быть заметным событием, а не фоном.
     */
    jetpackChance: 1 / 78,
    /**
     * Насколько щедрее предметы наверху.
     *
     * На нулевом уровне множитель 1 (низ не меняется). К highItemLevel
     * и выше шанс умножается на highItemBonus — компенсирует то, что
     * наверху мало платформ, способных держать предметы.
     */
    highItemBonus: 2.4,
    /** Уровень, на котором highItemBonus выходит на максимум. */
    highItemLevel: 5,
    /* ---- особые участки: тоже съедают место под предметы ---- */
    /** С какого счёта появляются особые участки. */
    specialsFromScore: 14e3,
    /** Шанс участка из ломающихся платформ. */
    brokenRunChance: 0.05,
    /** Шанс участка из двух платформ. */
    twinChance: 0.1,
    /**
     * Шанс парящей платформы (кристалла).
     * Снижен: на 40 000+ кристалл занимал ~16% шагов — больше, чем двойная
     * площадка и серия ломающихся вместе. Он требует тайминга, поэтому
     * был частым источником «нечестных» падений.
     */
    verticalBase: 0.045,
    verticalPerLevel: 8e-3,
    verticalMax: 0.11,
    /* ---- птицы ---- */
    /** Базовый шанс птицы за кадр при dt = 1 на нулевом счёте. */
    birdBaseRate: 4e-3,
    /** Добавка к шансу на максимальной высоте. */
    birdGrowthRate: 72e-4,
    /** Счёт, на котором прирост птиц выходит на максимум. */
    birdGrowthScore: 1e5,
    /**
     * Форма кривой роста птиц: 1 — линейно, <1 — резкий рост в начале,
     * >1 — птицы долго редки, потом резко появляются.
     */
    birdGrowthCurve: 1
  };
  function spawnLevel() {
    return Math.floor(player.score / SPAWN.levelStep);
  }
  function mixLevel() {
    return Math.floor(player.score / SPAWN.mixLevelStep);
  }
  function itemChanceScale() {
    const t = Math.min(1, spawnLevel() / Math.max(1, SPAWN.highItemLevel));
    return 1 + (SPAWN.highItemBonus - 1) * t;
  }
  function platformStep() {
    const t = Math.min(1, player.score / 1e5);
    const base = 90 + Math.random() * 40;
    const squeeze = 1 - 0.22 * t;
    return base * squeeze * perkGapScale();
  }
  function pickPlatformType(level) {
    if (bossState.phase === "fight") return Math.random() < 0.7 ? "static" : "moving";
    const roll = Math.random();
    let acc = 0;
      for (const key of ["broken", "moving", "ice", "vanish", "sticky"]) {
      acc += mixShare(key, level);
      if (roll < acc) return key;
    }
    return "static";
  }
  function spawnPlatform(y) {
    const level = mixLevel();
    const type = pickPlatformType(level);
    const width = Math.max(56, 70 * Math.max(0.7, 2 - level * 0.25)) * perkWidthScale();
    const platform = {
      x: Math.random() * (WORLD_W - width),
      y,
      w: width,
      h: 15,
      type,
      // Скорость движущихся платформ: выходит на потолок к 100 000,
      // поэтому до 60 000 она мягче, а на финише заметно злее.
      dir: 2 * Math.min(2.4, 1 + Math.floor(player.score / 4e3) * 0.2)
    };
    const holdsPickups = type === "static" || type === "ice" || type === "sticky";
    const holdsSpring = holdsPickups || type === "moving";
    if (holdsSpring && Math.random() > 0.78) {    
      platform.spring = true;
      springs.push({
        x: platform.x + platform.w / 2 - 10,
        y: y - 15,
        owner: platform,
        offsetX: platform.w / 2 - 10
      });
    }
    const itemScale = itemChanceScale();
    if (holdsPickups && Math.random() < SPAWN.coinChance * itemScale) {
      spawnCoinArc(platform, y);
    }
    const lifeChance = 1 / SPAWN.lifeChanceDivisor * (1 + perkValue("lifeDrop")) * itemScale;
    if (holdsPickups && lifePickups.length === 0 && Math.random() < lifeChance) {
      lifePickups.push({ x: platform.x + platform.w / 2 - 9, y: y - 34, r: 10 });
    }
    const jetpackChance = SPAWN.jetpackChance * itemScale;
    if (holdsPickups && jetpickups.length === 0 && Math.random() < jetpackChance) {
      jetpickups.push({ x: platform.x + platform.w / 2 - 11, y: y - 38, r: 11 });
    }
    return platform;
  }
  function spawnCoinArc(platform, platformY) {
    const count = 1 + Math.floor(Math.random() * 3) + Math.round(perkValue("arc"));
    const spanW = count === 1 ? 0 : Math.min(platform.w + 26, 78);
    const centerX = platform.x + platform.w / 2;
    const startX = count === 1 ? centerX : centerX - spanW / 2;
    const stepX = count > 1 ? spanW / (count - 1) : 0;
    const baseY = platformY - 26 - Math.random() * 8;
    const lift = 9 + Math.random() * 5;
    for (let i = 0; i < count; i++) {
      const t = count === 1 ? 0.5 : i / (count - 1);
      const arc = Math.sin(t * Math.PI);
      coins.push({
        x: startX + stepX * i,
        y: baseY - lift * arc,
        r: 9,
        phase: Math.random() * Math.PI * 2
      });
    }
  }
  function spawnBrokenRun(baseY) {
    const gap = platformStep();
    const created = [];
    for (let i = 0; i < 2; i++) {
      const width = 60;
      created.push(makePlatform({
        x: Math.random() * (WORLD_W - width),
        y: baseY - gap * i,
        w: width,
        h: 15,
        type: "broken",
        dir: 2
      }));
    }
    return created;
  }
  function spawnTwinPlatforms(y) {
    const width = 60;
    return [
      { x: 14 + Math.random() * 40, y, w: width, h: 15, type: "static", dir: 2 },
      { x: WORLD_W - width - 14 - Math.random() * 40, y: y - 26, w: width, h: 15, type: "static", dir: 2 }
    ];
  }
  function spawnVerticalPlatform(y) {
    const w = 80;
    const sideWidth = 70;
    const x = Math.random() < 0.5 ? Math.random() * sideWidth : WORLD_W - w - Math.random() * sideWidth;
    return makePlatform({
      x,
      y,
      baseY: y,
      previousY: y,
      w,
      h: 15,
      phase: Math.random() * Math.PI * 2,
      speed: 0.025 + Math.random() * 0.01,
      type: "static"
    });
  }
  function spawnVerticalStep(y) {
    const crystal = spawnVerticalPlatform(y);
    const gap = 16;
    const crystalAtLeft = crystal.x < 200;
    const freeStart = crystalAtLeft ? crystal.x + crystal.w + gap : 0;
    const freeEnd = crystalAtLeft ? WORLD_W : crystal.x - gap;
    const freeWidth = Math.max(40, freeEnd - freeStart);
    const regular = spawnPlatform(y);
    regular.w = Math.min(regular.w, freeWidth);
    regular.x = freeStart + Math.random() * Math.max(0, freeWidth - regular.w);
    for (const spring of springs) {
      if (spring.owner !== regular) continue;
      spring.offsetX = regular.w / 2 - 10;
      spring.x = regular.x + spring.offsetX;
    }
    return { platform: regular, crystal };
  }
  function spawnTerrainStep(y) {
    if (dryRowsLeft === 0 && player.score >= DRY_FROM_SCORE && Math.random() < 0.04) {
      dryRowsLeft = DRY_ROWS;
    }
    if (dryRowsLeft > 0) {
      dryRowsLeft--;
      const width = 70;
      const x = dryRowsLeft % 2 === 0 ? 8 : WORLD_W - width - 8;
      const dry = { x, y, w: width, h: 15, type: "static", dir: 0 };
      dryPlatforms.add(dry);
      return { platforms: [dry], verticals: [] };
    }
    const level = spawnLevel();
    const roll = Math.random();
    const specialsUnlocked = player.score >= SPAWN.specialsFromScore;
    const brokenRunEnd = SPAWN.brokenRunChance;
    const twinEnd = brokenRunEnd + SPAWN.twinChance;
    const specialsSpan = specialsUnlocked ? twinEnd : 0;
    if (specialsUnlocked && roll < brokenRunEnd) {
      return { platforms: spawnBrokenRun(y), verticals: [] };
    }
    if (specialsUnlocked && roll < twinEnd) {
      return { platforms: spawnTwinPlatforms(y), verticals: [] };
    }
    const verticalChance = Math.min(SPAWN.verticalMax, SPAWN.verticalBase + level * SPAWN.verticalPerLevel);
    if (roll < specialsSpan + verticalChance) {
      const step = spawnVerticalStep(y);
      return { platforms: [step.platform], verticals: [step.crystal] };
    }
    return { platforms: [spawnPlatform(y)], verticals: [] };
  }
  function birdGrowth() {
    const t = Math.min(1, Math.max(0, player.score / SPAWN.birdGrowthScore));
    return Math.pow(t, SPAWN.birdGrowthCurve);
  }
  function spawnBird() {
    const kindName = Math.random() < 0.5 ? "gull" : Math.random() < 0.55 ? "swift" : "raven";
    const kind = BIRD_KINDS[kindName];
    const growth = birdGrowth();
    const direction = Math.random() < 0.5 ? 1 : -1;
    const size = kind.scale * (0.85 + growth * 0.6);
    const speed = kind.speed + growth * 2.2;
    const bird = {
      kind: kindName,
      color: kind.color,
      accent: kind.accent,
      x: direction === 1 ? -46 : 446,
      y: 110 + Math.random() * 380,
      vx: direction * speed,
      dir: direction,
      baseY: 0,
      wave: kind.wave * (0.8 + growth * 0.7),
      waveSpeed: kind.waveSpeed,
      phase: Math.random() * Math.PI * 2,
      size,
      flap: Math.random() * Math.PI * 2,
      flapSpeed: 0.2 + growth * 0.16,
      hitCooldown: 0
    };
    bird.baseY = bird.y;
    birds.push(bird);
  }
  var FONT_STACK = '"Trebuchet MS","Segoe UI",Arial,sans-serif';
  function roundedRect(x, y, w, h, r) {
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, r);
  }
  function setFont(size, weight = "bold") {
    ctx.font = `${weight} ${size}px ${FONT_STACK}`;
  }
  var charWidthCache = /* @__PURE__ */ new Map();
  function fitTextSize(text, maxWidth, tracking = 0, maxSize = 6.5, minSize = 4.4) {
    for (let size = maxSize; size > minSize; size -= 0.3) {
      setFont(size, "bold");
      if (trackedWidth(text, tracking) <= maxWidth) return size;
    }
    setFont(minSize, "bold");
    return minSize;
  }
  function charWidth(ch) {
    const key = ctx.font + "\0" + ch;
    let w = charWidthCache.get(key);
    if (w === void 0) {
      w = ctx.measureText(ch).width;
      if (charWidthCache.size > WORLD_H) charWidthCache.clear();
      charWidthCache.set(key, w);
    }
    return w;
  }
  function trackedWidth(text, tracking = 0) {
    const chars = [...text];
    let sum = 0;
    for (const ch of chars) sum += charWidth(ch);
    return sum + tracking * Math.max(0, chars.length - 1);
  }
  function trackedText(text, x, y, tracking = 0, align = "center") {
    const chars = [...text];
    const total = trackedWidth(text, tracking);
    let cursor = align === "center" ? x - total / 2 : align === "right" ? x - total : x;
    const prevAlign = ctx.textAlign;
    ctx.textAlign = "left";
    for (const ch of chars) {
      ctx.fillText(ch, cursor, y);
      cursor += charWidth(ch) + tracking;
    }
    ctx.textAlign = prevAlign;
    return total;
  }
  function drawSparkle(x, y, s, color) {
    ctx.save();
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(x, y - s);
    ctx.quadraticCurveTo(x, y, x + s, y);
    ctx.quadraticCurveTo(x, y, x, y + s);
    ctx.quadraticCurveTo(x, y, x - s, y);
    ctx.quadraticCurveTo(x, y, x, y - s);
    ctx.fill();
    ctx.restore();
  }
  function drawHeart(x, y, s, color) {
    ctx.save();
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(x, y + s * 0.9);
    ctx.bezierCurveTo(x - s * 1.4, y - s * 0.2, x - s * 0.6, y - s * 1.2, x, y - s * 0.4);
    ctx.bezierCurveTo(x + s * 0.6, y - s * 1.2, x + s * 1.4, y - s * 0.2, x, y + s * 0.9);
    ctx.fill();
    ctx.restore();
  }
  function drawLockIcon(cx, cy, s, color) {
    ctx.save();
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = Math.max(1, s * 0.2);
    ctx.beginPath();
    ctx.arc(cx, cy - s * 0.34, s * 0.4, Math.PI, 0);
    ctx.stroke();
    roundedRect(cx - s * 0.62, cy - s * 0.06, s * 1.24, s * 0.92, s * 0.22);
    ctx.fill();
    ctx.restore();
  }
  function drawImageCircle(cx, cy, r, img) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.clip();
    ctx.drawImage(img, cx - r, cy - r, r * 2, r * 2);
    ctx.restore();
  }
  var canvasSafeCache = /* @__PURE__ */ new WeakMap();
  function imageUsableInCanvas(img) {
    if (!img || !img.complete || img.naturalWidth <= 0) return false;
    const cached = canvasSafeCache.get(img);
    if (cached !== void 0) return cached;
    let safe = false;
    try {
      const probeCv = document.createElement("canvas");
      probeCv.width = 1;
      probeCv.height = 1;
      const pc = probeCv.getContext("2d");
      if (pc) {
        pc.drawImage(img, 0, 0, 1, 1);
        probeCv.toDataURL();
        safe = true;
      }
    } catch {
      safe = false;
    }
    canvasSafeCache.set(img, safe);
    return safe;
  }
  function drawAvatarPlaceholder(cx, cy, r, index) {
    const hues = [
      ["#ffd98a", "#e0575f"],
      ["#8fd8ff", "#3b74c9"],
      ["#b8f0c0", "#2f8f5b"],
      ["#ffc9a8", "#d4633f"],
      ["#d7c6ff", "#6b46c1"],
      ["#ffe38a", "#c79a1b"]
    ];
    const [from, to] = hues[index % hues.length];
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.clip();
    const g = ctx.createLinearGradient(cx - r, cy - r, cx + r, cy + r);
    g.addColorStop(0, from);
    g.addColorStop(1, to);
    ctx.fillStyle = g;
    ctx.fillRect(cx - r, cy - r, r * 2, r * 2);
    ctx.fillStyle = "rgba(255,255,255,.9)";
    ctx.beginPath();
    ctx.arc(cx, cy - r * 0.2, r * 0.24, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(cx, cy + r * 0.52, r * 0.42, r * 0.32, 0, Math.PI, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
  function drawAvatarCircle(cx, cy, r, index, allowImage = true) {
    const img = allowImage ? avatarImages[index] : void 0;
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.clip();
    if (img && img.complete && img.naturalWidth > 0) {
      ctx.drawImage(img, cx - r, cy - r, r * 2, r * 2);
    } else {
      drawAvatarPlaceholder(cx, cy, r, index);
    }
    ctx.restore();
  }
  function holoGradient(cx, cy, r, colors) {
    const g = ctx.createLinearGradient(cx - r, cy - r, cx + r, cy + r);
    g.addColorStop(0, colors[0]);
    g.addColorStop(0.25, "#ffd6ff");
    g.addColorStop(0.5, colors[1]);
    g.addColorStop(0.75, "#c4fffb");
    g.addColorStop(1, colors[2]);
    return g;
  }
  function drawFrameRing(cx, cy, r, look, t) {
    const s = r / 24;
    const w = (look.width ?? 5) * s * 0.72;
    ctx.save();
    const g = ctx.createLinearGradient(cx - r, cy - r, cx + r, cy + r);
    g.addColorStop(0, look.colors[0]);
    g.addColorStop(0.5, look.colors[1]);
    g.addColorStop(1, look.colors[2]);
    ctx.shadowColor = look.glow;
    ctx.shadowBlur = look.pulse ? 10 + Math.sin(t * 4) * 5 : 8;
    ctx.strokeStyle = look.material === "holo" ? holoGradient(cx, cy, r, look.colors) : g;
    ctx.lineWidth = w;
    if (look.style === "dashed") ctx.setLineDash([w * 1.4, w * 0.9]);
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.shadowBlur = 0;
    if (look.material === "metal") {
      ctx.strokeStyle = "rgba(0,0,0,.28)";
      ctx.lineWidth = Math.max(0.8, w * 0.22);
      ctx.beginPath();
      ctx.arc(cx, cy, r + w * 0.3, 0, Math.PI * 2);
      ctx.stroke();
      ctx.strokeStyle = "rgba(255,255,255,.85)";
      ctx.beginPath();
      ctx.arc(cx, cy, r - w * 0.25, Math.PI * 1.1, Math.PI * 1.75);
      ctx.stroke();
    } else if (look.material === "glass") {
      ctx.strokeStyle = "rgba(255,255,255,.35)";
      ctx.lineWidth = w * 0.45;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.stroke();
      ctx.strokeStyle = "rgba(255,255,255,.9)";
      ctx.lineWidth = Math.max(0.8, w * 0.15);
      ctx.beginPath();
      ctx.arc(cx, cy, r - w * 0.35, Math.PI * 1.2, Math.PI * 1.45);
      ctx.stroke();
    }
    ctx.strokeStyle = "rgba(255,255,255,.75)";
    ctx.lineWidth = Math.max(0.8, w * 0.18);
    ctx.beginPath();
    ctx.arc(cx, cy, r - w * 0.25, Math.PI * 1.15, Math.PI * 1.6);
    ctx.stroke();
    ctx.strokeStyle = "rgba(10,20,35,.35)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(cx, cy, r + w / 2, 0, Math.PI * 2);
    ctx.stroke();
    ctx.strokeStyle = "rgba(255,255,255,.55)";
    ctx.beginPath();
    ctx.arc(cx, cy, r - w / 2, 0, Math.PI * 2);
    ctx.stroke();
    if (look.double) {
      ctx.strokeStyle = look.colors[1];
      ctx.lineWidth = 1.5 * s;
      ctx.beginPath();
      ctx.arc(cx, cy, r + w / 2 + 3 * s, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();
  }
  function drawOrnaments(cx, cy, r, look, t) {
    const k = r / 24;
    const angles = (count) => Array.from({ length: count }, (_, i) => i / count * Math.PI * 2);
    ctx.save();
    switch (look.ornament) {
      case "rivets":
        for (const a of angles(12)) {
          const x = cx + Math.cos(a) * r;
          const y = cy + Math.sin(a) * r;
          const g = ctx.createRadialGradient(x - k, y - k, 0.5 * k, x, y, 2.6 * k);
          g.addColorStop(0, "#fffbe0");
          g.addColorStop(1, look.colors[2]);
          ctx.fillStyle = g;
          ctx.beginPath();
          ctx.arc(x, y, 2.4 * k, 0, Math.PI * 2);
          ctx.fill();
        }
        break;
      case "crystals":
        for (const a of angles(8)) {
          ctx.save();
          ctx.translate(cx + Math.cos(a) * (r + k), cy + Math.sin(a) * (r + k));
          ctx.rotate(a + Math.PI / 2);
          ctx.fillStyle = "rgba(190,245,255,.95)";
          ctx.strokeStyle = look.colors[1];
          ctx.lineWidth = 0.8;
          ctx.beginPath();
          ctx.moveTo(-2.5 * k, 0);
          ctx.lineTo(0, -6 * k);
          ctx.lineTo(2.5 * k, 0);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
          ctx.restore();
        }
        break;
      case "gems":
        for (const a of angles(6)) {
          ctx.save();
          ctx.translate(cx + Math.cos(a) * r, cy + Math.sin(a) * r);
          ctx.rotate(Math.PI / 4);
          const g = ctx.createLinearGradient(-3 * k, -3 * k, 3 * k, 3 * k);
          g.addColorStop(0, "#ffffff");
          g.addColorStop(0.4, look.colors[1]);
          g.addColorStop(1, look.colors[2]);
          ctx.fillStyle = g;
          ctx.strokeStyle = "rgba(60,0,15,.6)";
          ctx.lineWidth = 0.8;
          ctx.fillRect(-3 * k, -3 * k, 6 * k, 6 * k);
          ctx.strokeRect(-3 * k, -3 * k, 6 * k, 6 * k);
          ctx.restore();
        }
        break;
      case "leaves":
        for (const a of angles(8)) {
          ctx.save();
          ctx.translate(cx + Math.cos(a) * (r + 2 * k), cy + Math.sin(a) * (r + 2 * k));
          ctx.rotate(a);
          ctx.fillStyle = look.colors[1];
          ctx.beginPath();
          ctx.ellipse(0, 0, 5 * k, 2.2 * k, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
        break;
      case "sparkles":
        for (let i = 0; i < 4; i++) {
          const a = t * 0.8 + i * Math.PI / 2;
          const s = (3 + Math.sin(t * 5 + i) * 1.2) * k;
          drawSparkle(
            cx + Math.cos(a) * (r + 3 * k),
            cy + Math.sin(a) * (r + 3 * k),
            s,
            i % 2 ? "#ffffff" : look.colors[0]
          );
        }
        break;
      case "flames":
        for (const a of angles(12)) {
          const flick = 0.5 + 0.5 * Math.sin(t * 9 + a * 3);
          const h = (4 + flick * 4) * k;
          ctx.save();
          ctx.translate(cx + Math.cos(a) * r, cy + Math.sin(a) * r);
          ctx.rotate(a + Math.PI / 2);
          const g = ctx.createLinearGradient(0, 0, 0, -h);
          g.addColorStop(0, look.colors[1]);
          g.addColorStop(1, "rgba(255,240,150,0)");
          ctx.fillStyle = g;
          ctx.beginPath();
          ctx.moveTo(-2.6 * k, 0);
          ctx.quadraticCurveTo(-2.6 * k, -h * 0.6, 0, -h);
          ctx.quadraticCurveTo(2.6 * k, -h * 0.6, 2.6 * k, 0);
          ctx.closePath();
          ctx.fill();
          ctx.restore();
        }
        break;
      case "hearts":
        for (const a of angles(6)) {
          drawHeart(cx + Math.cos(a) * (r + 3 * k), cy + Math.sin(a) * (r + 3 * k), 2.6 * k, look.colors[1]);
        }
        break;
      case "waves":
        ctx.strokeStyle = look.colors[1];
        ctx.lineWidth = 1.6 * k;
        ctx.globalAlpha = 0.9;
        ctx.beginPath();
        for (let i = 0; i <= 120; i++) {
          const a = i / 120 * Math.PI * 2;
          const rr = r + 3 * k + Math.sin(a * 6 + t * 3) * 1.6 * k;
          const x = cx + Math.cos(a) * rr;
          const y = cy + Math.sin(a) * rr;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.stroke();
        ctx.globalAlpha = 1;
        break;
      case "rays":
        ctx.lineCap = "round";
        for (const a0 of angles(12)) {
          const a = a0 + t * 0.4;
          const len = (5 + Math.sin(t * 4 + a0) * 1.5) * k;
          ctx.strokeStyle = "rgba(255,224,102,.9)";
          ctx.lineWidth = 1.6 * k;
          ctx.beginPath();
          ctx.moveTo(cx + Math.cos(a) * (r + 2 * k), cy + Math.sin(a) * (r + 2 * k));
          ctx.lineTo(cx + Math.cos(a) * (r + 2 * k + len), cy + Math.sin(a) * (r + 2 * k + len));
          ctx.stroke();
        }
        break;
      case "neon":
        ctx.shadowColor = look.glow;
        ctx.shadowBlur = 12;
        ctx.strokeStyle = `rgba(124,255,107,${0.35 + 0.25 * Math.sin(t * 4)})`;
        ctx.lineWidth = 2 * k;
        ctx.beginPath();
        ctx.arc(cx, cy, r + 4 * k + Math.sin(t * 4) * k, 0, Math.PI * 2);
        ctx.stroke();
        break;
      case "stars":
        for (const a of angles(6)) {
          const x = cx + Math.cos(a) * (r + 2 * k), y = cy + Math.sin(a) * (r + 2 * k);
          const tw = 0.6 + 0.4 * Math.sin(t * 3 + a * 2);
          ctx.save();
          ctx.translate(x, y);
          ctx.rotate(t * 0.8 + a);
          ctx.fillStyle = hexToRgba(look.colors[0], tw);
          ctx.beginPath();
          for (let i = 0; i < 10; i++) {
            const rr = (i % 2 === 0 ? 3.4 : 1.5) * k;
            const aa = i * Math.PI / 5;
            ctx.lineTo(Math.cos(aa) * rr, Math.sin(aa) * rr);
          }
          ctx.closePath();
          ctx.fill();
          ctx.restore();
        }
        break;
      case "bolts":
        ctx.strokeStyle = look.glow;
        ctx.lineWidth = 1.4 * k;
        ctx.shadowColor = look.glow;
        ctx.shadowBlur = 6;
        for (const a of angles(6)) {
          const flick = 0.5 + 0.5 * Math.sin(t * 6 + a * 3);
          ctx.globalAlpha = 0.35 + 0.65 * flick;
          ctx.beginPath();
          const x0 = cx + Math.cos(a) * r, y0 = cy + Math.sin(a) * r;
          ctx.moveTo(x0, y0);
          ctx.lineTo(x0 + Math.cos(a + 0.5) * 3 * k, y0 + Math.sin(a + 0.5) * 3 * k);
          ctx.lineTo(x0 + Math.cos(a - 0.3) * 3 * k + Math.cos(a) * 4 * k, y0 + Math.sin(a - 0.3) * 3 * k + Math.sin(a) * 4 * k);
          ctx.stroke();
        }
        ctx.globalAlpha = 1;
        ctx.shadowBlur = 0;
        break;
      case "thorns":
        for (const a of angles(12)) {
          ctx.save();
          ctx.translate(cx + Math.cos(a) * r, cy + Math.sin(a) * r);
          ctx.rotate(a);
          ctx.fillStyle = look.colors[2];
          ctx.beginPath();
          ctx.moveTo(-2 * k, -2 * k);
          ctx.lineTo(4.5 * k, 0);
          ctx.lineTo(-2 * k, 2 * k);
          ctx.closePath();
          ctx.fill();
          ctx.restore();
        }
        break;
      case "firefly":
        ctx.strokeStyle = hexToRgba(look.colors[0], 0.85);
        ctx.lineWidth = 1 * k;
        for (let i = 0; i < 8; i++) {
          const a = i / 8 * Math.PI * 2;
          const rise = (t * 0.5 + i / 8) % 1;
          const bx = cx + Math.cos(a) * (r + 3 * k), by = cy + Math.sin(a) * (r + 3 * k) - rise * 4 * k;
          ctx.beginPath();
          ctx.arc(bx, by, (1.2 + i % 3 * 0.5) * k, 0, Math.PI * 2);
          ctx.stroke();
        }
        break;
      case "snowflakes":
        ctx.strokeStyle = "rgba(235,250,255,.95)";
        ctx.lineWidth = 1 * k;
        for (const a of angles(6)) {
          ctx.save();
          ctx.translate(cx + Math.cos(a) * (r + 2 * k), cy + Math.sin(a) * (r + 2 * k));
          ctx.rotate(t * 0.6 + a);
          for (let i = 0; i < 3; i++) {
            ctx.rotate(Math.PI / 3);
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(0, 3.6 * k);
            ctx.stroke();
          }
          ctx.restore();
        }
        break;
      case "hexagons":
        ctx.strokeStyle = look.colors[1];
        ctx.lineWidth = 1 * k;
        for (const a of angles(10)) {
          ctx.save();
          ctx.translate(cx + Math.cos(a) * (r + 3 * k), cy + Math.sin(a) * (r + 3 * k));
          ctx.rotate(a);
          ctx.beginPath();
          for (let i = 0; i < 6; i++) {
            const aa = i * Math.PI / 3;
            const rr = 2.6 * k;
            if (i === 0) ctx.moveTo(Math.cos(aa) * rr, Math.sin(aa) * rr);
            else ctx.lineTo(Math.cos(aa) * rr, Math.sin(aa) * rr);
          }
          ctx.closePath();
          ctx.stroke();
          ctx.restore();
        }
        break;
      case "dots":
        for (let i = 0; i < 24; i++) {
          const a = i / 24 * Math.PI * 2;
          const rr = r + (i % 2 ? 2.5 : 4) * k;
          const pulse = 0.55 + 0.45 * Math.sin(t * 2 + i * 0.6);
          ctx.fillStyle = hexToRgba(look.colors[0], pulse);
          ctx.beginPath();
          ctx.arc(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr, 0.9 * k, 0, Math.PI * 2);
          ctx.fill();
        }
        break;
      case "runes":
        ctx.strokeStyle = look.glow;
        ctx.lineWidth = 1.2 * k;
        for (const a of angles(8)) {
          ctx.save();
          ctx.translate(cx + Math.cos(a) * (r + 3 * k), cy + Math.sin(a) * (r + 3 * k));
          ctx.rotate(a + Math.PI / 2);
          ctx.beginPath();
          ctx.moveTo(-2 * k, -3 * k);
          ctx.lineTo(0, 0);
          ctx.lineTo(2 * k, -3 * k);
          ctx.moveTo(0, 0);
          ctx.lineTo(0, 3.5 * k);
          ctx.stroke();
          ctx.restore();
        }
        break;
    }
    ctx.restore();
  }
  function drawExtrasBack(cx, cy, r, look, t) {
    const k = r / 24;
    const extras = look.extras || [];
    ctx.save();
    if (extras.includes("aura")) {
      const pulse = 0.5 + 0.5 * Math.sin(t * 2.5);
      const g = ctx.createRadialGradient(cx, cy, r * 0.9, cx, cy, r * 1.9);
      g.addColorStop(0, hexToRgba(look.glow, 0.05));
      g.addColorStop(0.6, hexToRgba(look.glow, 0.25 + 0.15 * pulse));
      g.addColorStop(1, hexToRgba(look.glow, 0));
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(cx, cy, r * 1.9, 0, Math.PI * 2);
      ctx.fill();
    }
    if (extras.includes("haloring")) {
      const pulse = 0.5 + 0.5 * Math.sin(t * 2.2);
      for (let layer = 0; layer < 2; layer++) {
        ctx.globalAlpha = (0.3 - layer * 0.1) * (0.65 + 0.35 * pulse);
        ctx.lineWidth = (1.9 - layer * 0.6) * k;
        ctx.strokeStyle = look.glow;
        ctx.beginPath();
        ctx.arc(cx, cy, r + (7 + layer * 5) * k, 0, Math.PI * 2);
        ctx.stroke();
      }
      for (let i = 0; i < 4; i++) {
        const a = t * 0.8 + i / 4 * Math.PI * 2;
        const rad = r + 10 * k;
        ctx.globalAlpha = 0.55 + 0.35 * Math.sin(t * 2 + i);
        ctx.fillStyle = look.glow;
        ctx.beginPath();
        ctx.arc(cx + Math.cos(a) * rad, cy + Math.sin(a) * rad, 1.5 * k, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    }
    ctx.restore();
  }
  function drawExtrasFront(cx, cy, r, look, t) {
    const k = r / 24;
    const extras = look.extras || [];
    ctx.save();
    if (extras.includes("comet")) {
      const a = t * 1.4;
      for (let i = 0; i < 10; i++) {
        const aa = a - i * 0.08;
        ctx.fillStyle = hexToRgba(look.glow, (1 - i / 10) * 0.8);
        ctx.beginPath();
        ctx.arc(cx + Math.cos(aa) * (r + 4 * k), cy + Math.sin(aa) * (r + 4 * k), (2.2 - i * 0.18) * k, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.arc(cx + Math.cos(a) * (r + 4 * k), cy + Math.sin(a) * (r + 4 * k), 1.3 * k, 0, Math.PI * 2);
      ctx.fill();
    }
    if (extras.includes("petals")) {
      for (let i = 0; i < 6; i++) {
        const a = i / 6 * Math.PI * 2 + t * 0.5;
        ctx.save();
        ctx.translate(cx + Math.cos(a) * (r + 3 * k), cy + Math.sin(a) * (r + 3 * k));
        ctx.rotate(a + Math.PI / 2);
        ctx.fillStyle = hexToRgba(look.colors[0], 0.75);
        ctx.beginPath();
        ctx.ellipse(0, 0, 2.6 * k, 1.3 * k, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }
    if (extras.includes("shards")) {
      for (let i = 0; i < 6; i++) {
        const a = i / 6 * Math.PI * 2 - t * 0.4;
        const rr = r + (4 + 1.5 * Math.sin(t * 2 + i)) * k;
        ctx.save();
        ctx.translate(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr);
        ctx.rotate(a + t);
        ctx.fillStyle = "rgba(255,255,255,.85)";
        ctx.beginPath();
        ctx.moveTo(0, -2.6 * k);
        ctx.lineTo(1.4 * k, 1.6 * k);
        ctx.lineTo(-1.4 * k, 1.6 * k);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      }
    }
    if (extras.includes("sparks")) {
      for (let i = 0; i < 6; i++) {
        const a = t * 1.6 + i / 6 * Math.PI * 2;
        const rr = r + (3 + 2 * Math.sin(t * 5 + i)) * k;
        ctx.fillStyle = hexToRgba(look.colors[0], 0.6 + 0.4 * Math.sin(t * 7 + i));
        ctx.beginPath();
        ctx.arc(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr, 1.1 * k, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    if (extras.includes("shock")) {
      for (let i = 0; i < 2; i++) {
        const p = (t * 0.7 + i * 0.5) % 1;
        ctx.strokeStyle = hexToRgba(look.glow, 0.7 * (1 - p));
        ctx.lineWidth = 1.5 * k;
        ctx.beginPath();
        ctx.arc(cx, cy, r + p * 10 * k, 0, Math.PI * 2);
        ctx.stroke();
      }
    }
    if (extras.includes("aurora")) {
      const cols = [look.colors[0], look.glow, look.colors[1], "#ffffff"];
      for (let i = 0; i < 4; i++) {
        const start = t * 0.9 + i * Math.PI / 2;
        ctx.strokeStyle = hexToRgba(cols[i], 0.85);
        ctx.lineWidth = 2 * k;
        ctx.beginPath();
        ctx.arc(cx, cy, r + 3 * k, start, start + Math.PI / 3);
        ctx.stroke();
      }
    }
    if (extras.includes("twinkle")) {
      for (let i = 0; i < 5; i++) {
        const a = i * 1.257 + 0.4;
        const s = (1.5 + 1.5 * (0.5 + 0.5 * Math.sin(t * 3 + i * 2))) * k;
        drawSparkle(cx + Math.cos(a) * (r + 8 * k), cy + Math.sin(a) * (r + 8 * k), s, "#ffffff");
      }
    }
    if (extras.includes("halo")) {
      const y = cy - r - 17 * k + Math.sin(t * 2) * 0.8 * k;
      ctx.shadowColor = look.glow;
      ctx.shadowBlur = 8;
      ctx.strokeStyle = look.colors[0];
      ctx.lineWidth = 2 * k;
      ctx.beginPath();
      ctx.ellipse(cx, y, 9 * k, 3 * k, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.shadowBlur = 0;
    }
    for (const e of extras) if (FX_SPECS[e]) drawModernFx(ctx, e, cx, cy, r, look, t);
    ctx.restore();
  }