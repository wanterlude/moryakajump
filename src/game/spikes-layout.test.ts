import { test } from "node:test";
import assert from "node:assert/strict";
import { spikeCount, spikeLayout } from "./spikes-layout.ts";

const platform = (x: number, y: number, w: number) => ({ x, y, w });

test("шипы не выходят за платформу", () => {
  for (let w = 56; w <= 140; w += 4) {
    const p = platform(100, 300, w);
    for (const spike of spikeLayout(p)) {
      assert.ok(spike.x >= p.x + 8, `ширина ${w}: шип левее отступа (${spike.x})`);
      assert.ok(spike.x + spike.half * 2 <= p.x + p.w - 6, `ширина ${w}: шип правее отступа`);
    }
  }
});

test("число шипов растёт с шириной", () => {
  assert.ok(spikeCount(platform(0, 0, 140)) > spikeCount(platform(0, 0, 56)));
});

test("на узкой платформе шипы вообще есть", () => {
  assert.ok(spikeCount(platform(0, 0, 56)) >= 1);
});

test("высота в заданном диапазоне и стабильна между вызовами", () => {
  const p = platform(40, 200, 120);
  const first = spikeLayout(p);
  const second = spikeLayout(p);
  assert.deepEqual(first, second);
  for (const spike of first) {
    assert.ok(spike.height >= 12 && spike.height < 19, `высота ${spike.height}`);
  }
});

test("соседние шипы разной высоты — нет монотонности", () => {
  const spikes = spikeLayout(platform(0, 0, 140));
  const unique = new Set(spikes.map((s) => Math.round(s.height * 100)));
  assert.ok(unique.size > 1, "все шипы одинаковой высоты");
});
