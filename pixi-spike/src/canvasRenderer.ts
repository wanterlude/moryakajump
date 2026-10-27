import { fieldLayout, ringPhase, polePulse } from "./layout.ts";
import type { Platform, Scene } from "./scene";

/** Текущий подход: immediate-mode Canvas 2D, как в index.html. */

function platformBody(ctx: CanvasRenderingContext2D, p: Platform): void {
  const body = ctx.createLinearGradient(0, p.y, 0, p.y + p.h);
  body.addColorStop(0, "#eaf7ff");
  body.addColorStop(0.55, "#b6d7e8");
  body.addColorStop(1, "#8fbdd4");
  ctx.beginPath();
  ctx.roundRect(p.x, p.y + 2, p.w, p.h - 1, 7);
  ctx.fillStyle = body;
  ctx.fill();
  ctx.strokeStyle = "rgba(23,63,84,.5)";
  ctx.lineWidth = 1.4;
  ctx.stroke();

  ctx.save();
  ctx.beginPath();
  ctx.roundRect(p.x, p.y + 2, p.w, p.h - 1, 7);
  ctx.clip();
  ctx.fillStyle = "rgba(255,255,255,.92)";
  ctx.fillRect(p.x, p.y + 1, p.w, 5);
  ctx.restore();

  ctx.fillStyle = "rgba(255,255,255,.22)";
  ctx.beginPath();
  ctx.roundRect(p.x + 3, p.y + p.h - 4, p.w - 6, 2.4, 1.2);
  ctx.fill();
}

function magnetField(ctx: CanvasRenderingContext2D, p: Platform, t: number): void {
  const w = p.w;
  const cx = p.x + w / 2;
  const cy = p.y + p.h / 2;

  ctx.save();
  const glow = ctx.createRadialGradient(cx, cy, 1, cx, cy, w * 0.62);
  glow.addColorStop(0, "rgba(122,226,255,.26)");
  glow.addColorStop(0.55, "rgba(122,226,255,.09)");
  glow.addColorStop(1, "rgba(122,226,255,0)");
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.ellipse(cx, cy, w * 0.62, p.h * 3.1, 0, 0, Math.PI * 2);
  ctx.fill();

  // Геометрия — из общей раскладки, той же, что использует Pixi-рендерер.
  const layout = fieldLayout(p);
  for (const ring of layout.rings) {
    const phase = ringPhase(t, ring);
    const alpha = (1 - phase) * 0.8;
    if (alpha <= 0.03) continue;
    ctx.globalAlpha = alpha;
    ctx.strokeStyle = "rgba(150,240,255,1)";
    ctx.lineWidth = 1.5 - phase * 0.7;
    ctx.beginPath();
    ctx.ellipse(ring.x, ring.baseY - phase * 11, ring.rx, 2.2 + phase * 1.2, 0, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;

  for (const pole of layout.poles) {
    const pulse = polePulse(t, pole.side);
    const gradient = ctx.createRadialGradient(pole.x, pole.y, 0.5, pole.x, pole.y, 9);
    gradient.addColorStop(0, `rgba(190,248,255,${(0.85 * pulse).toFixed(2)})`);
    gradient.addColorStop(1, "rgba(120,226,255,0)");
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(pole.x, pole.y, 9, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

export function drawCanvasScene(
  ctx: CanvasRenderingContext2D,
  scene: Scene,
  t: number
): void {
  const sky = ctx.createLinearGradient(0, 0, 0, scene.height);
  sky.addColorStop(0, "#eaf7ff");
  sky.addColorStop(1, "#cfe8f7");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, scene.width, scene.height);

  ctx.fillStyle = "rgba(176,214,236,.55)";
  for (let i = 0; i < 3; i++) {
    const bx = 40 + i * 130;
    const by = scene.height - 120 + i * 22;
    ctx.beginPath();
    ctx.moveTo(bx, by);
    ctx.lineTo(bx + 70, by - 90);
    ctx.lineTo(bx + 140, by);
    ctx.closePath();
    ctx.fill();
  }

  for (const p of scene.platforms) {
    platformBody(ctx, p);
    if (p.spring) magnetField(ctx, p, t);
  }

  const { player } = scene;
  ctx.fillStyle = "rgba(14,38,60,.92)";
  ctx.beginPath();
  ctx.arc(player.x, player.y, player.r, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#f0c9a8";
  ctx.beginPath();
  ctx.arc(player.x, player.y, player.r - 5, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "rgba(255,255,255,.85)";
  for (const f of scene.flakes) {
    const y = (f.y + t * f.speed) % scene.height;
    const x = (f.x + Math.sin(t * 0.6 + f.y) * f.drift + scene.width) % scene.width;
    ctx.beginPath();
    ctx.arc(x, y, f.r, 0, Math.PI * 2);
    ctx.fill();
  }
}
