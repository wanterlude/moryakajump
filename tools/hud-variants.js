// Десять версий HUD забега для сравнения — только предпросмотр через tools/shot.js.
//
//   node tools/shot.js --tabs=hud --hud=1 --label=v1
//
// Ежедневка в этих кадрах намеренно не рисуется: сначала выбираем раскладку
// счёта и ресурсов, а карточку задания потом поставим в свободное место.
// Пауза, перки и всплывашки остаются как в игре.

const COMMON = String.raw`
  function __hudTail() {
    drawHudButtons();
    drawActivePerks();
    drawEventTimer();
    drawTouchHints(performance.now());
    drawHudPops();
  }
  function __gcard(x, y, w, h, r, a) {
    ctx.save();
    ctx.shadowColor = "rgba(12,40,64,.20)";
    ctx.shadowBlur = 11;
    ctx.shadowOffsetY = 3;
    roundedRect(x, y, w, h, r);
    ctx.fillStyle = "rgba(255,255,255," + (a == null ? 0.80 : a) + ")";
    ctx.fill();
    ctx.shadowColor = "transparent";
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;
    roundedRect(x + 0.5, y + 0.5, w - 1, h - 1, r - 0.5);
    ctx.strokeStyle = "rgba(255,255,255,.95)";
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.restore();
  }
  function __dcard(x, y, w, h, r) {
    ctx.save();
    ctx.shadowColor = "rgba(6,24,40,.34)";
    ctx.shadowBlur = 14;
    ctx.shadowOffsetY = 5;
    roundedRect(x, y, w, h, r);
    var g = ctx.createLinearGradient(0, y, 0, y + h);
    g.addColorStop(0, "rgba(9,36,58,.70)");
    g.addColorStop(1, "rgba(7,30,50,.56)");
    ctx.fillStyle = g;
    ctx.fill();
    ctx.shadowColor = "transparent";
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;
    roundedRect(x + 0.5, y + 0.5, w - 1, h - 1, r - 0.5);
    ctx.strokeStyle = "rgba(255,255,255,.26)";
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.restore();
  }
  function __label(s, x, y, size, color, align, tracking) {
    setFont(size, "bold");
    ctx.fillStyle = color;
    ctx.textAlign = align || "left";
    ctx.textBaseline = "middle";
    trackedText(s, x, y, tracking || 0, align || "left");
  }
  // Ресурс: рисует иконку и значение, возвращает занятую ширину.
  function __res(kind, x, cy, s, ink) {
    var col = ink || HUD_COLORS.ink;
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    if (kind === "heart") {
      drawHeart(x + s * 0.5, cy, s * 0.52, HUD_COLORS.red);
      setFont(s * 1.02, "bold");
      ctx.fillStyle = col;
      ctx.fillText(String(lives), x + s * 1.08, cy + 0.5);
      return s * 1.08 + ctx.measureText(String(lives)).width;
    }
    if (kind === "coin") {
      var perLife = coinsPerLife();
      var txt = (runCoins % perLife) + "/" + perLife;
      drawCoinBadge(x + s * 0.5, cy, s * 0.46, (runCoins % perLife) / perLife);
      setFont(s * 0.86, "bold");
      ctx.fillStyle = HUD_COLORS.gold;
      ctx.fillText(txt, x + s * 1.08, cy + 0.5);
      return s * 1.08 + ctx.measureText(txt).width;
    }
    var ready = jumpCharges > 0 && currentState === STATE.PLAYING;
    var jc = ready ? HUD_COLORS.green : "rgba(21,85,118,.34)";
    ctx.strokeStyle = jc;
    ctx.lineWidth = Math.max(1.4, s * 0.16);
    ctx.lineCap = "round";
    for (var i = 0; i < 2; i++) {
      var yy = cy + s * 0.22 - i * s * 0.42;
      ctx.beginPath();
      ctx.moveTo(x, yy);
      ctx.lineTo(x + s * 0.42, yy - s * 0.3);
      ctx.lineTo(x + s * 0.84, yy);
      ctx.stroke();
    }
    ctx.lineCap = "butt";
    setFont(s * 0.9, "bold");
    ctx.fillStyle = jc;
    ctx.fillText("\xD72", x + s * 1.02, cy + 0.5);
    return s * 1.02 + ctx.measureText("\xD72").width;
  }
  function __resRow(x, cy, s, gap, ink) {
    var w = 0;
    w += __res("heart", x + w, cy, s, ink) + gap;
    w += __res("coin", x + w, cy, s, ink) + gap;
    w += __res("jump", x + w, cy, s, ink);
    return w;
  }
  function __scoreText(x, y, size, color, align) {
    var beating = Math.floor(player.score) > highScore && highScore > 0;
    __label(fmt(Math.floor(hudState.score)), x, y, size, color || "#ffffff", align || "left", size * 0.03);
    return beating;
  }
`;

// 1. Как сейчас: без плашки, слева, ресурсы строкой под счётом.
const V1 = String.raw`
  function __hud1() {
    var t = performance.now() / 1e3;
    var beating = Math.floor(player.score) > highScore && highScore > 0;
    ctx.save();
    ctx.textBaseline = "middle";
    ctx.textAlign = "left";
    ctx.shadowColor = "rgba(255,255,255,.95)";
    ctx.shadowBlur = 8;
    __label("СЧЁТ", 16, 15, 6.4, "rgba(21,85,118,.7)", "left", 2);
    setFont(26, "bold");
    ctx.fillStyle = "#ffffff";
    ctx.shadowColor = "rgba(2,14,26,.55)";
    ctx.shadowBlur = 4;
    ctx.shadowOffsetY = 1.2;
    trackedText(fmt(Math.floor(hudState.score)), 16, 35, 0.6, "left");
    ctx.shadowColor = "rgba(255,255,255,.9)";
    ctx.shadowBlur = 6;
    ctx.shadowOffsetY = 0;
    __label(beating ? "НОВЫЙ РЕКОРД" : "РЕКОРД " + fmt(highScore), 16, 53, 6.2, beating ? "rgba(166,96,0,.9)" : "rgba(21,85,118,.66)", "left", 1.1);
    ctx.restore();
    __resRow(16, 67 + 10, 13, 14);
    __hudTail();
  }
`;

// 2. Центр-симметрия: счёт по центру, жизни слева, монеты справа.
const V2 = String.raw`
  function __hud2() {
    var cx = 200;
    ctx.save();
    ctx.textBaseline = "middle";
    ctx.textAlign = "center";
    ctx.shadowColor = "rgba(255,255,255,.95)";
    ctx.shadowBlur = 8;
    __label("СЧЁТ", cx, 14, 6.4, "rgba(21,85,118,.7)", "center", 2.4);
    setFont(24, "bold");
    ctx.fillStyle = "#ffffff";
    ctx.shadowColor = "rgba(2,14,26,.55)";
    ctx.shadowBlur = 4;
    ctx.shadowOffsetY = 1.2;
    trackedText(fmt(Math.floor(hudState.score)), cx, 34, 0.6, "center");
    ctx.shadowColor = "transparent";
    ctx.shadowBlur = 0;
    ctx.restore();
    __gcard(14, 12, 74, 24, 12, 0.8);
    __res("heart", 24, 24, 13);
    __gcard(258, 12, 74, 24, 12, 0.8);
    __res("coin", 268, 24, 13);
    __gcard(158, 54, 84, 20, 10, 0.8);
    __res("jump", 178, 64, 12);
    __hudTail();
  }
`;

// 3. Правый верхний угол: всё справа, счёт крупный, ресурсы под ним.
const V3 = String.raw`
  function __hud3() {
    var rx = 340;
    ctx.save();
    ctx.textBaseline = "middle";
    ctx.textAlign = "right";
    ctx.shadowColor = "rgba(255,255,255,.95)";
    ctx.shadowBlur = 8;
    __label("СЧЁТ", rx, 15, 6.4, "rgba(21,85,118,.7)", "right", 2);
    setFont(26, "bold");
    ctx.fillStyle = "#ffffff";
    ctx.shadowColor = "rgba(2,14,26,.55)";
    ctx.shadowBlur = 4;
    ctx.shadowOffsetY = 1.2;
    trackedText(fmt(Math.floor(hudState.score)), rx, 35, 0.6, "right");
    ctx.shadowColor = "rgba(255,255,255,.9)";
    ctx.shadowBlur = 6;
    ctx.shadowOffsetY = 0;
    __label("РЕКОРД " + fmt(highScore), rx, 53, 6.2, "rgba(21,85,118,.66)", "right", 1.1);
    ctx.restore();
    __gcard(222, 62, 118, 24, 12, 0.8);
    __res("heart", 232, 74, 12);
    __res("coin", 274, 74, 12);
    __res("jump", 316, 74, 12);
    __hudTail();
  }
`;

// 4. Нижний док: ресурсы внизу по центру, счёт сверху слева без плашки.
const V4 = String.raw`
  function __hud4() {
    ctx.save();
    ctx.textBaseline = "middle";
    ctx.textAlign = "left";
    ctx.shadowColor = "rgba(255,255,255,.95)";
    ctx.shadowBlur = 8;
    setFont(24, "bold");
    ctx.fillStyle = "#ffffff";
    ctx.shadowColor = "rgba(2,14,26,.55)";
    ctx.shadowBlur = 4;
    trackedText(fmt(Math.floor(hudState.score)), 16, 26, 0.6, "left");
    ctx.shadowColor = "rgba(255,255,255,.9)";
    ctx.shadowBlur = 6;
    __label("РЕКОРД " + fmt(highScore), 16, 42, 6.2, "rgba(21,85,118,.66)", "left", 1.1);
    ctx.restore();
    __gcard(120, 552, 160, 30, 15, 0.82);
    __res("heart", 136, 567, 14);
    __res("coin", 190, 567, 14);
    __res("jump", 250, 567, 14);
    __hudTail();
  }
`;

// 5. Медальоны: три круглых стеклянных диска справа сверху.
const V5 = String.raw`
  function __hud5() {
    var cy = 32;
    var xs = [228, 272, 316];
    for (var i = 0; i < 3; i++) {
      ctx.save();
      ctx.shadowColor = "rgba(12,40,64,.22)";
      ctx.shadowBlur = 10;
      ctx.shadowOffsetY = 3;
      ctx.beginPath();
      ctx.arc(xs[i], cy, 20, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(255,255,255,.80)";
      ctx.fill();
      ctx.shadowColor = "transparent";
      ctx.shadowBlur = 0;
      ctx.shadowOffsetY = 0;
      ctx.strokeStyle = "rgba(255,255,255,.95)";
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.restore();
    }
    drawHeart(xs[0], cy - 3, 6, HUD_COLORS.red);
    __label(String(lives), xs[0], cy + 9, 8, HUD_COLORS.ink, "center");
    var perLife = coinsPerLife();
    drawCoinBadge(xs[1], cy - 3, 6, (runCoins % perLife) / perLife);
    __label((runCoins % perLife) + "/" + perLife, xs[1], cy + 9, 7, HUD_COLORS.gold, "center");
    var ready = jumpCharges > 0 && currentState === STATE.PLAYING;
    __label("\xD72", xs[2], cy + 8, 7.5, ready ? HUD_COLORS.green : "rgba(21,85,118,.34)", "center");
    ctx.save();
    ctx.strokeStyle = ready ? HUD_COLORS.green : "rgba(21,85,118,.3)";
    ctx.lineWidth = 1.6;
    ctx.lineCap = "round";
    for (var k = 0; k < 2; k++) {
      var yy = cy - 1 - k * 4;
      ctx.beginPath();
      ctx.moveTo(xs[2] - 5, yy);
      ctx.lineTo(xs[2] - 1.5, yy - 3);
      ctx.lineTo(xs[2] + 2, yy);
      ctx.stroke();
    }
    ctx.restore();
    ctx.save();
    ctx.textBaseline = "middle";
    ctx.textAlign = "left";
    ctx.shadowColor = "rgba(255,255,255,.95)";
    ctx.shadowBlur = 8;
    __label("СЧЁТ", 16, 22, 6.4, "rgba(21,85,118,.7)", "left", 2);
    setFont(28, "bold");
    ctx.fillStyle = "#ffffff";
    ctx.shadowColor = "rgba(2,14,26,.55)";
    ctx.shadowBlur = 4;
    trackedText(fmt(Math.floor(hudState.score)), 16, 44, 0.6, "left");
    ctx.restore();
    __hudTail();
  }
`;

// 6. Табло: тёмная рамка, моноширинные цифры, ресурсы иконками справа.
const V6 = String.raw`
  function __hud6() {
    __dcard(12, 10, 150, 40, 8);
    ctx.save();
    ctx.textBaseline = "middle";
    ctx.textAlign = "left";
    __label("СЧЁТ", 24, 20, 5.8, "rgba(219,242,255,.62)", "left", 2);
    setFont(20, "bold");
    ctx.fillStyle = "#eaf7ff";
    ctx.font = "bold 20px Consolas, monospace";
    ctx.textAlign = "left";
    ctx.fillText(fmt(Math.floor(hudState.score)) + "", 24, 35);
    ctx.restore();
    __gcard(170, 10, 168, 40, 10, 0.78);
    __res("heart", 182, 30, 13);
    __res("coin", 230, 30, 13);
    __res("jump", 288, 30, 13);
    __hudTail();
  }
`;

// 7. Водяной знак: огромный полупрозрачный счёт в фоне, данные мелкой строкой.
const V7 = String.raw`
  function __hud7() {
    ctx.save();
    ctx.globalAlpha = 0.28;
    ctx.textBaseline = "middle";
    ctx.textAlign = "left";
    setFont(54, "bold");
    ctx.fillStyle = "#0f3d5c";
    trackedText(fmt(Math.floor(hudState.score)), 12, 52, 1, "left");
    ctx.restore();
    __gcard(12, 96, 128, 20, 10, 0.72);
    __res("heart", 22, 106, 11);
    __res("coin", 60, 106, 11);
    __res("jump", 100, 106, 11);
    ctx.save();
    ctx.textBaseline = "middle";
    ctx.textAlign = "left";
    __label("РЕКОРД " + fmt(highScore), 14, 126, 6.4, "rgba(21,85,118,.6)", "left", 1.1);
    ctx.restore();
    __hudTail();
  }
`;

// 8. Рельс справа: вертикальная колонка иконок, счёт слева.
const V8 = String.raw`
  function __hud8() {
    var rx = 362, ry = 66;
    var rows = ["heart", "coin", "jump"];
    for (var i = 0; i < rows.length; i++) {
      var y = 46 + i * 30;
      __gcard(rx - 34, y, 34, 26, 13, 0.78);
      __res(rows[i], rx - 27, y + 13, 11);
    }
    ctx.save();
    ctx.textBaseline = "middle";
    ctx.textAlign = "left";
    ctx.shadowColor = "rgba(255,255,255,.95)";
    ctx.shadowBlur = 8;
    __label("СЧЁТ", 16, 20, 6.4, "rgba(21,85,118,.7)", "left", 2);
    setFont(26, "bold");
    ctx.fillStyle = "#ffffff";
    ctx.shadowColor = "rgba(2,14,26,.55)";
    ctx.shadowBlur = 4;
    trackedText(fmt(Math.floor(hudState.score)), 16, 42, 0.6, "left");
    ctx.shadowColor = "rgba(255,255,255,.9)";
    ctx.shadowBlur = 6;
    __label("РЕКОРД " + fmt(highScore), 16, 58, 6.2, "rgba(21,85,118,.66)", "left", 1.1);
    ctx.restore();
    __hudTail();
  }
`;

// 9. Снежная табличка: плашка с волнистым нижним краем.
const V9 = String.raw`
  function __hud9() {
    var x = 10, y = 8, w = 150, h = 48;
    ctx.save();
    ctx.shadowColor = "rgba(12,40,64,.22)";
    ctx.shadowBlur = 12;
    ctx.shadowOffsetY = 4;
    ctx.beginPath();
    ctx.moveTo(x + 14, y);
    ctx.lineTo(x + w - 14, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + 14);
    ctx.lineTo(x + w, y + h - 12);
    ctx.quadraticCurveTo(x + w - 26, y + h + 4, x + w - 52, y + h - 6);
    ctx.quadraticCurveTo(x + w - 78, y + h + 4, x + w - 104, y + h - 6);
    ctx.quadraticCurveTo(x + w - 130, y + h + 4, x, y + h - 10);
    ctx.lineTo(x, y + 14);
    ctx.quadraticCurveTo(x, y, x + 14, y);
    ctx.closePath();
    ctx.fillStyle = "rgba(255,255,255,.86)";
    ctx.fill();
    ctx.shadowColor = "transparent";
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;
    ctx.strokeStyle = "rgba(255,255,255,.95)";
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.restore();
    ctx.save();
    ctx.textBaseline = "middle";
    ctx.textAlign = "left";
    __label("СЧЁТ", x + 16, y + 14, 6, "rgba(21,85,118,.6)", "left", 2);
    setFont(22, "bold");
    ctx.fillStyle = HUD_COLORS.ink;
    trackedText(fmt(Math.floor(hudState.score)), x + 16, y + 27, 0.5, "left");
    __label("РЕКОРД " + fmt(highScore), x + 16, y + 37, 5.6, "rgba(21,85,118,.55)", "left", 0.8);
    ctx.restore();
    __resRow(x + 16, y + 47, 11, 12);
    __hudTail();
  }
`;

// 10. Статус-бар: одна тонкая полоса во всю ширину с разделителями.
const V10 = String.raw`
  function __hud10() {
    __gcard(8, 8, 384, 26, 13, 0.74);
    var cy = 21;
    var x = 20;
    x += __res("heart", x, cy, 12) + 12;
    ctx.save();
    ctx.strokeStyle = "rgba(21,85,118,.16)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x - 6, cy - 8);
    ctx.lineTo(x - 6, cy + 8);
    ctx.stroke();
    ctx.restore();
    x += __res("coin", x, cy, 12) + 12;
    ctx.save();
    ctx.strokeStyle = "rgba(21,85,118,.16)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x - 6, cy - 8);
    ctx.lineTo(x - 6, cy + 8);
    ctx.stroke();
    ctx.restore();
    x += __res("jump", x, cy, 12);
    ctx.save();
    ctx.textBaseline = "middle";
    ctx.textAlign = "right";
    __label("СЧЁТ", 330, 15, 5.6, "rgba(21,85,118,.55)", "right", 1.8);
    setFont(15, "bold");
    ctx.fillStyle = HUD_COLORS.ink;
    trackedText(fmt(Math.floor(hudState.score)), 330, 25, 0.4, "right");
    ctx.restore();
    __hudTail();
  }
`;

const VARIANTS = [V1, V2, V3, V4, V5, V6, V7, V8, V9, V10];

module.exports = {
  count: VARIANTS.length,
  block: (n) => {
    const idx = Number(n) || 1;
    const table = VARIANTS.map((_, i) => `${i + 1}: __hud${i + 1}`).join(", ");
    return COMMON + VARIANTS.map((code, i) => code.replace(`__hud${i + 1}`, `__hud${i + 1}`)).join("") + `
  window.__hudVariant = ${idx};
  var __baseDrawHud = drawHud;
  drawHud = function () {
    if (window.__hudVariant === 11) return;
    var f = { ${table} }[window.__hudVariant];
    if (f) return f();
    return __baseDrawHud();
  };
`;
  },
};
