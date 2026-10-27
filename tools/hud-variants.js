// Четыре версии HUD забега — только для предпросмотра через tools/shot.js.
//
//   node tools/shot.js --tabs=hud --hud=2 --label=v2
//
// Сетка, которую нельзя ломать: счёт занимает 10..142, ежедневка в компактном
// режиме стартует с x=150, пауза живёт в 348..388. Поэтому все версии держат
// счёт в левой колонке, а различаются материалом, составом и подачей ресурсов.

const COMMON = String.raw`
  function __hudTail() {
    var compact = dailyState.done ? false : runStartedAt > 0 && performance.now() - runStartedAt > 4000;
    drawDailyQuest(compact);
    drawHudButtons();
    drawActivePerks();
    drawEventTimer();
    drawTouchHints(performance.now());
    drawHudPops();
  }
  function __glassCard(x, y, w, h, r, alpha) {
    ctx.save();
    ctx.shadowColor = "rgba(12,40,64,.20)";
    ctx.shadowBlur = 11;
    ctx.shadowOffsetY = 3;
    roundedRect(x, y, w, h, r);
    ctx.fillStyle = "rgba(255,255,255," + (alpha == null ? 0.78 : alpha) + ")";
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
  function __darkCard(x, y, w, h, r) {
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
  function __chips(y) {
    var chipH = 20, chipX = 15;
    var perLife = coinsPerLife();
    var ready = jumpCharges > 0 && currentState === STATE.PLAYING;
    ctx.save();
    ctx.textBaseline = "middle";
    ctx.textAlign = "left";
    setFont(11, "bold");
    var livesText = String(Math.min(lives, 999));
    var livesW = Math.max(46, 30 + ctx.measureText(livesText).width + 12);
    drawHudChip(chipX, y, livesW, chipH, hudState.lifePulse > 0 ? "rgba(230,57,70,.75)" : null);
    drawHeart(chipX + 15, y + chipH / 2 - 1.3, 5.2 + hudState.lifePulse * 1.6, hudState.lifePulse > 0 ? "#ff4d5e" : HUD_COLORS.red);
    ctx.fillStyle = HUD_COLORS.ink;
    ctx.fillText(livesText, chipX + 26, y + chipH / 2 + 0.5);
    chipX += livesW + 6;
    var coinText = (runCoins % perLife) + "/" + perLife;
    var coinW = 30 + ctx.measureText(coinText).width + 12;
    drawHudChip(chipX, y, coinW, chipH, hudState.coinPulse > 0 ? "rgba(194,128,0,.7)" : null);
    drawCoinBadge(chipX + 16, y + chipH / 2, 5.9 + hudState.coinPulse * 1.5, (runCoins % perLife) / perLife);
    setFont(8.5, "bold");
    ctx.fillStyle = HUD_COLORS.gold;
    ctx.fillText(coinText, chipX + 28, y + chipH / 2 + 0.5);
    chipX += coinW + 6;
    drawHudChip(chipX, y, 46, chipH, ready ? "rgba(15,138,118,.5)" : null);
    ctx.strokeStyle = ready ? HUD_COLORS.green : "rgba(21,85,118,.30)";
    ctx.lineWidth = 1.8;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    for (var i = 0; i < 2; i++) {
      var yy = y + chipH / 2 + 3 - i * 4.6;
      ctx.beginPath();
      ctx.moveTo(chipX + 12, yy);
      ctx.lineTo(chipX + 16.5, yy - 3.4);
      ctx.lineTo(chipX + 21, yy);
      ctx.stroke();
    }
    ctx.lineCap = "butt";
    setFont(8.5, "bold");
    ctx.fillStyle = ready ? HUD_COLORS.green : "rgba(21,85,118,.34)";
    ctx.fillText("\xD72", chipX + 24, y + chipH / 2 + 0.5);
    ctx.restore();
  }
`;

// 1. Светлое стекло: счёт тёмными чернилами, как в меню и настройках.
const V1 = String.raw`
  function __hud1() {
    var score = Math.floor(hudState.score);
    var beating = Math.floor(player.score) > highScore && highScore > 0;
    __glassCard(10, 8, 132, 46, 13, 0.78);
    ctx.save();
    ctx.textBaseline = "middle";
    ctx.textAlign = "left";
    setFont(6.4, "bold");
    ctx.fillStyle = "rgba(21,85,118,.6)";
    trackedText("СЧЁТ", 22, 19, 1.8, "left");
    setFont(21, "bold");
    ctx.fillStyle = HUD_COLORS.ink;
    trackedText(fmt(score), 22, 33, 0.5, "left");
    setFont(6.2, "bold");
    ctx.fillStyle = beating ? HUD_COLORS.gold : "rgba(21,85,118,.55)";
    trackedText(beating ? "НОВЫЙ РЕКОРД" : "РЕКОРД " + fmt(highScore), 22, 45, 1, "left");
    ctx.restore();
    __chips(58);
    __hudTail();
  }
`;

// 2. Тёмная плита: счёт и ресурсы в одной карточке, без отдельной строки чипов.
const V2 = String.raw`
  function __hud2() {
    var score = Math.floor(hudState.score);
    var beating = Math.floor(player.score) > highScore && highScore > 0;
    __darkCard(10, 8, 132, 66, 15);
    ctx.save();
    ctx.textBaseline = "middle";
    ctx.textAlign = "left";
    setFont(6.2, "bold");
    ctx.fillStyle = "rgba(219,242,255,.68)";
    trackedText("СЧЁТ", 22, 17, 1.8, "left");
    setFont(20, "bold");
    ctx.fillStyle = "#ffffff";
    ctx.shadowColor = "rgba(2,14,26,.45)";
    ctx.shadowBlur = 2;
    ctx.shadowOffsetY = 1;
    trackedText(fmt(score), 22, 31, 0.5, "left");
    ctx.shadowColor = "transparent";
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;
    setFont(6, "bold");
    ctx.fillStyle = beating ? "#ffd666" : "rgba(219,242,255,.72)";
    trackedText(beating ? "НОВЫЙ РЕКОРД" : "РЕКОРД " + fmt(highScore), 22, 43, 0.7, "left");
    var perLife = coinsPerLife();
    var ready = jumpCharges > 0 && currentState === STATE.PLAYING;
    var ry = 56;
    drawHeart(24, ry, 4.4, HUD_COLORS.red);
    setFont(9.5, "bold");
    ctx.fillStyle = "#ffffff";
    ctx.fillText(String(lives), 33, ry + 0.5);
    drawCoinBadge(54, ry, 4.6, (runCoins % perLife) / perLife);
    setFont(8, "bold");
    ctx.fillStyle = "#ffd98a";
    ctx.fillText((runCoins % perLife) + "/" + perLife, 62, ry + 0.5);
    ctx.strokeStyle = ready ? "#7de9cf" : "rgba(219,242,255,.35)";
    ctx.lineWidth = 1.6;
    ctx.lineCap = "round";
    for (var i = 0; i < 2; i++) {
      var yy = ry + 2.5 - i * 4;
      ctx.beginPath();
      ctx.moveTo(108, yy);
      ctx.lineTo(112, yy - 2.9);
      ctx.lineTo(116, yy);
      ctx.stroke();
    }
    ctx.lineCap = "butt";
    setFont(8, "bold");
    ctx.fillStyle = ready ? "#7de9cf" : "rgba(219,242,255,.4)";
    ctx.fillText("\xD72", 119, ry + 0.5);
    ctx.restore();
    __hudTail();
  }
`;

// 3. Минимал: у счёта нет плашки, только текст и тень.
const V3 = String.raw`
  function __hud3() {
    var score = Math.floor(hudState.score);
    var beating = Math.floor(player.score) > highScore && highScore > 0;
    ctx.save();
    ctx.textBaseline = "middle";
    ctx.textAlign = "left";
    ctx.shadowColor = "rgba(255,255,255,.95)";
    ctx.shadowBlur = 8;
    setFont(6.4, "bold");
    ctx.fillStyle = "rgba(21,85,118,.7)";
    trackedText("СЧЁТ", 16, 16, 2, "left");
    setFont(26, "bold");
    ctx.fillStyle = "#ffffff";
    ctx.shadowColor = "rgba(2,14,26,.55)";
    ctx.shadowBlur = 4;
    ctx.shadowOffsetY = 1.2;
    trackedText(fmt(score), 16, 35, 0.6, "left");
    ctx.shadowColor = "rgba(255,255,255,.9)";
    ctx.shadowBlur = 6;
    ctx.shadowOffsetY = 0;
    setFont(6.2, "bold");
    ctx.fillStyle = beating ? "#a66000" : "rgba(21,85,118,.66)";
    trackedText(beating ? "НОВЫЙ РЕКОРД" : "РЕКОРД " + fmt(highScore), 16, 53, 1.1, "left");
    ctx.restore();
    __chips(64);
    __hudTail();
  }
`;

// 4. Светлая карточка с полосой прогресса до рекорда.
const V4 = String.raw`
  function __hud4() {
    var score = Math.floor(hudState.score);
    var beating = Math.floor(player.score) > highScore && highScore > 0;
    __glassCard(10, 8, 132, 50, 13, 0.78);
    ctx.save();
    ctx.textBaseline = "middle";
    ctx.textAlign = "left";
    setFont(6.2, "bold");
    ctx.fillStyle = "rgba(21,85,118,.6)";
    trackedText(beating ? "НОВЫЙ РЕКОРД" : "СЧЁТ", 22, 18, 1.8, "left");
    setFont(20, "bold");
    ctx.fillStyle = beating ? HUD_COLORS.gold : HUD_COLORS.ink;
    trackedText(fmt(score), 22, 32, 0.5, "left");
    var barX = 22, barW = 96, barY = 44;
    roundedRect(barX, barY, barW, 4, 2);
    ctx.fillStyle = "rgba(21,85,118,.14)";
    ctx.fill();
    var frac = highScore > 0 ? Math.max(0, Math.min(1, score / highScore)) : 1;
    if (frac > 0.01) {
      roundedRect(barX, barY, barW * frac, 4, 2);
      ctx.fillStyle = beating ? HUD_COLORS.gold : HUD_COLORS.green;
      ctx.fill();
    }
    setFont(5.6, "bold");
    ctx.fillStyle = "rgba(21,85,118,.5)";
    trackedText("РЕКОРД", 22, 54, 0.9, "left");
    ctx.textAlign = "right";
    ctx.fillText(fmt(highScore), 22 + barW, 54);
    ctx.restore();
    __chips(64);
    __hudTail();
  }
`;

module.exports = { block: (n) => COMMON + V1 + V2 + V3 + V4 + `
  window.__hudVariant = ${Number(n) || 1};
  var __baseDrawHud = drawHud;
  drawHud = function () {
    var f = { 1: __hud1, 2: __hud2, 3: __hud3, 4: __hud4 }[window.__hudVariant];
    if (f) return f();
    return __baseDrawHud();
  };
` };
