/**
 * Раскладка магнитного поля пружинных платформ.
 *
 * Первый модуль, вынесенный из бандла в нормальный TypeScript: до этого та же
 * математика жила внутри drawPlatformMagnet в index.html и не покрывалась ничем.
 * Число колец зависит от текущей ширины платформы (56…140 px, плюс перк ширины),
 * поэтому здесь всё считается от p.w.
 */

export type Platform = {
  x: number;
  y: number;
  w: number;
  h: number;
};

export type FieldRing = {
  x: number;
  baseY: number;
  rx: number;
  column: number;
  band: number;
};

export type FieldPole = { x: number; y: number; side: number };

export type FieldLayer = {
  columns: number;
  rings: FieldRing[];
  poles: FieldPole[];
  glow: { x: number; y: number; rx: number; ry: number };
  sparks: { x: number; y: number }[];
};

/** Одно кольцо на каждые 26 px ширины платформы. */
const RING_PER_PIXELS = 26;
/** Радиус кольца — доля ширины колонки. */
const RING_RX_SHARE = 0.34;
/** Одна искра на каждые 34 px. */
const SPARK_PER_PIXELS = 34;

export function fieldLayout(platform: Platform): FieldLayer {
  const { x, y, w, h } = platform;
  const columns = Math.max(2, Math.round(w / RING_PER_PIXELS));
  const columnWidth = w / columns;
  const rx = columnWidth * RING_RX_SHARE;

  const rings: FieldRing[] = [];
  for (let column = 0; column < columns; column++) {
    const ringX = x + columnWidth * (column + 0.5);
    for (let band = 0; band < 2; band++) {
      rings.push({ x: ringX, baseY: y + 3.1, rx, column, band });
    }
  }

  const sparkCount = Math.max(3, Math.round(w / SPARK_PER_PIXELS));
  const sparks = Array.from({ length: sparkCount }, (_, i) => ({
    x: x + (w * (i + 0.5)) / sparkCount,
    y: y + h / 2,
  }));

  return {
    columns,
    rings,
    poles: [
      { x: x + 3.5, y: y + h / 2, side: 0 },
      { x: x + w - 3.5, y: y + h / 2, side: 1 },
    ],
    glow: { x: x + w / 2, y: y + h / 2, rx: w * 0.62, ry: h * 3.1 },
    sparks,
  };
}

/** Фаза кольца: от неё зависят высота и прозрачность. */
export function ringPhase(time: number, ring: FieldRing): number {
  return (time * 0.55 + ring.column * 0.17 + ring.band * 0.5) % 1;
}

/** Пульс полюса: два конца дышат в противофазе. */
export function polePulse(time: number, side: number): number {
  return 0.55 + 0.45 * Math.sin(time * 2.2 + side * Math.PI);
}
