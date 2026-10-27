// Десять вариантов внешнего вида пружинных платформ — только для превью.
// Вставляется в копию index.html на время съёмки, игра их не видит.
//
//   node tools/shot.js --tabs=play --springs=1 --width=760 --height=1140 --scale=2
const VARIANTS = [
  ["1. Спираль", "Стальная пружина под платформой"],
  ["2. Гофра", "Резиновый поршень с рёбрами"],
  ["3. Ледяной бутон", "Три лепестка изо льда"],
  ["4. Кристалл", "Светящийся кристалл-опора"],
  ["5. Ножницы", "Х-образный шарнир"],
  ["6. Батут", "Натянутая ткань на стойках"],
  ["7. Рессора", "Листовая пружина из дуг"],
  ["8. Кольца", "Три тора с бликами"],
  ["9. Подушка", "Пневмо-баллон с клапаном"],
  ["10. Магнит", "Левитация на кольцах"],
];

function block() {
  return String.raw`
  // --- превью пружин: только в копии для снимков ---
  function __rr(c, x, y, w, h, r) {
    const rr = Math.min(r, w / 2, h / 2);
    c.beginPath();
    c.moveTo(x + rr, y);
    c.lineTo(x + w - rr, y);
    c.quadraticCurveTo(x + w, y, x + w, y + rr);
    c.lineTo(x + w, y + h - rr);
    c.quadraticCurveTo(x + w, y + h, x + w - rr, y + h);
    c.lineTo(x + rr, y + h);
    c.quadraticCurveTo(x, y + h, x, y + h - rr);
    c.lineTo(x, y + rr);
    c.quadraticCurveTo(x, y, x + rr, y);
    c.closePath();
  }
  function __springBody(c, x, y, w, h) {
    const g = c.createLinearGradient(0, y, 0, y + h);
    g.addColorStop(0, "#eaf8ff");
    g.addColorStop(0.45, "#bfe3f3");
    g.addColorStop(1, "#8fbdd4");
    __rr(c, x, y, w, h, h / 2);
    c.fillStyle = g;
    c.fill();
    c.strokeStyle = "rgba(23,63,84,.45)";
    c.lineWidth = 1;
    c.stroke();
    c.fillStyle = "rgba(255,255,255,.95)";
    __rr(c, x + 4, y + 1.6, w - 8, 2.4, 1.2);
    c.fill();
  }
  function __springPreview(c, v, x, y, w, h) {
    const cx = x + w / 2;
    const baseY = y + h - 2;
    c.save();
    if (v === 1) {
      __springBody(c, x, y, w, h);
      const coils = 5;
      for (let i = 0; i < coils; i++) {
        const cy = baseY + 10 + i * 7;
        c.strokeStyle = i % 2 ? "#cfdbe4" : "#8fa6b6";
        c.lineWidth = 2.4;
        c.beginPath();
        c.ellipse(cx, cy, w * 0.3 - i * 0.8, 3.4, 0, 0, Math.PI * 2);
        c.stroke();
      }
      c.fillStyle = "rgba(15,61,92,.18)";
      __rr(c, cx - w * 0.3, baseY + 44, w * 0.6, 4, 2);
      c.fill();
    } else if (v === 2) {
      __springBody(c, x, y, w, h);
      c.beginPath();
      c.moveTo(cx - w * 0.22, baseY + 4);
      for (let i = 0; i < 7; i++) {
        const yy = baseY + 4 + i * 6;
        c.lineTo(cx + (i % 2 ? w * 0.2 : -w * 0.2), yy);
      }
      c.lineTo(cx + w * 0.22, baseY + 48);
      c.lineTo(cx - w * 0.22, baseY + 48);
      c.closePath();
      const g = c.createLinearGradient(cx - w * 0.22, 0, cx + w * 0.22, 0);
      g.addColorStop(0, "#5f7f92");
      g.addColorStop(0.45, "#a9c4d4");
      g.addColorStop(1, "#5f7f92");
      c.fillStyle = g;
      c.fill();
      c.strokeStyle = "rgba(15,61,92,.3)";
      c.lineWidth = 0.8;
      c.stroke();
    } else if (v === 3) {
      __springBody(c, x, y, w, h);
      for (let i = 0; i < 3; i++) {
        const px = cx + (i - 1) * w * 0.24;
        c.beginPath();
        c.moveTo(px - 7, baseY + 4);
        c.lineTo(px + 1, baseY + 30);
        c.lineTo(px + 7, baseY + 4);
        c.closePath();
        const g = c.createLinearGradient(px - 7, 0, px + 7, 0);
        g.addColorStop(0, "#e8fbff");
        g.addColorStop(0.5, "#a8dcf2");
        g.addColorStop(1, "#5aa2c4");
        c.fillStyle = g;
        c.fill();
        c.strokeStyle = "rgba(255,255,255,.75)";
        c.lineWidth = 0.8;
        c.stroke();
      }
    } else if (v === 4) {
      __springBody(c, x, y, w, h);
      const glow = c.createRadialGradient(cx, baseY + 24, 2, cx, baseY + 24, 28);
      glow.addColorStop(0, "rgba(120,226,255,.5)");
      glow.addColorStop(1, "rgba(120,226,255,0)");
      c.fillStyle = glow;
      c.beginPath();
      c.arc(cx, baseY + 24, 28, 0, Math.PI * 2);
      c.fill();
      c.beginPath();
      c.moveTo(cx, baseY + 2);
      c.lineTo(cx + 14, baseY + 24);
      c.lineTo(cx, baseY + 46);
      c.lineTo(cx - 14, baseY + 24);
      c.closePath();
      const g = c.createLinearGradient(cx - 14, 0, cx + 14, 0);
      g.addColorStop(0, "#ffffff");
      g.addColorStop(0.5, "#b6ecff");
      g.addColorStop(1, "#4fb8dd");
      c.fillStyle = g;
      c.fill();
      c.strokeStyle = "rgba(255,255,255,.85)";
      c.lineWidth = 0.9;
      c.stroke();
    } else if (v === 5) {
      __springBody(c, x, y, w, h);
      c.strokeStyle = "#8fa6b6";
      c.lineWidth = 4;
      c.lineCap = "round";
      c.beginPath();
      c.moveTo(cx - w * 0.26, baseY + 4);
      c.lineTo(cx + w * 0.26, baseY + 40);
      c.moveTo(cx + w * 0.26, baseY + 4);
      c.lineTo(cx - w * 0.26, baseY + 40);
      c.stroke();
      c.fillStyle = "#f0b429";
      c.beginPath();
      c.arc(cx, baseY + 22, 3.4, 0, Math.PI * 2);
      c.fill();
      c.lineCap = "butt";
    } else if (v === 6) {
      __springBody(c, x, y, w, h);
      c.strokeStyle = "rgba(15,61,92,.5)";
      c.lineWidth = 1.6;
      c.beginPath();
      c.moveTo(cx - w * 0.3, baseY + 6);
      c.quadraticCurveTo(cx, baseY + 30, cx + w * 0.3, baseY + 6);
      c.stroke();
      c.fillStyle = "#7fd3f0";
      c.beginPath();
      c.moveTo(cx - w * 0.3, baseY + 6);
      c.quadraticCurveTo(cx, baseY + 26, cx + w * 0.3, baseY + 6);
      c.quadraticCurveTo(cx, baseY + 16, cx - w * 0.3, baseY + 6);
      c.fill();
      c.strokeStyle = "#b9cbd7";
      c.lineWidth = 2;
      c.beginPath();
      c.moveTo(cx - w * 0.3, baseY + 6);
      c.lineTo(cx - w * 0.3, baseY + 34);
      c.moveTo(cx + w * 0.3, baseY + 6);
      c.lineTo(cx + w * 0.3, baseY + 34);
      c.stroke();
    } else if (v === 7) {
      __springBody(c, x, y, w, h);
      for (let i = 0; i < 3; i++) {
        c.strokeStyle = i === 0 ? "#c6d5df" : "#93aab9";
        c.lineWidth = 3;
        c.beginPath();
        c.arc(cx, baseY + 34 + i * 6, w * 0.26, Math.PI * 1.15, Math.PI * 1.85);
        c.stroke();
      }
    } else if (v === 8) {
      __springBody(c, x, y, w, h);
      for (let i = 0; i < 3; i++) {
        const cy = baseY + 12 + i * 12;
        c.strokeStyle = i === 1 ? "#8fa6b6" : "#b9cbd7";
        c.lineWidth = 4;
        c.beginPath();
        c.ellipse(cx, cy, w * 0.24, 4, 0, 0, Math.PI * 2);
        c.stroke();
        c.strokeStyle = "rgba(255,255,255,.9)";
        c.lineWidth = 1.2;
        c.beginPath();
        c.ellipse(cx, cy - 1.2, w * 0.2, 2.4, 0, Math.PI * 1.1, Math.PI * 1.9);
        c.stroke();
      }
    } else if (v === 9) {
      __springBody(c, x, y, w, h);
      const g = c.createRadialGradient(cx - 6, baseY + 18, 2, cx, baseY + 24, 26);
      g.addColorStop(0, "#e9f8ff");
      g.addColorStop(0.6, "#9dd0e6");
      g.addColorStop(1, "#4f92b4");
      c.fillStyle = g;
      c.beginPath();
      c.ellipse(cx, baseY + 24, 20, 17, 0, 0, Math.PI * 2);
      c.fill();
      c.strokeStyle = "rgba(255,255,255,.7)";
      c.lineWidth = 1.1;
      c.beginPath();
      c.ellipse(cx, baseY + 24, 13, 10, 0, Math.PI * 1.15, Math.PI * 1.8);
      c.stroke();
      c.fillStyle = "#f0b429";
      __rr(c, cx + 12, baseY + 10, 7, 4, 2);
      c.fill();
    } else {
      __springBody(c, x, y, w, h);
      for (let i = 0; i < 3; i++) {
        const cy = baseY + 8 + i * 13;
        c.strokeStyle = "rgba(120,226,255," + (0.85 - i * 0.2) + ")";
        c.lineWidth = 2.4;
        c.beginPath();
        c.ellipse(cx, cy, w * 0.2, 3.4, 0, 0, Math.PI * 2);
        c.stroke();
      }
      const glow = c.createRadialGradient(cx, baseY + 22, 1, cx, baseY + 22, 30);
      glow.addColorStop(0, "rgba(120,226,255,.35)");
      glow.addColorStop(1, "rgba(120,226,255,0)");
      c.fillStyle = glow;
      c.beginPath();
      c.arc(cx, baseY + 22, 30, 0, Math.PI * 2);
      c.fill();
      for (let i = 0; i < 4; i++) {
        const a = performance.now() / 900 + i * 1.7;
        c.fillStyle = "rgba(255,255,255,.9)";
        c.beginPath();
        c.arc(cx + Math.cos(a) * 22, baseY + 22 + Math.sin(a) * 16, 1.2, 0, Math.PI * 2);
        c.fill();
      }
    }
    c.restore();
  }
  function __drawSpringSheet(c, width, height) {
    c.save();
    c.fillStyle = "#0e1b34";
    c.fillRect(0, 0, width, height);
    c.textAlign = "center";
    c.textBaseline = "middle";
    c.fillStyle = "rgba(180,214,238,.75)";
    c.font = "bold 7px system-ui, sans-serif";
    c.fillText("ВАРИАНТЫ ПРУЖИН", width / 2, 12);
    const labels = ${JSON.stringify(VARIANTS)};
    const cellW = 180, cellH = 108, gapX = 12, gapY = 6;
    const startX = (width - (cellW * 2 + gapX)) / 2;
    for (let i = 0; i < 10; i++) {
      const col = i % 2;
      const row = Math.floor(i / 2);
      const x = startX + col * (cellW + gapX);
      const y = 26 + row * (cellH + gapY);
      __rr(c, x, y, cellW, cellH, 8);
      c.fillStyle = "rgba(255,255,255,.05)";
      c.fill();
      c.strokeStyle = "rgba(140,200,230,.16)";
      c.lineWidth = 0.8;
      c.stroke();
      __springPreview(c, i + 1, x + 30, y + 12, cellW - 60, 16);
      c.fillStyle = "rgba(226,244,255,.95)";
      c.font = "bold 6.5px system-ui, sans-serif";
      c.fillText(labels[i][0], x + cellW / 2, y + 92);
      c.fillStyle = "rgba(150,192,216,.7)";
      c.font = "5.4px system-ui, sans-serif";
      c.fillText(labels[i][1], x + cellW / 2, y + 100);
    }
    c.restore();
  }
  try {
    if ((location.hash || "").indexOf("springs=1") >= 0) {
      setTimeout(function () {
        try {
          var cv = document.createElement("canvas");
          cv.width = 800;
          cv.height = 1200;
          cv.style.cssText = "position:fixed;left:50%;top:50%;transform:translate(-50%,-50%);" +
            "width:400px;height:600px;z-index:99999;background:#0e1b34;border-radius:14px";
          document.body.appendChild(cv);
          var c = cv.getContext("2d");
          c.scale(2, 2);
          __drawSpringSheet(c, 400, 600);
        } catch (e) {}
      }, 500);
    }
  } catch (e) {}
  `;
}

module.exports = { block, VARIANTS };
