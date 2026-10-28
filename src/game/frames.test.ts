import { test } from "node:test";
import assert from "node:assert/strict";
import { BASE_FRAMES, EXTRA_FRAMES, EXTRA_FRAMES_2, EXTRA_FRAMES_3, FRAMES } from "./frames.ts";

const HEX = /^#[0-9a-f]{6}$/i;

test("рамок достаточно много и каталог собран из всех наборов", () => {
  const expected = BASE_FRAMES.length + EXTRA_FRAMES.length + EXTRA_FRAMES_2.length + EXTRA_FRAMES_3.length;
  assert.equal(FRAMES.length, expected);
  assert.ok(FRAMES.length >= 200, "рамок: " + FRAMES.length);
});

test("идентификаторы уникальны", () => {
  const ids = FRAMES.map((frame) => frame.id);
  assert.equal(new Set(ids).size, ids.length, "есть повторяющиеся id");
});

test("каталог отсортирован по цене, затем по id", () => {
  for (let i = 1; i < FRAMES.length; i++) {
    const prev = FRAMES[i - 1];
    const curr = FRAMES[i];
    const ordered = prev.price < curr.price || (prev.price === curr.price && prev.id <= curr.id);
    assert.ok(ordered, `нарушен порядок: ${prev.id}(${prev.price}) → ${curr.id}(${curr.price})`);
  }
});

test("первая рамка бесплатная и без оформления", () => {
  const first = FRAMES[0];
  assert.equal(first.id, 0);
  assert.equal(first.price, 0);
  assert.equal(first.look, null);
});

test("у платных рамок три цвета и свечение", () => {
  for (const frame of FRAMES) {
    if (!frame.look) continue;
    assert.equal(frame.look.colors.length, 3, `рамка ${frame.id}: цветов ${frame.look.colors.length}`);
    for (const color of frame.look.colors) {
      assert.ok(HEX.test(color), `рамка ${frame.id}: цвет ${color}`);
    }
    assert.ok(HEX.test(frame.look.glow), `рамка ${frame.id}: свечение ${frame.look.glow}`);
  }
});

test("имя и цена заполнены у всех рамок", () => {
  for (const frame of FRAMES) {
    assert.ok(frame.name.length > 2, `рамка ${frame.id}: пустое имя`);
    assert.ok(frame.price >= 0 && Number.isFinite(frame.price), `рамка ${frame.id}: цена ${frame.price}`);
  }
});
