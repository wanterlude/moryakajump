import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { drawPerkIconShape, shieldGlyph, type IconDeps } from "./perk-icons.ts";

const METHODS = [
  "save",
  "restore",
  "beginPath",
  "closePath",
  "moveTo",
  "lineTo",
  "quadraticCurveTo",
  "bezierCurveTo",
  "arc",
  "fill",
  "stroke",
  "rect",
];

/** Контекст-запись: складывает имена вызванных методов в общий список. */
function recordingCtx(sink: string[]): CanvasRenderingContext2D {
  const shape: Record<string, unknown> = {};
  for (const name of METHODS) {
    shape[name] = () => {
      sink.push(name);
    };
  }
  return shape as unknown as CanvasRenderingContext2D;
}

function deps(sink: string[]): IconDeps {
  return {
    ctx: recordingCtx(sink),
    coinBadge: () => sink.push("coin"),
    heart: () => sink.push("heart"),
  };
}

/** Виды иконок берём из самого модуля, чтобы список не разъехался. */
function iconKinds(): string[] {
  const source = readFileSync(new URL("./perk-icons.ts", import.meta.url), "utf8");
  const kinds = new Set<string>();
  for (const match of source.matchAll(/case "([a-z_0-9]+)":/g)) kinds.add(match[1]);
  return [...kinds].sort();
}

test("видов иконок достаточно много", () => {
  assert.ok(iconKinds().length >= 10, "видов иконок: " + iconKinds().length);
});

test("каждый вид что-то рисует и не падает", () => {
  for (const kind of iconKinds()) {
    const calls: string[] = [];
    assert.doesNotThrow(() => drawPerkIconShape(kind, 50, 50, "#0f8d5c", deps(calls)), "вид: " + kind);
    assert.ok(calls.length > 0, "вид " + kind + " ничего не нарисовал");
  }
});

test("неизвестный вид не бросает исключение", () => {
  const calls: string[] = [];
  assert.doesNotThrow(() => drawPerkIconShape("нет-такого", 10, 10, "#fff", deps(calls)));
});

test("иконка сохраняет и восстанавливает контекст", () => {
  const calls: string[] = [];
  drawPerkIconShape(iconKinds()[0], 20, 20, "#000", deps(calls));
  const saved = calls.filter((name) => name === "save").length;
  const restored = calls.filter((name) => name === "restore").length;
  assert.equal(saved, restored);
});

test("shieldGlyph укладывается в save/restore", () => {
  const calls: string[] = [];
  assert.doesNotThrow(() => shieldGlyph(recordingCtx(calls), 30, 30, 10, "#fff"));
  const saved = calls.filter((name) => name === "save").length;
  const restored = calls.filter((name) => name === "restore").length;
  assert.equal(saved, restored);
});
