import { test } from "node:test";
import assert from "node:assert/strict";
import { fieldLayout, polePulse, ringPhase } from "./field-layout.ts";

const platform = (x: number, y: number, w: number, h = 15) => ({ x, y, w, h });

test("на платформе любой ширины минимум две колонки колец", () => {
  for (let w = 56; w <= 140; w += 4) {
    const layout = fieldLayout(platform(100, 300, w));
    assert.ok(layout.columns >= 2, `ширина ${w}: колонок ${layout.columns}`);
    assert.equal(layout.rings.length, layout.columns * 2);
  }
});

test("кольца не выходят за пределы платформы", () => {
  for (let w = 56; w <= 140; w += 7) {
    const p = platform(100, 300, w);
    for (const ring of fieldLayout(p).rings) {
      assert.ok(ring.x > p.x && ring.x < p.x + p.w, `ширина ${w}: кольцо вне платформы`);
      assert.ok(ring.rx > 0 && ring.rx < p.w / 2, "радиус кольца вне разумных границ");
    }
  }
});

test("число колец растёт с шириной", () => {
  const narrow = fieldLayout(platform(0, 0, 56)).columns;
  const wide = fieldLayout(platform(0, 0, 140)).columns;
  assert.ok(wide > narrow, `${narrow} → ${wide}`);
});

test("полюса на краях, свечение по центру", () => {
  const p = platform(40, 200, 120);
  const layout = fieldLayout(p);
  assert.equal(layout.poles.length, 2);
  assert.equal(layout.poles[0].x, p.x + 3.5);
  assert.equal(layout.poles[1].x, p.x + p.w - 3.5);
  assert.equal(layout.glow.x, p.x + p.w / 2);
});

test("искры распределены по ширине и не липнут к краям", () => {
  const p = platform(0, 0, 130);
  const { sparks } = fieldLayout(p);
  assert.ok(sparks.length >= 3);
  for (const spark of sparks) {
    assert.ok(spark.x > p.x && spark.x < p.x + p.w);
  }
});

test("фаза всегда в [0,1), пульс в [0.1,1]", () => {
  const layout = fieldLayout(platform(0, 0, 120));
  for (let t = 0; t < 10; t += 0.37) {
    for (const ring of layout.rings) {
      const phase = ringPhase(t, ring);
      assert.ok(phase >= 0 && phase < 1, `фаза ${phase}`);
    }
    for (let side = 0; side < 2; side++) {
      const pulse = polePulse(t, side);
      assert.ok(pulse >= 0.1 && pulse <= 1, `пульс ${pulse}`);
    }
  }
});

test("раскладка детерминирована", () => {
  const a = fieldLayout(platform(12, 34, 96));
  const b = fieldLayout(platform(12, 34, 96));
  assert.deepEqual(a, b);
});
