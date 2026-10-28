import { test } from "node:test";
import assert from "node:assert/strict";
import {
  BIOME_PALETTES,
  BIRD_KINDS,
  LEGENDARY_SPAN,
  PERK_DEFS,
  PERK_NEUTRAL,
  PERK_RARITY,
  PERK_RARITY_ORDER,
  PERK_RARITY_WEIGHTS,
  QUEST_DEFS,
} from "./content.ts";

const HEX = /^#[0-9a-f]{6}$/i;

test("биомы: минимум три палитры, у каждой пять цветов неба", () => {
  assert.ok(BIOME_PALETTES.length >= 3, "палитр: " + BIOME_PALETTES.length);
  for (const palette of BIOME_PALETTES) {
    assert.equal(palette.sky.length, 5, "цветов неба: " + palette.sky.length);
    for (const color of palette.sky) assert.ok(HEX.test(color), "небо: " + color);
    for (const key of ["far", "mid", "cap"] as const) {
      assert.ok(HEX.test(palette[key]), `${key}: ${palette[key]}`);
    }
  }
});

test("птицы: параметры положительные, имена латиницей", () => {
  const names = Object.keys(BIRD_KINDS);
  assert.ok(names.length >= 3, "видов птиц: " + names.length);
  for (const name of names) {
    assert.match(name, /^[a-z_]+$/, "имя вида: " + name);
    const kind = BIRD_KINDS[name as keyof typeof BIRD_KINDS];
    for (const key of ["scale", "speed", "wave", "waveSpeed", "push"] as const) {
      assert.ok(kind[key] > 0, `${name}.${key} = ${kind[key]}`);
    }
    assert.ok(HEX.test(kind.color), `${name}.color`);
  }
});

test("задания на забег: уникальные id, цели и награды положительные", () => {
  const ids = QUEST_DEFS.map((quest) => quest.id);
  assert.equal(new Set(ids).size, ids.length, "повторяющиеся id заданий");
  for (const quest of QUEST_DEFS) {
    assert.ok(quest.target > 0, `${quest.id}: цель ${quest.target}`);
    assert.ok(quest.reward > 0, `${quest.id}: награда ${quest.reward}`);
    assert.ok(quest.label.length > 3, `${quest.id}: пустая подпись`);
  }
});

test("веса редкостей в сумме дают единицу", () => {
  const sum = Object.values(PERK_RARITY_WEIGHTS).reduce((a, b) => a + b, 0);
  assert.ok(Math.abs(sum - 1) < 1e-9, "сумма весов: " + sum);
});

test("редкости описаны целиком и в правильном порядке", () => {
  assert.deepEqual(Object.keys(PERK_RARITY), [...PERK_RARITY_ORDER]);
  for (const rarity of PERK_RARITY_ORDER) {
    const info = PERK_RARITY[rarity as keyof typeof PERK_RARITY];
    assert.ok(info.label.length > 2, `${rarity}: нет подписи`);
    assert.ok(HEX.test(info.color), `${rarity}.color = ${info.color}`);
    assert.ok(info.ring > 0, `${rarity}.ring`);
  }
});

test("каждая редкость имеет вес и наоборот", () => {
  const weightKeys = Object.keys(PERK_RARITY_WEIGHTS).sort();
  const orderKeys = [...PERK_RARITY_ORDER].sort();
  assert.deepEqual(weightKeys, orderKeys);
});

test("перки: уникальные id, известная редкость, описание", () => {
  const ids = PERK_DEFS.map((perk) => perk.id);
  assert.ok(ids.length >= 30, "перков: " + ids.length);
  assert.equal(new Set(ids).size, ids.length, "повторяющиеся id перков");
  for (const perk of PERK_DEFS) {
    assert.ok(PERK_RARITY_ORDER.includes(perk.rarity), `${perk.id}: редкость ${perk.rarity}`);
  }
});

test("нейтральные множители и легендарные интервалы заполнены", () => {
  const neutral = Object.entries(PERK_NEUTRAL);
  assert.ok(neutral.length >= 5, "нейтральных множителей: " + neutral.length);
  for (const [key, value] of neutral) {
    assert.equal(typeof value, "number", key + " не число");
  }
  const spans = Object.entries(LEGENDARY_SPAN);
  assert.ok(spans.length >= 1, "легендарных интервалов: " + spans.length);
  for (const [key, value] of spans) {
    assert.ok(Number(value) > 0, key + ": " + value);
  }
});
