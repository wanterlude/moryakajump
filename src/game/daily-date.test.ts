import { test } from "node:test";
import assert from "node:assert/strict";
import { dailyHash, localDateKey } from "./daily-date.ts";

test("дата собирается как YYYY-MM-DD с ведущими нулями", () => {
  assert.equal(localDateKey(new Date(2026, 0, 5)), "2026-01-05");
  assert.equal(localDateKey(new Date(2026, 11, 31)), "2026-12-31");
});

test("месяц и день не съезжают на UTC", () => {
  // 1 января, полночь по местному — ключ должен остаться первым января.
  assert.equal(localDateKey(new Date(2026, 0, 1, 0, 0, 0)), "2026-01-01");
  assert.equal(localDateKey(new Date(2026, 0, 1, 23, 59, 59)), "2026-01-01");
});

test("хеш детерминирован и неотрицателен", () => {
  const a = dailyHash("2026-10-28");
  const b = dailyHash("2026-10-28");
  assert.equal(a, b);
  assert.ok(a >= 0 && a <= 0xffffffff, `хеш вне диапазона: ${a}`);
});

test("разные даты дают разные хеши", () => {
  const values = new Set(
    ["2026-01-01", "2026-01-02", "2026-02-01", "2026-12-31"].map((key) => dailyHash(key))
  );
  assert.equal(values.size, 4);
});

test("хеш равномерно ложится по модулю числа заданий", () => {
  // Шесть заданий: за 200 дней должны встретиться все шесть вариантов.
  const seen = new Set<number>();
  for (let day = 0; day < 200; day++) {
    const date = new Date(2026, 0, 1 + day);
    seen.add(dailyHash(localDateKey(date)) % 6);
  }
  assert.equal(seen.size, 6, "не все варианты ежедневки достижимы");
});
