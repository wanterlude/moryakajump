import { test } from "node:test";
import assert from "node:assert/strict";
import { hexToRgba } from "./color.ts";

test("разбирает шестизначный hex", () => {
  assert.equal(hexToRgba("#ffffff", 0.5), "rgba(255,255,255,0.5)");
  assert.equal(hexToRgba("#000000", 1), "rgba(0,0,0,1)");
  assert.equal(hexToRgba("#0f8a76", 0.3), "rgba(15,138,118,0.3)");
});

test("не зависит от регистра", () => {
  assert.equal(hexToRgba("#ABCDEF", 1), hexToRgba("#abcdef", 1));
});

test("альфа подставляется как есть", () => {
  assert.equal(hexToRgba("#123456", 0.25), "rgba(18,52,86,0.25)");
  assert.equal(hexToRgba("#123456", 1), "rgba(18,52,86,1)");
});

test("каналы не переполняются", () => {
  const result = hexToRgba("#ff00ff", 0.5);
  assert.equal(result, "rgba(255,0,255,0.5)");
});
