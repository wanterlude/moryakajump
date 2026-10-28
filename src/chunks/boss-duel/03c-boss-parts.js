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