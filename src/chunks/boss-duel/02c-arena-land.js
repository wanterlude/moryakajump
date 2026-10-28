  function duelArenaCanyon(c) {
    const W = DUEL_W, H = DUEL_H;
    const rand = duelArenaRand(0x51ca11);
    c.save();

    // Закатный каньон: тёплый свет на снегу, синие тени.
    const sky = c.createLinearGradient(0, 0, 0, H);
    sky.addColorStop(0, "#5f9fcf");
    sky.addColorStop(0.3, "#8fc0dd");
    sky.addColorStop(0.52, "#cfdfe9");
    sky.addColorStop(0.72, "#f6dcc2");
    sky.addColorStop(0.9, "#ffe8cf");
    sky.addColorStop(1, "#fff4e4");
    c.fillStyle = sky;
    c.fillRect(0, 0, W, H);
    // Прохладная полоса за боссом: белая шерсть не сливается с небом.
    const coolBand = c.createLinearGradient(0, 76, 0, 300);
    coolBand.addColorStop(0, "rgba(38,110,150,0)");
    coolBand.addColorStop(0.45, "rgba(38,110,150,.18)");
    coolBand.addColorStop(1, "rgba(38,110,150,0)");
    c.fillStyle = coolBand;
    c.fillRect(0, 76, W, 224);

    const sun = c.createRadialGradient(270, 200, 4, 270, 200, 168);
    sun.addColorStop(0, "rgba(255,252,236,1)");
    sun.addColorStop(0.12, "rgba(255,238,198,.9)");
    sun.addColorStop(0.38, "rgba(255,202,142,.3)");
    sun.addColorStop(1, "rgba(255,186,120,0)");
    c.fillStyle = sun;
    c.fillRect(40, 20, 360, 380);
    c.fillStyle = "rgba(255,250,236,.95)";
    c.beginPath();
    c.arc(270, 200, 20, 0, Math.PI * 2);
    c.fill();

    // Дальние и средние горы — как в основном фоне.
    const far = [
      [-24, 210, 96, 358],
      [44, 168, 88, 358],
      [112, 216, 84, 358],
      [180, 152, 98, 358],
      [250, 198, 90, 358],
      [320, 164, 94, 358],
      [392, 212, 92, 358]
    ];
    for (const p of far) duelArenaMountain(c, p[0], p[1], p[2], p[3], "#789ab4", "#e2f4fc", "#6b8ca6");
    const mid = [
      [-10, 292, 104, 432],
      [66, 240, 96, 432],
      [146, 288, 98, 432],
      [228, 232, 102, 432],
      [310, 276, 96, 432],
      [390, 244, 98, 432]
    ];
    for (const p of mid) duelArenaMountain(c, p[0], p[1], p[2], p[3], "#92b3c9", "#f4fcff", "#7ea0b8");
    // Ближний хребет за водопадом: средний тон, чтобы босс не терялся.
    const nearFar = [
      [120, 296, 72, 400],
      [204, 258, 82, 400],
      [290, 292, 70, 400]
    ];
    for (const p of nearFar) duelArenaMountain(c, p[0], p[1], p[2], p[3], "#6487a4", "#dceef8", "#557a97");
    const haze = c.createLinearGradient(0, 300, 0, 440);
    haze.addColorStop(0, "rgba(240,250,255,0)");
    haze.addColorStop(0.55, "rgba(240,250,255,.28)");
    haze.addColorStop(1, "rgba(245,252,255,.6)");
    c.fillStyle = haze;
    c.fillRect(0, 300, W, 140);
    const warm = c.createLinearGradient(0, 300, 0, 450);
    warm.addColorStop(0, "rgba(255,206,150,0)");
    warm.addColorStop(0.5, "rgba(255,206,150,.04)");
    warm.addColorStop(1, "rgba(255,224,184,.08)");
    c.fillStyle = warm;
    c.fillRect(0, 300, W, 150);
    for (let i = 0; i < 5; i++) {
      const baseY = 430 + i * 34;
      const hill = c.createLinearGradient(0, baseY - 26, 0, baseY + 22);
      hill.addColorStop(0, "#f7fdff");
      hill.addColorStop(1, "#cfe6f2");
      c.fillStyle = hill;
      c.beginPath();
      c.ellipse(200 + (i % 2 ? 40 : -40), baseY, 260, 26, 0, 0, Math.PI * 2);
      c.fill();
    }
    for (let i = 0; i < 6; i++) {
      const y = 372 + i * 26;
      c.strokeStyle = `rgba(84,152,180,${0.12 + (i % 3) * 0.05})`;
      c.lineWidth = 1.2 + (i % 2) * 0.7;
      c.beginPath();
      c.moveTo(160, y);
      c.bezierCurveTo(200, y + 7, 248, y - 5, 292, y + 3);
      c.stroke();
    }

    // Замёрзший водопад в глубине — цветовой акцент арены.
    const wfPath = () => {
      c.beginPath();
      c.moveTo(236, 252);
      c.bezierCurveTo(262, 286, 244, 330, 264, 366);
      c.bezierCurveTo(280, 396, 260, 442, 272, 486);
      c.lineTo(248, 492);
      c.bezierCurveTo(240, 448, 258, 404, 242, 372);
      c.bezierCurveTo(226, 336, 246, 292, 222, 260);
      c.closePath();
    };
    c.save();
    const wfGlow = c.createRadialGradient(252, 370, 6, 252, 380, 140);
    wfGlow.addColorStop(0, "rgba(150,226,246,.28)");
    wfGlow.addColorStop(1, "rgba(150,226,246,0)");
    c.fillStyle = wfGlow;
    c.fillRect(120, 240, 280, 300);
    wfPath();
    const wfGrad = c.createLinearGradient(222, 250, 274, 492);
    wfGrad.addColorStop(0, "#eefdff");
    wfGrad.addColorStop(0.3, "#c3ecf8");
    wfGrad.addColorStop(0.68, "#8ed0e6");
    wfGrad.addColorStop(1, "#5fb0ce");
    c.fillStyle = wfGrad;
    c.fill();
    c.save();
    wfPath();
    c.clip();
    for (let i = 0; i < 8; i++) {
      const x = 228 + i * 5.4;
      c.strokeStyle = i % 2 ? "rgba(255,255,255,.5)" : "rgba(66,150,180,.26)";
      c.lineWidth = 0.8 + rand() * 1.6;
      c.beginPath();
      c.moveTo(x, 258);
      c.bezierCurveTo(x + 12, 310, x - 6, 370, x + 12, 430);
      c.bezierCurveTo(x + 18, 460, x + 4, 478, x + 2, 492);
      c.stroke();
    }
    c.restore();
    // Снежный карниз и сосульки на гребне водопада.
    c.beginPath();
    c.moveTo(212, 262);
    c.lineTo(222, 250);
    c.lineTo(231, 256);
    c.lineTo(240, 248);
    c.lineTo(250, 257);
    c.lineTo(244, 263);
    c.lineTo(232, 260);
    c.lineTo(220, 264);
    c.closePath();
    c.fillStyle = "#ffffff";
    c.fill();
    c.strokeStyle = "rgba(178,228,242,.6)";
    c.lineWidth = 1;
    c.stroke();
    for (let i = 0; i < 6; i++) {
      const x = 222 + i * 4.6;
      const len = 7 + ((i * 9) % 15);
      c.fillStyle = "rgba(226,250,255,.9)";
      c.beginPath();
      c.moveTo(x - 2, 256);
      c.lineTo(x + 2, 256);
      c.lineTo(x + 0.3, 256 + len);
      c.closePath();
      c.fill();
    }
    // Мист и бирюзовая полынья у подножия.
    c.beginPath();
    c.ellipse(260, 536, 66, 16, 0, 0, Math.PI * 2);
    const pool = c.createLinearGradient(196, 526, 324, 552);
    pool.addColorStop(0, "#bfeef8");
    pool.addColorStop(0.45, "#7fd0e5");
    pool.addColorStop(1, "#4ca6c9");
    c.fillStyle = pool;
    c.fill();
    c.strokeStyle = "rgba(255,255,255,.8)";
    c.lineWidth = 1.6;
    c.stroke();
    for (let i = 0; i < 3; i++) {
      c.strokeStyle = "rgba(255,255,255,.45)";
      c.lineWidth = 1;
      c.beginPath();
      c.ellipse(258, 536, 22 + i * 15, 4 + i * 3.4, 0, 0, Math.PI * 2);
      c.stroke();
    }
    const wfMist = c.createRadialGradient(262, 516, 4, 262, 516, 84);
    wfMist.addColorStop(0, "rgba(238,253,255,.4)");
    wfMist.addColorStop(1, "rgba(238,253,255,0)");
    c.fillStyle = wfMist;
    c.beginPath();
    c.ellipse(262, 516, 84, 24, 0, 0, Math.PI * 2);
    c.fill();
    c.restore();

    // Минимальная рамка: только мягкая тень и сосульки по краям.
    c.save();
    const edgeL = c.createLinearGradient(0, 0, 54, 0);
    edgeL.addColorStop(0, "rgba(32,96,130,.28)");
    edgeL.addColorStop(1, "rgba(32,96,130,0)");
    c.fillStyle = edgeL;
    c.fillRect(0, 0, 54, H);
    const edgeR = c.createLinearGradient(W, 0, W - 54, 0);
    edgeR.addColorStop(0, "rgba(32,96,130,.28)");
    edgeR.addColorStop(1, "rgba(32,96,130,0)");
    c.fillStyle = edgeR;
    c.fillRect(W - 54, 0, 54, H);
    c.fillStyle = "rgba(232,250,255,.38)";
    c.beginPath();
    c.moveTo(0, 0);
    c.lineTo(7, 0);
    c.lineTo(3, H);
    c.lineTo(0, H);
    c.closePath();
    c.fill();
    c.beginPath();
    c.moveTo(W, 0);
    c.lineTo(W - 7, 0);
    c.lineTo(W - 3, H);
    c.lineTo(W, H);
    c.closePath();
    c.fill();
    const topIcicle = (x, len, w, a) => {
      c.fillStyle = `rgba(214,246,255,${a})`;
      c.beginPath();
      c.moveTo(x - w, 0);
      c.lineTo(x + w, 0);
      c.lineTo(x + 0.4, len);
      c.closePath();
      c.fill();
      c.strokeStyle = "rgba(255,255,255,.5)";
      c.lineWidth = 0.7;
      c.stroke();
    };
    topIcicle(16, 26, 3, 0.7);
    topIcicle(32, 15, 2.4, 0.55);
    topIcicle(54, 9, 2, 0.4);
    topIcicle(346, 10, 2, 0.4);
    topIcicle(366, 19, 2.6, 0.55);
    topIcicle(386, 28, 3, 0.7);
    c.restore();

    // Тёмные ели у подножия — ценностный якорь и родная палитра игры.
    const canyonPine = (x, baseY, h, lean) => {
      c.save();
      c.translate(x, baseY);
      c.rotate(lean);
      c.fillStyle = "#173f53";
      c.fillRect(-1.4, -h * 0.92, 2.8, h * 0.92);
      for (let i = 0; i < 4; i++) {
        const y = -h * (0.18 + i * 0.19);
        const half = h * (0.32 - i * 0.055);
        c.beginPath();
        c.moveTo(0, y - h * 0.17);
        c.lineTo(-half, y + h * 0.05);
        c.lineTo(-half * 0.45, y + h * 0.02);
        c.lineTo(0, y + h * 0.07);
        c.lineTo(half * 0.45, y + h * 0.02);
        c.lineTo(half, y + h * 0.05);
        c.closePath();
        c.fill();
        c.strokeStyle = "rgba(220,244,252,.6)";
        c.lineWidth = 1.1;
        c.beginPath();
        c.moveTo(-half, y + h * 0.04);
        c.lineTo(-half * 0.35, y + h * 0.015);
        c.stroke();
        c.beginPath();
        c.moveTo(half, y + h * 0.04);
        c.lineTo(half * 0.35, y + h * 0.015);
        c.stroke();
      }
      c.strokeStyle = "rgba(120,180,200,.26)";
      c.lineWidth = 1;
      c.beginPath();
      c.moveTo(-1.4, -h * 0.9);
      c.lineTo(-1.4, -h * 0.1);
      c.stroke();
      c.restore();
    };
    const treeRow = [
      [20, 112, 0.02], [54, 84, -0.03], [88, 126, 0.01], [122, 72, 0.04],
      [156, 102, -0.02], [308, 96, 0.03], [342, 118, -0.02], [376, 86, 0.01]
    ];
    for (const t of treeRow) canyonPine(t[0], 542, t[1], t[2]);

    // Снежная полка, на которой стоит Моряка.
    const floorTop = (x) => 535 + Math.sin(x * 0.047) * 2.4 + Math.sin(x * 0.15 + 1.2) * 1.2;
    c.beginPath();
    c.moveTo(0, H);
    c.lineTo(0, floorTop(0));
    for (let x = 4; x <= W; x += 4) c.lineTo(x, floorTop(x));
    c.lineTo(W, H);
    c.closePath();
    const fg = c.createLinearGradient(0, 526, 0, H);
    fg.addColorStop(0, "#fffaf0");
    fg.addColorStop(0.2, "#f2e3cf");
    fg.addColorStop(0.58, "#a8c5d6");
    fg.addColorStop(1, "#5f8ca6");
    c.fillStyle = fg;
    c.fill();

    c.save();
    c.lineCap = "round";
    c.strokeStyle = "rgba(255,248,232,.98)";
    c.lineWidth = 3.6;
    c.beginPath();
    c.moveTo(0, floorTop(0));
    for (let x = 4; x <= W; x += 4) c.lineTo(x, floorTop(x));
    c.stroke();
    c.strokeStyle = "rgba(102,186,210,.34)";
    c.lineWidth = 1.8;
    c.beginPath();
    c.moveTo(0, floorTop(0) + 4);
    for (let x = 4; x <= W; x += 4) c.lineTo(x, floorTop(x) + 4);
    c.stroke();
    c.strokeStyle = "rgba(55,120,146,.22)";
    c.lineWidth = 2;
    c.beginPath();
    c.moveTo(0, floorTop(0) + 9);
    for (let x = 4; x <= W; x += 4) c.lineTo(x, floorTop(x) + 9);
    c.stroke();
    c.restore();

    for (let i = 0; i < 10; i++) {
      const x0 = 20 + rand() * 360;
      const y0 = 552 + rand() * 16;
      c.strokeStyle = "rgba(64,126,150,.22)";
      c.lineWidth = 1 + rand() * 1.2;
      c.beginPath();
      c.moveTo(x0, y0);
      let x = x0, y = y0;
      for (let k = 0; k < 3; k++) {
        x += (rand() - 0.5) * 20;
        y += 9 + rand() * 13;
        c.lineTo(x, y);
      }
      c.stroke();
    }
    for (let i = 0; i < 26; i++) {
      const x = 10 + rand() * 380;
      const y = floorTop(x) - 1 + rand() * 4;
      c.fillStyle = `rgba(255,255,255,${0.3 + rand() * 0.5})`;
      c.beginPath();
      c.ellipse(x, y, 2 + rand() * 8, 1 + rand() * 2.4, 0, 0, Math.PI * 2);
      c.fill();
    }

    // Снежные валуны в переднем плане.
    const snowRock = (x, y, rx, ry, flip) => {
      c.save();
      c.beginPath();
      c.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
      const rg = c.createLinearGradient(x - rx, y - ry, x + rx, y + ry);
      rg.addColorStop(0, "#f4fdff");
      rg.addColorStop(0.5, "#cbe8f3");
      rg.addColorStop(1, "#77aec6");
      c.fillStyle = rg;
      c.fill();
      c.strokeStyle = "rgba(255,255,255,.7)";
      c.lineWidth = 1.2;
      c.stroke();
      c.beginPath();
      c.ellipse(x - flip * rx * 0.2, y - ry * 0.45, rx * 0.72, ry * 0.5, 0, Math.PI, Math.PI * 2);
      c.fillStyle = "rgba(255,255,255,.9)";
      c.fill();
      c.restore();
    };
    snowRock(22, 564, 30, 20, 1);
    snowRock(374, 570, 34, 22, -1);
    snowRock(62, 588, 20, 13, 1);

    // Холодная дымка и мягкая виньетка.
    for (let i = 0; i < 6; i++) {
      const mx = 30 + rand() * 340;
      const my = 340 + rand() * 190;
      const mr = 60 + rand() * 90;
      const mg = c.createRadialGradient(mx, my, 4, mx, my, mr);
      mg.addColorStop(0, "rgba(240,253,255,.22)");
      mg.addColorStop(1, "rgba(240,253,255,0)");
      c.fillStyle = mg;
      c.fillRect(mx - mr, my - mr, mr * 2, mr * 2);
    }

    c.save();
    const edge = c.createRadialGradient(200, 300, 150, 200, 300, 400);
    edge.addColorStop(0, "rgba(28,86,120,0)");
    edge.addColorStop(0.7, "rgba(28,86,120,.05)");
    edge.addColorStop(1, "rgba(28,86,120,.2)");
    c.fillStyle = edge;
    c.fillRect(0, 0, W, H);
    const bottom = c.createLinearGradient(0, 500, 0, H);
    bottom.addColorStop(0, "rgba(30,90,120,0)");
    bottom.addColorStop(1, "rgba(30,90,120,.14)");
    c.fillStyle = bottom;
    c.fillRect(0, 500, W, H - 500);
    c.restore();

    for (let i = 0; i < 1000; i++) {
      c.fillStyle = "rgba(255,255,255,.05)";
      c.fillRect((i * 97.13 + 11) % W, (i * 57.71 + 5) % H, 1, 1);
      c.fillStyle = "rgba(40,96,124,.035)";
      c.fillRect((i * 61.7 + 23) % W, (i * 89.3 + 17) % H, 1, 1);
    }

    c.restore();
  }