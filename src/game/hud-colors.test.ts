import { test } from "node:test";
import assert from "node:assert/strict";
import { HUD_COLORS } from "./hud-colors.ts";

const HEX = /^#[0-9a-f]{6}$/i;
const RGBA = /^rgba\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*,\s*(0|1|0?\.\d+)\s*\)$/;

test("ключевые цвета HUD на месте", () => {
  for (const key of ["ink", "gold", "red", "green"]) {
    assert.ok(key in HUD_COLORS, "нет ключа " + key);
  }
});

test("все значения — валидные цвета", () => {
  for (const [key, value] of Object.entries(HUD_COLORS)) {
    const text = String(value);
    assert.ok(HEX.test(text) || RGBA.test(text), `${key} = "${text}" не цвет`);
  }
});

test("чернила HUD — тёмный холодный оттенок, а не чёрный", () => {
  const ink = String(HUD_COLORS.ink).toLowerCase();
  assert.ok(HEX.test(ink));
  assert.notEqual(ink, "#000000");
});
