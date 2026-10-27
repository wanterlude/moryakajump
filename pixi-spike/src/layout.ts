import type { Platform } from "./scene";

/**
 * Раскладка магнитного поля. Чистая функция без canvas и без Pixi — её можно
 * тестировать в Node, не поднимая ни браузер, ни GPU. Оба рендерера считают
 * геометрию только здесь, поэтому «на глаз» они не разъезжаются.
 */
export type FieldRing = {
  x: number;
  baseY: number;
  rx: number;
  column: number;
  band: number;
};

export type FieldPole = { x: number; y: number; side: number };

export type FieldLayout = {
  columns: number;
  rings: FieldRing[];
  poles: FieldPole[];
  glow: { x: number; y: number; rx: number; ry: number };
};

const RING_PER_PIXELS = 26;
const RING_RX_SHARE = 0.34;

export function fieldLayout(p: Platform): FieldLayout {
  const columns = Math.max(2, Math.round(p.w / RING_PER_PIXELS));
  const columnWidth = p.w / columns;
  const rx = columnWidth * RING_RX_SHARE;

  const rings: FieldRing[] = [];
  for (let c = 0; c < columns; c++) {
    const x = p.x + columnWidth * (c + 0.5);
    for (let band = 0; band < 2; band++) {
      rings.push({ x, baseY: p.y + 3.1, rx, column: c, band });
    }
  }

  return {
    columns,
    rings,
    poles: [
      { x: p.x + 3.5, y: p.y + p.h / 2, side: 0 },
      { x: p.x + p.w - 3.5, y: p.y + p.h / 2, side: 1 },
    ],
    glow: { x: p.x + p.w / 2, y: p.y + p.h / 2, rx: p.w * 0.62, ry: p.h * 3.1 },
  };
}

/** Фаза кольца: от неё зависят высота и прозрачность. */
export function ringPhase(t: number, ring: FieldRing): number {
  return (t * 0.55 + ring.column * 0.17 + ring.band * 0.5) % 1;
}

/** Пульс полюса. */
export function polePulse(t: number, side: number): number {
  return 0.55 + 0.45 * Math.sin(t * 2.2 + side * Math.PI);
}
