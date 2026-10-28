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

  var duelBackdropCache = {};
  function duelBackdropFor(arena) {
    const key = arena || "shore";
    if (duelBackdropCache[key]) return duelBackdropCache[key];
    if (!duelBackdropCanvas) duelBackdropCanvas = duelBuildBackdrop();
    const cv = document.createElement("canvas");
    cv.width = DUEL_W;
    cv.height = DUEL_H;
    const c = cv.getContext("2d");
    c.drawImage(duelBackdropCanvas, 0, 0);
    if (key === "canyon") {
      duelArenaCanyon(c);
    } else if (key === "storm") {
      c.save();
      c.fillStyle = "rgba(8,22,48,0.46)";
      c.fillRect(0, 0, DUEL_W, DUEL_H);
      const stormSky = c.createLinearGradient(0, 0, 0, 340);
      stormSky.addColorStop(0, "rgba(6,16,38,0.92)");
      stormSky.addColorStop(0.55, "rgba(12,34,64,0.55)");
      stormSky.addColorStop(1, "rgba(12,34,64,0)");
      c.fillStyle = stormSky;
      c.fillRect(0, 0, DUEL_W, 340);
      // Клубящиеся тучи
      for (let i = 0; i < 5; i++) {
        const cx2 = 30 + i * 92;
        const cy2 = 52 + (i % 2) * 26;
        const cg = c.createRadialGradient(cx2, cy2, 4, cx2, cy2, 74);
        cg.addColorStop(0, "rgba(40,70,110,0.55)");
        cg.addColorStop(1, "rgba(16,36,64,0)");
        c.fillStyle = cg;
        c.beginPath();
        c.ellipse(cx2, cy2, 88, 42, 0, 0, Math.PI * 2);
        c.fill();
      }
      // Молнии
      const bolt = (x0, y0, len, seed) => {
        c.save();
        c.strokeStyle = "rgba(198,240,255,0.85)";
        c.lineWidth = 1.6;
        c.shadowColor = "rgba(150,220,255,0.9)";
        c.shadowBlur = 10;
        c.beginPath();
        let x = x0;
        let y = y0;
        c.moveTo(x, y);
        for (let i = 1; i <= 7; i++) {
          x += Math.sin(seed + i * 2.1) * 9;
          y += len / 7;
          c.lineTo(x, y);
        }
        c.stroke();
        c.restore();
      };
      bolt(46, 40, 190, 1.3);
      bolt(352, 24, 140, 4.7);
      // Наклонные полосы снега
      c.save();
      c.strokeStyle = "rgba(220,244,255,0.16)";
      c.lineWidth = 1;
      for (let i = 0; i < 60; i++) {
        const sx = (i * 67.3 + 11) % DUEL_W;
        const sy = (i * 113.7) % DUEL_H;
        c.beginPath();
        c.moveTo(sx, sy);
        c.lineTo(sx - 7, sy + 18);
        c.stroke();
      }
      c.restore();
      c.restore();
    } else if (key === "avalanche") {
      duelArenaAvalanche(c);
    } else if (key === "abyss") {
      c.save();
      // Глубина: от светлой воды вверху к чёрной бездне внизу.
      const depth = c.createLinearGradient(0, 0, 0, DUEL_H);
      depth.addColorStop(0, "rgba(10,54,78,0.9)");
      depth.addColorStop(0.25, "rgba(8,40,64,0.92)");
      depth.addColorStop(0.6, "rgba(5,24,44,0.96)");
      depth.addColorStop(1, "rgba(2,10,22,0.98)");
      c.fillStyle = depth;
      c.fillRect(0, 0, DUEL_W, DUEL_H);
      // Лучи света сверху.
      c.save();
      c.globalCompositeOperation = "lighter";
      for (let i = 0; i < 5; i++) {
        const x = 40 + i * 78;
        const g = c.createLinearGradient(x, 0, x + 30, 400);
        g.addColorStop(0, "rgba(150,230,255,0.16)");
        g.addColorStop(1, "rgba(150,230,255,0)");
        c.fillStyle = g;
        c.beginPath();
        c.moveTo(x - 16, 0);
        c.lineTo(x + 16, 0);
        c.lineTo(x + 52, 400);
        c.lineTo(x + 12, 400);
        c.closePath();
        c.fill();
      }
      c.restore();
      // Дальнее свечение глубин.
      const glow = c.createRadialGradient(200, 420, 20, 200, 420, 220);
      glow.addColorStop(0, "rgba(60,220,230,0.12)");
      glow.addColorStop(1, "rgba(60,220,230,0)");
      c.fillStyle = glow;
      c.beginPath();
      c.ellipse(200, 420, 220, 150, 0, 0, Math.PI * 2);
      c.fill();
      // Силуэты скал и водорослей.
      c.fillStyle = "rgba(3,16,30,0.8)";
      for (const p of [[0, 520, 60, 120], [400, 540, 70, 140], [60, 300, 14, 120], [340, 260, 12, 140]]) {
        c.beginPath();
        c.ellipse(p[0], p[1], p[2], p[3], 0, 0, Math.PI * 2);
        c.fill();
      }
      // Пузыри.
      c.fillStyle = "rgba(200,245,255,0.35)";
      for (let i = 0; i < 40; i++) {
        const x = (i * 71.3 + 9) % DUEL_W;
        const y = (i * 127.9) % DUEL_H;
        c.beginPath();
        c.arc(x, y, 1 + (i % 4) * 0.7, 0, Math.PI * 2);
        c.fill();
      }
      c.restore();
    }
    duelBackdropCache[key] = cv;
    return cv;
  }
  function duelDrawBackdrop(c) {
    c.drawImage(duelBackdropFor(duelState.arena), 0, 0);
    const t = duelState.frame;

    // Каньон и лавина — дневные арены: аврора им не идёт.
    if (duelState.arena !== "canyon" && duelState.arena !== "avalanche") {
      duelAuroraCloud(c, t, 0, "#6ff0c4", "#9de8ff", 1.25);
      duelAuroraCloud(c, t, 42, "#9d9bff", "#b6eaff", 0.85);
    }

    const tint = DUEL_PHASE_TINTS[duelState.level] || DUEL_PHASE_TINTS[0];
    if (tint !== DUEL_PHASE_TINTS[0]) {
      c.fillStyle = tint;
      c.fillRect(0, 0, DUEL_W, DUEL_H);
    }

    // Мягкий свет за боссом (на светлых аренах он только «съедает» силуэт).
    if (duelState.arena !== "canyon" && duelState.arena !== "avalanche") {
      c.save();
      c.globalCompositeOperation = "lighter";
      c.globalAlpha = 0.07 + 0.025 * Math.sin(t / 80);
      const spot = c.createRadialGradient(DUEL_W / 2, 200, 30, DUEL_W / 2, 200, 170);
      spot.addColorStop(0, "rgba(198,240,255,0.55)");
      spot.addColorStop(1, "rgba(198,240,255,0)");
      c.fillStyle = spot;
      c.fillRect(0, 30, DUEL_W, 360);
      c.restore();
    }

    // Живая атмосфера арен: свет в каньоне и позёмка у лавины.
    if (duelState.arena === "canyon") {
      c.save();
      c.globalCompositeOperation = "lighter";
      const pulse = 0.035 + 0.02 * Math.sin(t / 120) + 0.01 * Math.sin(t / 31);
      const shaft = c.createLinearGradient(300, 70, 170, 560);
      shaft.addColorStop(0, `rgba(255,246,214,${pulse * 2.2})`);
      shaft.addColorStop(0.55, `rgba(255,242,210,${pulse})`);
      shaft.addColorStop(1, "rgba(240,252,255,0)");
      c.fillStyle = shaft;
      c.beginPath();
      c.moveTo(278, 58);
      c.lineTo(318, 58);
      c.lineTo(258, 560);
      c.lineTo(104, 560);
      c.closePath();
      c.fill();
      for (let i = 0; i < 12; i++) {
        const p = (i * 0.081 + t * 0.00003) % 1;
        const px = 292 - p * 150 + Math.sin(i * 2.3 + t / 140) * 18;
        const py = 70 + p * 460;
        c.globalAlpha = 0.08 + 0.08 * Math.sin(t / 55 + i * 1.7);
        c.fillStyle = "#fff6dc";
        c.beginPath();
        c.arc(px, py, 0.7 + (i % 3) * 0.5, 0, Math.PI * 2);
        c.fill();
      }
      c.restore();
    } else if (duelState.arena === "avalanche") {
      c.save();
      for (let i = 0; i < 6; i++) {
        const px = 288 + Math.sin(t / 150 + i * 1.7) * 16 + (i % 2) * 20;
        const py = 140 + i * 72 + Math.cos(t / 180 + i) * 12;
        const pr = 26 + (i % 3) * 12;
        const pg = c.createRadialGradient(px, py, 2, px, py, pr);
        pg.addColorStop(0, "rgba(235,250,255,.12)");
        pg.addColorStop(1, "rgba(235,250,255,0)");
        c.fillStyle = pg;
        c.beginPath();
        c.arc(px, py, pr, 0, Math.PI * 2);
        c.fill();
      }
      c.strokeStyle = "rgba(214,240,252,.16)";
      c.lineWidth = 1;
      for (let i = 0; i < 26; i++) {
        const sx = (i * 43.7 + t * (3.2 + (i % 3))) % (DUEL_W + 60) - 30;
        const sy = (i * 71.3) % DUEL_H;
        c.beginPath();
        c.moveTo(sx, sy);
        c.lineTo(sx - 16, sy + 30);
        c.stroke();
      }
      c.restore();
    }

    // Снегопад
    c.save();
    for (const f of DUEL_SNOWFLAKES) {
      const y = (f.y + t * f.speed) % (DUEL_H + 30) - 15;
      const x = (f.x + Math.sin(t / 90 + f.phase) * (5 + f.depth * 7) + t * f.drift * 0.4) % (DUEL_W + 24) - 12;
      if (f.depth === 2) {
        c.globalAlpha = 0.1 + 0.07 * Math.sin(f.phase + t / 50);
        duelDrawGlow(c, x, y, f.r * 4.4, "#ffffff");
      } else {
        c.globalAlpha = (f.depth === 0 ? 0.22 : 0.34) + 0.14 * Math.sin(f.phase + t / 60);
        c.fillStyle = "#ffffff";
        c.beginPath();
        c.arc(x, y, f.r, 0, Math.PI * 2);
        c.fill();
      }
    }
    c.restore();

    // Позёмка у полки
    c.save();
    c.globalCompositeOperation = "lighter";
    for (let i = 0; i < 2; i++) {
      const my = DUEL_SHELF_TOP - 4 + i * 16;
      const mx = DUEL_W / 2 + Math.sin(t / 150 + i * 2) * 46;
      const mg = c.createRadialGradient(mx, my, 6, mx, my, 156);
      mg.addColorStop(0, `rgba(226,250,255,${0.05 - i * 0.015})`);
      mg.addColorStop(1, "rgba(226,250,255,0)");
      c.fillStyle = mg;
      c.beginPath();
      c.ellipse(mx, my, 176, 12 + i * 3, 0, 0, Math.PI * 2);
      c.fill();
    }
    c.restore();

    // Блики на льду
    c.save();
    for (const s of DUEL_ARENA_SPARKLES) {
      const k = Math.abs(Math.sin(s.phase + t / (54 / s.speed)));
      if (k < 0.62) continue;
      const a = (k - 0.62) / 0.38;
      c.globalCompositeOperation = "lighter";
      c.globalAlpha = a * 0.6;
      duelDrawGlow(c, s.x, s.y, s.r * 4.6, "#ffffff");
      c.globalAlpha = a * 0.85;
      c.fillStyle = "#ffffff";
      c.beginPath();
      c.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      c.fill();
    }
    c.restore();
  }
  function duelDraw(c) {
    if (!duelState.active) return;
    duelDrawBackdrop(c);
    duelDrawBossBody(c);
    // Телеграфы атак рисуются ПОВЕРХ тела босса: кольца, спирали и подписи
    // атак не должны прятаться за корпусом (их центр рождается в боссе).
    duelDrawTelegraph(c);
    duelDrawBullets(c);
    duelDrawPlayer(c);
    duelDrawParticles(c);
    duelDrawHud(c);
    duelDrawBanner(c);
  }
  var DUEL_ATTACK_LABELS = {
    aim: "ПРИЦЕЛ", ring: "КРУГ", sweep: "ВОЛНА", shards: "ОСКОЛКИ",
    lob: "СНЕЖКИ", spiral: "СПИРАЛЬ", cross: "КРЕСТ", hail: "ГРАД",
    geyser: "ГЕЙЗЕР", seeker: "ПОГОНЯ",
    tentacle: "ТЕНТАКЛИ", icewall: "ЛЕДЯНАЯ СТЕНА", bolt: "МОЛНИЯ",
    rockslide: "КАМНЕПАД", tide: "ПРИЛИВ"
  };
  function duelDashLine(c, x1, y1, x2, y2, color, width, dash, offset) {
    c.save();
    c.strokeStyle = color;
    c.lineWidth = width;
    c.setLineDash(dash || [5, 7]);
    c.lineDashOffset = offset || 0;
    c.beginPath();
    c.moveTo(x1, y1);
    c.lineTo(x2, y2);
    c.stroke();
    c.restore();
  }
  function duelWarnRing(c, x, y, r, color, alpha) {
    c.save();
    c.globalAlpha = alpha;
    c.strokeStyle = color;
    c.lineWidth = 2;
    c.beginPath();
    c.arc(x, y, r, 0, Math.PI * 2);
    c.stroke();
    c.fillStyle = duelHexToRgba(color, 0.12);
    c.fill();
    c.restore();
  }
  function duelDrawTelegraph(c) {
    const t = duelState.telegraph;
    if (!t) return;
    const frame = duelState.frame;
    const pulse = 0.5 + 0.5 * Math.sin(frame / 3.4);
    const progress = duelClamp(1 - t.left / Math.max(1, t.total), 0, 1);
    const attackKind = t.attack || t.kind;
    const accent = DUEL_ATTACK_COLORS[attackKind] || "#8ad8ff";
    const bx = duelState.bx;
    const by = duelState.by;
    const py = DUEL_PLAYER_Y;
    const cols = t.cols || [bx, bx - 60, bx + 60];
    const aimX = t.aimX ?? duelState.px + DUEL_PLAYER_HALF;

    c.save();

    // Общая аура заряда у босса
    c.save();
    c.globalCompositeOperation = "lighter";
    c.globalAlpha = 0.14 + pulse * 0.14;
    duelDrawGlow(c, bx, by, 76 + progress * 18, accent);
    c.restore();

    c.save();
    c.translate(bx, by);
    c.rotate(frame / 90);
    c.strokeStyle = duelHexToRgba(accent, 0.32 + 0.26 * pulse);
    c.lineWidth = 1.4;
    c.setLineDash([5, 9]);
    c.beginPath();
    c.arc(0, 0, 58 + progress * 12, 0, Math.PI * 2);
    c.stroke();
    c.restore();

    // Линия времени атаки под кольцом
    c.save();
    c.strokeStyle = "rgba(234,250,255,0.16)";
    c.lineWidth = 2;
    c.beginPath();
    c.arc(bx, by, 65, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * progress);
    c.stroke();
    c.restore();

    if (t.kind === "aim") {
      duelDashLine(c, bx, by + 10, aimX, py, duelHexToRgba(accent, 0.75), 1.6, [7, 7], -frame * 1.2);
      c.save();
      c.globalAlpha = 0.45 + pulse * 0.35;
      c.strokeStyle = accent;
      c.lineWidth = 1.6;
      c.beginPath();
      c.ellipse(aimX, py + 6, 3.4 + progress * 17, (3.4 + progress * 17) * 0.42, 0, 0, Math.PI * 2);
      c.stroke();
      c.beginPath();
      c.ellipse(aimX, py + 6, 5.4 + progress * 21, (5.4 + progress * 21) * 0.42, 0, 0, Math.PI * 2);
      c.stroke();
      c.restore();
    } else if (t.kind === "ring") {
      c.save();
      c.globalAlpha = 0.34 + pulse * 0.3;
      c.strokeStyle = accent;
      c.lineWidth = 2.2;
      c.setLineDash([9, 8]);
      c.lineDashOffset = -frame * 0.8;
      c.beginPath();
      c.arc(bx, by, 52 + progress * 30, 0, Math.PI * 2);
      c.stroke();
      c.restore();
      const gap = t.gap ?? 0;
      c.save();
      c.globalAlpha = 0.8;
      c.strokeStyle = "#eafaff";
      c.lineWidth = 3;
      c.beginPath();
      c.arc(bx, by, 52 + progress * 30, gap - 0.34, gap + 0.34);
      c.stroke();
      c.restore();
    } else if (t.kind === "sweep") {
      const y = by + DUEL_BOSS_HALF + 16;
      c.save();
      c.globalAlpha = 0.4 + pulse * 0.35;
      const lane = c.createLinearGradient(0, y - 10, 0, y + 10);
      lane.addColorStop(0, duelHexToRgba(accent, 0));
      lane.addColorStop(0.5, duelHexToRgba(accent, 0.25));
      lane.addColorStop(1, duelHexToRgba(accent, 0));
      c.fillStyle = lane;
      c.fillRect(0, y - 10, DUEL_W, 20);
      c.fillStyle = "rgba(8,30,48,0.55)";
      c.fillRect(t.gapX - 36, y - 11, 72, 22);
      c.strokeStyle = "rgba(234,250,255,0.85)";
      c.lineWidth = 1.4;
      c.strokeRect(t.gapX - 36, y - 11, 72, 22);
      c.restore();
      for (let x = 18; x < DUEL_W; x += 46) {
        if (Math.abs(x - t.gapX) < 44) continue;
        c.save();
        c.globalAlpha = 0.35 + pulse * 0.3;
        c.strokeStyle = accent;
        c.lineWidth = 2;
        c.beginPath();
        c.moveTo(x, y - 8);
        c.lineTo(x + 5, y);
        c.lineTo(x, y + 8);
        c.stroke();
        c.restore();
      }
    } else if (t.kind === "shards") {
      for (let i = 0; i < cols.length; i++) {
        const x = duelClamp(cols[i], 22, DUEL_W - 22);
        duelDashLine(c, x, 72, x, 540, duelHexToRgba(accent, 0.34 + 0.2 * pulse), 1.2, [4, 10], -frame * 1.6);
        const drop = ((frame * 5 + i * 90) % 460);
        c.save();
        c.globalAlpha = 0.45;
        c.fillStyle = accent;
        c.beginPath();
        c.moveTo(x, 80 + drop);
        c.lineTo(x + 3.4, 92 + drop);
        c.lineTo(x - 3.4, 92 + drop);
        c.closePath();
        c.fill();
        c.restore();
        duelWarnRing(c, x, py + 8, 10 + progress * 10, accent, 0.28 + pulse * 0.24);
      }
    } else if (t.kind === "lob") {
      for (let k = 0; k < 2; k++) {
        const tx = duelClamp(aimX + (k === 0 ? -34 : 34), 30, DUEL_W - 30);
        c.save();
        c.strokeStyle = duelHexToRgba(accent, 0.42 + 0.2 * pulse);
        c.lineWidth = 1.3;
        c.setLineDash([3, 7]);
        c.lineDashOffset = -frame * 1.2 - k * 12;
        c.beginPath();
        for (let i = 0; i <= 20; i++) {
          const q = i / 20;
          const x = bx + (tx - bx) * q;
          const y = by + 30 + (py - by - 30) * q - Math.sin(Math.PI * q) * 110;
          if (i === 0) c.moveTo(x, y);
          else c.lineTo(x, y);
        }
        c.stroke();
        c.restore();
        duelWarnRing(c, tx, py + 8, 12 + progress * 12, accent, 0.3 + pulse * 0.22);
      }
    } else if (t.kind === "spiral") {
      c.save();
      c.translate(bx, by);
      c.strokeStyle = duelHexToRgba(accent, 0.4 + 0.24 * pulse);
      c.lineWidth = 1.4;
      c.setLineDash([6, 8]);
      for (let arm = 0; arm < 4; arm++) {
        const off = arm * Math.PI / 2 + frame / 44;
        c.beginPath();
        for (let i = 0; i <= 22; i++) {
          const q = i / 22;
          const r = 18 + q * (78 + progress * 24);
          const a = off + q * 2.1;
          const x = Math.cos(a) * r;
          const y = Math.sin(a) * r;
          if (i === 0) c.moveTo(x, y);
          else c.lineTo(x, y);
        }
        c.stroke();
      }
      c.restore();
    } else if (t.kind === "cross") {
      const angles = [0.72, 2.42, 3.86, 5.56, 1.57, 4.71];
      for (const a of angles) {
        const len = 190 + progress * 40;
        const ex = bx + Math.cos(a) * len;
        const ey = by + Math.sin(a) * len;
        duelDashLine(c, bx + Math.cos(a) * 44, by + Math.sin(a) * 40, ex, ey, duelHexToRgba(accent, 0.45), 1.4, [5, 8], -frame);
        c.save();
        c.globalAlpha = 0.7;
        c.fillStyle = accent;
        c.translate(ex, ey);
        c.rotate(a);
        c.beginPath();
        c.moveTo(7, 0);
        c.lineTo(-3, 4);
        c.lineTo(-3, -4);
        c.closePath();
        c.fill();
        c.restore();
      }
    } else if (t.kind === "hail") {
      for (let i = 0, x = 16; x < DUEL_W; x += 23, i++) {
        if (Math.abs(x - t.gapX) < 42) continue;
        c.save();
        c.globalAlpha = 0.2 + 0.16 * Math.sin(frame / 7 + i);
        c.strokeStyle = accent;
        c.lineWidth = 1;
        c.setLineDash([3, 9]);
        c.beginPath();
        c.moveTo(x, 66);
        c.lineTo(x, py);
        c.stroke();
        c.restore();
      }
      c.save();
      c.fillStyle = "rgba(8,30,48,0.42)";
      c.fillRect(t.gapX - 42, py - 26, 84, 40);
      c.strokeStyle = "rgba(234,250,255,0.75)";
      c.lineWidth = 1.3;
      c.setLineDash([4, 4]);
      c.strokeRect(t.gapX - 42, py - 26, 84, 40);
      c.restore();
    } else if (t.kind === "geyser") {
      for (let i = 0; i < 3; i++) {
        const x = duelClamp(cols[i] ?? (34 + i * 120), 30, DUEL_W - 30);
        c.save();
        c.globalAlpha = 0.28 + pulse * 0.3;
        c.strokeStyle = accent;
        c.lineWidth = 2;
        c.beginPath();
        c.ellipse(x, py + 20, 16 + progress * 6, 5 + progress * 2, 0, 0, Math.PI * 2);
        c.stroke();
        c.beginPath();
        c.ellipse(x, py + 20, 26 + progress * 10, 8 + progress * 3, 0, 0, Math.PI * 2);
        c.stroke();
        c.setLineDash([3, 8]);
        c.lineWidth = 1.2;
        c.beginPath();
        c.moveTo(x, py + 12);
        c.lineTo(x, 330);
        c.stroke();
        c.restore();
      }
    } else if (t.kind === "seeker") {
      for (let k = 0; k < 2; k++) {
        const ox = bx + (k === 0 ? -30 : 30);
        const oy = by + 20;
        c.save();
        c.strokeStyle = duelHexToRgba(accent, 0.36 + 0.24 * pulse);
        c.lineWidth = 1.2;
        c.setLineDash([4, 6]);
        c.lineDashOffset = -frame * 1.4;
        c.beginPath();
        for (let i = 0; i <= 24; i++) {
          const q = i / 24;
          const x = ox + (aimX - ox) * q + Math.sin(q * 7 + frame / 16 + k) * 12 * Math.sin(q * Math.PI);
          const y = oy + (py - oy) * q;
          if (i === 0) c.moveTo(x, y);
          else c.lineTo(x, y);
        }
        c.stroke();
        c.restore();
        c.save();
        c.globalAlpha = 0.55 + pulse * 0.35;
        c.translate(ox, oy + Math.sin(frame / 18 + k * 2) * 6);
        c.rotate(frame / 26 + k);
        c.fillStyle = accent;
        c.beginPath();
        c.moveTo(0, -8);
        c.lineTo(6, 0);
        c.lineTo(0, 8);
        c.lineTo(-6, 0);
        c.closePath();
        c.fill();
        c.strokeStyle = "#ffffff";
        c.lineWidth = 0.9;
        c.stroke();
        c.restore();
      }
    }

    // Подпись атаки под боссом
    const label = DUEL_ATTACK_LABELS[attackKind] || "";
    if (label) {
      c.save();
      const pillW = Math.max(56, label.length * 6.4 + 20);
      duelRoundRect(c, DUEL_W / 2 - pillW / 2, by + 83, pillW, 18, 9);
      c.fillStyle = "rgba(8,30,48,.62)";
      c.fill();
      c.strokeStyle = "rgba(255,255,255,.18)";
      c.lineWidth = 1;
      c.stroke();
      c.globalAlpha = 0.72 + pulse * 0.28;
      duelText(c, label, DUEL_W / 2, by + 92, 9.5, accent, "center", 2.6);
      c.restore();
    }

    c.restore();
  }
  function duelLerpColor(a, b, t) {
    const pa = parseInt(a.slice(1), 16);
    const pb = parseInt(b.slice(1), 16);
    const ar = pa >> 16 & 255, ag = pa >> 8 & 255, ab = pa & 255;
    const br = pb >> 16 & 255, bg = pb >> 8 & 255, bb = pb & 255;
    const r = Math.round(ar + (br - ar) * t);
    const g = Math.round(ag + (bg - ag) * t);
    const bl = Math.round(ab + (bb - ab) * t);
    return `rgb(${r},${g},${bl})`;
  }
  function duelTelegraphTension() {
    const t = duelState.telegraph;
    if (!t) return 0;
    return duelClamp(1 - t.left / Math.max(1, t.total), 0, 1);
  }
  function duelTentacle(c, x0, y0, spread, len, width, sway, topColor, bottomColor, suckers) {
    const N = 12;
    const pts = [];
    for (let i = 0; i <= N; i++) {
      const t = i / N;
      const curl = t > 0.7 ? Math.pow((t - 0.7) / 0.3, 2) * len * 0.3 : 0;
      const x = x0 + spread * (t * t * 30 + t * 12) + sway * t * t;
      const y = y0 + len * t - curl;
      pts.push({ x, y, w: Math.max(2.3, width * (1 - 0.78 * t)), t });
    }
    c.lineCap = "round";
    c.lineJoin = "round";
    // Тёмная подложка: держит силуэт щупальца на светлом фоне
    c.strokeStyle = "rgba(18,70,96,0.3)";
    for (let i = 0; i < N; i++) {
      const p = pts[i];
      const q = pts[i + 1];
      c.lineWidth = (p.w + q.w) * 0.5 + 2.4;
      c.beginPath();
      c.moveTo(p.x, p.y);
      c.lineTo(q.x, q.y);
      c.stroke();
    }
    for (let i = 0; i < N; i++) {
      const p = pts[i];
      const q = pts[i + 1];
      c.strokeStyle = duelLerpColor(topColor, bottomColor, i / N);
      c.lineWidth = (p.w + q.w) * 0.5;
      c.beginPath();
      c.moveTo(p.x, p.y);
      c.lineTo(q.x, q.y);
      c.stroke();
    }
    c.strokeStyle = "rgba(255,255,255,0.38)";
    c.lineWidth = 1.35;
    c.beginPath();
    for (let i = 0; i <= N; i++) {
      const p = pts[i];
      const x = p.x - p.w * 0.28;
      if (i === 0) c.moveTo(x, p.y);
      else c.lineTo(x, p.y);
    }
    c.stroke();
    c.strokeStyle = "rgba(16,72,100,0.16)";
    c.lineWidth = 1;
    c.beginPath();
    for (let i = 0; i <= N; i++) {
      const p = pts[i];
      const x = p.x + p.w * 0.3;
      if (i === 0) c.moveTo(x, p.y);
      else c.lineTo(x, p.y);
    }
    c.stroke();
    if (suckers) {
      c.fillStyle = "rgba(226,250,255,0.55)";
      for (const i of [4, 6, 8]) {
        const p = pts[i];
        c.beginPath();
        c.ellipse(p.x + p.w * 0.08, p.y, p.w * 0.22, p.w * 0.15, 0, 0, Math.PI * 2);
        c.fill();
      }
      c.fillStyle = "rgba(24,96,130,0.22)";
      for (const i of [4, 6, 8]) {
        const p = pts[i];
        c.beginPath();
        c.ellipse(p.x + p.w * 0.08, p.y, p.w * 0.1, p.w * 0.07, 0, 0, Math.PI * 2);
        c.fill();
      }
    }
  }
  function duelBossBodyPath(c) {
    c.beginPath();
    c.moveTo(-49, 6);
    c.bezierCurveTo(-49, -26, -30, -47, 0, -47);
    c.bezierCurveTo(30, -47, 49, -26, 49, 6);
    c.bezierCurveTo(49, 26, 38, 38, 22, 41);
    c.bezierCurveTo(12, 43, 6, 38, 0, 39);
    c.bezierCurveTo(-7, 40, -14, 44, -24, 40);
    c.bezierCurveTo(-40, 34, -49, 24, -49, 6);
    c.closePath();
  }
  function duelBossCracks(c, level, t) {
    const lines = [
      [
        [43, -18], [35, -10], [40, -1], [33, 8], [37, 18], [30, 29]
      ],
      [
        [-42, -26], [-34, -17], [-39, -7], [-32, 3], [-36, 14], [-29, 25]
      ],
      [
        [0, -45], [-6, -37], [1, -31], [-4, -25]
      ]
    ];
    const count = [0, 1, 2][level] || 0;
    c.save();
    c.lineCap = "round";
    c.lineJoin = "round";
    for (let i = 0; i < count; i++) {
      const path = lines[i];
      c.strokeStyle = "rgba(12,52,74,0.5)";
      c.lineWidth = 1.8;
      c.beginPath();
      c.moveTo(path[0][0], path[0][1]);
      for (let k = 1; k < path.length; k++) c.lineTo(path[k][0], path[k][1]);
      c.stroke();
      c.strokeStyle = "rgba(230,252,255,0.65)";
      c.lineWidth = 0.9;
      c.beginPath();
      c.moveTo(path[0][0] + 1, path[0][1] - 1);
      for (let k = 1; k < path.length; k++) c.lineTo(path[k][0] + 1, path[k][1] - 1);
      c.stroke();
    }
    c.restore();
  }
  function duelBossEye(c, x, y, look, blink, angry, accent) {
    c.save();
    c.translate(x, y);
    c.fillStyle = "rgba(18,66,92,0.18)";
    c.beginPath();
    c.ellipse(0, 1, 12.6, 13.4, 0, 0, Math.PI * 2);
    c.fill();
    if (blink) {
      c.strokeStyle = "rgba(18,66,92,0.75)";
      c.lineWidth = 2.4;
      c.beginPath();
      c.moveTo(-9, -1);
      c.quadraticCurveTo(0, 3.2, 9, -1);
      c.stroke();
      c.restore();
      return;
    }
    c.save();
    c.beginPath();
    c.ellipse(0, 0, 10.6, 11.8, 0, 0, Math.PI * 2);
    c.clip();
    const sclera = c.createLinearGradient(0, -12, 0, 12);
    sclera.addColorStop(0, "#ffffff");
    sclera.addColorStop(1, "#cfeeff");
    c.fillStyle = sclera;
    c.fillRect(-12, -13, 24, 26);
    const iris = c.createLinearGradient(0, -6, 0, 7);
    iris.addColorStop(0, "#0d5a7d");
    iris.addColorStop(0.55, "#1e8fb4");
    iris.addColorStop(1, "#7fe4f7");
    c.fillStyle = iris;
    c.beginPath();
    c.arc(look, 1, 6, 0, Math.PI * 2);
    c.fill();
    c.fillStyle = "#062a3c";
    c.beginPath();
    c.arc(look, 1.4, 3.1, 0, Math.PI * 2);
    c.fill();
    c.fillStyle = "rgba(255,255,255,0.95)";
    c.beginPath();
    c.arc(look - 2.6, -2.4, 1.7, 0, Math.PI * 2);
    c.fill();
    c.fillStyle = "rgba(255,255,255,0.55)";
    c.beginPath();
    c.arc(look + 2.2, 3, 0.9, 0, Math.PI * 2);
    c.fill();
    const lid = c.createLinearGradient(0, -13, 0, 0);
    lid.addColorStop(0, "rgba(20,74,102,0.34)");
    lid.addColorStop(1, "rgba(20,74,102,0)");
    c.fillStyle = lid;
    c.fillRect(-12, -13, 24, 9);
    c.restore();
    c.strokeStyle = "rgba(26,86,116,0.5)";
    c.lineWidth = 1.5;
    c.beginPath();
    c.ellipse(0, 0, 10.6, 11.8, 0, 0, Math.PI * 2);
    c.stroke();
    c.save();
    c.translate(0, -13.5);
    c.rotate(angry * (x < 0 ? 0.28 : -0.28));
    const brow = c.createLinearGradient(0, -5.5, 0, 5);
    brow.addColorStop(0, "#e8fbff");
    brow.addColorStop(0.42, "#7ed2ec");
    brow.addColorStop(1, "#2c84a9");
    c.fillStyle = brow;
    c.beginPath();
    c.moveTo(-12.5, 2.6);
    c.quadraticCurveTo(0, -5.4, 12.5, -1.6);
    c.quadraticCurveTo(0, 0.6, -12.5, 5.4);
    c.closePath();
    c.fill();
    c.strokeStyle = "rgba(20,68,94,0.32)";
    c.lineWidth = 1.1;
    c.beginPath();
    c.moveTo(-12.5, 5.2);
    c.quadraticCurveTo(0, 0.8, 12.5, -1.4);
    c.stroke();
    c.strokeStyle = "rgba(255,255,255,0.65)";
    c.lineWidth = 0.9;
    c.beginPath();
    c.moveTo(-11.5, 2.2);
    c.quadraticCurveTo(0, -4.8, 11.5, -1.4);
    c.stroke();
    c.restore();
    c.restore();
  }