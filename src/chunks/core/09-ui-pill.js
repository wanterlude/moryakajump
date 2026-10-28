  function uiPill(x, y, w, h, opts = {}) {
    const r = opts.radius ?? UI.pill(h);
    const fill = opts.fill ?? UI.surface;
    ctx.save();
    ctx.shadowColor = opts.glow || UI.shadow;
    ctx.shadowBlur = opts.glow ? 14 : 10;
    ctx.shadowOffsetY = 3;
    roundedRect(x, y, w, h, r);
    ctx.fillStyle = fill;
    ctx.fill();
    ctx.shadowColor = "transparent";
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;
    roundedRect(x + 0.5, y + 0.5, w - 1, h - 1, r);
    ctx.strokeStyle = opts.stroke ?? UI.stroke;
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.restore();
  }