import { Application, Graphics, Sprite, Texture } from "pixi.js";
import { fieldLayout, ringPhase, polePulse } from "./layout.ts";
import type { FieldPole, FieldRing } from "./layout.ts";
import type { Scene } from "./scene";

/**
 * Тот же кадр, но idiomatic-Pixi: всё, что повторяется, запечено в текстуры и
 * рисуется спрайтами. Спрайты с одной текстурой Pixi склеивает в один батч,
 * поэтому число платформ почти не влияет на число дравколлов.
 *
 * Первая версия рисовала каждое кольцо отдельным Graphics: на 30 платформах это
 * ~400 дравколлов и 53 мс на кадр против 1.2 мс у canvas.
 */

export type PixiScene = {
  app: Application;
  tick: (t: number) => void;
  render: () => void;
  destroy: () => void;
};

type Ring = { sprite: Sprite; ring: FieldRing };
type Pole = { sprite: Sprite; pole: FieldPole };

function bakeCanvas(width: number, height: number, paint: (g: CanvasRenderingContext2D) => void): Texture {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const g = canvas.getContext("2d");
  if (g) paint(g);
  return Texture.from(canvas);
}

function skyTexture(): Texture {
  return bakeCanvas(64, 256, (g) => {
    const grad = g.createLinearGradient(0, 0, 0, 256);
    grad.addColorStop(0, "#eaf7ff");
    grad.addColorStop(1, "#cfe8f7");
    g.fillStyle = grad;
    g.fillRect(0, 0, 64, 256);
  });
}

function platformTexture(): Texture {
  return bakeCanvas(200, 16, (g) => {
    g.beginPath();
    g.roundRect(0, 2, 200, 14, 7);
    const body = g.createLinearGradient(0, 2, 0, 16);
    body.addColorStop(0, "#eaf7ff");
    body.addColorStop(0.55, "#b6d7e8");
    body.addColorStop(1, "#8fbdd4");
    g.fillStyle = body;
    g.fill();
    g.strokeStyle = "rgba(23,63,84,.5)";
    g.lineWidth = 1.4;
    g.stroke();
    g.save();
    g.beginPath();
    g.roundRect(0, 2, 200, 14, 7);
    g.clip();
    g.fillStyle = "rgba(255,255,255,.92)";
    g.fillRect(0, 1, 200, 5);
    g.restore();
  });
}

function ringTexture(): Texture {
  return bakeCanvas(32, 12, (g) => {
    g.beginPath();
    g.ellipse(16, 6, 14, 3, 0, 0, Math.PI * 2);
    g.strokeStyle = "rgba(150,240,255,1)";
    g.lineWidth = 1.4;
    g.stroke();
  });
}

function glowTexture(): Texture {
  return bakeCanvas(64, 64, (g) => {
    const grad = g.createRadialGradient(32, 32, 1, 32, 32, 32);
    grad.addColorStop(0, "rgba(122,226,255,.34)");
    grad.addColorStop(0.55, "rgba(122,226,255,.12)");
    grad.addColorStop(1, "rgba(122,226,255,0)");
    g.fillStyle = grad;
    g.fillRect(0, 0, 64, 64);
  });
}

function poleTexture(): Texture {
  return bakeCanvas(32, 32, (g) => {
    const grad = g.createRadialGradient(16, 16, 0.5, 16, 16, 16);
    grad.addColorStop(0, "rgba(232,254,255,1)");
    grad.addColorStop(0.35, "rgba(160,240,255,.65)");
    grad.addColorStop(1, "rgba(122,226,255,0)");
    g.fillStyle = grad;
    g.fillRect(0, 0, 32, 32);
  });
}

function snowTexture(): Texture {
  return bakeCanvas(8, 8, (g) => {
    g.fillStyle = "rgba(255,255,255,.9)";
    g.beginPath();
    g.arc(4, 4, 3.4, 0, Math.PI * 2);
    g.fill();
  });
}

function mountainTexture(): Texture {
  return bakeCanvas(140, 92, (g) => {
    g.beginPath();
    g.moveTo(0, 92);
    g.lineTo(70, 2);
    g.lineTo(140, 92);
    g.closePath();
    g.fillStyle = "rgba(176,214,236,.55)";
    g.fill();
  });
}

export async function createPixiScene(host: HTMLElement, scene: Scene): Promise<PixiScene> {
  const app = new Application();
  await app.init({
    width: scene.width,
    height: scene.height,
    backgroundAlpha: 1,
    antialias: true,
    resolution: 1,
    autoDensity: false,
    preference: "webgl",
  });
  host.appendChild(app.canvas);

  const sky = new Sprite(skyTexture());
  sky.width = scene.width;
  sky.height = scene.height;
  app.stage.addChild(sky);

  const mountainTex = mountainTexture();
  for (let i = 0; i < 3; i++) {
    const node = new Sprite(mountainTex);
    node.position.set(40 + i * 130, scene.height - 120 + i * 22 - 92);
    app.stage.addChild(node);
  }

  const platformTex = platformTexture();
  const ringTex = ringTexture();
  const glowTex = glowTexture();
  const poleTex = poleTexture();

  const rings: Ring[] = [];
  const poles: Pole[] = [];

  for (const p of scene.platforms) {
    const body = new Sprite(platformTex);
    body.position.set(p.x, p.y);
    body.width = p.w;
    body.height = p.h + 2;
    app.stage.addChild(body);

    if (!p.spring) continue;

    const glow = new Sprite(glowTex);
    glow.anchor.set(0.5);
    glow.position.set(p.x + p.w / 2, p.y + p.h / 2);
    glow.width = p.w * 1.5;
    glow.height = p.h * 7;
    app.stage.addChild(glow);

    const layout = fieldLayout(p);
    for (const ring of layout.rings) {
      const sprite = new Sprite(ringTex);
      sprite.anchor.set(0.5);
      sprite.position.set(ring.x, ring.baseY);
      // Текстура кольца нарисована с радиусом 14 — масштабируем под нужный.
      sprite.width = ring.rx * 2.29;
      sprite.height = 7;
      app.stage.addChild(sprite);
      rings.push({ sprite, ring });
    }

    for (const pole of layout.poles) {
      const sprite = new Sprite(poleTex);
      sprite.anchor.set(0.5);
      sprite.position.set(pole.x, pole.y);
      sprite.width = 18;
      sprite.height = 18;
      app.stage.addChild(sprite);
      poles.push({ sprite, pole });
    }
  }

  const player = new Graphics();
  player.circle(0, 0, scene.player.r).fill({ color: 0x0e263c, alpha: 0.92 });
  player.circle(0, 0, scene.player.r - 5).fill({ color: 0xf0c9a8, alpha: 1 });
  player.position.set(scene.player.x, scene.player.y);
  app.stage.addChild(player);

  const flakeTex = snowTexture();
  const flakes = scene.flakes.map((f) => {
    const sprite = new Sprite(flakeTex);
    sprite.anchor.set(0.5);
    sprite.scale.set(f.r / 3.4);
    sprite.alpha = 0.85;
    app.stage.addChild(sprite);
    return { sprite, flake: f };
  });

  const tick = (t: number): void => {
    for (const r of rings) {
      const phase = ringPhase(t, r.ring);
      r.sprite.position.y = r.ring.baseY - phase * 11;
      r.sprite.alpha = Math.max(0, (1 - phase) * 0.8);
    }
    for (const p of poles) {
      p.sprite.alpha = polePulse(t, p.pole.side);
    }
    for (const f of flakes) {
      const y = (f.flake.y + t * f.flake.speed) % scene.height;
      const x = (f.flake.x + Math.sin(t * 0.6 + f.flake.y) * f.flake.drift + scene.width) % scene.width;
      f.sprite.position.set(x, y);
    }
  };

  return {
    app,
    tick,
    render: () => app.renderer.render(app.stage),
    destroy: () => app.destroy(true, { children: true }),
  };
}
