import { test } from "node:test";
import assert from "node:assert/strict";
import { CARDS, type CardTier } from "./cards.ts";

const HEX = /^#[0-9a-f]{6}$/i;
const TIERS: CardTier[] = ["base", "common", "rare", "epic", "legendary", "divine"];
const PATTERNS = ["rings", "waves", "stars", "shards", "web", "hexes"];

test("карточек двенадцать", () => {
  assert.equal(CARDS.length, 12);
});

test("идентификаторы и имена уникальны", () => {
  const ids = CARDS.map((card) => card.id);
  const names = CARDS.map((card) => card.name);
  assert.equal(new Set(ids).size, ids.length, "повторяющиеся id");
  assert.equal(new Set(names).size, names.length, "повторяющиеся имена");
});

test("есть ровно одна базовая карточка", () => {
  const base = CARDS.filter((card) => card.tier === "base");
  assert.equal(base.length, 1);
});

test("редкости из известного набора", () => {
  for (const card of CARDS) {
    assert.ok(TIERS.includes(card.tier), `${card.id}: редкость ${card.tier}`);
  }
});

test("цвета — валидный hex", () => {
  for (const card of CARDS) {
    for (const key of ["top", "bottom", "accent"] as const) {
      assert.ok(HEX.test(card[key]), `${card.id}.${key} = ${card[key]}`);
    }
  }
});

test("узор из известного набора", () => {
  for (const card of CARDS) {
    assert.ok(PATTERNS.includes(card.pattern), `${card.id}: узор ${card.pattern}`);
  }
});

test("название и девиз заполнены", () => {
  for (const card of CARDS) {
    assert.ok(card.name.length > 2, `${card.id}: пустое имя`);
    assert.ok(card.motto.length > 2, `${card.id}: пустой девиз`);
  }
});
