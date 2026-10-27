import { test } from "node:test";
import assert from "node:assert/strict";
import { WINTER } from "./winter.ts";

const HEX = /^#[0-9a-f]{6}$/i;
const RGBA = /^rgba\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*,\s*(0|1|0?\.\d+)\s*\)$/;

test("палитра не пустая и содержит ключевые цвета", () => {
  const keys = Object.keys(WINTER);
  assert.ok(keys.length >= 15, "ключей: " + keys.length);
  for (const required of ["skyTop", "skyLow", "iceMid", "snowMid", "snowDeep", "shadow"]) {
    assert.ok(required in WINTER, "нет ключа " + required);
  }
});

test("каждый цвет — валидный hex или rgba", () => {
  for (const [key, value] of Object.entries(WINTER)) {
    const text = String(value);
    assert.ok(HEX.test(text) || RGBA.test(text), `${key} = "${text}" не цвет`);
  }
});

test("нет случайных пробелов и пустых значений", () => {
  for (const [key, value] of Object.entries(WINTER)) {
    const text = String(value);
    assert.ok(text.length > 3, "ключ " + key + " пустой");
    assert.equal(text, text.trim(), "ключ " + key + " с лишними пробелами");
  }
});
