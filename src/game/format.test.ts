import { test } from "node:test";
import assert from "node:assert/strict";
import { fmt } from "./format.ts";

const THIN = "\u2009";

test("тысячи разделяются узким пробелом", () => {
  assert.equal(fmt(1000), "1" + THIN + "000");
  assert.equal(fmt(83747), "83" + THIN + "747");
  assert.equal(fmt(1234567), "1" + THIN + "234" + THIN + "567");
});

test("маленькие числа без разделителей", () => {
  assert.equal(fmt(0), "0");
  assert.equal(fmt(7), "7");
  assert.equal(fmt(999), "999");
});

test("дробная часть отбрасывается", () => {
  assert.equal(fmt(999.9), "999");
  assert.equal(fmt(1000.7), "1" + THIN + "000");
});

test("отрицательные числа не ломают разделители", () => {
  assert.equal(fmt(-1234), "-1" + THIN + "234");
});
