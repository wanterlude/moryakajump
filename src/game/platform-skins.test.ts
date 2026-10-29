import { test } from "node:test";
import assert from "node:assert/strict";
import {
  PLATFORM_SKINS,
  PLATFORM_TYPES,
  PLATFORM_TYPE_LABEL,
  PLATFORM_TYPE_SHORT,
  type SkinTier,
} from "./platform-skins.ts";

const HEX = /^#[0-9a-f]{6}$/i;
const TIERS: SkinTier[] = ["base", "common", "rare", "epic", "legendary", "divine"];

test("каждого типа по пятьдесят скинов", () => {
  for (const type of PLATFORM_TYPES) {
    const count = PLATFORM_SKINS.filter((skin) => skin.type === type).length;
    assert.equal(count, 50, `тип ${type}: ${count} скинов`);
  }
});

test("идентификаторы уникальны", () => {
  const ids = PLATFORM_SKINS.map((skin) => skin.id);
  assert.equal(new Set(ids).size, ids.length, "есть повторяющиеся id");
});

test("у каждого типа есть базовый скин", () => {
  for (const type of PLATFORM_TYPES) {
    const base = PLATFORM_SKINS.filter((skin) => skin.type === type && skin.tier === "base");
    assert.equal(base.length, 1, `тип ${type}: базовых скинов ${base.length}`);
  }
});

test("редкости только из известного набора", () => {
  for (const skin of PLATFORM_SKINS) {
    assert.ok(TIERS.includes(skin.tier), `${skin.id}: неизвестная редкость ${skin.tier}`);
  }
});

test("все цвета — валидный hex", () => {
  for (const skin of PLATFORM_SKINS) {
    for (const key of ["top", "mid", "bottom", "edge", "accent"] as const) {
      assert.ok(HEX.test(skin[key]), `${skin.id}.${key} = "${skin[key]}"`);
    }
  }
});

test("имя и детали заполнены", () => {
  for (const skin of PLATFORM_SKINS) {
    assert.ok(skin.name.length > 3, `${skin.id}: пустое имя`);
    assert.ok(Array.isArray(skin.details), `${skin.id}: details не массив`);
  }
});

test("подписи покрывают все типы и не пустые", () => {
  for (const type of PLATFORM_TYPES) {
    assert.ok(PLATFORM_TYPE_LABEL[type], `нет длинной подписи для ${type}`);
    assert.ok(PLATFORM_TYPE_SHORT[type], `нет короткой подписи для ${type}`);
    assert.ok(PLATFORM_TYPE_LABEL[type].length > 2);
    assert.ok(PLATFORM_TYPE_SHORT[type].length > 2);
  }
});

test("в коротких подписях нет обрезков с точкой", () => {
  for (const type of PLATFORM_TYPES) {
    assert.ok(!PLATFORM_TYPE_SHORT[type].endsWith("."), `${type}: подпись обрезана`);
  }
});
