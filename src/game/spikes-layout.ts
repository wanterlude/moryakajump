/**
 * Раскладка ледяных шипов на платформе.
 *
 * Высота каждого шипа выводится из его координаты, а не из случайного числа:
 * иначе шипы дёргались бы между кадрами. Отступы от краёв нужны, чтобы шипы
 * не залезали на скруглённые углы платформы.
 */

export type SpikePlatform = {
  x: number;
  y: number;
  w: number;
};

export type Spike = {
  /** Левый край основания. */
  x: number;
  /** Половина ширины основания. */
  half: number;
  /** Высота зуба. */
  height: number;
};

const MARGIN_LEFT = 8;
const MARGIN_RIGHT = 6;
const STEP = 15;
const HALF = 6.4;
const MIN_HEIGHT = 12;
const HEIGHT_SPREAD = 7;

/** Псевдослучайное, но стабильное число из координаты. */
function seedFrom(x: number): number {
  return Math.abs(Math.sin(Math.round(x) * 12.9898) * 43758.5453) % 1;
}

export function spikeLayout(platform: SpikePlatform): Spike[] {
  const spikes: Spike[] = [];
  const limit = platform.x + platform.w - MARGIN_RIGHT;
  for (let x = platform.x + MARGIN_LEFT; x + HALF * 2 <= limit; x += STEP) {
    spikes.push({ x, half: HALF, height: MIN_HEIGHT + seedFrom(x) * HEIGHT_SPREAD });
  }
  return spikes;
}

/** Сколько шипов влезает — удобно для тестов и отладки. */
export function spikeCount(platform: SpikePlatform): number {
  return spikeLayout(platform).length;
}
