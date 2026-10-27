/** Общая сцена для обоих рендереров: одинаковая геометрия, одинаковое время. */

export type Platform = {
  x: number;
  y: number;
  w: number;
  h: number;
  spring: boolean;
};

export type Flake = {
  x: number;
  y: number;
  r: number;
  speed: number;
  drift: number;
};

export type Scene = {
  width: number;
  height: number;
  platforms: Platform[];
  flakes: Flake[];
  player: { x: number; y: number; r: number };
};

/** Детерминированный ГПСЧ, чтобы оба рендерера получали одну и ту же сцену. */
function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export type SceneOptions = { platforms?: number; flakes?: number };

export function makeScene(width: number, height: number, options: SceneOptions = {}): Scene {
  const maxPlatforms = options.platforms ?? 6;
  const flakeCount = options.flakes ?? 140;
  const rnd = mulberry32(20261028);

  // Платформы кладём по всей высоте: число задаётся сценарием, а не тем,
  // сколько успело влезть при фиксированном шаге.
  const platforms: Platform[] = [];
  const span = height - 110;
  const step = span / Math.max(1, maxPlatforms);
  for (let i = 0; i < maxPlatforms; i++) {
    const w = 56 + rnd() * 84;
    platforms.push({
      x: 20 + rnd() * (width - w - 40),
      y: height - 70 - i * step,
      w,
      h: 15,
      spring: rnd() > 0.62,
    });
  }

  const flakes: Flake[] = [];
  for (let i = 0; i < flakeCount; i++) {
    flakes.push({
      x: rnd() * width,
      y: rnd() * height,
      r: 0.8 + rnd() * 1.8,
      speed: 12 + rnd() * 26,
      drift: (rnd() - 0.5) * 14,
    });
  }

  return {
    width,
    height,
    platforms,
    flakes,
    player: { x: width / 2, y: height - 140, r: 19 },
  };
}
