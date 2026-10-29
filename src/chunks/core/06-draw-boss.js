  function drawBoss() {
    if (duelIsActive()) {
      duelDraw(ctx);
      return;
    }
    const b = bossState;
    if (b.phase === "idle" || b.phase === "won") return;
    ctx.save();
    if (b.phase === "warn") {
      const pulse = 0.5 + 0.5 * Math.sin(performance.now() / 120);
      ctx.globalAlpha = 0.45 + pulse * 0.55;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      setFont(12, "bold");
      ctx.fillStyle = "#ff4d6d";
      trackedText("\u0412\u041D\u0418\u041C\u0410\u041D\u0418\u0415: \u041C\u0415\u0413\u0410-\u0411\u041E\u0421\u0421", WORLD_W / 2, 210, 1.4);
      ctx.restore();
      return;
    }
    const cx = b.x + BOSS_W / 2;
    const barY = BOSS_TOP - 14;
    ctx.fillStyle = "rgba(21,85,118,.18)";
    roundedRect(b.x, barY, BOSS_W, 6, 3);
    ctx.fill();
    const frac = Math.max(0, b.hp / b.maxHp);
    if (frac > 0) {
      ctx.fillStyle = "#ff4d6d";
      roundedRect(b.x, barY, BOSS_W * frac, 6, 3);
      ctx.fill();
    }
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    setFont(7, "bold");
    ctx.fillStyle = "rgba(21,85,118,.6)";
    trackedText("\u0411\u041E\u0421\u0421 " + (b.index + 1) + " \xB7 " + Math.max(0, b.hp) + "/" + b.maxHp, cx, barY - 8, 1);
    const sx = (u) => b.x + u * BOSS_W;
    const sy = (v) => BOSS_TOP + v * BOSS_H;
    ctx.beginPath();
    BOSS_SHAPE.forEach(([u, v], i) => {
      if (i === 0) ctx.moveTo(sx(u), sy(v));
      else ctx.lineTo(sx(u), sy(v));
    });
    ctx.closePath();
    ctx.fillStyle = b.flash > 0 ? "#ffffff" : BOSS_BODY;
    ctx.fill();
    ctx.strokeStyle = BOSS_EDGE;
    ctx.lineWidth = 1.2;
    ctx.stroke();
    const angry = b.windup > 0 || b.charging > 0;
    const look = Math.sign(player.x + 15 - cx) || 1;
    for (const e of BOSS_EYES) {
      const ex = sx(e.x);
      const ey = sy(e.y);
      const rx = e.rx * BOSS_W;
      const ry = e.ry * BOSS_H;
      ctx.fillStyle = BOSS_EYE;
      ctx.beginPath();
      ctx.ellipse(ex, ey, rx, ry, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = angry ? "#ff1f3d" : "#1b1b2e";
      ctx.beginPath();
      ctx.arc(ex + look * rx * 0.35, ey + ry * 0.1, Math.min(rx, ry) * 0.45, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = BOSS_TOOTH;
    const toothW = (BOSS_TEETH.x1 - BOSS_TEETH.x0) / BOSS_TEETH.n;
    for (let i = 0; i < BOSS_TEETH.n; i++) {
      const tx = sx(BOSS_TEETH.x0 + i * toothW) + 0.5;
      roundedRect(tx, sy(BOSS_TEETH.y), toothW * BOSS_W - 1.5, BOSS_TEETH.h * BOSS_H, 1.5);
      ctx.fill();
    }
    ctx.fillStyle = "#8a8f98";
    for (const r of b.rocks) {
      ctx.beginPath();
      ctx.arc(r.x, r.y, 6, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }