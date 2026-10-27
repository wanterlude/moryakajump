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
  function __resRowW(s, gap) {
    var perLife = coinsPerLife();
    var txt = (runCoins % perLife) + "/" + perLife;
    setFont(s * 1.02, "bold");
    var w1 = s * 1.08 + ctx.measureText(String(lives)).width;
    setFont(s * 0.86, "bold");
    var w2 = s * 1.08 + ctx.measureText(txt).width;
    setFont(s * 0.9, "bold");
    var w3 = s * 1.02 + ctx.measureText("\xD72").width;
    return w1 + gap + w2 + gap + w3;
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


// === Вторая десятка: другие принципы раскладки ===

// 11. Круглая медаль: счёт в стеклянном круге.
const V11 = String.raw`
  function __hud11() {
    var cx = 48, cy = 40, r = 28;
    ctx.save();
    ctx.shadowColor = "rgba(12,40,64,.24)";
    ctx.shadowBlur = 12;
    ctx.shadowOffsetY = 4;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(255,255,255,.84)";
    ctx.fill();
    ctx.shadowColor = "transparent";
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;
    ctx.strokeStyle = "rgba(255,255,255,.95)";
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.restore();
    __label("СЧЁТ", cx, cy - 11, 5.6, "rgba(21,85,118,.6)", "center", 1.6);
    __label(fmt(Math.floor(hudState.score)), cx, cy + 6, 17, HUD_COLORS.ink, "center");
    __resRow(90, 34, 13, 14);
    ctx.save();
    ctx.textBaseline = "middle";
    ctx.textAlign = "left";
    __label("РЕКОРД " + fmt(highScore), 92, 50, 5.8, "rgba(21,85,118,.6)", "left", 0.9);
    ctx.restore();
    __hudTail();
  }
`;

// 12. Центр, две строки: счёт и ресурсы отдельными центрированными капсулами.
const V12 = String.raw`
  function __hud12() {
    __gcard(120, 8, 160, 28, 14, 0.82);
    __label("СЧЁТ", 136, 22, 5.8, "rgba(21,85,118,.6)", "left", 1.6);
    __label(fmt(Math.floor(hudState.score)), 266, 22, 16, HUD_COLORS.ink, "right");
    __gcard(140, 40, 120, 24, 12, 0.78);
    var w = __resRowW(12, 12);
    __resRow(200 - w / 2, 52, 12, 12);
    __label("РЕКОРД " + fmt(highScore), 200, 72, 5.8, "rgba(21,85,118,.55)", "center", 1);
    __hudTail();
  }
`;

// 13. Вертикальная панель: счёт и ресурсы столбиком вдоль левого края.
const V13 = String.raw`
  function __hud13() {
    __gcard(10, 8, 62, 118, 16, 0.80);
    __label("СЧЁТ", 41, 22, 5.6, "rgba(21,85,118,.6)", "center", 1.6);
    __label(fmt(Math.floor(hudState.score)), 41, 38, 15, HUD_COLORS.ink, "center");
    ctx.save();
    ctx.strokeStyle = "rgba(21,85,118,.14)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(20, 50);
    ctx.lineTo(62, 50);
    ctx.stroke();
    ctx.restore();
    __res("heart", 22, 64, 11);
    __res("coin", 22, 86, 11);
    __res("jump", 22, 106, 11);
    __hudTail();
  }
`;

// 14. Две колонки по краям: ресурсы слева, счёт справа.
const V14 = String.raw`
  function __hud14() {
    __res("heart", 16, 24, 13);
    __res("coin", 16, 44, 13);
    __res("jump", 16, 64, 13);
    ctx.save();
    ctx.textBaseline = "middle";
    ctx.textAlign = "right";
    __label("СЧЁТ", 338, 18, 5.8, "rgba(21,85,118,.6)", "right", 1.8);
    setFont(24, "bold");
    ctx.fillStyle = "#ffffff";
    ctx.shadowColor = "rgba(2,14,26,.55)";
    ctx.shadowBlur = 4;
    trackedText(fmt(Math.floor(hudState.score)), 338, 38, 0.5, "right");
    ctx.shadowColor = "transparent";
    ctx.shadowBlur = 0;
    __label("РЕКОРД " + fmt(highScore), 338, 54, 5.8, "rgba(21,85,118,.6)", "right", 0.9);
    ctx.restore();
    __hudTail();
  }
`;

// 15. Нижний статус-бар на всю ширину.
const V15 = String.raw`
  function __hud15() {
    __gcard(8, 566, 384, 26, 13, 0.80);
    var cy = 579;
    var x = 20;
    x += __res("heart", x, cy, 12) + 14;
    x += __res("coin", x, cy, 12) + 14;
    x += __res("jump", x, cy, 12);
    __label("СЧЁТ", 382, 573, 5.4, "rgba(21,85,118,.55)", "right", 1.6);
    __label(fmt(Math.floor(hudState.score)), 382, 584, 13, HUD_COLORS.ink, "right");
    __hudTail();
  }
`;

// 16. Счёт в правом нижнем углу, ресурсы сверху слева.
const V16 = String.raw`
  function __hud16() {
    __resRow(16, 26, 13, 14);
    ctx.save();
    ctx.textBaseline = "middle";
    ctx.textAlign = "right";
    setFont(34, "bold");
    ctx.fillStyle = "#ffffff";
    ctx.shadowColor = "rgba(2,14,26,.5)";
    ctx.shadowBlur = 5;
    trackedText(fmt(Math.floor(hudState.score)), 384, 540, 0.6, "right");
    ctx.shadowColor = "rgba(255,255,255,.9)";
    ctx.shadowBlur = 6;
    __label("РЕКОРД " + fmt(highScore), 384, 562, 6, "rgba(21,85,118,.6)", "right", 1);
    ctx.restore();
    __hudTail();
  }
`;

// 17. Компактный чип: всё в одном маленьком блоке.
const V17 = String.raw`
  function __hud17() {
    __gcard(12, 10, 196, 26, 13, 0.80);
    var cy = 23, x = 24;
    x += __res("heart", x, cy, 12) + 10;
    x += __res("coin", x, cy, 12) + 10;
    __res("jump", x, cy, 12);
    __label(fmt(Math.floor(hudState.score)), 198, 23, 12, HUD_COLORS.ink, "right");
    __label("РЕКОРД " + fmt(highScore), 16, 46, 5.6, "rgba(21,85,118,.55)", "left", 0.9);
    __hudTail();
  }
`;

// 18. Ледяная глыба: неровная плита с бликом.
const V18 = String.raw`
  function __hud18() {
    var x = 10, y = 8, w = 168, h = 54;
    ctx.save();
    ctx.shadowColor = "rgba(20,70,110,.28)";
    ctx.shadowBlur = 14;
    ctx.shadowOffsetY = 5;
    ctx.beginPath();
    ctx.moveTo(x + 16, y + 4);
    ctx.lineTo(x + w - 22, y);
    ctx.lineTo(x + w - 4, y + 16);
    ctx.lineTo(x + w - 8, y + h - 10);
    ctx.lineTo(x + w - 30, y + h);
    ctx.lineTo(x + 12, y + h - 3);
    ctx.lineTo(x, y + 22);
    ctx.closePath();
    var g = ctx.createLinearGradient(0, y, 0, y + h);
    g.addColorStop(0, "rgba(226,246,255,.92)");
    g.addColorStop(1, "rgba(186,222,240,.86)");
    ctx.fillStyle = g;
    ctx.fill();
    ctx.shadowColor = "transparent";
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;
    ctx.strokeStyle = "rgba(255,255,255,.9)";
    ctx.lineWidth = 1.2;
    ctx.stroke();
    ctx.restore();
    ctx.save();
    ctx.globalAlpha = 0.55;
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.moveTo(x + 18, y + 8);
    ctx.lineTo(x + w - 26, y + 5);
    ctx.lineTo(x + w - 20, y + 13);
    ctx.lineTo(x + 16, y + 16);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
    __label("СЧЁТ", x + 18, y + 22, 5.6, "rgba(21,85,118,.62)", "left", 1.8);
    __label(fmt(Math.floor(hudState.score)), x + 18, y + 36, 17, "#0f3d5c", "left");
    __resRow(x + 96, y + 34, 11, 10);
    __label("РЕКОРД " + fmt(highScore), x + 18, y + 48, 5.4, "rgba(21,85,118,.55)", "left", 0.8);
    __hudTail();
  }
`;

// 19. Текстовый минимал: одна строка по центру, без плашек.
const V19 = String.raw`
  function __hud19() {
    var s = 12, sep = 7;
    var perLife = coinsPerLife();
    var coinTxt = (runCoins % perLife) + "/" + perLife;
    setFont(s * 1.02, "bold");
    var wHeart = s * 1.08 + ctx.measureText(String(lives)).width;
    setFont(s * 0.86, "bold");
    var wCoin = s * 1.08 + ctx.measureText(coinTxt).width;
    setFont(s * 0.9, "bold");
    var wJump = s * 1.02 + ctx.measureText("\xD72").width;
    var scored = fmt(Math.floor(hudState.score));
    setFont(13, "bold");
    var wScore = ctx.measureText(scored).width + 6;
    var total = wHeart + wCoin + wJump + wScore + sep * 3;
    var x = 200 - total / 2, cy = 22;
    ctx.save();
    ctx.textBaseline = "middle";
    ctx.textAlign = "left";
    x += __res("heart", x, cy, s) + sep;
    __label("·", x - 4, cy, 9, "rgba(21,85,118,.28)", "left");
    x += __res("coin", x, cy, s) + sep;
    __label("·", x - 4, cy, 9, "rgba(21,85,118,.28)", "left");
    x += __res("jump", x, cy, s) + sep;
    __label("·", x - 4, cy, 9, "rgba(21,85,118,.28)", "left");
    __label(scored, x, cy, 13, HUD_COLORS.ink, "left");
    __label("РЕКОРД " + fmt(highScore), 200, 40, 5.6, "rgba(21,85,118,.5)", "center", 1);
    ctx.restore();
    __hudTail();
  }
`;

// 20. Спидометр: дуга прогресса до рекорда.
const V20 = String.raw`
  function __hud20() {
    var cx = 56, cy = 44, r = 34;
    var scoreNow = Math.floor(hudState.score);
    var step = 5000;
    var target = Math.max(step, Math.ceil((scoreNow + 1) / step) * step);
    var frac = Math.max(0, Math.min(1, scoreNow / target));
    ctx.save();
    ctx.lineCap = "round";
    ctx.strokeStyle = "rgba(21,85,118,.14)";
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.arc(cx, cy, r, Math.PI * 0.75, Math.PI * 2.25);
    ctx.stroke();
    ctx.strokeStyle = frac >= 1 ? HUD_COLORS.gold : HUD_COLORS.green;
    ctx.beginPath();
    ctx.arc(cx, cy, r, Math.PI * 0.75, Math.PI * 0.75 + Math.PI * 1.5 * frac);
    ctx.stroke();
    ctx.restore();
    __label("СЧЁТ", cx, cy - 11, 5.4, "rgba(21,85,118,.6)", "center", 1.6);
    __label(fmt(scoreNow), cx, cy + 2, 14, HUD_COLORS.ink, "center");
    __label("ДО " + fmt(target), cx, cy + 14, 4.8, "rgba(21,85,118,.5)", "center", 0.6);
    __resRow(104, 30, 13, 14);
    __label("РЕКОРД " + fmt(highScore), 106, 48, 5.8, "rgba(21,85,118,.6)", "left", 0.9);
    __hudTail();
  }
`;
const VARIANTS = [V1, V2, V3, V4, V5, V6, V7, V8, V9, V10, V11, V12, V13, V14, V15, V16, V17, V18, V19, V20];

module.exports = {
  count: VARIANTS.length,
  block: (n) => {
    const idx = Number(n) || 1;
    const table = VARIANTS.map((_, i) => `${i + 1}: __hud${i + 1}`).join(", ");
    return COMMON + VARIANTS.map((code, i) => code.replace(`__hud${i + 1}`, `__hud${i + 1}`)).join("") + `
  window.__hudVariant = ${idx};
  var __baseDrawHud = drawHud;
  drawHud = function () {
    if (window.__hudVariant === 99) return;
    var f = { ${table} }[window.__hudVariant];
    if (f) return f();
    return __baseDrawHud();
  };
`;
  },
};
