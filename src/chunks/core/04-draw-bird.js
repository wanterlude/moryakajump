  function drawBird(bird) {
    if (avalancheRocks.has(bird)) {
      drawAvalancheRock(bird);
      return;
    }
    const flap = Math.sin(bird.flap);
    const size = bird.size || 1;
    const body = bird.color;
    const accent = bird.accent || "#e8eef4";
    ctx.save();
    ctx.translate(bird.x, bird.y);
    if (bird.vx < 0) ctx.scale(-size, size);
    else ctx.scale(size, size);
    if (!avalancheRocks.has(bird)) {
      const groundGap = Math.max(0, 540 - bird.y);
      const shadowY = 26 + groundGap * 0.04;
      const shadowAlpha = 0.16 * Math.max(0.15, 1 - groundGap / 460);
      ctx.fillStyle = `rgba(38,74,102,${shadowAlpha})`;
      ctx.beginPath();
      ctx.ellipse(0, shadowY, 11, 2.6, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    const tailLen = bird.kind === "raven" ? 15 : bird.kind === "swift" ? 11 : 13;
    ctx.fillStyle = body;
    ctx.beginPath();
    ctx.moveTo(-8, -3);
    ctx.lineTo(-8 - tailLen, -7);
    ctx.lineTo(-8 - tailLen * 0.82, 0);
    ctx.lineTo(-8 - tailLen, 6);
    ctx.lineTo(-8, 3);
    ctx.closePath();
    ctx.fill();
    const farTipY = -14 + flap * 8;
    ctx.fillStyle = accent;
    ctx.beginPath();
    ctx.moveTo(-1, -3);
    ctx.quadraticCurveTo(-8, farTipY + 3, -19, farTipY);
    ctx.quadraticCurveTo(-9, farTipY + 8, 1, 1);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "rgba(24,40,58,.35)";
    ctx.lineWidth = 0.7;
    ctx.stroke();
    const bodyGrad = cachedLinear(gradientKey(["bird.body", body, accent]), -9, -8, 11, 7, [
      [0, body],
      [0.7, body],
      [1, accent]
    ]);
    ctx.fillStyle = bodyGrad;
    ctx.beginPath();
    ctx.moveTo(11, -1);
    ctx.bezierCurveTo(10, -7, 2, -9, -6, -6);
    ctx.bezierCurveTo(-11, -4, -11, 4, -5, 6);
    ctx.bezierCurveTo(2, 8, 9, 6, 11, -1);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "rgba(255,255,255,.34)";
    ctx.beginPath();
    ctx.ellipse(2, 2.6, 6.4, 3.2, 0.16, 0, Math.PI * 2);
    ctx.fill();
    const nearTipY = 12 - flap * 8;
    const wingGrad = cachedLinear(
      gradientKey(["bird.wing", body, accent, Math.round(nearTipY)]),
      0,
      -4,
      4,
      nearTipY,
      [
        [0, accent],
        [0.45, body],
        [1, body]
      ]
    );
    ctx.fillStyle = wingGrad;
    ctx.beginPath();
    ctx.moveTo(0, -2);
    ctx.quadraticCurveTo(7, nearTipY * 0.7 - 2, 15, nearTipY);
    ctx.quadraticCurveTo(6, nearTipY * 0.5 + 5, -2, 3);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "rgba(24,40,58,.42)";
    ctx.lineWidth = 0.8;
    ctx.stroke();
    ctx.strokeStyle = "rgba(20,32,46,.34)";
    ctx.lineWidth = 0.8;
    ctx.lineCap = "round";
    for (let i = 0; i < 3; i++) {
      const px = 6 + i * 3.2;
      const py = nearTipY * (0.55 + i * 0.12) + 1;
      ctx.beginPath();
      ctx.moveTo(px, py);
      ctx.lineTo(px + 2.2, py + 2.6);
      ctx.stroke();
    }
    ctx.fillStyle = body;
    ctx.beginPath();
    ctx.arc(9, -3, 5, 0, Math.PI * 2);
    ctx.fill();
    const beak = bird.kind === "raven" ? 8 : bird.kind === "swift" ? 4.5 : 6;
    ctx.fillStyle = "#f0a02e";
    ctx.beginPath();
    ctx.moveTo(12.5, -4.6);
    ctx.lineTo(12.5 + beak, -2.6);
    ctx.lineTo(12.5, -0.8);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#f8fbff";
    ctx.beginPath();
    ctx.arc(10.4, -5, 2.1, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#16202e";
    ctx.beginPath();
    ctx.arc(11, -5, 1.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "rgba(255,255,255,.95)";
    ctx.beginPath();
    ctx.arc(11.4, -5.6, 0.5, 0, Math.PI * 2);
    ctx.fill();
    if (bird.kind === "raven") {
      ctx.strokeStyle = "rgba(200,60,45,.8)";
      ctx.lineWidth = 1.3;
      ctx.beginPath();
      ctx.arc(9, -6.2, 3.2, Math.PI * 0.85, Math.PI * 1.75);
      ctx.stroke();
    }
    ctx.restore();
  }
  function drawJetPickup(jet) {
    const t = frameNow();
    const cx = jet.x + 11;
    const cy = jet.y + 11 + Math.sin(t * 2.2) * 1.8;
    const pulse = 0.5 + 0.5 * Math.sin(t * 3.6);
    ctx.save();
    const halo = cachedRadial(gradientKey(["jet.halo", Math.round(pulse * 8)]), 0, 0, 3, 0, 0, 24, [
      [0, `rgba(255,170,60,${(0.34 + pulse * 0.16).toFixed(2)})`],
      [1, "rgba(255,150,40,0)"]
    ]);
    ctx.translate(cx, cy);
    ctx.fillStyle = halo;
    ctx.beginPath();
    ctx.arc(0, 0, 24, 0, Math.PI * 2);
    ctx.fill();
    const body = cachedLinear("jet.body", -6, -11, 6, 9, [
      [0, "#e8f4ff"],
      [0.45, "#a9c9e4"],
      [1, "#6f92b3"]
    ]);
    roundedRect(-6, -11, 12, 19, 5);
    ctx.fillStyle = body;
    ctx.fill();
    ctx.strokeStyle = "rgba(40,70,100,.55)";
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.fillStyle = "#3f5f7d";
    roundedRect(-2.5, -13.5, 5, 3, 1.5);
    ctx.fill();
    ctx.fillStyle = "#8c6a3a";
    roundedRect(-3.5, 7.5, 7, 3, 1.5);
    ctx.fill();
    const flame = 5 + Math.sin(t * 16) * 2;
    const fire = cachedLinear(gradientKey(["jet.fire", Math.round(flame)]), 0, 10, 0, 10 + flame, [
      [0, "rgba(255,240,180,.95)"],
      [0.5, "rgba(255,150,40,.8)"],
      [1, "rgba(230,60,20,0)"]
    ]);
    ctx.fillStyle = fire;
    ctx.beginPath();
    ctx.moveTo(-3, 10);
    ctx.quadraticCurveTo(0, 10 + flame * 0.7, 0, 10 + flame);
    ctx.quadraticCurveTo(0, 10 + flame * 0.7, 3, 10);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }
  function drawLifePickup(life) {
    const t = frameNow();
    const cx = life.x + 9;
    const cy = life.y + 9 + Math.sin(t * 2.4) * 1.6;
    const pulse = 0.5 + 0.5 * Math.sin(t * 3.4);
    const s = 1 + pulse * 0.06;
    ctx.save();
    ctx.translate(cx, cy);
    const haloStep = Math.round(pulse * 8);
    const haloA = 0.42 + pulse * 0.18;
    const haloB = 0.12 + pulse * 0.08;
    const halo = cachedRadial(gradientKey(["life.halo", haloStep]), 0, 0, 2, 0, 0, 22, [
      [0, `rgba(255,120,140,${haloA.toFixed(2)})`],
      [0.55, `rgba(255,100,125,${haloB.toFixed(2)})`],
      [1, "rgba(255,100,125,0)"]
    ]);
    ctx.fillStyle = halo;
    ctx.beginPath();
    ctx.arc(0, 0, 22, 0, Math.PI * 2);
    ctx.fill();
    const heartPath = (k) => {
      const hw = 10.5 * k;
      const top = -7 * k;
      ctx.beginPath();
      ctx.moveTo(0, 10 * k);
      ctx.bezierCurveTo(-hw * 1.3, 3 * k, -hw * 1.2, top - 4 * k, -hw * 0.45, top - 2 * k);
      ctx.bezierCurveTo(-hw * 0.2, top - 3 * k, 0, top - 1 * k, 0, top + 2 * k);
      ctx.bezierCurveTo(0, top - 1 * k, hw * 0.2, top - 3 * k, hw * 0.45, top - 2 * k);
      ctx.bezierCurveTo(hw * 1.2, top - 4 * k, hw * 1.3, 3 * k, 0, 10 * k);
      ctx.closePath();
    };
    ctx.save();
    ctx.globalAlpha = 0.22;
    ctx.fillStyle = "#5a1020";
    ctx.beginPath();
    ctx.ellipse(0, 15, 7, 2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    heartPath(s);
    const body = cachedLinear("life.body", 0, -8, 0, 10, [
      [0, "#ff6b7f"],
      [0.55, "#e63946"],
      [1, "#b3202a"]
    ]);
    ctx.fillStyle = body;
    ctx.fill();
    heartPath(s);
    ctx.strokeStyle = "rgba(110,10,25,.55)";
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.save();
    heartPath(s);
    ctx.clip();
    ctx.fillStyle = "rgba(255,255,255,.55)";
    ctx.beginPath();
    ctx.ellipse(-4.2, -4.2, 2.6, 1.6, -0.6, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    for (let k = 0; k < 3; k++) {
      const a = t * 1.6 + Math.PI * 2 * k / 3;
      const orbit = 15 + Math.sin(t * 3 + k) * 1.2;
      const sx = Math.cos(a) * orbit;
      const sy = -2 + Math.sin(a) * orbit * 0.55;
      const twinkle = 0.5 + 0.5 * Math.sin(t * 5 + k * 2);
      ctx.save();
      ctx.globalAlpha = 0.35 + twinkle * 0.5;
      ctx.fillStyle = "#ffffff";
      ctx.shadowColor = "rgba(255,140,160,.9)";
      ctx.shadowBlur = 6;
      ctx.beginPath();
      ctx.arc(sx, sy, 1.2 + twinkle * 0.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
    ctx.restore();
  }
  function equippedPlatformSkinId(type) {
    return platformSelected[type] || baseSkinId(type);
  }
  function drawPlatform(p) {
    const skin = PLATFORM_SKIN_BY_ID[equippedPlatformSkinId(p.type)];
    if (!skin || skin.tier === "base") drawPlatformBase(p);
    else drawThemedPlatform(p, skin);
    // Магнитное поле тянется по всей длине платформы, какой бы ширины она ни была.
    if (p.spring) drawPlatformMagnet(p);
  }
  function darkenSkinHex(hex, k) {
    const n = parseInt(hex.slice(1), 16);
    const ch = (v) => Math.max(0, Math.min(255, Math.round(v * k))).toString(16).padStart(2, "0");
    return "#" + ch(n >> 16 & 255) + ch(n >> 8 & 255) + ch(n & 255);
  }
  function drawSkinDetail(d, p, skin) {
    const { x, y, w, h } = p;
    ctx.save();
    switch (d) {
      case "snowcap": {
        ctx.fillStyle = "#ffffff";
        ctx.globalAlpha = 0.95;
        const capH = Math.max(2, Math.min(4, h * 0.25));
        ctx.beginPath();
        ctx.moveTo(x, y);
        for (let sx = x; sx <= x + w; sx += 6) {
          const bump = Math.round((sx - x) / 6) % 2 * 1.2;
          ctx.lineTo(sx, y + capH + bump);
        }
        ctx.lineTo(x + w, y);
        ctx.closePath();
        ctx.fill();
        break;
      }
      case "icicles": {
        ctx.fillStyle = skin.accent;
        ctx.globalAlpha = 0.9;
        const maxLen = Math.max(2, h * 0.5);
        for (let i = 0, sx = x + 6; sx < x + w - 4; sx += 13, i++) {
          const len = Math.min(maxLen, 3 + i % 3 * 1.5);
          ctx.beginPath();
          ctx.moveTo(sx - 2, y);
          ctx.lineTo(sx + 2, y);
          ctx.lineTo(sx, y + len);
          ctx.closePath();
          ctx.fill();
        }
        break;
      }
      case "coils": {
        ctx.strokeStyle = skin.accent;
        ctx.globalAlpha = 0.85;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        const top = y + h - 4, bot = y + h - 1.5;
        for (let i = 0; i <= 10; i++) {
          const sx = x + 3 + (w - 6) * i / 10;
          const sy = i % 2 ? bot : top;
          if (i === 0) ctx.moveTo(sx, sy);
          else ctx.lineTo(sx, sy);
        }
        ctx.stroke();
        break;
      }
      case "drips": {
        ctx.fillStyle = skin.mid;
        ctx.globalAlpha = 0.95;
        for (let i = 0, sx = x + 6; sx < x + w - 4; sx += 15, i++) {
          const len = Math.min(h * 0.45, 2 + i % 4 * 1.4);
          ctx.fillRect(sx, y + h - len - 1, 2.6, len + 1);
        }
        break;
      }
      case "mist": {
        ctx.fillStyle = "rgba(255,255,255,.4)";
        for (let i = 0; i < 3; i++) {
          ctx.beginPath();
          ctx.ellipse(x + w * (0.22 + i * 0.28), y + h / 2, Math.max(4, w * 0.12), Math.max(2, h * 0.3), 0, 0, Math.PI * 2);
          ctx.fill();
        }
        break;
      }
      case "gloss":
        ctx.fillStyle = "rgba(255,255,255,.42)";
        ctx.fillRect(x + 3, y + 2, w - 6, Math.max(2, h * 0.28));
        break;
      case "mirror":
        ctx.fillStyle = "rgba(255,255,255,.55)";
        ctx.fillRect(x + w * 0.18, y, w * 0.14, h);
        ctx.fillStyle = "rgba(255,255,255,.28)";
        ctx.fillRect(x + w * 0.62, y, w * 0.07, h);
        break;
      case "stripes":
        ctx.strokeStyle = skin.accent;
        ctx.globalAlpha = 0.5;
        ctx.lineWidth = 3;
        for (let sx = x - h; sx < x + w; sx += 12) {
          ctx.beginPath();
          ctx.moveTo(sx, y + h);
          ctx.lineTo(sx + h, y);
          ctx.stroke();
        }
        break;
      case "planks":
        ctx.strokeStyle = skin.accent;
        ctx.globalAlpha = 0.4;
        ctx.lineWidth = 1;
        for (let sx = x + 16; sx < x + w - 6; sx += 18) {
          ctx.beginPath();
          ctx.moveTo(sx, y + 2);
          ctx.lineTo(sx + 1.5, y + h - 2);
          ctx.stroke();
        }
        ctx.globalAlpha = 0.18;
        ctx.beginPath();
        ctx.moveTo(x + 4, y + h * 0.45);
        ctx.lineTo(x + w - 4, y + h * 0.5);
        ctx.stroke();
        break;
      case "nails":
        ctx.fillStyle = skin.accent;
        ctx.globalAlpha = 0.8;
        for (const nx of [x + 6, x + w - 6]) {
          ctx.beginPath();
          ctx.arc(nx, y + h / 2, 1.4, 0, Math.PI * 2);
          ctx.fill();
        }
        break;
      case "knots":
        ctx.strokeStyle = skin.accent;
        ctx.globalAlpha = 0.6;
        ctx.lineWidth = 1.2;
        for (const kx of [x + w * 0.3, x + w * 0.72]) {
          ctx.beginPath();
          ctx.ellipse(kx, y + h / 2, 3.2, 1.6, 0, 0, Math.PI * 2);
          ctx.stroke();
        }
        break;
      case "cracks":
        ctx.strokeStyle = skin.accent;
        ctx.globalAlpha = 0.75;
        ctx.lineWidth = 1.2;
        for (const cx0 of [x + w * 0.38, x + w * 0.68]) {
          ctx.beginPath();
          ctx.moveTo(cx0, y);
          ctx.lineTo(cx0 + 3, y + h * 0.35);
          ctx.lineTo(cx0 - 2, y + h * 0.6);
          ctx.lineTo(cx0 + 2, y + h);
          ctx.stroke();
        }
        break;
      case "ribs":
        ctx.strokeStyle = skin.accent;
        ctx.globalAlpha = 0.35;
        ctx.lineWidth = 1;
        for (const ry of [y + h * 0.33, y + h * 0.66]) {
          ctx.beginPath();
          ctx.moveTo(x, ry);
          ctx.lineTo(x + w, ry);
          ctx.stroke();
        }
        break;
      case "checker":
        for (let sx = x, i = 0; sx < x + w; sx += 6, i++) {
          ctx.fillStyle = i % 2 ? skin.accent : skin.top;
          ctx.fillRect(sx, y, 6, h * 0.4);
        }
        break;
      case "firefly":
        ctx.fillStyle = skin.accent;
        ctx.globalAlpha = 0.45;
        for (let i = 0; i < 5; i++) {
          ctx.beginPath();
          ctx.arc(x + 8 + i * 37 % Math.max(1, w - 16), y + 3 + i * 11 % Math.max(1, h - 6), 1.2 + i % 2 * 0.6, 0, Math.PI * 2);
          ctx.fill();
        }
        break;
      case "sparkle":
        ctx.strokeStyle = "#ffffff";
        ctx.globalAlpha = 0.9;
        ctx.lineWidth = 1;
        for (let i = 0; i < 3; i++) {
          const sx = x + w * (0.2 + i * 0.3), sy = y + h * 0.5 + (i % 2 ? -1 : 1);
          ctx.beginPath();
          ctx.moveTo(sx - 2.5, sy);
          ctx.lineTo(sx + 2.5, sy);
          ctx.moveTo(sx, sy - 2.5);
          ctx.lineTo(sx, sy + 2.5);
          ctx.stroke();
        }
        break;
      case "rivets":
        ctx.fillStyle = skin.accent;
        ctx.globalAlpha = 0.8;
        for (let sx = x + 6; sx < x + w - 4; sx += 14) {
          ctx.beginPath();
          ctx.arc(sx, y + h / 2, 1.1, 0, Math.PI * 2);
          ctx.fill();
        }
        break;
      case "scratches":
        ctx.strokeStyle = skin.accent;
        ctx.globalAlpha = 0.35;
        ctx.lineWidth = 0.8;
        for (let sx = x + 6; sx < x + w; sx += 16) {
          ctx.beginPath();
          ctx.moveTo(sx, y + h - 2);
          ctx.lineTo(sx + 9, y + 2);
          ctx.stroke();
        }
        break;
      case "glowline":
        ctx.strokeStyle = skin.accent;
        ctx.globalAlpha = 0.95;
        ctx.lineWidth = 1.3;
        ctx.setLineDash([4, 3]);
        ctx.beginPath();
        ctx.moveTo(x + 4, y + h / 2);
        ctx.lineTo(x + w - 4, y + h / 2);
        ctx.stroke();
        ctx.setLineDash([]);
        break;
      default:
        break;
    }
    ctx.restore();
  }
  function drawThemedPlatform(p, skin) {
    const { x, y, w, h } = p;
    ctx.save();
    if (p.type === "vanish") {
      const left = p.vanishT ?? Infinity;
      const blink = left < 400 && Math.floor(frameNow() * 14) % 2 === 0;
      ctx.globalAlpha = blink ? 0.25 : p.vanishT !== void 0 ? 0.7 : 1;
    }
    drawGroundShadow(x + w / 2, y + h + 5, w * 0.58, 5, 0.16);
    // Высокие тиры получают мягкое морозное свечение по контуру.
    const premium = skin.tier === "epic" || skin.tier === "legendary" || skin.tier === "divine";
    const body = ctx.createLinearGradient(0, y, 0, y + h);
    body.addColorStop(0, skin.top);
    body.addColorStop(0.55, skin.mid);
    body.addColorStop(1, skin.bottom);
    roundedRect(x, y, w, h, 6);
    ctx.save();
    if (premium) {
      ctx.shadowColor = hexToRgba(skin.accent, 0.32);
      ctx.shadowBlur = 9;
      ctx.shadowOffsetY = 1;
    }
    ctx.fillStyle = body;
    ctx.fill();
    ctx.restore();
    ctx.save();
    roundedRect(x, y, w, h, 6);
    ctx.clip();
    // Ледяная огранка: диагональный блик и холодное затемнение снизу.
    const sheen = ctx.createLinearGradient(x, y, x + w, y + h);
    sheen.addColorStop(0, "rgba(255,255,255,.24)");
    sheen.addColorStop(0.38, "rgba(255,255,255,.05)");
    sheen.addColorStop(1, "rgba(6,30,48,.18)");
    ctx.fillStyle = sheen;
    ctx.fillRect(x, y, w, h);
    const depth = ctx.createLinearGradient(0, y + h * 0.55, 0, y + h);
    depth.addColorStop(0, "rgba(6,28,44,0)");
    depth.addColorStop(1, hexToRgba(skin.edge, 0.34));
    ctx.fillStyle = depth;
    ctx.fillRect(x, y + h * 0.55, w, h * 0.45);
    // Снежная кромка с неровным краем — общая для всех зимних скинов.
    const capH = Math.max(1.6, Math.min(3.6, h * 0.2));
    ctx.fillStyle = "rgba(255,255,255,.58)";
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + w, y);
    for (let sx = x + w, i = 0; sx >= x; sx -= 7, i++) {
      ctx.lineTo(sx, y + capH + (i % 2) * 0.9);
    }
    ctx.closePath();
    ctx.fill();
    for (const d of skin.details) drawSkinDetail(d, p, skin);
    if (p.type === "broken" && p.breaking) drawSkinDetail("cracks", p, skin);
    ctx.restore();
    // Тёмная ледяная обводка и светлая внутренняя грань.
    ctx.strokeStyle = darkenSkinHex(skin.edge, 0.55);
    ctx.lineWidth = 1.4;
    roundedRect(x + 0.7, y + 0.7, w - 1.4, h - 1.4, 5.4);
    ctx.stroke();
    ctx.strokeStyle = "rgba(255,255,255,.72)";
    ctx.lineWidth = 0.9;
    roundedRect(x + 1.6, y + 1.6, w - 3.2, h - 3.2, 4.4);
    ctx.stroke();
    // Цветной контровой блик по верхней кромке.
    ctx.strokeStyle = hexToRgba(skin.accent, 0.5);
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x + 3, y + 1.2);
    ctx.lineTo(x + w - 3, y + 1.2);
    ctx.stroke();
    ctx.restore();
  }
  function drawPlatformBase(p) {
    if (p.type === "broken") drawWoodPlatform(p);
    else if (p.type === "moving") drawIcePlatform(p);
    else if (p.type === "ice") drawSlipperyIce(p);
    else if (p.type === "vanish") drawVanishPlatform(p);
    else if (p.type === "sticky") drawStickyPlatform(p);
    else drawSnowPlatform(p);
  }

  function drawVanishPlatform(p) {
    const left = p.vanishT ?? Infinity;
    const blink = left < 400 && Math.floor(frameNow() * 14) % 2 === 0;
    ctx.save();
    ctx.globalAlpha = blink ? 0.25 : p.vanishT !== void 0 ? 0.7 : 1;
    drawSnowPlatform(p);
    ctx.restore();
  }
  function drawStickyPlatform(p) {
    ctx.save();
    const g = ctx.createLinearGradient(0, p.y, 0, p.y + p.h);
    g.addColorStop(0, "#6f9a6a");
    g.addColorStop(1, "#3b5e3a");
    roundedRect(p.x, p.y, p.w, p.h, 4);
    ctx.fillStyle = g;
    ctx.fill();
    ctx.fillStyle = "rgba(255,255,255,.22)";
    ctx.fillRect(p.x + 5, p.y + 2, p.w - 10, 3);
    ctx.restore();
  }
  function drawPlayer() {
    if (duelIsActive()) return;
    const size = 40;
    const x = player.x - 5;
    const y = player.y - 8;
    const cx = x + size / 2;
    const cy = y + size / 2;
    const radius = size / 2;
    const image = avatarImages[selectedAvatar];
    const speed = Math.abs(player.vx);
    const shadowSquash = player.dy < 0 ? 0.7 : 1;
    drawGroundShadow(
      cx + Math.max(-4, Math.min(4, player.vx * 0.8)),
      y + size + 5,
      radius * 0.95 * shadowSquash,
      4.5 * shadowSquash,
      0.24
    );
    ctx.save();
    if (squash) {
      ctx.translate(cx, cy + radius * 0.7);
      ctx.scale(1 + squash * 0.55, 1 - squash * 0.9);
      ctx.translate(-cx, -(cy + radius * 0.7));
    }
    ctx.beginPath();
    ctx.arc(cx, cy, radius - 0.5, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(14,38,60,.92)";
    ctx.fill();
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, radius - 2.5, 0, Math.PI * 2);
    ctx.clip();
    ctx.translate(cx, cy);
    const lx = -size / 2;
    const ly = -size / 2;
    if (image && image.complete && image.naturalWidth > 0) {
      ctx.drawImage(image, lx + 2.5, ly + 2.5, size - 5, size - 5);
    } else {
      const fallback = cachedLinear("player.fallback", lx, ly, lx + size, ly + size, [
        [0, "#ffd98a"],
        [1, "#e0575f"]
      ]);
      ctx.fillStyle = fallback;
      ctx.fillRect(lx + 2.5, ly + 2.5, size - 5, size - 5);
    }
    const shine = cachedLinear("player.shine", lx, ly + 2, lx, ly + size * 0.6, [
      [0, "rgba(255,255,255,.34)"],
      [1, "rgba(255,255,255,0)"]
    ]);
    ctx.fillStyle = shine;
    ctx.fillRect(lx + 2.5, ly + 2.5, size - 5, size * 0.6);
    ctx.restore();
    ctx.beginPath();
    ctx.arc(cx, cy, radius - 1.4, Math.PI * 1.12, Math.PI * 1.88);
    ctx.strokeStyle = "rgba(255,255,255,.72)";
    ctx.lineWidth = 1.6;
    ctx.lineCap = "round";
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(cx, cy, radius - 0.75, 0, Math.PI * 2);
    ctx.strokeStyle = "rgba(6,22,40,.9)";
    ctx.lineWidth = 1.6;
    ctx.stroke();
    drawFrame(cx, cy, radius - 1, selectedFrame);
    ctx.restore();
    if (speed > 1.2 && currentState === STATE.PLAYING) {
      const puff = Math.min(1, speed / 6);
      ctx.save();
      ctx.fillStyle = `rgba(255,255,255,${0.35 * puff})`;
      for (let i = 0; i < 3; i++) {
        const dx = -Math.sign(player.vx) * (6 + i * 5);
        const dy = size - 4 + i * 2;
        ctx.beginPath();
        ctx.arc(cx + dx, y + dy, 2.4 - i * 0.5, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }
    if (perkValue("jetpack") > 0 && currentState === STATE.PLAYING) {
      drawJetpackFlames(cx, y + size - 4);
    }
  }
  function drawJetpackFlames(cx, baseY) {
    const t = frameNow();
    for (const side of [-1, 1]) {
      const fx = cx + side * 5.5;
      const phase = t * 14 + (side > 0 ? 1.7 : 0);
      const len = 9 + Math.sin(phase) * 2.4 + Math.sin(phase * 1.7) * 1.2;
      const w = 3.4 + Math.cos(phase * 1.3) * 0.5;
      ctx.save();
      ctx.globalAlpha = 0.75;
      const outer = cachedLinear(
        gradientKey(["jet.flame", Math.round(len)]),
        0,
        baseY,
        0,
        baseY + len,
        [
          [0, "rgba(255,236,140,.95)"],
          [0.45, "rgba(255,150,40,.85)"],
          [1, "rgba(230,60,20,0)"]
        ]
      );
      ctx.fillStyle = outer;
      ctx.beginPath();
      ctx.moveTo(fx - w, baseY);
      ctx.quadraticCurveTo(fx - w * 0.6, baseY + len * 0.62, fx, baseY + len);
      ctx.quadraticCurveTo(fx + w * 0.6, baseY + len * 0.62, fx + w, baseY);
      ctx.closePath();
      ctx.fill();
      ctx.globalAlpha = 0.9;
      ctx.fillStyle = "rgba(255,255,220,.85)";
      ctx.beginPath();
      ctx.moveTo(fx - w * 0.42, baseY);
      ctx.quadraticCurveTo(fx - w * 0.2, baseY + len * 0.4, fx, baseY + len * 0.52);
      ctx.quadraticCurveTo(fx + w * 0.2, baseY + len * 0.4, fx + w * 0.42, baseY);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }
  }
  var touchInput = { left: false, right: false };
  var runStartedAt = 0;
  var activePointers = { left: /* @__PURE__ */ new Set(), right: /* @__PURE__ */ new Set() };
  var tiltEnabled = false;
  var tiltDirection = 0;
  var neutralGamma = null;
  var tiltFeedbackUntil = 0;
  function handleTilt(event) {
    if (!tiltEnabled || currentState !== STATE.PLAYING) {
      tiltDirection = 0;
      return;
    }
    if (typeof event.gamma !== "number") return;
    if (neutralGamma === null) neutralGamma = event.gamma;
    const tilt = event.gamma - neutralGamma;
    const deadZone = controls.tiltZone;
    if (tilt < -deadZone) tiltDirection = -1;
    else if (tilt > deadZone) tiltDirection = 1;
    else tiltDirection = 0;
  }
  function disableTilt() {
    tiltEnabled = false;
    tiltDirection = 0;
    neutralGamma = null;
  }
  async function enableTilt() {
    if (!("DeviceOrientationEvent" in window)) return;
    const DOE = DeviceOrientationEvent;
    if (typeof DOE.requestPermission === "function") {
      try {
        const permission = await DOE.requestPermission();
        if (permission !== "granted") return;
      } catch {
        return;
      }
    }
    tiltEnabled = true;
    neutralGamma = null;
    window.addEventListener("deviceorientation", handleTilt);
    tiltFeedbackUntil = performance.now() + 1800;
  }
  var mouseControl = { targetX: null, inside: false };
  var SENS_MIN = 0.4;
  var SENS_STEP = 0.2;
  // Предел и значение по умолчанию для каждой настройки свои: мышь быстрее,
  // клавиши и геймпад чуть мягче, и выше своего потолка не поднимаются.
  var SENS_LIMITS = {
    key: { max: 1.1, def: 1.1 },
    mouse: { max: 1.25, def: 1.25 },
    pad: { max: 1.1, def: 1.1 }
  };
  function sensLimit(which) {
    return SENS_LIMITS[which] || { max: 1, def: 1 };
  }
  function sensMax(which) {
    return sensLimit(which).max;
  }
  function clampSens(which, value) {
    return Math.max(SENS_MIN, Math.min(sensMax(which), value));
  }
  var ZONE_MIN = 0.15;
  var ZONE_MAX = 0.6;
  var ZONE_STEP = 0.05;
  // Порог наклона в градусах: пока телефон наклонён слабее, движения нет.
  var TILT_MIN = 2;
  var TILT_MAX = 20;
  var TILT_STEP = 2;
  function readPadZone() {
    try {
      const raw = localStorage.getItem("morjakaPadZone");
      if (raw === null) return 0.35;
      const value = Number(raw) / 100;
      if (!Number.isFinite(value)) return 0.35;
      return Math.max(ZONE_MIN, Math.min(ZONE_MAX, value));
    } catch {
      return 0.35;
    }
  }
  function readTiltZone() {
    try {
      const raw = localStorage.getItem("morjakaTiltZone");
      if (raw === null) return 5;
      const value = Number(raw);
      if (!Number.isFinite(value)) return 5;
      return Math.max(TILT_MIN, Math.min(TILT_MAX, value));
    } catch {
      return 5;
    }
  }
  function readSens(key, which) {
    const fallback = sensLimit(which).def;
    try {
      const raw = localStorage.getItem(key);
      if (raw === null) return fallback;
      const value = Number(raw) / 10;
      return Number.isFinite(value) ? value : fallback;
    } catch {
      return fallback;
    }
  }
  var controls = {
    key: clampSens("key", readSens("morjakaKeySens", "key")),
    mouse: clampSens("mouse", readSens("morjakaMouseSens", "mouse")),
    pad: clampSens("pad", readSens("morjakaPadSens", "pad")),
    padZone: readPadZone(),
    tiltZone: readTiltZone()
  };
  function saveControls() {
    try {
      localStorage.setItem("morjakaKeySens", String(Math.round(controls.key * 10)));
      localStorage.setItem("morjakaMouseSens", String(Math.round(controls.mouse * 10)));
      localStorage.setItem("morjakaPadSens", String(Math.round(controls.pad * 10)));
      localStorage.setItem("morjakaPadZone", String(Math.round(controls.padZone * 100)));
      localStorage.setItem("morjakaTiltZone", String(Math.round(controls.tiltZone)));
    } catch {
    }
  }
  function stepPadZone(direction) {
    const next = Math.round((controls.padZone + ZONE_STEP * direction) * 100) / 100;
    controls.padZone = Math.max(ZONE_MIN, Math.min(ZONE_MAX, next));
    saveControls();
    sfx.click();
  }
  function zoneText(value) {
    return Math.round(value * 100) + "%";
  }
  function tiltZoneText(value) {
    return Math.round(value) + "\u00B0";
  }
  function stepTiltZone(direction) {
    const next = Math.round(controls.tiltZone + TILT_STEP * direction);
    controls.tiltZone = Math.max(TILT_MIN, Math.min(TILT_MAX, next));
    neutralGamma = null;
    saveControls();
    sfx.click();
  }
  function stepSensitivity(which, direction) {
    if (which === "padZone") {
      stepPadZone(direction);
      return;
    }
    if (which === "tiltZone") {
      stepTiltZone(direction);
      return;
    }
    const current = controls[which];
    const next = Math.round((current + SENS_STEP * direction) * 10) / 10;
    controls[which] = clampSens(which, next);
    saveControls();
    sfx.click();
  }
  function isCoarsePointer() {
    return typeof window.matchMedia === "function" && window.matchMedia("(pointer: coarse)").matches;
  }
  function inZone(point, zone) {
    return point.x >= zone.x && point.x <= zone.x + zone.w && point.y >= zone.y && point.y <= zone.y + zone.h;
  }
  function handleFall() {
    if (player.y <= WORLD_H) return false;
    if (invulnerableActive()) {
      startScreenShake(2, 8);
      sfx.jump();
      vibrate(18);
      hudPop(player.x + 15, 470, "\u041D\u0415\u0423\u042F\u0417\u0412\u0418\u041C", PERK_RARITY.legendary.color);
      player.y = WORLD_H - 100;
      stickyStuck = null;
      player.dy = -42;
      refillJumps();
      return true;
    }
    if (fallGuardActive()) {
      startScreenShake(2, 8);
      sfx.jump();
      vibrate(18);
      hudPop(player.x + 15, 470, "\u0411\u0415\u0417 \u041F\u0410\u0414\u0415\u041D\u0418\u0419", PERK_RARITY.epic.color);
      player.y = WORLD_H - 100;
      stickyStuck = null;
      player.dy = -42;
      refillJumps();
      return true;
    }
    if (lives > 0) {
      startScreenShake(3.5, 16);
      sfx.fall();
      vibrate(40);
      lives--;
      player.y = WORLD_H - 100;
      stickyStuck = null;
      player.dy = -42;
      refillJumps();
      return true;
    }
    currentState = STATE.GAMEOVER;
    const finalScore = Math.floor(player.score);
    gameOverState.openedAt = performance.now();
    lbSubmitRun(finalScore);
    pauseState.hover = null;
    gameOverState.newRecord = finalScore > 0 && finalScore > highScore;
    if (finalScore > highScore) {
      highScore = finalScore;
      unlockedAvatars = getUnlockedAvatars(highScore);
      if (!unlockedAvatars.includes(selectedAvatar)) selectedAvatar = 0;
      saveProgress();
    }
    finishRunStats();
    return true;
  }
  function updateCoins(dt) {
    const magnetR = COIN_MAGNET_RADIUS * perkMagnetScale();
    const playerCx = player.x + 15;
    const playerCy = player.y + 15;
    const magnetR2 = magnetR * magnetR;
    for (let i = coins.length - 1; i >= 0; i--) {
      const coin = coins[i];
      if (magnetR > 0) {
        const dx = playerCx - (coin.x + 9);
        const dy = playerCy - (coin.y + 9);
        const d2 = dx * dx + dy * dy;
        if (d2 < magnetR2 && d2 > 1) {
          const d = Math.sqrt(d2);
          const pull = (1 - d / magnetR) * 7.5;
          coin.x += dx / d * pull * dt;
          coin.y += dy / d * pull * dt;
        }
      }
      if (player.x < coin.x + 20 && player.x + 30 > coin.x && player.y < coin.y + 20 && player.y + 30 > coin.y) {
        if (perkState.coinUntil && player.score >= perkState.coinUntil) {
          perkState.coinMultiplier = 0;
          perkState.coinUntil = 0;
        }
        const gained = Math.max(1, Math.round(1 + perkState.coinMultiplier));
        const perLife = coinsPerLife();
        const livesBefore = Math.floor(runCoins / perLife);
        runCoins += gained;
        bankCoins += gained;
        stats.coins += gained;
        dailyAdd("coins", gained);
        const livesAfter = Math.floor(runCoins / perLife);
        const livesGained = Math.max(0, livesAfter - livesBefore);
        if (livesGained) lives += livesGained;
        const reachedLife = livesGained > 0;
        hudState.coinPulse = 1;
        sfx.coin();
        vibrate(8);
        hudPop(coin.x, coin.y - 8, "+" + gained, "#ffb300");
        if (reachedLife) {
          hudState.lifePulse = 1;
          hudPop(coin.x, coin.y - 22, "+1 \u0416\u0418\u0417\u041D\u042C", "#e63946");
        }
        saveProgress();
        coins.splice(i, 1);
      }
    }
  }
  function updateLifePickups() {
    for (let i = lifePickups.length - 1; i >= 0; i--) {
      const life = lifePickups[i];
      if (player.x < life.x + 22 && player.x + 30 > life.x - 4 && player.y < life.y + 22 && player.y + 30 > life.y - 4) {
        lives++;
        hudState.lifePulse = 1;
        sfx.life();
        hudPop(life.x + 8, life.y - 6, "+1 \u0416\u0418\u0417\u041D\u042C", "#e63946");
        lifePickups.splice(i, 1);
      }
    }
    for (let i = jetpickups.length - 1; i >= 0; i--) {
      const jet = jetpickups[i];
      if (player.x < jet.x + 24 && player.x + 30 > jet.x - 2 && player.y < jet.y + 24 && player.y + 30 > jet.y - 2) {
        jetpickups.splice(i, 1);
        const score = Math.floor(player.score);
        const until = score + JETPACK_PICKUP_SPAN;
        const mod = perkState.mods.jetpack;
        mod.layers.length = 0;
        mod.layers.push({ v: 1, until });
        perkState.active = perkState.active.filter((a) => a.id !== "pickup-jet");
        perkState.active.push({
          id: "pickup-jet",
          icon: "rocket",
          title: "\u0420\u0410\u041D\u0415\u0426",
          rarity: "epic",
          until,
          from: score
        });
        startScreenShake(1.5, 7);
        sfx.spring();
        vibrate(20);
        hudPop(jet.x + 11, jet.y - 8, "\u0420\u0410\u041D\u0415\u0426!", PERK_RARITY.epic.color);
      }
    }
    const perkThreshold = Math.floor(player.score / PERK_SCORE_STEP) * PERK_SCORE_STEP;
    if (perkThreshold > 0 && perkThreshold > perkState.lastOfferScore) {
      perkState.lastOfferScore = perkThreshold;
      offerPerk();
    }
  }
  function updateHunter(dt) {
    if (player.score < HUNTER_FROM_SCORE) return;
    if (Math.abs(player.y - stillRefY) > 40) {
      stillRefY = player.y;
      stillFrames = 0;
    } else {
      stillFrames += SIM_STEP_MS;
    }
    if (hunterBird && !birds.includes(hunterBird)) hunterBird = null;
    if (hunterBird) {
      hunterLeft -= SIM_STEP_MS;
      if (hunterLeft <= 0) hunterBird = null;
      return;
    }
    if (stillFrames > HUNTER_STILL_MS && birds.length > 0) {
      hunterBird = birds[Math.floor(Math.random() * birds.length)];
      hunterLeft = HUNTER_CHASE_MS;
      stillFrames = 0;
      hudPop(player.x + 15, 430, "\u041E\u0425\u041E\u0422\u041D\u0418\u041A!", "#e63946");
    }
  }
  var BOSS_SHAPE = [[0.685, 1], [0.623, 1], [0.61, 0.986], [0.602, 0.917], [0.568, 0.91], [0.541, 0.917], [0.565, 0.972], [0.555, 1], [0.493, 1], [0.479, 0.931], [0.459, 0.924], [0.438, 0.941], [0.425, 1], [0.37, 1], [0.361, 0.986], [0.369, 0.944], [0.322, 0.911], [0.288, 1], [0.247, 1], [0.237, 0.986], [0.253, 0.928], [0.11, 0.878], [0.079, 0.833], [0.068, 0.768], [0.047, 0.806], [0.034, 0.875], [0.01, 0.792], [5e-3, 0.681], [0.034, 0.684], [0.082, 0.633], [0.116, 0.677], [0.093, 0.542], [0.103, 0.412], [0.29, 0.153], [0.295, 0.107], [0.331, 0.097], [0.342, 0.037], [0.37, 0.045], [0.432, 0], [0.493, 0.034], [0.527, 4e-3], [0.562, 0.086], [0.596, 0.061], [0.603, 0.128], [0.658, 0.136], [0.733, 0.253], [0.795, 0.287], [0.844, 0.458], [0.84, 0.542], [0.856, 0.684], [0.897, 0.605], [0.959, 0.611], [0.958, 0.653], [0.973, 0.681], [0.951, 0.722], [0.946, 0.778], [0.926, 0.722], [0.912, 0.722], [0.892, 0.819], [0.863, 0.864], [0.658, 0.903], [0.658, 0.931], [0.699, 0.972]];
  var BOSS_BODY = "#3d5e67";
  var BOSS_EDGE = "#524f52";
  var BOSS_EYE = "#f7e5b1";
  var BOSS_TOOTH = "#fff8e0";
  var BOSS_EYES = [
    { x: 0.184, y: 0.515, rx: 0.048, ry: 0.083 },
    { x: 0.743, y: 0.49, rx: 0.055, ry: 0.09 }
  ];
  var BOSS_TEETH = { x0: 0.25, x1: 0.74, y: 0.72, h: 0.1, n: 6 };