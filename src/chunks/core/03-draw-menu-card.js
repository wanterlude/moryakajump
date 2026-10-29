  function drawMenuCard(index, x, y) {
    const isShop = menuState.tab === "shop";
    const w = MENU.cardW;
    const h = MENU.cardH;
    const unlocked = menuItemUnlocked(index);
    const worn = menuItemWorn(index);
    const active = menuCursor() === index;
    const pressed = menuState.pressIndex === index ? menuState.pressT : 0;
    const scale = 1 - pressed * 0.08;
    const cx = x + w / 2;
    const cy = y + 26;
    const r = 20;
    ctx.save();
    const ccx = x + w / 2;
    const ccy = y + h / 2;
    ctx.translate(ccx, ccy);
    ctx.scale(scale, scale);
    ctx.translate(-ccx, -ccy);
    roundedRect(x, y, w, h, 12);
    ctx.fillStyle = active ? "rgba(219,250,244,.96)" : worn ? "rgba(255,255,255,.86)" : unlocked ? "rgba(255,255,255,.70)" : "rgba(255,255,255,.42)";
    ctx.fill();
    if (active) {
      roundedRect(x + 0.75, y + 0.75, w - 1.5, h - 1.5, 12);
      ctx.strokeStyle = "#12a08c";
      ctx.lineWidth = 2;
      ctx.stroke();
    }
    ctx.save();
    if (!unlocked) ctx.globalAlpha = 0.62;
    drawAvatarCircle(cx, cy, r, isShop ? selectedAvatar : index);
    drawFrame(cx, cy, r, isShop ? shopFrames()[index].id : selectedFrame, true);
    ctx.restore();
    if (!unlocked) {
      ctx.save();
      ctx.fillStyle = "rgba(10,40,60,.5)";
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fill();
      drawLockIcon(cx, cy, r * 0.48, "rgba(255,255,255,.95)");
      ctx.restore();
    }
    if (worn) {
      ctx.save();
      ctx.fillStyle = "#12a08c";
      ctx.beginPath();
      ctx.arc(x + w - 9, y + 9, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "rgba(255,255,255,.95)";
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(x + w - 11, y + 9);
      ctx.lineTo(x + w - 9.5, y + 10.7);
      ctx.lineTo(x + w - 6.8, y + 7.4);
      ctx.stroke();
      ctx.restore();
    }
    ctx.save();
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    setFont(6.5, "bold");
    let label;
    let color = "rgba(21,85,118,.66)";
    if (isShop) {
      if (active) {
        label = "\u0412\u042B\u0411\u0420\u0410\u041D\u0410";
        color = "#0f8a76";
      } else if (worn) {
        label = "\u041D\u0410\u0414\u0415\u0422\u0410";
        color = "#0f8a76";
      } else if (unlocked) {
        label = "\u0415\u0421\u0422\u042C";
      } else {
        label = "\u2014";
        color = "rgba(21,85,118,.34)";
      }
    } else if (!unlocked) {
      label = "\u0420\u0415\u041A\u041E\u0420\u0414 " + avatarUnlockLabel(index);
      color = active ? "#8a5a00" : "#a86b00";
      fitTextSize(label, w - 8, 0.5);
    } else {
      label = avatarName(index).toUpperCase();
      if (active) color = "#0f8a76";
    }
    if (isShop || unlocked) setFont(6.5, "bold");
    ctx.fillStyle = color;
    trackedText(label, cx, y + h - 13, 0.5);
    ctx.restore();
    ctx.restore();
  }
  function drawMenuGrid() {
    const count = menuTabCount();
    const left = gridLeft();
    const viewTop = MENU.gridY;
    const viewBottom = MENU.gridY + MENU.gridH;
    const rowH = gridRowH();
    ctx.save();
    ctx.beginPath();
    ctx.rect(MENU.padX - 6, viewTop, WORLD_W - (MENU.padX - 6) * 2, MENU.gridH);
    ctx.clip();
    for (let i = 0; i < count; i++) {
      const col = i % MENU.cols;
      const row = Math.floor(i / MENU.cols);
      const x = left + col * (MENU.cardW + MENU.gapX);
      const y = viewTop + row * rowH - menuState.scroll;
      if (y + MENU.cardH < viewTop - 20 || y > viewBottom + 20) continue;
      drawMenuCard(i, x, y);
    }
    ctx.restore();
    if (menuMaxScroll() > 0) {
      const ratio = MENU.gridH / gridHeight();
      const thumbH = Math.max(26, MENU.gridH * ratio);
      const t = menuState.scroll / menuMaxScroll();
      const ty = viewTop + t * (MENU.gridH - thumbH);
      ctx.save();
      ctx.fillStyle = "rgba(15,61,92,.12)";
      roundedRect(389, viewTop, 3, MENU.gridH, 1.5);
      ctx.fill();
      ctx.fillStyle = "rgba(15,61,92,.42)";
      roundedRect(389, ty, 3, thumbH, 1.5);
      ctx.fill();
      ctx.restore();
    }
    if (menuState.scroll < menuMaxScroll() - 1) {
      const fade = ctx.createLinearGradient(0, viewBottom - 26, 0, viewBottom);
      fade.addColorStop(0, "rgba(247,252,255,0)");
      fade.addColorStop(1, "rgba(247,252,255,.92)");
      ctx.fillStyle = fade;
      ctx.fillRect(MENU.padX - 6, viewBottom - 26, WORLD_W - (MENU.padX - 6) * 2, 26);
    }
  }
  function drawMenuActions() {
    const bar = menuActionButtons();
    const train = bar[0];
    const play = bar[1];
    const save = bar[2];
    drawMenuObjectButton(train.x, train.y, train.w, train.h, "БОССЫ", "gate");
    drawMenuButton(play.x, play.y, play.w, play.h, "ИГРАТЬ", "ghostBlue", {
      size: 11,
      tracking: 1.1,
      icon: "play"
    });
    drawMenuObjectButton(save.x, save.y, save.w, save.h, "СОХРАНИТЬ", "chest");
    ctx.save();
    ctx.textBaseline = "middle";
    setFont(7.5, "bold");
    ctx.fillStyle = "rgba(21,85,118,.7)";
    trackedText("РЕКОРД " + fmt(highScore), MENU.padX, 566, 1.2, "left");
    trackedText(
      isCoarsePointer() ? "\u041F\u0420\u041E\u0412\u0415\u0414\u0418 \u041F\u041E \u0421\u0415\u0422\u041A\u0415 \u2014 \u041F\u0420\u041E\u041A\u0420\u0423\u0422\u041A\u0410" : "\u2190 \u2192 \u0412\u042B\u0411\u041E\u0420 \xB7 ENTER \u0414\u0415\u0419\u0421\u0422\u0412\u0418\u0415",
      WORLD_W - MENU.padX,
      566,
      1.2,
      "right"
    );
    ctx.restore();
  }
  var menuMessage = "";
  var menuMessageSub = "";
  var menuMessageUntil = 0;
  function setMenuMessage(text, sub = "") {
    menuMessage = text;
    menuMessageSub = sub;
    menuMessageUntil = performance.now() + (sub ? 2800 : 2100);
  }
  function drawMenuToast() {
    if (performance.now() >= menuMessageUntil || !menuMessage) return;
    const hasSub = Boolean(menuMessageSub);
    const h = hasSub ? 34 : 26;
    const top = menuState.tab === "shop" ? GACHA_UI.picker.y + GACHA_UI.picker.h + 6 : MENU.barY - 10 - h;
    ctx.save();
    ctx.globalAlpha = Math.min(1, (menuMessageUntil - performance.now()) / 280);
    ctx.shadowColor = "rgba(8,28,48,.4)";
    ctx.shadowBlur = 14;
    ctx.shadowOffsetY = 5;
    roundedRect(45, top, 310, h, hasSub ? 13 : h / 2);
    ctx.fillStyle = "rgba(18,42,68,.94)";
    ctx.fill();
    ctx.shadowColor = "transparent";
    ctx.shadowBlur = 0;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#ffffff";
    setFont(10.5, "bold");
    trackedText(menuMessage, 200, hasSub ? top + 13 : top + h / 2 + 0.5, 0.7);
    if (hasSub) {
      ctx.fillStyle = "rgba(190,216,236,.82)";
      setFont(8, "normal");
      trackedText(menuMessageSub, 200, top + 25, 0.5);
    }
    ctx.restore();
  }
  function updateMenu(dtFrames) {
    const dt = dtFrames * (1e3 / 60);
    const swipeTarget = menuSwipeTarget();
    const step = Math.min(dt, 32);
    const boost = menuState.swipeMode === "click";
    const k = MENU_SWIPE.stiffness * (boost ? MENU_SWIPE.clickStiffnessMul : 1);
    const c = MENU_SWIPE.damping * (boost ? MENU_SWIPE.clickDampingMul : 1);
    const subSec = step / 1e3 / 4;
    for (let s = 0; s < 4; s++) {
      const accel = k * (swipeTarget - menuState.swipe) - c * menuState.swipeVel;
      menuState.swipeVel += accel * subSec;
      menuState.swipe += menuState.swipeVel * subSec;
    }
    if (menuState.swipe > 0) {
      menuState.swipe = 0;
      menuState.swipeVel = Math.min(0, menuState.swipeVel);
    }
    const minSwipe = -(MENU_TABS.length - 1);
    if (menuState.swipe < minSwipe) {
      menuState.swipe = minSwipe;
      menuState.swipeVel = Math.max(0, menuState.swipeVel);
    }
    if (Math.abs(swipeTarget - menuState.swipe) < 5e-4 && Math.abs(menuState.swipeVel) < 5e-4) {
      menuState.swipe = swipeTarget;
      menuState.swipeVel = 0;
    }
    menuState.tabAnim = -menuState.swipe;
    if (menuState.fadeT < 1) {
      menuState.fadeT = Math.min(1, menuState.fadeT + 0.14 * dt);
    }
    if (menuState.pressT > 0) {
      menuState.pressT = Math.max(0, menuState.pressT - 0.09 * dt);
      if (menuState.pressT === 0) menuState.pressIndex = -1;
    }
  }
  function drawMenu() {
    updateMenuIconRects();
    drawBackground();
    const glow = ctx.createRadialGradient(200, 60, 10, 200, 60, 240);
    glow.addColorStop(0, "rgba(255,255,255,.5)");
    glow.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, WORLD_W, 300);
    drawMenuHeader();
    drawMenuTabs();
    for (let k = 0; k < MENU_TABS.length; k++) {
      const off = (k + menuState.swipe) * WORLD_W;
      if (off <= -WORLD_W + 1 || off >= WORLD_W - 1) continue;
      ctx.save();
      ctx.translate(off, 0);
      if (k === 0) {
        withMenuTab("avatars", () => {
          drawShowcase();
          drawMenuGrid();
          drawMenuActions();
        });
      } else if (k === 1) {
        drawGachaShop();
      } else if (k === 2) {
        drawPlatformShop();
      } else {
        drawCardsShop();
      }
      ctx.restore();
    }
    ctx.save();
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    setFont(6.5, "bold");
    ctx.fillStyle = "rgba(21,85,118,.34)";
    trackedText("СОЗДАТЕЛЬ \xB7 WANTERLUDE", WORLD_W / 2, 585, 1.4);
    trackedText("v" + GAME_VERSION, WORLD_W - MENU.padX, 585, 1.2, "right");
    ctx.restore();
    drawMenuGear();
    drawMenuTrophy();
    drawMenuProfile();
    drawMenuToast();
    if (bossTrainOpen) drawBossTrain();
  }
  function drawGroundShadow(cx, y, rx, ry, alpha = 0.18) {
    const g = ctx.createRadialGradient(cx, y, 0, cx, y, rx);
    g.addColorStop(0, `rgba(46,92,124,${alpha})`);
    g.addColorStop(1, "rgba(46,92,124,0)");
    ctx.save();
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.ellipse(cx, y, rx, ry, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
  function snowCap(x, y, w, height, fillTop = "#ffffff", fillBottom = "#dceffa") {
    const g = ctx.createLinearGradient(0, y - height, 0, y + height);
    g.addColorStop(0, fillTop);
    g.addColorStop(1, fillBottom);
    ctx.beginPath();
    ctx.moveTo(x + 1.5, y + height * 0.35);
    ctx.quadraticCurveTo(x + w * 0.16, y - height * 0.85, x + w * 0.36, y - height * 0.32);
    ctx.quadraticCurveTo(x + w * 0.54, y - height * 1.12, x + w * 0.74, y - height * 0.3);
    ctx.quadraticCurveTo(x + w * 0.9, y - height * 0.8, x + w - 1.5, y + height * 0.28);
    ctx.lineTo(x + w - 1.5, y + height * 0.92);
    ctx.lineTo(x + 1.5, y + height * 0.92);
    ctx.closePath();
    ctx.fillStyle = g;
    ctx.fill();
  }
  function drawSnowPlatform(p) {
    const { x, y, w, h } = p;
    drawGroundShadow(x + w / 2, y + h + 5, w * 0.58, 5, 0.16);
    ctx.save();
    const body = ctx.createLinearGradient(0, y, 0, y + h);
    body.addColorStop(0, WINTER.snowMid);
    body.addColorStop(0.55, "#b6d7e8");
    body.addColorStop(1, WINTER.snowDeep);
    roundedRect(x, y + 2, w, h - 1, 7);
    ctx.fillStyle = body;
    ctx.fill();
    ctx.strokeStyle = "rgba(23,63,84,.5)";
    ctx.lineWidth = 1.6;
    ctx.stroke();
    ctx.save();
    roundedRect(x, y + 2, w, h - 1, 7);
    ctx.clip();
    snowCap(x, y + 1, w, 7);
    ctx.restore();
    ctx.fillStyle = "rgba(255,255,255,.22)";
    roundedRect(x + 3, y + h - 4, w - 6, 2.4, 1.2);
    ctx.fill();
    ctx.restore();
  }
  function drawIcePlatform(p) {
    const { x, y, w, h } = p;
    ctx.save();
    ctx.strokeStyle = "rgba(12,72,104,.16)";
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 4]);
    ctx.beginPath();
    ctx.moveTo(0, y + h / 2);
    ctx.lineTo(WORLD_W, y + h / 2);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();
    drawGroundShadow(x + w / 2, y + h + 5, w * 0.58, 5, 0.2);
    ctx.save();
    const ice = ctx.createLinearGradient(0, y, 0, y + h);
    ice.addColorStop(0, WINTER.iceTop);
    ice.addColorStop(0.34, "#9ee4f8");
    ice.addColorStop(0.72, WINTER.iceMid);
    ice.addColorStop(1, WINTER.iceDeep);
    roundedRect(x, y, w, h, 6);
    ctx.fillStyle = ice;
    ctx.fill();
    ctx.save();
    roundedRect(x, y, w, h, 6);
    ctx.clip();
    ctx.fillStyle = "rgba(255,255,255,.30)";
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + w * 0.26, y);
    ctx.lineTo(x + w * 0.1, y + h);
    ctx.lineTo(x, y + h);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
    ctx.fillStyle = "rgba(255,255,255,.92)";
    roundedRect(x + 6, y + 2.6, w - 12, 2.2, 1.1);
    ctx.fill();
    ctx.strokeStyle = "rgba(255,255,255,.55)";
    ctx.lineWidth = 1;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(x + w * 0.3, y + 4);
    ctx.lineTo(x + w * 0.42, y + h - 4);
    ctx.moveTo(x + w * 0.62, y + 4);
    ctx.lineTo(x + w * 0.52, y + h - 4);
    ctx.stroke();
    ctx.strokeStyle = "rgba(24,96,130,.35)";
    roundedRect(x + 0.5, y + 0.5, w - 1, h - 1, 6);
    ctx.stroke();
    ctx.save();
    roundedRect(x, y, w, h, 6);
    ctx.clip();
    ctx.strokeStyle = "rgba(12,72,104,.34)";
    ctx.lineWidth = 1.5;
    ctx.lineCap = "round";
    const step = 16;
    for (let cx = x + 8; cx < x + w - 4; cx += step) {
      ctx.beginPath();
      ctx.moveTo(cx - 4, y + h - 4);
      ctx.lineTo(cx, y + 4);
      ctx.lineTo(cx + 4, y + h - 4);
      ctx.stroke();
    }
    ctx.restore();
    ctx.restore();
  }
  function drawWoodPlatform(p) {
    const { x, y, w, h } = p;
    const shake = p.breaking ? Math.sin(frameNow() * 34) * 0.7 : 0;
    ctx.save();
    ctx.translate(shake, 0);
    drawGroundShadow(x + w / 2, y + h + 5, w * 0.58, 5, 0.16);
    const wood = ctx.createLinearGradient(0, y, 0, y + h);
    wood.addColorStop(0, p.breaking ? "#c07a4c" : WINTER.woodTop);
    wood.addColorStop(0.55, p.breaking ? "#8a5030" : WINTER.woodMid);
    wood.addColorStop(1, WINTER.woodDeep);
    roundedRect(x, y, w, h, 5);
    ctx.fillStyle = wood;
    ctx.fill();
    ctx.strokeStyle = "rgba(58,32,18,.35)";
    ctx.lineWidth = 0.9;
    for (let i = 1; i < 3; i++) {
      const yy = y + h / 3 * i;
      ctx.beginPath();
      ctx.moveTo(x + 3, yy);
      ctx.lineTo(x + w - 3, yy);
      ctx.stroke();
    }
    ctx.save();
    roundedRect(x, y, w, h, 5);
    ctx.clip();
    snowCap(x, y + 1, w, 6);
    ctx.restore();
    if (!p.breaking) {
      ctx.save();
      roundedRect(x, y, w, h, 5);
      ctx.clip();
      ctx.fillStyle = "rgba(58,32,18,.22)";
      const notch = 11;
      for (let nx = x + 6; nx < x + w - 6; nx += notch * 2) {
        ctx.beginPath();
        ctx.moveTo(nx, y + h);
        ctx.lineTo(nx + notch / 2, y + h - 4.5);
        ctx.lineTo(nx + notch, y + h);
        ctx.closePath();
        ctx.fill();
      }
      ctx.restore();
    }
    ctx.strokeStyle = p.breaking ? "rgba(255,238,214,.9)" : "rgba(255,238,214,.45)";
    ctx.lineWidth = p.breaking ? 1.8 : 1;
    ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.moveTo(x + w * 0.46, y + 2);
    ctx.lineTo(x + w * 0.4, y + h * 0.5);
    ctx.lineTo(x + w * 0.54, y + h * 0.72);
    ctx.lineTo(x + w * 0.48, y + h);
    ctx.stroke();
    ctx.strokeStyle = "rgba(60,34,18,.30)";
    ctx.lineWidth = 1;
    roundedRect(x + 0.5, y + 0.5, w - 1, h - 1, 5);
    ctx.stroke();
    ctx.restore();
  }
  function drawSlipperyIce(p) {
    const { x, y, w, h } = p;
    drawGroundShadow(x + w / 2, y + h + 5, w * 0.58, 5, 0.18);
    ctx.save();
    const ice = ctx.createLinearGradient(0, y, 0, y + h);
    ice.addColorStop(0, "#ffffff");
    ice.addColorStop(0.3, "#c8f2ff");
    ice.addColorStop(0.68, "#6fd0ea");
    ice.addColorStop(1, "#2f9bc4");
    roundedRect(x, y, w, h, 4);
    ctx.fillStyle = ice;
    ctx.fill();
    ctx.fillStyle = "rgba(255,255,255,.95)";
    roundedRect(x + 5, y + 2.2, w * 0.55, 2.4, 1.2);
    ctx.fill();
    ctx.strokeStyle = "rgba(255,255,255,.5)";
    ctx.lineWidth = 0.9;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(x + w * 0.18, y + 6);
    ctx.lineTo(x + w * 0.3, y + h - 2);
    ctx.moveTo(x + w * 0.66, y + 5);
    ctx.lineTo(x + w * 0.58, y + h - 2);
    ctx.stroke();
    ctx.strokeStyle = "rgba(24,96,130,.30)";
    ctx.lineWidth = 1;
    roundedRect(x + 0.5, y + 0.5, w - 1, h - 1, 4);
    ctx.stroke();
    ctx.save();
    roundedRect(x, y, w, h, 4);
    ctx.clip();
    ctx.strokeStyle = "rgba(255,255,255,.62)";
    ctx.lineWidth = 1.4;
    ctx.lineCap = "round";
    for (let row = 0; row < 2; row++) {
      const wy = y + 6 + row * 5;
      ctx.beginPath();
      for (let wx = x + 4; wx <= x + w - 4; wx += 4) {
        const wy2 = wy + Math.sin((wx - x) * 0.32 + row * 1.6) * 1.5;
        if (wx === x + 4) ctx.moveTo(wx, wy2);
        else ctx.lineTo(wx, wy2);
      }
      ctx.stroke();
    }
    ctx.restore();
    ctx.strokeStyle = "rgba(255,255,255,.9)";
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(x + 4, y + h + 3);
    ctx.lineTo(x + 4, y + 3);
    ctx.moveTo(x + w - 4, y + 3);
    ctx.lineTo(x + w - 4, y + h + 3);
    ctx.stroke();
    ctx.restore();
  }
  function drawVerticalPlatform(p) {
    const { x, y, w, h } = p;
    const half = h / 2;
    drawGroundShadow(x + w / 2, y + h + 4, w * 0.46, 4.5, 0.16);
    ctx.save();
    const shape = () => {
      ctx.beginPath();
      ctx.moveTo(x + 9, y);
      ctx.lineTo(x + w - 9, y);
      ctx.lineTo(x + w, y + half);
      ctx.lineTo(x + w - 9, y + h);
      ctx.lineTo(x + 9, y + h);
      ctx.lineTo(x, y + half);
      ctx.closePath();
    };
    const ice = ctx.createLinearGradient(x, y, x + w, y + h);
    ice.addColorStop(0, "#d6f6ff");
    ice.addColorStop(0.42, "#7dd6ef");
    ice.addColorStop(1, "#2b90bb");
    shape();
    ctx.fillStyle = ice;
    ctx.fill();
    ctx.save();
    shape();
    ctx.clip();
    ctx.fillStyle = "rgba(255,255,255,.34)";
    ctx.beginPath();
    ctx.moveTo(x + 9, y);
    ctx.lineTo(x + w * 0.42, y);
    ctx.lineTo(x + w * 0.3, y + h);
    ctx.lineTo(x + 9, y + h);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "rgba(255,255,255,.16)";
    ctx.beginPath();
    ctx.moveTo(x + w * 0.62, y);
    ctx.lineTo(x + w - 9, y);
    ctx.lineTo(x + w - 9, y + h);
    ctx.lineTo(x + w * 0.52, y + h);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
    ctx.save();
    roundedRect(x, y, w, h, 5);
    ctx.clip();
    snowCap(x + 3, y + 1, w - 6, 6);
    ctx.restore();
    shape();
    ctx.strokeStyle = "rgba(24,96,130,.40)";
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.restore();
  }
  /**
   * Магнитное поле: обмотка по телу, полюса на концах, кольца, уходящие вверх,
   * и искры. Один и тот же код рисует и платформу, и пружинку-подбор.
   */
  /**
   * Магнитное поле по всей длине платформы. Ширина платформ разная и меняется
   * от перка ширины, поэтому число колец и искр считается от p.w, а не задано
   * константой.
   */

  function drawPlatformMagnet(p) {
    const now = frameNow();
    const w = p.w;
    // Геометрия приходит из src/game/field-layout.ts: число колец и искр
    // считается от текущей ширины платформы.
    const layout = fieldLayout(p);
    const cx = layout.glow.x;
    const cy = layout.glow.y;
    ctx.save();

    // Свечение вдоль всей платформы.
    const field = ctx.createRadialGradient(cx, cy, 1, cx, cy, layout.glow.rx);
    field.addColorStop(0, "rgba(122,226,255,.26)");
    field.addColorStop(0.55, "rgba(122,226,255,.09)");
    field.addColorStop(1, "rgba(122,226,255,0)");
    ctx.fillStyle = field;
    ctx.beginPath();
    ctx.ellipse(cx, cy, layout.glow.rx, layout.glow.ry, 0, 0, Math.PI * 2);
    ctx.fill();

    // Кольца уходят вверх и гаснут.
    for (const ring of layout.rings) {
      const phase = ringPhase(now, ring);
      const alpha = (1 - phase) * 0.8;
      if (alpha <= 0.03) continue;
      ctx.globalAlpha = alpha;
      ctx.strokeStyle = "rgba(150,240,255,1)";
      ctx.lineWidth = 1.5 - phase * 0.7;
      ctx.beginPath();
      ctx.ellipse(ring.x, ring.baseY - phase * 11, ring.rx, 2.2 + phase * 1.2, 0, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;

    // Полюса на самых концах.
    for (const pole of layout.poles) {
      const pulse = polePulse(now, pole.side);
      const gradient = ctx.createRadialGradient(pole.x, pole.y, 0.5, pole.x, pole.y, 9);
      gradient.addColorStop(0, "rgba(190,248,255," + (0.85 * pulse).toFixed(2) + ")");
      gradient.addColorStop(1, "rgba(120,226,255,0)");
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(pole.x, pole.y, 9, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "rgba(232,254,255," + (0.7 + 0.3 * pulse).toFixed(2) + ")";
      ctx.beginPath();
      ctx.arc(pole.x, pole.y, 1.5, 0, Math.PI * 2);
      ctx.fill();
    }

    // Блик по кромке, растянутый на ширину.
    ctx.fillStyle = "rgba(240,254,255,.9)";
    roundedRect(p.x + 4, p.y + 1.4, w - 8, 1.6, 0.8);
    ctx.fill();

    // Искры вдоль поля.
    const sparkCount = layout.sparks.length;
    for (let i = 0; i < sparkCount; i++) {
      const angle = now * 1.1 + i * (Math.PI * 2 / sparkCount);
      const baseX = layout.sparks[i].x;
      const sx = baseX + Math.cos(angle) * 7;
      const sy = cy - 4 + Math.sin(angle * 1.3) * 8;
      const twinkle = 0.4 + 0.6 * Math.abs(Math.sin(angle * 2.1 + i));
      ctx.globalAlpha = twinkle;
      ctx.fillStyle = "#eafcff";
      ctx.beginPath();
      ctx.arc(sx, sy, 1 + twinkle * 0.4, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    ctx.restore();
  }

  // Пружинка-подбор: сердечник на поле платформы. Тела и штриховки нет —
  // поле рисует сама платформа, см. drawPlatformMagnet.
  function drawSpring(s) {
    const w = 20;
    const cx = s.x + w / 2;
    const now = frameNow();
    const cy = s.y + 10;
    drawGroundShadow(cx, s.y + 20, 9, 2.6, 0.2);
    ctx.save();

    // Мягкое ядро.
    const core = ctx.createRadialGradient(cx, cy, 0.5, cx, cy, 8);
    core.addColorStop(0, "rgba(236,254,255,.98)");
    core.addColorStop(0.45, "rgba(140,232,255,.75)");
    core.addColorStop(1, "rgba(120,226,255,0)");
    ctx.fillStyle = core;
    ctx.beginPath();
    ctx.arc(cx, cy, 8, 0, Math.PI * 2);
    ctx.fill();

    // Два витка катушки, без насечек.
    const pulse = 0.5 + 0.5 * Math.sin(now * 3);
    for (let i = 0; i < 2; i++) {
      const coilY = cy - 1 + i * 3.6;
      ctx.strokeStyle = "rgba(120,226,255," + (0.55 + pulse * 0.3).toFixed(2) + ")";
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.ellipse(cx, coilY, 4.6 - i * 1.1, 1.5, 0, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Центральная точка.
    ctx.fillStyle = "rgba(250,255,255,.95)";
    ctx.beginPath();
    ctx.arc(cx, cy - 0.4, 1.5, 0, Math.PI * 2);
    ctx.fill();

    // Искры вокруг сердечника.
    for (let i = 0; i < 3; i++) {
      const angle = now * 1.4 + i * (Math.PI * 2 / 3);
      const sx = cx + Math.cos(angle) * 8.5;
      const sy = cy + Math.sin(angle) * 4.5;
      const twinkle = 0.4 + 0.6 * Math.abs(Math.sin(angle * 2 + i));
      ctx.globalAlpha = twinkle;
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.arc(sx, sy, 0.9 + twinkle * 0.5, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    ctx.restore();
  }

  function drawCoin(c) {
    const t = frameNow();
    const spin = Math.cos(t * 2.2 + (c.phase || c.x * 0.05));
    const squashX = Math.max(0.12, Math.abs(spin));
    const r = c.r || 9;
    const cx = c.x;
    const cy = c.y + Math.sin(t * 2.6 + (c.phase || 0)) * 1.2;
    const halo = cachedRadial("coin.halo", 0, 0, r * 0.4, 0, 0, r * 2.1, [
      [0, "rgba(255,214,90,.34)"],
      [1, "rgba(255,214,90,0)"]
    ]);
    ctx.save();
    ctx.translate(cx, cy);
    ctx.fillStyle = halo;
    ctx.beginPath();
    ctx.arc(0, 0, r * 2.1, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    drawGroundShadow(cx, c.y + r + 5, r * 0.85, 2.6, 0.14);
    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(squashX, 1);
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.fillStyle = "#8a5a00";
    ctx.fill();
    const rim = cachedRadial("coin.rim", -r * 0.35, -r * 0.42, r * 0.1, 0, 0, r, [
      [0, "#fff8c4"],
      [0.48, "#ffd23f"],
      [1, "#c98700"]
    ]);
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.92, 0, Math.PI * 2);
    ctx.fillStyle = rim;
    ctx.fill();
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.68, 0, Math.PI * 2);
    ctx.strokeStyle = "rgba(160,104,0,.55)";
    ctx.lineWidth = r * 0.1;
    ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(-r * 0.34, -r * 0.36, r * 0.19, r * 0.3, -0.55, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(255,255,255,.85)";
    ctx.fill();
    ctx.strokeStyle = "rgba(150,96,0,.9)";
    ctx.lineWidth = Math.max(0.9, r * 0.11);
    ctx.lineCap = "round";
    for (let i = 0; i < 3; i++) {
      const a = Math.PI / 3 * i;
      ctx.beginPath();
      ctx.moveTo(-Math.cos(a) * r * 0.4, -Math.sin(a) * r * 0.4);
      ctx.lineTo(Math.cos(a) * r * 0.4, Math.sin(a) * r * 0.4);
      ctx.stroke();
    }
    ctx.restore();
    if (squashX > 0.85) {
      const sparkle = (squashX - 0.85) / 0.15;
      ctx.save();
      ctx.globalAlpha = sparkle * 0.9;
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.ellipse(cx - r * 0.3, cy - r * 0.42, r * 0.11, r * 0.2, -0.4, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }
  // Камни лавины: рисуем отдельно от птиц — снежный валун с гранями и снежной шапкой.
  function drawAvalancheRock(rock) {
    const size = (rock.size || 1) * 1.1;
    ctx.save();
    ctx.translate(rock.x, rock.y);
    ctx.rotate((rock.flap || 0) * 1.8);
    ctx.scale(size, size);
    ctx.shadowColor = "rgba(30,70,100,.30)";
    ctx.shadowBlur = 6;
    ctx.shadowOffsetY = 2;
    const stone = ctx.createLinearGradient(-14, -16, 14, 16);
    stone.addColorStop(0, "#e8f3fb");
    stone.addColorStop(0.34, "#b9cdda");
    stone.addColorStop(0.72, "#8399ab");
    stone.addColorStop(1, "#5b7286");
    ctx.beginPath();
    ctx.moveTo(-13, -3);
    ctx.lineTo(-9, -12);
    ctx.lineTo(0, -15);
    ctx.lineTo(10, -10);
    ctx.lineTo(15, 0);
    ctx.lineTo(11, 10);
    ctx.lineTo(1, 14);
    ctx.lineTo(-8, 11);
    ctx.lineTo(-14, 4);
    ctx.closePath();
    ctx.fillStyle = stone;
    ctx.fill();
    ctx.shadowColor = "transparent";
    ctx.strokeStyle = "rgba(42,76,102,.55)";
    ctx.lineWidth = 1.1;
    ctx.stroke();
    // Грани
    ctx.strokeStyle = "rgba(48,82,108,.30)";
    ctx.lineWidth = 0.9;
    ctx.beginPath();
    ctx.moveTo(-9, -12);
    ctx.lineTo(-2, -4);
    ctx.lineTo(1, 14);
    ctx.moveTo(-2, -4);
    ctx.lineTo(10, -10);
    ctx.moveTo(-2, -4);
    ctx.lineTo(-13, -3);
    ctx.stroke();
    // Снежная шапка
    ctx.beginPath();
    ctx.moveTo(-9, -12);
    ctx.quadraticCurveTo(-4, -17, 2, -15);
    ctx.quadraticCurveTo(6, -13.5, 8, -9.5);
    ctx.quadraticCurveTo(1, -11.5, -4, -9.8);
    ctx.quadraticCurveTo(-7, -10.6, -9, -12);
    ctx.closePath();
    ctx.fillStyle = "rgba(250,254,255,.92)";
    ctx.fill();
    // Блик и льдинка
    ctx.fillStyle = "rgba(255,255,255,.55)";
    ctx.beginPath();
    ctx.ellipse(-4, 3, 4.6, 2.2, -0.45, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "rgba(210,244,255,.9)";
    ctx.beginPath();
    ctx.moveTo(6, 2);
    ctx.lineTo(8.6, 5.2);
    ctx.lineTo(6.2, 7.4);
    ctx.lineTo(4, 4.4);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }