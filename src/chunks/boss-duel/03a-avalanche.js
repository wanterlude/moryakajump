  function duelArenaAvalanche(c) {
    const W = DUEL_W, H = DUEL_H;
    const rand = duelArenaRand(0xbadc0de);
    c.save();

    // 1. Ночная буря.
    const sky = c.createLinearGradient(0, 0, 0, H);
    sky.addColorStop(0, "#050f1d");
    sky.addColorStop(0.24, "#0a2237");
    sky.addColorStop(0.5, "#10354e");
    sky.addColorStop(0.74, "#174a63");
    sky.addColorStop(1, "#1f5d75");
    c.fillStyle = sky;
    c.fillRect(0, 0, W, H);

    // Луна ниже HUD, чтобы её было видно.
    const moonX = 72, moonY = 168;
    const halo = c.createRadialGradient(moonX, moonY, 4, moonX, moonY, 96);
    halo.addColorStop(0, "rgba(226,248,255,.85)");
    halo.addColorStop(0.16, "rgba(200,238,255,.4)");
    halo.addColorStop(0.55, "rgba(150,205,230,.12)");
    halo.addColorStop(1, "rgba(140,196,226,0)");
    c.fillStyle = halo;
    c.fillRect(moonX - 96, moonY - 96, 192, 192);
    c.fillStyle = "rgba(238,251,255,.9)";
    c.beginPath();
    c.arc(moonX, moonY, 11, 0, Math.PI * 2);
    c.fill();
    c.fillStyle = "rgba(158,198,220,.32)";
    c.beginPath();
    c.arc(moonX - 3.5, moonY - 2, 3, 0, Math.PI * 2);
    c.fill();
    c.beginPath();
    c.arc(moonX + 4, moonY + 4, 2, 0, Math.PI * 2);
    c.fill();

    // 2. Тучи.
    for (let i = 0; i < 12; i++) {
      const x = -24 + rand() * 448;
      const y = 28 + rand() * 170;
      const rx = 56 + rand() * 86;
      const ry = 14 + rand() * 26;
      const cg = c.createRadialGradient(x, y - ry * 0.3, 2, x, y, rx);
      cg.addColorStop(0, `rgba(94,136,162,${0.12 + rand() * 0.14})`);
      cg.addColorStop(0.55, "rgba(20,48,70,.34)");
      cg.addColorStop(1, "rgba(10,30,48,0)");
      c.fillStyle = cg;
      c.beginPath();
      c.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
      c.fill();
    }
    for (let i = 0; i < 8; i++) {
      const x = 10 + rand() * 380;
      const y = 52 + rand() * 150;
      const rx = 42 + rand() * 60;
      c.strokeStyle = `rgba(178,220,240,${0.08 + rand() * 0.1})`;
      c.lineWidth = 1.2 + rand() * 1.6;
      c.beginPath();
      c.ellipse(x, y, rx, 10 + rand() * 10, 0, Math.PI * 1.05, Math.PI * 1.9);
      c.stroke();
    }

    // 3. Горные хребты — мягкие планы с дымкой.
    const far = [
      [-10, 240, 124, 382],
      [78, 198, 114, 382],
      [168, 252, 114, 382],
      [256, 190, 122, 382],
      [348, 236, 112, 382]
    ];
    for (const p of far) duelArenaMountain(c, p[0], p[1], p[2], p[3], "#2c5b74", "#a9d1e2", "#234a61");
    const mid = [
      [0, 320, 126, 432],
      [112, 266, 118, 432],
      [224, 328, 122, 432],
      [338, 276, 118, 432]
    ];
    for (const p of mid) duelArenaMountain(c, p[0], p[1], p[2], p[3], "#1d465e", "#c3e4f0", "#173a50");
    const haze = c.createLinearGradient(0, 300, 0, 450);
    haze.addColorStop(0, "rgba(8,28,44,0)");
    haze.addColorStop(0.55, "rgba(8,28,44,.34)");
    haze.addColorStop(1, "rgba(8,28,44,.62)");
    c.fillStyle = haze;
    c.fillRect(0, 300, W, 150);
    const midBand = c.createLinearGradient(0, 380, 0, 536);
    midBand.addColorStop(0, "rgba(10,34,50,.3)");
    midBand.addColorStop(1, "rgba(8,26,40,.92)");
    c.fillStyle = midBand;
    c.fillRect(0, 380, W, 156);

    // 4. Лавинная волна: нависающий гребень и крупные клубы.
    c.save();
    c.translate(132, 0);
    const plumeEdge = () => {
      c.beginPath();
      c.moveTo(W + 8, 48);
      c.bezierCurveTo(352, 56, 318, 88, 326, 124);
      c.bezierCurveTo(300, 138, 286, 170, 296, 200);
      c.bezierCurveTo(266, 220, 254, 258, 268, 288);
      c.bezierCurveTo(240, 310, 236, 352, 254, 382);
      c.bezierCurveTo(240, 408, 238, 446, 258, 474);
      c.bezierCurveTo(270, 500, 266, 530, 284, 556);
      c.lineTo(300, 610);
    };
    const plumeFill = () => {
      plumeEdge();
      c.lineTo(W + 8, H + 8);
      c.closePath();
    };
    plumeFill();
    const plumeGrad = c.createLinearGradient(300, 40, 392, 560);
    plumeGrad.addColorStop(0, "#ffffff");
    plumeGrad.addColorStop(0.22, "#f2fbff");
    plumeGrad.addColorStop(0.48, "#d3ebf6");
    plumeGrad.addColorStop(0.74, "#a8c9da");
    plumeGrad.addColorStop(1, "#7da4ba");
    c.fillStyle = plumeGrad;
    c.fill();

    const edgePts = [
      [400, 48], [352, 56], [318, 88], [326, 124], [300, 138], [286, 170],
      [296, 200], [266, 220], [254, 258], [268, 288], [240, 310], [236, 352],
      [254, 382], [240, 408], [238, 446], [258, 474], [270, 500], [266, 530],
      [284, 556], [300, 610]
    ];
    c.save();
    plumeFill();
    c.clip();
    // Глубокие холодные впадины.
    for (let i = 0; i < 30; i++) {
      const p = edgePts[Math.floor((i / 30) * (edgePts.length - 1))];
      const x = Math.min(W - 4, p[0] + 26 + rand() * 58);
      const y = p[1] + (rand() - 0.5) * 40;
      const r = 28 + rand() * 44;
      const sg = c.createRadialGradient(x, y, 2, x, y, r);
      sg.addColorStop(0, "rgba(80,126,150,.58)");
      sg.addColorStop(0.55, "rgba(105,150,172,.26)");
      sg.addColorStop(1, "rgba(112,156,178,0)");
      c.fillStyle = sg;
      c.beginPath();
      c.arc(x, y, r, 0, Math.PI * 2);
      c.fill();
    }
    // Большая внутренняя тень — объём.
    const cav = c.createRadialGradient(348, 330, 8, 348, 330, 110);
    cav.addColorStop(0, "rgba(80,124,148,.44)");
    cav.addColorStop(1, "rgba(86,130,154,0)");
    c.fillStyle = cav;
    c.fillRect(230, 210, 180, 250);
    // Светлые клубы.
    for (let i = 0; i < 40; i++) {
      const p = edgePts[Math.floor((i / 40) * (edgePts.length - 1))];
      const x = Math.min(W + 4, p[0] + 4 + rand() * 52);
      const y = p[1] + (rand() - 0.5) * 34;
      const r = 22 + rand() * 40;
      const hg = c.createRadialGradient(x - r * 0.24, y - r * 0.28, 1, x, y, r);
      hg.addColorStop(0, "rgba(255,255,255,.95)");
      hg.addColorStop(0.45, "rgba(248,253,255,.5)");
      hg.addColorStop(1, "rgba(235,250,255,0)");
      c.fillStyle = hg;
      c.beginPath();
      c.arc(x, y, r, 0, Math.PI * 2);
      c.fill();
    }
    // Потоки движения внутри.
    for (let i = 0; i < 12; i++) {
      const y = 78 + i * 42 + rand() * 16;
      c.strokeStyle = i % 2 ? "rgba(255,255,255,.26)" : "rgba(88,134,158,.26)";
      c.lineWidth = 1 + rand() * 2.4;
      c.beginPath();
      c.moveTo(268 + rand() * 16, y);
      c.bezierCurveTo(306, y + 16, 334, y + 36, 378, y + 50);
      c.stroke();
    }
    c.restore();

    // Светлая кромка гребня.
    c.save();
    plumeEdge();
    c.strokeStyle = "rgba(255,255,255,.6)";
    c.lineWidth = 2.4;
    c.shadowColor = "rgba(222,246,255,.95)";
    c.shadowBlur = 14;
    c.stroke();
    c.restore();

    // Нависающие клубы пыли: ломают вертикальную стену, дают объём.
    const puff = (x, y, r, a) => {
      const pg = c.createRadialGradient(x - r * 0.22, y - r * 0.26, 1, x, y, r);
      pg.addColorStop(0, `rgba(255,255,255,${a})`);
      pg.addColorStop(0.5, `rgba(245,252,255,${a * 0.62})`);
      pg.addColorStop(1, "rgba(230,248,255,0)");
      c.fillStyle = pg;
      c.beginPath();
      c.arc(x, y, r, 0, Math.PI * 2);
      c.fill();
    };
    puff(318, 152, 52, 0.8);
    puff(296, 214, 44, 0.65);
    puff(286, 302, 48, 0.7);
    puff(272, 388, 42, 0.62);
    puff(276, 470, 46, 0.66);
    puff(290, 540, 50, 0.7);
    for (let i = 0; i < 60; i++) {
      const a = rand() * Math.PI * 2;
      const rr = 20 + rand() * 60;
      const px = 286 + Math.cos(a) * rr;
      const py = 300 + Math.sin(a) * rr * 2.2;
      if (px > 330) continue;
      c.globalAlpha = 0.12 + rand() * 0.4;
      c.fillStyle = "#ffffff";
      c.beginPath();
      c.arc(px, py, 0.6 + rand() * 1.5, 0, Math.PI * 2);
      c.fill();
    }
    c.globalAlpha = 1;

    // Снежная пыль, летящая влево от кромки.
    for (let i = 0; i < 170; i++) {
      const p = edgePts[Math.floor(rand() * edgePts.length)];
      const sx = p[0] - 46 + rand() * 74;
      const sy = p[1] + (rand() - 0.5) * 36;
      c.globalAlpha = 0.1 + rand() * 0.45;
      c.fillStyle = i % 4 ? "#ffffff" : "#d8f2ff";
      c.beginPath();
      c.arc(sx, sy, 0.6 + rand() * 1.7, 0, Math.PI * 2);
      c.fill();
    }
    c.globalAlpha = 1;
    for (let i = 0; i < 14; i++) {
      const p = edgePts[Math.floor(rand() * edgePts.length)];
      const y = p[1] + (rand() - 0.5) * 26;
      const x = p[0] - 10 - rand() * 40;
      c.strokeStyle = `rgba(230,248,255,${0.08 + rand() * 0.14})`;
      c.lineWidth = 1 + rand() * 1.8;
      c.beginPath();
      c.moveTo(x, y);
      c.lineTo(x - 14 - rand() * 22, y + 3 + rand() * 8);
      c.stroke();
    }


    c.restore();

    // 5. Берег, ели и снежная полка.
    const pine = (x, baseY, h, lean) => {
      c.save();
      c.translate(x, baseY);
      c.rotate(lean);
      c.fillStyle = "#071b28";
      c.fillRect(-1.5, -h * 0.92, 3, h * 0.92);
      for (let i = 0; i < 4; i++) {
        const y = -h * (0.16 + i * 0.19);
        const half = h * (0.34 - i * 0.06);
        c.beginPath();
        c.moveTo(0, y - h * 0.17);
        c.lineTo(-half, y + h * 0.05);
        c.lineTo(-half * 0.45, y + h * 0.02);
        c.lineTo(0, y + h * 0.07);
        c.lineTo(half * 0.45, y + h * 0.02);
        c.lineTo(half, y + h * 0.05);
        c.closePath();
        c.fill();
        c.strokeStyle = "rgba(196,230,242,.5)";
        c.lineWidth = 1.1;
        c.beginPath();
        c.moveTo(-half, y + h * 0.045);
        c.lineTo(-half * 0.35, y + h * 0.02);
        c.stroke();
      }
      c.strokeStyle = "rgba(210,240,250,.2)";
      c.lineWidth = 1;
      c.beginPath();
      c.moveTo(-1.5, -h * 0.9);
      c.lineTo(-1.5, -h * 0.1);
      c.stroke();
      c.restore();
    };
    pine(34, 536, 128, -0.04);
    pine(66, 548, 96, 0.05);
    pine(96, 540, 74, -0.02);

    const floorTop = (x) => 536 + Math.sin(x * 0.05) * 2.6 + Math.sin(x * 0.17 + 0.8) * 1.3;
    c.beginPath();
    c.moveTo(0, H);
    c.lineTo(0, floorTop(0));
    for (let x = 4; x <= W; x += 4) c.lineTo(x, floorTop(x));
    c.lineTo(W, H);
    c.closePath();
    const fg = c.createLinearGradient(0, 526, 0, H);
    fg.addColorStop(0, "#f8feff");
    fg.addColorStop(0.16, "#e2f4fb");
    fg.addColorStop(0.55, "#b6d6e4");
    fg.addColorStop(1, "#739cb0");
    c.fillStyle = fg;
    c.fill();

    c.save();
    c.lineCap = "round";
    c.strokeStyle = "rgba(255,255,255,.95)";
    c.lineWidth = 3.6;
    c.beginPath();
    c.moveTo(0, floorTop(0));
    for (let x = 4; x <= W; x += 4) c.lineTo(x, floorTop(x));
    c.stroke();
    c.strokeStyle = "rgba(44,100,128,.28)";
    c.lineWidth = 2;
    c.beginPath();
    c.moveTo(0, floorTop(0) + 4);
    for (let x = 4; x <= W; x += 4) c.lineTo(x, floorTop(x) + 4);
    c.stroke();
    c.restore();

    for (let i = 0; i < 9; i++) {
      const y = 548 + rand() * 34;
      const x = 20 + rand() * 340;
      const w = 34 + rand() * 90;
      c.strokeStyle = `rgba(226,246,253,${0.12 + rand() * 0.2})`;
      c.lineWidth = 1 + rand() * 2;
      c.beginPath();
      c.moveTo(x, y);
      c.lineTo(x + w, y + (rand() - 0.5) * 6);
      c.stroke();
    }
    for (let i = 0; i < 34; i++) {
      const x = 8 + rand() * 384;
      const y = floorTop(x) - 1 + rand() * 4;
      c.fillStyle = `rgba(255,255,255,${0.2 + rand() * 0.6})`;
      c.beginPath();
      c.ellipse(x, y, 2 + rand() * 8, 1 + rand() * 2.6, 0, 0, Math.PI * 2);
      c.fill();
    }

    // Снежный язык лавины на полке.
    c.beginPath();
    c.moveTo(258, 600);
    c.bezierCurveTo(268, 566, 304, 548, 340, 552);
    c.bezierCurveTo(370, 556, 388, 576, 400, 600);
    c.closePath();
    const spill = c.createLinearGradient(300, 548, 340, 600);
    spill.addColorStop(0, "#ffffff");
    spill.addColorStop(0.5, "#e6f7fd");
    spill.addColorStop(1, "#b9dbe9");
    c.fillStyle = spill;
    c.fill();
    c.strokeStyle = "rgba(255,255,255,.6)";
    c.lineWidth = 1.2;
    c.stroke();

    // Тёмные передние камни.
    const cornerRock = (side) => {
      const pts = side < 0
        ? [[0, 600], [0, 540], [10, 528], [24, 536], [36, 556], [56, 564], [64, 584], [72, 600]]
        : [[400, 600], [400, 536], [390, 524], [376, 534], [364, 554], [344, 562], [336, 582], [328, 600]];
      c.beginPath();
      c.moveTo(pts[0][0], pts[0][1]);
      for (let i = 1; i < pts.length; i++) c.lineTo(pts[i][0], pts[i][1]);
      c.closePath();
      const rg = c.createLinearGradient(side < 0 ? 0 : W, 520, side < 0 ? 74 : W - 74, 600);
      rg.addColorStop(0, "#081f2e");
      rg.addColorStop(0.55, "#123548");
      rg.addColorStop(1, "#1d4a60");
      c.fillStyle = rg;
      c.fill();
      c.strokeStyle = "rgba(220,245,255,.4)";
      c.lineWidth = 1.4;
      c.stroke();
      c.fillStyle = "rgba(240,253,255,.8)";
      c.beginPath();
      c.ellipse(side < 0 ? 16 : 384, 532, 10, 2.6, 0, 0, Math.PI * 2);
      c.fill();
    };
    cornerRock(-1);
    cornerRock(1);

    // 6. Позёмка, штрихи бури, лунный свет.
    for (let i = 0; i < 8; i++) {
      const y = 420 + rand() * 100;
      const x = 20 + rand() * 320;
      const w = 40 + rand() * 90;
      const wg = c.createLinearGradient(x - w, y, x + w, y);
      wg.addColorStop(0, "rgba(220,242,252,0)");
      wg.addColorStop(0.5, `rgba(220,242,252,${0.08 + rand() * 0.07})`);
      wg.addColorStop(1, "rgba(220,242,252,0)");
      c.fillStyle = wg;
      c.beginPath();
      c.ellipse(x, y, w, 2 + rand() * 3, 0, 0, Math.PI * 2);
      c.fill();
    }
    c.strokeStyle = "rgba(212,240,252,.1)";
    c.lineWidth = 1;
    for (let i = 0; i < 52; i++) {
      const sx = (i * 57.3 + 11) % W;
      const sy = (i * 97.1) % H;
      c.beginPath();
      c.moveTo(sx, sy);
      c.lineTo(sx - 12, sy + 24);
      c.stroke();
    }
    c.save();
    c.globalCompositeOperation = "lighter";
    const moonBeam = c.createLinearGradient(moonX, moonY, 170, 560);
    moonBeam.addColorStop(0, "rgba(200,238,255,.14)");
    moonBeam.addColorStop(0.55, "rgba(170,220,245,.04)");
    moonBeam.addColorStop(1, "rgba(150,205,235,0)");
    c.fillStyle = moonBeam;
    c.beginPath();
    c.moveTo(moonX - 26, moonY);
    c.lineTo(moonX + 26, moonY);
    c.lineTo(300, 600);
    c.lineTo(170, 600);
    c.closePath();
    c.fill();
    c.restore();

    // 7. Виньетка и зерно.
    c.save();
    const vig = c.createRadialGradient(200, 300, 120, 200, 300, 430);
    vig.addColorStop(0, "rgba(2,10,20,0)");
    vig.addColorStop(0.62, "rgba(2,10,20,.12)");
    vig.addColorStop(1, "rgba(2,10,20,.5)");
    c.fillStyle = vig;
    c.fillRect(0, 0, W, H);
    const bottom = c.createLinearGradient(0, 500, 0, H);
    bottom.addColorStop(0, "rgba(2,12,22,0)");
    bottom.addColorStop(1, "rgba(2,12,22,.3)");
    c.fillStyle = bottom;
    c.fillRect(0, 500, W, H - 500);
    c.restore();

    for (let i = 0; i < 1200; i++) {
      c.fillStyle = "rgba(255,255,255,.04)";
      c.fillRect((i * 89.31 + 7) % W, (i * 53.17 + 19) % H, 1, 1);
      c.fillStyle = "rgba(2,14,26,.06)";
      c.fillRect((i * 67.9 + 29) % W, (i * 101.3 + 3) % H, 1, 1);
    }

    c.restore();
  }
