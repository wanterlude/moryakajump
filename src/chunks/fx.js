  var FX_SPECS = {
    "beam_1": { family: "beam", n: 2, hue: "c2", size: 0.9, speed: 1.3, label: "\u041F\u0440\u043E\u0436\u0435\u043A\u0442\u043E\u0440 \xB7 \u0442\u0451\u043C\u043D\u044B\u0439", tier: "rare" },
    "beam_2": { family: "beam", n: 3, hue: "glow", size: 1.1, speed: 0.9, label: "\u041F\u0440\u043E\u0436\u0435\u043A\u0442\u043E\u0440 \xB7 \u0441\u0432\u0435\u0447\u0435\u043D\u0438\u0435", tier: "common" },
    "beam_3": { family: "beam", n: 2, hue: "c0", size: 1.25, speed: 0.6, label: "\u041F\u0440\u043E\u0436\u0435\u043A\u0442\u043E\u0440 \xB7 \u043E\u0441\u043D\u043E\u0432\u043D\u043E\u0439", tier: "common" },
    "beam_4": { family: "beam", n: 4, hue: "c1", size: 1.4, speed: 1.8, label: "\u041F\u0440\u043E\u0436\u0435\u043A\u0442\u043E\u0440 \xB7 \u0441\u0440\u0435\u0434\u043D\u0438\u0439", tier: "divine" },
    "bolt_1": { family: "bolt", n: 4, hue: "c0", size: 0.9, speed: 0.6, label: "\u0420\u0430\u0437\u0440\u044F\u0434 \xB7 \u043E\u0441\u043D\u043E\u0432\u043D\u043E\u0439", tier: "common" },
    "bolt_2": { family: "bolt", n: 5, hue: "c1", size: 1.1, speed: 1.8, label: "\u0420\u0430\u0437\u0440\u044F\u0434 \xB7 \u0441\u0440\u0435\u0434\u043D\u0438\u0439", tier: "legendary" },
    "bolt_3": { family: "bolt", n: 6, hue: "c2", size: 1.25, speed: 1.3, label: "\u0420\u0430\u0437\u0440\u044F\u0434 \xB7 \u0442\u0451\u043C\u043D\u044B\u0439", tier: "legendary" },
    "bolt_4": { family: "bolt", n: 3, hue: "glow", size: 1.4, speed: 0.9, label: "\u0420\u0430\u0437\u0440\u044F\u0434 \xB7 \u0441\u0432\u0435\u0447\u0435\u043D\u0438\u0435", tier: "epic" },
    "firefly_1": { family: "firefly", n: 4, hue: "c1", size: 1.25, speed: 0.9, label: "\u0421\u0432\u0435\u0442\u043B\u044F\u0447\u043A\u0438 \xB7 \u0441\u0440\u0435\u0434\u043D\u0438\u0439", tier: "rare" },
    "firefly_2": { family: "firefly", n: 6, hue: "c2", size: 1.4, speed: 0.6, label: "\u0421\u0432\u0435\u0442\u043B\u044F\u0447\u043A\u0438 \xB7 \u0442\u0451\u043C\u043D\u044B\u0439", tier: "epic" },
    "firefly_3": { family: "firefly", n: 5, hue: "glow", size: 0.9, speed: 1.8, label: "\u0421\u0432\u0435\u0442\u043B\u044F\u0447\u043A\u0438 \xB7 \u0441\u0432\u0435\u0447\u0435\u043D\u0438\u0435", tier: "legendary" },
    "firefly_4": { family: "firefly", n: 7, hue: "c0", size: 1.1, speed: 1.3, label: "\u0421\u0432\u0435\u0442\u043B\u044F\u0447\u043A\u0438 \xB7 \u043E\u0441\u043D\u043E\u0432\u043D\u043E\u0439", tier: "epic" },
    "burst_1": { family: "burst", n: 10, hue: "c0", size: 0.9, speed: 0.6, label: "\u041B\u0443\u0447\u0438 \xB7 \u043E\u0441\u043D\u043E\u0432\u043D\u043E\u0439", tier: "rare" },
    "burst_2": { family: "burst", n: 12, hue: "c1", size: 1.1, speed: 1.8, label: "\u041B\u0443\u0447\u0438 \xB7 \u0441\u0440\u0435\u0434\u043D\u0438\u0439", tier: "divine" },
    "burst_3": { family: "burst", n: 8, hue: "c2", size: 1.25, speed: 1.3, label: "\u041B\u0443\u0447\u0438 \xB7 \u0442\u0451\u043C\u043D\u044B\u0439", tier: "legendary" },
    "burst_4": { family: "burst", n: 14, hue: "glow", size: 1.4, speed: 0.9, label: "\u041B\u0443\u0447\u0438 \xB7 \u0441\u0432\u0435\u0447\u0435\u043D\u0438\u0435", tier: "divine" },
    "burst_5": { family: "burst", n: 6, hue: "c0", size: 0.9, speed: 0.6, label: "\u041B\u0443\u0447\u0438 \xB7 \u043E\u0441\u043D\u043E\u0432\u043D\u043E\u0439 \xB7 \u0432\u0430\u0440\u0438\u0430\u043D\u0442 2", tier: "common" },
    "dashring_1": { family: "dashring", n: 1, hue: "c0", size: 0.9, speed: 0.6, label: "\u041F\u0443\u043D\u043A\u0442\u0438\u0440 \xB7 \u043E\u0441\u043D\u043E\u0432\u043D\u043E\u0439", tier: "common" },
    "fountain_1": { family: "fountain", n: 8, hue: "c1", size: 1.25, speed: 0.9, label: "\u0424\u043E\u043D\u0442\u0430\u043D \xB7 \u0441\u0440\u0435\u0434\u043D\u0438\u0439", tier: "epic" },
    "fountain_2": { family: "fountain", n: 12, hue: "c2", size: 1.4, speed: 0.6, label: "\u0424\u043E\u043D\u0442\u0430\u043D \xB7 \u0442\u0451\u043C\u043D\u044B\u0439", tier: "legendary" },
    "fountain_3": { family: "fountain", n: 10, hue: "glow", size: 0.9, speed: 1.8, label: "\u0424\u043E\u043D\u0442\u0430\u043D \xB7 \u0441\u0432\u0435\u0447\u0435\u043D\u0438\u0435", tier: "divine" },
    "fountain_4": { family: "fountain", n: 14, hue: "c0", size: 1.1, speed: 1.3, label: "\u0424\u043E\u043D\u0442\u0430\u043D \xB7 \u043E\u0441\u043D\u043E\u0432\u043D\u043E\u0439", tier: "divine" },
    "hexgrid_1": { family: "hexgrid", n: 6, hue: "glow", size: 1.25, speed: 1.8, label: "\u0421\u043E\u0442\u044B \xB7 \u0441\u0432\u0435\u0447\u0435\u043D\u0438\u0435", tier: "divine" },
    "hexgrid_2": { family: "hexgrid", n: 8, hue: "c0", size: 1.4, speed: 1.3, label: "\u0421\u043E\u0442\u044B \xB7 \u043E\u0441\u043D\u043E\u0432\u043D\u043E\u0439", tier: "legendary" },
    "hexgrid_3": { family: "hexgrid", n: 10, hue: "c1", size: 0.9, speed: 0.9, label: "\u0421\u043E\u0442\u044B \xB7 \u0441\u0440\u0435\u0434\u043D\u0438\u0439", tier: "epic" },
    "hexgrid_4": { family: "hexgrid", n: 12, hue: "c2", size: 1.1, speed: 0.6, label: "\u0421\u043E\u0442\u044B \xB7 \u0442\u0451\u043C\u043D\u044B\u0439", tier: "epic" },
    "orbit_1": { family: "orbit", n: 3, hue: "c2", size: 0.9, speed: 1.3, label: "\u041E\u0440\u0431\u0438\u0442\u0430 \xB7 \u0442\u0451\u043C\u043D\u044B\u0439", tier: "rare" },
    "orbit_2": { family: "orbit", n: 4, hue: "glow", size: 1.1, speed: 0.9, label: "\u041E\u0440\u0431\u0438\u0442\u0430 \xB7 \u0441\u0432\u0435\u0447\u0435\u043D\u0438\u0435", tier: "rare" },
    "orbit_3": { family: "orbit", n: 5, hue: "c0", size: 1.25, speed: 0.6, label: "\u041E\u0440\u0431\u0438\u0442\u0430 \xB7 \u043E\u0441\u043D\u043E\u0432\u043D\u043E\u0439", tier: "rare" },
    "orbit_4": { family: "orbit", n: 6, hue: "c1", size: 1.4, speed: 1.8, label: "\u041E\u0440\u0431\u0438\u0442\u0430 \xB7 \u0441\u0440\u0435\u0434\u043D\u0438\u0439", tier: "divine" },
    "ringpulse_1": { family: "ringpulse", n: 5, hue: "glow", size: 1.25, speed: 1.8, label: "\u041A\u043E\u043B\u044C\u0446\u0430 \xB7 \u0441\u0432\u0435\u0447\u0435\u043D\u0438\u0435", tier: "legendary" },
    "ringpulse_2": { family: "ringpulse", n: 7, hue: "c0", size: 1.4, speed: 1.3, label: "\u041A\u043E\u043B\u044C\u0446\u0430 \xB7 \u043E\u0441\u043D\u043E\u0432\u043D\u043E\u0439", tier: "legendary" },
    "ringpulse_3": { family: "ringpulse", n: 6, hue: "c1", size: 0.9, speed: 0.9, label: "\u041A\u043E\u043B\u044C\u0446\u0430 \xB7 \u0441\u0440\u0435\u0434\u043D\u0438\u0439", tier: "rare" },
    "ringpulse_4": { family: "ringpulse", n: 9, hue: "c2", size: 1.1, speed: 0.6, label: "\u041A\u043E\u043B\u044C\u0446\u0430 \xB7 \u0442\u0451\u043C\u043D\u044B\u0439", tier: "epic" },
    "ripple_1": { family: "ripple", n: 2, hue: "c1", size: 1.25, speed: 0.9, label: "\u0420\u044F\u0431\u044C \xB7 \u0441\u0440\u0435\u0434\u043D\u0438\u0439", tier: "rare" },
    "ripple_2": { family: "ripple", n: 3, hue: "c2", size: 1.4, speed: 0.6, label: "\u0420\u044F\u0431\u044C \xB7 \u0442\u0451\u043C\u043D\u044B\u0439", tier: "common" },
    "ripple_3": { family: "ripple", n: 3, hue: "glow", size: 0.9, speed: 1.8, label: "\u0420\u044F\u0431\u044C \xB7 \u0441\u0432\u0435\u0447\u0435\u043D\u0438\u0435", tier: "epic" },
    "ripple_4": { family: "ripple", n: 4, hue: "c0", size: 1.1, speed: 1.3, label: "\u0420\u044F\u0431\u044C \xB7 \u043E\u0441\u043D\u043E\u0432\u043D\u043E\u0439", tier: "epic" },
    "spiral_1": { family: "spiral", n: 6, hue: "glow", size: 1.25, speed: 1.8, label: "\u0421\u043F\u0438\u0440\u0430\u043B\u044C \xB7 \u0441\u0432\u0435\u0447\u0435\u043D\u0438\u0435", tier: "divine" },
    "spiral_2": { family: "spiral", n: 8, hue: "c0", size: 1.4, speed: 1.3, label: "\u0421\u043F\u0438\u0440\u0430\u043B\u044C \xB7 \u043E\u0441\u043D\u043E\u0432\u043D\u043E\u0439", tier: "legendary" },
    "spiral_3": { family: "spiral", n: 10, hue: "c1", size: 0.9, speed: 0.9, label: "\u0421\u043F\u0438\u0440\u0430\u043B\u044C \xB7 \u0441\u0440\u0435\u0434\u043D\u0438\u0439", tier: "epic" },
    "spiral_4": { family: "spiral", n: 12, hue: "c2", size: 1.1, speed: 0.6, label: "\u0421\u043F\u0438\u0440\u0430\u043B\u044C \xB7 \u0442\u0451\u043C\u043D\u044B\u0439", tier: "epic" },
    "stars_1": { family: "stars", n: 4, hue: "c0", size: 0.9, speed: 0.6, label: "\u0417\u0432\u0451\u0437\u0434\u043E\u0447\u043A\u0438 \xB7 \u043E\u0441\u043D\u043E\u0432\u043D\u043E\u0439", tier: "common" },
    "stars_2": { family: "stars", n: 5, hue: "c1", size: 1.1, speed: 1.8, label: "\u0417\u0432\u0451\u0437\u0434\u043E\u0447\u043A\u0438 \xB7 \u0441\u0440\u0435\u0434\u043D\u0438\u0439", tier: "legendary" },
    "stars_3": { family: "stars", n: 6, hue: "c2", size: 1.25, speed: 1.3, label: "\u0417\u0432\u0451\u0437\u0434\u043E\u0447\u043A\u0438 \xB7 \u0442\u0451\u043C\u043D\u044B\u0439", tier: "legendary" },
    "stars_4": { family: "stars", n: 8, hue: "glow", size: 1.4, speed: 1.8, label: "\u0417\u0432\u0451\u0437\u0434\u043E\u0447\u043A\u0438 \xB7 \u0441\u0432\u0435\u0447\u0435\u043D\u0438\u0435", tier: "divine" },
    "wave_1": { family: "wave", n: 3, hue: "c2", size: 0.9, speed: 1.3, label: "\u0412\u043E\u043B\u043D\u0430 \xB7 \u0442\u0451\u043C\u043D\u044B\u0439", tier: "rare" },
    "wave_2": { family: "wave", n: 4, hue: "glow", size: 1.1, speed: 0.9, label: "\u0412\u043E\u043B\u043D\u0430 \xB7 \u0441\u0432\u0435\u0447\u0435\u043D\u0438\u0435", tier: "rare" },
    "wave_3": { family: "wave", n: 5, hue: "c0", size: 1.25, speed: 0.6, label: "\u0412\u043E\u043B\u043D\u0430 \xB7 \u043E\u0441\u043D\u043E\u0432\u043D\u043E\u0439", tier: "rare" },
    "wave_4": { family: "wave", n: 6, hue: "c1", size: 1.4, speed: 1.8, label: "\u0412\u043E\u043B\u043D\u0430 \xB7 \u0441\u0440\u0435\u0434\u043D\u0438\u0439", tier: "divine" }
  };
  var FX_KEYS = Object.keys(FX_SPECS);
  var FX_LABELS = Object.fromEntries(FX_KEYS.map((k) => [k, FX_SPECS[k].label]));
  var TAU = Math.PI * 2;
  function colorOf(look, h) {
    if (h === "glow") return look.glow;
    return look.colors[Number(h[1])];
  }
  function rnd(n) {
    const s = Math.sin(n * 127.1 + 311.7) * 43758.5453;
    return s - Math.floor(s);
  }
  function drawModernFx(c, key, cx, cy, r, look, t) {
    const spec = FX_SPECS[key];
    if (!spec) return;
    const k = r / 24;
    const z = spec.size;
    const col = colorOf(look, spec.hue);
    const sp = spec.speed;
    const n = spec.n;
    c.save();
    c.strokeStyle = col;
    c.fillStyle = col;
    c.lineCap = "round";
    switch (spec.family) {
      case "burst": {
        for (let i = 0; i < n; i++) {
          const a = i / n * TAU;
          const p = (t * sp * 0.6 + i / n) % 1;
          const r0 = r + 2 * k, r1 = r0 + (4 + 10 * p) * z * k;
          c.globalAlpha = 1 - p;
          c.lineWidth = 1.6 * z * k;
          c.beginPath();
          c.moveTo(cx + Math.cos(a) * r0, cy + Math.sin(a) * r0);
          c.lineTo(cx + Math.cos(a) * r1, cy + Math.sin(a) * r1);
          c.stroke();
        }
        break;
      }
      case "ripple": {
        for (let i = 0; i < n; i++) {
          const p = (t * sp * 0.35 + i / n) % 1;
          c.globalAlpha = (1 - p) * 0.9;
          c.lineWidth = (1.4 - p * 0.9) * z * k;
          c.beginPath();
          c.arc(cx, cy, r + p * 16 * z * k, 0, TAU);
          c.stroke();
        }
        break;
      }
      case "wave": {
        c.globalAlpha = 0.9;
        c.lineWidth = 1.3 * z * k;
        c.beginPath();
        for (let j = 0; j <= 72; j++) {
          const a = j / 72 * TAU;
          const rad = r + (3 + 2.5 * Math.sin(a * n + t * sp * 4)) * z * k;
          const x = cx + Math.cos(a) * rad, y = cy + Math.sin(a) * rad;
          if (j === 0) c.moveTo(x, y);
          else c.lineTo(x, y);
        }
        c.closePath();
        c.stroke();
        break;
      }
      case "spiral": {
        for (let i = 0; i < n; i++) {
          const p = (t * sp * 0.25 + i / n) % 1;
          const a = t * sp * 2 + p * TAU * 2;
          const rad = r + (2 + 12 * (1 - p)) * z * k;
          c.globalAlpha = 0.3 + 0.7 * p;
          c.beginPath();
          c.arc(cx + Math.cos(a) * rad, cy + Math.sin(a) * rad, (0.8 + 1.2 * p) * z * k, 0, TAU);
          c.fill();
        }
        break;
      }
      case "bolt": {
        const step = Math.floor(t * sp * 6);
        for (let i = 0; i < n; i++) {
          if (rnd(step * 7 + i) < 0.5) continue;
          const a0 = i / n * TAU + rnd(step + i) * 0.3;
          const a1 = a0 + 0.3 + rnd(step * 3 + i) * 0.3;
          c.globalAlpha = 1;
          c.lineWidth = 1.2 * z * k;
          c.beginPath();
          for (let j = 0; j <= 5; j++) {
            const f = j / 5;
            const a = a0 + (a1 - a0) * f;
            const off = j > 0 && j < 5 ? (rnd(step * 13 + i * 5 + j) - 0.5) * 8 * k : 0;
            const rad = r + 4 * k + off;
            const x = cx + Math.cos(a) * rad, y = cy + Math.sin(a) * rad;
            if (j === 0) c.moveTo(x, y);
            else c.lineTo(x, y);
          }
          c.stroke();
        }
        break;
      }
      case "fountain": {
        for (let i = 0; i < n; i++) {
          const p = (t * sp * 0.5 + i / n) % 1;
          const bx = cx + (rnd(i * 3 + 1) - 0.5) * r * 1.2;
          const by = cy + r * 0.9;
          const x = bx + (rnd(i * 5 + 2) - 0.5) * r * 0.6 * p;
          const y = by - p * r * 1.9;
          c.globalAlpha = 1 - p * 0.8;
          c.beginPath();
          c.arc(x, y, (1.2 + 0.6 * (1 - p)) * z * k, 0, TAU);
          c.fill();
        }
        break;
      }
      case "beam": {
        const h = 0.16;
        c.globalAlpha = 0.35;
        for (let i = 0; i < n; i++) {
          const a = t * sp * 1.2 + i / n * TAU;
          const rr = r + 14 * z * k;
          c.beginPath();
          c.moveTo(cx + Math.cos(a - h) * r, cy + Math.sin(a - h) * r);
          c.lineTo(cx + Math.cos(a - h) * rr, cy + Math.sin(a - h) * rr);
          c.lineTo(cx + Math.cos(a + h) * rr, cy + Math.sin(a + h) * rr);
          c.lineTo(cx + Math.cos(a + h) * r, cy + Math.sin(a + h) * r);
          c.closePath();
          c.fill();
        }
        break;
      }
      case "hexgrid": {
        for (let i = 0; i < n; i++) {
          const a = i / n * TAU + t * sp * 0.2;
          const s = (0.7 + 0.3 * Math.sin(t * sp * 3 + i)) * 2.2 * z * k;
          const x = cx + Math.cos(a) * (r + 4 * k), y = cy + Math.sin(a) * (r + 4 * k);
          c.globalAlpha = 0.85;
          c.lineWidth = 1 * z * k;
          c.beginPath();
          for (let j = 0; j < 6; j++) {
            const aa = j * Math.PI / 3;
            const px = x + Math.cos(aa) * s, py = y + Math.sin(aa) * s;
            if (j === 0) c.moveTo(px, py);
            else c.lineTo(px, py);
          }
          c.closePath();
          c.stroke();
        }
        break;
      }
      case "stars": {
        for (let i = 0; i < n; i++) {
          const a = i / n * TAU;
          const x = cx + Math.cos(a) * (r + 5 * k), y = cy + Math.sin(a) * (r + 5 * k);
          const s = (0.4 + 0.6 * Math.abs(Math.sin(t * sp * 2 + i))) * 2.4 * z * k;
          c.lineWidth = 0.8 * z * k;
          c.beginPath();
          c.moveTo(x - s, y);
          c.lineTo(x + s, y);
          c.moveTo(x, y - s);
          c.lineTo(x, y + s);
          c.stroke();
        }
        break;
      }
      case "firefly": {
        for (let i = 0; i < n; i++) {
          const a = t * sp * 0.45 + i / n * TAU + Math.sin(t * sp * 1.2 + i) * 0.28;
          const rad = r + (4 + 5.5 * rnd(i + 9) + 2.2 * Math.sin(t * sp * 1.7 + i)) * z * k;
          const x = cx + Math.cos(a) * rad;
          const y = cy + Math.sin(a) * rad;
          const blink = 0.5 + 0.5 * Math.sin(t * sp * 3.1 + i * 1.7);
          c.globalAlpha = 0.3 + 0.55 * blink;
          c.beginPath();
          c.arc(x, y, (1.0 + 0.9 * z) * k, 0, TAU);
          c.fill();
          c.globalAlpha = 0.08 + 0.16 * blink;
          c.beginPath();
          c.arc(x, y, (2.8 + 1.4 * z) * k, 0, TAU);
          c.fill();
        }
        break;
      }
      case "orbit": {
        c.globalAlpha = 0.3;
        c.lineWidth = 0.9 * z * k;
        c.beginPath();
        c.arc(cx, cy, r + 7 * z * k, 0, TAU);
        c.stroke();
        for (let i = 0; i < n; i++) {
          const a = t * sp * 0.9 + i / n * TAU;
          const rad = r + (6 + 2.2 * Math.sin(t * sp * 2 + i)) * z * k;
          c.globalAlpha = 0.5 + 0.35 * Math.sin(t * sp * 2.6 + i);
          c.beginPath();
          c.arc(cx + Math.cos(a) * rad, cy + Math.sin(a) * rad, (1.1 + 0.55 * z) * k, 0, TAU);
          c.fill();
        }
        break;
      }
      case "ringpulse": {
        for (let i = 0; i < n; i++) {
          const p = (t * sp * 0.22 + i / n) % 1;
          c.globalAlpha = (1 - p) * 0.75;
          c.lineWidth = (2.2 - p * 1.5) * z * k;
          c.beginPath();
          c.arc(cx, cy, r + (2 + p * 13) * z * k, 0, TAU);
          c.stroke();
        }
        break;
      }
      case "dashring": {
        c.setLineDash([3 * k * z, 3 * k * z]);
        c.lineDashOffset = -t * sp * 12 * k;
        c.lineWidth = 1.6 * z * k;
        c.beginPath();
        c.arc(cx, cy, r + 4 * k, 0, TAU);
        c.stroke();
        c.setLineDash([]);
        c.lineDashOffset = 0;
        break;
      }
    }
    c.restore();
  }

