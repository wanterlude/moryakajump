  function clipOutsideAvatar(cx, cy, r) {
    ctx.beginPath();
    ctx.rect(cx - r * 3, cy - r * 3, r * 6, r * 6);
    ctx.arc(cx, cy, r, 0, Math.PI * 2, true);
    ctx.clip();
  }
  function drawFrame(cx, cy, radius, frameId, compact = false) {
    const frame = FRAMES.find((item) => item.id === frameId);
    if (!frame || !frame.look) return;
    const t = frameNow();
    if (compact) {
      drawFrameRing(cx, cy, radius, frame.look, t);
      drawOrnaments(cx, cy, radius, frame.look, t);
      return;
    }
    ctx.save();
    clipOutsideAvatar(cx, cy, radius);
    drawExtrasBack(cx, cy, radius, frame.look, t);
    ctx.restore();
    drawFrameRing(cx, cy, radius, frame.look, t);
    drawOrnaments(cx, cy, radius, frame.look, t);
    ctx.save();
    clipOutsideAvatar(cx, cy, radius);
    drawExtrasFront(cx, cy, radius, frame.look, t);
    ctx.restore();
  }
  // Версия игры: показывается в правом нижнем углу главного меню.
  var GAME_VERSION = "1.0.73";
  var MENU = {
    padX: 20,
    titleY: 20,
    tabsY: 40,
    tabsH: 32,
    showcaseY: 80,
    showcaseH: 172,
    gridY: 260,
    gridH: 226,
    cols: 5,
    cardW: 64,
    cardH: 78,
    gapX: 8,
    gapY: 10,
    barY: 494,
    barH: 52
  };
  // Иконки в главном меню: настройки и глобальный рейтинг.
  // Иконки меню: 22×22 — примерно на 15% меньше прежних 26×26.
  var MENU_GEAR = { x: 223, y: 13, w: 22, h: 22 };
  var MENU_LB = { x: 249, y: 13, w: 22, h: 22 };
  var MENU_PROFILE = { x: 275, y: 13, w: 22, h: 22 };
  function updateMenuIconRects() {
    const label = fmt(bankCoins);
    setFont(11, "bold");
    const tw = trackedWidth(label, 0.4);
    const chipW = 30 + tw + 12;
    const chipX = WORLD_W - MENU.padX - chipW;
    const size = 22, gap = 4;
    const profileX = chipX - 8 - size;
    const lbX = profileX - gap - size;
    const gearX = lbX - gap - size;
    const y = MENU.titleY - 11;
    MENU_GEAR = { x: gearX, y, w: size, h: size };
    MENU_LB = { x: lbX, y, w: size, h: size };
    MENU_PROFILE = { x: profileX, y, w: size, h: size };
  }
  var menuCursors = {
    avatars: selectedAvatar,
    shop: Math.max(0, FRAMES.findIndex((f) => f.id === selectedFrame)),
    platforms: 0
  };
  var menuState = {
    tab: "avatars",
    scroll: 0,
    dragging: false,
    dragStartY: 0,
    dragScrollStart: 0,
    dragMoved: 0,
    pointerId: null,
    fadeT: 1,
    tabAnim: 0,
    pressIndex: -1,
    pressT: 0,
    swipe: 0,
    swiping: false,
    swipeStartX: 0,
    swipeStartY: 0,
    swipeFrom: 0,
    swipeMovedX: 0,
    swipeVel: 0,
    swipeMode: "drag",
    swipeTrail: []
  };
  var bossTrainOpen = false;
  var trainingState = { active: false, index: 0 };
  function menuTabCount() {
    return menuState.tab === "shop" ? FRAMES.length : avatarImages.length;
  }
  function menuCursor() {
    return menuCursors[menuState.tab];
  }
  function gridRowH() {
    return MENU.cardH + MENU.gapY;
  }
  function gridLeft() {
    const rowW = MENU.cols * MENU.cardW + (MENU.cols - 1) * MENU.gapX;
    return MENU.padX + (WORLD_W - MENU.padX * 2 - rowW) / 2;
  }
  function gridHeight() {
    return Math.ceil(menuTabCount() / MENU.cols) * gridRowH();
  }
  function menuMaxScroll() {
    return Math.max(0, gridHeight() - MENU.gridH);
  }
  function clampScroll() {
    menuState.scroll = Math.max(0, Math.min(menuMaxScroll(), menuState.scroll));
  }
  function revealCursor(index) {
    const rowTop = Math.floor(index / MENU.cols) * gridRowH();
    const rowBottom = rowTop + MENU.cardH;
    if (rowTop < menuState.scroll) menuState.scroll = rowTop;
    else if (rowBottom > menuState.scroll + MENU.gridH) {
      menuState.scroll = rowBottom - MENU.gridH;
    }
    clampScroll();
  }
  function setMenuCursor(index, reveal = false) {
    const next = Math.max(0, Math.min(menuTabCount() - 1, index));
    if (next === menuCursor()) return;
    menuCursors[menuState.tab] = next;
    menuState.fadeT = 0;
    if (reveal) revealCursor(next);
  }
  function switchMenuTab(tab) {
    if (menuState.tab === tab) return;
    menuState.tab = tab;
    menuState.scroll = 0;
    menuState.fadeT = 0;
    clampScroll();
    if (tab === "shop") gachaPickerRevealSelected();
    sfx.click();
  }
  function menuTabIndex(tab) {
    return Math.max(0, MENU_TABS.findIndex((t) => t.id === tab));
  }
  function menuSwipeTarget() {
    return -menuTabIndex(menuState.tab);
  }
  function withMenuTab(tab, fn) {
    const prev = menuState.tab;
    menuState.tab = tab;
    try {
      fn();
    } finally {
      menuState.tab = prev;
    }
  }
  var MENU_SWIPE = {
    /** Жёсткость пружины: выше — быстрее доезжает. */
    stiffness: 150,
    /** Затухание: 2·√stiffness даёт critical damping, без перелёта. */
    damping: 24,
    /** Доля ширины экрана, с которой жест считается переключением. */
    commitRatio: 0.25,
    /** Скорость флика, px/мс, при которой переключаем даже короткий жест. */
    flickSpeed: 0.55,
    /**
     * Клик по вкладке: переход в 5 раз быстрее свайпа (замер: 5.00).
     * Подобрано замером кадров до 99% при реальном dt из draw():
     * клик 7 кадров (≈117 мс), свайп 35 кадров (≈584 мс).
     */
    clickStiffnessMul: 20,
    clickDampingMul: 4,
    /** Сколько последних точек учитывать для скорости. */
    velocityWindowMs: 90
  };
  function cardAtPoint(point) {
    if (point.y < MENU.gridY || point.y > MENU.gridY + MENU.gridH) return -1;
    const left = gridLeft();
    const localX = point.x - left;
    if (localX < 0) return -1;
    const pitch = MENU.cardW + MENU.gapX;
    const col = Math.floor(localX / pitch);
    if (col >= MENU.cols) return -1;
    if (localX - col * pitch > MENU.cardW) return -1;
    const localY = point.y - MENU.gridY + menuState.scroll;
    const row = Math.floor(localY / gridRowH());
    if (row < 0) return -1;
    if (localY - row * gridRowH() > MENU.cardH) return -1;
    const index = row * MENU.cols + col;
    return index < menuTabCount() ? index : -1;
  }
  function menuItemUnlocked(index) {
    return menuState.tab === "shop" ? ownedFrames.includes(FRAMES[index].id) : unlockedAvatars.includes(index);
  }
  function menuItemWorn(index) {
    return menuState.tab === "shop" ? selectedFrame === FRAMES[index].id : selectedAvatar === index;
  }
  var FRAME_RARITY = (frame) => frame.price === 0 ? "\u0411\u0410\u0417\u041E\u0412\u0410\u042F" : frame.price < 100 ? "\u041E\u0411\u042B\u0427\u041D\u0410\u042F" : frame.price < 200 ? "\u0420\u0415\u0414\u041A\u0410\u042F" : frame.price < 340 ? "\u042D\u041F\u0418\u0427\u0415\u0421\u041A\u0410\u042F" : frame.price < 560 ? "\u041B\u0415\u0413\u0415\u041D\u0414\u0410\u0420\u041D\u0410\u042F" : "\u0411\u041E\u0416\u0415\u0421\u0422\u0412\u0415\u041D\u041D\u0410\u042F";
  var EXTRAS_LABELS = {
    aura: "\u0441\u0432\u0435\u0447\u0435\u043D\u0438\u0435",
    haloring: "\u043E\u0440\u0435\u043E\u043B \u0432\u043E\u043A\u0440\u0443\u0433",
    aurora: "\u0441\u0438\u044F\u043D\u0438\u0435",
    twinkle: "\u0437\u0432\u0451\u0437\u0434\u044B",
    shock: "\u0432\u043E\u043B\u043D\u044B",
    halo: "\u043E\u0440\u0435\u043E\u043B",
    sparks: "\u0438\u0441\u043A\u0440\u044B",
    comet: "\u043A\u043E\u043C\u0435\u0442\u0430",
    petals: "\u043B\u0435\u043F\u0435\u0441\u0442\u043A\u0438",
    shards: "\u043E\u0441\u043A\u043E\u043B\u043A\u0438"
  };
  var ALL_EXTRA_LABELS = { ...EXTRAS_LABELS, ...FX_LABELS };
  function menuPrimary() {
    const i = menuCursor();
    if (!unlockedAvatars.includes(i)) return { label: "\u0417\u0410\u041A\u0420\u042B\u0422\u041E", enabled: false };
    if (selectedAvatar === i) return { label: "ВЫБРАН", enabled: false, passive: true };
    return { label: "\u0412\u042B\u0411\u0420\u0410\u0422\u042C", enabled: true };
  }
  function runPrimary() {
    const i = menuCursor();
    if (!unlockedAvatars.includes(i)) {
      const need = AVATAR_SCORES[i];
      setMenuMessage(
        "\u0410\u0432\u0430\u0442\u0430\u0440 \u0437\u0430\u043A\u0440\u044B\u0442",
        "\u041D\u0443\u0436\u0435\u043D \u0440\u0435\u043A\u043E\u0440\u0434 " + fmt(need) + " \xB7 \u043D\u0435 \u0445\u0432\u0430\u0442\u0430\u0435\u0442 " + fmt(Math.max(0, need - highScore))
      );
      sfx.click();
      return;
    }
    if (selectedAvatar === i) {
      sfx.click();
      return;
    }
    selectedAvatar = i;
    saveProgress();
    setMenuMessage("Аватар выбран", avatarName(i));
    sfx.click();
  }
  function drawMenuGateIcon(cx, cy, s) {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(s, s);
    const g = ctx.createLinearGradient(-16, -16, 16, 16);
    g.addColorStop(0, "#f4fdff");
    g.addColorStop(0.45, "#bfe5f2");
    g.addColorStop(1, "#5f9bb7");
    ctx.fillStyle = g;
    roundedRect(-15, -16, 6, 30, 3);
    ctx.fill();
    roundedRect(9, -16, 6, 30, 3);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(-15, -8);
    ctx.quadraticCurveTo(0, -30, 15, -8);
    ctx.lineTo(15, -1);
    ctx.quadraticCurveTo(0, -23, -15, -1);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "rgba(8,30,48,.8)";
    ctx.beginPath();
    ctx.moveTo(-8, 14);
    ctx.lineTo(-8, -4);
    ctx.quadraticCurveTo(0, -14, 8, -4);
    ctx.lineTo(8, 14);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#ffc247";
    ctx.beginPath();
    ctx.arc(-3, -1, 1.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(3, -1, 1.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.ellipse(-11, -16, 5, 2.2, -0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(11, -16, 5, 2.2, 0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
  function drawMenuChestIcon(cx, cy, s) {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(s, s);
    const body = ctx.createLinearGradient(0, -10, 0, 14);
    body.addColorStop(0, "#c98f58");
    body.addColorStop(0.55, "#9a6039");
    body.addColorStop(1, "#6a4128");
    ctx.fillStyle = body;
    roundedRect(-16, -6, 32, 20, 4);
    ctx.fill();
    const lid = ctx.createLinearGradient(0, -18, 0, -4);
    lid.addColorStop(0, "#d8a06a");
    lid.addColorStop(1, "#8f5834");
    ctx.fillStyle = lid;
    ctx.beginPath();
    ctx.moveTo(-16, -6);
    ctx.quadraticCurveTo(-16, -18, 0, -18);
    ctx.quadraticCurveTo(16, -18, 16, -6);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#e0b45c";
    ctx.fillRect(-16, -7, 32, 2.4);
    ctx.fillRect(-3, -18, 6, 32);
    ctx.fillStyle = "#f2c14e";
    roundedRect(-4, 1, 8, 8, 2);
    ctx.fill();
    ctx.fillStyle = "#6a4128";
    ctx.beginPath();
    ctx.arc(0, 4.5, 1.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.ellipse(0, -18, 12, 2.6, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
  function drawMenuObjectButton(x, y, w, h, label, type) {
    const hovered = pauseState.hover === "menu-btn-" + label;
    uiPill(x, y, w, h, {
      fill: hovered ? UI.surfaceSolid : "rgba(255,255,255,.62)",
      radius: 13
    });
    const cx = x + w / 2;
    if (type === "gate") drawMenuGateIcon(cx, y + 24, 0.78);
    else drawMenuChestIcon(cx, y + 21, 0.78);
    setFont(type === "chest" ? 6.0 : 6.4, "bold");
    ctx.fillStyle = UI.ink;
    trackedText(label, cx, y + h - 9, type === "chest" ? 0.2 : 0.4);
  }
  // Плоские тона кнопок: сплошная заливка, мягкая тень, светлая обводка.
  // Раньше здесь была «казуальная» 3D-кнопка с рантом и бликом — она выбивалась
  // из плоских карточек и капсул остального интерфейса.
  var CASUAL_BUTTON_TONES = {
    blue: { fill: "#1a78b0", hover: "#1d88c4", shadow: "rgba(26,120,176,.34)", ink: "#ffffff" },
    green: { fill: "#0f7f6b", hover: "#119078", shadow: "rgba(15,127,107,.32)", ink: "#ffffff" },
    gold: { fill: "#d99a1f", hover: "#e6a628", shadow: "rgba(217,154,31,.36)", ink: "#3d2600" },
    // Приглушённые: морозное стекло с цветным текстом. Ими рисуются «Играть»
    // и «Крутить», чтобы они не перетягивали внимание с карточек.
    ghostBlue: { fill: "rgba(255,255,255,.5)", hover: "rgba(255,255,255,.74)", shadow: "rgba(10,40,62,.16)", ink: "#15608d", border: "rgba(21,96,141,.24)" },
    ghostGreen: { fill: "rgba(255,255,255,.5)", hover: "rgba(255,255,255,.74)", shadow: "rgba(10,40,62,.16)", ink: "#0b6b59", border: "rgba(11,107,89,.24)" },
    ghostGold: { fill: "rgba(255,255,255,.5)", hover: "rgba(255,255,255,.74)", shadow: "rgba(10,40,62,.16)", ink: "#6b4100", border: null },
    dim: { fill: "rgba(255,255,255,.62)", hover: "rgba(255,255,255,.62)", shadow: "rgba(8,28,48,.12)", ink: "rgba(21,85,118,.5)" }
  };
  function drawCasualButtonBase(x, y, w, h, toneKey, hovered, glowBoost = 0) {
    const t = CASUAL_BUTTON_TONES[toneKey] || CASUAL_BUTTON_TONES.blue;
    const dim = toneKey === "dim";
    const r = h / 2;
    ctx.save();
    ctx.shadowColor = t.shadow;
    ctx.shadowBlur = (hovered ? 14 : 10) + glowBoost;
    ctx.shadowOffsetY = hovered ? 4 : 3;
    roundedRect(x, y, w, h, r);
    ctx.fillStyle = hovered ? t.hover : t.fill;
    ctx.fill();
    ctx.shadowColor = "transparent";
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;
    // border: null — рисовать без обводки (золотая кнопка держится на тени).
    const stroke = t.border !== undefined ? t.border : dim ? "rgba(15,61,92,.12)" : "rgba(255,255,255,.22)";
    if (stroke) {
      roundedRect(x + 0.6, y + 0.6, w - 1.2, h - 1.2, r - 0.6);
      ctx.strokeStyle = stroke;
      ctx.lineWidth = 1.2;
      ctx.stroke();
    }
    ctx.restore();
  }
  function drawCasualIcon(icon, cx, cy, r, fg) {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.fillStyle = fg;
    ctx.strokeStyle = fg;
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    if (icon === "play") {
      ctx.beginPath();
      ctx.moveTo(-r * 0.34, -r * 0.52);
      ctx.lineTo(r * 0.56, 0);
      ctx.lineTo(-r * 0.34, r * 0.52);
      ctx.closePath();
      ctx.fill();
    } else if (icon === "spin") {
      ctx.lineWidth = Math.max(1.3, r * 0.16);
      for (let i = 0; i < 3; i++) {
        const a = i * Math.PI / 3;
        const dx = Math.cos(a), dy = Math.sin(a);
        ctx.beginPath();
        ctx.moveTo(-dx * r * 0.72, -dy * r * 0.72);
        ctx.lineTo(dx * r * 0.72, dy * r * 0.72);
        ctx.stroke();
        for (const side of [-1, 1]) {
          const bx = dx * r * 0.38 * side;
          const by = dy * r * 0.38 * side;
          const px = -dy * r * 0.24;
          const py = dx * r * 0.24;
          ctx.beginPath();
          ctx.moveTo(bx, by);
          ctx.lineTo(bx + px, by + py);
          ctx.moveTo(bx, by);
          ctx.lineTo(bx - px, by - py);
          ctx.stroke();
        }
      }
    } else if (icon === "coin") {
      const cg = ctx.createRadialGradient(-r * 0.3, -r * 0.3, 0.5, 0, 0, r * 0.72);
      cg.addColorStop(0, "#fff7c2");
      cg.addColorStop(0.6, "#ffd34e");
      cg.addColorStop(1, "#e39a00");
      ctx.beginPath();
      ctx.arc(0, 0, r * 0.68, 0, Math.PI * 2);
      ctx.fillStyle = cg;
      ctx.fill();
      ctx.strokeStyle = "rgba(120,70,0,.5)";
      ctx.lineWidth = 1;
      ctx.stroke();
    } else if (icon === "frame") {
      ctx.lineWidth = Math.max(1.2, r * 0.16);
      roundedRect(-r * 0.55, -r * 0.62, r * 1.1, r * 1.24, r * 0.22);
      ctx.stroke();
    } else if (icon === "platform") {
      roundedRect(-r * 0.66, -r * 0.22, r * 1.32, r * 0.44, r * 0.22);
      ctx.fill();
    } else if (icon === "check") {
      ctx.lineWidth = Math.max(1.6, r * 0.22);
      ctx.beginPath();
      ctx.moveTo(-r * 0.45, 0);
      ctx.lineTo(-r * 0.1, r * 0.36);
      ctx.lineTo(r * 0.5, -r * 0.4);
      ctx.stroke();
    } else if (icon === "lock") {
      roundedRect(-r * 0.5, -r * 0.08, r, r * 0.72, r * 0.14);
      ctx.fill();
      ctx.lineWidth = Math.max(1.2, r * 0.16);
      ctx.beginPath();
      ctx.arc(0, -r * 0.08, r * 0.35, Math.PI, 0);
      ctx.stroke();
    }
    ctx.restore();
  }
  function drawCasualIconMedallion(icon, cx, cy, r, fg) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(255,255,255,.16)";
    ctx.fill();
    drawCasualIcon(icon, cx, cy, r * 0.86, fg);
    ctx.restore();
  }
  function drawCasualLabel(text, cx, cy, size, tracking, color) {
    ctx.save();
    ctx.textBaseline = "middle";
    setFont(size, "bold");
    ctx.fillStyle = color;
    trackedText(text, cx, cy, tracking);
    ctx.restore();
  }
  function drawMenuButton(x, y, w, h, label, tone = "green", options = {}) {
    const { size = 12, tracking = 1.6, sub = "", icon = null, dim = false, hoverKey = null } = options;
    const hovered = pauseState.hover === (hoverKey || "menu-btn-" + label) && !dim;
    const key = dim ? "dim" : tone;
    drawCasualButtonBase(x, y, w, h, key, hovered);
    const fg = (CASUAL_BUTTON_TONES[key] || CASUAL_BUTTON_TONES.blue).ink;
    const cy = y + h / 2 + (sub ? -4 : 0);
    const medR = Math.min(12, h * 0.24);
    const gap = 8;
    setFont(size, "bold");
    const labelW = trackedWidth(label, tracking);
    if (icon) {
      const groupW = medR * 2 + gap + labelW;
      const gx = x + (w - groupW) / 2;
      drawCasualIconMedallion(icon, gx + medR, cy, medR, fg);
      drawCasualLabel(label, gx + medR * 2 + gap + labelW / 2, cy, size, tracking, fg);
    } else {
      drawCasualLabel(label, x + w / 2, cy, size, tracking, fg);
    }
    if (sub) {
      ctx.save();
      ctx.textBaseline = "middle";
      setFont(6.6, "bold");
      ctx.fillStyle = dim ? "rgba(21,85,118,.45)" : "rgba(255,255,255,.72)";
      trackedText(sub, x + w / 2, cy + 10, 1.6);
      ctx.restore();
    }
  }

  function drawMenuHeader() {
    ctx.save();
    ctx.textBaseline = "middle";
    setFont(15, "bold");
    ctx.fillStyle = "#0f3d5c";
    ctx.shadowColor = "rgba(255,255,255,.9)";
    ctx.shadowBlur = 12;
    trackedText("\u041C\u041E\u0420\u042F\u041A\u0410", MENU.padX, MENU.titleY, 2.2, "left");
    const shift = trackedWidth("\u041C\u041E\u0420\u042F\u041A\u0410", 2.2) + 7;
    ctx.shadowBlur = 0;
    const g = ctx.createLinearGradient(0, MENU.titleY - 9, 0, MENU.titleY + 9);
    g.addColorStop(0, "#1187c8");
    g.addColorStop(1, "#0a4e80");
    ctx.fillStyle = g;
    trackedText("JUMP", MENU.padX + shift, MENU.titleY, 2.2, "left");
    const label = fmt(bankCoins);
    setFont(11, "bold");
    const tw = trackedWidth(label, 0.4);
    const chipW = 30 + tw + 12;
    const chipX = WORLD_W - MENU.padX - chipW;
    drawHudChip(chipX, MENU.titleY - 11, chipW, 22, null);
    drawCoinBadge(chipX + 13, MENU.titleY, 7, 0);
    ctx.fillStyle = "#c28000";
    trackedText(label, chipX + chipW - 10, MENU.titleY + 0.5, 0.4, "right");
    ctx.restore();
  }
  function drawMenuIconChip(g) {
    roundedRect(g.x, g.y, g.w, g.h, Math.min(g.w, g.h) / 2);
    ctx.fillStyle = "rgba(255,255,255,.92)";
    ctx.fill();
    ctx.strokeStyle = "rgba(15,61,92,.2)";
    ctx.lineWidth = 1;
    ctx.stroke();
  }
  function menuIconScale(g, cx, cy) {
    const s = g.w / 26;
    ctx.translate(cx, cy);
    ctx.scale(s, s);
    ctx.translate(-cx, -cy);
  }
  function drawMenuGear() {
    const g = MENU_GEAR;
    ctx.save();
    drawMenuIconChip(g);
    const cx = g.x + g.w / 2;
    const cy = g.y + g.h / 2;
    menuIconScale(g, cx, cy);
    const teeth = 8;
    const step = Math.PI * 2 / teeth;
    const rOut = 9;
    const rIn = 6.4;
    ctx.strokeStyle = "#0f3d5c";
    ctx.lineWidth = 1.6;
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    ctx.beginPath();
    for (let i = 0; i < teeth; i++) {
      const a = i * step;
      const pts = [
        [rIn, a - 0.27],
        [rOut, a - 0.16],
        [rOut, a + 0.16],
        [rIn, a + 0.27]
      ];
      for (let j = 0; j < pts.length; j++) {
        const x = cx + Math.cos(pts[j][1]) * pts[j][0];
        const y = cy + Math.sin(pts[j][1]) * pts[j][0];
        if (i === 0 && j === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
    }
    ctx.closePath();
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(cx, cy, 2.9, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }
  function drawMenuProfile() {
    const g = MENU_PROFILE;
    ctx.save();
    drawMenuIconChip(g);
    const cx = g.x + g.w / 2;
    const cy = g.y + g.h / 2;
    menuIconScale(g, cx, cy);
    ctx.strokeStyle = "#0f3d5c";
    ctx.lineWidth = 1.5;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.arc(cx, cy - 3.4, 3.2, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(cx, cy + 6.4, 6.2, Math.PI * 1.12, Math.PI * 1.88);
    ctx.stroke();
    ctx.restore();
  }
  function drawMenuTrophy() {
    const g = MENU_LB;
    ctx.save();
    drawMenuIconChip(g);
    const cx = g.x + g.w / 2;
    const cy = g.y + g.h / 2;
    menuIconScale(g, cx, cy);
    ctx.strokeStyle = "#0f3d5c";
    ctx.lineWidth = 1.5;
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(cx - 4.6, cy - 6.2);
    ctx.lineTo(cx + 4.6, cy - 6.2);
    ctx.quadraticCurveTo(cx + 4.2, cy - 0.4, cx, cy + 1.4);
    ctx.quadraticCurveTo(cx - 4.2, cy - 0.4, cx - 4.6, cy - 6.2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cx - 4.6, cy - 5.2);
    ctx.bezierCurveTo(cx - 8.2, cy - 5.6, cx - 8.2, cy - 1.2, cx - 4.4, cy - 1.6);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cx + 4.6, cy - 5.2);
    ctx.bezierCurveTo(cx + 8.2, cy - 5.6, cx + 8.2, cy - 1.2, cx + 4.4, cy - 1.6);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cx, cy + 1.4);
    ctx.lineTo(cx, cy + 5.2);
    ctx.moveTo(cx - 3.6, cy + 5.9);
    ctx.lineTo(cx + 3.6, cy + 5.9);
    ctx.stroke();
    ctx.restore();
  }
  function menuActionButtons() {
    return [
      { id: "train", x: MENU.padX, y: MENU.barY, w: 60, h: MENU.barH, label: "БОССЫ" },
      { id: "play", x: 88, y: MENU.barY, w: 224, h: MENU.barH, label: "\u0418\u0413\u0420\u0410\u0422\u042C" },
      { id: "save", x: 320, y: MENU.barY, w: 60, h: MENU.barH, label: "СОХРАНИТЬ" }
    ];
  }
  function bossTrainRows() {
    const rows = [];
    for (let i = 0; i < DUEL_BOSS_DEFS.length; i++) {
      rows.push({ x: 46, y: 148 + i * 60, w: 308, h: 52 });
    }
    return rows;
  }
  function bossTrainBackRect() {
    return { x: 110, y: 452, w: 180, h: 38 };
  }
  function drawBossTrain() {
    const x = 30, y = 82, w = 340, h = 428;
    ctx.save();
    ctx.fillStyle = "rgba(8,28,46,.34)";
    ctx.fillRect(0, 0, WORLD_W, WORLD_H);
    ctx.save();
    ctx.shadowColor = "rgba(10,40,62,.22)";
    ctx.shadowBlur = 24;
    ctx.shadowOffsetY = 10;
    roundedRect(x, y, w, h, 22);
    ctx.fillStyle = "rgba(255,255,255,.97)";
    ctx.fill();
    ctx.restore();
    roundedRect(x + 0.75, y + 0.75, w - 1.5, h - 1.5, 21.5);
    ctx.strokeStyle = "rgba(255,255,255,.95)";
    ctx.lineWidth = 1.4;
    ctx.stroke();
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    setFont(18, "bold");
    ctx.fillStyle = "#0f3d5c";
    trackedText("ТРЕНИРОВКА", WORLD_W / 2, y + 30, 2.2);
    setFont(6.8, "bold");
    ctx.fillStyle = "rgba(21,85,118,.55)";
    trackedText("ВЫБЕРИ БОССА · БЕЗ НАГРАД И РЕКОРДОВ", WORLD_W / 2, y + 48, 0.9);
    const rows = bossTrainRows();
    for (let i = 0; i < DUEL_BOSS_DEFS.length; i++) {
      const r = rows[i];
      const def = DUEL_BOSS_DEFS[i];
      const hovered = pauseState.hover === "boss-train-" + i;
      uiPill(r.x, r.y, r.w, r.h, { fill: hovered ? "rgba(219,250,244,.96)" : "rgba(255,255,255,.72)", radius: 14 });
      const cx = r.x + 28;
      const cy = r.y + r.h / 2;
      ctx.beginPath();
      ctx.arc(cx, cy, 16, 0, Math.PI * 2);
      ctx.fillStyle = hexToRgba(def.accent || "#4fc3f7", 0.14);
      ctx.fill();
      ctx.strokeStyle = hexToRgba(def.accent || "#4fc3f7", 0.38);
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx, cy - 8);
      ctx.lineTo(cx + 8, cy);
      ctx.lineTo(cx, cy + 8);
      ctx.lineTo(cx - 8, cy);
      ctx.closePath();
      ctx.fillStyle = def.accent || "#4fc3f7";
      ctx.fill();
      ctx.textAlign = "left";
      setFont(11.5, "bold");
      ctx.fillStyle = "#0f3d5c";
      trackedText(def.name, r.x + 52, r.y + 20, 0.6, "left");
      setFont(6.2, "bold");
      ctx.fillStyle = "rgba(21,85,118,.55)";
      trackedText(def.subtitle, r.x + 52, r.y + 36, 0.5, "left");
      ctx.textAlign = "right";
      setFont(7, "bold");
      ctx.fillStyle = "rgba(21,85,118,.4)";
      trackedText("БОСС " + (i + 1), r.x + r.w - 12, cy, 0.8, "right");
    }
    const back = bossTrainBackRect();
    const backHover = pauseState.hover === "boss-train-back";
    uiPill(back.x, back.y, back.w, back.h, { fill: backHover ? UI.surfaceSolid : UI.surface, radius: 12 });
    setFont(9, "bold");
    ctx.textAlign = "center";
    ctx.fillStyle = UI.ink;
    trackedText("НАЗАД", WORLD_W / 2, back.y + back.h / 2, 1.6);
    ctx.restore();
  }
  function startTrainingBoss(index) {
    bossTrainOpen = false;
    trainingState.active = true;
    trainingState.index = index;
    stats.trainTries[index] = (stats.trainTries[index] || 0) + 1;
    saveStats();
    duelCancel();
    currentState = STATE.PLAYING;
    bossState.phase = "fight";
    bossState.index = index;
    perkState.offering = false;
    lastFrameTime = 0;
    clearTouchInput();
    duelStart(index, 5, 185);
    sfx.click();
  }
  function exitTraining() {
    trainingState.active = false;
    bossTrainOpen = false;
    bossState.phase = "idle";
    duelCancel();
    currentState = STATE.MENU;
    lastFrameTime = 0;
  }
  var MENU_TABS = [
    { id: "avatars", label: "\u0410\u0412\u0410\u0422\u0410\u0420\u042B" },
    { id: "shop", label: "\u0420\u0410\u041C\u041A\u0418" },
    { id: "platforms", label: "\u041F\u041B\u0410\u0422\u0424\u041E\u0420\u041C\u042B" }
  ];
  function menuTabAt(x) {
    const segW = (WORLD_W - MENU.padX * 2 - 8) / MENU_TABS.length;
    const k = Math.max(0, Math.min(MENU_TABS.length - 1, Math.floor((x - MENU.padX - 4) / segW)));
    return MENU_TABS[k].id;
  }
  function drawMenuTabs() {
    const x = MENU.padX;
    const y = MENU.tabsY;
    const w = WORLD_W - MENU.padX * 2;
    const h = MENU.tabsH;
    const segW = (w - 8) / MENU_TABS.length;
    uiPill(x, y, w, h, { fill: "rgba(255,255,255,.58)" });
    const ix = x + 4 + menuState.tabAnim * segW;
    uiAccentPill(ix, y + 4, segW, h - 8);
    ctx.save();
    ctx.textBaseline = "middle";
    for (let k = 0; k < MENU_TABS.length; k++) {
      const tab = MENU_TABS[k];
      const cx = x + 4 + segW * (k + 0.5);
      const active = menuState.tab === tab.id;
      setFont(9, "bold");
      ctx.fillStyle = active ? "#ffffff" : UI.inkSoft;
      trackedText(tab.label, cx, y + h / 2 + 0.5, 1.8);
    }
    ctx.restore();
  }
  function showcaseLayout() {
    const x = MENU.padX;
    const y = MENU.showcaseY;
    const w = WORLD_W - MENU.padX * 2;
    const h = MENU.showcaseH;
    return {
      x,
      y,
      w,
      h,
      /** Радиус аватара в витрине. */
      r: 34,
      /** Центр аватара и цветовой кольцевой рамки. */
      cy: y + 58,
      titleY: y + h - 48,
      subY: y + h - 36,
      meterTextY: y + h - 22,
      meterY: y + h - 11,
      locked: false
    };
  }
  // Кнопка выбора под именем аватара в витрине.
  function showcasePrimaryRect() {
    const L = showcaseLayout();
    const w = 132;
    return { x: L.x + (L.w - w) / 2, y: L.y + L.h - 38, w, h: 26 };
  }
  function drawShowcase() {
    const i = menuCursor();
    const isShop = menuState.tab === "shop";
    const x = MENU.padX;
    const y = MENU.showcaseY;
    const w = WORLD_W - MENU.padX * 2;
    const h = MENU.showcaseH;
    const frameId = isShop ? FRAMES[i].id : selectedFrame;
    const look = (FRAMES.find((f) => f.id === frameId) || {}).look || null;
    const glow = (a) => look ? hexToRgba(look.glow, a) : "rgba(30,110,150," + a + ")";
    const L = showcaseLayout();
    L.locked = !menuItemUnlocked(i);
    ctx.save();
    ctx.shadowColor = "rgba(18,70,110,.16)";
    ctx.shadowBlur = 20;
    ctx.shadowOffsetY = 8;
    roundedRect(x, y, w, h, 22);
    ctx.fillStyle = "rgba(255,255,255,.62)";
    ctx.fill();
    ctx.restore();
    ctx.save();
    roundedRect(x, y, w, h, 22);
    ctx.clip();
    const halo = ctx.createRadialGradient(200, L.cy, 8, 200, L.cy, 118);
    halo.addColorStop(0, glow(0.3));
    halo.addColorStop(0.55, glow(0.1));
    halo.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = halo;
    ctx.fillRect(x, y, w, h);
    ctx.restore();
    ctx.save();
    roundedRect(x + 0.75, y + 0.75, w - 1.5, h - 1.5, 22);
    ctx.strokeStyle = "rgba(255,255,255,.9)";
    ctx.lineWidth = 1.4;
    ctx.stroke();
    ctx.restore();
    const cx = 200;
    const cy = L.cy;
    const r = L.r;
    const locked = L.locked;
    const fade = menuState.fadeT;
    ctx.save();
    ctx.globalAlpha = fade;
    ctx.translate(0, (1 - fade) * 9);
    ctx.save();
    ctx.shadowColor = glow(0.55);
    ctx.shadowBlur = 26;
    ctx.fillStyle = "rgba(255,255,255,.9)";
    ctx.beginPath();
    ctx.arc(cx, cy, r + 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    drawAvatarCircle(cx, cy, r, isShop ? selectedAvatar : i);
    drawFrame(cx, cy, r, frameId);
    if (locked) {
      ctx.save();
      ctx.fillStyle = "rgba(10,40,60,.5)";
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fill();
      drawLockIcon(cx, cy, r * 0.46, "rgba(255,255,255,.95)");
      ctx.restore();
    }
    ctx.restore();
    ctx.save();
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    setFont(8.5, "bold");
    ctx.fillStyle = "rgba(21,85,118,.66)";
    trackedText((i + 1) + " / " + menuTabCount(), x + w - 16, y + 14, 1.2, "right");
    const cbarW = 46, cbarX = x + w - 16 - cbarW, cbarY = y + 23;
    ctx.fillStyle = "rgba(15,61,92,.12)";
    roundedRect(cbarX, cbarY, cbarW, 3, 1.5);
    ctx.fill();
    ctx.fillStyle = "#0f8a76";
    roundedRect(cbarX, cbarY, Math.max(2, cbarW * (i + 1) / menuTabCount()), 3, 1.5);
    ctx.fill();
    const title = isShop ? FRAMES[i].name.toUpperCase() : avatarName(i).toUpperCase();
    // У открытых аватаров блок из двух строк — опускаем его ниже, чтобы не оставалось пустоты снизу.
    const titleY = !isShop && !locked ? y + h - 54 : L.titleY;
    setFont(title.length > 22 ? 12 : 15, "bold");
    ctx.fillStyle = "#0f3d5c";
    trackedText(title, cx, titleY, 0.9);
    setFont(9, "bold");
    if (isShop) {
      const frame = FRAMES[i];
      const rarity = FRAME_RARITY(frame);
      if (locked) {
        ctx.fillStyle = "#c28000";
        trackedText(rarity + " \xB7 " + fmt(frame.price) + " \u041C\u041E\u041D\u0415\u0422", cx, L.subY, 1);
      } else {
        ctx.fillStyle = "#0f8a76";
        trackedText(rarity + " \xB7 \u041A\u0423\u041F\u041B\u0415\u041D\u0410", cx, L.subY, 1);
      }
      const extras = frame.look && frame.look.extras || [];
      const names = extras.map((e) => ALL_EXTRA_LABELS[e]).filter(Boolean).slice(0, 4).join(" \xB7 ");
      if (names) {
        setFont(7, "bold");
        ctx.fillStyle = "rgba(21,85,118,.48)";
        trackedText(names, cx, L.subY + 13, 0.7);
      }
    } else if (locked) {
      const need = AVATAR_SCORES[i];
      const p = need > 0 ? Math.min(1, highScore / need) : 1;
      ctx.fillStyle = "#a86b00";
      trackedText("\u041D\u0423\u0416\u0415\u041D \u0420\u0415\u041A\u041E\u0420\u0414 " + fmt(need), cx, L.subY, 1);
      const barW = 190;
      const barX = cx - barW / 2;
      const barY = L.meterY;
      ctx.fillStyle = "rgba(21,85,118,.12)";
      roundedRect(barX, barY, barW, 6, 3);
      ctx.fill();
      if (p > 1e-3) {
        const grad = ctx.createLinearGradient(barX, 0, barX + barW, 0);
        grad.addColorStop(0, "#7fbfe0");
        grad.addColorStop(1, "#12a08c");
        ctx.fillStyle = grad;
        roundedRect(barX, barY, barW * p, 6, 3);
        ctx.fill();
      }
      setFont(7, "bold");
      ctx.fillStyle = "rgba(21,85,118,.55)";
      trackedText("\u0415\u0429\u0401 " + fmt(Math.max(0, need - highScore)) + " \u0414\u041E \u041E\u0422\u041A\u0420\u042B\u0422\u0418\u042F", cx, L.meterTextY, 0.85);
    } else {
      // Открытый аватар: кнопка выбора прямо под именем, вместо плашки «ОТКРЫТ».
      const rect = showcasePrimaryRect();
      if (menuItemWorn(i)) {
        uiPill(rect.x, rect.y, rect.w, rect.h, { fill: "rgba(255,255,255,.6)" });
        ctx.save();
        ctx.textBaseline = "middle";
        setFont(9.5, "bold");
        const label = "ВЫБРАН";
        const tw = trackedWidth(label, 1.4);
        const groupW = 18 + tw;
        const gx = rect.x + (rect.w - groupW) / 2;
        const gy = rect.y + rect.h / 2;
        ctx.strokeStyle = UI.accent;
        ctx.lineWidth = 1.7;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.beginPath();
        ctx.moveTo(gx, gy + 1);
        ctx.lineTo(gx + 3.6, gy + 4.6);
        ctx.lineTo(gx + 10.4, gy - 5);
        ctx.stroke();
        ctx.fillStyle = UI.inkSoft;
        trackedText(label, gx + groupW - tw / 2, gy + 0.5, 1.4);
        ctx.restore();
      } else {
        drawMenuButton(rect.x, rect.y, rect.w, rect.h, "ВЫБРАТЬ", "green", {
          size: 10,
          tracking: 1.6
        });
      }
    }
    ctx.restore();
  }