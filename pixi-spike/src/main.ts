import { drawCanvasScene } from "./canvasRenderer";
import { createPixiScene } from "./pixiRenderer";
import { makeScene } from "./scene";

const W = 400;
const H = 600;
const FRAMES = 180;

const out = document.getElementById("out") as HTMLPreElement;
const canvas = document.getElementById("cv") as HTMLCanvasElement;
const host = document.getElementById("pixi") as HTMLDivElement;

function lines(rows: string[]): void {
  out.textContent = rows.join("\n");
}

function frameTime(run: (t: number) => void, frames: number): number {
  const started = performance.now();
  for (let i = 0; i < frames; i++) run(i / 60);
  return (performance.now() - started) / frames;
}

async function main(): Promise<void> {
  const params = new URLSearchParams(location.search);
  const scene = makeScene(W, H, {
    platforms: Number(params.get("platforms") ?? 6),
    flakes: Number(params.get("flakes") ?? 140),
  });

  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("нет 2d-контекста");

  // Прогрев: первый кадр у Pixi компилирует шейдеры, его нельзя мерить.
  drawCanvasScene(ctx, scene, 0);
  let pixi;
  try {
    pixi = await createPixiScene(host, scene);
  } catch (error) {
    lines(["PixiJS не поднялся:", String(error)]);
    return;
  }
  pixi.tick(0);
  pixi.render();

  const canvasMs = frameTime((t) => drawCanvasScene(ctx, scene, t), FRAMES);
  const pixiMs = frameTime((t) => {
    pixi.tick(t);
    pixi.render();
  }, FRAMES);

  // Финальный кадр — чтобы на снимке было видно оба рендерера одинаково.
  drawCanvasScene(ctx, scene, 1.25);
  pixi.tick(1.25);
  pixi.render();

  const ratio = canvasMs / pixiMs;
  const rows = [
    `сцена: ${scene.platforms.length} платформ, ${scene.flakes.length} снежинок`,
    `кадров на замер: ${FRAMES}`,
    "",
    `canvas 2d : ${canvasMs.toFixed(3)} мс/кадр`,
    `pixijs    : ${pixiMs.toFixed(3)} мс/кадр`,
    `соотношение: ${ratio.toFixed(2)}x ${ratio > 1 ? "в пользу Pixi" : "в пользу canvas"}`,
    "",
    `webgl: ${pixi.app.renderer.name}`,
    `разрешение: ${pixi.app.renderer.width}x${pixi.app.renderer.height}`,
  ];
  lines(rows);

  // Для автотеста: результат доступен снаружи без разбора пикселей.
  (window as unknown as Record<string, unknown>).__bench = {
    canvasMs,
    pixiMs,
    ratio,
    platforms: scene.platforms.length,
    flakes: scene.flakes.length,
    renderer: pixi.app.renderer.name,
  };
}

main().catch((error) => {
  lines(["ошибка запуска:", String(error)]);
});
