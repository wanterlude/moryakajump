  // ===== Магазин карточек: заготовка =====
  // Карточки — отдельная коллекция: своя гача, свой счётчик и надевание. Нарисованы
  // процедурно (градиент, узор, рамка), чтобы не тащить картинки.
  var CARDS_COST = 50;
  var CARDS_DUPLICATE_REFUND = 0.4;
  var CARDS_SPIN_MS = 900;
  var CARDS_REVEAL_MS = 1400;
  var CARDS_UI = {
    card: { w: 120, h: 168, cx: 200, cy: 182 },
    hintY: 422,
    ownedY: 462,
    tileW: 34,
    tileH: 46,
    tileGap: 6,
    maxTiles: 9
  };
  var cardsState = { phase: "idle", startedAt: 0, result: null, duplicate: false, refund: 0, reel: 0 };
  var cardsPressStart = null;

  function readOwnedCards() {
    try {
      const raw = localStorage.getItem("morjakaOwnedCards");
      if (raw) {
        const list = JSON.parse(raw);
        if (Array.isArray(list)) {
          const known = list.filter((id) => CARDS.some((card) => card.id === id));
          if (known.length) return known.includes("card_base") ? known : ["card_base"].concat(known);
        }
      }
    } catch {}
    return ["card_base"];
  }
  function readSelectedCard() {
    try {
      const raw = localStorage.getItem("morjakaSelectedCard");
      if (raw && CARDS.some((card) => card.id === raw)) return raw;
    } catch {}
    return "card_base";
  }
  var cardsOwned = readOwnedCards();
  var cardsSelected = readSelectedCard();

  function saveCards() {
    try {
      localStorage.setItem("morjakaOwnedCards", JSON.stringify(cardsOwned));
      localStorage.setItem("morjakaSelectedCard", cardsSelected);
    } catch {}
  }
  function cardById(id) {
    return CARDS.find((card) => card.id === id) || CARDS[0];
  }
  function cardsSelectedCard() {
    return cardById(cardsSelected);
  }
  function cardsOfTier(tier) {
    return CARDS.filter((card) => card.tier === tier);
  }
  function updateCardsSpin() {
    const now = performance.now();
    if (cardsState.phase === "spin" && now - cardsState.startedAt >= CARDS_SPIN_MS) finishCardsSpin();
    if (cardsState.phase === "reveal" && now - cardsState.startedAt >= CARDS_REVEAL_MS) cardsState.phase = "idle";
  }
  function cardsSpin() {
    if (cardsState.phase !== "idle") return;
    if (bankCoins < CARDS_COST) {
      setMenuMessage("\u041D\u0435 \u0445\u0432\u0430\u0442\u0430\u0435\u0442 \u043C\u043E\u043D\u0435\u0442", "\u041D\u0443\u0436\u043D\u043E " + CARDS_COST);
      sfx.click();
      return;
    }
    bankCoins -= CARDS_COST;
    const tier = rollGachaTier();
    const order = ["divine", "legendary", "epic", "rare", "common", "base"];
    const start = Math.max(0, order.indexOf(tier));
    let pool = [];
    for (let i = start; i < order.length && !pool.length; i++) pool = cardsOfTier(order[i]);
    if (!pool.length) pool = CARDS;
    const card = pool[Math.floor(Math.random() * pool.length)];
    cardsState.result = card;
    cardsState.duplicate = cardsOwned.includes(card.id);
    cardsState.refund = cardsState.duplicate ? Math.round(CARDS_COST * CARDS_DUPLICATE_REFUND) : 0;
    cardsState.reel = Math.floor(Math.random() * CARDS.length);
    cardsState.phase = "spin";
    cardsState.startedAt = performance.now();
    sfx.click();
  }
  function finishCardsSpin() {
    const card = cardsState.result;
    if (!card) {
      cardsState.phase = "idle";
      return;
    }
    if (cardsState.duplicate) bankCoins += cardsState.refund;
    else cardsOwned.push(card.id);
    saveCards();
    cardsState.phase = "reveal";
    cardsState.startedAt = performance.now();
    sfx.coin();
  }
  function cardsEquip(id) {
    if (!cardsOwned.includes(id)) return;
    cardsSelected = id;
    saveCards();
    sfx.click();
  }

  // ---------- отрисовка карточки ----------
  function drawCardPattern(x, y, w, h, card) {
    const cx = x + w / 2;
    const cy = y + h / 2;
    ctx.save();
    ctx.strokeStyle = card.accent;
    ctx.fillStyle = card.accent;
    ctx.globalAlpha = 0.22;
    ctx.lineWidth = 1.2;
    if (card.pattern === "rings") {
      for (let i = 1; i <= 4; i++) {
        ctx.beginPath();
        ctx.arc(cx, cy - 6, 12 + i * 11, 0, Math.PI * 2);
        ctx.stroke();
      }
    } else if (card.pattern === "waves") {
      for (let row = 0; row < 5; row++) {
        ctx.beginPath();
        for (let i = 0; i <= 10; i++) {
          const px = x + (w / 10) * i;
          const py = y + h * 0.2 + row * 24 + Math.sin(i * 0.9 + row) * 5;
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.stroke();
      }
    } else if (card.pattern === "stars") {
      for (let i = 0; i < 14; i++) {
        const px = x + 8 + ((i * 37) % (w - 16));
        const py = y + 10 + ((i * 53) % (h - 20));
        const r = 1.6 + (i % 3);
        ctx.beginPath();
        ctx.arc(px, py, r, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (card.pattern === "shards") {
      for (let i = 0; i < 6; i++) {
        const px = x + 10 + ((i * 47) % (w - 20));
        const py = y + 20 + ((i * 71) % (h - 40));
        ctx.beginPath();
        ctx.moveTo(px, py - 10);
        ctx.lineTo(px + 7, py + 6);
        ctx.lineTo(px - 7, py + 6);
        ctx.closePath();
        ctx.stroke();
      }
    } else if (card.pattern === "web") {
      for (let i = 0; i < 6; i++) {
        const a = (Math.PI * 2 * i) / 6;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx + Math.cos(a) * 70, cy + Math.sin(a) * 90);
        ctx.stroke();
      }
      for (let r = 18; r < 90; r += 20) {
        ctx.beginPath();
        for (let i = 0; i <= 6; i++) {
          const a = (Math.PI * 2 * i) / 6;
          const px = cx + Math.cos(a) * r;
          const py = cy + Math.sin(a) * r;
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.stroke();
      }
    } else {
      for (let row = -1; row < 8; row++) {
        for (let col = -1; col < 5; col++) {
          const px = x + col * 30 + (row % 2 ? 15 : 0);
          const py = y + row * 24;
          ctx.beginPath();
          for (let i = 0; i < 6; i++) {
            const a = (Math.PI / 3) * i;
            const hx = px + Math.cos(a) * 11;
            const hy = py + Math.sin(a) * 11;
            if (i === 0) ctx.moveTo(hx, hy);
            else ctx.lineTo(hx, hy);
          }
          ctx.closePath();
          ctx.stroke();
        }
      }
    }
    ctx.restore();
  }
  function drawCardFace(cx, cy, w, h, card, options = {}) {
    const x = cx - w / 2;
    const y = cy - h / 2;
    ctx.save();
    if (options.glow) {
      const halo = ctx.createRadialGradient(cx, cy, 8, cx, cy, w);
      halo.addColorStop(0, card.accent);
      halo.addColorStop(1, "rgba(255,255,255,0)");
      ctx.globalAlpha = 0.35;
      ctx.fillStyle = halo;
      ctx.fillRect(cx - w, cy - h, w * 2, h * 2);
      ctx.globalAlpha = 1;
    }
    ctx.shadowColor = "rgba(15,61,92,.28)";
    ctx.shadowBlur = 14;
    ctx.shadowOffsetY = 6;
    roundedRect(x, y, w, h, 10);
    const fill = ctx.createLinearGradient(x, y, x, y + h);
    fill.addColorStop(0, card.top);
    fill.addColorStop(1, card.bottom);
    ctx.fillStyle = fill;
    ctx.fill();
    ctx.shadowColor = "transparent";
    ctx.save();
    roundedRect(x, y, w, h, 10);
    ctx.clip();
    drawCardPattern(x, y, w, h, card);
    const shine = ctx.createLinearGradient(x, y, x + w, y + h);
    shine.addColorStop(0, "rgba(255,255,255,.42)");
    shine.addColorStop(0.45, "rgba(255,255,255,.04)");
    shine.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = shine;
    ctx.fillRect(x, y, w, h);
    ctx.restore();
    roundedRect(x + 0.75, y + 0.75, w - 1.5, h - 1.5, 10);
    ctx.strokeStyle = card.accent;
    ctx.lineWidth = options.compact ? 1.4 : 2;
    ctx.stroke();
    if (!options.compact) {
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      setFont(9, "bold");
      ctx.fillStyle = "#0f3d5c";
      trackedText(card.name.toUpperCase(), cx, y + h - 30, 0.6);
      setFont(6, "bold");
      ctx.fillStyle = "rgba(15,61,92,.55)";
      trackedText(card.motto, cx, y + h - 18, 0.8);
    }
    ctx.restore();
  }
  function cardsOwnedRects() {
    const list = cardsOwned;
    const max = CARDS_UI.maxTiles;
    let start = 0;
    if (list.length > max) {
      const equipped = list.indexOf(cardsSelected);
      const anchor = equipped < 0 ? list.length - 1 : equipped;
      start = Math.max(0, Math.min(list.length - max, anchor - Math.floor(max / 2)));
    }
    const shown = list.slice(start, start + max);
    const rowW = shown.length * CARDS_UI.tileW + (shown.length - 1) * CARDS_UI.tileGap;
    const x0 = (WORLD_W - rowW) / 2;
    return shown.map((id, i) => ({
      id,
      x: x0 + i * (CARDS_UI.tileW + CARDS_UI.tileGap),
      y: CARDS_UI.ownedY,
      w: CARDS_UI.tileW,
      h: CARDS_UI.tileH
    }));
  }
  function drawCardsCollection() {
    const y = GACHA_UI.collectY;
    const total = CARDS.length;
    const ratio = cardsOwned.length / total;
    ctx.save();
    ctx.textBaseline = "middle";
    setFont(7, "bold");
    ctx.fillStyle = "rgba(21,85,118,.55)";
    trackedText("\u0421\u041E\u0411\u0420\u0410\u041D\u041E", 20, y + 5, 1.4, "left");
    setFont(8.5, "bold");
    ctx.fillStyle = "#0f3d5c";
    trackedText(cardsOwned.length + " / " + total, 380, y + 5, 0.8, "right");
    ctx.restore();
    const barY = y + 16;
    roundedRect(20, barY, 360, 7, 3.5);
    ctx.fillStyle = "rgba(21,85,118,.12)";
    ctx.fill();
    if (ratio > 0) {
      roundedRect(20, barY, Math.max(7, 360 * ratio), 7, 3.5);
      ctx.fillStyle = "#0f8a76";
      ctx.fill();
    }
  }
  function drawCardsShop() {
    updateCardsSpin();
    const P = GACHA_UI.panel;
    roundedRect(P.x, P.y, P.w, P.h, 18);
    ctx.fillStyle = "rgba(255,255,255,.58)";
    ctx.fill();
    roundedRect(P.x + 0.75, P.y + 0.75, P.w - 1.5, P.h - 1.5, 18);
    ctx.strokeStyle = "rgba(21,85,118,.10)";
    ctx.lineWidth = 1.2;
    ctx.stroke();
    let card = cardsSelectedCard();
    let glow = false;
    if (cardsState.phase === "spin") {
      const ticks = Math.floor((performance.now() - cardsState.startedAt) / 80);
      card = CARDS[(ticks + cardsState.reel) % CARDS.length];
    } else if (cardsState.phase === "reveal" && cardsState.result) {
      card = cardsState.result;
      glow = true;
    }
    drawCardFace(CARDS_UI.card.cx, CARDS_UI.card.cy, CARDS_UI.card.w, CARDS_UI.card.h, card, { glow });
    ctx.save();
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    setFont(6.5, "bold");
    ctx.fillStyle = "rgba(21,85,118,.42)";
    const status = cardsState.phase === "reveal"
      ? (cardsState.duplicate ? "\u0414\u0423\u0411\u041B\u0418\u041A\u0410\u0422 \xB7 +" + cardsState.refund + " \u041C\u041E\u041D\u0415\u0422" : "\u041D\u041E\u0412\u0410\u042F \u041A\u0410\u0420\u0422\u041E\u0427\u041A\u0410")
      : "\u0421\u0415\u0419\u0427\u0410\u0421 \u041D\u0410\u0414\u0415\u0422\u0410";
    trackedText(status, CARDS_UI.card.cx, 274, 1.2);
    ctx.restore();
    drawCardsCollection();
    drawGachaActionButton(GACHA_UI.spinX, GACHA_UI.spinY, GACHA_UI.spinW, GACHA_UI.spinH, "\u041A\u0420\u0423\u0422\u0418\u0422\u042C", "ghostGreen", {
      cost: CARDS_COST,
      dim: cardsState.phase !== "idle" || bankCoins < CARDS_COST,
      busy: cardsState.phase === "spin",
      hoverKey: "cards-spin"
    });
    drawGachaPlayButton();
    ctx.save();
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    setFont(6.5, "bold");
    ctx.fillStyle = "rgba(21,85,118,.38)";
    trackedText("\u0414\u0423\u0411\u041B\u0418\u041A\u0410\u0422 \u0412\u041E\u0417\u0412\u0420\u0410\u0429\u0410\u0415\u0422 20 \u041C\u041E\u041D\u0415\u0422", WORLD_W / 2, CARDS_UI.hintY, 1);
    trackedText("\u0422\u0412\u041E\u0418 \u041A\u0410\u0420\u0422\u041E\u0427\u041A\u0418", 20, CARDS_UI.ownedY - 12, 1.6, "left");
    trackedText("\u041D\u0410\u0416\u041C\u0418, \u0427\u0422\u041E\u0411\u042B \u041D\u0410\u0414\u0415\u0422\u042C", WORLD_W - 20, CARDS_UI.ownedY - 12, 1, "right");
    ctx.restore();
    for (const rect of cardsOwnedRects()) {
      const tileCard = cardById(rect.id);
      drawCardFace(rect.x + rect.w / 2, rect.y + rect.h / 2, rect.w, rect.h, tileCard, { compact: true });
      if (rect.id === cardsSelected) {
        roundedRect(rect.x - 2, rect.y - 2, rect.w + 4, rect.h + 4, 8);
        ctx.strokeStyle = "#0f8a76";
        ctx.lineWidth = 2;
        ctx.stroke();
      }
    }
  }
  function cardsTap(point) {
    if (cardsState.phase !== "idle") return;
    if (point.x >= GACHA_UI.spinX && point.x <= GACHA_UI.spinX + GACHA_UI.spinW &&
        point.y >= GACHA_UI.spinY && point.y <= GACHA_UI.spinY + GACHA_UI.spinH) {
      cardsSpin();
      return;
    }
    if (point.x >= GACHA_UI.playX && point.x <= GACHA_UI.playX + GACHA_UI.playW &&
        point.y >= GACHA_UI.spinY && point.y <= GACHA_UI.spinY + GACHA_UI.spinH) {
      startGame();
      return;
    }
    for (const rect of cardsOwnedRects()) {
      if (point.x >= rect.x && point.x <= rect.x + rect.w && point.y >= rect.y && point.y <= rect.y + rect.h) {
        cardsEquip(rect.id);
        return;
      }
    }
  }
