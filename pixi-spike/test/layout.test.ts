import { test } from "node:test";
import assert from "node:assert/strict";
import { fieldLayout, ringPhase, polePulse } from "../src/layout.ts";
import { makeScene } from "../src/scene.ts";

const platform = (x: number, y: number, w: number, h = 15, spring = true) => ({ x, y, w, h, spring });

test("ширина 56..140 даёт минимум два кольца на платформу", () => {
  for (let w = 56; w <= 140; w += 4) {
    const layout = fieldLayout(platform(100, 300, w));
    assert.ok(layout.columns >= 2, `ширина ${w}: колонок ${layout.columns}`);
    assert.equal(layout.rings.length, layout.columns * 2);
  }
});

test("кольца не выходят за пределы платформы", () => {
  for (let w = 56; w <= 140; w += 7) {
    const p = platform(100, 300, w);
    const layout = fieldLayout(p);
    for (const ring of layout.rings) {
      assert.ok(ring.x > p.x, `кольцо левее платформы при ширине ${w}`);
      assert.ok(ring.x < p.x + p.w, `кольцо правее платформы при ширине ${w}`);
      assert.ok(ring.rx > 0 && ring.rx < p.w / 2, "радиус кольца вне разумных границ");
    }
  }
});

test("число колец растёт вместе с шириной", () => {
  const narrow = fieldLayout(platform(0, 0, 56)).columns;
  const wide = fieldLayout(platform(0, 0, 140)).columns;
  assert.ok(wide > narrow, `${narrow} → ${wide}`);
});

test("полюса стоят по краям, свечение по центру", () => {
  const p = platform(40, 200, 120);
  const layout = fieldLayout(p);
  assert.equal(layout.poles.length, 2);
  assert.equal(layout.poles[0].x, p.x + 3.5);
  assert.equal(layout.poles[1].x, p.x + p.w - 3.5);
  assert.equal(layout.glow.x, p.x + p.w / 2);
});

test("фаза кольца всегда в [0,1), пульс в [0.1,1]", () => {
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

test("сцена детерминирована: одинаковые параметры дают одинаковый кадр", () => {
  const a = makeScene(400, 600, { platforms: 12, flakes: 80 });
  const b = makeScene(400, 600, { platforms: 12, flakes: 80 });
  assert.deepEqual(a, b);
});

test("сцена уважает заданные размеры", () => {
  const scene = makeScene(400, 600, { platforms: 30, flakes: 700 });
  assert.equal(scene.platforms.length, 30);
  assert.equal(scene.flakes.length, 700);
  for (const p of scene.platforms) {
    assert.ok(p.x >= 0 && p.x + p.w <= 400, "платформа вышла за ширину экрана");
    assert.ok(p.y >= 0 && p.y <= 600, "платформа вне высоты экрана");
  }
});

test("общее число спрайтов поля считается заранее — батчинг не разъезжается", () => {
  const scene = makeScene(400, 600, { platforms: 30, flakes: 700 });
  let rings = 0;
  let poles = 0;
  for (const p of scene.platforms) {
    if (!p.spring) continue;
    const layout = fieldLayout(p);
    rings += layout.rings.length;
    poles += layout.poles.length;
  }
  assert.ok(rings > 0 && poles > 0);
  // Каждое кольцо и полюс — спрайт из общей текстуры: одна текстура на тип.
  assert.equal(poles % 2, 0);
  assert.equal(rings % 2, 0);
});
