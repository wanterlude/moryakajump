  function duelDrawBossBody(c) {
    const kind = duelBossKind();
    if (kind === "yeti" || kind === "avalanche") duelYetiBody(c);
    else if (kind === "storm") duelStormBody(c);
    else if (kind === "leviathan") duelLeviathanBody(c);
    else duelBossBody(c);
  }
  function duelShardShape(c, len, wid, fill, edge) {
    c.beginPath();
    c.moveTo(len, 0);
    c.lineTo(wid * 0.35, -wid);
    c.lineTo(-len * 0.65, -wid * 0.72);
    c.lineTo(-len * 0.95, 0);
    c.lineTo(-len * 0.65, wid * 0.72);
    c.lineTo(wid * 0.35, wid);
    c.closePath();
    c.fillStyle = fill;
    c.fill();
    if (edge) {
      c.strokeStyle = edge;
      c.lineWidth = 0.8;
      c.stroke();
    }
  }
  function duelDrawBullets(c) {
    c.save();
    c.shadowColor = "rgba(6,30,48,.45)";
    c.shadowBlur = 3;
    c.shadowOffsetY = 1;
    for (const b of duelState.bullets) {
      if (b.delay > 0) continue;
      const kind = b.kind || "shard";
      const ang = Math.atan2(b.vy, b.vx);
      c.save();
      c.translate(b.x, b.y);
      if (b.own) {
        c.rotate(ang + Math.PI / 2);
        c.globalCompositeOperation = "lighter";
        c.globalAlpha = 0.45;
        const trail = c.createLinearGradient(0, 0, 0, 26);
        trail.addColorStop(0, "rgba(168,244,255,0.85)");
        trail.addColorStop(1, "rgba(168,244,255,0)");
        c.fillStyle = trail;
        c.beginPath();
        c.moveTo(-2.6, 2);
        c.lineTo(0, 26);
        c.lineTo(2.6, 2);
        c.closePath();
        c.fill();
        duelDrawGlow(c, 0, 0, 13, "#8ef0ff");
        c.globalAlpha = 1;
        c.globalCompositeOperation = "source-over";
        const grad = c.createLinearGradient(0, -10, 0, 6);
        grad.addColorStop(0, "#ffffff");
        grad.addColorStop(0.45, "#c9f8ff");
        grad.addColorStop(1, "#5fc8e8");
        c.beginPath();
        c.moveTo(0, -10);
        c.lineTo(3.4, -1);
        c.lineTo(0, 6.5);
        c.lineTo(-3.4, -1);
        c.closePath();
        c.fillStyle = grad;
        c.fill();
        c.strokeStyle = "rgba(255,255,255,0.85)";
        c.lineWidth = 0.8;
        c.stroke();
        c.fillStyle = "rgba(255,255,255,0.95)";
        c.beginPath();
        c.moveTo(0, -8);
        c.lineTo(1.2, -1);
        c.lineTo(0, 2);
        c.lineTo(-1.2, -1);
        c.closePath();
        c.fill();
        c.restore();
        continue;
      }
      if (kind === "snowball") {
        const squash = 1 + Math.sin((b.age || 0) / 5) * 0.06;
        for (let k = 3; k >= 1; k--) {
          c.globalAlpha = 0.1 * (4 - k);
          c.fillStyle = "#eafaff";
          c.beginPath();
          c.arc(-b.vx * k * 0.9, -b.vy * k * 0.9, b.r * (0.9 - k * 0.14), 0, Math.PI * 2);
          c.fill();
        }
        c.globalAlpha = 1;
        const g = c.createRadialGradient(-b.r * 0.35, -b.r * 0.4, b.r * 0.15, 0, 0, b.r * 1.15);
        g.addColorStop(0, "#ffffff");
        g.addColorStop(0.55, "#e2f6ff");
        g.addColorStop(0.85, "#a7d9ee");
        g.addColorStop(1, "#79b7d4");
        c.fillStyle = g;
        c.beginPath();
        c.ellipse(0, 0, b.r * squash, b.r / squash, 0, 0, Math.PI * 2);
        c.fill();
        c.strokeStyle = "rgba(255,255,255,0.7)";
        c.lineWidth = 1;
        c.stroke();
        c.fillStyle = "rgba(255,255,255,0.55)";
        c.beginPath();
        c.arc(-b.r * 0.3, -b.r * 0.35, b.r * 0.24, 0, Math.PI * 2);
        c.fill();
        c.restore();
        continue;
      }
      if (kind === "snowflake") {
        c.rotate(b.spin || 0);
        c.globalCompositeOperation = "lighter";
        c.globalAlpha = 0.8;
        duelDrawGlow(c, 0, 0, b.r * 3.4, "#c9b8ff");
        c.globalAlpha = 1;
        c.strokeStyle = "#e6faff";
        c.lineWidth = 1.6;
        c.lineCap = "round";
        for (let k = 0; k < 6; k++) {
          const a = k / 6 * Math.PI * 2;
          const ex = Math.cos(a) * b.r * 1.9;
          const ey = Math.sin(a) * b.r * 1.9;
          c.beginPath();
          c.moveTo(0, 0);
          c.lineTo(ex, ey);
          c.stroke();
          c.beginPath();
          c.moveTo(ex * 0.55, ey * 0.55);
          c.lineTo(ex * 0.8 + Math.cos(a + 1.1) * 3, ey * 0.8 + Math.sin(a + 1.1) * 3);
          c.moveTo(ex * 0.55, ey * 0.55);
          c.lineTo(ex * 0.8 + Math.cos(a - 1.1) * 3, ey * 0.8 + Math.sin(a - 1.1) * 3);
          c.stroke();
        }
        c.fillStyle = "#ffffff";
        c.beginPath();
        c.arc(0, 0, 2.2, 0, Math.PI * 2);
        c.fill();
        c.strokeStyle = "rgba(180,160,255,0.55)";
        c.lineWidth = 1;
        c.beginPath();
        c.arc(0, 0, b.r * 2.2, 0, Math.PI * 2);
        c.stroke();
        c.restore();
        continue;
      }
      if (kind === "spike") {
        const fade = b.life != null ? Math.min(1, b.life / 24) : 1;
        c.globalAlpha = fade * 0.5;
        c.globalCompositeOperation = "lighter";
        duelDrawGlow(c, 0, -10, 26, "#9fe8ff");
        c.globalAlpha = fade;
        c.globalCompositeOperation = "source-over";
        const g = c.createLinearGradient(0, -34, 0, 4);
        g.addColorStop(0, "#ffffff");
        g.addColorStop(0.4, "#c8f4ff");
        g.addColorStop(1, "#4b9cc0");
        c.beginPath();
        c.moveTo(0, -34);
        c.lineTo(b.r * 0.95, -6);
        c.lineTo(b.r * 0.6, 3);
        c.lineTo(-b.r * 0.6, 3);
        c.lineTo(-b.r * 0.95, -6);
        c.closePath();
        c.fillStyle = g;
        c.fill();
        c.strokeStyle = "rgba(255,255,255,0.8)";
        c.lineWidth = 0.9;
        c.stroke();
        c.fillStyle = "rgba(255,255,255,0.45)";
        c.beginPath();
        c.moveTo(0, -32);
        c.lineTo(2.2, -6);
        c.lineTo(-1, 1);
        c.closePath();
        c.fill();
        c.restore();
        continue;
      }
      if (kind === "seeker") {
        const pulse = 0.85 + 0.15 * Math.sin((b.age || 0) / 6);
        c.globalCompositeOperation = "lighter";
        c.globalAlpha = 0.75;
        duelDrawGlow(c, 0, 0, b.r * 4.2 * pulse, "#c9b0ff");
        c.globalAlpha = 1;
        c.globalCompositeOperation = "source-over";
        const g = c.createRadialGradient(-2, -2, 1, 0, 0, b.r * pulse);
        g.addColorStop(0, "#ffffff");
        g.addColorStop(0.42, "#e4d8ff");
        g.addColorStop(0.8, "#9d7ff0");
        g.addColorStop(1, "#5b3fb0");
        c.fillStyle = g;
        c.beginPath();
        c.arc(0, 0, b.r * pulse, 0, Math.PI * 2);
        c.fill();
        c.strokeStyle = "rgba(255,255,255,0.75)";
        c.lineWidth = 1;
        c.stroke();
        c.strokeStyle = "rgba(214,196,255,0.75)";
        c.lineWidth = 1.4;
        c.beginPath();
        c.arc(0, 0, b.r + 3.4, (b.age || 0) / 18, (b.age || 0) / 18 + Math.PI * 1.25);
        c.stroke();
        for (let k = 0; k < 2; k++) {
          const a = (b.age || 0) / 14 + k * Math.PI;
          const ox = Math.cos(a) * (b.r + 4.5);
          const oy = Math.sin(a) * (b.r + 4.5);
          c.fillStyle = "#d9c9ff";
          c.beginPath();
          c.moveTo(ox, oy - 2.4);
          c.lineTo(ox + 1.7, oy);
          c.lineTo(ox, oy + 2.4);
          c.lineTo(ox - 1.7, oy);
          c.closePath();
          c.fill();
        }
        c.restore();
        continue;
      }
      c.rotate(ang);
      const len = kind === "hail" ? b.r * 1.7 : b.r * 1.95;
      const wid = kind === "hail" ? b.r * 0.66 : b.r * 0.8;
      c.globalCompositeOperation = "lighter";
      c.globalAlpha = 0.5;
      const trail = c.createLinearGradient(-len * 2.6, 0, len, 0);
      trail.addColorStop(0, "rgba(150,225,255,0)");
      trail.addColorStop(1, "rgba(190,240,255,0.75)");
      c.fillStyle = trail;
      c.beginPath();
      c.moveTo(-len * 2.6, 0);
      c.lineTo(-len * 0.6, -wid * 1.1);
      c.lineTo(-len * 0.6, wid * 1.1);
      c.closePath();
      c.fill();
      c.globalAlpha = 0.7;
      duelDrawGlow(c, 0, 0, b.r * 2.6, "#9fe8ff");
      c.globalAlpha = 1;
      c.globalCompositeOperation = "source-over";
      const g = c.createLinearGradient(-len, 0, len, 0);
      g.addColorStop(0, "#6fb6d6");
      g.addColorStop(0.45, "#d9f7ff");
      g.addColorStop(0.78, "#ffffff");
      g.addColorStop(1, "#bfeeff");
      duelShardShape(c, len, wid, g, "rgba(255,255,255,0.85)");
      c.strokeStyle = "rgba(78,150,188,0.55)";
      c.lineWidth = 0.8;
      c.beginPath();
      c.moveTo(-len * 0.6, 0);
      c.lineTo(len * 0.9, 0);
      c.stroke();
      c.restore();
    }
    c.restore();
  }
  function duelDrawPlayer(c) {
    if (duelState.invuln > 0 && Math.floor(duelState.frame / 4) % 2 === 0) return;
    const t = duelState.frame;
    const x = duelState.px + DUEL_PLAYER_HALF;
    const cy = DUEL_PLAYER_Y + 4;
    const bob = Math.sin(t / 24) * 1.1;
    const ay = cy + bob * 0.4;
    const feetY = DUEL_PLAYER_Y + 26 + bob;
    const r = 14;
    const sway = Math.sin(t / 38) * 1.6;
    c.save();

    // Тень на снегу
    c.save();
    c.globalAlpha = 0.32;
    c.fillStyle = "#08202f";
    c.beginPath();
    c.ellipse(x, feetY + 1.5, 13, 3.6, 0, 0, Math.PI * 2);
    c.fill();
    c.restore();

    // Шарф: развевающийся хвост за спиной
    c.save();
    c.strokeStyle = "#6ff0c4";
    c.lineWidth = 3.2;
    c.lineCap = "round";
    c.beginPath();
    c.moveTo(x - 6, ay + 2);
    c.quadraticCurveTo(x - 14 - sway, ay + 6, x - 16 - sway * 1.4, ay + 14 + Math.sin(t / 18) * 2.5);
    c.stroke();
    c.strokeStyle = "rgba(255,255,255,0.55)";
    c.lineWidth = 0.9;
    c.stroke();
    c.restore();

    // Выбранный персонаж — тот же аватар, что и в забеге.
    const img = avatarImages[selectedAvatar];
    c.save();
    c.beginPath();
    c.arc(x, ay, r, 0, Math.PI * 2);
    c.fillStyle = "rgba(14,38,60,.92)";
    c.fill();
    c.save();
    c.beginPath();
    c.arc(x, ay, r - 2.5, 0, Math.PI * 2);
    c.clip();
    if (img && img.complete && img.naturalWidth > 0) {
      c.drawImage(img, x - r + 2.5, ay - r + 2.5, (r - 2.5) * 2, (r - 2.5) * 2);
    } else {
      const fallback = c.createLinearGradient(x - r, ay - r, x + r, ay + r);
      fallback.addColorStop(0, "#ffd98a");
      fallback.addColorStop(1, "#e0575f");
      c.fillStyle = fallback;
      c.fillRect(x - r + 2.5, ay - r + 2.5, (r - 2.5) * 2, (r - 2.5) * 2);
    }
    const shine = c.createLinearGradient(0, ay - r + 2, 0, ay + r * 0.6);
    shine.addColorStop(0, "rgba(255,255,255,.34)");
    shine.addColorStop(1, "rgba(255,255,255,0)");
    c.fillStyle = shine;
    c.fillRect(x - r + 2.5, ay - r + 2.5, (r - 2.5) * 2, r * 1.6);
    c.restore();
    c.beginPath();
    c.arc(x, ay, r - 1.4, Math.PI * 1.12, Math.PI * 1.88);
    c.strokeStyle = "rgba(255,255,255,.72)";
    c.lineWidth = 1.6;
    c.lineCap = "round";
    c.stroke();
    c.beginPath();
    c.arc(x, ay, r - 0.75, 0, Math.PI * 2);
    c.strokeStyle = "rgba(6,22,40,.9)";
    c.lineWidth = 1.6;
    c.stroke();
    // drawFrame рисует через общий ctx: на игровом полотне это тот же контекст.
    drawFrame(x, ay, r - 1, selectedFrame);
    c.restore();

    // Рука с ледяным бластером
    c.save();
    c.translate(x + 12, cy + 1.5);
    c.rotate(-0.14);
    const gun = c.createLinearGradient(0, -3, 0, 3);
    gun.addColorStop(0, "#dff7ff");
    gun.addColorStop(0.45, "#8fd2e8");
    gun.addColorStop(1, "#2f7694");
    c.fillStyle = gun;
    c.beginPath();
    c.roundRect(-1.6, -8, 5.2, 9.4, 1.6);
    c.fill();
    c.strokeStyle = "rgba(255,255,255,0.8)";
    c.lineWidth = 0.8;
    c.stroke();
    c.fillStyle = "#6ff0c4";
    c.beginPath();
    c.arc(1, -6.4, 1.5, 0, Math.PI * 2);
    c.fill();
    c.fillStyle = "#bfefff";
    c.beginPath();
    c.roundRect(0.2, -11.4, 1.6, 4.4, 0.8);
    c.fill();
    if (duelState.fireCd > DUEL_FIRE_FRAMES - 4) {
      const k = (duelState.fireCd - (DUEL_FIRE_FRAMES - 4)) / 4;
      c.save();
      c.globalCompositeOperation = "lighter";
      c.globalAlpha = 0.6 * k;
      duelDrawGlow(c, 1, -13, 14 + k * 6, "#8ef0ff");
      c.restore();
      c.fillStyle = "#ffffff";
      c.beginPath();
      c.moveTo(1, -20 - k * 4);
      c.lineTo(3.4, -12);
      c.lineTo(1, -9.6);
      c.lineTo(-1.4, -12);
      c.closePath();
      c.fill();
    }
    c.restore();

    // Аура невосприимчивости
    if (duelState.invuln > 0) {
      c.save();
      c.globalAlpha = 0.16 + 0.1 * Math.sin(t / 5);
      c.strokeStyle = "#8ef7ff";
      c.lineWidth = 1.6;
      c.setLineDash([4, 6]);
      c.lineDashOffset = -t * 0.8;
      c.beginPath();
      c.arc(x, ay, r + 5, 0, Math.PI * 2);
      c.stroke();
      c.restore();
    }
    c.restore();
  }
  function duelDrawParticles(c) {
    for (const p of duelState.particles) {
      c.globalAlpha = Math.max(0, p.life / p.max);
      c.fillStyle = p.color;
      c.beginPath();
      c.arc(p.x, p.y, 2.5, 0, Math.PI * 2);
      c.fill();
    }
    c.globalAlpha = 1;
  }
  function duelDrawHud(c) {
    const x = 14;
    const y = 12;
    const w = DUEL_W - 28;
    const h = 44;
    c.save();
    // Мягкая тень и светлое стекло в стиле остального HUD.
    c.save();
    c.shadowColor = "rgba(10,40,62,.18)";
    c.shadowBlur = 18;
    c.shadowOffsetY = 6;
    duelRoundRect(c, x, y, w, h, 12);
    c.fillStyle = "rgba(255,255,255,.92)";
    c.fill();
    c.restore();
    duelRoundRect(c, x, y, w, h, 12);
    const panel = c.createLinearGradient(0, y, 0, y + h);
    panel.addColorStop(0, "rgba(255,255,255,.97)");
    panel.addColorStop(1, "rgba(236,248,255,.88)");
    c.fillStyle = panel;
    c.fill();
    c.save();
    duelRoundRect(c, x + 1, y + 1, w - 2, h * 0.52, 11);
    c.clip();
    const shine = c.createLinearGradient(0, y, 0, y + h * 0.5);
    shine.addColorStop(0, "rgba(255,255,255,.82)");
    shine.addColorStop(1, "rgba(255,255,255,0)");
    c.fillStyle = shine;
    c.fillRect(x, y, w, h * 0.5);
    c.restore();
    duelRoundRect(c, x + 0.75, y + 0.75, w - 1.5, h - 1.5, 11.5);
    c.strokeStyle = "rgba(255,255,255,.98)";
    c.lineWidth = 1.4;
    c.stroke();
    const name = DUEL_BOSS_NAMES[Math.min(duelState.index, DUEL_BOSS_NAMES.length - 1)];
    duelText(c, name, x + 14, y + 13, 8.5, "#0f3d5c", "left", 1.2);
    duelText(c, "БОСС " + (duelState.index + 1), x + w - 42, y + 13, 7, "rgba(18,58,92,.52)", "right", 1);
    const pipY = y + 38;
    for (let i = 0; i < 3; i++) {
      const px = x + 15 + i * 13;
      c.beginPath();
      c.moveTo(px, pipY - 3.4);
      c.lineTo(px + 3.4, pipY);
      c.lineTo(px, pipY + 3.4);
      c.lineTo(px - 3.4, pipY);
      c.closePath();
      c.fillStyle = i <= duelState.level ? DUEL_PHASE_COLORS[i] : "rgba(18,58,92,.15)";
      c.fill();
    }
    const barX = x + 60;
    const barY = y + 31;
    const barW = w - 104;
    const barH = 7;
    const frac = duelClamp(duelState.bhp / duelState.bmax, 0, 1);
    duelRoundRect(c, barX, barY, barW, barH, 4.5);
    c.fillStyle = "rgba(21,85,118,.12)";
    c.fill();
    if (frac > 0) {
      c.save();
      duelRoundRect(c, barX, barY, Math.max(6, barW * frac), barH, 4.5);
      c.clip();
      const fill = c.createLinearGradient(barX, barY, barX, barY + barH);
      const accent = DUEL_PHASE_COLORS[duelState.level] || DUEL_PHASE_COLORS[0];
      fill.addColorStop(0, duelHexToRgba(accent, 0.95));
      fill.addColorStop(1, duelHexToRgba(accent, 0.62));
      c.fillStyle = fill;
      c.fillRect(barX, barY, barW * frac, barH);
      c.fillStyle = "rgba(255,255,255,.42)";
      c.fillRect(barX, barY, barW * frac, barH * 0.42);
      c.restore();
    }
    c.save();
    const segments = 20;
    c.strokeStyle = "rgba(18,58,92,.18)";
    c.lineWidth = 1;
    for (let i = 1; i < segments; i++) {
      const sx = barX + barW * (i / segments);
      c.beginPath();
      c.moveTo(sx, barY + 1);
      c.lineTo(sx, barY + barH - 1);
      c.stroke();
    }
    c.restore();
    duelRoundRect(c, barX, barY, barW, barH, 4.5);
    c.strokeStyle = "rgba(18,58,92,.18)";
    c.lineWidth = 1;
    c.stroke();
    const bottom = DUEL_H - 26;
    const shownHearts = Math.min(duelState.lives, 5);
    for (let i = 0; i < shownHearts; i++) {
      const hx = 26 + i * 19;
      c.save();
      c.translate(hx, bottom - 4);
      c.beginPath();
      c.moveTo(0, 7);
      c.bezierCurveTo(-10, -2, -5, -10, 0, -4.4);
      c.bezierCurveTo(5, -10, 10, -2, 0, 7);
      c.closePath();
      c.fillStyle = "#ff6b81";
      c.fill();
      c.strokeStyle = "rgba(90,16,38,0.55)";
      c.lineWidth = 1.1;
      c.stroke();
      c.restore();
    }
    if (duelState.lives > 5) {
      duelText(c, "+" + (duelState.lives - 5), 26 + 5 * 19 + 2, bottom - 1, 9, "#b3202a", "left");
    }
    if (duelState.shield > 0) {
      const sx = DUEL_W - 30;
      c.save();
      c.translate(sx, bottom - 4);
      c.beginPath();
      c.moveTo(0, -8);
      c.lineTo(8, -4);
      c.lineTo(8, 4);
      c.lineTo(0, 8);
      c.lineTo(-8, 4);
      c.lineTo(-8, -4);
      c.closePath();
      c.fillStyle = "#7ef7ff";
      c.fill();
      c.strokeStyle = "rgba(8,44,64,0.7)";
      c.lineWidth = 1.2;
      c.stroke();
      duelText(c, String(duelState.shield), 0, 0.5, 8.5, "#053247", "center");
      c.restore();
      duelText(c, "ЩИТ", sx - 16, bottom - 1, 7.5, "rgba(18,58,92,.62)", "right", 0.8);
    }
    if (duelState.frame < 320) {
      c.globalAlpha = Math.min(1, (320 - duelState.frame) / 80) * 0.75;
      const hint = isCoarsePointer()
        ? "ТАП СЛЕВА/СПРАВА · ОГОНЬ САМ"
        : "A/D ИЛИ МЫШЬ · ОГОНЬ САМ";
      duelRoundRect(c, DUEL_W / 2 - 116, DUEL_H - 54, 232, 16, 8);
      c.fillStyle = "rgba(255,255,255,.68)";
      c.fill();
      duelText(c, hint, DUEL_W / 2, DUEL_H - 46, 7.4, "rgba(18,58,92,.68)", "center", 0.9, "normal");
      c.globalAlpha = 1;
    }
    // Пауза доступна и в дуэли: HUD забега здесь скрыт, поэтому кнопка своя.
    const pz = DUEL_PAUSE_ZONE;
    duelRoundRect(c, pz.x, pz.y, pz.w, pz.h, 7);
    c.fillStyle = "rgba(21,85,118,.08)";
    c.fill();
    c.strokeStyle = "rgba(18,58,92,.18)";
    c.lineWidth = 1;
    c.stroke();
    c.fillStyle = "rgba(18,58,92,.78)";
    c.fillRect(pz.x + pz.w / 2 - 3.2, pz.y + 8, 2.2, 8);
    c.fillRect(pz.x + pz.w / 2 + 1, pz.y + 8, 2.2, 8);
    c.restore();
  }
  function duelDrawBanner(c) {
    if (!duelState.over) return;
    const k = 1 - Math.max(0, duelState.overLeft) / DUEL_END_FRAMES;
    const alpha = Math.min(1, k * 3);
    const accent = duelState.won ? "#c28000" : "#b3202a";
    const w = 292;
    const h = 106;
    const x = (DUEL_W - w) / 2;
    const y = DUEL_H / 2 - h / 2;
    c.save();
    c.globalAlpha = alpha;
    c.save();
    c.shadowColor = "rgba(10,40,62,.22)";
    c.shadowBlur = 24;
    c.shadowOffsetY = 9;
    duelRoundRect(c, x, y, w, h, 16);
    c.fillStyle = "rgba(255,255,255,.96)";
    c.fill();
    c.restore();
    duelRoundRect(c, x, y, w, h, 16);
    const panel = c.createLinearGradient(0, y, 0, y + h);
    panel.addColorStop(0, "rgba(255,255,255,.98)");
    panel.addColorStop(1, "rgba(236,248,255,.9)");
    c.fillStyle = panel;
    c.fill();
    duelRoundRect(c, x + 0.75, y + 0.75, w - 1.5, h - 1.5, 15.5);
    c.strokeStyle = duelHexToRgba(accent, 0.38);
    c.lineWidth = 1.4;
    c.stroke();
    c.globalAlpha = alpha * 0.9;
    c.fillStyle = accent;
    c.fillRect(x + 30, y + 1.5, w - 60, 2);
    c.globalAlpha = alpha;
    duelText(c, duelState.won ? "ПОБЕДА" : "ПОРАЖЕНИЕ", DUEL_W / 2, y + 42, 26, accent, "center", 4);
    let subtitle = duelState.won ? "БОСС ПОВЕРЖЕН" : "ЗАБЕГ ОКОНЧЕН";
    if (duelState.won && typeof bossState !== "undefined" && bossState.reward) subtitle = "+" + bossState.reward + " МОНЕТ";
    duelText(c, subtitle, DUEL_W / 2, y + 74, 10, "rgba(18,58,92,.62)", "center", 1.6, "normal");
    c.restore();
  }

