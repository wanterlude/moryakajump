  function uiAccentPill(x, y, w, h, opts = {}) {
    const tone = opts.tone ?? "green";
    const fill = opts.dim ? "rgba(120,150,160,.45)" : UI.accentTones[tone];
    const glow = UI.accentGlows[tone];
    ctx.save();
    ctx.shadowColor = opts.dim ? "rgba(20,60,90,.12)" : opts.hover ? glow.replace(/[\d.]+\)$/, "0.62)") : glow;
    ctx.shadowBlur = opts.dim ? 8 : opts.hover ? 22 : 14;
    ctx.shadowOffsetY = opts.dim ? 3 : opts.hover ? 6 : 3;
    roundedRect(x, y, w, h, UI.pill(h));
    ctx.fillStyle = fill;
    ctx.fill();
    ctx.shadowColor = "transparent";
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;
    if (!opts.dim) {
      roundedRect(x + 4, y + 3, w - 8, h * 0.42, UI.pill(h) - 3);
      ctx.fillStyle = "rgba(255,255,255,.16)";
      ctx.fill();
    }
    roundedRect(x + 0.5, y + 0.5, w - 1, h - 1, UI.pill(h));
    ctx.strokeStyle = "rgba(255,255,255,.55)";
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.restore();
  }
  // Цвета HUD живут в src/game/hud-colors.ts.
;
  var PAUSE_ZONE = { x: 348, y: 8, w: 40, h: 40 };
  var TILT_ZONE = { x: 346, y: 46, w: 32, h: 28 };
  var hudState = {
    score: 0,
    pops: [],
    coinPulse: 0,
    lifePulse: 0,
    jumpPulse: 0,
    wasJumpReady: false
  };
  function resetHud() {
    hudState.score = 0;
    hudState.pops.length = 0;
    hudState.coinPulse = 0;
    hudState.lifePulse = 0;
    hudState.jumpPulse = 0;
    hudState.wasJumpReady = false;
  }
  function hudPop(x, y, text, color) {
    hudState.pops.push({ x, y, text, color: color || HUD_COLORS.gold, life: 1 });
  }
  function updateHud(dt) {
    // Геймпад опрашиваем каждый кадр: подключён — работает, отключён — молчит.
    pollGamepad();
    if (player.score < hudState.score) hudState.score = player.score;
    else {
      hudState.score += (player.score - hudState.score) * Math.min(1, 0.22 * dt);
      if (player.score - hudState.score < 0.6) hudState.score = player.score;
    }
    const jumpReady = jumpCharges > 0 && currentState === STATE.PLAYING;
    if (jumpReady && !hudState.wasJumpReady) hudState.jumpPulse = 1;
    hudState.wasJumpReady = jumpReady;
    hudState.coinPulse = Math.max(0, hudState.coinPulse - dt / 16);
    hudState.lifePulse = Math.max(0, hudState.lifePulse - dt / 22);
    hudState.jumpPulse = Math.max(0, hudState.jumpPulse - dt / 18);
    for (let i = hudState.pops.length - 1; i >= 0; i--) {
      const pop = hudState.pops[i];
      pop.life -= dt / 50;
      pop.y -= 0.55 * dt;
      if (pop.life <= 0) hudState.pops.splice(i, 1);
    }
  }
  function drawHudPops() {
    for (const pop of hudState.pops) {
      ctx.save();
      ctx.globalAlpha = Math.min(1, pop.life * 1.7);
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      setFont(11, "bold");
      ctx.lineWidth = 2.6;
      ctx.lineJoin = "round";
      ctx.strokeStyle = "rgba(255,255,255,.92)";
      ctx.strokeText(pop.text, pop.x, pop.y);
      ctx.fillStyle = pop.color;
      ctx.fillText(pop.text, pop.x, pop.y);
      ctx.restore();
    }
  }
  function drawHudChip(x, y, w, h, glow) {
    ctx.save();
    ctx.shadowColor = glow || "rgba(12,40,64,.16)";
    ctx.shadowBlur = glow ? 12 : 8;
    ctx.shadowOffsetY = 3;
    roundedRect(x, y, w, h, h / 2);
    ctx.fillStyle = "rgba(255,255,255,.84)";
    ctx.fill();
    ctx.shadowColor = "transparent";
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;
    roundedRect(x + 0.5, y + 0.5, w - 1, h - 1, h / 2);
    ctx.strokeStyle = "rgba(255,255,255,.95)";
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.restore();
  }
  function drawCoinBadge(x, y, r, progress) {
    const g = ctx.createRadialGradient(x - r * 0.3, y - r * 0.35, r * 0.2, x, y, r);
    g.addColorStop(0, "#fff4a3");
    g.addColorStop(0.62, "#ffc928");
    g.addColorStop(1, "#d88900");
    ctx.save();
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
    if (progress > 1e-3) {
      ctx.strokeStyle = HUD_COLORS.green;
      ctx.lineWidth = 1.8;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.arc(x, y, r + 2.8, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * progress);
      ctx.stroke();
    }
    ctx.restore();
  }
  function drawPauseGlyph(cx, cy, s, color) {
    ctx.save();
    ctx.fillStyle = color;
    const w = s * 0.34, h = s;
    roundedRect(cx - s * 0.42, cy - h / 2, w, h, w * 0.34);
    ctx.fill();
    roundedRect(cx + s * 0.42 - w, cy - h / 2, w, h, w * 0.34);
    ctx.fill();
    ctx.restore();
  }
  function drawTiltGlyph(cx, cy, s, color) {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(-0.28);
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.3;
    roundedRect(-s * 0.36, -s * 0.62, s * 0.72, s * 1.24, s * 0.18);
    ctx.stroke();
    ctx.fillStyle = color;
    ctx.fillRect(-s * 0.1, s * 0.42, s * 0.2, s * 0.08);
    ctx.restore();
  }
  var TOUCH_HINT_MS = 4200;
  var ACTIVE_PERK = {
    x: 15,
    /** Нижний край панели: чуть выше границы экрана. */
    bottom: WORLD_H - 14,
    rowH: 22,
    gap: 4,
    /** Отступ слева до иконки. */
    padL: 8,
    /** Отступ справа после счётчика. */
    padR: 10,
    /** Ширина иконки на экране. */
    iconSize: 13,
    /** Промежуток между иконкой и названием. */
    gapIcon: 5,
    /** Промежуток между названием и счётчиком. */
    gapCount: 7,
    /** Во сколько раз уменьшать иконку: она нарисована крупнее плашки. */
    iconScale: 0.6,
    nameSize: 6.8,
    /** Ниже этого шрифт названия не опускаем — иначе нечитаемо. */
    nameMinSize: 5,
    countSize: 8,
    /** Отступ от правого края экрана до плашки. */
    marginRight: 15,
    maxRows: 7
  };
  function activePerkCountText(left) {
    return shortLeft(left) + " \u043E\u0447\u043A\u043E\u0432";
  }
  function activePerksWithRemaining() {
    const score = player.score;
    const out = [];
    for (let i = perkState.active.length - 1; i >= 0; i--) {
      const a = perkState.active[i];
      if (score >= a.until) {
        perkState.active.splice(i, 1);
        continue;
      }
      const span = Math.max(1, a.until - a.from);
      const left = a.until - score;
      out.push({ perk: a, left, ratio: Math.max(0, Math.min(1, left / span)) });
    }
    return out.reverse();
  }
  function shortLeft(left) {
    if (left >= 1e4) return (left / 1e3).toFixed(0) + "\u043A";
    if (left >= 1e3) return (left / 1e3).toFixed(1).replace(".", ",") + "\u043A";
    return String(Math.max(0, Math.round(left)));
  }
  function perkStackTop(perkCount) {
    if (perkCount <= 0) return ACTIVE_PERK.bottom;
    const rows = Math.min(perkCount, ACTIVE_PERK.maxRows);
    const totalH = rows * ACTIVE_PERK.rowH + (rows - 1) * ACTIVE_PERK.gap;
    return ACTIVE_PERK.bottom - totalH;
  }
  function eventTimerY(perkCount) {
    return perkStackTop(perkCount) - ACTIVE_PERK.gap - ACTIVE_PERK.rowH;
  }
  function eventTimerLabel(kind, leftFrames) {
    const name = EVENT_HINTS[kind];
    if (!name) return null;
    return { name, count: Math.ceil(leftFrames / 1e3) + "\u0441" };
  }
  function drawEventTimer() {
    if (currentState !== STATE.PLAYING || eventIntroMs > 0 || eventCountdownMs > 0) return;
    const base = eventTimerY(activePerksWithRemaining().length);
    activeEvents.forEach((ev, i) => drawEventTimerRow(ev.kind, ev.left, base - i * (ACTIVE_PERK.rowH + ACTIVE_PERK.gap)));
  }
  function drawEventTimerRow(kind, leftMs, y) {
    const info = eventTimerLabel(kind, leftMs);
    if (!info) return;
    setFont(ACTIVE_PERK.nameSize, "bold");
    const nameW = trackedWidth(info.name, 0.3);
    setFont(ACTIVE_PERK.countSize, "bold");
    const countW = trackedWidth(info.count, 0.2);
    const rowW = ACTIVE_PERK.padL + nameW + ACTIVE_PERK.gapCount + countW + ACTIVE_PERK.padR;
    ctx.save();
    ctx.textBaseline = "middle";
    drawHudChip(ACTIVE_PERK.x, y, rowW, ACTIVE_PERK.rowH, null);
    const midY = y + ACTIVE_PERK.rowH / 2;
    setFont(ACTIVE_PERK.nameSize, "bold");
    ctx.fillStyle = HUD_COLORS.ink;
    trackedText(info.name, ACTIVE_PERK.x + ACTIVE_PERK.padL, midY + 0.3, 0.3, "left");
    const countX = ACTIVE_PERK.x + rowW - ACTIVE_PERK.padR;
    setFont(ACTIVE_PERK.countSize, "bold");
    ctx.fillStyle = leftMs < 2e3 ? HUD_COLORS.red : UI.goldText;
    trackedText(info.count, countX, midY + 0.3, 0.2, "right");
    ctx.restore();
  }
  function drawActivePerks() {
    if (currentState !== STATE.PLAYING) return;
    const items = activePerksWithRemaining();
    if (!items.length) return;
    const rows = items.slice(0, ACTIVE_PERK.maxRows);
    setFont(ACTIVE_PERK.nameSize, "bold");
    let nameW = 0;
    for (const item of rows) {
      nameW = Math.max(nameW, trackedWidth(item.perk.title, 0.3));
    }
    setFont(ACTIVE_PERK.countSize, "bold");
    let countW = 0;
    for (const item of rows) {
      countW = Math.max(countW, trackedWidth(activePerkCountText(item.left), 0.2));
    }
    const fixedW = ACTIVE_PERK.padL + ACTIVE_PERK.iconSize + ACTIVE_PERK.gapIcon + ACTIVE_PERK.gapCount + countW + ACTIVE_PERK.padR;
    const maxRowW = WORLD_W - ACTIVE_PERK.x - ACTIVE_PERK.marginRight;
    const maxNameW = Math.max(24, maxRowW - fixedW);
    const nameFits = nameW <= maxNameW;
    const rowW = Math.min(maxRowW, ACTIVE_PERK.padL + ACTIVE_PERK.iconSize + ACTIVE_PERK.gapIcon + Math.min(nameW, maxNameW) + ACTIVE_PERK.gapCount + countW + ACTIVE_PERK.padR);
    const totalH = rows.length * ACTIVE_PERK.rowH + (rows.length - 1) * ACTIVE_PERK.gap;
    const topY = ACTIVE_PERK.bottom - totalH;
    const nameX = ACTIVE_PERK.x + ACTIVE_PERK.padL + ACTIVE_PERK.iconSize + ACTIVE_PERK.gapIcon;
    const countX = ACTIVE_PERK.x + rowW - ACTIVE_PERK.padR;
    ctx.save();
    ctx.textBaseline = "middle";
    for (let i = 0; i < rows.length; i++) {
      const item = rows[i];
      const info = PERK_RARITY[item.perk.rarity] || PERK_RARITY.common;
      const y = topY + i * (ACTIVE_PERK.rowH + ACTIVE_PERK.gap);
      const midY = y + ACTIVE_PERK.rowH / 2;
      drawHudChip(ACTIVE_PERK.x, y, rowW, ACTIVE_PERK.rowH, null);
      const iconCx = ACTIVE_PERK.x + ACTIVE_PERK.padL + ACTIVE_PERK.iconSize / 2;
      ctx.save();
      ctx.translate(iconCx, midY);
      ctx.scale(ACTIVE_PERK.iconScale, ACTIVE_PERK.iconScale);
      drawPerkIcon(item.perk.icon, 0, 0, info.color);
      ctx.restore();
      ctx.save();
      ctx.beginPath();
      ctx.rect(nameX, midY - ACTIVE_PERK.rowH / 2, maxNameW, ACTIVE_PERK.rowH);
      ctx.clip();
      const titleSize = fitTextSize(
        item.perk.title,
        maxNameW,
        0.3,
        ACTIVE_PERK.nameSize,
        ACTIVE_PERK.nameMinSize
      );
      setFont(titleSize, "bold");
      ctx.fillStyle = HUD_COLORS.ink;
      trackedText(item.perk.title, nameX, midY + 0.3, 0.3, "left");
      ctx.restore();
      setFont(ACTIVE_PERK.countSize, "bold");
      ctx.fillStyle = item.ratio < 0.25 ? HUD_COLORS.red : UI.goldText;
      trackedText(activePerkCountText(item.left), countX, midY + 0.3, 0.2, "right");
    }
    ctx.restore();
  }
  function drawTouchHints(now) {
    if (!isCoarsePointer() || currentState !== STATE.PLAYING) return;
    if (!runStartedAt) return;
    const elapsed = now - runStartedAt;
    if (elapsed > TOUCH_HINT_MS) return;
    const fadeIn = Math.min(1, elapsed / 320);
    const fadeOut = Math.min(1, (TOUCH_HINT_MS - elapsed) / 700);
    const alpha = Math.min(fadeIn, fadeOut) * 0.55;
    if (alpha <= 0.01) return;
    const edge = WORLD_W * TOUCH_EDGE;
    const cy = 300;
    ctx.save();
    ctx.globalAlpha = alpha;
    for (const side of ["left", "right"]) {
      const active = touchInput[side];
      const cx = side === "left" ? edge * 0.5 : WORLD_W - edge * 0.5;
      const dir = side === "left" ? -1 : 1;
      const glow = ctx.createRadialGradient(cx, cy, 4, cx, cy, 120);
      glow.addColorStop(0, active ? "rgba(255,255,255,.30)" : "rgba(255,255,255,.16)");
      glow.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = glow;
      ctx.fillRect(cx - 120, cy - 130, 240, 260);
      ctx.strokeStyle = "rgba(255,255,255,.92)";
      ctx.lineWidth = 2.4;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      const offset = active ? 3 * dir : 0;
      ctx.beginPath();
      ctx.moveTo(cx + 9 * dir + offset, cy - 13);
      ctx.lineTo(cx - 8 * dir + offset, cy);
      ctx.lineTo(cx + 9 * dir + offset, cy + 13);
      ctx.stroke();
    }
    ctx.restore();
  }
  function drawHudButtons() {
    const playing = currentState === STATE.PLAYING;
    ctx.save();
    const px = PAUSE_ZONE.x, py = PAUSE_ZONE.y;
    const pw = PAUSE_ZONE.w, ph = PAUSE_ZONE.h;
    ctx.save();
    ctx.shadowColor = "rgba(12,40,64,.22)";
    ctx.shadowBlur = 10;
    ctx.shadowOffsetY = 3;
    roundedRect(px, py, pw, ph, 12);
    ctx.fillStyle = playing ? "rgba(255,255,255,.82)" : "rgba(255,255,255,.62)";
    ctx.fill();
    ctx.restore();
    roundedRect(px + 0.5, py + 0.5, pw - 1, ph - 1, 12);
    ctx.strokeStyle = "rgba(255,255,255,.95)";
    ctx.lineWidth = 1;
    ctx.stroke();
    drawPauseGlyph(px + pw / 2, py + ph / 2, 12, "#0f3d5c");
    if (isCoarsePointer()) {
      const tx = TILT_ZONE.x, ty = TILT_ZONE.y;
      const tw = TILT_ZONE.w, th = TILT_ZONE.h;
      ctx.save();
      roundedRect(tx, ty, tw, th, th / 2);
      ctx.fillStyle = tiltEnabled ? "rgba(15,138,118,.18)" : "rgba(255,255,255,.72)";
      ctx.fill();
      ctx.strokeStyle = "rgba(255,255,255,.9)";
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.restore();
      drawTiltGlyph(tx + tw / 2, ty + th / 2, 11, tiltEnabled ? "#0f8a76" : "rgba(15,61,92,.55)");
    }
    ctx.restore();
  }
  function drawDailyQuest(compact = false) {
    const def = dailyDef();
    // Карточка скрывается сразу после выполнения и до следующего дня.
    if (!def || dailyState.done) return;
    const d = dailyState;
    const shown = Math.min(d.progress, def.target);
    if (compact) {
      const ch = 20;
      const frac = Math.max(0, Math.min(1, shown / def.target));
      const label = Math.floor(frac * 100) + "%" + (d.streak > 0 ? " ·" + d.streak : "");
      setFont(6.6, "bold");
      const tw = trackedWidth(label, 0.4);
      const w = 20 + tw + 12;
      // Компактная ежедневка стоит в том же слоте, что и полная: по центру.
      const cx0 = (WORLD_W - w) / 2, cy0 = 544;
      drawHudChip(cx0, cy0, w, ch, null);
      const ix = cx0 + 11, iy = cy0 + ch / 2 - 0.5;
      ctx.save();
      ctx.strokeStyle = "#b07a00";
      ctx.lineWidth = 1;
      ctx.lineCap = "round";
      for (let i = 0; i < 3; i++) {
        const a = i * Math.PI / 3;
        ctx.beginPath();
        ctx.moveTo(ix - Math.cos(a) * 3, iy - Math.sin(a) * 3);
        ctx.lineTo(ix + Math.cos(a) * 3, iy + Math.sin(a) * 3);
        ctx.stroke();
      }
      ctx.restore();
      setFont(6.6, "bold");
      ctx.fillStyle = "rgba(15,61,92,.86)";
      trackedText(label, cx0 + 20, iy, 0.4, "left");
      const barW = w - 20;
      roundedRect(cx0 + 10, cy0 + ch - 4, barW, 2.2, 1.1);
      ctx.fillStyle = "rgba(15,61,92,.10)";
      ctx.fill();
      if (frac > 0) {
        roundedRect(cx0 + 10, cy0 + ch - 4, Math.max(2, barW * frac), 2.2, 1.1);
        ctx.fillStyle = "#e0a91f";
        ctx.fill();
      }
      return;
    }
    let x = 15;
    const y = 544, h = 20;
    const pulse = 0.72 + 0.28 * Math.sin(performance.now() / 360);
    setFont(6.5, "bold");
    const head = `ЕЖЕДНЕВНО · ${def.short} ${shown}/${def.target}`;
    const right = d.streak > 0 ? `СЕРИЯ ${d.streak}` : "";
    const headW = trackedWidth(head, 0.8);
    const rightW = right ? trackedWidth(right, 0.8) : 0;
    const gap = right ? 14 : 0;
    // Компактная рамка: ширина по контенту, длинная полоса не растягивает её.
    const w = Math.min(252, 40 + headW + gap + rightW + 16);
    x = (WORLD_W - w) / 2;
    ctx.save();
    ctx.textBaseline = "middle";
    ctx.textAlign = "left";
    roundedRect(x, y, w, h, 10);
    ctx.fillStyle = "rgba(255,255,255,.92)";
    ctx.fill();
    ctx.strokeStyle = "rgba(15,61,92,.20)";
    ctx.lineWidth = 1;
    ctx.stroke();
    const ix = x + 13;
    const iy = y + h / 2 - 0.5;
    ctx.beginPath();
    ctx.arc(ix, iy, 6.2, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255,194,71,${0.14 + pulse * 0.10})`;
    ctx.fill();
    ctx.strokeStyle = "#b07a00";
    ctx.lineWidth = 1.1;
    ctx.lineCap = "round";
    for (let i = 0; i < 3; i++) {
      const a = i * Math.PI / 3;
      ctx.beginPath();
      ctx.moveTo(ix - Math.cos(a) * 3.4, iy - Math.sin(a) * 3.4);
      ctx.lineTo(ix + Math.cos(a) * 3.4, iy + Math.sin(a) * 3.4);
      ctx.stroke();
    }
    ctx.lineCap = "butt";
    setFont(6.5, "bold");
    ctx.fillStyle = "rgba(15,61,92,.86)";
    trackedText(head, x + 24, iy, 0.8, "left");
    if (right) {
      ctx.fillStyle = "rgba(21,85,118,.55)";
      trackedText(right, x + w - 10, iy, 0.8, "right");
    }
    // Короткая полоса выполнения — не растягивает рамку.
    const frac = Math.max(0, Math.min(1, shown / def.target));
    const barW = Math.min(128, w - 44);
    const by = y + h - 5;
    roundedRect(x + 24, by, barW, 2.4, 1.2);
    ctx.fillStyle = "rgba(15,61,92,.10)";
    ctx.fill();
    if (frac > 0) {
      roundedRect(x + 24, by, Math.max(2, barW * frac), 2.4, 1.2);
      ctx.fillStyle = "#e0a91f";
      ctx.fill();
    }
    ctx.restore();
  }
  // Сдвиг подписи рекорда вниз, пока видна плашка задания (0..1, плавно).
  var hudRecordShift = 0;
  function drawHud() {
    const t = performance.now() / 1e3;
    const bigScore = Math.floor(hudState.score);
    // Плашка задания на забег живёт под ресурсами, поэтому подпись рекорда
    // уезжает вниз, пока она видна, и возвращается обратно, когда та гаснет.
    let questPlateAlpha = 1;
    if (questState.active && questState.done && questState.doneAt) {
      const elapsed = performance.now() - questState.doneAt;
      if (elapsed >= QUEST_DONE_SHOW_MS) {
        questPlateAlpha = 0;
      } else if (elapsed > QUEST_DONE_SHOW_MS - QUEST_DONE_FADE_MS) {
        questPlateAlpha = (QUEST_DONE_SHOW_MS - elapsed) / QUEST_DONE_FADE_MS;
      }
    }
    if (questState.active && questState.failed && questState.failedAt) {
      const elapsed = performance.now() - questState.failedAt;
      if (elapsed >= 3000) questPlateAlpha = 0;
      else if (elapsed > 2200) questPlateAlpha = (3000 - elapsed) / 800;
    }
    const hasQuest = !!questState.active && questPlateAlpha > 0;
    const hasWind = !!wind.active;
    const questBoxVisible = hasQuest || hasWind;
    hudRecordShift += ((questBoxVisible ? 1 : 0) - hudRecordShift) * 0.18;
    const recordY = 80 + hudRecordShift * 22;
    // Счёт по центру без плашки: крупные белые цифры на тени, подпись над ними.
    // Ресурсы — отдельной строкой капсул под счётом, тоже по центру.
    const beatingRecord = Math.floor(player.score) > highScore && highScore > 0;
    ctx.save();
    ctx.textBaseline = "middle";
    ctx.textAlign = "center";
    ctx.shadowColor = "rgba(255,255,255,.95)";
    ctx.shadowBlur = 8;
    setFont(6.4, "bold");
    ctx.fillStyle = "rgba(21,85,118,.7)";
    trackedText("СЧЁТ", 200, 14, 2.4, "center");
    setFont(24, "bold");
    ctx.fillStyle = "#ffffff";
    ctx.shadowColor = "rgba(2,14,26,.55)";
    ctx.shadowBlur = 4;
    ctx.shadowOffsetY = 1.2;
    trackedText(fmt(bigScore), 200, 33, 0.6, "center");
    ctx.restore();
    const chipH = 20;
    const chipY = 50;
    // Строка ресурсов тоже по центру: сначала меряем ширины, потом рисуем.
    const mPerLife = coinsPerLife();
    const mCoinText = `${runCoins % mPerLife}/${mPerLife}`;
    setFont(11, "bold");
    const mText = String(Math.min(lives, 999));
    const mLives = Math.max(46, 30 + ctx.measureText(mText).width + 12);
    const mCoin = 30 + ctx.measureText(mCoinText).width + 12;
    const mJump = 12 + 9 + 5 + trackedWidth("\xD72", 0) + 9;
    let chipX = 200 - (mLives + mCoin + mJump + 12) / 2;
    setFont(11, "bold");
    const livesText = String(Math.min(lives, 999));
    const livesW = Math.max(46, 30 + ctx.measureText(livesText).width + 12);
    drawHudChip(chipX, chipY, livesW, chipH, hudState.lifePulse > 0 ? "rgba(230,57,70,.75)" : null);
    const heartScale = 5.2 + hudState.lifePulse * 1.6;
    drawHeart(
      chipX + 15,
      chipY + chipH / 2 - 1.3,
      heartScale,
      hudState.lifePulse > 0 ? "#ff4d5e" : HUD_COLORS.red
    );
    ctx.save();
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    setFont(11, "bold");
    ctx.fillStyle = HUD_COLORS.ink;
    ctx.fillText(livesText, chipX + 26, chipY + chipH / 2 + 0.5);
    ctx.restore();
    chipX += livesW + 6;
    const perLife = coinsPerLife();
    const coinProgress = runCoins % perLife / perLife;
    setFont(11, "bold");
    const coinText = `${runCoins % perLife}/${perLife}`;
    const coinW = 30 + ctx.measureText(coinText).width + 12;
    drawHudChip(chipX, chipY, coinW, chipH, hudState.coinPulse > 0 ? "rgba(194,128,0,.7)" : null);
    const coinR = 5.9 + hudState.coinPulse * 1.5;
    drawCoinBadge(chipX + 16, chipY + chipH / 2, coinR, coinProgress);
    ctx.save();
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    setFont(8.5, "bold");
    ctx.fillStyle = HUD_COLORS.gold;
    ctx.fillText(coinText, chipX + 28, chipY + chipH / 2 + 0.5);
    ctx.restore();
    chipX += coinW + 6;
    const jumpReady = jumpCharges > 0 && currentState === STATE.PLAYING;
    const jumpHint = jumpReady ? isCoarsePointer() ? "\u0422\u0410\u041F" : "\u041A\u041B\u0418\u041A" : "";
    setFont(8.5, "bold");
    const jumpLabelW = trackedWidth("\xD72", 0);
    setFont(5.6, "bold");
    const jumpHintW = jumpHint ? trackedWidth(jumpHint, 0.8) : 0;
    const jumpPadL = 12;
    const jumpArrowW = 9;
    const jumpGap1 = 5;
    const jumpGap2 = 5;
    const jumpPadR = 9;
    let jumpW = jumpPadL + jumpArrowW + jumpGap1 + jumpLabelW + (jumpHintW ? jumpGap2 + jumpHintW : 0) + jumpPadR;
    const jumpLimit = PAUSE_ZONE.x - 6;
    if (chipX + jumpW > jumpLimit) {
      jumpW = jumpPadL + jumpArrowW + jumpGap1 + jumpLabelW + jumpPadR;
    }
    drawHudChip(
      chipX,
      chipY,
      jumpW,
      chipH,
      jumpReady ? `rgba(15,138,118,${0.45 + hudState.jumpPulse * 0.4})` : null
    );
    ctx.save();
    ctx.textBaseline = "middle";
    ctx.textAlign = "left";
    const arrowColor = jumpReady ? HUD_COLORS.green : "rgba(21,85,118,.30)";
    ctx.strokeStyle = arrowColor;
    ctx.lineWidth = 1.8;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    for (let i = 0; i < 2; i++) {
      const yy = chipY + chipH / 2 + 3 - i * 4.6;
      ctx.beginPath();
      ctx.moveTo(chipX + jumpPadL, yy);
      ctx.lineTo(chipX + jumpPadL + 4.5, yy - 3.4);
      ctx.lineTo(chipX + jumpPadL + jumpArrowW, yy);
      ctx.stroke();
    }
    ctx.lineCap = "butt";
    let jumpCursor = chipX + jumpPadL + jumpArrowW + jumpGap1;
    setFont(8.5, "bold");
    ctx.fillStyle = jumpReady ? HUD_COLORS.green : "rgba(21,85,118,.34)";
    trackedText("\xD72", jumpCursor, chipY + chipH / 2 + 0.5, 0, "left");
    jumpCursor += jumpLabelW + jumpGap2;
    if (jumpHint && jumpW > jumpPadL + jumpArrowW + jumpGap1 + jumpLabelW + jumpPadR) {
      setFont(5.6, "bold");
      ctx.fillStyle = jumpReady ? "rgba(15,138,118,.72)" : "rgba(21,85,118,.28)";
      trackedText(jumpHint, jumpCursor, chipY + chipH / 2 + 0.5, 0.8, "left");
    }
    ctx.restore();
    // Подпись рекорда едет вниз под плашку задания и возвращается, когда та
    // гаснет. Рисуется до плашки, поэтому в пути проходит под ней.
    ctx.save();
    ctx.textBaseline = "middle";
    ctx.textAlign = "center";
    ctx.shadowColor = "rgba(255,255,255,.9)";
    ctx.shadowBlur = 6;
    setFont(6.2, "bold");
    if (beatingRecord) {
      const pulse = 0.72 + 0.28 * Math.sin(t * 4);
      ctx.fillStyle = `rgba(166,96,0,${pulse})`;
      trackedText("НОВЫЙ РЕКОРД", 200, recordY, 1.2, "center");
    } else {
      ctx.fillStyle = "rgba(21,85,118,.6)";
      trackedText(`РЕКОРД ${fmt(highScore)}`, 200, recordY, 1.1, "center");
    }
    ctx.restore();
    const infoY = 76;
    if (hasQuest || hasWind) {
      ctx.save();
      ctx.textBaseline = "middle";
      ctx.textAlign = "left";
      setFont(7, "normal");
      let label = "";
      let color = "#0f3d5c";
      if (hasQuest) {
        const done = questState.done;
        const failed = questState.failed;
        const q = questState.active;
        const shown = q ? Math.min(questState.progress, q.target) : 0;
        label = failed ? "\u0417\u0410\u0414\u0410\u041D\u0418\u0415 \u041F\u0420\u041E\u0412\u0410\u041B\u0415\u041D\u041E" : done ? `\u0412\u042B\u041F\u041E\u041B\u041D\u0415\u041D\u041E  +${q ? q.reward : 0}` : `${q ? q.label : ""}  ${shown}/${q ? q.target : 0}`;
        color = failed ? "#b3202a" : done ? "#0a6b4a" : "#0f3d5c";
      }
      const labelWidth = label ? trackedWidth(label, 1.2) : 0;
      const arrow = wind.dir < 0 ? "←" : wind.dir > 0 ? "→" : "·";
      const windLabel = hasWind ? "ВЕТЕР " + arrow : "";
      const windWidth = windLabel ? trackedWidth(windLabel, 2) : 0;
      const windBarsW = hasWind ? 18 : 0;
      const padX = 13, gap = 14;
      const totalWidth = labelWidth + (label && windLabel ? gap : 0) + windWidth + (hasWind ? 5 + windBarsW : 0);
      const plateW = totalWidth + padX * 2;
      const plateX = (WORLD_W - plateW) / 2;
      const textX = plateX + padX;
      roundedRect(plateX, infoY, plateW, 17, 8.5);
      ctx.fillStyle = "rgba(255,255,255,.90)";
      ctx.fill();
      ctx.strokeStyle = "rgba(15,61,92,.22)";
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.shadowColor = "transparent";
      ctx.shadowBlur = 0;
      ctx.shadowOffsetY = 0;
      ctx.save();
      ctx.globalAlpha = questPlateAlpha;
      ctx.fillStyle = color;
      if (label) trackedText(label, textX, infoY + 8.5, 1.2, "left");
      ctx.restore();
      if (windLabel) {
        const warning = wind.warn > 0;
        if (warning) {
          const pulse = 0.55 + 0.45 * Math.sin(t * 10);
          ctx.fillStyle = `rgba(168,107,0,${0.55 + pulse * 0.45})`;
        } else {
          const strength = Math.abs(wind.force);
          const shade = Math.round(61 - strength * 30);
          ctx.fillStyle = `rgb(${shade},${shade + 40},${shade + 70})`;
        }
        setFont(7, "normal");
        trackedText(windLabel, textX + labelWidth + (label ? gap : 0), infoY + 8.5, 2, "left");
        const barsX = textX + labelWidth + (label ? gap : 0) + windWidth + 5;
        const strength = Math.min(1, Math.abs(wind.force) / 4.8);
        for (let i = 0; i < 3; i++) {
          const bh = 3 + i * 2.2;
          const on = strength > (i + 1) / 4;
          ctx.fillStyle = on ? (warning ? "#a86b00" : "rgba(32,128,168,.9)") : "rgba(15,61,92,.14)";
          roundedRect(barsX + i * 5, infoY + 12 - bh, 3, bh, 1.2);
          ctx.fill();
        }
      }
      ctx.restore();
    }

    drawDailyQuest(!dailyState.done && runStartedAt > 0 && performance.now() - runStartedAt > 4000);
    drawHudButtons();
    if (performance.now() < tiltFeedbackUntil) {
      ctx.save();
      ctx.globalAlpha = Math.min(1, (tiltFeedbackUntil - performance.now()) / 320);
      ctx.textBaseline = "middle";
      setFont(7.5, "bold");
      const label = "\u041D\u0410\u041A\u041B\u041E\u041D \u0412\u041A\u041B\u042E\u0427\u0401\u041D";
      const w = trackedWidth(label, 1.6) + 20;
      const bx = WORLD_W - w - 15;
      roundedRect(bx, infoY, w, 17, 8.5);
      ctx.fillStyle = "rgba(15,138,118,.88)";
      ctx.fill();
      ctx.fillStyle = "#ffffff";
      trackedText(label, bx + w / 2, infoY + 9, 1.6);
      ctx.restore();
    }
    drawActivePerks();
    drawEventTimer();
    drawTouchHints(performance.now());
    drawHudPops();
  }
  function drawDangerVignette() {
    if (currentState !== STATE.PLAYING) return;
    const depth = Math.max(0, Math.min(1, (player.y - 470) / 120));
    if (depth <= 0.02) return;
    const pulse = 0.72 + 0.28 * Math.sin(performance.now() / 130);
    const alpha = 0.4 * depth * pulse;
    const g = ctx.createRadialGradient(200, 300, 130, 200, 300, 350);
    g.addColorStop(0, "rgba(210,32,44,0)");
    g.addColorStop(0.72, `rgba(210,32,44,${(alpha * 0.45).toFixed(3)})`);
    g.addColorStop(1, `rgba(210,32,44,${alpha.toFixed(3)})`);
    ctx.save();
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, WORLD_W, WORLD_H);
    ctx.restore();
  }
  var PAUSE_PANEL = { x: 32, y: 80, w: 336, h: WORLD_W, r: 26 };
  var PAUSE_BUTTONS = [
    { id: "resume", x: 52, y: 352, w: 296, h: 52, label: "\u041F\u0420\u041E\u0414\u041E\u041B\u0416\u0418\u0422\u042C", sub: "ESC", variant: "primary", size: 15, icon: "play" },
    { id: "restart", x: 52, y: 414, w: 144, h: 44, label: "\u0417\u0410\u041D\u041E\u0412\u041E", variant: "ghost", size: 11 },
    { id: "menu", x: 204, y: 414, w: 144, h: 44, label: "\u0412 \u041C\u0415\u041D\u042E", variant: "ghost", size: 11 },
    { id: "sound", x: 52, y: 298, w: 296, h: 42, label: "\u0417\u0412\u0423\u041A \u0418 \u0412\u0418\u0411\u0420\u0410\u0426\u0418\u042F", variant: "ghost", size: 11 },
    { id: "close", x: 320, y: 116, w: 28, h: 28, label: "", variant: "close" }
  ];
  var pauseState = { openedAt: 0, hover: null };
  var SENS_ROWS = [
    { id: "key", x: 52, y: 298, w: 144, h: 42, label: "\u041A\u041B\u0410\u0412\u0418\u0428\u0418" },
    { id: "mouse", x: 204, y: 298, w: 144, h: 42, label: "\u041C\u042B\u0428\u042C" }
  ];
  function sensMinusZone(row) {
    return { x: row.x + 8, y: row.y + 18, w: 22, h: 18 };
  }
  function sensPlusZone(row) {
    return { x: row.x + row.w - 30, y: row.y + 18, w: 22, h: 18 };
  }
  function sensHitTest(point) {
    for (const row of SENS_ROWS) {
      if (point.x < row.x || point.x > row.x + row.w) continue;
      if (point.y < row.y || point.y > row.y + row.h) continue;
      const minus = sensMinusZone(row);
      if (point.x >= minus.x && point.x <= minus.x + minus.w && point.y >= minus.y && point.y <= minus.y + minus.h) {
        return { row, action: -1 };
      }
      const plus = sensPlusZone(row);
      if (point.x >= plus.x && point.x <= plus.x + plus.w && point.y >= plus.y && point.y <= plus.y + plus.h) {
        return { row, action: 1 };
      }
    }
    return null;
  }
  function pauseButtonAt(point) {
    for (const button of PAUSE_BUTTONS) {
      if (point.x >= button.x && point.x <= button.x + button.w && point.y >= button.y && point.y <= button.y + button.h) {
        return button;
      }
    }
    return null;
  }
  function commitRunScore() {
    const finalScore = Math.floor(player.score);
    if (finalScore <= highScore) return;
    highScore = finalScore;
    unlockedAvatars = getUnlockedAvatars(highScore);
    if (!unlockedAvatars.includes(selectedAvatar)) selectedAvatar = 0;
    saveProgress();
  }
  function drawPauseScrim(alpha) {
    ctx.fillStyle = `rgba(18,58,92,${(0.34 * alpha).toFixed(3)})`;
    ctx.fillRect(0, 0, WORLD_W, WORLD_H);
  }
  function drawPausePanel(alpha, panel = PAUSE_PANEL) {
    const { x, y, w, h, r } = panel;
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.shadowColor = "rgba(20,60,90,.26)";
    ctx.shadowBlur = 40;
    ctx.shadowOffsetY = 14;
    roundedRect(x, y, w, h, r);
    ctx.fillStyle = "rgba(252,254,255,.97)";
    ctx.fill();
    ctx.shadowColor = "transparent";
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;
    roundedRect(x + 0.75, y + 0.75, w - 1.5, h - 1.5, r);
    ctx.strokeStyle = "rgba(255,255,255,.96)";
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.restore();
  }
  function drawPauseHeader(alpha) {
    ctx.save();
    ctx.globalAlpha = alpha;
    uiAccentPill(52, 118, 34, 34);
    ctx.save();
    drawPauseGlyph(69, 135, 13, "rgba(255,255,255,.96)");
    ctx.restore();
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    setFont(19, "bold");
    ctx.fillStyle = UI.ink;
    trackedText("\u041F\u0410\u0423\u0417\u0410", 98, 130, 1.8, "left");
    setFont(6.8, "bold");
    ctx.fillStyle = UI.inkSoft;
    trackedText(trainingState.active ? "ТРЕНИРОВКА БОССА" : "ЗАБЕГ ПРИОСТАНОВЛЕН", 98, 148, 1.6, "left");
    ctx.restore();
  }
  function drawPauseScore(alpha) {
    const score = Math.floor(player.score);
    const beating = highScore > 0 && score > highScore;
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.textBaseline = "middle";
    setFont(7, "bold");
    ctx.fillStyle = "rgba(21,85,118,.55)";
    trackedText("\u0421\u0427\u0401\u0422", 52, 190, 1.9, "left");
    trackedText("\u0420\u0415\u041A\u041E\u0420\u0414", 348, 190, 1.9, "right");
    setFont(27, "bold");
    ctx.fillStyle = "#0f3d5c";
    trackedText(fmt(score), 52, 214, 0.4, "left");
    setFont(16, "bold");
    ctx.fillStyle = beating ? "#0f8a76" : "#c28000";
    trackedText(beating ? "\u041F\u041E\u0411\u0418\u0422" : fmt(highScore), 348, 213, 0.3, "right");
    ctx.restore();
  }
  function drawPauseStatCard(x, y, w, h, label, value, icon) {
    uiPill(x, y, w, h, { fill: "rgba(255,255,255,.72)", radius: 14 });
    ctx.save();
    ctx.textBaseline = "middle";
    ctx.textAlign = "left";
    icon(x + 17, y + 18);
    let valueSize = 13;
    setFont(valueSize, "bold");
    const maxValueWidth = w - 37;
    while (valueSize > 8.5 && ctx.measureText(value).width > maxValueWidth) {
      valueSize -= 0.5;
      setFont(valueSize, "bold");
    }
    ctx.fillStyle = UI.ink;
    ctx.fillText(value, x + 29, y + 18);
    setFont(6.2, "bold");
    ctx.fillStyle = UI.inkSoft;
    trackedText(label, x + 11, y + h - 9, 0.7, "left");
    ctx.restore();
  }
  function drawPauseButton(button, alpha) {
    const { x, y, w, h, variant } = button;
    const hovered = pauseState.hover === button.id;
    ctx.save();
    ctx.globalAlpha = alpha;
    if (variant === "close") {
      uiPill(x, y, w, h, { fill: hovered ? UI.surfaceSolid : UI.surface, radius: w / 2 });
    } else if (variant === "primary") {
      uiAccentPill(x, y, w, h);
      if (hovered) {
        ctx.save();
        roundedRect(x, y, w, h, UI.pill(h));
        ctx.fillStyle = "rgba(255,255,255,.14)";
        ctx.fill();
        ctx.restore();
      }
    } else {
      uiPill(x, y, w, h, { fill: hovered ? UI.surfaceSolid : UI.surface });
    }
    const cx = x + w / 2;
    const cy = y + h / 2;
    if (variant === "close") {
      const s = 5;
      ctx.strokeStyle = UI.inkSoft;
      ctx.lineWidth = 1.8;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(cx - s, cy - s);
      ctx.lineTo(cx + s, cy + s);
      ctx.moveTo(cx + s, cy - s);
      ctx.lineTo(cx - s, cy + s);
      ctx.stroke();
    } else {
      const isPrimary = variant === "primary";
      const color = isPrimary ? "#ffffff" : UI.ink;
      ctx.textBaseline = "middle";
      const size = button.size || 12;
      setFont(size, "bold");
      const labelWidth = trackedWidth(button.label, 1.4);
      const shift = button.icon === "play" ? 9 : 0;
      const mainY = button.sub ? cy - 6 : cy;
      ctx.fillStyle = color;
      trackedText(button.label, cx + shift, mainY, 1.4);
      if (button.icon === "play") {
        const tx = cx + shift - labelWidth / 2 - 11;
        ctx.beginPath();
        ctx.moveTo(tx, mainY - 5.5);
        ctx.lineTo(tx + 8.5, mainY);
        ctx.lineTo(tx, mainY + 5.5);
        ctx.closePath();
        ctx.fillStyle = color;
        ctx.fill();
      }
      if (button.sub) {
        setFont(6.6, "bold");
        ctx.fillStyle = isPrimary ? "rgba(255,255,255,.72)" : UI.inkSoft;
        trackedText(button.sub, cx, cy + 8, 1.6);
      }
    }
    ctx.restore();
  }
  function drawSensRow(row, alpha) {
    const { x, y, w, h, id, label } = row;
    const value = controls[id];
    const hovered = pauseState.hover === id;
    ctx.save();
    ctx.globalAlpha = alpha;
    roundedRect(x, y, w, h, 14);
    ctx.fillStyle = hovered ? "rgba(21,85,118,.12)" : "rgba(21,85,118,.055)";
    ctx.fill();
    roundedRect(x + 0.5, y + 0.5, w - 1, h - 1, 14);
    ctx.strokeStyle = "rgba(21,85,118,.14)";
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    setFont(6.6, "bold");
    ctx.fillStyle = "rgba(21,85,118,.55)";
    trackedText(label, x + w / 2, y + 10, 1.2);
    const zones = [[sensMinusZone(row), -1], [sensPlusZone(row), 1]];
    for (const [zone, sign] of zones) {
      const enabled = sign < 0 ? value > SENS_MIN + 0.01 : value < SENS_MAX - 0.01;
      roundedRect(zone.x, zone.y, zone.w, zone.h, 6);
      ctx.fillStyle = enabled ? "rgba(21,85,118,.10)" : "rgba(21,85,118,.04)";
      ctx.fill();
      ctx.strokeStyle = enabled ? "rgba(15,61,92,.85)" : "rgba(15,61,92,.25)";
      ctx.lineWidth = 1.4;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(zone.x + 7, zone.y + zone.h / 2);
      ctx.lineTo(zone.x + zone.w - 7, zone.y + zone.h / 2);
      if (sign > 0) {
        ctx.moveTo(zone.x + zone.w / 2, zone.y + 5);
        ctx.lineTo(zone.x + zone.w / 2, zone.y + zone.h - 5);
      }
      ctx.stroke();
    }
    const barX = x + 34;
    const barW = w - 68;
    const barY = y + 24;
    const barH = 5;
    roundedRect(barX, barY, barW, barH, 2.5);
    ctx.fillStyle = "rgba(21,85,118,.12)";
    ctx.fill();
    const fill = (value - SENS_MIN) / (SENS_MAX - SENS_MIN);
    if (fill > 1e-3) {
      roundedRect(barX, barY, Math.max(3, barW * fill), barH, 2.5);
      const grad = ctx.createLinearGradient(barX, 0, barX + barW, 0);
      grad.addColorStop(0, "#7fbfe0");
      grad.addColorStop(1, "#12856f");
      ctx.fillStyle = grad;
      ctx.fill();
    }
    ctx.strokeStyle = "rgba(21,85,118,.18)";
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const dx = barX + barW / 4 * i;
      ctx.beginPath();
      ctx.moveTo(dx, barY - 1.5);
      ctx.lineTo(dx, barY + barH + 1.5);
      ctx.stroke();
    }
    ctx.textAlign = "center";
    setFont(7, "bold");
    ctx.fillStyle = "#0f3d5c";
    trackedText("\xD7" + value.toFixed(1), x + w / 2, y + 35, 0.8);
    ctx.restore();
  }
  function drawPauseMenu() {
    const elapsed = performance.now() - pauseState.openedAt;
    const progress = Math.min(1, elapsed / 170);
    const alpha = 1 - Math.pow(1 - progress, 3);
    const score = Math.floor(player.score);
    const beating = highScore > 0 && score > highScore;
    const remaining = Math.max(0, highScore - score);
    drawPauseScrim(alpha);
    drawPausePanel(alpha);
    drawPauseHeader(alpha);
    drawPauseScore(alpha);
    ctx.save();
    ctx.globalAlpha = alpha;
    drawPauseStatCard(
      52,
      240,
      94,
      50,
      "\u0416\u0418\u0417\u041D\u0418",
      String(Math.min(lives, 999)),
      (cx, cy) => drawHeart(cx, cy + 1, 4.6, "#e63946")
    );
    drawPauseStatCard(
      153,
      240,
      94,
      50,
      "\u041C\u041E\u041D\u0415\u0422\u042B",
      String(runCoins),
      (cx, cy) => drawCoinBadge(cx, cy, 6.4, runCoins % coinsPerLife() / coinsPerLife())
    );
    drawPauseStatCard(
      254,
      240,
      94,
      50,
      "\u0414\u041E \u0420\u0415\u041A\u041E\u0420\u0414\u0410",
      beating ? "\u041F\u041E\u0411\u0418\u0422" : highScore > 0 ? fmt(remaining) : "\u2014",
      (cx, cy) => drawSparkle(cx, cy, 5, beating ? "#0f8a76" : "#5b8aa6")
    );
    ctx.restore();
    for (const button of PAUSE_BUTTONS) drawPauseButton(button, alpha);
    ctx.save();
    ctx.globalAlpha = alpha * 0.9;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    setFont(7, "bold");
    ctx.fillStyle = "rgba(21,85,118,.45)";
    trackedText(
      isCoarsePointer() ? "\u041A\u041E\u0421\u041D\u0418\u0421\u042C \u041A\u041D\u041E\u041F\u041A\u0418, \u0427\u0422\u041E\u0411\u042B \u041F\u0420\u041E\u0414\u041E\u041B\u0416\u0418\u0422\u042C" : "ESC \u2014 \u041F\u0420\u041E\u0414\u041E\u041B\u0416\u0418\u0422\u042C \xB7 R \u2014 \u0417\u0410\u041D\u041E\u0412\u041E",
      200,
      472,
      1.2
    );
    ctx.restore();
  }
  var GAMEOVER_PANEL = { x: 32, y: 124, w: 336, h: 352, r: 26 };
  var GAMEOVER_BUTTONS = [
    { id: "restart", x: 52, y: 354, w: 296, h: 40, label: "\u0418\u0413\u0420\u0410\u0422\u042C \u0421\u041D\u041E\u0412\u0410", variant: "primary", size: 13, icon: "play" },
    { id: "share", x: 52, y: 402, w: 296, h: 28, label: "\u041F\u041E\u0414\u0415\u041B\u0418\u0422\u042C\u0421\u042F", variant: "ghost", size: 10 },
    { id: "menu", x: 52, y: 438, w: 296, h: 28, label: "\u0412 \u041C\u0415\u041D\u042E", variant: "ghost", size: 10 }
  ];
  var gameOverState = {
    openedAt: 0,
    newRecord: false,
    /** Подпись под кнопками: результат «Поделиться» и ошибки. */
    notice: "",
    noticeUntil: 0
  };
  function showGameOverNotice(text, ms = 2600) {
    gameOverState.notice = text;
    gameOverState.noticeUntil = performance.now() + ms;
  }
  var GAMEOVER_INPUT_DELAY = 300;
  var gameOverCache = { canvas: null, cacheCtx: null, key: null, scrim: null };
  function gameOverButtonAt(point) {
    for (const button of GAMEOVER_BUTTONS) {
      if (point.x >= button.x && point.x <= button.x + button.w && point.y >= button.y && point.y <= button.y + button.h) {
        return button;
      }
    }
    return null;
  }
  function gameOverCacheKey(score) {
    return [
      score,
      highScore,
      runCoins,
      bankCoins,
      gameOverState.newRecord ? 1 : 0,
      pauseState.hover || "",
      isCoarsePointer() ? 1 : 0
    ].join("|");
  }
  function makeScrimGradient(c) {
    const g = c.createRadialGradient(200, 220, 60, 200, 300, 420);
    g.addColorStop(0, "rgba(9,24,40,.55)");
    g.addColorStop(1, "rgba(3,10,20,.86)");
    return g;
  }
  function gameOverScrim(target = ctx) {
    if (target !== ctx) return makeScrimGradient(target);
    if (!gameOverCache.scrim) gameOverCache.scrim = makeScrimGradient(ctx);
    return gameOverCache.scrim;
  }
  function drawGameOverCard(score, share = false) {
    drawPausePanel(1, GAMEOVER_PANEL);
    ctx.save();
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    setFont(7.5, "bold");
    const caption = "\u041A\u041E\u041D\u0415\u0426 \u0417\u0410\u0411\u0415\u0413\u0410";
    const captionWidth = trackedWidth(caption, 2) + 24;
    roundedRect(200 - captionWidth / 2, 146, captionWidth, 18, 9);
    ctx.fillStyle = "rgba(21,85,118,.07)";
    ctx.fill();
    ctx.strokeStyle = "rgba(21,85,118,.12)";
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.fillStyle = "rgba(21,85,118,.62)";
    trackedText(caption, 200, 155.5, 2);
    setFont(19, "bold");
    ctx.fillStyle = "#0f3d5c";
    trackedText("\u0418\u0413\u0420\u0410 \u041E\u041A\u041E\u041D\u0427\u0415\u041D\u0410", 200, 188, 1.4);
    ctx.strokeStyle = "rgba(21,85,118,.12)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(52, 206);
    ctx.lineTo(348, 206);
    ctx.stroke();
    setFont(7, "bold");
    ctx.fillStyle = "rgba(21,85,118,.55)";
    trackedText("\u0421\u0427\u0401\u0422", 200, 224, 2);
    setFont(36, "bold");
    ctx.fillStyle = "#0f3d5c";
    trackedText(fmt(score), 200, 254, 0.4);
    if (gameOverState.newRecord) {
      setFont(7.5, "bold");
      const label = "\u041D\u041E\u0412\u042B\u0419 \u0420\u0415\u041A\u041E\u0420\u0414";
      const w = trackedWidth(label, 1.6) + 22;
      roundedRect(200 - w / 2, 276, w, 17, 8.5);
      ctx.fillStyle = "#0f8a76";
      ctx.fill();
      ctx.fillStyle = "#ffffff";
      trackedText(label, 200, 284.5, 1.6);
    } else if (highScore > score) {
      setFont(8, "bold");
      ctx.fillStyle = "rgba(21,85,118,.62)";
      trackedText(`\u0414\u041E \u0420\u0415\u041A\u041E\u0420\u0414\u0410 ${fmt(highScore - score)}`, 200, 284.5, 1.2);
    }
    ctx.restore();
    drawPauseStatCard(
      52,
      300,
      94,
      46,
      "\u0417\u0410 \u0417\u0410\u0411\u0415\u0413",
      fmt(runCoins),
      (cx, cy) => drawCoinBadge(cx, cy, 6.4, runCoins % coinsPerLife() / coinsPerLife())
    );
    drawPauseStatCard(
      153,
      300,
      94,
      46,
      "\u041B\u0423\u0427\u0428\u0418\u0419 \u0421\u0427\u0401\u0422",
      fmt(highScore),
      (cx, cy) => drawSparkle(cx, cy, 5, "#c28000")
    );
    drawPauseStatCard(
      254,
      300,
      94,
      46,
      "\u0412\u0421\u0415\u0413\u041E \u041C\u041E\u041D\u0415\u0422",
      fmt(bankCoins),
      (cx, cy) => drawCoinBadge(cx, cy, 6.4, 0)
    );
    if (share) {
      ctx.save();
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      const nick = normalizeNick(playerNick);
      if (nick) {
        const nickY = 372;
        const label = nick.toUpperCase();
        const maxW = 300;
        const size = fitTextSize(label, maxW, 1, 22, 13);
        setFont(size, "bold");
        const textW = Math.min(maxW, trackedWidth(label, 1));
        const pillW = textW + 34;
        const pillH = size + 14;
        roundedRect(200 - pillW / 2, nickY - pillH / 2, pillW, pillH, pillH / 2);
        ctx.fillStyle = "rgba(255,255,255,.82)";
        ctx.fill();
        ctx.save();
        roundedRect(200 - pillW / 2, nickY - pillH / 2, pillW, pillH, pillH / 2);
        ctx.clip();
        ctx.fillStyle = "#0f3d5c";
        trackedText(label, 200, nickY + 0.5, 1);
        ctx.restore();
      }
      setFont(7, "bold");
      ctx.fillStyle = "rgba(255,255,255,.7)";
      trackedText("\u041C\u041E\u0420\u042F\u041A\u0410 \xB7 \u0412\u0415\u0420\u0422\u0418\u041A\u0410\u041B\u042C\u041D\u042B\u0419 \u0420\u0410\u041D\u041D\u0415\u0420", 200, 490, 1.2);
      ctx.restore();
      return;
    }
    for (const button of GAMEOVER_BUTTONS) drawPauseButton(button, 1);
    ctx.save();
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    const noticeFresh = gameOverState.notice && performance.now() < gameOverState.noticeUntil;
    if (noticeFresh) {
      setFont(8, "bold");
      ctx.fillStyle = "#8ef0d0";
      trackedText(gameOverState.notice, 200, 490, 1);
    } else {
      setFont(7, "bold");
      ctx.fillStyle = "rgba(255,255,255,.7)";
      trackedText(
        isCoarsePointer() ? "\u041A\u041E\u0421\u041D\u0418\u0421\u042C \u042D\u041A\u0420\u0410\u041D\u0410 \u2014 \u041D\u041E\u0412\u042B\u0419 \u0417\u0410\u0411\u0415\u0413" : "\u041B\u042E\u0411\u0410\u042F \u041A\u041B\u0410\u0412\u0418\u0428\u0410 \u0418\u041B\u0418 \u041A\u041B\u0418\u041A \u2014 \u041D\u041E\u0412\u042B\u0419 \u0417\u0410\u0411\u0415\u0413",
        200,
        490,
        1.2
      );
    }
    ctx.restore();
  }
  function ensureGameOverCache() {
    if (gameOverCache.canvas) return true;
    const cv = document.createElement("canvas");
    cv.width = WORLD_W * RENDER_SCALE;
    cv.height = WORLD_H * RENDER_SCALE;
    const cacheCtx = cv.getContext("2d");
    if (!cacheCtx) return false;
    cacheCtx.scale(RENDER_SCALE, RENDER_SCALE);
    gameOverCache.canvas = cv;
    gameOverCache.cacheCtx = cacheCtx;
    return true;
  }
  function drawGameOver() {
    if (!gameOverState.openedAt) gameOverState.openedAt = performance.now();
    const score = Math.floor(player.score);
    ctx.save();
    ctx.fillStyle = gameOverScrim();
    ctx.fillRect(0, 0, WORLD_W, WORLD_H);
    ctx.restore();
    const key = gameOverCacheKey(score);
    if (ensureGameOverCache() && gameOverCache.key !== key) {
      const cacheCtx = gameOverCache.cacheCtx;
      cacheCtx.clearRect(0, 0, WORLD_W, WORLD_H);
      const mainCtx = ctx;
      ctx = cacheCtx;
      try {
        drawGameOverCard(score);
      } finally {
        ctx = mainCtx;
      }
      gameOverCache.key = key;
    }
    const progress = Math.min(1, (performance.now() - gameOverState.openedAt) / 260);
    const alpha = 1 - Math.pow(1 - progress, 3);
    ctx.save();
    ctx.globalAlpha = alpha;
    if (gameOverCache.canvas) {
      ctx.drawImage(gameOverCache.canvas, 0, 0, WORLD_W, WORLD_H);
    } else {
      drawGameOverCard(score);
    }
    ctx.restore();
  }
  function canvasPoint(event) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: (event.clientX - rect.left) * WORLD_W / rect.width,
      y: (event.clientY - rect.top) * WORLD_H / rect.height
    };
  }
  window.addEventListener("keydown", (event) => {
    if (saveOpen) return;
    if (nickOpen) {
      if (event.code === "Escape") {
        event.preventDefault();
        closeNickDialog(false);
      } else if (event.code === "Enter" || event.code === "NumpadEnter") {
        event.preventDefault();
        confirmNick();
      }
      return;
    }
    keys[event.code] = true;
    if (resetOpen && event.code === "Escape") {
      event.preventDefault();
      closeResetDialog();
      return;
    }
    if (perkState.offering) {
      const byCode = { Digit1: 0, Digit2: 1, Digit3: 2, Numpad1: 0, Numpad2: 1, Numpad3: 2 };
      if (event.code in byCode) {
        event.preventDefault();
        choosePerk(byCode[event.code]);
        return;
      }
      if (event.code === "KeyR") {
        event.preventDefault();
        rerollPerks();
        return;
      }
    }
    if ((event.code === "ArrowUp" || event.code === "KeyW" || event.code === "Space") && doDoubleJump()) {
      event.preventDefault();
      return;
    }
    if (currentState === STATE.MENU) {
      const dirByCode = {
        ArrowLeft: -1,
        ArrowRight: 1,
        ArrowUp: -MENU.cols,
        ArrowDown: MENU.cols
      };
      if (event.code === "Enter" || event.code === "Space") {
        event.preventDefault();
        if (menuState.tab === "platforms") {
          platformShopSpin();
        } else if (menuState.tab === "shop") {
          if (gachaState.phase === "reveal") gachaState.phase = "idle";
          startGacha();
        } else if (event.code === "Enter") runPrimary();
        else startGame();
        return;
      }
      if (event.code === "Tab") {
        event.preventDefault();
        switchMenuTab(MENU_TABS[(MENU_TABS.findIndex((t) => t.id === menuState.tab) + 1) % MENU_TABS.length].id);
        revealCursor(menuCursor());
        return;
      }
      if (event.code === "Escape") {
        event.preventDefault();
        startGame();
        return;
      }
      if (menuState.tab === "platforms" && dirByCode[event.code] !== void 0) {
        event.preventDefault();
        const step = dirByCode[event.code];
        if (step === -MENU.cols) {
          switchMenuTab("shop");
          revealCursor(menuCursor());
          return;
        }
        if (step === 1 || step === -1) platformShopSelectType(platformShop.typeIndex + step);
        return;
      }
      if (menuState.tab === "shop" && dirByCode[event.code] !== void 0) {
        event.preventDefault();
        const step = dirByCode[event.code];
        if (step === -MENU.cols) {
          switchMenuTab("avatars");
          revealCursor(menuCursor());
          return;
        }
        if (step === 1 || step === -1) {
          const list = gachaOwnedList();
          const current = list.findIndex((f) => f.id === selectedFrame);
          const next = Math.max(0, Math.min(list.length - 1, (current < 0 ? 0 : current) + step));
          if (list[next]) {
            equipFrameById(list[next].id);
            gachaPickerRevealSelected();
          }
        }
        return;
      }
      if (dirByCode[event.code] !== void 0) {
        event.preventDefault();
        const step = dirByCode[event.code];
        if (step === -MENU.cols && menuCursor() < MENU.cols && menuState.tab === "shop") {
          switchMenuTab("avatars");
          revealCursor(menuCursor());
          return;
        }
        if (step === MENU.cols && menuCursor() >= menuTabCount() - MENU.cols && menuState.tab === "avatars") {
          switchMenuTab("shop");
          revealCursor(menuCursor());
          return;
        }
        setMenuCursor(menuCursor() + step);
        sfx.click();
        return;
      }
      return;
    }
    if (currentState === STATE.GAMEOVER) {
      if (!event.repeat && performance.now() - gameOverState.openedAt > GAMEOVER_INPUT_DELAY) {
        event.preventDefault();
        if (event.code === "KeyM") {
          pauseState.hover = null;
          currentState = STATE.MENU;
          lastFrameTime = 0;
        } else {
          startGame();
        }
      }
      return;
    }
    if (currentState === STATE.PLAYING && event.code === "Escape") {
      pauseGame();
      return;
    }
    if (currentState === STATE.PAUSE) {
      if (event.code === "Escape") resumeGame();
      else if (event.code === "KeyR" || event.code === "Enter") {
        if (trainingState.active) startTrainingBoss(trainingState.index);
        else {
          commitRunScore();
          startGame();
        }
      } else if (event.code === "KeyM") {
        if (trainingState.active) exitTraining();
        else {
          commitRunScore();
          pauseState.hover = null;
          currentState = STATE.MENU;
          lastFrameTime = 0;
        }
      }
    }
  });
  window.addEventListener("keyup", (event) => {
    keys[event.code] = false;
  });
  window.addEventListener("blur", () => {
    keys.ArrowLeft = false;
    keys.ArrowRight = false;
    keys.KeyA = false;
    keys.KeyD = false;
    clearTouchInput();
  });
  canvas.addEventListener("pointerdown", (event) => {
    const point = canvasPoint(event);
    if (perkState.offering) {
      const index = perkCardAt(point);
      if (index >= 0) choosePerk(index);
      else if (perkRerollButtonAt(point)) rerollPerks();
      event.preventDefault();
      return;
    }
    if (currentState === STATE.PAUSE) {
      const button = pauseButtonAt(point);
      if (button) {
        if (button.id === "sound") openSoundSettings();
        else if (button.id === "resume" || button.id === "close") resumeGame();
        else if (button.id === "restart") {
          if (trainingState.active) startTrainingBoss(trainingState.index);
          else {
            commitRunScore();
            startGame();
          }
        } else if (button.id === "menu") {
          if (trainingState.active) exitTraining();
          else {
            commitRunScore();
            pauseState.hover = null;
            currentState = STATE.MENU;
            lastFrameTime = 0;
          }
        }
      }
      event.preventDefault();
      return;
    }
    if (currentState === STATE.GAMEOVER) {
      const button = gameOverButtonAt(point);
      const ready = performance.now() - gameOverState.openedAt > GAMEOVER_INPUT_DELAY;
      if (ready) {
        if (button && button.id === "menu") {
          pauseState.hover = null;
          currentState = STATE.MENU;
          lastFrameTime = 0;
        } else if (button && button.id === "share") {
          askNick(() => shareResult());
        } else {
          startGame();
        }
      }
      event.preventDefault();
      return;
    }
    if (currentState === STATE.MENU) {
      if (bossTrainOpen) {
        const back = bossTrainBackRect();
        if (point.x >= back.x && point.x <= back.x + back.w && point.y >= back.y && point.y <= back.y + back.h) {
          bossTrainOpen = false;
          sfx.click();
        } else {
          const rows = bossTrainRows();
          for (let i = 0; i < rows.length; i++) {
            const r = rows[i];
            if (point.x >= r.x && point.x <= r.x + r.w && point.y >= r.y && point.y <= r.y + r.h) {
              startTrainingBoss(i);
              break;
            }
          }
        }
        event.preventDefault();
        return;
      }
      const onActionBar = point.y >= MENU.barY - 6;
      if (!onActionBar) {
        menuState.swiping = true;
        menuState.swipeMode = "drag";
        menuState.swipeStartX = point.x;
        menuState.swipeStartY = point.y;
        menuState.swipeFrom = menuState.swipe;
        menuState.swipeMovedX = 0;
        menuState.swipeVel = 0;
        menuState.swipeTrail = [{ t: performance.now(), x: point.x }];
        menuState.pointerId = event.pointerId;
      }
      if (point.x >= MENU_GEAR.x && point.x <= MENU_GEAR.x + MENU_GEAR.w && point.y >= MENU_GEAR.y && point.y <= MENU_GEAR.y + MENU_GEAR.h) {
        openSettings();
        event.preventDefault();
        return;
      }
      if (point.x >= MENU_LB.x && point.x <= MENU_LB.x + MENU_LB.w && point.y >= MENU_LB.y && point.y <= MENU_LB.y + MENU_LB.h) {
        lbOpen("global");
        event.preventDefault();
        return;
      }
      if (point.x >= MENU_PROFILE.x && point.x <= MENU_PROFILE.x + MENU_PROFILE.w && point.y >= MENU_PROFILE.y && point.y <= MENU_PROFILE.y + MENU_PROFILE.h) {
        openProfile();
        event.preventDefault();
        return;
      }
      if (menuState.tab === "platforms") {
        const onTabsP = point.y >= MENU.tabsY && point.y <= MENU.tabsY + MENU.tabsH && point.x >= MENU.padX && point.x <= WORLD_W - MENU.padX;
        if (!onTabsP) {
          platformPressStart = { x: point.x, y: point.y, id: event.pointerId };
          event.preventDefault();
          return;
        }
      }
      if (menuState.tab === "shop") {
        const onTabs = point.y >= MENU.tabsY && point.y <= MENU.tabsY + MENU.tabsH && point.x >= MENU.padX && point.x <= WORLD_W - MENU.padX;
        if (!onTabs) {
          if (isInsideGachaPicker(point)) {
            gachaState.pickerDrag = true;
            gachaState.pickerPointerId = event.pointerId;
            gachaState.pickerStartX = point.x;
            gachaState.pickerScrollStart = gachaState.pickerScroll;
            gachaState.pickerMoved = 0;
            try {
              canvas.setPointerCapture(event.pointerId);
            } catch {
            }
            event.preventDefault();
            return;
          }
          const action = gachaShopHitTest(point);
          if (action === "spin") {
            if (gachaState.phase === "reveal") gachaState.phase = "idle";
            startGacha();
          } else if (action === "play") {
            startGame();
          } else if (action === "equip" && gachaState.result) {
            equipFrameById(gachaState.result.id);
          }
          event.preventDefault();
          return;
        }
      }
      if (point.y >= MENU.tabsY && point.y <= MENU.tabsY + MENU.tabsH && point.x >= MENU.padX && point.x <= WORLD_W - MENU.padX) {
        menuState.swipeMode = "click";
        menuState.swiping = false;
        menuState.pointerId = null;
        switchMenuTab(menuTabAt(point.x));
        revealCursor(menuCursor());
        event.preventDefault();
        return;
      }
      if (point.y >= MENU.barY && point.y <= MENU.barY + MENU.barH) {
        const hit = menuActionButtons().find((b) =>
          point.x >= b.x && point.x <= b.x + b.w && point.y >= b.y && point.y <= b.y + b.h
        );
        if (hit) {
          if (hit.id === "play") startGame();
          else if (hit.id === "train") {
            bossTrainOpen = true;
            sfx.click();
          } else if (hit.id === "save") {
            openSaveDialog();
            sfx.click();
          }
        }
        event.preventDefault();
        return;
      }
      if (menuState.tab === "avatars" && !bossTrainOpen) {
        const sr = showcasePrimaryRect();
        if (point.x >= sr.x && point.x <= sr.x + sr.w && point.y >= sr.y && point.y <= sr.y + sr.h) {
          if (menuPrimary().enabled) runPrimary();
          else sfx.click();
          event.preventDefault();
          return;
        }
      }
      if (point.y >= MENU.gridY - 8 && point.y <= MENU.gridY + MENU.gridH + 8) {
        menuState.dragging = true;
        menuState.dragStartY = point.y;
        menuState.dragScrollStart = menuState.scroll;
        menuState.dragMoved = 0;
        menuState.pointerId = event.pointerId;
        try {
          canvas.setPointerCapture(event.pointerId);
        } catch {
        }
        event.preventDefault();
        return;
      }
      event.preventDefault();
      return;
    }
    if (currentState === STATE.PLAYING) {
      if (duelIsActive() && inZone(point, DUEL_PAUSE_ZONE)) {
        pauseGame();
        event.preventDefault();
        return;
      }
      if (inZone(point, PAUSE_ZONE)) {
        pauseGame();
        event.preventDefault();
        return;
      }
      if (isCoarsePointer() && inZone(point, TILT_ZONE)) {
        if (!tiltEnabled) enableTilt();
        event.preventDefault();
        return;
      }
      if (event.pointerType !== "mouse") {
        const zone = touchZoneAt(point.x);
        if (zone === "center") {
          doDoubleJump();
        } else {
          pressTouchDirection(zone, event.pointerId);
          try {
            canvas.setPointerCapture(event.pointerId);
          } catch {
          }
        }
        event.preventDefault();
        return;
      }
      if (event.button === 0) {
        if (doDoubleJump()) event.preventDefault();
      }
    }
  });
  canvas.addEventListener("wheel", (event) => {
    if (currentState === STATE.MENU && (menuState.tab === "platforms" || menuState.tab === "shop" && gachaState.phase === "idle")) {
      event.preventDefault();
      return;
    }
    if (currentState !== STATE.MENU) return;
    const point = canvasPoint(event);
    if (point.y < MENU.gridY - 12 || point.y > MENU.gridY + MENU.gridH + 12) return;
    if (menuMaxScroll() <= 0) return;
    const unit = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? WORLD_W : 1;
    const delta = event.deltaY * unit;
    menuState.scroll += delta;
    clampScroll();
    event.preventDefault();
  }, { passive: false });
  canvas.addEventListener("pointermove", (event) => {
    const point = canvasPoint(event);
    if (currentState === STATE.MENU && bossTrainOpen) {
      let next = null;
      const back = bossTrainBackRect();
      if (point.x >= back.x && point.x <= back.x + back.w && point.y >= back.y && point.y <= back.y + back.h) {
        next = "boss-train-back";
      } else {
        const rows = bossTrainRows();
        for (let i = 0; i < rows.length; i++) {
          const r = rows[i];
          if (point.x >= r.x && point.x <= r.x + r.w && point.y >= r.y && point.y <= r.y + r.h) {
            next = "boss-train-" + i;
            break;
          }
        }
      }
      if (next !== pauseState.hover) {
        pauseState.hover = next;
        canvas.style.cursor = next ? "pointer" : "default";
      }
      return;
    }
    if (currentState === STATE.MENU && menuState.tab === "shop" && gachaState.pickerDrag && gachaState.pickerPointerId === event.pointerId) {
      const dx = point.x - gachaState.pickerStartX;
      gachaState.pickerMoved = Math.max(gachaState.pickerMoved, Math.abs(dx));
      gachaState.pickerScroll = gachaState.pickerScrollStart - dx;
      clampGachaPicker();
      event.preventDefault();
      return;
    }
    if (currentState === STATE.MENU && menuState.swiping && menuState.pointerId === event.pointerId) {
      const dx = point.x - menuState.swipeStartX;
      const dy = point.y - menuState.swipeStartY;
      menuState.swipeMovedX = Math.max(menuState.swipeMovedX, Math.abs(dx));
      if (!menuState.dragging && Math.abs(dx) < 8 && Math.abs(dy) < 8) {
        event.preventDefault();
        return;
      }
      if (Math.abs(dx) > Math.abs(dy)) {
        const raw = menuState.swipeFrom + dx / WORLD_W;
        menuState.swipe = Math.max(-(MENU_TABS.length - 1), Math.min(0, raw));
        const now = performance.now();
        menuState.swipeTrail.push({ t: now, x: point.x });
        const cutoff = now - MENU_SWIPE.velocityWindowMs;
        while (menuState.swipeTrail.length > 2 && menuState.swipeTrail[0].t < cutoff) {
          menuState.swipeTrail.shift();
        }
        event.preventDefault();
        return;
      }
    }
    if (currentState === STATE.MENU && menuState.dragging && menuState.pointerId === event.pointerId) {
      const dy = point.y - menuState.dragStartY;
      menuState.dragMoved = Math.max(menuState.dragMoved, Math.abs(dy));
      menuState.scroll = menuState.dragScrollStart - dy;
      clampScroll();
      event.preventDefault();
      return;
    }
    if (perkState.offering) {
      const index = perkCardAt(point);
      const next2 = index >= 0 ? "perk" + index : perkRerollButtonAt(point) ? "perk-reroll" : null;
      if (next2 !== pauseState.hover) {
        pauseState.hover = next2;
        canvas.style.cursor = next2 ? "pointer" : "default";
      }
      return;
    }
    if (event.pointerType === "mouse" && currentState === STATE.PLAYING) {
      const rect = canvas.getBoundingClientRect();
      if (!rect.width) return;
      mouseControl.targetX = Math.max(0, Math.min(
        WORLD_W,
        (event.clientX - rect.left) * WORLD_W / rect.width
      ));
      mouseControl.inside = event.clientX >= rect.left && event.clientX <= rect.right;
      return;
    }
    if (event.pointerType !== "mouse") return;
    if (currentState === STATE.MENU && menuState.tab === "shop") {
      const action = gachaShopHitTest(point);
      const next2 = action ? "gacha-" + action : null;
      if (next2 !== pauseState.hover) {
        pauseState.hover = next2;
        canvas.style.cursor = next2 ? "pointer" : "default";
      }
      return;
    }
    if (currentState === STATE.MENU && menuState.tab === "platforms") {
      // Свои координаты: кнопки этой вкладки шире, чем в «Аватарах», и общая
      // карта наведения записывала «Крутить» в зону «Играть».
      let next2 = null;
      if (platformRectHit(point, { x: MENU.padX, y: MENU.barY, w: 228, h: MENU.barH })) next2 = "platform-spin";
      else if (platformRectHit(point, { x: 260, y: MENU.barY, w: 120, h: MENU.barH })) next2 = "platform-play";
      if (next2 !== pauseState.hover) {
        pauseState.hover = next2;
        canvas.style.cursor = next2 ? "pointer" : "default";
      }
      return;
    }
    if (currentState === STATE.MENU) {
      let next2 = null;
      for (const b of menuActionButtons()) {
        if (point.x >= b.x && point.x <= b.x + b.w && point.y >= b.y && point.y <= b.y + b.h) {
          next2 = "menu-btn-" + b.label;
          break;
        }
      }
      if (next2 !== pauseState.hover) {
        pauseState.hover = next2;
        canvas.style.cursor = next2 ? "pointer" : "default";
      }
      return;
    }
    if (currentState !== STATE.PAUSE && currentState !== STATE.GAMEOVER) return;
    if (currentState === STATE.GAMEOVER) {
      const button = gameOverButtonAt(point);
      const next2 = button ? button.id : null;
      if (next2 !== pauseState.hover) {
        pauseState.hover = next2;
        canvas.style.cursor = button ? "pointer" : "default";
      }
      return;
    }
    let next = null;
    for (const row of SENS_ROWS) {
      if (point.x >= row.x && point.x <= row.x + row.w && point.y >= row.y && point.y <= row.y + row.h) {
        next = row.id;
        break;
      }
    }
    if (!next) {
      const button = pauseButtonAt(point);
      next = button ? button.id : null;
    }
    if (next !== pauseState.hover) {
      pauseState.hover = next;
      canvas.style.cursor = next ? "pointer" : "default";
    }
  });
  function finishMenuSwipe() {
    if (menuState.swipeMovedX < 8) {
      menuState.swipeVel = 0;
      menuState.swipeTrail = [];
      menuState.swipeMode = "drag";
      return;
    }
    const trail = menuState.swipeTrail;
    const offset = menuState.swipe - menuState.swipeFrom;
    const dragged = offset * WORLD_W;
    let flick = 0;
    if (trail.length >= 2) {
      const a = trail[0];
      const b = trail[trail.length - 1];
      const dtMs = Math.max(1, b.t - a.t);
      flick = (b.x - a.x) / dtMs;
    }
    const commitDist = WORLD_W * MENU_SWIPE.commitRatio;
    const cur = menuTabIndex(menuState.tab);
    let target = cur;
    if (dragged < -commitDist || flick < -MENU_SWIPE.flickSpeed && dragged < 0) target = cur + 1;
    else if (dragged > commitDist || flick > MENU_SWIPE.flickSpeed && dragged > 0) target = cur - 1;
    target = Math.max(0, Math.min(MENU_TABS.length - 1, target));
    if (target !== cur) switchMenuTab(MENU_TABS[target].id);
    const switched = target !== cur;
    menuState.swipeMode = "drag";
    menuState.swipeVel = switched ? flick * 1e3 / WORLD_W : 0;
    menuState.swipeTrail = [];
  }
  function finishMenuPointer(event) {
    if (currentState !== STATE.MENU) return;
    if (!menuState.dragging) return;
    if (menuState.pointerId !== event.pointerId) return;
    const point = canvasPoint(event);
    const moved = menuState.dragMoved;
    menuState.dragging = false;
    menuState.pointerId = null;
    if (moved < 8) {
      const i = cardAtPoint(point);
      if (i !== -1) {
        if (i === menuCursor()) {
          if (menuPrimary().enabled) runPrimary();
          else sfx.click();
        } else {
          setMenuCursor(i);
          sfx.click();
        }
        menuState.pressIndex = i;
        menuState.pressT = 1;
      }
    }
  }
  canvas.addEventListener("pointerup", (event) => {
    if (event.pointerType !== "mouse") releaseTouchDirection(event.pointerId);
    if (gachaState.pickerDrag && gachaState.pickerPointerId === event.pointerId) {
      const point = canvasPoint(event);
      const moved = gachaState.pickerMoved;
      gachaState.pickerDrag = false;
      gachaState.pickerPointerId = null;
      if (moved < 6) {
        const index = gachaPickerIndexAt(point);
        const list = gachaOwnedList();
        if (index >= 0 && list[index]) equipFrameById(list[index].id);
      }
      event.preventDefault();
      return;
    }
    if (platformPressStart && platformPressStart.id === event.pointerId) {
      const up = canvasPoint(event);
      const moved = Math.hypot(up.x - platformPressStart.x, up.y - platformPressStart.y);
      platformPressStart = null;
      if (menuState.tab === "platforms" && moved < 8) platformShopTap(up);
    }
    if (menuState.swiping && menuState.pointerId === event.pointerId) {
      finishMenuSwipe();
    }
    finishMenuPointer(event);
    menuState.dragging = false;
    menuState.swiping = false;
    menuState.pointerId = null;
  });
  canvas.addEventListener("pointercancel", (event) => {
    releaseTouchDirection(event.pointerId);
    if (gachaState.pickerPointerId === event.pointerId) {
      gachaState.pickerDrag = false;
      gachaState.pickerPointerId = null;
    }
    if (menuState.pointerId === event.pointerId) {
      menuState.dragging = false;
      menuState.swiping = false;
      menuState.pointerId = null;
    }
  });
  canvas.addEventListener("pointerleave", (event) => {
    if (event.pointerType === "mouse") {
      mouseControl.inside = false;
      if (pauseState.hover) {
        pauseState.hover = null;
        canvas.style.cursor = "pointer";
      }
    }
  });
  function doDoubleJump() {
    if (currentState !== STATE.PLAYING) return false;
    if (duelIsActive()) return false;
    if (stickyStuck) {
      stickyStuck.presses++;
      sfx.click();
      if (stickyStuck.presses < 2) {
        hudPop(player.x + 15, player.y - 8, "\u0415\u0429\u0401 \u0420\u0410\u0417", HUD_COLORS.green);
        return true;
      }
      stickyStuck = null;
      player.dy = -15;
      sfx.jump();
      return true;
    }
    if (jumpCharges <= 0) return false;
    jumpCharges--;
    player.dy = -15;
    sfx.jump();
    return true;
  }
  function maxAirJumps() {
    return perkValue("djump") > 0 ? 2 : 1;
  }
  function refillJumps() {
    jumpCharges = maxAirJumps();
  }
  var TOUCH_EDGE = 0.3;
  function touchZoneAt(x) {
    const edge = WORLD_W * TOUCH_EDGE;
    if (x < edge) return "left";
    if (x > WORLD_W - edge) return "right";
    return "center";
  }
  function pressTouchDirection(zone, pointerId) {
    if (!activePointers[zone]) return;
    activePointers[zone].add(pointerId);
    touchInput[zone] = true;
  }
  function releaseTouchDirection(pointerId) {
    activePointers.left.delete(pointerId);
    activePointers.right.delete(pointerId);
    touchInput.left = activePointers.left.size > 0;
    touchInput.right = activePointers.right.size > 0;
  }
  function clearTouchInput() {
    activePointers.left.clear();
    activePointers.right.clear();
    touchInput.left = false;
    touchInput.right = false;
  }
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      clearTouchInput();
      if (currentState === STATE.PLAYING) pauseGame();
      if (drawRafHandle !== null && typeof cancelAnimationFrame === "function") {
        cancelAnimationFrame(drawRafHandle);
      }
      drawRafHandle = null;
      return;
    }
    lastRealTs = 0;
    lastFrameTime = 0;
    simAccumMs = 0;
    fpsWindowStart = 0;
    fpsPreviousTimestamp = 0;
    fpsIntervals = [];
    fpsWorkSamples = [];
    scheduleDraw();
  });
  var GACHA_RATES = {
    common: 0.5,
    rare: 0.28,
    epic: 0.15,
    legendary: 0.06,
    divine: 0.01
  };
  var GACHA_COST = 50;
  var GACHA_DUPLICATE_REFUND = 0.4; // 20 монет при цене 50
  var GACHA_TIER_PRICES = {
    common: 100,
    // цена < 100 → обычная
    rare: 200,
    // цена < 200 → редкая
    epic: 340,
    // цена < 340 → эпическая
    legendary: 560
    // цена < 560 → легендарная, иначе божественная
  };
  var GACHA_TIER = (frame) => frame.price === 0 ? "base" : frame.price < GACHA_TIER_PRICES.common ? "common" : frame.price < GACHA_TIER_PRICES.rare ? "rare" : frame.price < GACHA_TIER_PRICES.epic ? "epic" : frame.price < GACHA_TIER_PRICES.legendary ? "legendary" : "divine";
  var GACHA_TIER_COLORS = {
    base: "#8a97a8",
    common: "#5a7f9c",
    rare: "#287db4",
    epic: "#a855f7",
    legendary: "#e8a317",
    divine: "#ff4d6d"
  };
  var GACHA_TIER_LABELS = {
    base: "\u0411\u0410\u0417\u041E\u0412\u0410\u042F",
    common: "\u041E\u0411\u042B\u0427\u041D\u0410\u042F",
    rare: "\u0420\u0415\u0414\u041A\u0410\u042F",
    epic: "\u042D\u041F\u0418\u0427\u0415\u0421\u041A\u0410\u042F",
    legendary: "\u041B\u0415\u0413\u0415\u041D\u0414\u0410\u0420\u041D\u0410\u042F",
    divine: "\u0411\u041E\u0416\u0415\u0421\u0422\u0412\u0415\u041D\u041D\u0410\u042F"
  };
  var gachaState = {
    phase: "idle",
    // 'idle' | 'spin' | 'reveal'
    startedAt: 0,
    duration: 2400,
    // сколько крутится прокрутка
    result: null,
    // выпавшая рамка
    duplicate: false,
    // выпала уже имеющаяся
    refund: 0,
    // компенсация за дубликат
    scroll: 0,
    // текущий сдвиг ленты для отрисовки
    pickerScroll: 0,
    // горизонтальный сдвиг панели выбора
    pickerDrag: false,
    pickerPointerId: null,
    pickerStartX: 0,
    pickerScrollStart: 0,
    pickerMoved: 0
  };
  function rollGachaTier() {
    const roll = Math.random();
    let acc = 0;
    for (const tier of GACHA_TIER_ORDER) {
      acc += GACHA_RATES[tier];
      if (roll < acc) return tier;
    }
    return "common";
  }
  function pickFrameOfTier(tier) {
    const pool = FRAMES.filter((f) => GACHA_TIER(f) === tier);
    if (!pool.length) return null;
    return pool[Math.floor(Math.random() * pool.length)];
  }
  function startGacha() {
    if (gachaState.phase === "spin") return;
    if (bankCoins < GACHA_COST) {
      setMenuMessage("\u041D\u0435 \u0445\u0432\u0430\u0442\u0430\u0435\u0442 \u043C\u043E\u043D\u0435\u0442", "\u041D\u0443\u0436\u043D\u043E " + GACHA_COST);
      sfx.click();
      return;
    }
    bankCoins -= GACHA_COST;
    let tier = rollGachaTier();
    let frame = pickFrameOfTier(tier);
    const fallback = ["divine", "legendary", "epic", "rare", "common"];
    for (const t of fallback.slice(fallback.indexOf(tier))) {
      if (frame) break;
      tier = t;
      frame = pickFrameOfTier(t);
    }
    if (!frame) {
      bankCoins += GACHA_COST;
      setMenuMessage("\u0420\u0430\u043C\u043A\u0438 \u0437\u0430\u043A\u043E\u043D\u0447\u0438\u043B\u0438\u0441\u044C", "\u0412\u0441\u0435 \u0443\u0436\u0435 \u0441\u043E\u0431\u0440\u0430\u043D\u044B");
      return;
    }
    gachaState.phase = "spin";
    gachaState.startedAt = performance.now();
    gachaState.result = frame;
    gachaState.duplicate = ownedFrames.includes(frame.id);
    gachaState.refund = 0;
    gachaState.scroll = 0;
    saveProgress();
    sfx.click();
  }
  function finishGacha() {
    const frame = gachaState.result;
    if (!frame) return;
    if (gachaState.duplicate) {
      gachaState.refund = Math.round(GACHA_COST * GACHA_DUPLICATE_REFUND);
      bankCoins += gachaState.refund;
    } else {
      ownedFrames.push(frame.id);
      if (!unlockedAvatars.includes(selectedAvatar)) selectedAvatar = 0;
    }
    gachaState.phase = "reveal";
    gachaState.startedAt = performance.now();
    saveProgress();
    if (gachaState.duplicate) {
      setMenuMessage("\u0414\u0443\u0431\u043B\u0438\u043A\u0430\u0442: \xAB" + frame.name + "\xBB", "+" + gachaState.refund + " \u043C\u043E\u043D\u0435\u0442 \u043D\u0430\u0437\u0430\u0434");
    } else {
      setMenuMessage("\u041D\u043E\u0432\u0430\u044F \u0440\u0430\u043C\u043A\u0430: \xAB" + frame.name + "\xBB", GACHA_TIER_LABELS[GACHA_TIER(frame)]);
    }
  }
  var GACHA_UI = {
    panel: { x: 20, y: 82, w: 360, h: 200 },
    reel: { x: 34, y: 94, w: 332, h: 146 },
    collectY: 292,
    ratesY: 330,
    spinY: 374,
    spinH: 44,
    spinX: 20,
    spinW: 228,
    playX: 260,
    playW: 120,
    hintY: 432,
    picker: { x: 0, y: 448, w: WORLD_W, h: 112 },
    cellW: 76
  };
  var GACHA_PICKER = {
    cellW: 62,
    cellH: 84,
    gap: 8,
    rowTop: 22,
    // отступ от верха панели до ряда ячеек
    viewX: 16,
    viewW: 368
  };
  var GACHA_TIER_ORDER = ["common", "rare", "epic", "legendary", "divine"];
  function gachaEquippedFrame() {
    return FRAMES.find((f) => f.id === selectedFrame) || FRAMES[0];
  }
  function gachaCollected() {
    return ownedFrames.filter((id) => id !== 0).length;
  }
  function gachaTotal() {
    return FRAMES.length - 1;
  }
  function gachaTierColor(frame) {
    return GACHA_TIER_COLORS[GACHA_TIER(frame)] || "#5a7f9c";
  }
  var GACHA_REEL_LENGTH = 40;
  var GACHA_REEL_STOP = 18;
  function gachaReelFrames() {
    const list = [];
    const seed = gachaState.result ? gachaState.result.id : 1;
    for (let i = 0; i < GACHA_REEL_LENGTH; i++) {
      const frame = FRAMES[(seed * 7 + i * 5) % FRAMES.length];
      list.push(frame.id === 0 ? FRAMES[1] : frame);
    }
    list[GACHA_REEL_STOP] = gachaState.result || FRAMES[1];
    return list;
  }
  function drawGachaPanelGlow(color, alpha) {
    const { x, y, w, h } = GACHA_UI.panel;
    ctx.save();
    ctx.globalAlpha = alpha;
    const glow = ctx.createRadialGradient(200, y + h * 0.42, 10, 200, y + h * 0.42, 190);
    glow.addColorStop(0, color);
    glow.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = glow;
    ctx.fillRect(x, y, w, h);
    ctx.restore();
  }
  function drawGachaRates() {
    const y = GACHA_UI.ratesY;
    const w = 64;
    const gap = 6;
    const total = w * 5 + gap * 4;
    const left = (WORLD_W - total) / 2;
    const h = 30;
    ctx.save();
    ctx.textBaseline = "middle";
    ctx.textAlign = "center";
    for (let i = 0; i < GACHA_TIER_ORDER.length; i++) {
      const tier = GACHA_TIER_ORDER[i];
      const color = GACHA_TIER_COLORS[tier];
      const x = left + i * (w + gap);
      uiPill(x, y, w, h, { fill: "rgba(255,255,255,.78)" });
      ctx.save();
      roundedRect(x, y, w, h, UI.pill(h));
      ctx.clip();
      ctx.fillStyle = color;
      ctx.globalAlpha = 0.85;
      ctx.fillRect(x + 10, y + h - 2.5, w - 20, 2.5);
      ctx.restore();
      setFont(5.8, "bold");
      ctx.fillStyle = color;
      trackedText(GACHA_TIER_LABELS[tier], x + w / 2, y + 11, 0.8);
      setFont(9.5, "bold");
      ctx.fillStyle = UI.ink;
      trackedText(
        Math.round(GACHA_RATES[tier] * 100) + "%",
        x + w / 2,
        y + 20.5,
        0.4
      );
    }
    ctx.restore();
  }
  function drawGachaCollection() {
    const y = GACHA_UI.collectY;
    const collected = gachaCollected();
    const total = gachaTotal();
    const ratio = total ? collected / total : 0;
    ctx.save();
    ctx.textBaseline = "middle";
    setFont(7, "bold");
    ctx.fillStyle = "rgba(21,85,118,.55)";
    trackedText("\u0421\u041E\u0411\u0420\u0410\u041D\u041E", 20, y + 5, 1.4, "left");
    setFont(8.5, "bold");
    ctx.fillStyle = "#0f3d5c";
    trackedText(collected + " / " + total, 380, y + 5, 0.8, "right");
    ctx.restore();
    const barY = y + 16;
    roundedRect(20, barY, 360, 7, 3.5);
    ctx.fillStyle = "rgba(21,85,118,.12)";
    ctx.fill();
    if (ratio > 0) {
      ctx.save();
      roundedRect(20, barY, Math.max(7, 360 * ratio), 7, 3.5);
      ctx.clip();
      const fill = ctx.createLinearGradient(20, 0, 380, 0);
      fill.addColorStop(0, "#3fb8d8");
      fill.addColorStop(0.6, "#a855f7");
      fill.addColorStop(1, "#ff4d6d");
      ctx.fillStyle = fill;
      ctx.fillRect(20, barY, 360, 7);
      ctx.restore();
    }
  }
  function drawGachaReel() {
    const { x, y, w, h } = GACHA_UI.reel;
    const cellW = GACHA_UI.cellW;
    const strip = gachaReelFrames();
    const L = strip.length;
    const centerX = 200;
    const cy = y + h / 2 - 6;
    const elapsed = performance.now() - gachaState.startedAt;
    const p = Math.min(1, elapsed / gachaState.duration);
    const eased = 1 - Math.pow(1 - p, 3.2);
    const offset = eased * GACHA_REEL_STOP * cellW;
    ctx.save();
    roundedRect(x, y, w, h, 16);
    ctx.clip();
    ctx.fillStyle = "rgba(10,36,58,.96)";
    ctx.fillRect(x, y, w, h);
    const from = Math.floor((x - 40 - centerX + offset) / cellW) - 1;
    const to = Math.ceil((x + w + 40 - centerX + offset) / cellW) + 1;
    for (let k = from; k <= to; k++) {
      const index = (k % L + L) % L;
      const frame = strip[index];
      if (!frame) continue;
      const cx = centerX + k * cellW - offset;
      const color = gachaTierColor(frame);
      const distance = Math.min(1, Math.abs(cx - centerX) / (w / 2));
      const fade = 1 - distance * 0.55;
      ctx.save();
      ctx.globalAlpha = 0.3 * fade;
      ctx.beginPath();
      ctx.arc(cx, cy, 32, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();
      ctx.restore();
      ctx.save();
      ctx.globalAlpha = fade;
      ctx.beginPath();
      ctx.arc(cx, cy, 27, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(255,255,255,.94)";
      ctx.fill();
      ctx.restore();
      ctx.save();
      ctx.globalAlpha = fade;
      drawAvatarCircle(cx, cy, 22, selectedAvatar);
      drawFrame(cx, cy, 22, frame.id, true);
      ctx.restore();
      ctx.save();
      ctx.globalAlpha = fade;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      setFont(5.6, "bold");
      ctx.fillStyle = color;
      trackedText(GACHA_TIER_LABELS[GACHA_TIER(frame)], cx, cy + 42, 0.6);
      ctx.restore();
    }
    const edge = ctx.createLinearGradient(x, 0, x + w, 0);
    edge.addColorStop(0, "rgba(10,36,58,1)");
    edge.addColorStop(0.2, "rgba(10,36,58,0)");
    edge.addColorStop(0.8, "rgba(10,36,58,0)");
    edge.addColorStop(1, "rgba(10,36,58,1)");
    ctx.fillStyle = edge;
    ctx.fillRect(x, y, w, h);
    const spot = ctx.createRadialGradient(centerX, cy, 4, centerX, cy, 62);
    spot.addColorStop(0, "rgba(255,255,255,.20)");
    spot.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = spot;
    ctx.fillRect(x, y, w, h);
    ctx.restore();
    roundedRect(x + 0.75, y + 0.75, w - 1.5, h - 1.5, 16);
    ctx.strokeStyle = "rgba(255,255,255,.30)";
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.save();
    ctx.fillStyle = "#ffd54a";
    ctx.beginPath();
    ctx.moveTo(193, y - 9);
    ctx.lineTo(207, y - 9);
    ctx.lineTo(200, y + 1);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(193, y + h + 9);
    ctx.lineTo(207, y + h + 9);
    ctx.lineTo(200, y + h - 1);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }
  function drawGachaEquipped() {
    const { x, y, w, h } = GACHA_UI.panel;
    const frame = gachaEquippedFrame();
    const color = gachaTierColor(frame);
    const now = performance.now();
    drawGachaPanelGlow(color, 0.34);
    const cx = 200;
    const cy = y + 72;
    const pulse = 0.5 + 0.5 * Math.sin(now / 520);
    ctx.save();
    ctx.globalAlpha = 0.3 + pulse * 0.14;
    ctx.beginPath();
    ctx.arc(cx, cy, 52 + pulse * 3, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.restore();
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, 44, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(255,255,255,.95)";
    ctx.fill();
    ctx.restore();
    drawAvatarCircle(cx, cy, 36, selectedAvatar);
    drawFrame(cx, cy, 36, frame.id, false);
    ctx.save();
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    setFont(12, "bold");
    ctx.fillStyle = "#0f3d5c";
    trackedText(frame.name.toUpperCase(), cx, y + 140, 1);
    setFont(7, "bold");
    ctx.fillStyle = color;
    trackedText(GACHA_TIER_LABELS[GACHA_TIER(frame)], cx, y + 158, 2);
    setFont(6.5, "bold");
    ctx.fillStyle = "rgba(21,85,118,.42)";
    trackedText("\u0421\u0415\u0419\u0427\u0410\u0421 \u041D\u0410\u0414\u0415\u0422\u0410", cx, y + 174, 1.2);
    ctx.restore();
  }
  function drawGachaReveal() {
    const { x, y, w, h } = GACHA_UI.reel;
    const frame = gachaState.result;
    if (!frame) return;
    const color = gachaTierColor(frame);
    const tier = GACHA_TIER(frame);
    const elapsed = performance.now() - gachaState.startedAt;
    const appear = Math.min(1, elapsed / 260);
    const scale = 0.82 + appear * 0.18;
    const pop = Math.max(0, 1 - elapsed / 420);
    const cx = x + w / 2;
    const cy = y + h / 2 - 4;
    ctx.save();
    roundedRect(x, y, w, h, 16);
    ctx.clip();
    ctx.fillStyle = "rgba(10,36,58,.96)";
    ctx.fillRect(x, y, w, h);
    if (pop > 0) {
      ctx.save();
      ctx.globalAlpha = pop * 0.55;
      const flash = ctx.createRadialGradient(cx, cy, 6, cx, cy, 150);
      flash.addColorStop(0, "rgba(255,255,255,.95)");
      flash.addColorStop(0.4, color);
      flash.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = flash;
      ctx.fillRect(x, y, w, h);
      ctx.restore();
    }
    ctx.save();
    ctx.globalAlpha = appear;
    ctx.translate(cx, cy);
    ctx.scale(scale, scale);
    ctx.translate(-cx, -cy);
    const halo = ctx.createRadialGradient(cx, cy, 10, cx, cy, 92);
    halo.addColorStop(0, color);
    halo.addColorStop(1, "rgba(255,255,255,0)");
    ctx.save();
    ctx.globalAlpha = appear * 0.42;
    ctx.fillStyle = halo;
    ctx.beginPath();
    ctx.arc(cx, cy, 92, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    ctx.beginPath();
    ctx.arc(cx, cy, 44, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(255,255,255,.96)";
    ctx.fill();
    drawAvatarCircle(cx, cy, 36, selectedAvatar);
    drawFrame(cx, cy, 36, frame.id, false);
    ctx.restore();
    ctx.restore();
    roundedRect(x + 0.75, y + 0.75, w - 1.5, h - 1.5, 16);
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.8;
    ctx.stroke();
    ctx.save();
    ctx.globalAlpha = appear;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    setFont(12.5, "bold");
    ctx.fillStyle = color;
    ctx.shadowColor = color;
    ctx.shadowBlur = 12;
    trackedText(frame.name.toUpperCase(), 200, y + h + 18, 1);
    ctx.shadowBlur = 0;
    setFont(6.6, "bold");
    ctx.fillStyle = "rgba(21,85,118,.62)";
    trackedText(GACHA_TIER_LABELS[tier], 200, y + h + 32, 2);
    ctx.restore();
  }
  function drawGachaActionButton(x, y, w, h, label, tone, options = {}) {
    const { cost = 0, dim = false, busy = false, hoverKey = null } = options;
    const key = dim || busy ? "dim" : tone;
    const hovered = hoverKey ? pauseState.hover === hoverKey : false;
    const pulse = !dim && !busy ? 0.5 + 0.5 * Math.sin(performance.now() / 460) : 0;
    drawCasualButtonBase(x, y, w, h, key, hovered && !dim && !busy, pulse * 8);
    const cy = y + h / 2;
    const medR = Math.min(12, h * 0.24);
    const gap = 8;
    const text = busy ? "ОТКРЫВАЕМ…" : dim ? "НЕ ХВАТАЕТ" : label;
    const fg = (CASUAL_BUTTON_TONES[key] || CASUAL_BUTTON_TONES.blue).ink;
    setFont(11.5, "bold");
    const labelW = trackedWidth(text, 1.3);
    let badgeW = 0;
    if (!busy && cost) {
      setFont(10, "bold");
      badgeW = 25 + trackedWidth(String(cost), 0.4);
    }
    const groupW = medR * 2 + gap + labelW + (badgeW ? 10 + badgeW : 0);
    const gx = x + (w - groupW) / 2;
    drawCasualIconMedallion("spin", gx + medR, cy, medR, fg);
    drawCasualLabel(text, gx + medR * 2 + gap + labelW / 2, cy, 11.5, 1.3, fg);
    if (badgeW) {
      const bx = gx + groupW - badgeW;
      const bh = Math.min(23, h - 15);
      const coinR = Math.min(6, bh * 0.3);
      // Без подложки: монета и цена стоят прямо на кнопке.
      drawCoinBadge(bx + 4 + coinR, cy, coinR, 0);
      ctx.save();
      ctx.textBaseline = "middle";
      setFont(10, "bold");
      ctx.fillStyle = fg;
      trackedText(String(cost), bx + 4 + coinR * 2 + 3, cy + 0.4, 0.4, "left");
      ctx.restore();
    }
  }
  function drawGachaPlayButton() {
    drawMenuButton(GACHA_UI.playX, GACHA_UI.spinY, GACHA_UI.playW, GACHA_UI.spinH, "ИГРАТЬ", "ghostBlue", {
      size: 11,
      tracking: 1,
      icon: "play",
      hoverKey: "gacha-play"
    });
  }
  function drawGachaSpinButton() {
    const spinning = gachaState.phase === "spin";
    const canSpin = !spinning && bankCoins >= GACHA_COST;
    drawGachaActionButton(GACHA_UI.spinX, GACHA_UI.spinY, GACHA_UI.spinW, GACHA_UI.spinH, "КРУТИТЬ", "ghostGreen", {
      cost: GACHA_COST,
      dim: !canSpin,
      busy: spinning,
      hoverKey: "gacha-spin"
    });
  }

  function drawGachaHint() {
    const now = performance.now();
    let text = "\u0414\u0423\u0411\u041B\u0418\u041A\u0410\u0422 \u0412\u041E\u0417\u0412\u0420\u0410\u0429\u0410\u0415\u0422 " + Math.round(GACHA_COST * GACHA_DUPLICATE_REFUND) + " \u041C\u041E\u041D\u0415\u0422";
    if (gachaState.phase === "reveal" && gachaState.result) {
      text = gachaState.duplicate ? "\u0414\u0423\u0411\u041B\u0418\u041A\u0410\u0422 \xB7 +" + gachaState.refund + " \u041C\u041E\u041D\u0415\u0422" : "\u041D\u041E\u0412\u0410\u042F \u0420\u0410\u041C\u041A\u0410 \xB7 \u041D\u0410\u0414\u0415\u0422\u0410";
      if (gachaState.duplicate) {
        ctx.save();
        ctx.globalAlpha = 0.55 + 0.45 * Math.sin(now / 300);
        ctx.restore();
      }
    }
    ctx.save();
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    setFont(7, "bold");
    ctx.fillStyle = gachaState.phase === "reveal" ? gachaState.duplicate ? "#c28000" : "#0f8a76" : "rgba(21,85,118,.45)";
    trackedText(text, 200, GACHA_UI.hintY, 1.4);
    ctx.restore();
  }
  var PLATFORM_GACHA_COST = 30;
  var PLATFORM_DUPLICATE_REFUND = 0.5;
  var PLATFORM_SPIN_MS = 2400;
  var PLATFORM_REEL_LEN = 36;
  var PLATFORM_REEL_LAND = 30;
  var PLATFORM_UI = {
    panel: { x: 20, y: 80, w: 360, h: 122 },
    chipY: [210, 242],
    chipW: 80,
    chipH: 26,
    chipGap: 6,
    reel: { x: 20, y: 278, w: 360, h: 96 },
    cellStep: 90,
    resultY: 390,
    collectY: 410,
    tileY: 420,
    tileW: 28,
    tileH: 22,
    tileGap: 3
  };
  var platformPressStart = null;
  var platformShop = {
    typeIndex: 0,
    phase: "idle",
    startedAt: 0,
    strip: [],
    landing: 0,
    resultId: null,
    duplicate: false,
    refund: 0
  };
  function platformRectHit(point, r) {
    return point.x >= r.x && point.x <= r.x + r.w && point.y >= r.y && point.y <= r.y + r.h;
  }
  function platformChipRects() {
    return PLATFORM_TYPES.map((_, k) => {
      const row = k < 4 ? 0 : 1;
      const count = row === 0 ? 4 : 3;
      const col = row === 0 ? k : k - 4;
      const rowW = count * PLATFORM_UI.chipW + (count - 1) * PLATFORM_UI.chipGap;
      const x = 200 - rowW / 2 + col * (PLATFORM_UI.chipW + PLATFORM_UI.chipGap);
      return { x, y: PLATFORM_UI.chipY[row], w: PLATFORM_UI.chipW, h: PLATFORM_UI.chipH };
    });
  }
  function platformTileRects(type) {
    const ids = platformOwned[type] || [];
    const rowW = ids.length * PLATFORM_UI.tileW + (ids.length - 1) * PLATFORM_UI.tileGap;
    const x0 = 200 - rowW / 2;
    return ids.map((id, i) => ({
      id,
      x: x0 + i * (PLATFORM_UI.tileW + PLATFORM_UI.tileGap),
      y: PLATFORM_UI.tileY,
      w: PLATFORM_UI.tileW,
      h: PLATFORM_UI.tileH
    }));
  }
  function platformCurrentType() {
    return PLATFORM_TYPES[platformShop.typeIndex];
  }
  function platformShopSelectType(index) {
    if (platformShop.phase === "spin") return;
    const n = PLATFORM_TYPES.length;
    const next = (index % n + n) % n;
    if (next === platformShop.typeIndex) return;
    platformShop.typeIndex = next;
    platformShop.phase = "idle";
    platformShop.resultId = null;
    sfx.click();
  }
  function platformEquipSkin(id) {
    if (platformShop.phase === "spin") return;
    const skin = PLATFORM_SKIN_BY_ID[id];
    if (!skin || !(platformOwned[skin.type] || []).includes(id)) return;
    platformSelected[skin.type] = id;
    saveProgress();
    sfx.click();
  }
  function platformShopSpin() {
    if (platformShop.phase === "spin") return;
    const type = platformCurrentType();
    if (bankCoins < PLATFORM_GACHA_COST) {
      setMenuMessage("\u041D\u0435 \u0445\u0432\u0430\u0442\u0430\u0435\u0442 \u043C\u043E\u043D\u0435\u0442", "\u041D\u0443\u0436\u043D\u043E " + PLATFORM_GACHA_COST);
      sfx.click();
      return;
    }
    bankCoins -= PLATFORM_GACHA_COST;
    const tier = rollGachaTier();
    const fallback = ["divine", "legendary", "epic", "rare", "common"];
    let pool = platformSkinsOfTier(type, tier);
    for (const t of fallback) {
      if (pool.length) break;
      pool = platformSkinsOfTier(type, t);
    }
    const result = pool[Math.floor(Math.random() * pool.length)];
    const all = platformSkinsOf(type);
    const strip = [];
    for (let i = 0; i < PLATFORM_REEL_LEN; i++) {
      strip.push(i === PLATFORM_REEL_LAND ? result : all[Math.floor(Math.random() * all.length)]);
    }
    platformShop.phase = "spin";
    platformShop.startedAt = performance.now();
    platformShop.strip = strip;
    platformShop.landing = PLATFORM_REEL_LAND;
    platformShop.resultId = result.id;
    platformShop.duplicate = (platformOwned[type] || []).includes(result.id);
    platformShop.refund = 0;
    saveProgress();
    sfx.click();
  }
  function finishPlatformSpin() {
    const id = platformShop.resultId;
    const skin = id ? PLATFORM_SKIN_BY_ID[id] : null;
    if (!skin) {
      platformShop.phase = "idle";
      return;
    }
    if (platformShop.duplicate) {
      platformShop.refund = Math.round(PLATFORM_GACHA_COST * PLATFORM_DUPLICATE_REFUND);
      bankCoins += platformShop.refund;
    } else {
      platformOwned[skin.type] = [...platformOwned[skin.type] || [], skin.id];
      platformSelected[skin.type] = skin.id;
    }
    platformShop.phase = "reveal";
    platformShop.startedAt = performance.now();
    saveProgress();
  }
  function platformShopTap(point) {
    if (platformShop.phase === "spin") return;
    const chips = platformChipRects();
    for (let k = 0; k < chips.length; k++) {
      if (platformRectHit(point, chips[k])) {
        platformShopSelectType(k);
        return;
      }
    }
    for (const tile of platformTileRects(platformCurrentType())) {
      if (platformRectHit(point, tile)) {
        platformEquipSkin(tile.id);
        return;
      }
    }
    if (platformRectHit(point, { x: MENU.padX, y: MENU.barY, w: 228, h: MENU.barH })) {
      platformShopSpin();
      return;
    }
    if (platformRectHit(point, { x: 260, y: MENU.barY, w: 120, h: MENU.barH })) {
      startGame();
    }
  }
  function drawPlatformReelCell(cx, id) {
    const skin = PLATFORM_SKIN_BY_ID[id];
    if (!skin) return;
    drawPlatformSample(cx - 32, 318, 64, 10, skin);
    ctx.save();
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    setFont(7, "bold");
    ctx.fillStyle = GACHA_TIER_COLORS[skin.tier];
    trackedText(GACHA_TIER_LABELS[skin.tier], cx, 346, 0.8);
    ctx.restore();
  }
  function drawPlatformSample(x, y, w, h, skin) {
    const p = { x, y, w, h, type: skin.type, dir: 0 };
    const full = PLATFORM_SKIN_BY_ID[skin.id];
    ctx.save();
    if (!full || full.tier === "base") drawPlatformBase(p);
    else drawThemedPlatform(p, full);
    ctx.restore();
  }
  function drawPlatformShop() {
    const now = performance.now();
    if (platformShop.phase === "spin" && now - platformShop.startedAt >= PLATFORM_SPIN_MS) {
      finishPlatformSpin();
    }
    const type = platformCurrentType();
    const equippedId = equippedPlatformSkinId(type);
    const equipped = PLATFORM_SKIN_BY_ID[equippedId];
    const owned = (platformOwned[type] || []).length;
    const total = platformSkinsOf(type).length;
    const P = PLATFORM_UI.panel;
    roundedRect(P.x, P.y, P.w, P.h, 18);
    ctx.fillStyle = "rgba(255,255,255,.58)";
    ctx.fill();
    ctx.save();
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    setFont(8, "bold");
    ctx.fillStyle = UI.inkSoft;
    trackedText(PLATFORM_TYPE_LABEL[type].toUpperCase(), 200, 94, 1.4);
    drawPlatformSample(100, 112, 200, 20, equipped);
    setFont(12, "bold");
    ctx.fillStyle = HUD_COLORS.ink;
    trackedText(equipped.name.toUpperCase(), 200, 150, 0.6);
    setFont(8, "bold");
    ctx.fillStyle = GACHA_TIER_COLORS[equipped.tier];
    trackedText(GACHA_TIER_LABELS[equipped.tier] + " \xB7 " + owned + "/" + total, 200, 170, 1);
    ctx.restore();
    const chips = platformChipRects();
    chips.forEach((r, k) => {
      const active = k === platformShop.typeIndex;
      roundedRect(r.x, r.y, r.w, r.h, 13);
      ctx.fillStyle = active ? "#0f8a76" : "rgba(255,255,255,.62)";
      ctx.fill();
      ctx.save();
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      setFont(8, "bold");
      ctx.fillStyle = active ? "#ffffff" : UI.inkSoft;
      trackedText(PLATFORM_TYPE_SHORT[PLATFORM_TYPES[k]], r.x + r.w / 2, r.y + r.h / 2 + 0.5, 0.8);
      ctx.restore();
    });
    const R = PLATFORM_UI.reel;
    roundedRect(R.x, R.y, R.w, R.h, 16);
    ctx.fillStyle = "rgba(255,255,255,.58)";
    ctx.fill();
    ctx.save();
    roundedRect(R.x, R.y, R.w, R.h, 16);
    ctx.clip();
    let strip = [{ id: equippedId }];
    let pos = 0;
    if (platformShop.phase === "spin") {
      const t = Math.min(1, (now - platformShop.startedAt) / PLATFORM_SPIN_MS);
      strip = platformShop.strip;
      pos = (1 - Math.pow(1 - t, 3)) * platformShop.landing;
    } else if (platformShop.phase === "reveal") {
      strip = platformShop.strip;
      pos = platformShop.landing;
    }
    strip.forEach((s, i) => {
      const cx = 200 + (i - pos) * PLATFORM_UI.cellStep;
      if (Math.abs(cx - 200) > PLATFORM_UI.cellStep * 2.2) return;
      drawPlatformReelCell(cx, s.id);
    });
    ctx.restore();
    roundedRect(200 - 44, R.y + 6, 88, R.h - 12, 12);
    ctx.strokeStyle = "#e8a317";
    ctx.lineWidth = 1.6;
    ctx.stroke();
    ctx.save();
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    setFont(9, "bold");
    const res = platformShop.resultId ? PLATFORM_SKIN_BY_ID[platformShop.resultId] : null;
    if (platformShop.phase === "spin") {
      ctx.fillStyle = UI.inkSoft;
      trackedText("\u041A\u0420\u0423\u0422\u0418\u041C\u2026", 200, PLATFORM_UI.resultY, 1.2);
    } else if (platformShop.phase === "reveal" && res) {
      ctx.fillStyle = GACHA_TIER_COLORS[res.tier];
      const msg = platformShop.duplicate ? "\u0414\u0423\u0411\u041B\u0418\u041A\u0410\u0422 \xB7 +" + platformShop.refund + " \u041C\u041E\u041D\u0415\u0422" : "\u041D\u041E\u0412\u042B\u0419 \u0421\u041A\u0418\u041D \xB7 \u041D\u0410\u0414\u0415\u0422";
      trackedText(msg, 200, PLATFORM_UI.resultY, 1);
    } else {
      ctx.fillStyle = UI.inkSoft;
      trackedText("\u041A\u0420\u0423\u0422\u0418, \u0427\u0422\u041E\u0411\u042B \u041F\u041E\u041B\u0423\u0427\u0418\u0422\u042C \u0421\u041A\u0418\u041D \u0414\u041B\u042F " + PLATFORM_TYPE_SHORT[type], 200, PLATFORM_UI.resultY, 0.8);
    }
    ctx.restore();
    ctx.save();
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    setFont(7, "bold");
    ctx.fillStyle = UI.inkSoft;
    trackedText("\u041A\u041E\u041B\u041B\u0415\u041A\u0426\u0418\u042F \xB7 " + owned + "/" + total + " \xB7 \u041D\u0410\u0416\u041C\u0418, \u0427\u0422\u041E\u0411\u042B \u041D\u0410\u0414\u0415\u0422\u042C", 200, PLATFORM_UI.collectY, 0.8);
    ctx.restore();
    for (const tile of platformTileRects(type)) {
      roundedRect(tile.x, tile.y, tile.w, tile.h, 7);
      ctx.fillStyle = "rgba(255,255,255,.7)";
      ctx.fill();
      if (tile.id === equippedId) {
        roundedRect(tile.x + 0.75, tile.y + 0.75, tile.w - 1.5, tile.h - 1.5, 7);
        ctx.strokeStyle = "#0f8a76";
        ctx.lineWidth = 1.6;
        ctx.stroke();
      }
      ctx.save();
      roundedRect(tile.x, tile.y, tile.w, tile.h, 7);
      ctx.clip();
      const skin = PLATFORM_SKIN_BY_ID[tile.id];
      if (skin) drawPlatformSample(tile.x + 3, tile.y + 8, tile.w - 6, 6, skin);
      ctx.restore();
    }
    const spinBusy = platformShop.phase === "spin";
    const canAfford = bankCoins >= PLATFORM_GACHA_COST;
    drawGachaActionButton(MENU.padX, MENU.barY, 228, MENU.barH, "КРУТИТЬ", "ghostGold", {
      cost: PLATFORM_GACHA_COST,
      dim: !canAfford,
      busy: spinBusy,
      hoverKey: "platform-spin"
    });
    drawMenuButton(260, MENU.barY, 120, MENU.barH, "\u0418\u0413\u0420\u0410\u0422\u042C", "ghostBlue", { size: 11, tracking: 1, icon: "play", hoverKey: "platform-play" });
    ctx.save();
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    setFont(7, "bold");
    ctx.fillStyle = "rgba(21,85,118,.45)";
    trackedText(isCoarsePointer() ? "\u0422\u0418\u041F \u2014 \u041D\u0410\u0416\u041C\u0418 \u0424\u0418\u0428\u041A\u0423" : "\u2190 \u2192 \u0422\u0418\u041F \xB7 ENTER \u041A\u0420\u0423\u0422\u0418\u0422\u042C", 200, 566, 1.2);
    ctx.restore();
  }
  function drawGachaShop() {
    const now = performance.now();
    if (gachaState.phase === "spin" && now - gachaState.startedAt >= gachaState.duration) {
      finishGacha();
    }
    drawGachaCollection();
    roundedRect(GACHA_UI.panel.x, GACHA_UI.panel.y, GACHA_UI.panel.w, GACHA_UI.panel.h, 18);
    ctx.fillStyle = "rgba(255,255,255,.58)";
    ctx.fill();
    roundedRect(
      GACHA_UI.panel.x + 0.75,
      GACHA_UI.panel.y + 0.75,
      GACHA_UI.panel.w - 1.5,
      GACHA_UI.panel.h - 1.5,
      18
    );
    ctx.strokeStyle = "rgba(21,85,118,.10)";
    ctx.lineWidth = 1.2;
    ctx.stroke();
    if (gachaState.phase === "spin") {
      drawGachaReel();
    } else if (gachaState.phase === "reveal") {
      drawGachaReveal();
    } else {
      drawGachaEquipped();
    }
    drawGachaRates();
    drawGachaSpinButton();
    drawGachaPlayButton();
    drawGachaHint();
    drawGachaPicker();
  }
  function gachaOwnedList() {
    const list = FRAMES.filter((f) => ownedFrames.includes(f.id));
    return list.length ? list : [FRAMES[0]];
  }
  function gachaPickerCellX(index) {
    return GACHA_PICKER.viewX + index * (GACHA_PICKER.cellW + GACHA_PICKER.gap) - gachaState.pickerScroll;
  }
  function gachaPickerMaxScroll() {
    const count = gachaOwnedList().length;
    const content = count * (GACHA_PICKER.cellW + GACHA_PICKER.gap) - GACHA_PICKER.gap;
    return Math.max(0, content - GACHA_PICKER.viewW);
  }
  function clampGachaPicker() {
    gachaState.pickerScroll = Math.max(0, Math.min(gachaPickerMaxScroll(), gachaState.pickerScroll));
  }
  function gachaPickerIndexAt(point) {
    const top = GACHA_UI.picker.y + GACHA_PICKER.rowTop;
    const bottom = top + GACHA_PICKER.cellH;
    if (point.y < top - 4 || point.y > bottom + 4) return -1;
    if (point.x < GACHA_PICKER.viewX || point.x > GACHA_PICKER.viewX + GACHA_PICKER.viewW) return -1;
    const local = point.x - GACHA_PICKER.viewX + gachaState.pickerScroll;
    const index = Math.floor(local / (GACHA_PICKER.cellW + GACHA_PICKER.gap));
    if (index < 0 || index >= gachaOwnedList().length) return -1;
    const withinCell = local - index * (GACHA_PICKER.cellW + GACHA_PICKER.gap);
    if (withinCell > GACHA_PICKER.cellW) return -1;
    return index;
  }
  function isInsideGachaPicker(point) {
    const { y, h } = GACHA_UI.picker;
    return point.y >= y && point.y <= y + h;
  }
  function equipFrameById(id) {
    if (gachaState.phase === "reveal") {
      gachaState.phase = "idle";
      gachaState.result = null;
    }
    if (selectedFrame === id) {
      sfx.click();
      return;
    }
    selectedFrame = id;
    saveProgress();
    const frame = FRAMES.find((f) => f.id === id);
    setMenuMessage("\u0420\u0430\u043C\u043A\u0430 \u043D\u0430\u0434\u0435\u0442\u0430", "\xAB" + (frame ? frame.name : "\u2014") + "\xBB");
    sfx.click();
  }
  function gachaPickerRevealSelected() {
    const list = gachaOwnedList();
    const index = list.findIndex((f) => f.id === selectedFrame);
    if (index < 0) return;
    const cellLeft = index * (GACHA_PICKER.cellW + GACHA_PICKER.gap);
    const cellRight = cellLeft + GACHA_PICKER.cellW;
    if (cellLeft < gachaState.pickerScroll) {
      gachaState.pickerScroll = cellLeft;
    } else if (cellRight > gachaState.pickerScroll + GACHA_PICKER.viewW) {
      gachaState.pickerScroll = cellRight - GACHA_PICKER.viewW;
    }
    clampGachaPicker();
  }
  function drawGachaPicker() {
    const { y, h } = GACHA_UI.picker;
    const list = gachaOwnedList();
    const top = y + GACHA_PICKER.rowTop;
    const cy = top + 30;
    ctx.save();
    ctx.textBaseline = "middle";
    setFont(7, "bold");
    ctx.fillStyle = "rgba(21,85,118,.55)";
    trackedText("\u0422\u0412\u041E\u0418 \u0420\u0410\u041C\u041A\u0418", GACHA_PICKER.viewX, y + 8, 1.6, "left");
    setFont(6.5, "bold");
    ctx.fillStyle = "rgba(21,85,118,.38)";
    trackedText("\u041D\u0410\u0416\u041C\u0418, \u0427\u0422\u041E\u0411\u042B \u041D\u0410\u0414\u0415\u0422\u042C", GACHA_PICKER.viewX + GACHA_PICKER.viewW, y + 8, 1, "right");
    ctx.restore();
    ctx.save();
    ctx.beginPath();
    ctx.rect(GACHA_PICKER.viewX - 2, top - 6, GACHA_PICKER.viewW + 4, GACHA_PICKER.cellH + 14);
    ctx.clip();
    for (let i = 0; i < list.length; i++) {
      const frame = list[i];
      const x = gachaPickerCellX(i);
      if (x + GACHA_PICKER.cellW < GACHA_PICKER.viewX - 10) continue;
      if (x > GACHA_PICKER.viewX + GACHA_PICKER.viewW + 10) continue;
      const worn = frame.id === selectedFrame;
      const color = frame.look ? gachaTierColor(frame) : "rgba(21,85,118,.30)";
      const cx = x + GACHA_PICKER.cellW / 2;
      roundedRect(x, top, GACHA_PICKER.cellW, GACHA_PICKER.cellH, 12);
      ctx.fillStyle = worn ? "rgba(255,255,255,.96)" : "rgba(255,255,255,.52)";
      ctx.fill();
      if (worn) {
        roundedRect(x + 0.75, top + 0.75, GACHA_PICKER.cellW - 1.5, GACHA_PICKER.cellH - 1.5, 12);
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.stroke();
      }
      ctx.save();
      if (!worn) ctx.globalAlpha = 0.9;
      ctx.beginPath();
      ctx.arc(cx, cy, 21, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(255,255,255,.9)";
      ctx.fill();
      drawAvatarCircle(cx, cy, 17, selectedAvatar);
      drawFrame(cx, cy, 17, frame.id, true);
      ctx.restore();
      ctx.save();
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      const label = frame.id === 0 ? "\u041D\u0415\u0422" : frame.name.toUpperCase();
      setFont(5.8, "bold");
      const maxLabelW = MENU.cardW - 6;
      const labelW = trackedWidth(label, 0.4);
      const labelSize = labelW > maxLabelW ? 5.8 * maxLabelW / labelW : 5.8;
      setFont(labelSize, "bold");
      ctx.fillStyle = worn ? "#0f3d5c" : "rgba(21,85,118,.55)";
      trackedText(label, cx, cy + 32, 0.4);
      setFont(5.2, "bold");
      ctx.fillStyle = color;
      trackedText(frame.id === 0 ? "\u0411\u0410\u0417\u041E\u0412\u0410\u042F" : GACHA_TIER_LABELS[GACHA_TIER(frame)], cx, cy + 43, 0.5);
      ctx.restore();
      if (worn) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(x + GACHA_PICKER.cellW - 10, top + 10, 7, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 1.6;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(x + GACHA_PICKER.cellW - 12.6, top + 10);
        ctx.lineTo(x + GACHA_PICKER.cellW - 10.4, top + 12.3);
        ctx.lineTo(x + GACHA_PICKER.cellW - 7.2, top + 7.6);
        ctx.stroke();
        ctx.restore();
      }
    }
    const fadeL = ctx.createLinearGradient(GACHA_PICKER.viewX, 0, GACHA_PICKER.viewX + 18, 0);
    fadeL.addColorStop(0, "rgba(247,252,255,.95)");
    fadeL.addColorStop(1, "rgba(247,252,255,0)");
    ctx.fillStyle = fadeL;
    ctx.fillRect(GACHA_PICKER.viewX - 2, top - 6, 20, GACHA_PICKER.cellH + 14);
    const fadeR = ctx.createLinearGradient(
      GACHA_PICKER.viewX + GACHA_PICKER.viewW - 18,
      0,
      GACHA_PICKER.viewX + GACHA_PICKER.viewW,
      0
    );
    fadeR.addColorStop(0, "rgba(247,252,255,0)");
    fadeR.addColorStop(1, "rgba(247,252,255,.95)");
    ctx.fillStyle = fadeR;
    ctx.fillRect(GACHA_PICKER.viewX + GACHA_PICKER.viewW - 20, top - 6, 22, GACHA_PICKER.cellH + 14);
    ctx.restore();
    if (gachaPickerMaxScroll() > 0) {
      const trackW = 120;
      const trackX = 200 - trackW / 2;
      const trackY = y + h - 6;
      const ratio = GACHA_PICKER.viewW / (GACHA_PICKER.viewW + gachaPickerMaxScroll());
      const thumbW = Math.max(24, trackW * ratio);
      const t = gachaState.pickerScroll / gachaPickerMaxScroll();
      ctx.save();
      roundedRect(trackX, trackY, trackW, 3, 1.5);
      ctx.fillStyle = "rgba(21,85,118,.12)";
      ctx.fill();
      roundedRect(trackX + t * (trackW - thumbW), trackY, thumbW, 3, 1.5);
      ctx.fillStyle = "rgba(21,85,118,.42)";
      ctx.fill();
      ctx.restore();
    }
  }
  function gachaShopHitTest(point) {
    const y = GACHA_UI.spinY;
    const inRow = point.y >= y && point.y <= y + GACHA_UI.spinH;
    if (inRow && point.x >= GACHA_UI.spinX && point.x <= GACHA_UI.spinX + GACHA_UI.spinW) {
      return "spin";
    }
    if (inRow && point.x >= GACHA_UI.playX && point.x <= GACHA_UI.playX + GACHA_UI.playW) {
      return "play";
    }
    if (gachaState.phase === "reveal" && gachaState.result) {
      const panel = GACHA_UI.panel;
      if (point.x >= panel.x && point.x <= panel.x + panel.w && point.y >= panel.y && point.y <= panel.y + panel.h) {
        return "equip";
      }
    }
    return null;
  }
  function preloadShareAvatar(timeoutMs = 900) {
    const img = avatarImages[selectedAvatar];
    if (!img) return Promise.resolve();
    if (img.complete && img.naturalWidth > 0) return Promise.resolve();
    return new Promise((resolve) => {
      let settled = false;
      const done = () => {
        if (settled) return;
        settled = true;
        resolve();
      };
      if (typeof img.addEventListener === "function") {
        img.addEventListener("load", done, { once: true });
        img.addEventListener("error", done, { once: true });
      }
      setTimeout(done, timeoutMs);
    });
  }
  function buildShareCard(useImages = true) {
    const cv = document.createElement("canvas");
    cv.width = WORLD_W * RENDER_SCALE;
    cv.height = WORLD_H * RENDER_SCALE;
    const c = cv.getContext("2d");
    if (!c) return null;
    c.scale(RENDER_SCALE, RENDER_SCALE);
    const score = Math.floor(player.score);
    let painted = false;
    if (useImages) painted = paintFonBackground(c);
    if (!painted) {
      const scene = buildBiomeScene(biomeIndexForScore(score));
      if (scene) c.drawImage(scene, 0, 0, WORLD_W, WORLD_H);
      else {
        c.fillStyle = WINTER.skyLow;
        c.fillRect(0, 0, WORLD_W, WORLD_H);
      }
    }
    const scrim = c.createRadialGradient(200, 200, 80, 200, 320, 460);
    scrim.addColorStop(0, "rgba(9,24,40,.52)");
    scrim.addColorStop(1, "rgba(3,10,20,.88)");
    c.fillStyle = scrim;
    c.fillRect(0, 0, WORLD_W, WORLD_H);
    const mainCtx = ctx;
    ctx = c;
    try {
      drawShareComposition(score, useImages);
    } finally {
      ctx = mainCtx;
    }
    return cv;
  }
  function coinsWord(n) {
    const abs = Math.abs(Math.floor(n));
    const mod10 = abs % 10;
    const mod100 = abs % 100;
    if (mod10 === 1 && mod100 !== 11) return "\u041C\u041E\u041D\u0415\u0422\u0410";
    if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return "\u041C\u041E\u041D\u0415\u0422\u042B";
    return "\u041C\u041E\u041D\u0415\u0422";
  }
  var SHARE_LAYOUT = {
    /**
     * Стеклянная панель — тот же язык, что у экранов игры.
     *
     * Высота подобрана под содержимое: сверху и снизу по 40 px от края
     * до ближайшего элемента. Раньше панель была длиннее содержимого,
     * и снизу висела пустая полоса.
     */
    panel: { x: 38, y: 63, w: 324, h: 426, r: 28 },
    /** Аватар в рамке: диск чуть больше, чтобы рамка не липла к краю. */
    avatarY: 147,
    avatarR: 50,
    /** Ник под аватаром. */
    nickY: 240,
    /** Подпись «СЧЁТ» и само число. */
    scoreLabelY: 274,
    scoreY: 318,
    /** Плашка «новый рекорд» или строка «до рекорда». */
    badgeY: 368,
    /** Разделитель, подпись «всего монет» и строка с числом. */
    dividerY: 398,
    coinsLabelY: 422,
    coinsY: 448,
    /** Подпись игры под панелью. */
    brandY: 535
  };
  var SHARE_TEXT_MAX = SHARE_LAYOUT.panel.w - 68;
  function drawShareComposition(score, useImages = true) {
    const L = SHARE_LAYOUT;
    const P = L.panel;
    const cx = 200;
    ctx.save();
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.save();
    ctx.shadowColor = "rgba(6,20,36,.45)";
    ctx.shadowBlur = 34;
    ctx.shadowOffsetY = 12;
    roundedRect(P.x, P.y, P.w, P.h, P.r);
    ctx.fillStyle = "rgba(250,253,255,.94)";
    ctx.fill();
    ctx.restore();
    roundedRect(P.x + 0.75, P.y + 0.75, P.w - 1.5, P.h - 1.5, P.r);
    ctx.strokeStyle = "rgba(255,255,255,.98)";
    ctx.lineWidth = 1.6;
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(cx, L.avatarY, L.avatarR + 7, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(226,240,250,.95)";
    ctx.fill();
    if (imageUsableInCanvas(shareAvatarImage)) {
      drawImageCircle(cx, L.avatarY, L.avatarR, shareAvatarImage);
    } else if (imageUsableInCanvas(avatarImages[selectedAvatar])) {
      drawAvatarCircle(cx, L.avatarY, L.avatarR, selectedAvatar, true);
    } else {
      drawAvatarPlaceholder(cx, L.avatarY, L.avatarR, selectedAvatar);
    }
    drawFrame(cx, L.avatarY, L.avatarR, selectedFrame, true);
    const nick = normalizeNick(playerNick).toUpperCase();
    if (nick) {
      const nickSize = fitTextSize(nick, SHARE_TEXT_MAX, 1.2, 19, 11);
      setFont(nickSize, "bold");
      ctx.fillStyle = "#0f3d5c";
      trackedText(nick, cx, L.nickY, 1.2);
    }
    setFont(7.5, "bold");
    ctx.fillStyle = "rgba(21,85,118,.5)";
    trackedText("\u0421\u0427\u0401\u0422", cx, L.scoreLabelY, 2.6);
    const scoreText = fmt(score);
    const scoreSize = fitTextSize(scoreText, SHARE_TEXT_MAX, 0.5, 52, 30);
    setFont(scoreSize, "bold");
    ctx.fillStyle = "#0f3d5c";
    trackedText(scoreText, cx, L.scoreY, 0.5);
    if (gameOverState.newRecord) {
      setFont(8.5, "bold");
      const label = "\u041D\u041E\u0412\u042B\u0419 \u0420\u0415\u041A\u041E\u0420\u0414";
      const w = trackedWidth(label, 1.8) + 26;
      roundedRect(cx - w / 2, L.badgeY - 10, w, 20, 10);
      ctx.fillStyle = "#0f8a76";
      ctx.fill();
      ctx.fillStyle = "#ffffff";
      trackedText(label, cx, L.badgeY + 0.5, 1.8);
    } else if (highScore > score) {
      setFont(9, "bold");
      ctx.fillStyle = "rgba(21,85,118,.55)";
      trackedText(`\u0414\u041E \u0420\u0415\u041A\u041E\u0420\u0414\u0410 ${fmt(highScore - score)}`, cx, L.badgeY, 1.3);
    } else {
      setFont(9, "bold");
      ctx.fillStyle = "rgba(21,85,118,.55)";
      trackedText("\u0420\u0415\u041A\u041E\u0420\u0414 \u041F\u041E\u0412\u0422\u041E\u0420\u0401\u041D", cx, L.badgeY, 1.3);
    }
    ctx.strokeStyle = "rgba(21,85,118,.12)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(P.x + 34, L.dividerY);
    ctx.lineTo(P.x + P.w - 34, L.dividerY);
    ctx.stroke();
    setFont(6.5, "bold");
    ctx.fillStyle = "rgba(21,85,118,.45)";
    trackedText("\u0412\u0421\u0415\u0413\u041E \u041C\u041E\u041D\u0415\u0422", cx, L.coinsLabelY, 2.2);
    const coinsText = fmt(bankCoins);
    const coinsWordText = coinsWord(bankCoins);
    setFont(15, "bold");
    const coinsW = trackedWidth(coinsText, 0.6);
    setFont(8, "bold");
    const wordW = trackedWidth(coinsWordText, 1);
    const gap = 8;
    const wordGap = 6;
    const coinR = 9;
    const totalW = coinR * 2 + gap + coinsW + wordGap + wordW;
    const left = cx - totalW / 2;
    drawCoinBadge(left + coinR, L.coinsY, coinR, 0);
    setFont(15, "bold");
    ctx.fillStyle = "#0f3d5c";
    trackedText(coinsText, left + coinR * 2 + gap, L.coinsY + 0.5, 0.6, "left");
    setFont(8, "bold");
    ctx.fillStyle = "rgba(21,85,118,.62)";
    trackedText(coinsWordText, left + coinR * 2 + gap + coinsW + wordGap, L.coinsY + 1, 1, "left");
    setFont(7.5, "bold");
    ctx.fillStyle = "rgba(255,255,255,.62)";
    trackedText("\u041C\u041E\u0420\u042F\u041A\u0410 \xB7 \u0412\u0415\u0420\u0422\u0418\u041A\u0410\u041B\u042C\u041D\u042B\u0419 \u0420\u0410\u041D\u041D\u0415\u0420", cx, L.brandY, 1.7);
    ctx.restore();
  }
  async function shareResult() {
    const score = Math.floor(player.score);
    const toBlobSafe = (cv2) => new Promise((resolve) => {
      try {
        cv2.toBlob((blob2) => resolve(blob2), "image/png");
      } catch {
        resolve(null);
      }
    });
    await preloadShareAvatar();
    let cv = buildShareCard(true);
    let blob = cv ? await toBlobSafe(cv) : null;
    if (!blob) {
      cv = buildShareCard(false);
      blob = cv ? await toBlobSafe(cv) : null;
    }
    if (!cv || !blob) {
      showGameOverNotice("\u041D\u0415 \u0423\u0414\u0410\u041B\u041E\u0421\u042C \u0421\u041E\u0411\u0420\u0410\u0422\u042C \u041A\u0410\u0420\u0422\u0418\u041D\u041A\u0423");
      return;
    }
    const fileName = "moryaka-" + score + ".png";
    if (navigator.canShare) {
      try {
        const file = new File([blob], fileName, { type: "image/png" });
        if (navigator.canShare({ files: [file] })) {
          await navigator.share({
            files: [file],
            title: "\u041C\u041E\u0420\u042F\u041A\u0410",
            text: "\u041C\u043E\u0439 \u0441\u0447\u0451\u0442: " + fmt(score)
          });
          return;
        }
      } catch (error) {
        const name = error && error.name;
        if (name === "AbortError") return;
      }
    }
    try {
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      link.rel = "noopener";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(url), 1e4);
      showGameOverNotice("\u041A\u0410\u0420\u0422\u041E\u0427\u041A\u0410 \u0421\u041E\u0425\u0420\u0410\u041D\u0415\u041D\u0410");
    } catch {
      showGameOverNotice("\u041D\u0415 \u0423\u0414\u0410\u041B\u041E\u0421\u042C \u0421\u041E\u0425\u0420\u0410\u041D\u0418\u0422\u042C \u0424\u0410\u0419\u041B");
    }
  }
  var PERK_CARD = { y: 158, w: 114, h: 172, gap: 9 };
  var PERK_REROLL = { x: 95, y: 350, w: 210, h: 44, r: 22 };
  var PERK_REROLL_BASE = 5;
  function perkCardX(index) {
    const total = PERK_CARD.w * 3 + PERK_CARD.gap * 2;
    const left = (WORLD_W - total) / 2;
    return left + index * (PERK_CARD.w + PERK_CARD.gap);
  }
  function perkCardAt(point) {
    if (!perkState.offering) return -1;
    if (point.y < PERK_CARD.y || point.y > PERK_CARD.y + PERK_CARD.h) return -1;
    for (let i = 0; i < 3; i++) {
      const x = perkCardX(i);
      if (point.x >= x && point.x <= x + PERK_CARD.w) return i;
    }
    return -1;
  }
  function offerPerk() {
    perkState.offering = true;
    perkState.offerTitle = "ВЫБЕРИ УСИЛЕНИЕ";
    perkState.offerCards = rollPerkOffer();
    perkState.offerReadyAt = performance.now() + 350;
    perkState.pickedAt = 0;
    perkState.pickedIndex = -1;
    perkState.rerolls = 0;
  }
  function offerBossReward() {
    const used = new Set(perkState.active.map((a) => a.id));
    const rare = PERK_DEFS.filter((p) => p.rarity !== "common" && !used.has(p.id));
    const all = PERK_DEFS.filter((p) => !used.has(p.id));
    const bag = (rare.length >= 3 ? rare : all).slice();
    const cards = [];
    while (cards.length < 3 && bag.length) {
      const i = Math.floor(Math.random() * bag.length);
      cards.push(bag.splice(i, 1)[0]);
    }
    perkState.offering = true;
    perkState.offerTitle = "НАГРАДА ЗА БОССА";
    perkState.offerCards = cards;
    perkState.offerReadyAt = performance.now() + 350;
    perkState.pickedAt = 0;
    perkState.pickedIndex = -1;
    perkState.rerolls = 0;
  }
  function perkRerollCost() {
    return PERK_REROLL_BASE * Math.pow(2, perkState.rerolls);
  }
  function canAffordReroll() {
    return bankCoins >= perkRerollCost();
  }
  function rerollPerks() {
    if (!perkState.offering) return;
    if (performance.now() < perkState.offerReadyAt) return;
    const cost = perkRerollCost();
    if (bankCoins < cost) {
      sfx.hit();
      setMenuMessage("\u041D\u0435 \u0445\u0432\u0430\u0442\u0430\u0435\u0442 \u043C\u043E\u043D\u0435\u0442", "\u041D\u0443\u0436\u043D\u043E " + fmt(cost));
      return;
    }
    bankCoins -= cost;
    perkState.rerolls += 1;
    perkState.offerCards = rollPerkOffer();
    perkState.offerReadyAt = performance.now() + 140;
    perkState.pickedAt = 0;
    perkState.pickedIndex = -1;
    sfx.click();
    saveProgress();
  }
  function perkRerollButtonAt(point) {
    if (!perkState.offering) return false;
    if (point.y < PERK_REROLL.y || point.y > PERK_REROLL.y + PERK_REROLL.h) return false;
    return point.x >= PERK_REROLL.x && point.x <= PERK_REROLL.x + PERK_REROLL.w;
  }
  function drawPerkReroll(alpha) {
    const { x, y, w, h } = PERK_REROLL;
    const cost = perkRerollCost();
    const affordable = canAffordReroll();
    const hovered = pauseState.hover === "perk-reroll";
    ctx.save();
    ctx.globalAlpha = alpha;
    uiPill(x, y, w, h, {
      fill: affordable ? hovered ? UI.surfaceSolid : UI.surface : UI.surfaceDim
    });
    const midY = y + h / 2;
    const label = "\u0420\u0415\u0420\u041E\u041B\u041B";
    const labelSize = 9;
    const labelTrack = 1.6;
    const priceText = fmt(cost);
    const priceSize = 9.5;
    const priceTrack = 0.6;
    const coinR = 7;
    const gapLabel = 8;
    const gapPrice = 6;
    setFont(labelSize, "bold");
    const labelW = trackedWidth(label, labelTrack);
    setFont(priceSize, "bold");
    const priceW = trackedWidth(priceText, priceTrack);
    const total = labelW + gapLabel + coinR * 2 + gapPrice + priceW;
    let cursor = x + w / 2 - total / 2;
    ctx.textBaseline = "middle";
    setFont(labelSize, "bold");
    ctx.fillStyle = affordable ? UI.ink : UI.inkSoft;
    trackedText(label, cursor, midY, labelTrack, "left");
    cursor += labelW + gapLabel;
    ctx.save();
    if (!affordable) ctx.globalAlpha = alpha * 0.45;
    drawCoinBadge(cursor + coinR, midY, coinR, 0);
    ctx.restore();
    cursor += coinR * 2 + gapPrice;
    setFont(priceSize, "bold");
    ctx.fillStyle = affordable ? UI.goldText : UI.inkSoft;
    trackedText(priceText, cursor, midY, priceTrack, "left");
    setFont(5.8, "bold");
    ctx.fillStyle = affordable ? UI.inkSoft : "rgba(18,58,92,.30)";
    trackedText("\u0441\u043B\u0435\u0434\u0443\u044E\u0449\u0438\u0439 " + fmt(cost * 2), x + w / 2, y + h + 14, 0.7);
    ctx.restore();
  }
  function choosePerk(index) {
    if (!perkState.offering) return;
    if (performance.now() < perkState.offerReadyAt) return;
    const perk = perkState.offerCards[index];
    if (!perk) return;
    applyPerk(perk);
    perkState.pickedIndex = index;
    perkState.pickedAt = performance.now();
    perkState.offering = false;
    lastFrameTime = 0;
  }
  function perkDurationText(card) {
    const spans = (card.mods || []).map(([, , span]) => span);
    if (card.coins) spans.push(card.coins.span);
    if (!spans.length) return null;
    return "\u043D\u0430 " + fmt(Math.max(...spans)) + " \u043E\u0447\u043A\u043E\u0432";
  }
  function drawPerkCard(card, index, alpha) {
    const x = perkCardX(index);
    const y = PERK_CARD.y;
    const w = PERK_CARD.w;
    const h = PERK_CARD.h;
    const now = performance.now();
    const info = PERK_RARITY[card.rarity] || PERK_RARITY.common;
    const hovered = pauseState.hover === "perk" + index;
    const chosen = perkState.pickedIndex === index;
    const legend = card.rarity === "legendary";
    ctx.save();
    ctx.globalAlpha = alpha;
    const stagger = Math.max(0, Math.min(1, (now - perkState.offerReadyAt + 350 - index * 70) / 220));
    ctx.translate(0, (1 - stagger) * 16);
    const pulse = legend ? 0.5 + 0.5 * Math.sin(now / 420) : 0;
    ctx.shadowColor = hovered ? info.glow : "rgba(10,40,60,.22)";
    ctx.shadowBlur = hovered ? 20 + pulse * 8 : 16;
    ctx.shadowOffsetY = 6;
    roundedRect(x, y, w, h, 14);
    ctx.fillStyle = chosen ? "rgba(236,255,250,.98)" : "rgba(255,255,255,.97)";
    ctx.fill();
    ctx.restore();
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.save();
    roundedRect(x, y, w, h, 14);
    ctx.clip();
    const bar = ctx.createLinearGradient(x, y, x, y + 54);
    bar.addColorStop(0, info.color);
    bar.addColorStop(1, "rgba(255,255,255,0)");
    ctx.globalAlpha = alpha * (0.16 + pulse * 0.08);
    ctx.fillStyle = bar;
    ctx.fillRect(x, y, w, 54);
    if (legend) {
      ctx.globalAlpha = alpha * (0.1 + pulse * 0.1);
      const shine = ctx.createLinearGradient(x, y + h, x + w, y);
      shine.addColorStop(0, "rgba(255,215,90,0)");
      shine.addColorStop(0.5, "#ffd75a");
      shine.addColorStop(1, "rgba(255,215,90,0)");
      ctx.fillStyle = shine;
      ctx.fillRect(x, y, w, h);
    }
    ctx.restore();
    ctx.globalAlpha = alpha;
    roundedRect(x + 0.75, y + 0.75, w - 1.5, h - 1.5, 14);
    ctx.strokeStyle = hovered ? info.color : hexToRgba(info.color, 0.55);
    ctx.lineWidth = hovered ? info.ring + 0.6 : info.ring;
    ctx.stroke();
    ctx.save();
    ctx.textBaseline = "middle";
    const pips = { common: 1, rare: 2, epic: 3, legendary: 1 }[card.rarity] || 1;
    const pipY = y + 9;
    const pipStart = x + w / 2 - (pips - 1) * 4.5;
    ctx.fillStyle = hexToRgba(info.color, 0.9);
    for (let k = 0; k < pips; k++) {
      const px = pipStart + k * 9;
      if (legend) {
        ctx.beginPath();
        ctx.moveTo(px, pipY - 4.5);
        ctx.lineTo(px + 4.5, pipY);
        ctx.lineTo(px, pipY + 4.5);
        ctx.lineTo(px - 4.5, pipY);
        ctx.closePath();
        ctx.stroke();
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.arc(px, pipY, 1.4, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.beginPath();
        ctx.arc(px, pipY, 2.1, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    setFont(4.8, "bold");
    ctx.fillStyle = hexToRgba(info.color, 0.95);
    trackedText(info.label, x + w / 2, y + 21, 0.7);
    ctx.restore();
    drawPerkIcon(card.icon, x + w / 2, y + 52, info.color);
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    const titleSize = fitTextSize(card.title, w - 12, 0.3, 9.5, 6);
    setFont(titleSize, "bold");
    ctx.fillStyle = info.color;
    trackedText(card.title, x + w / 2, y + 90, 0.3);
    const textW = w - 12;
    const hintLines = wrapLines(card.hint, textW, 0.5);
    const durationText = perkDurationText(card);
    const subText = durationText ? card.hint2 && /счёт\s*\+/.test(card.hint2) ? card.hint2.replace(/счёт\s*\+[\s\d]+/, durationText) : durationText : card.hint2;
    const hint2Lines = subText ? wrapLines(subText, textW, 0.4) : [];
    let hintLH = 9.8;
    let hint2LH = 8.8;
    let blockGap = 5;
    const availTop = y + 104;
    const availBottom = y + h - 12;
    const avail = availBottom - availTop;
    const blockHeight = () => hintLines.length * hintLH + (hint2Lines.length ? blockGap + hint2Lines.length * hint2LH : 0);
    if (blockHeight() > avail) {
      const k = avail / blockHeight();
      hintLH *= k;
      hint2LH *= k;
      blockGap *= k;
    }
    const blockH = blockHeight();
    const firstY = availTop + (avail - blockH) / 2 + hintLH / 2;
    setFont(6.6, "bold");
    ctx.fillStyle = "rgba(21,85,118,.80)";
    let lineY = firstY;
    for (const line of hintLines) {
      trackedText(line, x + w / 2, lineY, 0.5);
      lineY += hintLH;
    }
    if (hint2Lines.length) {
      lineY = firstY + (hintLines.length - 1) * hintLH + blockGap + hint2LH;
      setFont(6, "bold");
      ctx.fillStyle = "rgba(21,85,118,.50)";
      for (const line of hint2Lines) {
        trackedText(line, x + w / 2, lineY, 0.4);
        lineY += hint2LH;
      }
    }
    ctx.restore();
  }
  function wrapLines(text, maxWidth, tracking) {
    const words = String(text).split(" ");
    const lines = [];
    let line = "";
    for (const word of words) {
      const test = line ? line + " " + word : word;
      if (trackedWidth(test, tracking) > maxWidth && line) {
        lines.push(line);
        line = word;
      } else {
        line = test;
      }
    }
    if (line) lines.push(line);
    return lines;
  }
  function drawPerkOffer() {
    if (!perkState.offering && !perkState.pickedAt) return;
    const now = performance.now();
    const sincePick = perkState.pickedAt ? now - perkState.pickedAt : 0;
    if (perkState.pickedAt && sincePick > 320) return;
    const alpha = perkState.pickedAt ? Math.max(0, 1 - sincePick / 320) : Math.min(1, (now - perkState.offerReadyAt + 350) / 200);
    ctx.save();
    ctx.fillStyle = `rgba(6,26,44,${0.42 * alpha})`;
    ctx.fillRect(0, 0, WORLD_W, WORLD_H);
    ctx.restore();
    ctx.save();
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.globalAlpha = alpha;
    setFont(9, "bold");
    ctx.fillStyle = "rgba(255,255,255,.78)";
    trackedText(perkState.offerTitle || "ВЫБЕРИ УСИЛЕНИЕ", 200, 118, 2.4);
    setFont(6.2, "bold");
    ctx.fillStyle = "rgba(255,255,255,.45)";
    trackedText("\u041E\u0411\u042B\u0427\u041D\u042B\u0419 \xB7 \u0420\u0415\u0414\u041A\u0418\u0419 \xB7 \u042D\u041F\u0418\u0427\u0415\u0421\u041A\u0418\u0419 \xB7 \u041B\u0415\u0413\u0415\u041D\u0414\u0410\u0420\u041D\u042B\u0419", 200, 133, 0.9);
    ctx.restore();
    for (let i = 0; i < 3; i++) {
      if (perkState.offerCards[i]) drawPerkCard(perkState.offerCards[i], i, alpha);
    }
    drawPerkReroll(alpha);
  }
  var resetButton = document.getElementById("resetButton");
  var resetOverlay = document.getElementById("resetOverlay");
  var resetCancel = document.getElementById("resetCancel");
  var resetConfirm = document.getElementById("resetConfirm");
  var PROGRESS_KEYS = [
    "morjakaBankCoins",
    "morjakaUnlockedCharacters",
    "morjakaSelectedCharacter",
    "morjakaSelectedFrame",
    "morjakaOwnedFrames",
    "morjakaPlatformOwned",
    "morjakaPlatformSelected",
    "doodleHighScore",
    "morjakaDailyDate",
    "morjakaDailyId",
    "morjakaDailyProgress",
    "morjakaDailyDone",
    "morjakaDailyStreak",
    "morjakaDailyLastDone",
    "morjakaStats",
    "morjakaAchievements"
  ];
  var SAVE_KEYS = PROGRESS_KEYS.concat(["morjakaNick", "morjakaSound", "morjakaKeySens", "morjakaMouseSens", "morjakaPadSens", "morjakaPadZone"]);
  var saveOverlay = document.getElementById("saveOverlay");
  var saveText = document.getElementById("saveText");
  var saveCopy = document.getElementById("saveCopy");
  var saveLoad = document.getElementById("saveLoad");
  var saveClose = document.getElementById("saveClose");
  var saveOpen = false;
  function saveEncode(text) {
    const bytes = new TextEncoder().encode(text);
    let bin = "";
    for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
    return btoa(bin);
  }
  function saveDecode(code) {
    const bin = atob(code.trim());
    const bytes = Uint8Array.from(bin, (ch) => ch.charCodeAt(0));
    return new TextDecoder().decode(bytes);
  }
  function exportProgressCode() {
    const data = {};
    for (const key of SAVE_KEYS) {
      const value = localStorage.getItem(key);
      if (value !== null) data[key] = value;
    }
    return saveEncode(JSON.stringify({ v: 1, data }));
  }
  function decodeProgressCode(code) {
    try {
      const parsed = JSON.parse(saveDecode(code));
      if (!parsed || parsed.v !== 1 || !parsed.data || typeof parsed.data !== "object") return null;
      return parsed.data;
    } catch (error) {
      return null;
    }
  }
  function openSaveDialog() {
    if (!saveOverlay || !saveText) return;
    saveOpen = true;
    saveText.value = exportProgressCode();
    saveOverlay.classList.add("open");
    saveOverlay.setAttribute("aria-hidden", "false");
    if (saveLoad) saveLoad.textContent = "ЗАГРУЗИТЬ";
    if (saveText.focus) {
      saveText.focus();
      saveText.select();
    }
  }
  function closeSaveDialog() {
    if (!saveOverlay) return;
    saveOpen = false;
    saveOverlay.classList.remove("open");
    saveOverlay.setAttribute("aria-hidden", "true");
  }
  function importProgressCode() {
    if (!saveText) return;
    const data = decodeProgressCode(saveText.value);
    if (!data) {
      if (saveLoad) {
        saveLoad.textContent = "НЕВЕРНЫЙ КОД";
        setTimeout(() => { if (saveLoad) saveLoad.textContent = "ЗАГРУЗИТЬ"; }, 1500);
      }
      return;
    }
    let applied = 0;
    for (const key in data) {
      if (!SAVE_KEYS.includes(key) || typeof data[key] !== "string") continue;
      localStorage.setItem(key, data[key]);
      applied++;
    }
    if (!applied) {
      if (saveLoad) {
        saveLoad.textContent = "НЕВЕРНЫЙ КОД";
        setTimeout(() => { if (saveLoad) saveLoad.textContent = "ЗАГРУЗИТЬ"; }, 1500);
      }
      return;
    }
    if (saveLoad) saveLoad.textContent = "ЗАГРУЖЕНО";
    setTimeout(() => location.reload(), 350);
  }
  if (saveCopy) {
    saveCopy.addEventListener("click", async () => {
      if (!saveText) return;
      saveText.select();
      try {
        await navigator.clipboard.writeText(saveText.value);
      } catch (error) {
        try { document.execCommand("copy"); } catch (fallback) {}
      }
      saveCopy.textContent = "СКОПИРОВАНО";
      setTimeout(() => { saveCopy.textContent = "СКОПИРОВАТЬ"; }, 1200);
    });
  }
  if (saveLoad) saveLoad.addEventListener("click", importProgressCode);
  if (saveClose) saveClose.addEventListener("click", closeSaveDialog);
  if (saveOverlay) {
    saveOverlay.addEventListener("pointerdown", (event) => {
      if (event.target === saveOverlay) closeSaveDialog();
    });
  }
  var resetOpen = false;
  var nickOverlay = document.getElementById("nickOverlay");
  var nickInput = document.getElementById("nickInput");
  var nickCancel = document.getElementById("nickCancel");
  var nickConfirm = document.getElementById("nickConfirm");
  var nickOpen = false;
  var nickOnDone = null;
  function askNick(then) {
    if (!nickOverlay || !nickInput) {
      then();
      return;
    }
    nickOpen = true;
    nickOnDone = then;
    nickInput.value = playerNick;
    nickOverlay.classList.add("open");
    nickOverlay.setAttribute("aria-hidden", "false");
    sfx.click();
    if (nickInput.focus) {
      nickInput.focus();
      if (nickInput.select) nickInput.select();
    }
  }
  function closeNickDialog(runDone) {
    if (!nickOverlay || !nickOpen) return;
    nickOpen = false;
    nickOverlay.classList.remove("open");
    nickOverlay.setAttribute("aria-hidden", "true");
    const done = nickOnDone;
    nickOnDone = null;
    if (runDone && done) done();
  }
  function confirmNick() {
    if (!nickInput) return;
    saveNick(nickInput.value);
    sfx.click();
    closeNickDialog(true);
  }
  function openResetDialog() {
    if (!resetOverlay || resetOpen) return;
    resetOpen = true;
    resetOverlay.classList.add("open");
    resetOverlay.setAttribute("aria-hidden", "false");
    if (currentState === STATE.PLAYING) pauseGame();
    sfx.click();
    if (resetCancel && resetCancel.focus) resetCancel.focus();
  }
  function closeResetDialog() {
    if (!resetOverlay || !resetOpen) return;
    resetOpen = false;
    resetOverlay.classList.remove("open");
    resetOverlay.setAttribute("aria-hidden", "true");
    sfx.click();
  }
  function resetAllProgress() {
    try {
      for (const key of PROGRESS_KEYS) localStorage.removeItem(key);
    } catch (error) {
      console.warn("\u041D\u0435 \u0443\u0434\u0430\u043B\u043E\u0441\u044C \u043E\u0447\u0438\u0441\u0442\u0438\u0442\u044C \u0441\u043E\u0445\u0440\u0430\u043D\u0435\u043D\u0438\u044F:", error);
    }
    savedProgress.clear();
    bankCoins = 0;
    highScore = 0;
    unlockedAvatars = getUnlockedAvatars(0);
    selectedAvatar = 0;
    selectedFrame = 0;
    ownedFrames = [0];
    for (const type of PLATFORM_TYPES) {
      const base = baseSkinId(type);
      platformOwned[type] = [base];
      platformSelected[type] = base;
    }
    menuCursors.avatars = 0;
    menuCursors.shop = 0;
    menuState.scroll = 0;
    menuState.tab = "avatars";
    dailyState = { date: "", id: "", progress: 0, done: false, streak: 0, lastDone: "" };
    stats = defaultStats();
    achievementsClaimed = [];
    initDaily(true);
    perkState.lastOfferScore = 0;
    resetPerks();
    gameOverState.newRecord = false;
    gameOverState.openedAt = 0;
    gameOverCache.key = null;
    resetGame();
    resetHud();
    currentState = STATE.MENU;
    lastFrameTime = 0;
    pauseState.hover = null;
    gachaState.phase = "idle";
    gachaState.result = null;
    gachaState.duplicate = false;
    gachaState.refund = 0;
    gachaState.pickerScroll = 0;
    closeResetDialog();
    setMenuMessage("\u041F\u0440\u043E\u0433\u0440\u0435\u0441\u0441 \u0441\u0431\u0440\u043E\u0448\u0435\u043D", "\u0412\u0441\u0451 \u043D\u0430\u0447\u0438\u043D\u0430\u0435\u0442\u0441\u044F \u0437\u0430\u043D\u043E\u0432\u043E");
    saveProgress();
  }
  if (resetButton) {
    resetButton.addEventListener("click", (event) => {
      event.preventDefault();
      openResetDialog();
    });
  }
  if (resetCancel) {
    resetCancel.addEventListener("click", (event) => {
      event.preventDefault();
      closeResetDialog();
    });
  }
  if (resetConfirm) {
    resetConfirm.addEventListener("click", (event) => {
      event.preventDefault();
      resetAllProgress();
    });
  }
  if (nickOverlay) {
    nickOverlay.addEventListener("pointerdown", (event) => {
      if (event.target === nickOverlay) closeNickDialog(false);
    });
  }
  if (nickCancel) nickCancel.addEventListener("click", () => closeNickDialog(false));
  if (nickConfirm) nickConfirm.addEventListener("click", confirmNick);
  if (resetOverlay) {
    resetOverlay.addEventListener("pointerdown", (event) => {
      if (event.target === resetOverlay) closeResetDialog();
    });
  }
  function drawSpikesOverlay() {
    if (!spikesActiveNow() || currentState !== STATE.PLAYING) return;
    const now = frameNow();
    ctx.save();
    for (const p of platforms) {
      if (!isSpiky(p)) continue;
      const baseY = p.y + 2.2;

      // Наледь, из которой растут шипы.
      const rim = ctx.createLinearGradient(0, p.y - 2.6, 0, p.y + 3.2);
      rim.addColorStop(0, "rgba(255,255,255,.96)");
      rim.addColorStop(0.62, "rgba(203,238,251,.88)");
      rim.addColorStop(1, "rgba(146,202,228,.52)");
      ctx.fillStyle = rim;
      roundedRect(p.x + 0.5, p.y - 2.2, p.w - 1, 4.6, 2.3);
      ctx.fill();

      // Морозная тревога: тонкая холодная тень по верхней кромке.
      ctx.fillStyle = "rgba(203,52,64,.20)";
      roundedRect(p.x + 2, p.y + 2.4, p.w - 4, 1.6, 0.8);
      ctx.fill();

      // Раскладка из src/game/spikes-layout.ts: отступы от краёв и стабильная высота.
      for (const spike of spikeLayout(p)) {
        const x = spike.x;
        const half = spike.half;
        const h = spike.height;

        // Тень у основания: шип «врос» в наледь.
        ctx.fillStyle = "rgba(26,78,110,.16)";
        ctx.beginPath();
        ctx.ellipse(x + half, baseY - 0.4, half * 1.15, 1.5, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(x, baseY);
        ctx.quadraticCurveTo(x + half * 0.7, baseY - h * 0.62, x + half, baseY - h);
        ctx.quadraticCurveTo(x + half * 1.3, baseY - h * 0.6, x + half * 2, baseY);
        ctx.closePath();
        const ice = ctx.createLinearGradient(x + half, baseY - h, x + half, baseY);
        ice.addColorStop(0, "#ffffff");
        ice.addColorStop(0.4, "#eaf9ff");
        ice.addColorStop(0.75, "#a9dcf2");
        ice.addColorStop(1, "#6caece");
        ctx.fillStyle = ice;
        ctx.fill();

        // Светлая левая грань.
        ctx.strokeStyle = "rgba(255,255,255,.9)";
        ctx.lineWidth = 0.9;
        ctx.beginPath();
        ctx.moveTo(x + half * 0.94, baseY - h + 1.4);
        ctx.quadraticCurveTo(x + half * 0.72, baseY - h * 0.55, x + half * 0.3, baseY - 1);
        ctx.stroke();

        // Тёмная правая грань — объём.
        ctx.strokeStyle = "rgba(36,92,126,.42)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x + half * 1.02, baseY - h + 1.6);
        ctx.quadraticCurveTo(x + half * 1.28, baseY - h * 0.5, x + half * 1.72, baseY - 1);
        ctx.stroke();

        // Мерцание на кончике.
        const glint = Math.max(0, Math.sin(now * 2.2 + Math.round(x) * 0.19));
        if (glint > 0.55) {
          ctx.globalAlpha = (glint - 0.55) * 1.6;
          ctx.fillStyle = "#ffffff";
          ctx.beginPath();
          ctx.arc(x + half * 0.98, baseY - h * 0.86, 1.1, 0, Math.PI * 2);
          ctx.fill();
          ctx.globalAlpha = 1;
        }
      }
    }
    ctx.restore();
  }
  function drawWalls() {
    const inset = wallsInset();
    if (inset <= 0) return;
    ctx.save();
    ctx.fillStyle = "rgba(120,150,180,0.85)";
    ctx.fillRect(-30, -30, inset + 30, WORLD_H + 60);
    ctx.fillRect(WORLD_W - inset, -30, inset + 30, WORLD_H + 60);
    ctx.restore();
  }
  function wrapText(text, maxW) {
    const out = [];
    let cur = "";
    for (const word of text.split(" ")) {
      const t = cur ? cur + " " + word : word;
      if (ctx.measureText(t).width > maxW && cur) {
        out.push(cur);
        cur = word;
      } else {
        cur = t;
      }
    }
    if (cur) out.push(cur);
    return out;
  }
  function drawEventIntro() {
    const info = EVENT_INFO[introKind];
    if (!info) return;
    const reading = eventIntroMs > 0;
    const passed = EVENT_INTRO_MS - eventIntroMs;
    const fadeIn = reading ? Math.min(1, passed / EVENT_FADE_MS) : 1;
    const fadeOut = reading ? Math.min(1, eventIntroMs / EVENT_FADE_MS) : Math.min(1, eventCountdownMs / EVENT_FADE_MS);
    const alpha = Math.min(fadeIn, fadeOut);
    const accent = EVENT_ACCENTS[introKind] || HUD_COLORS.green;
    const cw = 316, pad = 20;
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = "rgba(8,28,46,0.34)";
    ctx.fillRect(0, 0, WORLD_W, WORLD_H);
    setFont(10.5, "normal");
    const lines = wrapText(info.text, cw - pad * 2);
    const textBlock = lines.length * 15;
    const barBlock = reading ? 0 : 42;
    const ch = 30 + 18 + 24 + 8 + textBlock + barBlock + 18;
    const cx = (WORLD_W - cw) / 2;
    const cy = 190 - (1 - alpha) * 22;
    // Мягкая тень и светлая стеклянная карточка.
    ctx.save();
    ctx.shadowColor = "rgba(10,40,62,.22)";
    ctx.shadowBlur = 24;
    ctx.shadowOffsetY = 10;
    roundedRect(cx, cy, cw, ch, 18);
    ctx.fillStyle = "rgba(255,255,255,.97)";
    ctx.fill();
    ctx.restore();
    ctx.save();
    roundedRect(cx, cy, cw, ch, 18);
    ctx.clip();
    const top = ctx.createLinearGradient(cx, cy, cx, cy + 58);
    top.addColorStop(0, hexToRgba(accent, 0.20));
    top.addColorStop(1, hexToRgba(accent, 0));
    ctx.fillStyle = top;
    ctx.fillRect(cx, cy, cw, 58);
    ctx.restore();
    roundedRect(cx + 0.75, cy + 0.75, cw - 1.5, ch - 1.5, 17.5);
    ctx.strokeStyle = hexToRgba(accent, 0.35);
    ctx.lineWidth = 1.2;
    ctx.stroke();
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    // Плашка «новое событие».
    const label = "НОВОЕ СОБЫТИЕ";
    setFont(6.4, "bold");
    const pillW = trackedWidth(label, 1.6) + 16;
    const pillX = WORLD_W / 2 - pillW / 2;
    const pillY = cy + 16;
    roundedRect(pillX, pillY, pillW, 14, 7);
    ctx.fillStyle = hexToRgba(accent, 0.12);
    ctx.fill();
    ctx.strokeStyle = hexToRgba(accent, 0.22);
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.fillStyle = accent;
    trackedText(label, WORLD_W / 2, pillY + 7.5, 1.6);
    // Заголовок и разделитель.
    setFont(17, "bold");
    ctx.fillStyle = HUD_COLORS.ink;
    ctx.fillText(info.title, WORLD_W / 2, cy + 48);
    const divY = cy + 61;
    ctx.strokeStyle = hexToRgba(accent, 0.38);
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(WORLD_W / 2 - 23, divY);
    ctx.lineTo(WORLD_W / 2 + 23, divY);
    ctx.stroke();
    // Описание.
    setFont(10.5, "normal");
    ctx.fillStyle = "rgba(38,62,84,.88)";
    const textY = divY + 16;
    lines.forEach((line, i) => ctx.fillText(line, WORLD_W / 2, textY + i * 15));
    // Обратный отсчёт.
    if (!reading) {
      const n = Math.ceil(eventCountdownMs / 1e3);
      const progress = 1 - Math.max(0, eventCountdownMs) / EVENT_COUNTDOWN_MS;
      const countY = textY + textBlock + 10;
      setFont(7, "bold");
      ctx.fillStyle = "rgba(21,85,118,.62)";
      trackedText("СТАРТ ЧЕРЕЗ " + n, WORLD_W / 2, countY + 6, 1.2);
      const barX = cx + pad;
      const barY = countY + 16;
      const barW = cw - pad * 2;
      roundedRect(barX, barY, barW, 6, 3);
      ctx.fillStyle = "rgba(21,85,118,.12)";
      ctx.fill();
      const fillW = Math.max(6, barW * progress);
      const fill = ctx.createLinearGradient(barX, 0, barX + barW, 0);
      fill.addColorStop(0, hexToRgba(accent, 0.85));
      fill.addColorStop(1, hexToRgba(accent, 0.45));
      ctx.fillStyle = fill;
      roundedRect(barX, barY, fillW, 6, 3);
      ctx.fill();
    }
    ctx.restore();
  }
  function drawDarkness() {
    const dark = eventOf("darkness");
    if (!dark) return;
    const cx = player.x + 15;
    const cy = player.y + 15;
    const fade = Math.min(1, dark.left / 2e3, (dark.total - dark.left) / 1e3);
    const grad = ctx.createRadialGradient(cx, cy, 70, cx, cy, 240);
    grad.addColorStop(0, "rgba(0,0,0,0)");
    grad.addColorStop(1, `rgba(4,8,16,${(0.9 * fade).toFixed(3)})`);
    ctx.save();
    ctx.fillStyle = grad;
    ctx.fillRect(-30, -30, WORLD_W + 60, WORLD_H + 60);
    ctx.restore();
  }
  function drawWorld() {
    verticalPlatforms.forEach(drawVerticalPlatform);
    fallingPlatforms.forEach(drawPlatform);
    platforms.forEach(drawPlatform);
    drawSpikesOverlay();
    springs.forEach(drawSpring);
    coins.forEach(drawCoin);
    lifePickups.forEach(drawLifePickup);
    jetpickups.forEach(drawJetPickup);
    birds.forEach(drawBird);
    drawBoss();
    drawPlayer();
  }
  function runSimulation(frameMs) {
    if (currentState !== STATE.PLAYING) {
      simAccumMs = 0;
      return;
    }
    simAccumMs += frameMs;
    let steps = 0;
    while (simAccumMs + 1e-6 >= SIM_STEP_MS && steps < MAX_SIM_STEPS_PER_FRAME) {
      update(1);
      simAccumMs -= SIM_STEP_MS;
      steps++;
    }
    if (steps === MAX_SIM_STEPS_PER_FRAME) simAccumMs = Math.min(simAccumMs, SIM_STEP_MS);
  }
  var fpsDebugEnabled = (() => {
    try {
      return typeof location !== "undefined" && new URLSearchParams(location.search).get("fps") === "1";
    } catch {
      return false;
    }
  })();
  var fpsWindowStart = 0;
  var fpsPreviousTimestamp = 0;
  var fpsIntervals = [];
  var fpsWorkSamples = [];
  var fpsDebugLabel = "FPS: \u0437\u0430\u043C\u0435\u0440\u2026";
  function drawFpsDebug(timestamp, workStartedAt) {
    if (!fpsDebugEnabled) return;
    if (fpsPreviousTimestamp) fpsIntervals.push(timestamp - fpsPreviousTimestamp);
    fpsPreviousTimestamp = timestamp;
    fpsWorkSamples.push(performance.now() - workStartedAt);
    if (!fpsWindowStart) fpsWindowStart = timestamp;
    const elapsed = timestamp - fpsWindowStart;
    if (elapsed >= 1e3 && fpsIntervals.length) {
      const sorted = [...fpsIntervals].sort((a, b) => a - b);
      const fps = fpsIntervals.length * 1e3 / elapsed;
      const p95 = sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * 0.95))];
      const cpu = fpsWorkSamples.reduce((sum, value) => sum + value, 0) / fpsWorkSamples.length;
      fpsDebugLabel = `FPS ${fps.toFixed(0)} | JS ${cpu.toFixed(1)} ms | p95 ${p95.toFixed(1)} ms`;
      fpsWindowStart = timestamp;
      fpsIntervals = [];
      fpsWorkSamples = [];
    }
    ctx.save();
    ctx.fillStyle = "rgba(5,12,24,.78)";
    ctx.fillRect(8, 8, 220, 25);
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 11px Arial, sans-serif";
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillText(fpsDebugLabel, 14, 20);
    ctx.restore();
  }
  var drawRafHandle = null;
  function scheduleDraw() {
    if (drawRafHandle === null && !document.hidden) {
      drawRafHandle = requestAnimationFrame(draw);
    }
  }
  function draw(timestamp) {
    drawRafHandle = null;
    if (document.hidden) return;
    const frameWorkStartedAt = fpsDebugEnabled ? performance.now() : 0;
    const frameMs = lastRealTs ? Math.max(0, Math.min(timestamp - lastRealTs, MAX_FRAME_MS)) : SIM_STEP_MS;
    lastRealTs = timestamp;
    const dt = lastFrameTime ? Math.min((timestamp - lastFrameTime) / (1e3 / 60), 2) : 1;
    lastFrameTime = timestamp;
    updateScreenShake(dt);
    updateHud(dt);
    if (currentState === STATE.MENU) {
      updateMenu(dt);
      drawMenu();
    } else {
      drawBackground();
      if (!duelIsActive() && (currentState === STATE.PLAYING || currentState === STATE.PAUSE)) {
        const vg = ctx.createRadialGradient(200, 300, 160, 200, 300, 420);
        vg.addColorStop(0, "rgba(15,61,92,0)");
        vg.addColorStop(0.72, "rgba(15,61,92,.04)");
        vg.addColorStop(1, "rgba(15,61,92,.12)");
        ctx.fillStyle = vg;
        ctx.fillRect(0, 0, WORLD_W, WORLD_H);
      }
      drawSnow(dt);
      if (eventActive("blizzard")) drawBlizzard();
      drawWindStreaks();
      ctx.save();
      if (currentState !== STATE.PAUSE) ctx.translate(screenShake.x, screenShake.y);
      drawWorld();
      if (eventActive("darkness") && currentState === STATE.PLAYING) {
        drawDarkness();
      }
      if (eventActive("walls") && currentState === STATE.PLAYING) {
        drawWalls();
      }
      // Во время дуэли весь HUD забега скрыт: у боя с боссом свой интерфейс.
      if ((currentState === STATE.PLAYING || currentState === STATE.PAUSE) && !duelIsActive()) {
        drawDangerVignette();
      }
      ctx.restore();
      if (currentState !== STATE.GAMEOVER && !duelIsActive()) drawHud();
      if ((eventIntroMs > 0 || eventCountdownMs > 0) && currentState === STATE.PLAYING && !duelIsActive()) drawEventIntro();
      if (currentState === STATE.PAUSE) drawPauseMenu();
      else if (currentState === STATE.GAMEOVER) drawGameOver();
      else if (!duelIsActive()) drawPerkOffer();
    }
    runSimulation(frameMs);
    drawFpsDebug(timestamp, frameWorkStartedAt);
    scheduleDraw();
  }
  // ===== 0.6: схема сохранения, рейтинги, настройки, туториал =====
  var SCHEMA_VERSION = 1;
  function migrateSchema() {
    try {
      if (localStorage.getItem("morjakaSchema") === null) localStorage.setItem("morjakaSchema", String(SCHEMA_VERSION));
    } catch {}
  }
  // Глобальный рейтинг — Firebase Realtime Database.
  // База: https://moryaka-jump-default-rtdb.asia-southeast1.firebasedatabase.app
  // Записи: /scores/moryaka-jump/<key> = { name, score, ts }, индекс по "score".
  // Правила задаются в консоли Firebase (Realtime Database → Rules → Publish):
  //   scores/moryaka-jump: .read true, .indexOn ["score"];
  //   $entry: .write "!data.exists() && newData.exists()" (только создание);
  //   .validate: name — строка 1–20 символов, score — число 1…100000000.
  // Нельзя ставить ".write": true на всю ветку — тогда рейтинг можно стереть целиком.
  // Альтернатива — свой сервер: provider:"worker", endpoint.
  var LB_CONFIG = {
    provider: "firebase",
    url: "https://moryaka-jump-default-rtdb.asia-southeast1.firebasedatabase.app", // URL базы Realtime Database
    endpoint: "",  // для provider:"worker"
    game: "moryaka-jump"
  };
  var LB_MAX = 50;
  // Локальный топ — 5 лучших забегов игрока.
  var LB_LOCAL_MAX = 5;
  function lbIsTestName(name) {
    const n = String(name || "").trim().toLowerCase();
    return n.indexOf("test") === 0 || n === "тест" || n === "qa" || n === "bot";
  }
  // В рейтинге у каждого ника — только лучший результат (без учёта регистра).
  function lbBestPerPlayer(list) {
    const best = /* @__PURE__ */ new Map();
    for (const r of list) {
      if (!r) continue;
      const key = String(r.name != null ? r.name : r.n || "").trim().toLowerCase();
      if (!key) continue;
      const score = Number(r.score != null ? r.score : r.s) || 0;
      const prev = best.get(key);
      const prevScore = prev ? (Number(prev.score != null ? prev.score : prev.s) || 0) : -1;
      if (score > prevScore) best.set(key, r);
    }
    return [...best.values()].sort(
      (a, b) => (Number(b.score != null ? b.score : b.s) || 0) - (Number(a.score != null ? a.score : a.s) || 0)
    );
  }
  function lbReadLocal() {
    try {
      const raw = JSON.parse(localStorage.getItem("morjakaTopScores") || "[]");
      if (!Array.isArray(raw)) return [];
      return raw
        .filter((r) => r && !lbIsTestName(r.n))
        .sort((a, b) => (Number(b.s) || 0) - (Number(a.s) || 0))
        .slice(0, LB_LOCAL_MAX);
    } catch { return []; }
  }
  function lbWriteLocal(list) {
    try { localStorage.setItem("morjakaTopScores", JSON.stringify(list.slice(0, LB_LOCAL_MAX))); } catch {}
  }
  function lbRecordLocal(score, name) {
    if (!(score > 0)) return;
    const list = lbReadLocal();
    list.push({ n: (name || "Моряка").slice(0, 20), s: Math.floor(score), d: new Date().toISOString().slice(0, 10) });
    list.sort((a, b) => b.s - a.s);
    lbWriteLocal(list);
  }
  function lbFirebaseReady() {
    return LB_CONFIG.provider === "firebase" && !!LB_CONFIG.url;
  }
  function lbFirebaseBase() {
    return String(LB_CONFIG.url).replace(/\/+$/, "") + "/scores/" + encodeURIComponent(LB_CONFIG.game);
  }
  async function lbFirebaseFetch() {
    if (!lbFirebaseReady()) return { scores: [], note: "Firebase не настроен: укажите URL базы в LB_CONFIG.url." };
    const base = lbFirebaseBase() + ".json";
    try {
      // Берём с запасом: после схлопывания по никам должно остаться до 50 игроков.
      let res = await fetch(base + "?orderBy=" + encodeURIComponent('"score"') + "&limitToLast=" + LB_MAX * 4, { cache: "no-store" });
      if (!res.ok) res = await fetch(base, { cache: "no-store" });
      if (res.status === 401 || res.status === 403) throw new Error("нет доступа — проверьте правила базы в консоли Firebase");
      if (!res.ok) throw new Error("HTTP " + res.status);
      const data = await res.json();
      const list = data && typeof data === "object"
        ? Object.keys(data).map((k) => data[k]).filter((v) => v && typeof v === "object" && !lbIsTestName(v.name))
        : [];
      return { scores: lbBestPerPlayer(list).slice(0, LB_MAX), note: "" };
    } catch (e) {
      return { scores: [], note: "Ошибка загрузки Firebase (" + (e && e.message ? e.message : "сеть") + ")." };
    }
  }
  async function lbFirebaseSubmit(name, score) {
    if (!lbFirebaseReady()) return;
    try {
      await fetch(lbFirebaseBase() + ".json", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, score, ts: Date.now() })
      });
    } catch {}
  }
  function lbSubmitRun(score) {
    if (!(score > 0)) return;
    const name = (playerNick || "Моряка").slice(0, 20);
    // Тестовые забеги (сборки и ники вроде TestAi) в рейтинг не попадают.
    if (window.__TEST_BUILD || lbIsTestName(name)) return;
    lbRecordLocal(score, playerNick);
    if (lbFirebaseReady()) {
      const sent = lbFirebaseSubmit(name, Math.floor(score));
      if (sent && sent.then) sent.then(() => lbRefreshGlobal(true)).catch(() => {});
      return;
    }
    if (LB_CONFIG.provider !== "worker" || !LB_CONFIG.endpoint) return;
    try {
      fetch(LB_CONFIG.endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ game: LB_CONFIG.game, name, score: Math.floor(score) })
      }).catch(() => {});
    } catch {}
  }
  async function lbFetchGlobal() {
    if (lbFirebaseReady()) return lbFirebaseFetch();
    if (LB_CONFIG.provider === "worker" && LB_CONFIG.endpoint) {
      try {
        const res = await fetch(LB_CONFIG.endpoint + "?game=" + encodeURIComponent(LB_CONFIG.game) + "&limit=" + LB_MAX, { cache: "no-store" });
        if (!res.ok) throw new Error("HTTP " + res.status);
        const data = await res.json();
        return { scores: Array.isArray(data) ? data : (data.scores || []), note: "" };
      } catch (e) {
        return { scores: [], note: "Не удалось загрузить глобальный рейтинг (" + (e && e.message ? e.message : "ошибка") + ")." };
      }
    }
    return { scores: [], note: "Глобальный рейтинг не подключён. Укажите Firebase Realtime Database URL в LB_CONFIG." };
  }
  var lbState = { tab: "global", global: null, globalNote: "", loading: false };
  function lbFillRows(list, rows, markMe, loading) {
    list.innerHTML = "";
    if (!rows.length) {
      const li = document.createElement("li");
      li.textContent = loading ? "Загрузка…" : "Пока пусто";
      list.appendChild(li);
      return;
    }
    rows.forEach((r, i) => {
      const li = document.createElement("li");
      const nm = document.createElement("span"); nm.className = "nm";
      nm.textContent = (i + 1) + ". " + ((r.n || r.name) || "Игрок");
      const sc = document.createElement("span"); sc.className = "sc";
      sc.textContent = fmt(Number(r.s != null ? r.s : r.score) || 0);
      if (i < 3) li.className = "lbP" + (i + 1);
      const rowName = String((r.n || r.name) || "").trim().toLowerCase();
      if (markMe && rowName === String(playerNick || "").trim().toLowerCase()) li.classList.add("me");
      li.appendChild(nm); li.appendChild(sc); list.appendChild(li);
    });
  }
  function lbRenderSide() {
    const list = document.getElementById("sideLbList");
    const note = document.getElementById("sideLbNote");
    if (!list) return;
    lbFillRows(list, (lbState.global || []).slice(0, LB_MAX), true, lbState.loading);
    if (note) note.textContent = lbState.loading ? "Загрузка…" : (lbState.globalNote || "");
  }
  function lbRender() {
    const list = document.getElementById("lbList");
    const note = document.getElementById("lbNote");
    if (!list) return;
    const local = lbState.tab === "local";
    const rows = (local ? lbReadLocal() : (lbState.global || [])).slice(0, local ? LB_LOCAL_MAX : LB_MAX);
    lbFillRows(list, rows, true, local ? false : lbState.loading);
    if (note) {
      if (lbState.tab === "global") {
        const base = lbState.loading ? "Загрузка…" : (lbState.globalNote || "");
        const more = (lbState.global || []).length > 10 ? " · прокрутите список" : "";
        note.textContent = base + more;
      } else {
        note.textContent = "Локальный топ-5 ваших забегов.";
      }
    }
    lbRenderSide();
  }
  function lbSyncTabs() {
    document.getElementById("lbTabLocal").classList.toggle("cur", lbState.tab === "local");
    document.getElementById("lbTabGlobal").classList.toggle("cur", lbState.tab === "global");
  }
  function lbOpen(tab) {
    lbState.tab = tab || "global";
    const ov = document.getElementById("leaderboardOverlay");
    if (!ov) return;
    ov.classList.add("open"); ov.setAttribute("aria-hidden", "false");
    lbSyncTabs(); lbRender();
    if (lbState.tab === "global") lbRefreshGlobal();
    sfx.click();
  }
  function lbClose() {
    const ov = document.getElementById("leaderboardOverlay");
    if (ov) { ov.classList.remove("open"); ov.setAttribute("aria-hidden", "true"); }
  }
  async function lbRefreshGlobal(force) {
    if (!force && lbState.tab !== "global") return;
    lbState.loading = true; lbState.globalNote = ""; lbRender();
    const r = await lbFetchGlobal();
    lbState.loading = false; lbState.global = r.scores; lbState.globalNote = r.note;
    lbRender();
  }
  function storedVolume() {
    let v = 100;
    try { const raw = localStorage.getItem("morjakaVolume"); if (raw !== null) v = Number(raw); } catch {}
    return Math.max(0, Math.min(100, Number.isFinite(v) ? v : 100));
  }
  function applyVolume(vol) {
    const v = Math.max(0, Math.min(100, Number(vol) || 0));
    try { localStorage.setItem("morjakaVolume", String(v)); } catch {}
    if (sound.master) sound.master.gain.value = 0.05 * (v / 100);
    sound.enabled = v > 0;
    syncSoundButton();
    const side = document.getElementById("sideVolRange");
    if (side && document.activeElement !== side) side.value = String(v);
    const label = document.getElementById("sideVolVal");
    if (label) label.textContent = Math.round(v) + "%";
    const settings = document.getElementById("settingsVolume");
    if (settings && document.activeElement !== settings) settings.value = String(v);
    const main = document.getElementById("volRange");
    if (main && document.activeElement !== main) main.value = String(v);
  }
  function loadVolume() {
    const range = document.getElementById("volRange");
    if (range) range.value = String(storedVolume());
    if (sound.master) sound.master.gain.value = 0.05 * (storedVolume() / 100);
    const side = document.getElementById("sideVolRange");
    if (side) side.value = String(storedVolume());
    const label = document.getElementById("sideVolVal");
    if (label) label.textContent = storedVolume() + "%";
    const settings = document.getElementById("settingsVolume");
    if (settings) settings.value = String(storedVolume());
  }
  var vibrationEnabled = true;
  function loadVibration() {
    try { vibrationEnabled = localStorage.getItem("morjakaVib") !== "0"; } catch {}
    const cb = document.getElementById("vibToggle");
    if (cb) cb.checked = vibrationEnabled;
    const side = document.getElementById("sideVibToggle");
    if (side) side.checked = vibrationEnabled;
    const settings = document.getElementById("settingsVibration");
    if (settings) settings.checked = vibrationEnabled;
  }
  function setVibration(on) {
    vibrationEnabled = !!on;
    try { localStorage.setItem("morjakaVib", on ? "1" : "0"); } catch {}
    const side = document.getElementById("sideVibToggle");
    if (side) side.checked = vibrationEnabled;
    const settings = document.getElementById("settingsVibration");
    if (settings) settings.checked = vibrationEnabled;
    const main = document.getElementById("vibToggle");
    if (main) main.checked = vibrationEnabled;
  }
  function sensText(v) { return Math.round(v * 100) + "%"; }
  function refreshSensUI() {
    const kv = document.getElementById("sensKeyVal");
    const mv = document.getElementById("sensMouseVal");
    const pv = document.getElementById("sensPadVal");
    const pzv = document.getElementById("padZoneVal");
    if (kv) kv.textContent = sensText(controls.key);
    if (mv) mv.textContent = sensText(controls.mouse);
    if (pv) pv.textContent = sensText(controls.pad);
    if (pzv) pzv.textContent = zoneText(controls.padZone);
    const sk = document.getElementById("sideKeySens");
    const sm = document.getElementById("sideMouseSens");
    const sp = document.getElementById("sidePadSens");
    const spz = document.getElementById("sidePadZone");
    if (sk && document.activeElement !== sk) sk.value = String(controls.key);
    if (sm && document.activeElement !== sm) sm.value = String(controls.mouse);
    if (sp && document.activeElement !== sp) sp.value = String(controls.pad);
    if (spz && document.activeElement !== spz) spz.value = String(controls.padZone);
    const skv = document.getElementById("sideKeyVal");
    const smv = document.getElementById("sideMouseVal");
    const spv = document.getElementById("sidePadVal");
    const spzv = document.getElementById("sidePadZoneVal");
    if (skv) skv.textContent = sensText(controls.key);
    if (smv) smv.textContent = sensText(controls.mouse);
    if (spv) spv.textContent = sensText(controls.pad);
    if (spzv) spzv.textContent = zoneText(controls.padZone);
  }
  function openSettings() {
    const ov = document.getElementById("settingsOverlay"); if (!ov) return;
    const ni = document.getElementById("setNick"); if (ni) ni.value = playerNick || "";
    const vol = document.getElementById("settingsVolume"); if (vol) vol.value = String(storedVolume());
    const vib = document.getElementById("settingsVibration"); if (vib) vib.checked = vibrationEnabled;
    refreshSensUI();
    ov.classList.add("open"); ov.setAttribute("aria-hidden", "false");
    sfx.click();
  }
  function closeSettings() {
    const ov = document.getElementById("settingsOverlay");
    if (ov) { ov.classList.remove("open"); ov.setAttribute("aria-hidden", "true"); }
    sfx.click();
  }
  function setupSettings() {
    const ov = document.getElementById("settingsOverlay");
    if (ov) ov.addEventListener("pointerdown", (e) => { if (e.target === ov) closeSettings(); });
    const cl = document.getElementById("settingsClose"); if (cl) cl.addEventListener("click", closeSettings);
    const save = document.getElementById("setNickSave");
    if (save) save.addEventListener("click", () => {
      const ni = document.getElementById("setNick");
      if (ni) saveNick(ni.value);
      sfx.click();
      if (typeof setMenuMessage === "function") setMenuMessage("НИК", playerNick || "МОРЯКА");
    });
    const pairs = [["sensKey", "key"], ["sensMouse", "mouse"], ["sensPad", "pad"], ["padZone", "padZone"]];
    for (const [prefix, which] of pairs) {
      const minus = document.getElementById(prefix + "Minus");
      const plus = document.getElementById(prefix + "Plus");
      if (minus) minus.addEventListener("click", () => { stepSensitivity(which, -1); refreshSensUI(); });
      if (plus) plus.addEventListener("click", () => { stepSensitivity(which, 1); refreshSensUI(); });
    }
    const rs = document.getElementById("settingsReset");
    if (rs) rs.addEventListener("click", () => { closeSettings(); openResetDialog(); });
    const vol = document.getElementById("settingsVolume");
    if (vol) vol.addEventListener("input", () => applyVolume(vol.value));
    const vib = document.getElementById("settingsVibration");
    if (vib) vib.addEventListener("change", () => setVibration(vib.checked));
  }
  function openSoundSettings() {
    const ov = document.getElementById("soundOverlay"); if (!ov) return;
    const r = document.getElementById("volRange"); if (r) r.value = String(storedVolume());
    loadVibration();
    const t = document.getElementById("tiltToggle"); if (t) t.checked = !!tiltEnabled;
    ov.classList.add("open"); ov.setAttribute("aria-hidden", "false");
    sfx.click();
  }
  function closeSoundSettings() {
    const ov = document.getElementById("soundOverlay");
    if (ov) { ov.classList.remove("open"); ov.setAttribute("aria-hidden", "true"); }
    sfx.click();
  }
  function setupSoundSettings() {
    const ov = document.getElementById("soundOverlay");
    if (ov) ov.addEventListener("pointerdown", (e) => { if (e.target === ov) closeSoundSettings(); });
    const cl = document.getElementById("soundClose"); if (cl) cl.addEventListener("click", closeSoundSettings);
    const range = document.getElementById("volRange"); if (range) range.addEventListener("input", () => applyVolume(range.value));
    const vib = document.getElementById("vibToggle"); if (vib) vib.addEventListener("change", () => setVibration(vib.checked));
    const tilt = document.getElementById("tiltToggle");
    if (tilt) tilt.addEventListener("change", () => { if (tilt.checked) enableTilt(); else tiltEnabled = false; if (typeof syncSideSettings === "function") syncSideSettings(); });
  }
  function syncSideSettings() {
    const nick = document.getElementById("sideNick");
    if (nick && document.activeElement !== nick) nick.value = playerNick || "";
    const sk = document.getElementById("sideKeySens");
    const sm = document.getElementById("sideMouseSens");
    if (sk && document.activeElement !== sk) sk.value = String(controls.key);
    if (sm && document.activeElement !== sm) sm.value = String(controls.mouse);
    const sz = document.getElementById("sidePadZone");
    if (sz && document.activeElement !== sz) sz.value = String(controls.padZone);
    const szv = document.getElementById("sidePadZoneVal");
    if (szv) szv.textContent = zoneText(controls.padZone);
    const skv = document.getElementById("sideKeyVal");
    const smv = document.getElementById("sideMouseVal");
    if (skv) skv.textContent = sensText(controls.key);
    if (smv) smv.textContent = sensText(controls.mouse);
    const vol = document.getElementById("sideVolRange");
    if (vol && document.activeElement !== vol) vol.value = String(storedVolume());
    const volv = document.getElementById("sideVolVal");
    if (volv) volv.textContent = storedVolume() + "%";
    const vib = document.getElementById("sideVibToggle");
    if (vib) vib.checked = vibrationEnabled;
    const tilt = document.getElementById("sideTiltToggle");
    if (tilt) tilt.checked = !!tiltEnabled;
  }
  function setupSidePanels() {
    const lbPanel = document.getElementById("sideLb");
    const setPanel = document.getElementById("sideSet");
    const lbToggle = document.getElementById("sideLbToggle");
    const setToggle = document.getElementById("sideSetToggle");
    let lbCollapsed = false, setCollapsed = false;
    try { lbCollapsed = localStorage.getItem("morjakaSideLbCollapsed") === "1"; } catch {}
    try { setCollapsed = localStorage.getItem("morjakaSideSetCollapsed") === "1"; } catch {}
    function applyCollapse(panel, toggle, collapsed, side) {
      if (!panel || !toggle) return;
      panel.classList.toggle("collapsed", collapsed);
      toggle.textContent = side === "left" ? (collapsed ? "›" : "‹") : (collapsed ? "‹" : "›");
      toggle.setAttribute("aria-expanded", String(!collapsed));
      toggle.setAttribute("aria-label", (collapsed ? "Развернуть " : "Свернуть ") + (side === "left" ? "рейтинг" : "настройки"));
    }
    applyCollapse(lbPanel, lbToggle, lbCollapsed, "left");
    applyCollapse(setPanel, setToggle, setCollapsed, "right");
    if (lbToggle) lbToggle.addEventListener("click", () => {
      lbCollapsed = !lbCollapsed;
      try { localStorage.setItem("morjakaSideLbCollapsed", lbCollapsed ? "1" : "0"); } catch {}
      applyCollapse(lbPanel, lbToggle, lbCollapsed, "left");
      sfx.click();
    });
    if (setToggle) setToggle.addEventListener("click", () => {
      setCollapsed = !setCollapsed;
      try { localStorage.setItem("morjakaSideSetCollapsed", setCollapsed ? "1" : "0"); } catch {}
      applyCollapse(setPanel, setToggle, setCollapsed, "right");
      sfx.click();
    });
    const refresh = document.getElementById("sideLbRefresh");
    if (refresh) refresh.addEventListener("click", () => { lbRefreshGlobal(true); sfx.click(); });
    const nick = document.getElementById("sideNick");
    const nickSave = document.getElementById("sideNickSave");
    function commitNick() {
      if (nick) saveNick(nick.value);
      syncSideSettings();
      sfx.click();
    }
    if (nickSave) nickSave.addEventListener("click", commitNick);
    if (nick) nick.addEventListener("keydown", (e) => { if (e.key === "Enter") { e.preventDefault(); commitNick(); } });
    const sensPairs = [["sideKeySens", "key"], ["sideMouseSens", "mouse"], ["sidePadSens", "pad"]];
    for (const [id, which] of sensPairs) {
      const el = document.getElementById(id);
      if (!el) continue;
      el.min = String(SENS_MIN); el.max = String(SENS_MAX); el.step = String(SENS_STEP);
      el.addEventListener("input", () => {
        const v = Number(el.value);
        if (!Number.isFinite(v)) return;
        controls[which] = Math.max(SENS_MIN, Math.min(SENS_MAX, v));
        saveControls();
        refreshSensUI();
      });
    }
    const zone = document.getElementById("sidePadZone");
    if (zone) zone.addEventListener("input", () => {
      const value = Number(zone.value);
      if (!Number.isFinite(value)) return;
      controls.padZone = Math.max(ZONE_MIN, Math.min(ZONE_MAX, value));
      saveControls();
      refreshSensUI();
    });
    const vol = document.getElementById("sideVolRange");
    if (vol) vol.addEventListener("input", () => applyVolume(vol.value));
    const vib = document.getElementById("sideVibToggle");
    if (vib) vib.addEventListener("change", () => setVibration(vib.checked));
    const tilt = document.getElementById("sideTiltToggle");
    if (tilt) tilt.addEventListener("change", () => { if (tilt.checked) enableTilt(); else tiltEnabled = false; syncSideSettings(); });
    const reset = document.getElementById("sideReset");
    if (reset) reset.addEventListener("click", () => openResetDialog());
    syncSideSettings();
    lbRenderSide();
    lbRefreshGlobal(true);
  }
  function profileFavoriteCharacter() {
    let best = -1;
    let bestCount = 0;
    for (const key in stats.characterRuns) {
      const count = stats.characterRuns[key] || 0;
      if (count > bestCount) { bestCount = count; best = Number(key); }
    }
    return best >= 0 && best < avatarImages.length ? avatarName(best) : "—";
  }
  function profileBossWinsTotal() {
    return stats.bossWins.reduce((sum, n) => sum + (n || 0), 0);
  }
  function renderProfile() {
    const statsEl = document.getElementById("profileStats");
    const bossesEl = document.getElementById("profileBosses");
    const achEl = document.getElementById("profileAch");
    const countEl = document.getElementById("profileAchCount");
    if (!statsEl || !bossesEl || !achEl) return;
    const playTimeValid = !(stats.runs > 50 && stats.playMs < stats.runs * 2000);
    const rows = [
      ["РЕКОРД", fmt(highScore)],
      ["ВСЕГО СОБРАНО", fmt(stats.coins)],
      ["НА СЧЕТУ", fmt(bankCoins)],
      ["ПЛАТФОРМ", fmt(stats.platforms)],
      ["ЗАБЕГОВ", fmt(stats.runs)],
      ["ВРЕМЯ В ИГРЕ", playTimeValid ? formatPlayTime(stats.playMs) : "—"],
      ["ПОБЕД НАД БОССАМИ", fmt(profileBossWinsTotal())],
      ["БОССОВ ПРОЙДЕНО", stats.bossWins.filter((n) => n > 0).length + " / " + DUEL_BOSS_DEFS.length],
      ["ЛЮБИМЫЙ ПЕРСОНАЖ", profileFavoriteCharacter()]
    ];
    statsEl.innerHTML = "";
    for (const [label, value] of rows) {
      const cell = document.createElement("div");
      cell.className = "profileStat";
      const b = document.createElement("b");
      b.textContent = value;
      const span = document.createElement("span");
      span.textContent = label;
      if (label === "ВРЕМЯ В ИГРЕ" && !playTimeValid) cell.title = "Статистика времени ведётся с 1.0.29";
      cell.appendChild(b);
      cell.appendChild(span);
      statsEl.appendChild(cell);
    }
    bossesEl.innerHTML = "";
    DUEL_BOSS_DEFS.forEach((boss, index) => {
      const row = document.createElement("div");
      row.className = "profileBossRow";
      const name = document.createElement("span");
      name.textContent = boss.name;
      const value = document.createElement("span");
      const wins = stats.bossWins[index] || 0;
      const tries = stats.bossTries[index] || 0;
      const trainWins = stats.trainWins[index] || 0;
      const trainTries = stats.trainTries[index] || 0;
      const pct = tries > 0 ? Math.round(wins / tries * 100) : 0;
      value.textContent = wins + " / " + tries + " · " + pct + "%" + (trainTries ? " · трен. " + trainWins + "/" + trainTries : "");
      row.appendChild(name);
      row.appendChild(value);
      bossesEl.appendChild(row);
    });
    achEl.innerHTML = "";
    ACHIEVEMENT_DEFS.forEach((achievement) => {
      const claimed = achievementsClaimed.includes(achievement.id);
      const row = document.createElement("div");
      row.className = "profileAchRow" + (claimed ? " done" : "");
      const left = document.createElement("div");
      const name = document.createElement("div");
      name.className = "paName";
      name.textContent = (claimed ? "✓ " : "") + achievement.name;
      const desc = document.createElement("div");
      desc.className = "paDesc";
      let barPct = 0;
      if (claimed) desc.textContent = achievement.desc;
      else {
        const progress = achievementProgress(achievement);
        const current = Math.min(Number(progress[0]) || 0, Number(progress[1]) || 1);
        const total = Number(progress[1]) || 1;
        barPct = Math.max(0, Math.min(1, current / total));
        desc.textContent = achievement.desc + " · " + (achievement.id === "play_1h" ? formatPlayTime(current) + " / " + formatPlayTime(total) : fmt(current) + " / " + fmt(total));
      }
      left.appendChild(name);
      left.appendChild(desc);
      if (!claimed) {
        const bar = document.createElement("div");
        bar.className = "paBar";
        const fill = document.createElement("i");
        fill.style.width = (barPct * 100).toFixed(0) + "%";
        bar.appendChild(fill);
        left.appendChild(bar);
      }
      const reward = document.createElement("div");
      reward.className = "profileAchReward" + (claimed ? " done" : "");
      reward.textContent = claimed ? "✓" : "+" + achievement.reward;
      row.appendChild(left);
      row.appendChild(reward);
      achEl.appendChild(row);
    });
    if (countEl) countEl.textContent = "(" + achievementsClaimed.length + " / " + ACHIEVEMENT_DEFS.length + ")";
  }
  function achievementProgress(achievement) {
    try {
      const result = achievement.progress();
      return Array.isArray(result) ? result : [0, 1];
    } catch {
      return [0, 1];
    }
  }
  function openProfile() {
    checkAchievements(false);
    renderProfile();
    const ov = document.getElementById("profileOverlay");
    if (!ov) return;
    ov.classList.add("open");
    ov.setAttribute("aria-hidden", "false");
    sfx.click();
  }
  function closeProfile() {
    const ov = document.getElementById("profileOverlay");
    if (ov) { ov.classList.remove("open"); ov.setAttribute("aria-hidden", "true"); }
    sfx.click();
  }
  function setupProfile() {
    const close = document.getElementById("profileClose");
    if (close) close.addEventListener("click", closeProfile);
    const x = document.getElementById("profileX");
    if (x) x.addEventListener("click", closeProfile);
    const ov = document.getElementById("profileOverlay");
    if (ov) ov.addEventListener("pointerdown", (event) => { if (event.target === ov) closeProfile(); });
  }
  function setupLeaderboard() {
    const trophy = document.getElementById("lbButton"); if (trophy) trophy.addEventListener("click", () => lbOpen("global"));
    const local = document.getElementById("lbTabLocal"); if (local) local.addEventListener("click", () => { lbState.tab = "local"; lbState.globalNote = ""; lbSyncTabs(); lbRender(); });
    const globalTab = document.getElementById("lbTabGlobal"); if (globalTab) globalTab.addEventListener("click", () => { lbState.tab = "global"; lbSyncTabs(); lbRender(); lbRefreshGlobal(); });
    const refresh = document.getElementById("lbRefresh"); if (refresh) refresh.addEventListener("click", () => { if (lbState.tab === "global") lbRefreshGlobal(); else lbRender(); });
    const close = document.getElementById("lbClose"); if (close) close.addEventListener("click", lbClose);
    const ov = document.getElementById("leaderboardOverlay"); if (ov) ov.addEventListener("pointerdown", (e) => { if (e.target === ov) lbClose(); });
  }
  var TUTORIAL_STEPS = [
    "Прыгай с платформы на платформу и забирайся как можно выше. Тап/клик, стрелки или мышь.",
    "Собирай монеты: каждые N монет — новая жизнь. По пути появляются перки и события.",
    "На 30 000 счёта приходит босс. Переживи его атаки и получи награду.",
    "Ежедневное задание и серия дней — вверху экрана. Удачи, Моряка!"
  ];
  var tutIndex = 0;
  function renderTutorial() {
    const step = document.getElementById("tutStep");
    const txt = document.getElementById("tutText");
    const next = document.getElementById("tutNext");
    if (step) { step.innerHTML = ""; TUTORIAL_STEPS.forEach((_, i) => { const d = document.createElement("i"); if (i === tutIndex) d.className = "on"; step.appendChild(d); }); }
    if (txt) txt.textContent = TUTORIAL_STEPS[tutIndex] || "";
    if (next) next.textContent = tutIndex >= TUTORIAL_STEPS.length - 1 ? "ПОНЯТНО" : "ДАЛЕЕ";
  }
  function closeTutorial() {
    const ni = document.getElementById("tutNick");
    if (ni) saveNick(ni.value || "Моряка");
    const ov = document.getElementById("tutorialOverlay");
    if (ov) { ov.classList.remove("open"); ov.setAttribute("aria-hidden", "true"); }
    try { localStorage.setItem("morjakaTutorialDone", "1"); } catch {}
  }
  function maybeShowTutorial() {
    let done = false;
    try { done = localStorage.getItem("morjakaTutorialDone") === "1"; } catch {}
    if (done) return;
    const ov = document.getElementById("tutorialOverlay"); if (!ov) return;
    const ni = document.getElementById("tutNick"); if (ni) ni.value = playerNick || "";
    tutIndex = 0; renderTutorial();
    ov.classList.add("open"); ov.setAttribute("aria-hidden", "false");
  }
  function setupTutorial() {
    const next = document.getElementById("tutNext");
    const skip = document.getElementById("tutSkip");
    if (next) next.addEventListener("click", () => { if (tutIndex >= TUTORIAL_STEPS.length - 1) closeTutorial(); else { tutIndex++; renderTutorial(); sfx.click(); } });
    if (skip) skip.addEventListener("click", closeTutorial);
  }
  migrateSchema();
  setupSettings();
  setupSoundSettings();
  setupLeaderboard();
  setupProfile();
  setupSidePanels();
  setupTutorial();
  checkAchievements(false);
  loadVibration();
  loadVolume();